import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('message_content').notNullable()
      table.enum('type', ['system', 'message']).notNullable()

      table.timestamp('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
