import Channel from '#models/channel'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelsController {
  isChannelIdValid(input: string): boolean {
    const regex = /^[A-Z0-9_]+$/
    return regex.test(input)
  }
  // get all channels, where the user is member
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const channels = await Channel.query()
      .whereHas('members', (memberQuery) => {
        memberQuery.where('user_id', user.id).where('is_banned', false)
      })
      .select('id', 'channel_type', 'adminId')
      .preload('members', (q) => {
        q.pivotColumns(['pending_invite'])
        q.where('user_id', user.id)
      })

    var reuturnObj = channels.map((channel) => {
      var tmp = {
        id: channel.id,
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
    const channel = await Channel.query()
      .where('id', channelId)
      .select(['id', 'channel_type', 'admin_id'])
      .whereHas('members', (memberQuery) => {
        memberQuery.where('user_id', user.id).where('is_banned', false)
      })
      .preload('members', (membersQuery) => {
        membersQuery
          .where('pending_invite', false)
          .where('is_banned', false)
          .select('nickname', 'first_name', 'last_name', 'status')
      })
      .firstOrFail()

    response.send({
      id: channel.id,
      channel_type: channel.$attributes.channelType,
      is_admin: channel.$attributes.adminId === user.id,
      members: channel.members.map((member) => ({
        id: member.id,
        status: member.status,
        display_name: `${member.first_name} ${member.last_name}`,
        nickname: member.nickname,
      })),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const body = request.body()
    if (body.name && this.isChannelIdValid(body.name)) {
      const channel = await Channel.create({
        id: body.name,
        adminId: auth.getUserOrFail().$attributes.id,
        channelType: body.channelType,
      })

      channel.related('members').attach({
        [user.id]: {
          pending_invite: false,
        },
      })

      response.send(channel.$attributes)
    }
    response.notFound()
  }

  async getMessages({ auth, params, response }: HttpContext) {
    const perPage = 20
    const { channelId, page } = params
    const user = auth.getUserOrFail()

    const channel = await Channel.query()
      .where('id', channelId)
      .whereHas('members', (memberQuery) => {
        memberQuery
          .where('user_id', user.id)
          .where('pending_invite', false)
          .where('is_banned', false)
      })
      .preload('messages', (q) => {
        q.orderBy('createdAt', 'desc')
          .offset(page * perPage)
          .limit(perPage)
          .select(['messageContent', 'senderId', 'createdAt'])
      })
      .firstOrFail()

    response.send(channel.messages.reverse())
  }

  // async joinChannel({ params, request, response, auth }: HttpContext) {
  //   console.log('join channel', auth)
  // }

  async leaveChannel({ params, request, response, auth }: HttpContext) {
    const user = await auth.getUserOrFail()
    const { channelId } = params
    const { userId } = request.body()

    const channel = await Channel.query()
      .where('id', channelId)
      .whereHas('members', (memberQuery) => memberQuery.where('user_id', userId))
      .first()

    if (!channel) {
      return response.notFound({ message: 'User is not a member of this channel.' })
    }

    await channel.related('members').detach([userId])

    if (channel.adminId === userId) {
      await deleteChannel(channelId)
    }

    response.send({ message: 'User has left the channel.' })
  }

  // ...
}

async function deleteChannel(channelId: string): Promise<void> {
  const channel = await Channel.findOrFail(channelId)
  await channel.related('members').detach()
  await channel.related('messages').query().delete()
  await channel.delete()
}
