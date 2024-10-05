import { defineStore } from 'pinia'
import { Channel, Message } from 'src/components/models'

interface ChannelState {
  current_channel: Channel | null,
  messages: Message[]
}

export const useChannelStore = defineStore<'channelStore', ChannelState, NonNullable<unknown>, {
  postMessage: (message:Message) => void,
  loadMessages: () => void,
  	}>('channelStore', {
  		state: (): ChannelState => ({
  			current_channel: {
  				name:'channel_name_123',
  				id: '',
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
  					}
  				},
  				{
  					type:'message',
  					message_content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita dicta aperiam aut nemo eius consequuntur culpa, laudantium velit? Molestiae, commodi amet. Quasi nesciunt assumenda, sint debitis officia eius earum molestias?',
  					from: {
  						display_name:'Display Name 2',
  						nickname:'user_123_other_than_ours',
  						status:'online'
  					}
  				}
  			]
  		}),
  		getters: {
  			// Add getters here if needed with types
  		},
  		actions: {
  			postMessage(message) {
  				console.log(`message ${message} sent to channel ${this.current_channel?.name}`)
  			},
  			loadMessages() {
  				// Handle pagination logic in later phase
  				console.log('messages')
  			},
  		}
  	})
