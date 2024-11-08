import Channel from '#models/channel'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelsController {
  // get all channels, where the user is member
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const channels = await Channel.query()
      .whereHas('members', (memberQuery) => {
        memberQuery.where('user_id', user.id).where('is_banned', false)
      })
      .select('id', 'name', 'channel_type', 'adminId')
      .preload('members', (q) => {
        q.pivotColumns(['pending_invite'])
        q.where('user_id', user.id)
      })

    var reuturnObj = channels.map((channel) => {
      var tmp = {
        id: channel.id,
        name: channel.name,
        channelType: channel.channelType,
        pendingInvite: channel.members[0].$extras.pivot_pending_invite,
        isAdmin: channel.adminId === user.id,
      }
      return tmp
    })
    response.send(reuturnObj)
  }

  async show({ params, response, auth }: HttpContext) {
    const { channelId } = params
    const user = auth.getUserOrFail()
    const channelExists = await Channel.query()
      .where('id', channelId)
      .whereHas('members', (memberQuery) => {
        memberQuery.where('user_id', user.id).where('is_banned', false)
      })
      .preload('members', (membersQuery) => {
        membersQuery
          .where('pending_invite', false)
          .where('is_banned', false)
          .select('nickname', 'first_name', 'last_name', 'status')
      })
      .preload('messages', (messagesQuery) => {
        messagesQuery
          .orderBy('created_at')
          .limit(10)
          .select('message_content', 'sender_id', 'created_at')
      })
      .firstOrFail()

    response.send(channelExists)
  }

  async store({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const body = request.body()
    const channel = await Channel.create({
      adminId: auth.getUserOrFail().$attributes.id,
      channelType: body.channelType,
      name: body.name,
    })

    channel.related('members').attach({
      [user.id]: {
        pending_invite: false,
      },
    })

    response.send(channel.$attributes)
  }

  async joinChannel({ params, request, response, auth }: HttpContext) {
    console.log('join channel', auth)
  }

  async leaveChannel({ params, request, response, auth }: HttpContext) {
    console.log('join channel', auth)
  }

  async joinChannel({ params, request, response, auth }: HttpContext) {
    console.log('join channel', auth)
  }
}
