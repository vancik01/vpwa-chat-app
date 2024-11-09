import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Channel from './channel.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare senderId: number

  @column()
  declare channelId: string

  @column()
  declare messageContent: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasOne(() => Channel, { localKey: 'channelId', foreignKey: 'id' })
  public channel: HasOne<typeof Channel>

  @hasOne(() => User, { localKey: 'senderId', foreignKey: 'id' })
  public sender: HasOne<typeof User>
}
