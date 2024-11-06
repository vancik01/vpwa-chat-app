import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channel_user'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id')
      table.integer('channel_id').unsigned().references('channels.id')
      table.boolean('pending_invite').defaultTo(true)
      table.boolean('is_banned').defaultTo(false)
      table.integer('kick_count').defaultTo(0)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
