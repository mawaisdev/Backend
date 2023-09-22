import { Router, Request, Response } from 'express'
import { addPost, getAllPosts } from '../controller/Posts.Controller'
import { UserRole } from '../config/userRoles'
import { verifyRole } from '../middleware/verify-role'

const postRouter = Router()

postRouter.route('/').get(getAllPosts).post(verifyRole(UserRole.Admin), addPost)
export { postRouter }
