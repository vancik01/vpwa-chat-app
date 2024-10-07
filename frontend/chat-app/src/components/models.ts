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
  user_typing: ChannelMember | null
  // ...
}

export type Message = {
  type: 'system' | 'message',
  message_content: string,
  from: ChannelMember,
  sent_at: string
}