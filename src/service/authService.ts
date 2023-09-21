// External libraries
import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'

// Internal constants and utilities
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  region,
} from './helpers/constants'
import { generateJwt } from '../utils/jwt-helpers'

// DTOs (Data Transfer Objects)
import { SignupDto, LoginDto } from '../dto'

// Entities
import { User, RefreshToken } from '../entity/Index'

// Types
import {
  CreateUserResponse,
  LoggedInUserData,
  LoginResponse,
  LogoutResponse,
  RefreshTokenValidateResponse,
} from './types'
import {
  hashPassword,
  validateUser,
  isValidPassword,
  getIp,
  findRefreshTokenForUserAndIp,
  hasMaxLoggedDevices,
  createNewRefreshToken,
} from './helpers/authHelpers'

/**
 * Handles user signup functionality.
 *
 * @param userDto - The user data transfer object containing all necessary information for registration.
 * @returns A promise resolving to the created user response or an error if the signup fails.
 */
export const signup = async (
  userDto: SignupDto
): Promise<CreateUserResponse> => {
  try {
    const {
      userName,
      email,
      firstName,
      lastName = '',
      password,
      role,
    } = userDto

    // Search for existing users by username or email.
    const userExist = await User.findOne({
      where: [{ userName: userName }, { email: email }],
    })

    // If a matching user is found, abort the signup and return an error.
    if (userExist) {
      return {
        errors: 'User with this email or username already exists',
        user: undefined,
      }
    }

    // Generate the current date in the specified time zone.
    const currentDate = DateTime.now().setZone(region).toJSDate()

    // Hash the user's password for security.
    const hashedPassword = await hashPassword(password)

    // Create a new user entity with the provided details.
    const user = User.create({
      firstName,
      lastName,
      userName,
      email,
      role,
      password: hashedPassword,
      createdAt: currentDate,
      updatedAt: currentDate,
      lastLogin: currentDate,
    })

    // Persist the user entity to the database.
    await user.save()

    return { errors: undefined, user }
  } catch (error) {
    console.error('Signup error:', error)
    throw new Error('An unexpected error occurred during signup.')
  }
}

/**
 * Authenticates a user using their provided credentials.
 * If authentication is successful, generates JWT and possibly refresh token.
 *
 * @param {LoginDto} credentials - The username and password of the user attempting to log in.
 * @param {Request} req - The Express request object.
 * @returns {Promise<LoginResponse>} - The response containing token, refresh token, error, status, and user data.
 */
export const login = async (
  { userName, password }: LoginDto,
  req: Request
): Promise<LoginResponse> => {
  try {
    // Validate the user's credentials.
    const user = await validateUser({ userName, password })
    if (!user) {
      return {
        token: undefined,
        refreshToken: undefined,
        userData: undefined,
        status: 404,
        error: 'User Not Exist',
      }
    }

    // Verify the user's password.
    if (!(await isValidPassword(password, user.password))) {
      return {
        token: undefined,
        refreshToken: undefined,
        userData: undefined,
        status: 401,
        error: 'Invalid Credentials',
      }
    }

    // Generate the JWT for the authenticated user.
    const token = generateJwt(
      user,
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_EXPIRES_IN,
      user.role
    )

    // Retrieve the client's IP address.
    const clientIp = getIp(req)

    // Attempt to retrieve an existing refresh token for the user and IP.
    let refreshTokenData = await findRefreshTokenForUserAndIp(user, clientIp)

    // If no refresh token exists and user is under their device limit, create a new one.
    if (!refreshTokenData) {
      if (await hasMaxLoggedDevices(user)) {
        return {
          token: undefined,
          refreshToken: undefined,
          userData: undefined,
          status: 405,
          error: 'Maximum logged devices reached',
        }
      }
      refreshTokenData = await createNewRefreshToken(user, clientIp)
    }

    // Update the user's last login timestamp.
    user.lastLogin = DateTime.now().setZone(region).toJSDate()
    await user.save()

    // Return a success response with the token, refresh token, and user data.
    return {
      token,
      refreshToken: refreshTokenData.token,
      userData: { email: user.email, userName: user.userName, role: user.role },
      status: 201,
      error: undefined,
    }
  } catch (error) {
    console.error('Login Service Error:', error)
    throw new Error('Error Occurred While verifying credentials')
  }
}

/**
 * De-authenticates a user by invalidating their refresh token.
 *
 * @param {string} tokenFromCookies - The token obtained from user cookies.
 * @returns {Promise<LogoutResponse>} - The response containing possible error message.
 */
export const logout = async (
  tokenFromCookies: string
): Promise<LogoutResponse> => {
  // Find the refresh token in the database.
  const refreshToken = await RefreshToken.findOne({
    where: {
      token: tokenFromCookies,
    },
  })

  // If the token is not found, return an error.
  if (!refreshToken) {
    return { errors: 'Token Not Found in DB' }
  }

  // Delete the token from the database.
  await refreshToken.remove()

  // Return a success response.
  return { errors: undefined }
}

/**
 * Refreshes the JWT for a user using their refresh token.
 *
 * @param {string} tokenFromCookies - The refresh token obtained from user cookies.
 * @returns {Promise<RefreshTokenValidateResponse>} - The response containing possible error message, status, and new JWT token.
 */
export const refreshToken = async (
  tokenFromCookies: string
): Promise<RefreshTokenValidateResponse> => {
  // Find the refresh token and associated user in the database.
  const refreshToken = await RefreshToken.findOne({
    where: {
      token: tokenFromCookies,
    },
    relations: ['user'],
  })

  // If the user associated with the refresh token doesn't exist, return an error.
  const user = refreshToken ? refreshToken.user : null
  if (!user) {
    return { errors: 'Invalid Token', status: 403, token: undefined }
  }

  // Ensure both refresh and access token secrets are available.
  if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
    return { errors: 'Secret not provided', status: 500, token: undefined }
  }

  // Validate the refresh token and generate a new JWT if valid.
  return new Promise((resolve) => {
    jwt.verify(tokenFromCookies, REFRESH_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        resolve({
          errors: 'Token verification failed',
          status: 400,
          token: undefined,
        })
        return
      }

      const { userName } = decoded as LoggedInUserData

      // Ensure the user from the decoded token matches the found user.
      if (user.userName !== userName) {
        console.log('User: ', user.userName === userName)
        console.log('Decoded Data: ', decoded)
        console.log('User Data: ', user.userName)
        resolve({ errors: 'Invalid User', status: 400, token: undefined })
        return
      }

      // Generate a new JWT for the valid user.
      const accessToken = generateJwt(
        user,
        ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRES_IN,
        user.role
      )
      resolve({ errors: undefined, status: 201, token: accessToken })
    })
  })
}
