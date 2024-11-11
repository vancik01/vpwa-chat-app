import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kicks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      
      table.string('channel_id').notNullable()
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')

      table.integer('kicked_by').unsigned().notNullable()
        .references('id')
        .inTable('users')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'kicked_by', 'channel_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}