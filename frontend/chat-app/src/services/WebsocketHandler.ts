import { Notify } from 'quasar';
import { Socket } from 'socket.io-client';
import { Message, WsChannelDestroy, WsChannelMember, WsMessage } from 'src/components/models';
import { ApiChannelsList } from 'src/contracts';
import { useChannelStore } from 'src/stores/channelStore';
import { useUserStore } from 'src/stores/userStore';

export function initWsConnection(socket:Socket){
    const userStore = useUserStore()
    const channelStore = useChannelStore()
    socket.on('connect', () => {

        socket.on('new_message', (data) => {
          const jsonData:WsMessage = JSON.parse(data)
          if(jsonData.channelId !== channelStore.current_channel?.id){
            const channel = userStore.channels.find((ch) => ch.id === jsonData.channelId)
            if(channel) channel.has_new_messages += 1
          } else {
            const newMessage:Message = {
                type:'message',
                sent_at: jsonData.sentAt,
                messageContent: jsonData.messageContent,
                from: channelStore.members.find((member) => member.id === jsonData.senderId) || null,   
            }
            channelStore.newMessage(newMessage)
          }
        })

        socket.on('invitation', (data) => {
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

        socket.on('user_joined', (data) => {
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

        socket.on('channel_destroyed', (data) => {
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
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

}