import { defineStore } from 'pinia'
import { Channel, Message, MessageType } from 'src/components/models'
import { useUserStore } from './userStore'
import { inviteRegex, joinRegex, leaveRegex, listRegex, revokeRegex } from 'src/utils/regex'
import { fetchMessages } from 'src/utils/simulateBackend'

interface ChannelState {
  current_channel: Channel | null,
  messages: Message[],
  is_loading: boolean,
  is_loading_infinite: boolean,
  page:number
}

export const useChannelStore = defineStore<'channelStore', ChannelState, NonNullable<unknown>, {
  postMessage: (messageContent:string, messageType:MessageType) => void,
  loadMessages: (page:number) => Promise<Message[]>,
  setCurrentChannel: (channelId:string) => void,
  	}>('channelStore', {
  		state: (): ChannelState => ({
			is_loading:false,
			is_loading_infinite:false,
			page: 0,
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
  			messages: []
  		}),
  		getters: {
  			// Add getters here if needed with types
  		},
  		actions: {
			postMessage(messageContent: string) {
				// Regular expressions for commands
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
  			async loadMessages(page: number) {
				console.log('Loading page:', page);
		  
				if (this.current_channel) {
				  // Simulate backend delay
				  return new Promise((resolve) => {
					setTimeout(() => {
					  const messages = fetchMessages()
					  resolve(messages);
					}, 1000); // Simulate 1 second backend delay
				  });
				} else {
				  return [];
				}
			},
			
			async setCurrentChannel(channelId){
				if(this.current_channel){
					this.is_loading = true;
					const userStore = useUserStore()
					const newChannel = userStore.channels.find((value) => value.id == channelId)
					this.page = 0,
					this.router.push(`/channel/${channelId}`)
					if(this.current_channel?.id) this.current_channel.id = channelId
					if(newChannel && this.current_channel.type){
						console.log(newChannel)
						this.current_channel.type = newChannel.type
					}
					
					userStore.viewedMessageInChannel(channelId)
					this.messages = await this.loadMessages(this.page) // load first 10 messages
					this.is_loading = false;
				}
				// load data fomr DB
			},
			// handleInfinityScroll(){

			// }
  		}
  	})
