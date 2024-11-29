import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import ws from '../../services/ws.js'

export default class UsersController {
  async setStatus({ params, response, auth, request }: HttpContext) {
    const { status } = request.body()
    if (!status) {
      response.status(400).send({ message: 'Bad request' })
    }

    const user = auth.getUserOrFail()
    user.status = status
    await user.save()
    ws.notifyChannelUserStatusChanged(user.id, status)
  }

  async setNotificationsStatus({ request, params, response, auth }: HttpContext) {
    const { status } = request.body()
    if (!status) {
      response.status(400).send({ message: 'Bad request' })
    }

    const user = auth.getUserOrFail()
    user.notificationsStatus = status
    await user.save()
  }
}
