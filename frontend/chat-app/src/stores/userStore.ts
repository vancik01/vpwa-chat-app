import { defineStore } from 'pinia'
import { Channel, User, UserCreateAccountProps, UserStatus, ApiChannelsList } from 'src/components/models'
import { Notify } from 'quasar';
import { authService, authManager } from 'src/services'
import { api } from 'src/boot/axios';

interface UserState {
  loading: boolean,
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
  initializeChatApp: () => void,
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
  createChannel(channelName: string, isPrivate: boolean, usernames: string | undefined): boolean,
  checkAuth: () => Promise<boolean>
}>('userStore', {
  		state: (): UserState => ({
        loading: false,
  			user: null,
  			channels:[      
  			],
        invitations: []
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
              const token = res.data.token
              authManager.setToken(token)

            this.user = {
              display_name: `${user.firstName} ${user.lastName}`,
              nickname: user.nickname,
              token: token,
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
        async initializeChatApp(){
          this.loading = true
          const res = await api.get('/channels')
          const data: ApiChannelsList[] = res.data;
          this.channels = data.map((channel:ApiChannelsList) => ({
            has_new_messages: 0,
            id: channel.id,
            is_admin: channel.isAdmin,
            is_someone_typing: false,
            user_typing: null,
            type: channel.channelType
          }))
          this.loading = false
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
          // this.channels.push({
          //   has_new_messages: 0,
          //   id: channelId,
          //   is_someone_typing: false,
          //   type: 'private',
          //   user_typing: null,
          // })
  			},
  			revokeInvitation(channelId) {
  				console.log(channelId)
  			},
  			deleteChannel(channelId) {
  				const channel = this.channels.find(channel => channel.id === channelId);
          if (!channel?.is_admin) {
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
          return channel?.is_admin || false
        },
        createChannel(channelName, isPrivate, usernames) {
          console.log(channelName, isPrivate, usernames)
          return true

          // if (!channelNameRegex.test(channelName)) {
          //   return false;
          // }

          // const channelExists = this.channels.some(channel => channel.id === channelId);
          // if (channelExists) {
          //   return false;
          // }
          
          // const usernamesArray = usernames
          // ? usernames
          //     .split(',')
          //     .map(username => username.trim())
          //     .filter(username => username) 
          // : [];
          // console.log(usernamesArray);
          
          // const newChannel = {
          //   id: channelId,
          //   has_new_messages: 0,
          //   type: isPrivate ? 'private' : 'public' as ChannelType,
          //   channel_members: this.user ? [{
          //     display_name: this.user.nickname,
          //     nickname: this.user.nickname,
          //     status: this.user.status,
          // }] : [],
          //   is_someone_typing: false,
          //   user_typing: null,
          //   admin_id: this.user?.nickname || '',
          // };
          // console.log(newChannel.channel_members)
        
          // this.channels.unshift(newChannel);
          // Notify.create({
          //   type: 'positive',
          //   message: `Channel "${channelId}" was successfully created!`,
          //   timeout: 3000
          // });
          // return true;
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
