import { defineStore } from 'pinia'
import { Channel, User, UserCreateAccountProps, UserStatus, NotificationsStatus} from 'src/components/models'
import { Notify } from 'quasar';
import { authService, authManager, channelService, userSerice, notificationsService } from 'src/services'
import { useChannelStore } from 'src/stores/channelStore'
import { channelNameRegex} from 'src/utils/regex'
import { io } from 'socket.io-client';
import { WebsocketHandler } from 'src/services/WebsocketHandler';

interface UserState {
  loading: boolean,
  user: User | null,
  channels: Channel[],
  invitations: Channel[],
  socketInstance: WebsocketHandler | undefined,
  isOnline: boolean
}

export const useUserStore = defineStore<'userStore', UserState, {
  is_logged_in: () => boolean
  	}, {
  login: (email: string, password: string) => void
  logout: () => void
  createAccount: (createAccountProps:UserCreateAccountProps) => void
  initializeChatApp: () => void,
  setStatus: (status: UserStatus) => void,
  loadChannelsData: () => void,
  setNotificationsStatus: (status: NotificationsStatus) => void,
  leaveChannel: (channelId: string) => void,
  joinChannel: (channelId: string) => void,
  inviteUserToChannel: (channelId: string, nickName:string) => Promise<boolean>,
  kickUserFromChannel: (channelId: string, nickName: string) => void,
  deleteChannel: (channelId: string) => void,
  viewedMessageInChannel: (channelId: string) => void,
  acceptInvitation: (channelId: string) => void,
  rejectInvitation: (channelId: string) => void,
  isAdmin:(channelId: string) => boolean,
  createChannel(channelName: string, isPrivate: boolean, usernames: string | undefined): Promise<boolean>,
  checkAuth: () => Promise<boolean>
}>('userStore', {
  		state: (): UserState => ({
        loading: false,
  			user: null,
  			channels:[      
  			],
        invitations: [],
        socketInstance: undefined,
        isOnline: true
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
                id: user.id,
                nickname: user.nickname,
                display_name: `${user.firstName} ${user.lastName}`,
                token: token.token,
                status: user.status,
                notificationsStatus: user.notificationsStatus
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
            const channelStore = useChannelStore()
            channelStore.$reset()
            this.$reset()
            await authService.logout()
            authManager.removeToken() 
            
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

        async loadChannelsData() {
          const data = await channelService.getChannels()
          this.invitations = []
          this.channels = []
          data.forEach((channel) => {
            const channelData = {
              has_new_messages: parseInt(channel.unreadMessagesCount),
              id: channel.id,
              is_admin: channel.isAdmin,
              is_someone_typing: false,
              user_typing: null,
              type: channel.channelType
            }
      
            if (channel.pendingInvite) {
              this.invitations.push(channelData)
            }
            else {
              this.channels.push(channelData)
            }
          })    
        },
        
  			async createAccount(createAccountProps) {
  				try {
            const res = await authService.register(createAccountProps)
            if(res.status === 200){
              const user = res.data
              const token = res.data.token
              authManager.setToken(token)

            this.user = {
              id: user.id,
              display_name: `${user.firstName} ${user.lastName}`,
              nickname: user.nickname,
              token: token,
              status: user.status,
              notificationsStatus: user.notificationsStatus
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
          this.loadChannelsData()

          // Initialize the Socket.IO client
          const socket = io(process.env.API_URL, {
            path: '/socket.io', // Ensure this path matches the server's configuration
            transports: ['websocket', 'polling'],
            auth: {
              token: `Bearer ${authManager.getToken()}`
            }
          });
          this.socketInstance = new WebsocketHandler(socket)
          this.socketInstance.initWsConnection()
          notificationsService.requestPermissions()

          this.loading = false
          window.addEventListener('online', () => {
            if(this.isOnline === false){
              const channelStore = useChannelStore()
              this.loadChannelsData()
              if(channelStore.current_channel){
                channelStore.setCurrentChannel(channelStore.current_channel.id)
              }
              this.socketInstance?.connect()
              Notify.create({
                type: 'positive',
                message: 'You are back online!',
                timeout: 3000,
                position: 'top-right'
              })
            }
            this.isOnline = true
          });
          window.addEventListener('offline', () => (this.isOnline = false));
        },
  			async setStatus(status: UserStatus) {
  				if(this.user) {
            if(this.user.status === status){
              return
            }
            await userSerice.setStatus(status)
            const channelStore = useChannelStore()
            
            const prevStatus = this.user.status
  					this.user.status = status
            
            if(channelStore.members){
              const userMemberObject = channelStore.members.find((u) => u.id === this.user?.id)
              if(userMemberObject) userMemberObject.status = status
              if(status === 'offline'){
                if(channelStore.current_channel){
                  this.socketInstance?.emitTyping(channelStore.current_channel.id, '')
                }
                this.socketInstance?.disconnect()
              } else if (prevStatus === 'offline'){
                const channelStore = useChannelStore()
                this.loadChannelsData()
                if(channelStore.current_channel){
                  channelStore.setCurrentChannel(channelStore.current_channel.id)
                }
                this.socketInstance?.connect()
              }
            }
  				}
  			},
  			async setNotificationsStatus(status: NotificationsStatus) {
  				if(this.user) {
            console.log(status)
            await userSerice.setNotificationsStatus(status)
  					this.user.notificationsStatus = status
  				}
  			},
  			async inviteUserToChannel(channelId, nickName) {
          try {
            const response = await channelService.inviteToChannel(channelId, nickName)
            Notify.create({
              type: 'positive',
              message: response.message,
              timeout: 3000,
              position: 'top-right'
            })
            return true
          } catch (error) {
            const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || `Failed to invite user ${nickName}`;
            Notify.create({
              type: 'negative',
              message: errorMessage,
              timeout: 3000,
              position: 'top-right'
            })
            return false
          }
  			},
        async kickUserFromChannel(channelId, nickName) {
          try {
            const response = await channelService.kickFromChannel(channelId, nickName)
            Notify.create({
              type: 'positive',
              message: response.message,
              timeout: 3000,
              position: 'top-right'
            })
          } catch (error) {
            const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || `Failed to kick user ${nickName}`;
            Notify.create({
              type: 'negative',
              message: errorMessage,
              timeout: 3000,
              position: 'top-right'
            })
          }
        },
  			async leaveChannel(channelId) {
          if (!this.user?.id) {
            return;
          }
          try {
            await channelService.leaveChannel(channelId)
            const channelStore = useChannelStore()
            if (channelStore.current_channel?.id === channelId) {
              this.router.push('/')
            }
            const channel = this.channels.find(channel => channel.id === channelId)
            const isAdmin = channel?.is_admin
            const channelIndex = this.channels.findIndex(channel => channel.id === channelId);
            if (channelIndex !== -1) {
              this.channels.splice(channelIndex, 1);
            }
            if (isAdmin) {
              Notify.create({
                color: 'negative',
                message: `Channel "${channelId}" was deleted.`,
                timeout: 3000,
                position: 'top-right'
              })
            }
            Notify.create({
                color: 'warning',
                textColor: 'black',
                message: `You left "${channelId}" channel`,
                timeout: 3000,
                position: 'top-right'
            })
          }
          catch (error) {
            Notify.create({
              type: 'negative',
              message: `Failed to leave "${channelId}" channel`,
              timeout: 3000,
              position: 'top-right'
            })
          }
  			},
  			async joinChannel(channelId) {
          try {
            const res = await channelService.joinChannel(channelId)
            const channel = await channelService.getChannelDetails(channelId)
            useChannelStore().setCurrentChannel(channelId)
            this.channels.unshift({
              has_new_messages: 0,
              id: channel.id,
              is_admin: channel.is_admin,
              is_someone_typing: false,
              user_typing: null,
              type: channel.channel_type
            })
            Notify.create({
              type: 'positive',
              message: res.message,
              timeout: 3000,
              position: 'top-right'
            })
          }
          catch (error) {
            const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || `Failed to join "${channelId}" channel.`;
            Notify.create({
              type: 'negative',
              message: errorMessage,
              timeout: 3000,
              position: 'top-right'
            })
          }
  			},
  			async deleteChannel(channelId) {
          if (!this.user?.id) {
            return;
          }
  				const channel = this.channels.find(channel => channel.id === channelId);
          if (!channel?.is_admin) {
            Notify.create({
              color: 'negative',
              message: `Channel "${channelId}" can be only deleted by admin.`,
              timeout: 3000,
              position: 'top-right'
            });
            return;
          }
          try {
            await channelService.leaveChannel(channelId)
            const channelStore = useChannelStore()
            if (channelStore.current_channel?.id === channelId) {
              this.router.push('/')
            }
            const channelIndex = this.channels.findIndex(channel => channel.id === channelId);
            if (channelIndex !== -1) {
              this.channels.splice(channelIndex, 1);
            }
            Notify.create({
              color: 'negative',
              message: `Channel "${channelId}" was deleted.`,
              timeout: 3000,
              position: 'top-right'
            });
          } catch (error){
            Notify.create({
              type: 'negative',
              message: `Failed to leave "${channelId}" channel`,
              timeout: 3000,
              position: 'top-right'
            })
          }

  			},
  			viewedMessageInChannel(channelId) {
  				const channel = this.channels.find((channel) => channel.id === channelId);
  				if (channel) {
  					channel.has_new_messages = 0;
  				}
  			},
        async acceptInvitation(channelId) {
          const invitationIndex = this.invitations.findIndex((inv) => inv.id === channelId);
          if (invitationIndex !== -1) {
            this.joinChannel(channelId)
            this.invitations.splice(invitationIndex, 1)
          }
        },
        async rejectInvitation(channelId) {
          channelService.leaveChannel(channelId)
          const invitationIndex = this.invitations.findIndex((inv) => inv.id === channelId);
          if (invitationIndex !== -1) {
            this.invitations.splice(invitationIndex, 1);
          }
        },
        isAdmin(channelId) {
          const channel = this.channels.find(channel => channel.id === channelId);
          return channel?.is_admin || false
        },
        async createChannel(channelId, isPrivate, usernames) {

          if (!channelNameRegex.test(channelId)) {
             return false;
          }
          
          const usernamesArray = usernames
            ? usernames
            .split(',')
            .map(username => username.trim())
            .filter(username => username) 
            : [];
          console.log(usernamesArray)
          
          try {
            const newChannel = await channelService.createChannel(channelId, isPrivate ? 'private' : 'public')
            useChannelStore().setCurrentChannel(channelId)
            this.channels.push({
              has_new_messages: 0,
              id: newChannel.id,
              is_admin: newChannel.is_admin,
              is_someone_typing: false,
              user_typing: null,
              type: newChannel.channel_type
            })
            Notify.create({
              type: 'positive',
              message: `Channel "${channelId}" was successfully created!`,
              timeout: 3000,
              position: 'top-right'
            })

            for (const username of usernamesArray) {
              this.inviteUserToChannel(channelId, username)
            }

            return true
          }
          catch (error) {
            Notify.create({
              type: 'negative',
              message: 'Channel already exists!',
              timeout: 3000,
              position: 'top-right'
            })
            return false
          }          
        },

        async checkAuth() {
          const token = authManager.getToken()
          if (token) {
            const user = await authService.me()
            console.log(user, 'qqwe')
            if (user) {
              this.user = {
                id: user.id,
                nickname: user.nickname,
                display_name: `${user.firstName} ${user.lastName}`,
                token: token,
                status: user.status,
                notificationsStatus: user.notificationsStatus
              }
              return true
            } else {
              authManager.removeToken()
              return false
            }
          }
          return false
        },
  		}
  	})
