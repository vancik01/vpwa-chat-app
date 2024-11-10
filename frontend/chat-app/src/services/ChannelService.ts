import {ApiChannelDetail, ApiMessage, ApiChannelsList} from 'src/contracts'
import type { AxiosResponse} from 'axios';
import { api } from 'src/boot/axios';

class ChannelService {
    async leaveChannel(channelId: string, userId: number): Promise<AxiosResponse> {
        const response = await api.delete(`/channels/${channelId}`, { data: { userId } });
        return response.data;
    }
  
    async getChannelDetails(channelId: string): Promise<ApiChannelDetail>{
      const response = await api.get(`/channels/${channelId}`)
      return response.data
    }

    async getChannels(): Promise<ApiChannelsList[]> {
      const response = await api.get('/channels')
      return response.data
    }

    async loadMessages(channelId: string, page: number): Promise<ApiMessage[]> {
      const response = await api.get(`/channels/${channelId}/messages/${page}`)
      return response.data
    }
  }
  
export default new ChannelService();