import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import type { HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

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
  })
  public members: ManyToMany<typeof User>
}