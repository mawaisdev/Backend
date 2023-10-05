import { Router } from 'express'
import { CommentController } from '../Controller/Comment.Controller'
import { CommentService } from '../Services/Comment.Service'
import { validateId } from '../Middleware/ValidateId'

const commentRouter = Router()
const commentService = new CommentService()
const commentController = new CommentController(commentService)
const { addComment, deleteComment } = commentController

commentRouter.route('/').post(addComment)
commentRouter.route('/:id').delete(validateId, deleteComment)

export { commentRouter }
