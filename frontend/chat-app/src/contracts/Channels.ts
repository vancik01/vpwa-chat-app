import { ChannelMember } from 'src/components/models'

export type ApiChannelsList = {
    id: string
    channelType: 'public' | 'private'
    pendingInvite: boolean
    isAdmin: boolean
  }
  
  export type ApiChannelDetail = {
    id: string,
    channelType: 'public' | 'private',
    is_admin: boolean,
    members: ChannelMember[]
  }
  
  export type ApiMessage = {
    messageContent: string,
    senderId: number,
    channelId: string,
    createdAt: string
  }