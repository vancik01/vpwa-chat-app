import { Channel, Message } from 'src/components/models';
import { isMentionedInMessage, stripHtml, truncateMessage } from 'src/utils/stringParsers';
import { AppVisibility } from 'quasar'
import { useUserStore } from 'src/stores/userStore';

class NotificationsService {

  async notifyNewMessage(message: Message, channel:Channel, from:string){
    const {user} = useUserStore()
    if(user?.status !== 'offline'){
      if(message.type === 'message'){
        if(user?.notificationsStatus === 'mentions' && !isMentionedInMessage(message.messageContent, user.nickname)){
          return
        }
        const body = truncateMessage(stripHtml(message.messageContent))
        this.showNotification(
          `(${channel.id}) ${from}:`,
          body,
          `/channel/${channel.id}`
        )
      }
    }
  }

  async requestPermissions(){
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notifications permission granted!');
      } else {
        console.log('Notifications permission denied!');
      }
    }
  }

  async showNotification(title:string, body:string, url:string) {
    if (Notification.permission === 'denied') {
      console.log('Notifications are denied by the user.');
      return;
    }
  
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notifications permission granted!');
      } else {
        console.log('Notifications permission denied!');
      }
    }

    if(AppVisibility.appVisible){
      return
    }

    const notification = new Notification(title, {
      body,
    });
    if (url) {
      notification.onclick = () => {
        window.open(url);
      };
    }
  }
}

export default new NotificationsService();

