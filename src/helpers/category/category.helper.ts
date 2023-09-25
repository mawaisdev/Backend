import { CategoryServiceResponse } from '../../service/types'

export const createCategoryServiceResponse = <T>(
  status: number,
  response?: string,
  data?: T
): CategoryServiceResponse<T> => {
  return { status, response, data }
}
