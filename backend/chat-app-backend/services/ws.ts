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

        socket.on('typing', async (data) => {
          const { channelId, content } = JSON.parse(data);
          const user = await User.findOrFail(userId);
          try {
            const members = await Channel.query()
              .where('id', channelId)
              .preload('members', (q) => {
                q.where('pending_invite', false)
                  .where('is_banned', false)
                  .whereNotPivot('user_id', userId)
              })
              .firstOrFail()
            members.members.map(async (u) => {
              await this.sendMessageToUser(u.id, 'typing', {
                channelId,
                userId,
                content,
                user: { display_name: `${user.first_name} ${user.last_name}`, nickname: user.nickname }
              })
            })
          }
          catch (error) {
            console.log('error', error)
          }
        });

        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected from socket ID ${socket.id}`)

          this.userConnections[userId] = this.userConnections[userId].filter(
            (s) => s.id !== socket.id
          )

          if (this.userConnections[userId].length === 0) {
            delete this.userConnections[userId]
          }
        })
      }
    })
  }

  async sendMessageToUser(userId: number, event: string, message: any) {
    console.log('send', event, 'to user', userId)
    const socket = this.userConnections[userId]
    if (socket) {
      socket.forEach((conn) => conn.emit(event, JSON.stringify(message)))
    } else {
      console.log('No socket', userId)
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
      members.members.map(async (u) => {
        const sender = await User.findOrFail(message.senderId)
        await this.sendMessageToUser(u.id, 'new_message', {
          messageContent: message.messageContent,
          senderId: message.senderId,
          channelId,
          sentAt: message.createdAt,
          from: `${sender.first_name} ${sender.last_name}`,
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  async notifyChannelUserJoined(channelId: string, userId: number) {
    try {
      const members = await Channel.query()
        .where('id', channelId)
        .preload('members', (q) => {
          q.where('pending_invite', false).where('is_banned', false)
        })
        .firstOrFail()
      const user = await User.findOrFail(userId)
      console.log(members.members)
      await Promise.all(
        members.members.map(async (u) => {
          try {
            await this.sendMessageToUser(u.id, 'user_joined', {
              display_name: `${user.first_name} ${user.last_name}`,
              id: userId,
              nickname: user.nickname,
              status: user.status,
              channelId,
            })
          } catch (error) {
            console.error(`Failed to send message to user ${u.id}:`, error)
          }
        })
      )
    } catch (error) {
      console.log('error', error)
    }
  }
  async notifyChannelDestroyed(channelId: string, userId: number) {
    try {
      const members = await Channel.query()
        .where('id', channelId)
        .preload('members', (q) => {
          q.where('pending_invite', false)
            .where('is_banned', false)
            .whereNotPivot('user_id', userId)
        })
        .firstOrFail()
      members.members.map(async (u) => {
        await this.sendMessageToUser(u.id, 'channel_destroyed', {
          channelId: channelId,
          reason: `Channel ${channelId} was deleted`,
        })
      })
    } catch (error) {
      console.log(error)
    }
  }
  async notifyChannelUserStatusChanged(userId: number, status: string) {
    try {
      const channels = await Channel.query()
        .whereHas('members', (memberQuery) => {
          memberQuery.where('user_id', userId).where('is_banned', false)
        })
        .select('id', 'channel_type', 'adminId')
        .preload('members', (q) => {
          q.pivotColumns(['pending_invite', 'last_read_at'])
        })

      if (channels.length === 0) {
        return
      }

      // Step 2: Collect all user IDs from these channels, excluding the user whose status changed
      const memberIds = new Set<number>()
      channels.forEach((channel) => {
        channel.members.forEach((member) => {
          if (member.id !== userId && !member.$extras.pending_invite) {
            memberIds.add(member.id)
          }
        })
      })

      await Promise.all(
        Array.from(memberIds).map(async (memberId) => {
          try {
            await this.sendMessageToUser(memberId, 'status_change', {
              userId,
              status,
            })
          } catch (error) {
            console.error(`Failed to send status change message to user ${memberId}:`, error)
          }
        })
      )
    } catch (error) {
      console.error('Error notifying channel members about status change:', error)
    }
  }
}

export default new Ws()
