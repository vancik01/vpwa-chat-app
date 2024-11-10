import { defineStore } from 'pinia'
import { Channel, User, UserCreateAccountProps, UserStatus} from 'src/components/models'
import { Notify } from 'quasar';
import { authService, authManager, channelService } from 'src/services'
import { useChannelStore } from 'src/stores/channelStore'
import { channelNameRegex} from 'src/utils/regex'
import { io } from 'socket.io-client';
import { initWsConnection } from 'src/services/WebsocketHandler';
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
  createChannel(channelName: string, isPrivate: boolean, usernames: string | undefined): Promise<boolean>,
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
                id: user.id,
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
            const channelStore = useChannelStore()
            await authService.logout()
            authManager.removeToken() 
            this.user = null
            channelStore.$reset()
            
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
              id: user.id,
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
          const data = await channelService.getChannels()
          this.channels = data.map((channel) => ({
            has_new_messages: 0,
            id: channel.id,
            is_admin: channel.isAdmin,
            is_someone_typing: false,
            user_typing: null,
            type: channel.channelType
          }))

          // Initialize the Socket.IO client
          const socket = io(process.env.API_URL, {
            path: '/socket.io', // Ensure this path matches the server's configuration
            transports: ['websocket', 'polling'],
            auth: {
              // TODO: Replace with token and implement token autentication
              token: `Bearer ${authManager.getToken()}`
            }
          });
          initWsConnection(socket)

          this.loading = false
        },
  			setStatus(status: UserStatus) {
  				if(this.user) {
            const channelStore = useChannelStore()
  					this.user.status = status
            if(channelStore.members){
              const userMemberObject = channelStore.members.find((u) => u.id === this.user?.id)
              console.log(userMemberObject)
              if(userMemberObject) userMemberObject.status = status
            }
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
            this.channels.push({
              has_new_messages: 0,
              id: channel.id,
              is_admin: channel.is_admin,
              is_someone_typing: false,
              user_typing: null,
              type: channel.channelType
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
  			revokeInvitation(channelId) {
  				console.log(channelId)
  			},
  			async deleteChannel(channelId) {
          if (!this.user?.id) {
            return;
          }
  				const channel = this.channels.find(channel => channel.id === channelId);
          if (!channel?.is_admin) {
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
            const acceptedChannel = this.invitations[invitationIndex];
            this.channels.unshift(acceptedChannel)
            this.invitations.splice(invitationIndex, 1)
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
              type: newChannel.channelType
            })
            Notify.create({
              type: 'positive',
              message: `Channel "${channelId}" was successfully created!`,
              timeout: 3000,
              position: 'top-right'
            })
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
            if (user) {
              this.user = {
                id: user.id,
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
