export type User = {
  nickname: string,
  display_name: string,
  token: string,
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
  nickname: string,
  status: UserStatus
}

export type Channel = {
  id:string,
  type: 'private' | 'public',
  has_new_messages: number,
  channel_members: ChannelMember[],
  is_someone_typing: boolean,
  user_typing: ChannelMember | null,
  admin_id: User['nickname']
  // ...
}

export type MessageType = 'message' | 'system';
export type SystemMessageType = 'list';

export type TextMessage = {
    type: 'message';
    message_content: string;
    from: ChannelMember;
    sent_at: string;
};

export type SystemMessage = {
    type: 'system';
    command_type:SystemMessageType;
    sent_at: string;
};

export type Message = TextMessage | SystemMessage;