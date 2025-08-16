/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router
  .group(() => {
    router.post('/auth/register', '#controllers/auth_controller.register')
    router.post('/auth/login', '#controllers/auth_controller.login')
    router.post('/auth/logout', '#controllers/auth_controller.logout').use(middleware.auth())
    router.get('/auth/me', '#controllers/auth_controller.me').use(middleware.auth())
  })
  .prefix('api')
