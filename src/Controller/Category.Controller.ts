import { Response } from 'express'
import { CategoryService } from '../Services/Category.Service'
import { ExtendedRequest } from '../Services/types'
import { CreateCAategoryValidator } from '../Utils/Scheme.Validators'

export class CategoryController {
  private categoryService: CategoryService
  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService
  }

  create = async (req: ExtendedRequest, res: Response) => {
    try {
      const { errors: validationErrors, dto: categoryDto } =
        await CreateCAategoryValidator(req.body)

      if (validationErrors.length > 0)
        return { response: [...validationErrors], status: 400 }

      const user = req.user
      if (!user) return { response: 'Invalid User', status: 400 }

      const { status, data, response } =
        await this.categoryService.createCategory(categoryDto, user.id)
      return res
        .status(status)
        .json({ response, status, data: data ? data : null })
    } catch (error) {}
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
      return res.status(500).json({
        data: null,
        status: 500,
        response: 'Internal Server Error',
      })
    }
  }
}
