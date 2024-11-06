import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', ['online', 'dnd', 'offline']).defaultTo('online')
      table.enum('notifications_status', ['all', 'only_mentions']).defaultTo('all')
    })
  }

  async down() {}
}
