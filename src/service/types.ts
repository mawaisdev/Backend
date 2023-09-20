import { User } from '../entity/User'
import { Request } from 'express'

export type CreateUserResponse = {
  errors?: string
  user?: User
}

export type RefreshTokenValidateResponse = {
  errors?: string
  status?: number
  token?: string
}

export type LoginResponse = {
  token?: string
  refreshToken?: string
  error?: string
  status?: number
  userData?: LoggedInUserData
}

export type LoggedInUserData = {
  username: string
  email: string
}

export type LogoutResponse = {
  errors?: string
}

export interface ExtendedRequest extends Request {
  user?: LoggedInUserData // You might have used another type here
}
