import { Router } from 'express'
import { CategoryService } from '../Services/Category.Service'
import { CategoryController } from '../Controller/Category.Controller'
import { verifyRole } from '../Middleware/Verify.Role'
import { validateId } from '../Middleware/ValidateId'
import { UserRole } from '../Config/UserRoles'

const categoryRouter = Router()
const categoryService = new CategoryService()

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
