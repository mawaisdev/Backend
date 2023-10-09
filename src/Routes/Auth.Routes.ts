import { Router } from 'express'
import { AuthService } from '../Services/Auth.Service'
import { AuthController } from '../Controller/Auth.Controller'
import { AppDataSource } from '../data-source'
import { User } from '../Entity/User'
import { RefreshToken } from '../Entity/RefreshToken'

const authRouter = Router()
const userRepository = AppDataSource.getRepository(User)
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
const authService = new AuthService(userRepository, refreshTokenRepository)
const { signup, login, logout, refreshToken, passwordReset } =
  new AuthController(authService)

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.get('/logout', logout)
authRouter.get('/refresh-token', refreshToken)
authRouter.post('/reset-password', passwordReset)

export { authRouter }
