import { defineStore } from 'pinia'
import { Channel, Message, MessageType } from 'src/components/models'
import { useUserStore } from './userStore'

interface ChannelState {
  current_channel: Channel | null,
  messages: Message[],
  is_loading: boolean
}

export const useChannelStore = defineStore<'channelStore', ChannelState, NonNullable<unknown>, {
  postMessage: (messageContent:string, messageType:MessageType) => void,
  loadMessages: () => void,
  setCurrentChannel: (channelId:string) => void,
  	}>('channelStore', {
  		state: (): ChannelState => ({
			is_loading:false,
  			current_channel: {
  				id: '1',
  				has_new_messages:0,
  				type: 'private',
  				is_someone_typing:false,
  				user_typing: null,
  				channel_members: [
  					{
  						display_name:'Display Name',
  						nickname:'user_123',
  						status: 'online'
  					}
  				]
  			},
  			messages: [
  				{
  					type:'message',
  					message_content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita dicta aperiam aut nemo eius consequuntur culpa, laudantium velit? Molestiae, commodi amet. Quasi nesciunt assumenda, sint debitis officia eius earum molestias?',
  					from: {
  						display_name:'Display Name',
  						nickname:'user_123',
  						status:'online'
  					},
					sent_at:'10:24'
  				},
  				{
  					type:'message',
  					message_content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita dicta aperiam aut nemo eius consequuntur culpa, laudantium velit? Molestiae, commodi amet. Quasi nesciunt assumenda, sint debitis officia eius earum molestias?',
  					from: {
  						display_name:'Display Name 2',
  						nickname:'user_123_other_than_ours',
  						status:'online'
  					},
					sent_at:'10:24'
  				}
  			]
  		}),
  		getters: {
  			// Add getters here if needed with types
  		},
  		actions: {
			postMessage(messageContent: string) {
				// Regular expressions for commands
				const joinRegex = /^\/join\s+(\w+)?$/;
				const inviteRegex = /^\/invite\s+(\w+)$/;
				const revokeRegex = /^\/revoke\s+(\w+)$/;
				const listRegex = /^\/list$/;
				const leaveRegex = /^\/leave$/;
				const userStore = useUserStore()
			  
				// Check if the message starts with a command
				let commandMatch = null;
				if ((commandMatch = messageContent.match(joinRegex))) {
				  // Call the dummy function to handle the /join command
				  const channelName = commandMatch[1];
				  userStore.joinChannel(channelName)
			  
				} else if ((commandMatch = messageContent.match(inviteRegex))) {
				  const nickName = commandMatch[1];
				  console.log({nickName});
				  userStore.inviteUserToChannel(this.current_channel?.id as string, nickName)
			  
				} else if ((commandMatch = messageContent.match(revokeRegex))) {
				  const nickName = commandMatch[1];
				  userStore.revokeInvitation(this.current_channel?.id as string, nickName)
			  
				} else if ((commandMatch = messageContent.match(leaveRegex))) {
					userStore.leaveChannel(this.current_channel?.id as string)
				
				} else if ((commandMatch = messageContent.match(listRegex))) {
					
					const messageObject: Message = {
						command_type: 'list',
						sent_at: new Date().toLocaleTimeString(),
						type: 'system',
					};
					this.messages.push(messageObject);

				} else {
				  const userStore = useUserStore();
				  if (userStore.user) {
					const messageObject: Message = {
					  from: {
						display_name: userStore.user.display_name,
						nickname: userStore.user.nickname,
						status: 'online',
					  },
					  message_content: messageContent,
					  sent_at: new Date().toLocaleTimeString(),
					  type: 'message',
					};
			  
					this.messages.push(messageObject);
				  }
				}
			  },
  			loadMessages() {
  				// Handle pagination logic in later phase
  				console.log('messages')
  			},
			setCurrentChannel(channelId){
				const userStore = useUserStore()
				this.router.push(`/channel/${channelId}`)
				this.is_loading = true
				if(this.current_channel?.id) this.current_channel.id = channelId
				userStore.viewedMessageInChannel(channelId)
				setTimeout(() => {	
					this.is_loading = false
				}, 1000)
				// load data fomr DB
			}
  		}
  	})
