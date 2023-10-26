import { Repository } from 'typeorm'
import { CategoryDto } from '../Dto/Category/Category.Dto'
import { Category } from '../Entity/Category'
import { User } from '../Entity/User'
import {
  createCategoryServiceResponse,
  InternalServerErrorResponse,
  fetchCategoryById,
} from '../Helpers/Category/Category.Helpers'
import { CategoryServiceResponse } from './types'

/**
 * Category Service handles CRUD operations for categories.
 */
export class CategoryService {
  private categoryRepository: Repository<Category>
  private userRepository: Repository<User>

  constructor(
    categoryRepository: Repository<Category>,
    userRepository: Repository<User>
  ) {
    // Initializing category and user repositories.
    this.categoryRepository = categoryRepository
    this.userRepository = userRepository
  }

  /**
   * Create a new category.
   *
   * @param {CategoryDto} categoryDto - DTO for category.
   * @param {number} userId - ID of the user creating the category.
   * @returns {Promise<CategoryServiceResponse<Category>>} - Response with status and data.
   */
  async createCategory(
    { name, description }: CategoryDto,
    userId: number
  ): Promise<CategoryServiceResponse<Category>> {
    try {
      // Check if category already exists in DB.
      const categoryFromDb = await this.categoryRepository
        .createQueryBuilder('category')
        .where('LOWER(category.name) = LOWER(:name)', { name: name })
        .getOne()

      if (categoryFromDb)
        return createCategoryServiceResponse(400, 'Category already exists')

      // Fetch user by userId.
      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) return createCategoryServiceResponse(404, 'User Not Found')

      // Save new category to the DB.
      const categoryWithUser = await this.categoryRepository.save({
        name,
        description,
        createdBy: user,
      })

      // Fetch the saved category.
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

  /**
   * Fetch all categories.
   *
   * @returns {Promise<CategoryServiceResponse<Category[]>>} - Response with status and data.
   */
  async getAllCategories(): Promise<CategoryServiceResponse<Category[]>> {
    try {
      // Fetch all categories.
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

  /**
   * Fetch a category by its ID.
   *
   * @param {number} categoryId - ID of the category.
   * @returns {Promise<CategoryServiceResponse<Category>>} - Response with status and data.
   */
  async getCategoryById(
    categoryId: number
  ): Promise<CategoryServiceResponse<Category>> {
    try {
      // Fetch category by its ID.
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

  /**
   * Update an existing category.
   *
   * @param {number} id - ID of the category to update.
   * @param {Partial<Category>} updatedData - Updated data for the category.
   * @returns {Promise<CategoryServiceResponse<Category>>} - Response with status and data.
   */
  async updateCategory(
    id: number,
    updatedData: Partial<Category>
  ): Promise<CategoryServiceResponse<Category>> {
    try {
      // Update the category.
      await this.categoryRepository.update(id, updatedData)

      // Fetch the updated category.
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

  /**
   * Delete a category.
   *
   * @param {number} id - ID of the category to delete.
   * @returns {Promise<CategoryServiceResponse<Category>>} - Response with status and data.
   */
  async deleteCategory(id: number): Promise<CategoryServiceResponse<Category>> {
    try {
      // Fetch category for deletion.
      const category = await this.categoryRepository.findOne({
        where: { id },
        select: ['id', 'name', 'description'],
      })

      if (!category)
        return { status: 404, response: 'Not Found', data: undefined }

      // Delete the category.
      const data = await this.categoryRepository.remove(category)
      return { status: 200, response: 'Deleted Successfully', data }
    } catch (error) {
      console.log('Category Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }
}
