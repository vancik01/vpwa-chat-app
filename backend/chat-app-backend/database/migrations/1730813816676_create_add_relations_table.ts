import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('channels', (table) => {
      table.integer('admin_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
    })
    this.schema.alterTable('messages', (table) => {
      table.integer('sender_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table
        .integer('channel_id')
        .unsigned()
        .notNullable()
        .references('channels.id')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable('messages', (table) => {
      table.dropForeign(['sender_id'])
      table.dropForeign(['channel_id'])
    })
    this.schema.alterTable('channels', (table) => {
      table.dropForeign(['admin_id'])
    })
  }
}
