import { Request, Response } from 'express'
import { ValidateUserDto } from '../utils/scheme.validator'
import * as authService from '../service/authService'

export const signup = async (req: Request, res: Response) => {
  try {
    const { errors: validationErrors, userDto } = await ValidateUserDto(
      req.body
    )

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors
        .map((error) => Object.values(error.constraints!))
        .join(', ')
      return res.status(400).json({
        message: 'One or more fields are invalid.',
        error: errorMessage,
      })
    }

    const { errors: serviceErrors, user } = await authService.signup(userDto)
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

export const login = async (req: Request, res: Response) => {}

export const logout = async (req: Request, res: Response) => {}

export const refreshToken = async (req: Request, res: Response) => {}
