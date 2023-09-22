// External libraries
import { Request, Response } from 'express'

// Services
import { AuthService } from '../service/authService'

// Utils, validators, and constants
import { IS_PRODUCTION, COOKIE_MAX_AGE } from '../utils/constants'
import {
  ValidateSignUpDto,
  ValidateLoginDto,
  ValidateResetPasswordDto,
} from '../utils/scheme.validator'
import { ResetPasswordValidation, resetPasswordRequest } from '../service/types'

export class AuthController {
  private authService: AuthService
  private JWT_COOKIE_MAX_AGE = COOKIE_MAX_AGE

  constructor(authService: AuthService) {
    this.authService = authService
  }

  /**
   * Handles the signup process for a new user.
   * Validates the request payload and then passes it to the authService for actual signup.
   * @param req - Express request object containing the signup information.
   * @param res - Express response object for sending back the signup status.
   */
  signup = async (req: Request, res: Response) => {
    try {
      // Validate the request body using the signup DTO.
      const { errors: validationErrors, dto: signupDto } =
        await ValidateSignUpDto(req.body)

      // Check for validation errors.
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map((error) => Object.values(error.constraints!))
          .flat()

        // Return a response with a status of 400 (Bad Request) and the validation errors.
        return res.status(400).json({
          status: 400,
          errors: errorMessages,
          user: undefined,
        })
      }

      // Use the authService to handle the signup logic.
      const { errors: serviceErrors, user } = await this.authService.signup(
        signupDto
      )

      // If there are service-level errors, return them.
      if (serviceErrors) {
        return res.status(400).json({
          status: 400,
          errors: [serviceErrors],
          user: undefined,
        })
      }

      // Signup was successful, return the user details with a status of 201 (Created).
      return res.status(201).json({
        status: 201,
        errors: [],
        user,
      })
    } catch (error) {
      // Log any unexpected errors and return a general error message.
      console.error('Signup error:', error)
      return res.status(500).json({
        status: 500,
        errors: ['An unexpected error occurred while processing your request.'],
        user: undefined,
      })
    }
  }

  /**
   * Handles the login process for a user.
   * Validates the request payload and then passes it to the authService for authentication.
   * @param req - Express request object containing the login information.
   * @param res - Express response object for sending back the login status.
   */
  login = async (req: Request, res: Response) => {
    try {
      // Validate the request body using the login DTO.
      const { errors: validationErrors, dto: loginDto } =
        await ValidateLoginDto(req.body)

      // Check for validation errors.
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map((error) =>
            Object.values(error.constraints ? error.constraints : '')
          )
          .flat()

        // Return a response with a status of 400 (Bad Request) and the validation errors.
        return res.status(400).json({
          status: 400,
          errors: errorMessages,
          token: undefined,
          userData: undefined,
        })
      }

      // Use the authService to handle the login logic.
      const {
        token,
        refreshToken,
        userData,
        error: serviceErrors = '',
        status = 201,
      } = await this.authService.login(loginDto, req)

      // If there are service-level errors, return them.
      if (serviceErrors) {
        return res.status(status).json({
          status,
          errors: [serviceErrors],
          token: undefined,
          userData: undefined,
        })
      }

      // Set a cookie for the refresh token.
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: this.JWT_COOKIE_MAX_AGE,
        secure: IS_PRODUCTION,
        sameSite: 'none',
      })

      // Login was successful, return the token, user data, and an empty error array with a status of 201 (Created).
      return res.status(status).json({
        status,
        errors: [],
        token,
        userData,
      })
    } catch (error) {
      // Log any unexpected errors and return a general error message.
      console.error('Login error:', error)
      return res.status(500).json({
        status: 500,
        errors: ['An unexpected error occurred while processing your request.'],
        token: undefined,
        userData: undefined,
      })
    }
  }

  /**
   * Handles the logout process for a user.
   * Invalidates the JWT token provided in the cookies and clears it.
   *
   * @param req - Express request object containing cookies with the JWT token.
   * @param res - Express response object for sending back the logout status.
   */
  logout = async (req: Request, res: Response) => {
    try {
      // Extract the JWT token from the cookies.
      const cookies = req.cookies
      const tokenFromCookies = cookies?.jwt

      // If no token is present in the cookies, send a 204 status (No Content) indicating the user is already logged out.
      if (!tokenFromCookies) {
        return res.status(204).json({
          status: 204,
          errors: [],
        })
      }

      // Use the authService to handle the logout logic.
      const { errors } = await this.authService.logout(tokenFromCookies)

      // If there are any warnings or errors during the logout process, log them.
      if (errors) {
        console.warn('Logout warning:', errors)
        return res.status(204).json({
          status: 204,
          errors: [errors],
        })
      }

      // Clear the JWT cookie.
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'none',
      })

      // Logout was successful, send a 204 status (No Content).
      return res.status(204).json({
        status: 204,
        errors: [],
      })
    } catch (error) {
      // Log any unexpected errors and return a general error message.
      console.error('Logout error:', error)
      return res.status(500).json({
        status: 500,
        errors: ['An unexpected error occurred while processing your request.'],
      })
    }
  }

  /**
   * Handles the token refresh process for a user.
   * Uses the JWT token from the cookies to get a refreshed token for the user.
   * @param req - Express request object containing cookies.
   * @param res - Express response object for sending back the refresh token or error status.
   */
  refreshToken = async (req: Request, res: Response) => {
    // Extract the JWT from the cookies.
    const cookies = req.cookies

    // If there's no JWT in the cookies, return a 401 (Unauthorized) status with a consistent error format.
    if (!cookies?.jwt) {
      return res.status(401).json({
        status: 401,
        errors: ['Authorization token is missing.'],
        token: undefined,
      })
    }

    const tokenFromCookies = cookies.jwt

    // Use the authService to get a refreshed token.
    const {
      errors,
      status = 201,
      token,
    } = await this.authService.refreshToken(tokenFromCookies)

    // If there are errors during the refresh process, return the appropriate status and error message.
    if (errors) {
      return res.status(status).json({
        status,
        errors: [errors],
        token: '',
      })
    }

    // If the token refresh was successful, return the new token.
    return res.status(status).json({
      status,
      errors: [],
      token,
    })
  }

  /**
   * Handles both the initiation and completion of the password reset process.
   * Based on the provided request data, it decides to either initiate or complete the reset.
   * @param req - Express request object containing either just the email (for initiation)
   *              or the email, token, and new password (for completion).
   * @param res - Express response object for sending back the appropriate status.
   */
  passwordReset = async (req: Request, res: Response) => {
    try {
      // First, validate the request body using the validation scheme.
      const { errors, dto }: ResetPasswordValidation =
        await ValidateResetPasswordDto(req.body)

      // If there are validation errors, return them as a bad request.
      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints!))
          .flat()
        return res
          .status(400)
          .json({ status: 400, message: undefined, error: errorMessages })
      }

      const { email, token, password } = dto

      // If only email is provided, initiate the password reset.
      if (email && !token && !password) {
        const { message } = await this.authService.initiatePasswordReset(email)
        return res.status(200).json({ status: 200, message, error: undefined })
      }

      // If email, token, and password are provided, complete the password reset.
      if (email && token && password) {
        if (password.length < 6 || token.length != 8)
          return res.status(400).json({
            status: 400,
            messsage: undefined,
            errors: ['Invalid Password or token'],
          })

        const { message, error } = await this.authService.completePasswordReset(
          email,
          token,
          password
        )

        // Check for errors during the completion process.
        if (error) {
          return res
            .status(400)
            .json({ status: 400, message: undefined, error: [...error] })
        }

        return res.status(200).json({ status: 200, message, error: undefined })
      }

      // If neither of the above conditions match, return a Bad Request.
      return res
        .status(400)
        .json({ status: 400, message: 'Invalid request format.' })
    } catch (error) {
      console.error('Password Reset Error:', error)
      return res.status(500).json({
        status: 500,
        message: 'An unexpected error occurred while processing your request.',
      })
    }
  }
}
