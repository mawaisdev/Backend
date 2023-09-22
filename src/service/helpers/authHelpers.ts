import { Request } from 'express'
import bcrypt from 'bcrypt'
import { DateTime } from 'luxon'
import {
  MAX_LOGGED_DEVICES,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from './constants'
import { generateJwt } from '../../utils/jwt-helpers'
import { LoginDto } from '../../dto/auth/login.dto'
import { RefreshToken } from '../../entity/RefreshToken'
import { User } from '../../entity/User'

/**
 * Hashes the provided password using bcrypt.
 *
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} - The hashed password.
 */
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

/**
 * Fetches a user based on the provided username.
 *
 * @param {LoginDto} dto - Data transfer object containing user credentials.
 * @returns {Promise<User | undefined>} - The found user or undefined.
 */
const validateUser = async (dto: LoginDto) => {
  return User.findOne({ where: { userName: dto.userName } })
}

/**
 * Compares the provided password with the stored hashed password.
 *
 * @param {string} providedPassword - The plain text password.
 * @param {string} userPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
const isValidPassword = async (
  providedPassword: string,
  userPassword: string
): Promise<boolean> => {
  return bcrypt.compare(providedPassword, userPassword)
}

/**
 * Checks if the user has reached their device limit.
 *
 * @param {User} user - The authenticated user.
 * @returns {Promise<boolean>} - True if the limit is reached, false otherwise.
 */
const hasMaxLoggedDevices = async (user: User): Promise<boolean> => {
  const count = await RefreshToken.count({ where: { user: { id: user.id } } })
  return count >= MAX_LOGGED_DEVICES
}

/**
 * Fetches a refresh token for the provided user and IP address.
 *
 * @param {User} user - The authenticated user.
 * @param {string} ip - The IP address.
 * @returns {Promise<RefreshToken | undefined>} - The found refresh token or undefined.
 */
const findRefreshTokenForUserAndIp = async (user: User, ip: string) => {
  return await RefreshToken.findOne({
    where: { user: { id: user.id }, ipAddress: ip },
  })
}

/**
 * Generates and saves a new refresh token for the provided user and IP address.
 *
 * @param {User} user - The authenticated user.
 * @param {string} ip - The IP address.
 * @returns {Promise<RefreshToken>} - The newly created refresh token.
 */
const createNewRefreshToken = async (
  user: User,
  ip: string
): Promise<RefreshToken> => {
  const tokenValue = generateJwt(
    user,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN
  )

  const durationInSeconds = parseInt(
    REFRESH_TOKEN_EXPIRES_IN.replace('s', ''),
    10
  )

  const currentDate = DateTime.now().setZone('UTC').toJSDate()
  const expiryDate = DateTime.now()
    .setZone('UTC')
    .plus({ seconds: durationInSeconds })
    .toJSDate()

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

/**
 * Extracts the IP address from the request headers or default property.
 *
 * @param {Request} req - The Express request object.
 * @returns {string} - The IP address of the requester.
 */
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

export {
  hashPassword,
  validateUser,
  isValidPassword,
  hasMaxLoggedDevices,
  findRefreshTokenForUserAndIp,
  createNewRefreshToken,
  getIp,
}
