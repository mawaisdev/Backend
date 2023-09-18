import { Request, Response } from 'express'
import { ValidateSignUpDto } from '../utils/scheme.validator'
import * as authService from '../service/authService'

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
    const { errors: validationErrors, dto: loginDto } = await ValidateSignUpDto(
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
      error: serviceErrors,
      status,
    } = await authService.login(loginDto)

    if (serviceErrors) {
      return res.status(400).json({ errors: serviceErrors })
    }

    return res.status(201).json({ token, refreshToken, status, userData })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      message: 'An unexpected error occurred while processing your request.',
    })
  }
}

export const logout = async (req: Request, res: Response) => {}

export const refreshToken = async (req: Request, res: Response) => {}
