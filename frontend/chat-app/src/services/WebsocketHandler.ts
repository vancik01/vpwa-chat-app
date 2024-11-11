import { Socket } from 'socket.io-client';
import { Message, WsMessage } from 'src/components/models';
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
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

}