import { defineStore } from 'pinia'
import { Channel, User, UserCreateAccountProps, UserStatus, ChannelType } from 'src/components/models'
import { channelNameRegex } from 'src/utils/regex'
import { Notify } from 'quasar';

interface UserState {
  user: User | null,
  channels: Channel[],
  invitations: Channel[]
}

export const useUserStore = defineStore<'userStore', UserState, {
  is_logged_in: () => boolean
  	}, {
  login: (email: string, password: string) => { success?: string; error?: string }
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
  createChannel(channelId: string, isPrivate: boolean, usernames: string | undefined): boolean
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
            admin_id: 'user_123'
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
  			login(email, password) {
  				console.log(email, password)
          
          //dummy data
          const knownUserEmail = 'user_123@email.com';
          const knownUserPassword = 'password';

          if (email !== knownUserEmail) {
            return { error: 'User not found' };
          }
    
          else if (password !== knownUserPassword) {
            return { error: 'Incorrect password!' };
          }

  				this.user = {
  					display_name:'Display name',
  					nickname: 'user_123',
  					token:'example_token_123',
  					status: 'online'
  				}
          return { success: 'Login successful!' };
  			},
  			logout() {
          this.router.push('/auth/login')
          this.user = null
  			},
  			createAccount(createAccountProps) {
  				console.log(createAccountProps)
          Notify.create({
            type: 'positive',
            message: 'Registration successful!',
            timeout: 3000
          });
          this.user = {
  					display_name:'Display name',
  					nickname: 'user_123',
  					token:'example_token_123',
  					status: 'online'
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
        }
  		}
  	})
