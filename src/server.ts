import { config } from 'dotenv'
config()

import express from 'express'
import 'reflect-metadata'
import morgan from 'morgan'
import { authRouter, postRouter } from './routes/index'
import cookiesParser from 'cookie-parser'

import { AppDataSource } from './data-source'
import { verifyJWT } from './utils/jwt-helpers'

async function initializeApp() {
  try {
    await AppDataSource.initialize()

    const app = express()
    // Enable express to get X-forwarded-to address
    app.set('trust proxy', true)
    app.use(morgan('dev'))
    app.use(express.json())
    //middleware for cookies
    app.use(cookiesParser())

    const PORT = process.env.PORT || 4000

    app.use('/auth', authRouter)

    app.use(verifyJWT)
    app.use('/posts', postRouter)

    app.listen(PORT, () => {
      console.log(`Express server has started on port ${PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}
initializeApp()
