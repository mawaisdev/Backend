import { Router } from 'express'
import { CategoryService } from '../Services/Category.Service'
import { CategoryController } from '../Controller/Category.Controller'
import { verifyRole } from '../middleware/Verify.Role'
import { UserRole } from '../Config/UserRoles'

const categoryRouter = Router()
const categoryService = new CategoryService()

const { create, getAllCategories } = new CategoryController(categoryService)

categoryRouter
  .route('/')
  .post(verifyRole(UserRole.Admin), create)
  .get(getAllCategories)

export { categoryRouter }
