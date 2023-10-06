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

// Public routes
publicRouter.get('/', homePage)
publicRouter.get('/posts', getAllPosts)
publicRouter.get('/posts/:id', validateId, getPostById)
publicRouter.use('/auth', authRouter)

export { publicRouter }
