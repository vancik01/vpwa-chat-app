import app from '@adonisjs/core/services/app'
import ws from '../services/ws.js'
app.ready(() => {
  ws.boot()
})
