import { Router } from 'express'
import { CategoryService } from '../Services/Category.Service'
import { CategoryController } from '../Controller/Category.Controller'
import { verifyRole } from '../Middleware/Verify.Role'
import { validateId } from '../Middleware/ValidateId'
import { UserRole } from '../Config/UserRoles'
import { AppDataSource } from '../data-source'
import { User } from '../Entity/User'
import { Category } from '../Entity/Category'

const categoryRouter = Router()
const userRepository = AppDataSource.getRepository(User)
const categoryRepository = AppDataSource.getRepository(Category)
const categoryService = new CategoryService(categoryRepository, userRepository)

const {
  create,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = new CategoryController(categoryService)

categoryRouter
  .route('/')
  .post(verifyRole(UserRole.Admin), create)
  .get(getAllCategories)

categoryRouter
  .route('/:id')
  .get(validateId, getCategoryById)
  .patch(verifyRole(UserRole.Admin), validateId, updateCategory)
  .delete(verifyRole(UserRole.Admin), validateId, deleteCategory)
export { categoryRouter }
