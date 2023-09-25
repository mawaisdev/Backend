import { Router } from 'express'
import { CategoryService } from '../service/categoryService'
import { CategoryController } from '../controller/Category.Controller'
import { verifyRole } from '../middleware/verify-role'
import { UserRole } from '../config/userRoles'

const categoryRouter = Router()
const categoryService = new CategoryService()

const { create, getAllCategories } = new CategoryController(categoryService)

categoryRouter
  .route('/')
  .post(verifyRole(UserRole.Admin), create)
  .get(getAllCategories)

export { categoryRouter }
