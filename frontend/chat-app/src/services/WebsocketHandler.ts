import { Notify } from 'quasar';
import { Socket } from 'socket.io-client';
import { Message, WsChannelDestroy, WsChannelMember, WsMessage, WsUserStatusChange } from 'src/components/models';
import { ApiChannelsList } from 'src/contracts';
import { useChannelStore } from 'src/stores/channelStore';
import { useUserStore } from 'src/stores/userStore';
import { notificationsService } from '.';

export class WebsocketHandler {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  initWsConnection(){
    const userStore = useUserStore()
    const channelStore = useChannelStore()
    if(userStore.user?.status === 'offline'){
      this.disconnect()
    }
    this.socket.on('connect', () => {
      this.socket.on('new_message', (data) => {
          const jsonData:WsMessage = JSON.parse(data)
          const channel = userStore.channels.find((ch) => ch.id === jsonData.channelId)
          const newMessage:Message = {
            type:'message',
            sent_at: jsonData.sentAt,
            messageContent: jsonData.messageContent,
            from: channelStore.members.find((member) => member.id === jsonData.senderId) || null,   
          }

          if(jsonData.channelId !== channelStore.current_channel?.id){
            if(channel) {
              channel.has_new_messages += 1
            }
          } else {
            channelStore.newMessage(newMessage)
          }
          if(channel){
            notificationsService.notifyNewMessage(newMessage, channel, jsonData.from)
          }
          channelStore.updateTypingStatus(jsonData.channelId, jsonData.senderId, '')
        })

        this.socket.on('invitation', (data) => {
          const jsonData:ApiChannelsList = JSON.parse(data)
          userStore.invitations.push({
            has_new_messages: 0,
            id: jsonData.id,
            is_admin: false,
            is_someone_typing: false,
            type: jsonData.channelType,
            user_typing: null,
          })
        })

        this.socket.on('user_joined', (data) => {
          const jsonData:WsChannelMember = JSON.parse(data)
          if(channelStore.current_channel && channelStore.current_channel.id === jsonData.channelId){
            channelStore.members.push({
              display_name: jsonData.display_name,
              id: jsonData.id,
              nickname: jsonData.nickname,
              status: jsonData.status
            })
          }
        })

        this.socket.on('kicked', (data) => {
          const jsonData:WsChannelDestroy = JSON.parse(data)
          Notify.create({
            type: 'negative',
            message: jsonData.reason,
            timeout: 3000,
          });
        })

        this.socket.on('channel_destroyed', (data) => {
          const jsonData:WsChannelDestroy = JSON.parse(data)
          const memberChannelIndex = userStore.channels.findIndex(channel => channel.id === jsonData.channelId);
          const invitationChannelIndex = userStore.invitations.findIndex(channel => channel.id === jsonData.channelId);
          
          if (memberChannelIndex !== -1) {
            userStore.channels.splice(memberChannelIndex, 1);
          } else if(invitationChannelIndex !== -1) {
            userStore.invitations.splice(invitationChannelIndex, 1);
          }

          if(channelStore.current_channel && channelStore.current_channel.id === jsonData.channelId){
            userStore.router.push('/')
          }
          Notify.create({
            type: 'negative',
            message: jsonData.reason,
            timeout: 3000,
          });
        })

        this.socket.on('status_change', (data) => {
          const jsonData:WsUserStatusChange = JSON.parse(data)
          const member = channelStore.members.filter((m) => m.id === jsonData.userId)
          if(member.length !== 0){
            member[0].status = jsonData.status
          }
          
        })

        this.socket.on('typing', (data) => {
          const jsonData = JSON.parse(data);
          channelStore.updateTypingStatus(jsonData.channelId, jsonData.userId, jsonData.content);
        })
      });

      // Handle disconnection
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
  }
  emitTyping(channelId: string, content: string) {
    this.socket.emit('typing', JSON.stringify({ channelId, content }));
  }

  disconnect(){
    this.socket.disconnect()
  }

  connect(){
    this.socket.connect()
  }
}