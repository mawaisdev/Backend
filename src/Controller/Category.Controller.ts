import { Response } from 'express'
import { CategoryService } from '../Services/Category.Service'
import { ExtendedRequest } from '../Services/types'
import { CreateCategoryValidator } from '../Utils/Scheme.Validators'
import { InternalServerErrorResponse } from '../Helpers/Category/Category.Helpers'

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
        return { response: [...validationErrors], status: 400 }

      const user = req.user
      if (!user) return { response: 'Invalid User', status: 400 }

      const { status, data, response } =
        await this.categoryService.createCategory(categoryDto, user.id)
      return res
        .status(status)
        .json({ response, status, data: data ? data : null })
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  getAllCategories = async (req: ExtendedRequest, res: Response) => {
    try {
      const { data, response, status } =
        await this.categoryService.getAllCategories()
      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  getCategoryById = async (req: ExtendedRequest, res: Response) => {
    try {
      const { id } = req.params
      if (!(id && Number(id)))
        return res
          .status(400)
          .json({ status: 400, response: 'Invalid Id.', data: null })

      const { status, data, response } =
        await this.categoryService.getCategoryById(Number(id))

      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    } catch (error) {
      console.error('Category Controller Error: ', error)
      return InternalServerErrorResponse()
    }
  }
}
