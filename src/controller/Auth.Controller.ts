import { Request, Response } from 'express'
import { ValidateSignUpDto, ValidateLoginDto } from '../utils/scheme.validator'
import * as authService from '../service/authService'

const JWT_COOKIE_MAX_AGE =
  Number(process.env.JWT_COOKIE_MAX_AGE) || 24 * 60 * 60

export const signup = async (req: Request, res: Response) => {
  try {
    const { errors: validationErrors, dto: signupDto } =
      await ValidateSignUpDto(req.body)

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors
        .map((error) => Object.values(error.constraints!))
        .join(', ')
      return res.status(400).json({
        message: 'One or more fields are invalid.',
        error: errorMessage,
      })
    }

    const { errors: serviceErrors, user } = await authService.signup(signupDto)
    if (serviceErrors && serviceErrors.length > 0) {
      return res.status(400).json({ errors: serviceErrors })
    }

    return res.status(201).json({ user })
  } catch (error) {
    console.error('Signup error:', error) // Log the error for debugging
    return res.status(500).json({
      message: 'An unexpected error occurred while processing your request.',
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { errors: validationErrors, dto: loginDto } = await ValidateLoginDto(
      req.body
    )

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors
        .map((error) =>
          Object.values(error.constraints ? error.constraints : '')
        )
        .join(', ')
      return res.status(400).json({
        message: 'One or more fields are invalid.',
        error: errorMessage,
      })
    }
    const {
      token,
      refreshToken,
      userData,
      error: serviceErrors = '',
      status,
    } = await authService.login(loginDto, req)

    if (serviceErrors && status) {
      return res.status(status).json({ errors: serviceErrors })
    }

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: JWT_COOKIE_MAX_AGE,
      secure: true,
      sameSite: 'none',
    })
    return res
      .status(201)
      .json({ token, status, userData, errors: serviceErrors })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred while processing your request.',
    })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(401)
  const tokenFromCookies = cookies.jwt
  const { errors, status, token } = await authService.refreshToken(
    tokenFromCookies
  )

  if (errors && status) {
    return res.status(status).json({ errors, status, token: '' })
  }

  return res.status(status ? status : 201).json({ token })
}

export const logout = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies
    const tokenFromCookies = cookies?.jwt

    if (!tokenFromCookies) {
      return res.sendStatus(204) // No JWT token in the cookie, nothing to do.
    }

    const { errors } = await authService.logout(tokenFromCookies)

    if (errors) {
      console.warn('Logout warning:', errors) // Log the warning for tracking if needed.
      return res.sendStatus(204) // No Content but consider sending a 400 Bad Request if you think it's an error scenario.
    }

    // Clear the JWT cookie since logout was successful.
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    return res.sendStatus(204) // Logout successful, No Content to send back.
  } catch (error) {
    console.error('Logout error:', error) // Fixed the logging text.
    return res.status(500).json({
      message: 'An unexpected error occurred while processing your request.',
    })
  }
}
