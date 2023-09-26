import { Router, Request, Response } from 'express'
import {
  addPost,
  getAllPosts,
  deletePost,
} from '../Controller/Posts.Controller'
import { UserRole } from '../Config/UserRoles'
import { verifyRole } from '../Middleware/Verify.Role'
import { validateId } from '../Middleware/ValidateId'

const postRouter = Router()

postRouter.route('/').get(getAllPosts).post(addPost)
postRouter.route('/:id').delete(validateId, deletePost)
export { postRouter }
