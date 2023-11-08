import { Router } from 'express'
import {
  addPost,
  getAllPosts,
  deletePost,
  getPostById,
  updatePost,
  getllPostsForAuth,
} from '../Controller/Posts.Controller'
import { validateId } from '../Middleware/ValidateId'

const postRouter = Router()
postRouter.route('/').get(getAllPosts).post(addPost)
postRouter
  .route('/:id')
  .delete(validateId, deletePost)
  .get(validateId, getPostById)
  .patch(validateId, updatePost)
// Secure Routes
postRouter.route('/:id/users').get(validateId, getPostById)

export { postRouter }
