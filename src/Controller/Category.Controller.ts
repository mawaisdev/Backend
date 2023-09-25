import {
  sendErrorResponse,
  sendSuccessResponse,
  InternalServerErrorResponse,
} from '../Helpers/Category/Category.Helpers'
import { CategoryService } from '../Services/Category.Service'
import { ExtendedRequest } from '../Services/types'
import { dateNow } from '../Utils/Constants'
import { CreateCategoryValidator } from '../Utils/Scheme.Validators'
import { Response } from 'express'

/**
 * Controller to handle category operations.
 */
export class CategoryController {
  private categoryService: CategoryService

  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService
  }

  /**
   * Create a new category.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   */
  create = async (req: ExtendedRequest, res: Response) => {
    try {
      // Validate the category data.
      const { errors: validationErrors, dto: categoryDto } =
        await CreateCategoryValidator(req.body)

      // Send error if there are validation issues.
      if (validationErrors.length > 0)
        return sendErrorResponse(res, 400, validationErrors.join(', '))

      const user = req.user
      if (!user) return sendErrorResponse(res, 400, 'Invalid User')

      // Create category.
      const { status, data, response } =
        await this.categoryService.createCategory(categoryDto, user.id)
      return sendSuccessResponse(res, status, response as string, data)
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  /**
   * Retrieve all categories.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   */
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

  /**
   * Retrieve a category by its ID.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   */
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

  /**
   * Update a category.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   */
  updateCategory = async (req: ExtendedRequest, res: Response) => {
    try {
      const user = req.user
      if (!user) return sendErrorResponse(res, 400, 'Invalid User')

      // Validate the category data for update.
      const { errors: validationErrors, dto: categoryDto } =
        await CreateCategoryValidator(req.body)

      // Send error if there are validation issues.
      if (validationErrors.length > 0)
        return sendErrorResponse(res, 400, validationErrors.join(', '))

      // Set updated details.
      const updatedAt = dateNow
      const updatedById = user.id
      const { name, description } = categoryDto

      // Update category.
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

  /**
   * Delete a category.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   */
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
