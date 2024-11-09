import type { AxiosResponse} from 'axios';
import { api } from 'src/boot/axios';

class ChannelService {
    async leaveChannel(channelId: string, userId: number): Promise<AxiosResponse> {
        const response = await api.delete(`/channels/${channelId}`, { data: { userId } });
        return response.data;
    }
  

  }
  
export default new ChannelService();