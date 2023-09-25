import { Response } from 'express'
import { Category } from '../../Entity/Category'
import { CategoryServiceResponse } from '../../Services/types'

export const createCategoryServiceResponse = <T>(
  status: number,
  response?: string,
  data?: T
): CategoryServiceResponse<T> => {
  return { status, response, data }
}

export const fetchCategoryById = (
  status: number,
  response?: string,
  data?: Category
): CategoryServiceResponse<Category> => {
  return { status, response, data }
}

export const InternalServerErrorResponse = () => {
  return { status: 500, response: 'Internal Server Error.', data: undefined }
}

export const sendErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ status, response: message, data: null })
}

export const sendSuccessResponse = (
  res: Response,
  status: number,
  message: string,
  data: any
) => {
  return res
    .status(status)
    .json({ status, response: message, data: data || null })
}
