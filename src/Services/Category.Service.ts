import { Repository } from 'typeorm'
import { Category } from '../Entity/Category'
import { User } from '../Entity/User'
import { AppDataSource } from '../data-source'
import { CategoryDto } from '../Dto/Category/Category.Dto'
import { CategoryServiceResponse } from './types'
import {
  InternalServerErrorResponse,
  createCategoryServiceResponse,
  fetchCategoryById,
} from '../Helpers/Category/Category.Helpers'

export class CategoryService {
  private categoryRepository: Repository<Category>
  private userRepository: Repository<User>

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category)
    this.userRepository = AppDataSource.getRepository(User)
  }

  createCategory = async (
    { name, description }: CategoryDto,
    userId: number
  ): Promise<CategoryServiceResponse<Category>> => {
    try {
      const categoryFromDb = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.name ILIKE :name', { name: `%${name}%` })
        .getOne()

      if (categoryFromDb)
        return createCategoryServiceResponse(400, 'Category already exists')

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) return createCategoryServiceResponse(404, 'User Not Found')

      const categoryWithUser = await this.categoryRepository.save({
        name,
        description,
        createdBy: user,
      })

      const category = await this.categoryRepository.findOne({
        where: { id: categoryWithUser.id },
      })
      return createCategoryServiceResponse(
        201,
        'Category Created Successfully',
        category ? category : undefined
      )
    } catch (error) {
      console.error('Category Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  getAllCategories = async (): Promise<CategoryServiceResponse<Category[]>> => {
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
      return InternalServerErrorResponse()
    }
  }

  getCategoryById = async (
    categoryId: number
  ): Promise<CategoryServiceResponse<Category>> => {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      })
      if (category)
        return fetchCategoryById(200, 'Category Fetched Successfully', category)
      else return fetchCategoryById(404, 'Category Not Found', undefined)
    } catch (error) {
      console.log('Category Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  updateCategory = async (
    id: number,
    updatedData: Partial<Category>
  ): Promise<CategoryServiceResponse<Category>> => {
    try {
      await this.categoryRepository.update(id, updatedData)
      const category = await this.categoryRepository.findOne({
        where: { id: id },
      })
      return {
        status: 200,
        response: 'Updated Category Successfully',
        data: category || undefined,
      }
    } catch (error) {
      console.log('Category Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  deleteCategory = async (
    id: number
  ): Promise<CategoryServiceResponse<Category>> => {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        select: ['id', 'name', 'description'],
      })

      if (!category)
        return { status: 404, response: 'Not Found', data: undefined }

      const data = await this.categoryRepository.remove(category)
      return { status: 200, response: 'Deleted Successfully', data }
    } catch (error) {
      console.log('Category Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }
}
