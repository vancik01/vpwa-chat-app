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
  				status: 'online',
  			},
  			channels:[
  				{
  					name:'channel_name_123',
  					id: '1',
  					has_new_messages: 0,
  					type: 'private',
  					channel_members: [],
  					is_someone_typing: false,
  					user_typing: null
  				},
          {
            name:'channel_name_123_456',
            id: '2',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'channel_name_123_456_789',
            id: '3',
            has_new_messages: 4,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'channel_name_123',
            id: '4',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'channel_name_123_456_789',
            id: '5',
            has_new_messages: 128,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'very_long_channel_name_without_new_messages',
            id: '6',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'very_long_channel_name_with_new_messages',
            id: '7',
            has_new_messages: 23,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'channel',
            id: '8',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'channel',
            id: '9',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'channel',
            id: '10',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null
          },
          {
            name:'channel',
            id: '11',
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
