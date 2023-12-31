import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'

import { ExtendedRequest, LoggedInUserData } from '../Services/types'
import { User } from '../Entity/User'
import { UserRole } from '../Config/UserRoles'
import { RefreshToken } from '../Entity/RefreshToken'
import { AppDataSource } from '../data-source'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || ''

/**
 * Generates a JWT (JSON Web Token) for a given user with specified parameters.
 *
 * This function creates a token containing essential user information (e.g., username, email, and roles).
 * Embedding this data in the token can reduce the need for database lookups during authentication/authorization processes.
 *
 * @param {User} user - The target user for the JWT.
 * @param {string} secret - Secret key for signing the JWT.
 * @param {string} expiresIn - Token's validity duration (e.g., '1h', '7d').
 * @param {UserRole} [roles] - Optional roles associated with the user.
 * @returns {string} - Generated JWT.
 */
export const generateJwt = (
  { userName, email, id }: User,
  secret: string,
  expiresIn: string,
  roles?: UserRole
): string => {
  const payload = roles
    ? { userName, email, id, roles }
    : { userName, email, id }

  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Middleware to verify the validity of the JWT access token.
 * This middleware performs the following checks:
 * - Ensures the presence of an authorization header containing the JWT.
 * - Verifies the integrity and authenticity of the JWT.
 * - Ensures that the JWT's payload has the expected structure.
 * - Checks if the specific refresh token from the cookie exists in the database.
 *
 * If all checks pass, the request proceeds to the next middleware/route.
 * Otherwise, the request is denied with relevant error messages.
 *
 * @param req - The incoming request object.
 * @param res - The outgoing response object.
 * @param next - The next function to call in the middleware chain.
 */
export const verifyJWT = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  // Extract the JWT from the authorization header.
  const authHeader = req.headers['authorization']
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken)

  // Extract the refresh token from the cookie.
  const refreshTokenFromCookie = req.cookies?.jwt

  // Deny the request if the authorization header is missing.
  if (!authHeader) {
    return res.status(401).json({ errors: 'Unauthorized' })
  }

  // Deny the request if the JWT is missing from the authorization header.
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res
      .status(401)
      .json({ errors: 'Token missing in authorization header' })
  }

  // Verify the JWT's integrity and authenticity.
  jwt.verify(token, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(403).json({ errors: 'Invalid or expired token' })
    }

    // Ensure the JWT's payload is in the expected format.
    if (typeof decoded !== 'object' || !decoded) {
      return res.status(403).json({ errors: 'Invalid token payload' })
    }

    // Deny the request if the refresh token is missing from the cookie.
    if (!refreshTokenFromCookie) {
      return res.status(401).json({ errors: 'Unauthorized' })
    }

    // Check if the refresh token from the cookie exists in the database.
    const refreshTokenExists = await refreshTokenRepo.findOne({
      where: { token: refreshTokenFromCookie },
    })
    if (!refreshTokenExists) {
      return res.status(403).json({ errors: 'Unauthorized' })
    }

    // Attach the decoded JWT payload to the request object for use in subsequent middlewares/routes.
    req.user = decoded as LoggedInUserData
    next()
  })
}

// Another version of the middleware that check's the integrity of only access_token
// export const verifyJWT = (
//   req: ExtendedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers['authorization']

//   // Check for missing authorization header
//   if (!authHeader) {
//     return res.status(401).json({ errors: 'Unauthorized' })
//   }

//   // Extract token from the authorization header
//   const token = authHeader.split(' ')[1]

//   if (!token) {
//     return res
//       .status(401)
//       .json({ errors: 'Token missing in authorization header' })
//   }

//   jwt.verify(token, ACCESS_TOKEN_SECRET, (error, decoded) => {
//     if (error) {
//       return res.status(403).json({ errors: 'Invalid or expired token' })
//     }

//     // Ensure decoded payload has the expected shape
//     if (typeof decoded === 'object' && decoded !== null) {
//       req.user = decoded as LoggedInUserData // Assign the whole decoded object
//       next() // Move to the next middleware/route if token is verified successfully
//     } else {
//       return res.status(403).json({ errors: 'Invalid token payload' })
//     }
//   })
// }
