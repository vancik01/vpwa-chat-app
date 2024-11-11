import {ApiChannelDetail, ApiMessage, ApiChannelsList} from 'src/contracts'
import type { AxiosResponse} from 'axios';
import { api } from 'src/boot/axios';

class ChannelService {
    async leaveChannel(channelId: string): Promise<AxiosResponse> {
        const response = await api.delete(`/channels/${channelId}`);
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

    async sendMessage(channelId: string, content:string): Promise<AxiosResponse> {
      const response = await api.post(`/channels/${channelId}/messages/`, {
        messageContent: content
      })
      return response
    }

    async joinChannel(channelId: string): Promise<{message: string}> {
      const response = await api.post(`/channels/${channelId}`)
      return response.data
    }

    async createChannel(channelId: string, channelType: string): Promise<ApiChannelDetail> {
      const response = await api.post('/channels', { name: channelId, channelType: channelType })
      return response.data
    }

    async inviteToChannel(channelId: string, nickName: string): Promise<{message: string}> {
      const response = await api.post(`/channels/${channelId}/invite`, { invitedNickName: nickName})
      return response.data
    }
  }
  
export default new ChannelService();