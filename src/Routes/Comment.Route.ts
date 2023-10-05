import { Router } from 'express'
import { CommentController } from '../Controller/Comment.Controller'
import { CommentService } from '../Services/Comment.Service'

const commentRouter = Router()
const commentService = new CommentService()
const commentController = new CommentController(commentService)
const { addComment, deleteComment } = commentController

commentRouter.route('/').post(addComment)
commentRouter.route('/:id').delete(deleteComment)

export { commentRouter }
