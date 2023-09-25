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
