import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Channel from './channel.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'

const MessageType = {
  SYSTEM: 'system',
  MESSAGE: 'message',
}

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare senderId: number

  @column()
  declare channelId: number

  @column()
  declare messageContent: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasOne(() => Channel, { localKey: 'channelId', foreignKey: 'id' })
  public channel: HasOne<typeof Channel>

  @hasOne(() => User, { localKey: 'senderId', foreignKey: 'id' })
  public sender: HasOne<typeof User>
}
