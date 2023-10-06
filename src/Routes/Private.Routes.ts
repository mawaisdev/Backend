import express from 'express'
import { verifyJWT } from '../Utils/Jwt.helpers'
import { categoryRouter } from './Category.Routes'
import { commentRouter } from './Comment.Route'
import { postRouter } from './Post.Routes'
import { profileRouter } from './Profile.Routes'

const privateRouter = express.Router()

// Apply JWT verification middleware.
privateRouter.use(verifyJWT)

// Routes for posts.
privateRouter.use('/posts', postRouter)

// Routes for Profile
privateRouter.use('/profile', profileRouter)

// Routes for Categories
privateRouter.use('/category', categoryRouter)

// Routes for Comments
privateRouter.use('/comments', commentRouter)

export default privateRouter
