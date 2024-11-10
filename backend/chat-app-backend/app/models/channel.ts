import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Message from './message.js'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare channelType: string // Store as a string to hold 'private' or 'public'

  @column()
  declare adminId: number

  @hasOne(() => User, { localKey: 'adminId', foreignKey: 'id' })
  public admin: HasOne<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'channel_user',
    localKey: 'id',
    pivotForeignKey: 'channel_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
    pivotColumns: ['pending_invite', 'is_banned', 'kick_count'],
  })
  public members: ManyToMany<typeof User>

  @hasMany(() => Message, { foreignKey: 'channelId' })
  public messages: HasMany<typeof Message>
}
