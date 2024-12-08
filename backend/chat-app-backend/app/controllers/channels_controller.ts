import Channel from '#models/channel'
import Message from '#models/message'
import User from '#models/user'
import Kick from '#models/kicks'
import type { HttpContext } from '@adonisjs/core/http'
import ws from '../../services/ws.js'
import { DateTime } from 'luxon'

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
        q.pivotColumns(['pending_invite', 'last_read_at'])
        q.where('user_id', user.id)
      })

    var reuturnObj = await Promise.all(
      channels.map(async (channel) => {
        const lastReadAt =
          channel.members[0].$extras.pivot_last_read_at || DateTime.fromSQL('1970-01-01').toSQL()

        await channel.loadCount('messages', (q) => {
          q.where('createdAt', '>', lastReadAt)
        })

        var tmp = {
          id: channel.id,
          channelType: channel.channelType,
          pendingInvite: channel.members[0].$extras.pivot_pending_invite,
          isAdmin: channel.adminId === user.id,
          unreadMessagesCount: channel.$extras.messages_count || 0,
        }
        return tmp
      })
    )

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
      .first()

    if (!channel) {
      response.status(403).send({ message: 'Unauthorized' })
      return
    }

    await channel.related('members').sync(
      {
        [user.id]: {
          last_read_at: DateTime.now().toSQL(),
          unread_messages: 0,
        },
      },
      false
    )

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
    const user = await auth.getUserOrFail()

    // Fetch the channel and the user's `last_read_at` for this channel
    const channel = await Channel.query()
      .where('id', channelId)
      .whereHas('members', (memberQuery) => {
        memberQuery
          .where('user_id', user.id)
          .where('pending_invite', false)
          .where('is_banned', false)
      })
      .preload('members', (memberQuery) => {
        memberQuery.where('user_id', user.id).pivotColumns(['last_read_at'])
      })
      .firstOrFail()

    // Retrieve `last_read_at` from the pivot table
    const lastReadAt = channel.members[0].$extras.pivot_last_read_at || DateTime.now().toSQL()

    // Preload only messages created before `last_read_at`
    await channel.load('messages', (messageQuery) => {
      messageQuery
        .where('createdAt', '<', lastReadAt) // Filter messages before `last_read_at`
        .orderBy('createdAt', 'desc')
        .offset(page * perPage)
        .limit(perPage)
        .select(['messageContent', 'senderId', 'createdAt'])
    })

    // Reverse messages for chronological order and send response
    response.send(channel.messages.reverse())
  }

  async joinChannel({ params, response, auth }: HttpContext) {
    const user = await auth.getUserOrFail()
    const { channelId } = params

    const channel = await Channel.query().where('id', channelId).first()

    if (!channel) {
      const newChannel = await createChannel(channelId, 'public', user.id)
      return response.send({ message: `Channel ${channelId} created` })
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
      await channel.related('members').sync(
        {
          [user.id]: {
            pending_invite: false,
          },
        },
        false
      )
      await ws.notifyChannelUserJoined(channel.id, user.id)
      return response.send({ message: `Successfully joined channel: ${channelId}` })
    }

    await channel.related('members').attach({
      [user.id]: {
        pending_invite: false,
        is_banned: false,
        kick_count: 0,
      },
    })
    await ws.notifyChannelUserJoined(channel.id, user.id)
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
      ws.notifyChannelDestroyed(channelId, user.id)
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
    const { invitedNickName } = request.body()
    const invited = await User.query().where('nickname', invitedNickName).first()

    if (!invited) {
      return response.notFound({ message: `User ${invitedNickName} not found` })
    }

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
        await Kick.query().where('user_id', invited.id).where('channel_id', channelId).delete()
        await channel.related('members').sync(
          {
            [invited.id]: {
              pending_invite: true,
              is_banned: false,
              kick_count: 0,
            },
          },
          false
        )
        await ws.sendMessageToUser(invited.id, 'invitation', {
          id: channelId,
          channelType: channel.channelType,
          pendingInvite: true,
          isAdmin: false,
          unreadMessagesCount: 0,
        })
        return response.send({ message: 'User invited successfully' })
      }
      await channel.related('members').attach({
        [invited.id]: {
          pending_invite: true,
          is_banned: false,
          kick_count: 0,
        },
      })

      await ws.sendMessageToUser(invited.id, 'invitation', {
        id: channelId,
        channelType: channel.channelType,
        pendingInvite: true,
        isAdmin: false,
        unreadMessagesCount: 0,
      })

      return response.send({ message: 'User invited successfully' })
    } else {
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
        await Kick.query().where('user_id', invited.id).where('channel_id', channelId).delete()
        await channel.related('members').sync(
          {
            [invited.id]: {
              pending_invite: true,
              is_banned: false,
              kick_count: 0,
            },
          },
          false
        )
        await ws.sendMessageToUser(invited.id, 'invitation', {
          id: channelId,
          channelType: channel.channelType,
          pendingInvite: true,
          isAdmin: false,
          unreadMessagesCount: 0,
        })
        return response.send({ message: 'User invited successfully' })
      }
      await channel.related('members').attach({
        [invited.id]: {
          pending_invite: true,
          is_banned: false,
          kick_count: 0,
        },
      })

      await ws.sendMessageToUser(invited.id, 'invitation', {
        id: channelId,
        channelType: channel.channelType,
        pendingInvite: true,
        isAdmin: false,
        unreadMessagesCount: 0,
      })
      return response.send({ message: 'User invited successfully' })
    }
  }

  async kickFromChannel({ params, request, response, auth }: HttpContext) {
    const user = await auth.getUserOrFail()
    const { channelId } = params
    const { kickedNickName } = request.body()

    const kicked = await User.query().where('nickname', kickedNickName).first()
    if (!kicked) {
      return response.notFound({ message: `User ${kickedNickName} not found` })
    }

    const channel = await Channel.query().where('id', channelId).first()
    if (!channel) {
      return response.notFound({ message: `Channel ${channelId} not found` })
    }

    const isMember = await channel
      .related('members')
      .query()
      .where('user_id', kicked.id)
      .andWherePivot('is_banned', false)
      .first()

    const isBanned = await channel
      .related('members')
      .query()
      .where('user_id', kicked.id)
      .andWherePivot('is_banned', true)
      .first()

    if (!isMember) {
      return response.badRequest({ message: 'User is not a member of the channel' })
    }

    if (isBanned) {
      return response.badRequest({ message: 'User is already banned from the channel' })
    }

    if (kicked.id === channel.adminId) {
      return response.forbidden({ message: 'Admin cannot be kicked' })
    }

    if (kicked.id === user.id) {
      return response.forbidden({ message: 'You cannot kick yourself' })
    }

    if (channel.channelType === 'private') {
      if (channel.adminId !== user.id) {
        return response.forbidden({ message: 'Only admin of the channel can kick users' })
      }
      await channel.related('members').sync(
        {
          [kicked.id]: {
            pending_invite: false,
            is_banned: true,
            kick_count: 0,
          },
        },
        false
      )
      ws.sendMessageToUser(kicked.id, 'channel_destroyed', {
        channelId: channel.id,
        reason: `You've been banned from channel ${channel.id}`,
      })
      return response.send({ message: 'User banned successfully' })
    } else {
      if (channel.adminId === user.id) {
        await channel.related('members').sync(
          {
            [kicked.id]: {
              pending_invite: false,
              is_banned: true,
              kick_count: 0,
            },
          },
          false
        )
        ws.sendMessageToUser(kicked.id, 'channel_destroyed', {
          channelId: channel.id,
          reason: `You've been banned from channel ${channel.id}`,
        })
        return response.send({ message: 'User banned successfully' })
      }
      const alreadyKicked = await Kick.query()
        .where('user_id', kicked.id)
        .where('kicked_by', user.id)
        .where('channel_id', channelId)
        .first()

      if (alreadyKicked) {
        return response.badRequest({
          message: `You already kicked user ${kickedNickName} from the channel`,
        })
      }
      await Kick.create({
        userId: kicked.id,
        kickedBy: user.id,
        channelId: channelId,
      })
      await channel.related('members').sync(
        {
          [kicked.id]: {
            pending_invite: false,
            is_banned: false,
            kick_count: ++isMember.$extras.pivot_kick_count,
          },
        },
        false
      )

      if (isMember.$extras.pivot_kick_count >= 3) {
        await channel.related('members').sync(
          {
            [kicked.id]: {
              pending_invite: false,
              is_banned: true,
              kick_count: 0,
            },
          },
          false
        )
        ws.sendMessageToUser(kicked.id, 'channel_destroyed', {
          channelId: channel.id,
          reason: `You've been banned from channel ${channel.id}`,
        })
        return response.send({ message: 'User banned from channel' })
      }
      ws.sendMessageToUser(kicked.id, 'kicked', {
        channelId: channel.id,
        reason: `You've been kicked in channel ${channel.id}`,
      })
      return response.send({ message: 'User kicked successfully' })
    }
  }
}

export async function deleteChannel(channelId: string): Promise<void> {
  const channel = await Channel.findOrFail(channelId)
  await channel.related('members').detach()
  await channel.related('messages').query().delete()
  await channel.delete()
}

async function createChannel(
  channelId: string,
  channelType: string,
  adminId: number
): Promise<Channel> {
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
