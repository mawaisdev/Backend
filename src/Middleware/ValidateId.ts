import { NextFunction, Response } from 'express'
import { ExtendedRequest } from '../Services/types'
import { sendErrorResponse } from '../Helpers/Category/Category.Helpers'

export const validateId = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params
  if (!(id && Number(id))) {
    return sendErrorResponse(res, 400, 'Invalid Id.')
  }
  next()
}
