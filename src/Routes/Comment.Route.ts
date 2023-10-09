import { Router } from 'express'
import { CommentController } from '../Controller/Comment.Controller'
import { CommentService } from '../Services/Comment.Service'
import { validateId } from '../Middleware/ValidateId'
import { AppDataSource } from '../data-source'
import { Post } from '../Entity/Post'
import { Comment } from '../Entity/Comment'

const commentRouter = Router()

const commentRepository = AppDataSource.getRepository(Comment)
const postRepository = AppDataSource.getRepository(Post)

const commentService = new CommentService(commentRepository, postRepository)
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
