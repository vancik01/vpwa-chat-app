import Channel from '#models/channel'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { faker } from '@faker-js/faker'

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
          channelType: faker.helpers.arrayElement(['private', 'public']),
          adminId: user.id,
          name: faker.company.buzzNoun(),
        })

        // Generate random member data and create members for the channel
        const membersData = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() => {
          const firstName = faker.person.firstName()
          const lastName = faker.person.lastName()
          const nickname = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
          return {
            first_name: firstName,
            last_name: lastName,
            email: faker.internet.email(),
            nickname,
            password: 'password',
          }
        })

        // Use createMany to insert all members at once
        await channel.related('members').createMany(membersData)
      }
    }
  }
}
