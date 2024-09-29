import { defineStore } from 'pinia'
import { Channel, User, UserCreateAccountProps, UserStatus } from 'src/components/models'

interface UserState {
  user: User | null,
  channels: Channel[]
}

export const useUserStore = defineStore<'userStore', UserState, {
  is_logged_in: () => boolean
}, {
  login: (email: string, password: string) => void
  logout: () => void
  createAccount: (createAccountProps:UserCreateAccountProps) => void
  setStatus: (status: UserStatus) => void,
  leaveChannel: (channelId: string) => void,
  acceptInvitation: (channelId: string) => void,
  revokeInvitation: (channelId: string) => void,
  deleteChannel: (channelId: string) => void,
  viewedMessageInChannel: (channelId: string) => void,
}>('userStore', {
  state: (): UserState => ({
    user: {
      nickname: 'user_123',
      display_name: 'Display Name',
      token: 'token_123',
    },
    channels:[
      {
        name:'channel_name_123',
        id: '',
        has_new_messages: 0,
        type: 'private',
        channel_members: [],
        is_someone_typing: false,
        user_typing: null
      }
    ]
  }),
  getters: {
    is_logged_in (){
      return this.user ? true : false
    }
  },
  actions: {
    login(email, password) {
      console.log(email, password)
      this.user = {
        display_name:'Display name',
        nickname: 'user_123',
        token:'example_token_123'
      }
    },
    logout() {
      this.user = null
    },
    createAccount(createAccountProps) {
      console.log(createAccountProps)
    },
    setStatus(status: UserStatus) {
      console.log(status)
    },
    leaveChannel(channelId) {
      console.log(channelId)
    },
    acceptInvitation(channelId) {
      console.log(channelId)
    },
    revokeInvitation(channelId) {
      console.log(channelId)
    },
    deleteChannel(channelId) {
      //handle delete channel logic - do not allow if not admin
      console.log(channelId)
    },
    viewedMessageInChannel(channelId) {
      const channel = this.channels.find((channel) => channel.id === channelId);
      if (channel) {
        channel.has_new_messages = 0;
      }
      
    },
    
  }
})
