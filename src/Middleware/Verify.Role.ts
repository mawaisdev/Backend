import { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../Services/types'

/**
 * Middleware function to verify if the user's role matches one of the allowed roles.
 *
 * @param allowedRoles - A list of roles that are permitted.
 * @returns A middleware function that checks if the user's role is among the allowed roles.
 */
export const verifyRole = (...allowedRoles: string[]) => {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    // Ensure the request has a user and roles
    if (!req.user || !req.user.roles) {
      return res.sendStatus(401) // Unauthorized
    }

    // Create an array of allowed roles
    const rolesArray = [...allowedRoles]

    // Check if user's role is within the allowed roles
    const result = rolesArray.includes(req.user.roles)
    if (!result) {
      return res.sendStatus(401) // Unauthorized
    }

    // Continue to the next middleware
    next()
  }
}
