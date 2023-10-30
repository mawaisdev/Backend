import express, { Request, Response } from 'express'
import { validateId } from '../Middleware/ValidateId'
import { authRouter } from './Auth.Routes'
import { getAllPosts, getPostById } from '../Controller/Posts.Controller'
import path from 'path'
import { Converter } from 'showdown'
import fs from 'fs'

const publicRouter = express.Router()

const homePage = async (req: Request, res: Response) => {
  const filePath = path.join(__dirname, '..', 'API_README.md')

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err)
      return res.sendStatus(500)
    }

    // Convert markdown to HTML using showdown
    const converter = new Converter()
    const htmlString = converter.makeHtml(data)
    const fullContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                    <meta charset="UTF-8">
                    ...
        `
    res.send(fullContent)
  })
}

// Setting up Get Comments for Post
import { CommentController } from '../Controller/Comment.Controller'
import { CommentService } from '../Services/Comment.Service'
import { AppDataSource } from '../data-source'
import { Post } from '../Entity/Post'
import { Comment } from '../Entity/Comment'

const commentRepository = AppDataSource.getRepository(Comment)
const postRepository = AppDataSource.getRepository(Post)

const commentService = new CommentService(commentRepository, postRepository)
const commentController = new CommentController(commentService)
const { getCommentsForPost } = commentController

/// End Here

// Public routes
publicRouter.get('/', homePage)
publicRouter.get('/posts', getAllPosts)
publicRouter.get('/posts/:id', validateId, getPostById)
publicRouter.get('/allcomments/:id/comments', validateId, getCommentsForPost)
publicRouter.use('/auth', authRouter)

export { publicRouter, getCommentsForPost }
