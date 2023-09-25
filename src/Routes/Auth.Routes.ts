import { Router } from 'express'
import { AuthService } from '../Services/Auth.Service'
import { AuthController } from '../Controller/Auth.Controller'

const authRouter = Router()
const authService = new AuthService()
const { signup, login, logout, refreshToken, passwordReset } =
  new AuthController(authService)

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.get('/logout', logout)
authRouter.get('/refresh-token', refreshToken)
authRouter.post('/reset-password', passwordReset)

export { authRouter }
