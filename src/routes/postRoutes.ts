import { Router, Request, Response } from 'express'
import { getAllPosts } from '../controller/Posts.Controller'

const postRouter = Router()

postRouter.get('/', getAllPosts)

export { postRouter }
