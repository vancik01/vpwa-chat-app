import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    first_name: vine.string(),
    last_name: vine.string(),
    nickname: vine
      .string()
      .regex(/^[a-z0-9_]+$/)
      .unique(async (db, value) => {
        const match = await db.from('users').select('nickname').where('nickname', value)
        return match.length === 0
      }),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const match = await db.from('users').select('email').where('email', value)
        return match.length === 0
      }),
    password: vine.string(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().normalizeEmail(),
    password: vine.string(),
  })
)
