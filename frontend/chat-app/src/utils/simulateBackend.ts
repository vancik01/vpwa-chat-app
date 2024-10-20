import { faker } from '@faker-js/faker';
import { Message } from 'src/components/models';

export function fetchMessages() {
  
  const messages = Array(10).fill(0).map(() => {
    const date = faker.date.recent();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const sent_at = `${hours}:${minutes}`;
  
    const object:Message = {
      type: 'message',
      message_content: faker.lorem.paragraph(),
      from: {
        display_name: faker.person.fullName(),
        nickname: faker.internet.userName(),
        status: faker.helpers.arrayElement(['online', 'offline', 'dnd']),
      },
      sent_at: sent_at,
    }
    return object
  })

  return messages
}
