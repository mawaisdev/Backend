import { config } from 'dotenv'
// Load environment variables from .env file.
config()

import express from 'express'
import 'reflect-metadata'
import morgan from 'morgan'
import cookiesParser from 'cookie-parser'

import { AppDataSource } from './data-source'
import { corsOptions } from './Config/CorsOptions'
import cors from 'cors'
import { credentials } from './Middleware/Credentials'
import privateRouter from './Routes/Private.Routes'
import { publicRouter } from './Routes/Public.Routes'
import { UserResolver } from './Resolver/user.resolver'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core'
import { ProfileResolver } from './Resolver/profile.resolver'
import { CategoryResolver } from './Resolver/category.resolver'
import { CommentResolver } from './Resolver/comment.resolver'
import { PostResolver } from './Resolver/post.resolver'

async function initializeApp() {
  try {
    // Initialize data source (e.g., database connection).
    await AppDataSource.initialize()

    // build schema
    const schema = await buildSchema({
      resolvers: [
        UserResolver,
        ProfileResolver,
        CategoryResolver,
        CommentResolver,
        PostResolver,
      ],
      // authChecker,
    })
    // Create an instance of an Express application.
    const app = express() // Middleware to parse cookies.
    app.use(cookiesParser())

    const server = new ApolloServer({
      schema,
      context: (ctx) => {
        return ctx
      },
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault()
          : ApolloServerPluginLandingPageGraphQLPlayground(),
      ],
    })

    await server.start()
    server.applyMiddleware({ app })
    // Enable Express to trust proxy headers (e.g., X-Forwarded-For).
    app.set('trust proxy', true)

    // Use Morgan for logging HTTP requests.
    app.use(morgan('dev') as express.RequestHandler)
    // Use Morgan for logging HTTP requests.
    app.use(morgan('dev'))

    // Middleware to set credentials headers for allowed origins.
    app.use(credentials)

    // Apply CORS (Cross-Origin Resource Sharing) configuration.
    app.use(cors(corsOptions))

    // Middleware to parse JSON payloads.
    app.use(express.json())

    // Define the port on which the app should run.
    const PORT = process.env.PORT || 4000

    // Use public and private routers.
    app.use('/', publicRouter)
    app.use('/', privateRouter)
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
