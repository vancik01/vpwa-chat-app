import { Server, Socket } from 'socket.io'
import server from '@adonisjs/core/services/server'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import User from '#models/user'
import { Secret } from '@adonisjs/core/helpers'
import Message from '#models/message'
import Channel from '#models/channel'
import db from '@adonisjs/lucid/services/db'

class Ws {
  io: Server | undefined
  private booted = false
  private userConnections: { [userId: string]: Socket[] } = {}

  boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
    })

    // Handle connections with authentication
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization']
        const verifyToken = await DbAccessTokensProvider.forModel(User).verify(
          new Secret(token.split(' ')[1])
        )
        if (verifyToken) {
          const { tokenableId } = verifyToken
          socket.data.userId = tokenableId
        } else {
          next(new Error('Unauthorized'))
          socket.disconnect()
        }

        next()
      } catch (error) {
        console.error('Authentication failed:', error)
        next(new Error('Unauthorized'))
      }
    })

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId

      if (userId) {
        if (!this.userConnections[userId]) {
          this.userConnections[userId] = []
        }

        this.userConnections[userId].push(socket)
        console.log(`User ${userId} connected with socket ID ${socket.id}`)

        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected from socket ID ${socket.id}`)

          this.userConnections[userId] = this.userConnections[userId].filter(
            (s) => s.id !== socket.id
          )

          if (this.userConnections[userId].length === 0) {
            delete this.userConnections[userId]
          }
          console.log(this.userConnections)
        })
      }
    })
  }

  async sendMessageToUser(userId: number, channelId: string, event: string, message: any) {
    const socket = this.userConnections[userId]
    if (socket) {
      socket.forEach((conn) => conn.emit(event, JSON.stringify(message)))
    } else if (!socket && event === 'message') {
      await db
        .from('channel_user')
        .where('channel_id', channelId)
        .andWhere('user_id', message.senderId)
        .increment('unread_count', 1)
    }
  }

  async notifyChannelNewMessage(channelId: string, message: Message) {
    try {
      const members = await Channel.query()
        .where('id', channelId)
        .preload('members', (q) => {
          q.where('pending_invite', false)
            .where('is_banned', false)
            .whereNotPivot('user_id', message.senderId)
        })
        .firstOrFail()
      members.members.map((u) => {
        this.sendMessageToUser(u.id, channelId, 'new_message', {
          messageContent: message.messageContent,
          senderId: message.senderId,
          channelId,
          sentAt: message.createdAt,
        })
      })
    } catch (error) {
      console.log(error)
    }
  }
}

export default new Ws()
