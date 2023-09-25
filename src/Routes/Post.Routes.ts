import { Router, Request, Response } from 'express'
import { addPost, getAllPosts } from '../Controller/Posts.Controller'
import { UserRole } from '../Config/UserRoles'
import { verifyRole } from '../middleware/Verify.Role'

const postRouter = Router()

postRouter.route('/').get(getAllPosts).post(verifyRole(UserRole.Admin), addPost)
export { postRouter }
