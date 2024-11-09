import { defineStore } from 'pinia'
import { Channel, User, UserCreateAccountProps, UserStatus, ChannelType } from 'src/components/models'
import { channelNameRegex } from 'src/utils/regex'
import { Notify } from 'quasar';
import { authService, authManager } from 'src/services'

interface UserState {
  user: User | null,
  channels: Channel[],
  invitations: Channel[]
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
  inviteUserToChannel: (channelId: string, userId:string) => boolean,
  revokeInvitation: (channelId: string, nickname:string) => void,
  deleteChannel: (channelId: string) => void,
  viewedMessageInChannel: (channelId: string) => void,
  acceptInvitation: (channelId: string) => void,
  rejectInvitation: (channelId: string) => void,
  isAdmin:(channelId: string) => boolean,
  createChannel(channelId: string, isPrivate: boolean, usernames: string | undefined): boolean,
  checkAuth: () => Promise<boolean>
}>('userStore', {
  		state: (): UserState => ({
  			user: null,
  			channels:[
          {
            id:'channel_name_123_456_789',
            has_new_messages: 128,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          },
          {
            id:'very_long_channel_name_without_new_messages',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          },
          {
            id:'very_long_channel_name_with_new_messages',
            has_new_messages: 23,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          },
          {
            id:'channel_1',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          },
          {
            id:'channel_2',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          },
          {
            id: 'channel_3',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          },
          {
            id: 'channel_and_user_123_is_admin',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          }          
  			],
        
        invitations: [
          { id: 'channel_invite_1',
            has_new_messages: 0,
            type: 'public',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          },
          {
            id: 'channel_invite_2',
            has_new_messages: 0,
            type: 'private',
            channel_members: [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: ''
          }
        ]
  		}),
  		getters: {
  			is_logged_in (){
  				return this.user ? true : false
  			}
  		},
  		actions: {
  			async login(email, password) {
          try {
            const credentials = { email, password };
            const token = await authService.login(credentials);
            
            authManager.setToken(token.token);
        
            const user = await authService.me();
            if (user) {
              this.user = {
                nickname: user.nickname,
                display_name: `${user.firstName} ${user.lastName}`,
                token: token.token,
                status: 'online',
              };

              this.router.push('/')
              
              Notify.create({
                type: 'positive',
                message: 'Login successful!',
                timeout: 3000,
              });
              
              return { success: 'Login successful!' };
            }
          } catch (error) {
            Notify.create({
              type: 'negative',
              message: 'Login failed!',
              timeout: 3000,
            });
            return { error: 'Login failed!' };
          }
        },

  			async logout() {
          try {
            await authService.logout()
            authManager.removeToken() 
            this.user = null
            this.router.push('/auth/login')
      
            Notify.create({
              type: 'warning',
              message: 'Logged out successfully.',
              timeout: 3000
            })
          } catch (error) {
            console.error('Logout failed:', error)
          }
  			},
        
  			async createAccount(createAccountProps) {
  				try {
            const res = await authService.register(createAccountProps)
            if(res.status === 200){
              const user = res.data
            
            this.user = {
              display_name: `${user.firstName} ${user.lastName}`,
              nickname: user.nickname,
              token: authManager.getToken(),
              status: 'online'
            }
            this.router.push('/')
            
            Notify.create({
              type: 'positive',
              message: 'Registration successful!',
              timeout: 3000
            })
            }
          } catch (error) {
            Notify.create({
              type: 'negative',
              message: `${error}`,
              timeout: 3000
            })
          }
  			},

  			setStatus(status: UserStatus) {
  				if(this.user) {
  					this.user.status = status
  				}
  			},
  			inviteUserToChannel(channelId, userId) {
          console.log(channelId, userId)
          const channel = this.channels.find(channel => channel.id === channelId);
          if ((channel?.type === 'private') && (!this.isAdmin(channelId))){
            return false
          }
          else {
            return true
          }
  			},
  			leaveChannel(channelId) {
          const channelIndex = this.channels.findIndex(channel => channel.id === channelId);
          if (channelIndex !== -1) {
            this.channels.splice(channelIndex, 1);
          }
          this.router.push('/')

          Notify.create({
              color: 'warning',
              textColor: 'black',
              message: `You left "${channelId}" channel.`,
              timeout: 3000,
              position: 'top-right'
          });
          console.log('leave', channelId)
  			},
  			joinChannel(channelId) {
  				console.log(channelId)
          this.channels.push({
            channel_members: [],
            has_new_messages: 0,
            id: channelId,
            is_someone_typing: false,
            type: 'private',
            user_typing: null,
            admin_id: ''
          })
  			},
  			revokeInvitation(channelId) {
  				console.log(channelId)
  			},
  			deleteChannel(channelId) {
  				const channel = this.channels.find(channel => channel.id === channelId);
          if (channel?.admin_id !== this.user?.nickname) {
            return;
          }
          Notify.create({
            color: 'negative',
            message: `Channel "${channelId}" was deleted.`,
            timeout: 3000,
            position: 'top-right'
          });
          this.leaveChannel(channelId);

  			},
  			viewedMessageInChannel(channelId) {
  				const channel = this.channels.find((channel) => channel.id === channelId);
  				if (channel) {
  					channel.has_new_messages = 0;
  				}
  			},
        acceptInvitation(channelId) {
          const invitationIndex = this.invitations.findIndex((inv) => inv.id === channelId);
          if (invitationIndex !== -1) {
            const acceptedChannel = this.invitations[invitationIndex];
            this.channels.unshift(acceptedChannel);
            this.invitations.splice(invitationIndex, 1);
          }
        },
        rejectInvitation(channelId) {
          const invitationIndex = this.invitations.findIndex((inv) => inv.id === channelId);
          if (invitationIndex !== -1) {
            this.invitations.splice(invitationIndex, 1);
          }
        },
        isAdmin(channelId) {
          const channel = this.channels.find(channel => channel.id === channelId);
          if (channel && channel.admin_id === this.user?.nickname) {
            return true
          }
          else {return false}
        },
        createChannel(channelId, isPrivate, usernames) {

          if (!channelNameRegex.test(channelId)) {
            return false;
          }

          const channelExists = this.channels.some(channel => channel.id === channelId);
          if (channelExists) {
            return false;
          }
          
          const usernamesArray = usernames
          ? usernames
              .split(',')
              .map(username => username.trim())
              .filter(username => username) 
          : [];
          console.log(usernamesArray);
          
          const newChannel = {
            id: channelId,
            has_new_messages: 0,
            type: isPrivate ? 'private' : 'public' as ChannelType,
            channel_members: this.user ? [{
              display_name: this.user.nickname,
              nickname: this.user.nickname,
              status: this.user.status,
          }] : [],
            is_someone_typing: false,
            user_typing: null,
            admin_id: this.user?.nickname || '',
          };
          console.log(newChannel.channel_members)
        
          this.channels.unshift(newChannel);
          Notify.create({
            type: 'positive',
            message: `Channel "${channelId}" was successfully created!`,
            timeout: 3000
          });
          return true;
        },

        async checkAuth() {
          const token = authManager.getToken()
          if (token) {
            const user = await authService.me()
            if (user) {
              this.user = {
                nickname: user.nickname,
                display_name: `${user.firstName} ${user.lastName}`,
                token: token,
                status: 'online',
              }
              return true
            } else {
              return false
              authManager.removeToken()
            }
          }
          return false
        },
  		}
  	})
