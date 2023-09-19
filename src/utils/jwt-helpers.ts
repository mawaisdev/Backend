import { Request, Response, NextFunction } from 'express'

import { User } from '../entity/User'
import jwt from 'jsonwebtoken'
import { ExtendedRequest, LoggedInUserData } from '../service/types'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

export const generateJwt = (user: User, secret: string, expiresIn: string) => {
  return jwt.sign({ username: user.userName, email: user.email }, secret, {
    expiresIn,
  })
}

export const verifyJWT = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']

  // Check for missing authorization header
  if (!authHeader) {
    return res.status(401).json({ errors: 'Unauthorized' })
  }

  // Extract token from the authorization header
  const token = authHeader.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ errors: 'Token missing in authorization header' })
  }

  jwt.verify(
    token,
    ACCESS_TOKEN_SECRET ? ACCESS_TOKEN_SECRET : '',
    (error, decoded) => {
      if (error) {
        return res.status(403).json({ errors: 'Invalid or expired token' })
      }

      // Ensure decoded payload has the expected shape
      if (typeof decoded === 'object' && decoded !== null) {
        req.user = decoded as LoggedInUserData // Assign the whole decoded object
        next() // Move to the next middleware/route if token is verified successfully
      } else {
        return res.status(403).json({ errors: 'Invalid token payload' })
      }
    }
  )
}
