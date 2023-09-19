import { Request } from 'express'
import jwt from 'jsonwebtoken'

import {
  CreateUserResponse,
  LoggedInUserData,
  LoginResponse,
  RefreshTokenValidateResponse,
} from './types'
import { User } from '../entity/User'
import { SignupDto } from '../dto'
import { DateTime } from 'luxon'
import bcrypt from 'bcrypt'
import { LoginDto } from '../dto/auth/login.dto'
import { RefreshToken } from '../entity/RefreshToken'
import { generateJwt } from '../utils/jwt-helpers'

const MAX_LOGGED_DEVICES = Number(process.env.MAX_LOGIN_ALLOWED) || 3

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || ''
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || ''
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '60s'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '1d'

export const signup = async (
  userDto: SignupDto
): Promise<CreateUserResponse> => {
  try {
    const { userName, email, firstName, lastName = '', password } = userDto

    // Check if user exists based on username or email
    const userExist = await User.findOne({
      where: [{ userName: userName }, { email: email }],
    })

    if (userExist) {
      return { errors: 'User with this email or username already exists' }
    }

    const currentDate = DateTime.now().setZone('UTC').toJSDate()
    const hashedPassword = await hashPassword(password)

    const user = User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      createdAt: currentDate,
      updatedAt: currentDate,
      lastLogin: currentDate,
    })

    await user.save()

    return { user }
  } catch (error) {
    console.error('Signup error:', error)
    throw new Error('An unexpected error occurred during signup.')
  }
}

export const login = async (
  { userName, password }: LoginDto,
  req: Request
): Promise<LoginResponse> => {
  try {
    const user = await validateUser({ userName, password })
    if (!user) return { status: 404, error: 'User Not Exist' }

    if (!(await isValidPassword(password, user.password))) {
      return { status: 401, error: 'Invalid Credentials' }
    }

    const token = generateJwt(
      user,
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_EXPIRES_IN
    )
    const clientIp = getIp(req)

    // Fetch existing refresh token
    let refreshTokenData = await findRefreshTokenForUserAndIp(user, clientIp)

    // If refresh token doesn't exist, check if we can create a new one
    if (!refreshTokenData) {
      if (await hasMaxLoggedDevices(user)) {
        return { error: 'Maximum logged devices reached', status: 405 }
      }
      refreshTokenData = await createNewRefreshToken(user, clientIp)
    }

    return {
      token,
      refreshToken: refreshTokenData.token,
      userData: { email: user.email, username: user.userName },
      status: 201,
    }
  } catch (error) {
    console.error('Login Service Error:', error)
    throw new Error('Error Occurred While verifying credentials')
  }
}

export const logout = async (refreshToken: string) => {
  // Invalidate the refresh token
  // Any other cleanup tasks when logging out
}

export const refreshToken = async (
  tokenFromCookies: string
): Promise<RefreshTokenValidateResponse> => {
  const refreshToken = await RefreshToken.findOne({
    where: {
      token: tokenFromCookies,
    },
    relations: ['user'],
  })

  const user = refreshToken ? refreshToken.user : null
  if (!user) return { errors: 'Invalid Token', status: 403 }

  // Validate the refresh token
  if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
    return { errors: 'Secret not provided', status: 500 }
  }
  return new Promise((resolve) => {
    jwt.verify(tokenFromCookies, REFRESH_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        resolve({ errors: 'Token verification failed', status: 400 })
        return
      }

      const { username } = decoded as LoggedInUserData

      if (user.userName !== username) {
        resolve({ errors: 'Invalid User', status: 400 })
        return
      }

      // If valid, generate a new JWT token and return it
      const accessToken = generateJwt(
        user,
        ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRES_IN
      )
      resolve({ errors: '', status: 201, token: accessToken })
    })
  })
}

// Helper Functions

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

const validateUser = async (dto: LoginDto) => {
  return User.findOne({ where: { userName: dto.userName } })
}

const isValidPassword = async (
  providedPassword: string,
  userPassword: string
) => {
  return bcrypt.compare(providedPassword, userPassword)
}

const hasMaxLoggedDevices = async (user: User) => {
  const count = await RefreshToken.count({ where: { user: { id: user.id } } })
  return count >= MAX_LOGGED_DEVICES
}

const findRefreshTokenForUserAndIp = async (user: User, ip: string) => {
  return await RefreshToken.findOne({
    where: { user: { id: user.id }, ipAddress: ip },
  })
}

const createNewRefreshToken = async (user: User, ip: string) => {
  const tokenValue = generateJwt(
    user,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN
  )
  const currentDate = DateTime.now().setZone('UTC').toJSDate()
  const expiryDate = DateTime.now().setZone('UTC').plus({ days: 1 }).toJSDate()

  const refreshToken = RefreshToken.create({
    token: tokenValue,
    user,
    ipAddress: ip,
    issuedAt: currentDate,
    expiresAt: expiryDate,
  })

  await refreshToken.save()
  return refreshToken
}

const getIp = (req: Request): string => {
  const forwardedIps = req.headers['x-forwarded-for']
  if (typeof forwardedIps === 'string') {
    return forwardedIps.split(',')[0].trim()
  } else if (Array.isArray(forwardedIps) && forwardedIps.length) {
    return forwardedIps[0].split(',')[0].trim()
  } else {
    return req.ip
  }
}
