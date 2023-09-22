import bcrypt from 'bcrypt'
import { DateTime } from 'luxon'
import { Request } from 'express'
import { User } from '../../entity/User'
import { RefreshToken } from '../../entity/RefreshToken'
import { LoginDto } from '../../dto/auth/login.dto'
import {
  MAX_LOGGED_DEVICES,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../../utils/constants'
import { generateJwt } from '../../utils/jwt-helpers'
import { Repository } from 'typeorm'

/**
 * Hashes the provided password using bcrypt.
 *
 * @param password - The plain text password.
 * @returns The hashed password.
 */
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

/**
 * Validates the user based on provided credentials.
 *
 * @param dto - Data transfer object containing user credentials.
 * @param userRepository - The user repository.
 * @returns The user if found; otherwise undefined.
 */
const validateUser = async (
  dto: LoginDto,
  userRepository: Repository<User>
) => {
  return userRepository.findOne({ where: { userName: dto.userName } })
}

/**
 * Compares the provided password with the stored hashed password.
 *
 * @param providedPassword - The plain text password.
 * @param userPassword - The hashed password stored in the database.
 * @returns True if the passwords match, false otherwise.
 */
const isValidPassword = async (
  providedPassword: string,
  userPassword: string
): Promise<boolean> => {
  return bcrypt.compare(providedPassword, userPassword)
}

/**
 * Checks if the user has reached their maximum logged device limit.
 *
 * @param user - The authenticated user.
 * @param refreshTokenRepository - The refresh token repository.
 * @returns True if the user has reached their device limit, false otherwise.
 */
const hasMaxLoggedDevices = async (
  user: User,
  refreshTokenRepository: Repository<RefreshToken>
): Promise<boolean> => {
  const count = await refreshTokenRepository.count({
    where: { user: { id: user.id } },
  })
  return count >= MAX_LOGGED_DEVICES
}

/**
 * Retrieves a refresh token for the provided user and IP address.
 *
 * @param user - The authenticated user.
 * @param ip - The IP address.
 * @param refreshTokenRepository - The refresh token repository.
 * @returns The found refresh token or undefined.
 */
const findRefreshTokenForUserAndIp = async (
  user: User,
  ip: string,
  refreshTokenRepository: Repository<RefreshToken>
) => {
  return await refreshTokenRepository.findOne({
    where: { user: { id: user.id }, ipAddress: ip },
  })
}

/**
 * Creates and saves a new refresh token for the provided user and IP address.
 *
 * @param user - The authenticated user.
 * @param ip - The IP address.
 * @param refreshTokenRepository - The refresh token repository.
 * @returns The newly created refresh token.
 */
const createNewRefreshToken = async (
  user: User,
  ip: string,
  refreshTokenRepository: Repository<RefreshToken>
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

  const refreshToken = refreshTokenRepository.create({
    token: tokenValue,
    user,
    ipAddress: ip,
    issuedAt: currentDate,
    expiresAt: expiryDate,
  })

  await refreshTokenRepository.save(refreshToken)
  return refreshToken
}

/**
 * Extracts the client's IP address from the request.
 *
 * @param req - The Express request object.
 * @returns The IP address.
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

/**
 * Generates a random 8-digit numeric token for resetting the user's password.
 * Saves this token to the user's resetPasswordCode field in the database.
 *
 * @param user - The User entity for which the reset token needs to be generated.
 * @returns A promise resolving to the updated User entity.
 */
const generateResetTokenForUser = async (
  user: User,
  userRepository: Repository<User>
): Promise<void> => {
  // Generate a random 8-digit number.
  const resetToken = Math.floor(10000000 + Math.random() * 90000000).toString()

  // Set the generated token to the user's resetPasswordCode field.
  user.resetPasswordCode = resetToken

  // Save the updated user entity to the database.
  await userRepository.save(user)
}

export {
  hashPassword,
  validateUser,
  isValidPassword,
  hasMaxLoggedDevices,
  findRefreshTokenForUserAndIp,
  createNewRefreshToken,
  getIp,
  generateResetTokenForUser,
}
