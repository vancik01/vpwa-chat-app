/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const ChannelsController = () => import('#controllers/channels_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/register', [AuthController, 'register']).as('auth.register')
router.post('/login', [AuthController, 'login']).as('auth.login')
router.delete('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())

router.get('/user', [AuthController, 'userData']).as('auth.user').use(middleware.auth())

router.get('/channels', [ChannelsController, 'index']).use(middleware.auth())
router.post('/channels', [ChannelsController, 'store']).use(middleware.auth())
router.get('/channels/:channelId', [ChannelsController, 'show']).use(middleware.auth())
