import { Router } from 'express'
import { CommentController } from '../Controller/Comment.Controller'
import { CommentService } from '../Services/Comment.Service'
import { validateId } from '../Middleware/ValidateId'

const commentRouter = Router()
const commentService = new CommentService()
const commentController = new CommentController(commentService)
const { addComment, deleteComment, updateComment, getCommentsForPost } =
  commentController

commentRouter.route('/').post(addComment)
commentRouter
  .route('/:id')
  .delete(validateId, deleteComment)
  .patch(validateId, updateComment)
commentRouter.route('/:id/posts').get(validateId, getCommentsForPost)

export { commentRouter }
