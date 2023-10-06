import { NextFunction, Response } from 'express'
import { ExtendedRequest } from '../Services/types'
import { sendErrorResponse } from '../Helpers/Category/Category.Helpers'

/**
 * Middleware function to validate the ID parameter from the request.
 *
 * This checks if the ID is present and is a valid number. If not,
 * an error response is sent. Otherwise, processing is handed to
 * the next middleware in line.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export const validateId = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params

  // Check if ID is present and is a number
  if (!(id && Number(id))) {
    return sendErrorResponse(res, 400, 'Invalid Id.')
  }

  // Continue to the next middleware
  next()
}
