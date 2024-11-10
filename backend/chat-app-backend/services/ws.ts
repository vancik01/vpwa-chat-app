import { Server, Socket } from 'socket.io'
import server from '@adonisjs/core/services/server'
import { HttpContextFactory } from '@adonisjs/core/factories/http'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import User from '#models/user'
import { Secret } from '@adonisjs/core/helpers'

class Ws {
  io: Server | undefined
  private booted = false
  private userConnections: { [userId: string]: Socket } = {} // Change to store only one connection per user

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

      if (userId) {
        // If the user already has a connection, disconnect the previous one
        if (this.userConnections[userId]) {
          console.log(`User ${userId} already connected. Disconnecting previous connection.`)
          this.userConnections[userId].disconnect(true)
        }

        // Store the new connection
        this.userConnections[userId] = socket
        console.log(`User ${userId} connected with socket ID ${socket.id}`)

        // Handle disconnection
        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected from socket ID ${socket.id}`)
          delete this.userConnections[userId]
        })
      }
    })
  }

  /**
   * Send a message to a specific user by user ID
   * @param userId User ID
   * @param event Event name
   * @param message Message payload
   */
  sendMessageToUser(userId: string, event: string, message: any) {
    const socket = this.userConnections[userId]
    if (socket) {
      socket.emit(event, message)
    }
  }
}

export default new Ws()
