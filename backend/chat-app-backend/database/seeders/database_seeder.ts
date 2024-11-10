import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import moment from 'moment'

export default class extends BaseSeeder {
  async run() {
    // Create a few users initially
    const users = await User.createMany([
      {
        first_name: 'User',
        last_name: 'Name',
        email: 'user1@email.com',
        nickname: 'user_1',
        password: 'password',
      },
      {
        first_name: 'User',
        last_name: 'Name',
        email: 'user2@email.com',
        nickname: 'user_2',
        password: 'password',
      },
      {
        first_name: 'User',
        last_name: 'Name',
        email: 'user3@email.com',
        nickname: 'user_3',
        password: 'password',
      },
    ])

    for (const user of users) {
      // Create channels for each user sequentially
      for (let i = 0; i < 5; i++) {
        const channel = await Channel.create({
          id: `${faker.company.buzzNoun().toLowerCase().replace(/\s+/g, '_')}_${faker.number.int({ min: 1, max: 100 })}`,
          channelType: faker.helpers.arrayElement(['private', 'public']),
          adminId: user.id,
        })

        channel.related('members').attach({
          [user.id]: {
            pending_invite: false,
          },
        })

        // Generate random member data and create members for the channel
        const membersData = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() => {
          const firstName = faker.person.firstName()
          const lastName = faker.person.lastName()
          const nickname = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
          return {
            first_name: firstName,
            last_name: lastName,
            email: faker.internet.email().toLowerCase(),
            nickname,
            password: 'password',
          }
        })
        var currentDate = moment()
        // Use createMany to insert all members at once
        const members = await channel.related('members').createMany(
          membersData,
          membersData.map(() => ({ pending_invite: false }))
        )
        for (let j = 0; j < 100; j++) {
          var mention = '@' + faker.helpers.arrayElement(members).$getAttribute('nickname') + ' '
          var randomMinutes = faker.number.int({ min: 1, max: 10000 })
          const createdAt = currentDate.subtract(randomMinutes, 'seconds')
          currentDate = createdAt
          var messageContent =
            `${faker.datatype.boolean() ? mention : ''}` +
            faker.lorem.paragraphs(faker.number.int({ min: 1, max: 10 }))

          await Message.create({
            channelId: channel.id,
            messageContent: messageContent,
            senderId: faker.helpers.arrayElement(members).id,
            createdAt: DateTime.fromJSDate(createdAt.toDate()),
          })
        }
      }
    }
  }
}
