import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

const MessageType = {
  SYSTEM: 'system',
  MESSAGE: 'message',
}

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare authorId: number

  @column()
  declare channelId: number

  @column()
  declare messageContent: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  static get MessageType() {
    return MessageType
  }
}
