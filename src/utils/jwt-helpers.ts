import jwt from 'jsonwebtoken'
import { Response, NextFunction } from 'express'

import { ExtendedRequest, LoggedInUserData } from '../service/types'
import { User } from '../entity/User'
import { RefreshToken } from '../entity/Index'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || ''
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || ''

/**
 * Generates a JWT (JSON Web Token) for the given user based on the provided secret and expiration time.
 *
 * The generated token contains the username and email of the user, ensuring that these
 * details can be retrieved quickly from the token without needing to query the database.
 *
 * @param user - The user for whom the JWT is to be generated.
 * @param secret - The secret key used to sign the JWT, ensuring its integrity and authenticity.
 * @param expiresIn - The duration for which the JWT is valid.
 *                    This is expressed as a string describing a time span (e.g., '1h' for 1 hour, '7d' for 7 days).
 * @returns The generated JWT as a string.
 */
export const generateJwt = (
  user: User,
  secret: string,
  expiresIn: string
): string => {
  return jwt.sign({ username: user.userName, email: user.email }, secret, {
    expiresIn,
  })
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
    const refreshTokenExists = await RefreshToken.findOne({
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
