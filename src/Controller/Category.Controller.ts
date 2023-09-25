import { Response } from 'express'
import { CategoryService } from '../Services/Category.Service'
import { ExtendedRequest } from '../Services/types'
import { CreateCategoryValidator } from '../Utils/Scheme.Validators'
import {
  InternalServerErrorResponse,
  sendErrorResponse,
  sendSuccessResponse,
} from '../Helpers/Category/Category.Helpers'
import { dateNow } from '../Utils/Constants'

export class CategoryController {
  private categoryService: CategoryService

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService
  }

  create = async (req: ExtendedRequest, res: Response) => {
    try {
      const { errors: validationErrors, dto: categoryDto } =
        await CreateCategoryValidator(req.body)

      if (validationErrors.length > 0)
        return sendErrorResponse(res, 400, validationErrors.join(', '))

      const user = req.user
      if (!user) return sendErrorResponse(res, 400, 'Invalid User')

      const { status, data, response } =
        await this.categoryService.createCategory(categoryDto, user.id)
      return sendSuccessResponse(res, status, response as string, data)
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  getAllCategories = async (req: ExtendedRequest, res: Response) => {
    try {
      const { data, response, status } =
        await this.categoryService.getAllCategories()
      return sendSuccessResponse(res, status, response as string, data)
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  getCategoryById = async (req: ExtendedRequest, res: Response) => {
    try {
      const { status, data, response } =
        await this.categoryService.getCategoryById(Number(req.params.id))
      return sendSuccessResponse(res, status, response as string, data)
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  updateCategory = async (req: ExtendedRequest, res: Response) => {
    try {
      const user = req.user
      if (!user) return sendErrorResponse(res, 400, 'Invalid User')
      const { errors: validationErrors, dto: categoryDto } =
        await CreateCategoryValidator(req.body)

      if (validationErrors.length > 0)
        return sendErrorResponse(res, 400, validationErrors.join(', '))

      const updatedAt = dateNow
      const updatedById = user.id
      const { name, description } = categoryDto

      const { status, response, data } =
        await this.categoryService.updateCategory(Number(req.params.id), {
          name,
          description,
          updatedAt,
          updatedById,
        })

      return sendSuccessResponse(res, status, response as string, data)
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  deleteCategory = async (req: ExtendedRequest, res: Response) => {
    try {
      const { status, response, data } =
        await this.categoryService.deleteCategory(Number(req.params.id))
      return sendSuccessResponse(res, status, response as string, data)
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }
}
