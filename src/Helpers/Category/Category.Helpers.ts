import { Response } from 'express'
import { Category } from '../../Entity/Category'
import { CategoryServiceResponse } from '../../Services/types'

/**
 * Generates a standard service response object.
 *
 * @param status - HTTP status code for the response.
 * @param response - Optional response message.
 * @param data - Optional data payload.
 * @returns A structured service response.
 */
export const createCategoryServiceResponse = <T>(
  status: number,
  response?: string,
  data?: T
): CategoryServiceResponse<T> => {
  return { status, response, data }
}

/**
 * Generates a standard service response object for category fetching by ID.
 *
 * @param status - HTTP status code for the response.
 * @param response - Optional response message.
 * @param data - The category data.
 * @returns A structured service response for the category.
 */
export const fetchCategoryById = (
  status: number,
  response?: string,
  data?: Category
): CategoryServiceResponse<Category> => {
  return { status, response, data }
}

/**
 * Generates a standard internal server error response object.
 *
 * @returns A structured service response indicating an internal server error.
 */
export const InternalServerErrorResponse = () => {
  return { status: 500, response: 'Internal Server Error.', data: undefined }
}

/**
 * Sends a standard error response.
 *
 * @param res - Express.js response object.
 * @param status - HTTP status code for the response.
 * @param message - Error message to send.
 * @returns The Express.js response object.
 */
export const sendErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ status, response: message, data: null })
}

/**
 * Sends a standard success response with data.
 *
 * @param res - Express.js response object.
 * @param status - HTTP status code for the response.
 * @param message - Success message to send.
 * @param data - Data payload to send.
 * @returns The Express.js response object.
 */
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
