import { config } from 'dotenv'
// Load environment variables from .env file.
config()

import { Converter } from 'showdown'
import * as path from 'path'
import * as fs from 'fs'

import express, { Request, Response } from 'express'
import 'reflect-metadata'
import morgan from 'morgan'
import cookiesParser from 'cookie-parser'

import { AppDataSource } from './data-source'
import { verifyJWT } from './Utils/Jwt.helpers'
import { corsOptions } from './Config/CorsOptions'
import cors from 'cors'
import { credentials } from './middleware/Credentials'
import { authRouter } from './Routes/Auth.Routes'
import { postRouter } from './Routes/Post.Routes'
import { profileRouter } from './Routes/Profile.Routes'
import { categoryRouter } from './Routes/Category.Routes'

async function initializeApp() {
  try {
    // Initialize data source (e.g., database connection).
    await AppDataSource.initialize()

    // Create an instance of an Express application.
    const app = express()

    // Enable Express to trust proxy headers (e.g., X-Forwarded-For).
    app.set('trust proxy', true)

    // Use Morgan for logging HTTP requests.
    app.use(morgan('dev'))

    // Middleware to set credentials headers for allowed origins.
    app.use(credentials)

    // Apply CORS (Cross-Origin Resource Sharing) configuration.
    app.use(cors(corsOptions))

    // Middleware to parse JSON payloads.
    app.use(express.json())

    // Middleware to parse cookies.
    app.use(cookiesParser())

    // Define the port on which the app should run.
    const PORT = process.env.PORT || 4000

    // Authentication routes.
    app.use('/auth', authRouter)

    app.get('/', homePage)

    // Apply JWT verification middleware.
    app.use(verifyJWT)

    // Routes for posts.
    app.use('/posts', postRouter)

    // Routes for Profile
    app.use('/profile', profileRouter)

    // Routes for Categories
    app.use('/category', categoryRouter)

    // Start the Express server on the specified port.
    app.listen(PORT, () => {
      console.log(`Express server has started on port ${PORT}`)
    })
  } catch (error) {
    // Log any unexpected errors during initialization.
    console.error('Error during app initialization:', error)
  }
}

// Start the application.
initializeApp()

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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>API Documentation</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
      </head>
      <body>
          <div class="markdown-body">
              ${htmlString}
          </div>
      </body>
      </html>
    `

    res.send(fullContent)
  })
}
