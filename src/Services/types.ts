import { UserRole } from '../Config/UserRoles'
import { User } from '../Entity/User'
import { Comment } from '../Entity/Comment'
import { Request } from 'express'
import { ResetPasswordDto } from '../Dto/Auth/ResetPassword.Dto'

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
  user?: LoggedInUserData
}

// Auth-related types.
export type CompleteResetResponse = {
  error?: string
  message?: string
}

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

export type LogoutResponse = {
  errors?: string
}

export type PasswordResetResponse = {
  message?: string
}

export type RefreshTokenValidateResponse = {
  errors?: string
  status?: number
  token?: string
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

// Comment-related types.
export type CommentServiceResponse<T> = {
  status: number
  response: string
  data?: T
}

export interface CommentsDbResponse extends Comment {
  childcount: number
}

// Generic service response.
export type CategoryServiceResponse<T> = {
  status: number
  response?: string
  data?: T
}
