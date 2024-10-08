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
  joinChannel: (channelId: string) => void,
  inviteUserToChannel: (channelId: string, userId:string) => void,
  revokeInvitation: (channelId: string, nickname:string) => void,
  deleteChannel: (channelId: string) => void,
  viewedMessageInChannel: (channelId: string) => void,
}>('userStore', {
  		state: (): UserState => ({
  			user: {
  				nickname: 'user_123',
  				display_name: 'Display Name',
  				token: 'token_123',
  				status: 'online',
  			},
  			channels:[
          {
            id:'channel_name_123_456_789',
            has_new_messages: 128,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            id:'very_long_channel_name_without_new_messages',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            id:'very_long_channel_name_with_new_messages',
            has_new_messages: 23,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            id:'channel_1',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            id:'channel_2',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            id: 'channel_3',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            id: 'channel_4',
            has_new_messages: 0,
            type: 'public',
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
  					token:'example_token_123',
  					status: 'online'
  				}
  			},
  			logout() {
          this.router.push('/auth/login')
          this.user = null
  			},
  			createAccount(createAccountProps) {
  				console.log(createAccountProps)
  			},
  			setStatus(status: UserStatus) {
  				if(this.user) {
  					this.user.status = status
  				}
  			},
  			inviteUserToChannel(channelId, userId) {
  				console.log(channelId, userId)
  			},
  			leaveChannel(channelId) {
          const channelIndex = this.channels.findIndex(channel => channel.id === channelId);
          if (channelIndex !== -1) {
            this.channels.splice(channelIndex, 1);
          }
          this.router.push('/')

          console.log('leave', channelId)
  			},
  			joinChannel(channelId) {
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
