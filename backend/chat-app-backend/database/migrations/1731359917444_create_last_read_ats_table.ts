import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channel_user'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dateTime('last_read_at').defaultTo(this.now())
      table.integer('unread_messages').defaultTo(0)
    })
  }
}
