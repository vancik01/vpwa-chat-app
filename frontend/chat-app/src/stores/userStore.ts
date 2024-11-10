import { defineStore } from 'pinia'
import { Channel, User, UserCreateAccountProps, UserStatus} from 'src/components/models'
import { Notify } from 'quasar';
import { authService, authManager, channelService } from 'src/services'
import { useChannelStore } from 'src/stores/channelStore'
import { io } from 'socket.io-client';
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
          const socket = io('http://localhost:3333', {
            path: '/socket.io', // Ensure this path matches the server's configuration
            transports: ['websocket', 'polling'],
            auth: {
              // TODO: Replace with token and implement token autentication
              token: `Bearer ${authManager.getToken()}`
            }
          });

          // Handle connection events
          socket.on('connect', () => {
            console.log('Connected to server with socket ID:', socket.id);
            socket.on('message', (data) => {
              console.log(data)
            })

            // Emit a custom event to the server
            socket.emit('my_custom_event', { data: 'Hello from the client!' });
          });

          // Handle disconnection
          socket.on('disconnect', () => {
            console.log('Disconnected from server');
          });

          // Listen for events from the server
          socket.on('server_event', (data) => {
            console.log('Received data from server:', data);
          });

          // Handle connection errors
          socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
          });

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
  			async leaveChannel(channelId) {
          if (!this.user?.id) {
            return;
          }
          try {
            await channelService.leaveChannel(channelId, this.user.id)
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
  			async deleteChannel(channelId) {
          if (!this.user?.id) {
            return;
          }
  				const channel = this.channels.find(channel => channel.id === channelId);
          if (!channel?.is_admin) {
            return;
          }
          try {
            await channelService.leaveChannel(channelId, this.user.id)
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
