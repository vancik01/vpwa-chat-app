import { Server, Socket } from 'socket.io'
import server from '@adonisjs/core/services/server'
import { HttpContextFactory } from '@adonisjs/core/factories/http'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import User from '#models/user'
import { Secret } from '@adonisjs/core/helpers'
import Message from '#models/message'
import Channel from '#models/channel'

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
        // Extract token from the handshake headers or auth properties
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

        next() // Proceed with connection
      } catch (error) {
        console.error('Authentication failed:', error)
        next(new Error('Unauthorized'))
      }
    })

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId
      console.log(this.userConnections)

      if (userId) {
        // Check if the user already has a connection array
        if (!this.userConnections[userId]) {
          this.userConnections[userId] = []
        }

        // Store the new connection into the array
        this.userConnections[userId].push(socket)
        console.log(`User ${userId} connected with socket ID ${socket.id}`)

        // Handle disconnection for this specific socket
        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected from socket ID ${socket.id}`)

          // Remove the disconnected socket from the user's connection array
          this.userConnections[userId] = this.userConnections[userId].filter(
            (s) => s.id !== socket.id
          )

          // If no more connections are left, remove the user entry
          if (this.userConnections[userId].length === 0) {
            delete this.userConnections[userId]
          }
          console.log(this.userConnections)
        })
      }
    })
  }

  sendMessageToUser(userId: number, event: string, message: any) {
    const socket = this.userConnections[userId]
    if (socket) {
      socket.forEach((conn) => conn.emit(event, message))
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
        this.sendMessageToUser(
          u.id,
          'new_message',
          JSON.stringify({
            messageContent: message.messageContent,
            senderId: message.senderId,
            channelId,
            sentAt: message.createdAt,
          })
        )
      })
    } catch (error) {
      console.log('error', error)
    }
  }
}

export default new Ws()
