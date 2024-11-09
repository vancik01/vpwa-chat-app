export type User = {
  nickname: string,
  display_name: string,
  token: string | null,
  status: UserStatus
}

export type UserCreateAccountProps = {
  first_name:string,
  last_name:string,
  nickname:string,
  email:string,
  password:string,
}

export type UserStatus = 'online' | 'dnd' | 'offline'

export type ChannelMember = {
  display_name: string,
  id: number,
  nickname: string,
  status: UserStatus
}

export type ChannelType = 'private' | 'public'

export type Channel = {
  id:string,
  type: ChannelType,
  has_new_messages: number,
  is_someone_typing: boolean,
  user_typing: ChannelMember | null,
  is_admin: boolean
  // ...
}

export type ChannelDetail = {
  id:string,
  type: ChannelType,
  is_someone_typing: boolean,
  user_typing: ChannelMember | null,
  is_admin: boolean,
  // ...
}

export type MessageType = 'message' | 'system';
export type SystemMessageType = 'list' | 'invite';

export type TextMessage = {
    type: 'message';
    messageContent: string;
    from: ChannelMember | null;
    sent_at: string;
};

export type SystemMessage = {
    type: 'system';
    command_type:SystemMessageType;
    sent_at: string;
    invited_user?: string;
    channel_members?: ChannelMember[];
};

export type Message = TextMessage | SystemMessage;

// Api
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
