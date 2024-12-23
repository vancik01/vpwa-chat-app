import { defineStore } from 'pinia'
import { Channel, ChannelMember, Message, MessageType } from 'src/components/models'
import { useUserStore } from './userStore'
import { cancelRegex, inviteRegex, joinRegex, listRegex, quitRegex, revokeRegex, joinTypeRegex, kickRegex } from 'src/utils/regex'
import { channelService } from 'src/services'
import { Notify } from 'quasar';
import moment from 'moment'
const parser = new DOMParser();

interface ChannelState {
	current_channel: Channel | null,
	members: ChannelMember[]
	messages: Message[],
	is_last_page: boolean,
	is_loading: boolean,
	is_loading_infinite: boolean,
	page: number,
	typingStatus: { [channelId: string]: { [userId: number]: string } }
}

export const useChannelStore = defineStore<'channelStore', ChannelState, NonNullable<unknown>, {
	postMessage: (messageContent: string, messageType: MessageType) => void,
	newMessage: (message: Message) => void,
	loadMessages: (page: number) => Promise<Message[]>,
	setCurrentChannel: (channelId: string) => Promise<void>,
	updateTypingStatus: (channelId: string, userId: number, content: string) => void,
}>('channelStore', {
	state: (): ChannelState => ({
		is_loading: false,
		is_loading_infinite: false,
		page: 1,
		is_last_page: false,
		current_channel: null,
		messages: [],
		members: [],
		typingStatus: {}
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

			} else if ((commandMatch = messageContent.match(kickRegex))) {
				const nickName = commandMatch[1];
				userStore.kickUserFromChannel(this.current_channel?.id as string, nickName)

			} else if ((commandMatch = messageContent.match(revokeRegex))) {
				if(this.current_channel?.is_admin === false){
					Notify.create({
						type: 'negative',
						message: 'You are not an admin',
						timeout: 3000,
						position: 'top-right'
					});
					return
				}
				const nickName = commandMatch[1];
				userStore.kickUserFromChannel(this.current_channel?.id as string, nickName)

			} else if ((commandMatch = messageContent.match(joinTypeRegex))) {
				const channelName = commandMatch[1];
				const channelType = commandMatch[2];
				let isPrivate = false
				if (channelType === 'private') {
					isPrivate = true
				}
				userStore.createChannel(channelName, isPrivate, '')

			} else if ((commandMatch = messageContent.match(inviteRegex))) {
				const nickName = commandMatch[1];
				const result = await userStore.inviteUserToChannel(this.current_channel?.id as string, nickName)

				if (result) {
					const systemMessage: Message = {
						command_type: 'invite',
						invited_user: nickName,
						sent_at: new Date().toLocaleTimeString(),
						type: 'system',
					};
					this.messages.push(systemMessage);
				}

			} else if (commandMatch = messageContent.match(cancelRegex)) {
				userStore.leaveChannel(this.current_channel?.id as string)

			} else if (commandMatch = messageContent.match(quitRegex)) {
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
					if (res.status === 200) {
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

		async setCurrentChannel(channelId) {
			this.is_loading = true;
			const userStore = useUserStore()
			const prevChannel = this.current_channel?.id
			if (prevChannel) {
				userStore.socketInstance?.emitTyping(prevChannel, '')
			}
			try {
				const newChannel = await channelService.getChannelDetails(channelId)
				console.log(newChannel)
				this.router.push(`/channel/${channelId}`)
				this.current_channel = {
					has_new_messages: 0,
					id: newChannel.id,
					is_admin: newChannel.is_admin,
					is_someone_typing: false,
					user_typing: null,
					type: newChannel.channel_type
				}
				this.members = newChannel.members
				userStore.viewedMessageInChannel(channelId)
				this.page = 0
				this.is_last_page = false
				this.messages = await this.loadMessages(this.page) // load first 10 messages
				this.is_loading = false;
				this.page = 1

			} catch (error) {
				const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || `Failed to load channel "${channelId}".`;
				Notify.create({
					type: 'negative',
					message: errorMessage,
					timeout: 3000,
					position: 'top-right'
				})
			}
		},
		updateTypingStatus(channelId: string, userId: number, content: string) {
			const decodedContent = parser.parseFromString(content, 'text/html').body.textContent;

			if (!this.typingStatus[channelId]) {
			  this.typingStatus[channelId] = {};
			}
			if (decodedContent === null || decodedContent === '' || decodedContent[0] === '/') {
			  delete this.typingStatus[channelId][userId];
			}
			else if (decodedContent) {
			  this.typingStatus[channelId][userId] = decodedContent;
			}
		},

		newMessage(message:Message){
			this.messages.push(message)
		}
		
		
	}
})
