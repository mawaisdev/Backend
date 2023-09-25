import { Repository } from 'typeorm'
import { Category } from '../entity/Category'
import { AppDataSource } from '../data-source'
import { CreateCategoryDto } from '../dto/category/category.dto'
import { CategoryServiceResponse } from '../service/types'
import { User } from '../entity/User'
import { createCategoryServiceResponse } from '../helpers/category/category.helper'

export class CategoryService {
  private categoryRepository: Repository<Category>
  private userRepository: Repository<User>

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category)
    this.userRepository = AppDataSource.getRepository(User)
  }

  createCategory = async (
    { name, description }: CreateCategoryDto,
    userId: number
  ): Promise<CategoryServiceResponse<Category>> => {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) return createCategoryServiceResponse(404, 'User Not Found')

      const categoryFromDb = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.name ILIKE :name', { name: `%${name}%` })
        .getOne()

      if (categoryFromDb)
        return createCategoryServiceResponse(400, 'Category already exist')

      const categoryWithUser = await this.categoryRepository.save({
        name,
        description,
        createdBy: user,
      })

      const category = await this.categoryRepository.findOne({
        where: { id: categoryWithUser.id },
      })
      if (category)
        return createCategoryServiceResponse(
          201,
          'Category Created Successfully',
          category
        )

      return createCategoryServiceResponse<Category>(
        404,
        'Category Not Found.',
        undefined
      )
    } catch (error) {
      console.error('Category Service Error: ', error)
      return createCategoryServiceResponse(500, 'Internal Server Error')
    }
  }

  getAllCategories = async () => {
    try {
      const categories = await this.categoryRepository.find({
        select: ['id', 'name', 'description', 'createdBy'],
      })
      return {
        status: 200,
        data: categories,
        response: 'Successfully fetched all categories',
      }
    } catch (error) {
      console.error('Category Service Error: ', error)
      return {
        status: 500,
        data: undefined,
        response: 'Error occured while fetching categories',
      }
    }
  }
}
