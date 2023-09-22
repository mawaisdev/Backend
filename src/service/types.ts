import { ValidationError } from 'class-validator'
import { UserRole } from '../config/userRoles'
import { User } from '../entity/User'
import { Request } from 'express'
import { ResetPasswordDto } from '../dto/auth/resetPassword.dto'

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
  userName: string
  email: string
  roles?: UserRole
}

export type LogoutResponse = {
  errors?: string
}

export interface ExtendedRequest extends Request {
  user?: LoggedInUserData // You might have used another type here
}

export type PasswordResetResponse = {
  message?: string
}

export type CompleteResetResponse = {
  error?: string
  message?: string
}
export type resetPasswordRequest = {
  email?: string
  token?: string
  password?: string
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

export type ResetPasswordValidation = {
  errors: string[]
  dto: ResetPasswordDto
}
