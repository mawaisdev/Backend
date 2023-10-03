import { Router, Request, Response } from 'express'
import {
  addPost,
  getAllPosts,
  deletePost,
  getPostById,
} from '../Controller/Posts.Controller'
import { UserRole } from '../Config/UserRoles'
import { verifyRole } from '../Middleware/Verify.Role'
import { validateId } from '../Middleware/ValidateId'

const postRouter = Router()

postRouter.route('/').get(getAllPosts).post(addPost)
postRouter
  .route('/:id')
  .delete(validateId, deletePost)
  .get(validateId, getPostById)
// Secure Routes
postRouter.route('/:id/users').get(validateId, getPostById)
export { postRouter }
