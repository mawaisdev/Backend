import { Request, Response, NextFunction } from 'express'
import { allowedOrigins } from '../Config/AllowedOrigins'

/**
 * Middleware to set 'Access-Control-Allow-Credentials' for allowed origins.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Callback to call the next middleware.
 */
export const credentials = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin

  // Check if the request's origin is in the list of allowed origins.
  if (origin && allowedOrigins.includes(origin)) {
    // Set 'Access-Control-Allow-Credentials' to 'true' for requests from allowed origins.
    res.header('Access-Control-Allow-Credentials', 'true')
  }

  // Proceed to the next middleware or route handler.
  next()
}
