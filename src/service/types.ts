import { User } from '../entity/User'

export type CreateUserResponse = {
  errors?: string
  user?: User
}

export type LoginResponse = {
  token: string
  refreshToken?: string
  error?: string
  status?: number
  userData?: LoggedInUserData
}

export type LoggedInUserData = {
  username: string
  email: string
}
