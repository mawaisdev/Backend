// External libraries
import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { Repository } from 'typeorm'

// Entities
import { User } from '../entity/User'
import { RefreshToken } from '../entity/RefreshToken'

// Data sources
import { AppDataSource } from '../data-source'

// DTOs
import { SignupDto } from '../dto/auth/signup.dto'
import { LoginDto } from '../dto/auth/login.dto'

// Utils and constants
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  region,
} from '../utils/constants'
import { generateJwt } from '../utils/jwt-helpers'

// Helpers
import {
  createNewRefreshToken,
  findRefreshTokenForUserAndIp,
  getIp,
  hasMaxLoggedDevices,
  hashPassword,
  isValidPassword,
  validateUser,
} from '../helpers/auth/authHelper'

// Types
import {
  CreateUserResponse,
  LoggedInUserData,
  LoginResponse,
  LogoutResponse,
  RefreshTokenValidateResponse,
} from './types'

/**
 * AuthService is responsible for user authentication operations.
 *
 * It provides methods to handle user signup, login, logout, and JWT refresh token functionalities.
 * The class interacts with the User and RefreshToken repositories to perform various
 * database operations related to authentication.
 */
export class AuthService {
  /**
   * Repository for user-related database operations.
   */
  private userRepository: Repository<User>

  /**
   * Repository for refresh token-related database operations.
   */
  private refreshTokenRepository: Repository<RefreshToken>

  /**
   * Initializes a new instance of the AuthService and sets up the required repositories.
   */
  constructor() {
    this.userRepository = AppDataSource.getRepository(User)
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
  }

  /**
   * Registers a new user into the system.
   *
   * @param userDto - User details for registration.
   * @returns The response indicating the result of the registration.
   * @throws Will throw an error if registration encounters an unexpected issue.
   */
  async signup(userDto: SignupDto): Promise<CreateUserResponse> {
    try {
      // Destructure user details from the provided DTO.
      const {
        userName,
        email,
        firstName,
        lastName = '',
        password,
        role,
      } = userDto

      // Check for pre-existing users with the same username or email.
      const userExist = await this.userRepository.findOne({
        where: [{ userName }, { email }],
      })

      // If a user already exists with the same username or email, terminate registration.
      if (userExist) {
        return {
          errors: 'User with this email or username already exists',
          user: undefined,
        }
      }

      // Generate the current date for user timestamps.
      const currentDate = DateTime.now().setZone(region).toJSDate()

      // Securely hash the provided password.
      const hashedPassword = await hashPassword(password)

      // Construct the new user entity.
      const user = this.userRepository.create({
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

      // Save the new user entity into the database.
      await this.userRepository.save(user)

      return { errors: undefined, user }
    } catch (error) {
      console.error('Signup error:', error)
      throw new Error('An unexpected error occurred during signup.')
    }
  }

  /**
   * Authenticates a user using the provided credentials.
   * Generates JWT and refresh tokens upon successful authentication.
   *
   * @param credentials - User login details.
   * @param req - The Express request object for IP extraction.
   * @returns The authentication response which includes the token, refresh token, user data, status, and possible error.
   * @throws Will throw an error if unexpected issues occur during authentication.
   */
  async login(
    { userName, password }: LoginDto,
    req: Request
  ): Promise<LoginResponse> {
    try {
      // Validate the user's credentials against the database.
      const user = await validateUser(
        { userName, password },
        this.userRepository
      )

      // If no user found, respond with user not exist error.
      if (!user) {
        return {
          token: undefined,
          refreshToken: undefined,
          userData: undefined,
          status: 404,
          error: 'User Not Exist',
        }
      }

      // If provided password doesn't match stored password, respond with invalid credentials error.
      if (!(await isValidPassword(password, user.password))) {
        return {
          token: undefined,
          refreshToken: undefined,
          userData: undefined,
          status: 401,
          error: 'Invalid Credentials',
        }
      }

      // Generate JWT for authenticated user.
      const token = generateJwt(
        user,
        ACCESS_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRES_IN,
        user.role
      )

      // Extract client's IP address.
      const clientIp = getIp(req)

      // Retrieve existing refresh token for the user from the database.
      let refreshTokenData = await findRefreshTokenForUserAndIp(
        user,
        clientIp,
        this.refreshTokenRepository
      )

      // If no refresh token found and user hasn't reached their device limit, create a new refresh token.
      if (!refreshTokenData) {
        if (await hasMaxLoggedDevices(user, this.refreshTokenRepository)) {
          return {
            token: undefined,
            refreshToken: undefined,
            userData: undefined,
            status: 405,
            error: 'Maximum logged devices reached',
          }
        }
        refreshTokenData = await createNewRefreshToken(
          user,
          clientIp,
          this.refreshTokenRepository
        )
      }

      // Update user's last login timestamp and save it.
      user.lastLogin = DateTime.now().setZone(region).toJSDate()
      await this.userRepository.save(user)

      // Return success response with generated tokens and user data.
      return {
        token,
        refreshToken: refreshTokenData.token,
        userData: {
          email: user.email,
          userName: user.userName,
          roles: user.role,
        },
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
   * @param tokenFromCookies - Token used for authentication, typically fetched from cookies.
   * @returns Response indicating the success or failure of the logout action.
   * @throws If unexpected issues occur during de-authentication.
   */
  async logout(tokenFromCookies: string): Promise<LogoutResponse> {
    try {
      // Fetch the refresh token using the token provided.
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: {
          token: tokenFromCookies,
        },
      })

      // If the token isn't found, return an error response.
      if (!refreshToken) {
        return { errors: 'Token Not Found in DB' }
      }

      // If found, remove the token to de-authenticate the user.
      await this.refreshTokenRepository.remove(refreshToken)

      // Return a success response.
      return { errors: undefined }
    } catch (error) {
      console.error('Logout Service Error:', error)
      throw new Error('An unexpected error occurred during logout.')
    }
  }
  /**
   * Handles JWT refresh functionality.
   *
   * When an access token expires, this method can be used to obtain a new one using a refresh token.
   *
   * @param {string} tokenFromCookies - The refresh token obtained from user cookies.
   * @returns A promise resolving to the refreshed token response.
   */
  async refreshToken(
    tokenFromCookies: string
  ): Promise<RefreshTokenValidateResponse> {
    try {
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { token: tokenFromCookies },
        relations: ['user'],
      })

      const user = refreshToken ? refreshToken.user : null
      if (!user) {
        return { errors: 'Invalid Token', status: 403, token: undefined }
      }

      if (!REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_SECRET) {
        return { errors: 'Secret not provided', status: 500, token: undefined }
      }

      return new Promise((resolve, reject) => {
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

          if (user.userName !== userName) {
            resolve({ errors: 'Invalid User', status: 400, token: undefined })
            return
          }

          const accessToken = generateJwt(
            user,
            ACCESS_TOKEN_SECRET,
            ACCESS_TOKEN_EXPIRES_IN,
            user.role
          )
          resolve({ errors: undefined, status: 201, token: accessToken })
        })
      })
    } catch (error) {
      console.error('Refresh Token Service Error:', error)
      throw new Error('An unexpected error occurred during token refresh.')
    }
  }
}
