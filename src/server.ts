import express from 'express'
import 'reflect-metadata'
import morgan from 'morgan'
import { authRouter } from './routes/index'

import { AppDataSource } from './data-source'

async function initializeApp() {
  try {
    await AppDataSource.initialize()

    const app = express()
    app.use(morgan('dev'))
    app.use(express.json())

    const PORT = process.env.PORT || 4000

    app.use('/auth', authRouter)

    app.listen(PORT, () => {
      console.log(
        `Express server has started on port ${PORT}. Open http://localhost:${PORT}/to see results`
      )
    })
  } catch (error) {
    console.log(error)
  }
}

initializeApp()
