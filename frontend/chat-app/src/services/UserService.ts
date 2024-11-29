import type { AxiosResponse } from 'axios'
import { api } from 'src/boot/axios'
import { NotificationsStatus, UserStatus } from 'src/components/models'

class UserService {

  async setStatus (status: UserStatus):Promise<AxiosResponse> {
    const response = await api.post('/user/status', {status})
    return response
  }
  async setNotificationsStatus (status: NotificationsStatus):Promise<AxiosResponse> {
    const response = await api.post('/user/notificationsStatus', {status})
    return response
  }
}

export default new UserService()