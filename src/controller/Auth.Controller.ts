import { Request, Response } from 'express'
import { ValidateSignUpDto, ValidateLoginDto } from '../utils/scheme.validator'
import * as authService from '../service/authService'
import { IS_PRODUCTION } from '../service/helpers/constants'

const JWT_COOKIE_MAX_AGE =
  Number(process.env.JWT_COOKIE_MAX_AGE) || 24 * 60 * 60

/**
 * Handles the signup process for a new user.
 * Validates the request payload and then passes it to the authService for actual signup.
 * @param req - Express request object containing the signup information.
 * @param res - Express response object for sending back the signup status.
 */
export const signup = async (req: Request, res: Response) => {
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
    const { errors: serviceErrors, user } = await authService.signup(signupDto)

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
export const login = async (req: Request, res: Response) => {
  try {
    // Validate the request body using the login DTO.
    const { errors: validationErrors, dto: loginDto } = await ValidateLoginDto(
      req.body
    )

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
    } = await authService.login(loginDto, req)

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
      maxAge: JWT_COOKIE_MAX_AGE,
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
 * Handles the token refresh process for a user.
 * Uses the JWT token from the cookies to get a refreshed token for the user.
 * @param req - Express request object containing cookies.
 * @param res - Express response object for sending back the refresh token or error status.
 */
export const refreshToken = async (req: Request, res: Response) => {
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
  } = await authService.refreshToken(tokenFromCookies)

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
 * Handles the logout process for a user.
 * Invalidates the JWT token provided in the cookies and clears it.
 *
 * @param req - Express request object containing cookies with the JWT token.
 * @param res - Express response object for sending back the logout status.
 */
export const logout = async (req: Request, res: Response) => {
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
    const { errors } = await authService.logout(tokenFromCookies)

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
