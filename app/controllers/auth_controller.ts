import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { registerValidator, loginValidator } from '#validators/auth_validator'

export default class AuthController {
  /**
   * Регистрация нового пользователя
   */
  async register({ request, response, auth }: HttpContext) {
    try {
      const data = await registerValidator.validate(request.body())
      const { email, password, login } = data

      // Проверяем, существует ли пользователь с таким email
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return response.status(400).json({
          error: 'Пользователь с таким email уже существует',
        })
      }

      // Создаем нового пользователя
      const user = await User.create({
        email,
        password,
        login,
      })

      // Авторизуем пользователя после регистрации
      await auth.use('web').login(user)

      return response.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          error: 'Ошибка валидации данных',
          details: error.message,
        })
      }
      return response.status(500).json({
        error: 'Ошибка при создании пользователя',
      })
    }
  }

  /**
   * Авторизация пользователя
   */
  async login({ request, response, auth }: HttpContext) {
    try {
      const data = await loginValidator.validate(request.body())
      const { email, password } = data

      // Находим пользователя по email
      const user = await User.findBy('email', email)
      if (!user) {
        return response.status(401).json({
          error: 'Неверный email или пароль',
        })
      }

      // Проверяем пароль
      const isValidPassword = await hash.verify(user.password, password)
      if (!isValidPassword) {
        return response.status(401).json({
          error: 'Неверный email или пароль',
        })
      }

      // Авторизуем пользователя
      await auth.use('web').login(user)

      return response.json({
        message: 'Успешная авторизация',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          error: 'Ошибка валидации данных',
          details: error.message,
        })
      }
      return response.status(401).json({
        error: 'Неверный email или пароль',
      })
    }
  }

  /**
   * Выход пользователя
   */
  async logout({ response, auth }: HttpContext) {
    try {
      await auth.use('web').logout()

      return response.json({
        message: 'Успешный выход из системы',
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Ошибка при выходе из системы',
      })
    }
  }

  /**
   * Получение информации о текущем пользователе
   */
  async me({ response, auth }: HttpContext) {
    try {
      const user = auth.user

      if (!user) {
        return response.status(401).json({
          error: 'Пользователь не авторизован',
        })
      }

      return response.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
        },
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Ошибка при получении информации о пользователе',
      })
    }
  }
}
