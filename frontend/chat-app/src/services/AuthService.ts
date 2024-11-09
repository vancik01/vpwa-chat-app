import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiToken, LoginCredentials, RegisterData, User } from 'src/contracts'
import { api } from 'src/boot/axios'

class AuthService {
  async me (dontTriggerLogout = false): Promise<User | null> {
    return api
    .get('/user',{ dontTriggerLogout } as AxiosRequestConfig)
    .then((response) => response.data.user)
    .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null
        }
        return Promise.reject(error)
      })
  }

  async register (data: RegisterData):Promise<AxiosResponse> {
    const response = await api.post<User>('/register', data)
    return response
  }

  async login (credentials: LoginCredentials): Promise<ApiToken> {
    const response = await api.post<ApiToken>('/login', credentials)
    return response.data
  }

  async logout (): Promise<void> {
    await api.delete('/logout')
  }
}

export default new AuthService()