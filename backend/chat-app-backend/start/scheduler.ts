import { deleteChannel } from '#controllers/channels_controller'
import Channel from '#models/channel'
import scheduler from 'adonisjs-scheduler/services/main'
import { DateTime } from 'luxon' // AdonisJS uses Luxon for date manipulation

scheduler
  .call(async () => {
    console.log('Maintenance task started 🚀')

    // Calculate the date 30 days ago
    const dateThreshold = DateTime.now().minus({ days: 30 }).toISO()

    // Query for channels where all messages are older than 30 minutes
    const channels = await Channel.query().whereDoesntHave('messages', (q) => {
      q.where('createdAt', '>=', dateThreshold)
    })

    console.log(channels.length)

    console.log(`Found ${channels.length} channels with messages older than 30 days`)
    console.log('Deleting channels 💪')
    Promise.all(
      channels.map(async (channel) => {
        await deleteChannel(channel.id)
      })
    )
  })
  .cron('0 0 */30 * *')
