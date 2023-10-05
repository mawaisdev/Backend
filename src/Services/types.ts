import { UserRole } from '../Config/UserRoles'
import { User } from '../Entity/User'
import { Request } from 'express'
import { ResetPasswordDto } from '../Dto/Auth/ResetPassword.Dto'
import { Comment } from '../Entity/Comment'

// User-related types.
export type LoggedInUserData = {
  userName: string
  email: string
  id: number
  roles?: UserRole
}

export type UserProfile = {
  firstName: string
  lastName: string
  userName: string
  email: string
  profilePicture?: string
  bio?: string
  lastLogin?: Date
  role: UserRole
}

export interface ExtendedRequest extends Request {
  user?: LoggedInUserData // You might have used another type here
}

// Auth-related types.
export type CreateUserResponse = {
  errors?: string
  user?: User
}

export type LoginResponse = {
  token?: string
  refreshToken?: string
  error?: string
  status?: number
  userData?: LoggedInUserData
}

export type RefreshTokenValidateResponse = {
  errors?: string
  status?: number
  token?: string
}

export type LogoutResponse = {
  errors?: string
}

export type PasswordResetResponse = {
  message?: string
}

export type CompleteResetResponse = {
  error?: string
  message?: string
}

export type ResetPasswordValidation = {
  errors: string[]
  dto: ResetPasswordDto
}

export type resetPasswordRequest = {
  email?: string
  token?: string
  password?: string
}

// Generic service response.
export type CategoryServiceResponse<T> = {
  status: number
  response?: string
  data?: T
}

export type CommentServiceResponse<T> = {
  status: number
  response: string
  data?: T
}
