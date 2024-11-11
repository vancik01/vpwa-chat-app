import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import ws from '../../services/ws.js'


export default class ChannelsController {
  isChannelIdValid(input: string): boolean {
    const regex = /^[a-zA-Z0-9_]+$/
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
    const channelExists = await Channel.query().where('id', body.name).first()

    if (channelExists) {
      response.badRequest()
    }
    if (body.name && this.isChannelIdValid(body.name)) {
      const channel = await createChannel(body.name, body.channelType, user.id)
      response.send(channel.$attributes)
    }
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

  async joinChannel({ params, response, auth }: HttpContext) {
    const user = await auth.getUserOrFail()
    const { channelId } = params

    const channel = await Channel.query().where('id', channelId).first()

    if (!channel) {
      const newChannel =  await createChannel(channelId, 'public', user.id)
      return response.send({ message: `Channel ${channelId} created`})
    }

    const isBanned = await channel
      .related('members')
      .query()
      .where('user_id', user.id)
      .andWherePivot('is_banned', true)
      .first()

    if (isBanned) {
      return response.forbidden({ message: 'You are banned from this channel!' })
    }

    const isMember = await channel
      .related('members')
      .query()
      .where('user_id', user.id)
      .andWherePivot('pending_invite', false)
      .first()

    if (isMember) {
      return response.badRequest({ message: `You are already a member of channel: ${channelId}` })
    }

    const isInvited = await channel
      .related('members')
      .query()
      .where('user_id', user.id)
      .andWherePivot('pending_invite', true)
      .first()

    if (channel.channelType === 'private' && !isInvited) {
      return response.forbidden({ message: 'This channel is private!' })
    }

    if (isInvited) {
      await channel.related('members').sync({
        [user.id]: {
          pending_invite: false,
        },
      }, false)
      return response.send({ message: `Successfully joined channel: ${channelId}` })
    }

    await channel.related('members').attach({
      [user.id]: {
        pending_invite: false,
        is_banned: false,
        kick_count: 0,
      },
    })

    return response.send({ message: `Successfully joined channel: ${channelId}` })
  }

  async leaveChannel({ params, response, auth }: HttpContext) {
    const user = await auth.getUserOrFail()
    const { channelId } = params

    const channel = await Channel.query()
      .where('id', channelId)
      .whereHas('members', (memberQuery) => memberQuery.where('user_id', user.id))
      .first()

    if (!channel) {
      return response.notFound({ message: 'User is not a member of this channel.' })
    }
    
    await channel.related('members').detach([user.id])

    if (channel.adminId === user.id) {
      await deleteChannel(channelId)
    }

    response.send({ message: 'User has left the channel.' })
  }

  async postMessage({ params, request, response, auth }: HttpContext) {
    const { channelId } = params
    const user = auth.getUserOrFail()
    const body = request.body()
    const { messageContent } = body
    const channel = await Channel.query()
      .where('id', channelId)
      .whereHas('members', (q) => {
        q.where('pending_invite', false).where('is_banned', false).where('user_id', user.id)
      })
      .firstOrFail()

    const message = await Message.create({
      channelId: channelId,
      messageContent,
      senderId: user.id,
    })
    ws.notifyChannelNewMessage(channelId, message)
  }

  async inviteToChannel({ params, request, response, auth }: HttpContext) {
    const user = await auth.getUserOrFail()
    const { channelId } = params
    const {invitedNickName }= request.body()
    const invited = await User.query().where('nickname', invitedNickName).firstOrFail()

    const channel = await Channel.query().where('id', channelId).first()
    if (!channel) {
      return response.notFound({ message: `Channel ${channelId} not found` })
    }

    const isMember = await channel
      .related('members')
      .query()
      .where('user_id', invited.id)
      .andWherePivot('pending_invite', false)
      .andWherePivot('is_banned', false)
      .first()

    const isInvited = await channel
      .related('members')
      .query()
      .where('user_id', invited.id)
      .andWherePivot('pending_invite', true)
      .first()

    const isBanned = await channel
      .related('members')
      .query()
      .where('user_id', invited.id)
      .andWherePivot('is_banned', true)
      .first()

    if (channel.channelType === 'private') {
      if (channel.adminId !== user.id) {
        return response.forbidden({ message: 'Only admin of the channel can invite users' })
      }
      if (isMember) {
        return response.badRequest({ message: 'User is already a member of the channel' })
      }
      if (isInvited) {
        return response.badRequest({ message: 'User is already invited to the channel' })
      }
      if (isBanned) {
        await channel.related('members').sync({
          [invited.id]: {
            pending_invite: true,
            is_banned: false,
            kick_count: 0,
          },
        }, false);
        return response.send({ message: 'User invited successfully' })
      }
      await channel.related('members').attach({
        [invited.id]: {
          pending_invite: true,
          is_banned: false,
          kick_count: 0,
        },
      });
      return response.send({ message: 'User invited successfully' })
    }
    else {
      if (isMember) {
        return response.badRequest({ message: 'User is already a member of the channel' })
      }
      if (isInvited) {
        return response.badRequest({ message: 'User is already invited to the channel' })
      }
      if (isBanned && channel.adminId !== user.id) {
        return response.forbidden({ message: 'User is banned from the channel' })
      }
      if (isBanned && channel.adminId === user.id) {
        await channel.related('members').sync({
          [invited.id]: {
            pending_invite: true,
            is_banned: false,
            kick_count: 0,
          },
        }, false)
        return response.send({ message: 'User invited successfully' })
      }
      await channel.related('members').attach({
        [invited.id]: {
          pending_invite: true,
          is_banned: false,
          kick_count: 0,
        },
      })
      return response.send({ message: 'User invited successfully' })
    }
  }
}

async function deleteChannel(channelId: string): Promise<void> {
  const channel = await Channel.findOrFail(channelId)
  await channel.related('members').detach()
  await channel.related('messages').query().delete()
  await channel.delete()
}

async function createChannel(channelId: string, channelType: string, adminId: number): Promise<Channel> {
    const channel = await Channel.create({
      id: channelId,
      adminId: adminId,
      channelType: channelType,
    })

    channel.related('members').attach({
      [adminId]: {
        pending_invite: false,
        is_banned: false,
        kick_count: 0,
      },
    })
    return channel
}