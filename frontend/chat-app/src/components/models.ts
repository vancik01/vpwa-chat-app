export type User = {
  id: number,
  nickname: string,
  display_name: string,
  token: string | null,
  status: UserStatus,
  notificationsStatus: NotificationsStatus
}

export type UserCreateAccountProps = {
  first_name:string,
  last_name:string,
  nickname:string,
  email:string,
  password:string,
}

export type UserStatus = 'online' | 'dnd' | 'offline'
export type NotificationsStatus = 'all' | 'mentions'

export type ChannelMember = {
  display_name: string,
  id: number,
  nickname: string,
  status: UserStatus
}

export type WsChannelMember = {
  display_name: string,
  id: number,
  nickname: string,
  status: UserStatus,
  channelId: string
}

export type WsChannelDestroy = {
  channelId: string,
  reason: string
}

export type WsUserStatusChange = {
  userId: number,
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

export type WsMessage ={
  messageContent: string,
  senderId: number,
  channelId: string,
  sentAt: string
}

// export type WsMember = {}