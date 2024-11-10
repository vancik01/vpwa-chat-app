import { defineStore } from 'pinia'
import { Channel, ChannelMember, Message, MessageType } from 'src/components/models'
import { useUserStore } from './userStore'
import { cancelRegex, inviteRegex, joinRegex, listRegex, quitlRegex, revokeRegex } from 'src/utils/regex'
import { channelService } from 'src/services'
import { Notify } from 'quasar';
import moment from 'moment'

interface ChannelState {
  current_channel: Channel | null,
  members: ChannelMember[]
  messages: Message[],
  is_last_page: boolean,
  is_loading: boolean,
  is_loading_infinite: boolean,
  page:number
}

export const useChannelStore = defineStore<'channelStore', ChannelState, NonNullable<unknown>, {
  postMessage: (messageContent:string, messageType:MessageType) => void,
  loadMessages: (page:number) => Promise<Message[]>,
  setCurrentChannel: (channelId:string) => Promise<void>,
  	}>('channelStore', {
  		state: (): ChannelState => ({
			is_loading:false,
			is_loading_infinite:false,
			page: 1,
			is_last_page: false,
  			current_channel: null,
  			messages: [],
			members: []
  		}),
  		getters: {
  			// Add getters here if needed with types
  		},
  		actions: {
			async postMessage(messageContent: string) {
				// Regular expressions for commands
				const userStore = useUserStore()
			  
				// Check if the message starts with a command
				let commandMatch = null;
				if ((commandMatch = messageContent.match(joinRegex))) {
				  const channelName = commandMatch[1];
				  userStore.joinChannel(channelName)
			  
				} else if ((commandMatch = messageContent.match(inviteRegex))) {
				  const nickName = commandMatch[1];
				  console.log({nickName});
				  const canInvite = userStore.inviteUserToChannel(this.current_channel?.id as string, nickName)
					
				  if (canInvite) {
					const systemMessage: Message = {
						command_type: 'invite',
						invited_user: nickName, 
						sent_at: new Date().toLocaleTimeString(),
						type: 'system',
					};
				
					this.messages.push(systemMessage);
					}
			  
				} else if ((commandMatch = messageContent.match(revokeRegex))) {
				  const nickName = commandMatch[1];
				  userStore.revokeInvitation(this.current_channel?.id as string, nickName)
			  
				} else if (commandMatch = messageContent.match(cancelRegex)) {
					userStore.leaveChannel(this.current_channel?.id as string)
					
				} else if (commandMatch = messageContent.match(quitlRegex)) {
					userStore.deleteChannel(this.current_channel?.id as string)
				
				} else if ((commandMatch = messageContent.match(listRegex))) {
					
					const messageObject: Message = {
						command_type: 'list',
						sent_at: new Date().toLocaleTimeString(),
						type: 'system',
					};
					this.messages.push(messageObject);

				} else {
				  const userStore = useUserStore();
				  const userMemberObject = this.members.find((member) => member.id === userStore.user?.id)
				  if (userMemberObject && this.current_channel) {
					const messageObject: Message = {
					  from: userMemberObject,
					  messageContent: messageContent,
					  sent_at: moment().toLocaleString(),
					  type: 'message',
					};
					const res = await channelService.sendMessage(this.current_channel.id, messageObject.messageContent)
					if(res.status === 200){
						this.messages.push(messageObject);
					} else {
						Notify.create({
							type: 'negative',
							message: 'Failed to send message',
							timeout: 3000,
						  });
					}
				  }
				}
			  },
  			async loadMessages(page: number) {
				if (this.current_channel) {
				  try {
					const messages = await channelService.loadMessages(this.current_channel.id, page)
				  	return messages.map((message) => {
						return {
							type: 'message',
							messageContent: message.messageContent,
							sent_at: message.createdAt,
							from: this.members.find((member) => member.id === message.senderId) || null
						}
					})
				  } catch (error) {
					Notify.create({
						type: 'negative',
						message: `${error}`,
						timeout: 3000,
					  });
					  return []
				  }
				} else {
				  return []
				}
			},
			
			async setCurrentChannel(channelId){
				this.is_loading = true;
				const userStore = useUserStore()
				try {
					const newChannel = await channelService.getChannelDetails(channelId)
					this.router.push(`/channel/${channelId}`)
					this.current_channel = {
						has_new_messages: 0,
						id: newChannel.id,
						is_admin: newChannel.is_admin,
						is_someone_typing: false,
						user_typing: null,
						type: newChannel.channelType
					}
					this.members = newChannel.members
					userStore.viewedMessageInChannel(channelId)
					this.page = 0
					this.is_last_page = false
					this.messages = await this.loadMessages(this.page) // load first 10 messages
					this.is_loading = false;
					this.page = 1
				
				} catch (error) {
					Notify.create({
						type: 'negative',
						message: `${error}`,
						timeout: 3000,
					  });
				}
				
				// load data fomr DB
			},
			// handleInfinityScroll(){

			// }
  		}
  	})
