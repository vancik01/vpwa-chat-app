import { defineStore } from 'pinia'
import { Channel, Message } from 'src/components/models'
import { useUserStore } from './userStore'

interface ChannelState {
  current_channel: Channel | null,
  messages: Message[],
  is_loading: boolean
}

export const useChannelStore = defineStore<'channelStore', ChannelState, NonNullable<unknown>, {
  postMessage: (messageContent:string) => void,
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
  			postMessage(messageContent) {
				const userStore = useUserStore()
  				console.log(`message ${messageContent} sent to channel ${this.current_channel?.id}`)
				if(userStore.user){
					const messageObject:Message = {
						from: {
							display_name: userStore.user.display_name,
							nickname: userStore.user.nickname,
							status:'online'	
						},
						message_content: messageContent,
						sent_at: new Date().toLocaleTimeString(),
						type: 'message'
					}

					this.messages.push(messageObject)
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
