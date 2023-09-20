import { Router } from 'express'
import {
  signup,
  login,
  logout,
  refreshToken,
} from '../controller/Auth.Controller'

const authRouter = Router()

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.get('/logout', logout)
authRouter.get('/refresh-token', refreshToken)

export { authRouter }
