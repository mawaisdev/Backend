import { Router } from 'express'
import { AuthService } from '../service/authService'
import { AuthController } from '../controller/Auth.Controller'

const authRouter = Router()
const authService = new AuthService()
const { signup, login, logout, refreshToken } = new AuthController(authService)

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.get('/logout', logout)
authRouter.get('/refresh-token', refreshToken)

export { authRouter }
