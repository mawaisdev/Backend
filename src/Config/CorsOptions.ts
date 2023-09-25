import { allowedOrigins } from './AllowedOrigins'
import { CorsOptions } from 'cors'

/**
 * Determines if the provided origin is allowed access based on a predefined list of domains or patterns.
 *
 * @param origin - The origin domain of the request.
 * @returns boolean - Returns true if the origin is allowed; otherwise, false.
 */
export const isOriginAllowed = (origin: string): boolean => {
  // Check if the origin is in the list of explicitly allowed origins.
  if (allowedOrigins.includes(origin)) return true

  // Check if the origin matches the "ngrok-free.app" pattern. This allows for dynamic subdomains under "ngrok-free.app".
  const ngrokPattern = /ngrok-free\.app$/
  if (ngrokPattern.test(origin)) return true

  // If none of the above conditions match, the origin is not allowed.
  return false
}

/**
 * CORS configuration for the application.
 * Uses the `isOriginAllowed` function to determine if an incoming request's origin is permitted.
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Check the origin against our `isOriginAllowed` function.
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200, // Respond with 200 for preflight requests.
}

// basic middleware to use in production when I know my full origin address
// export const corsOptions: CorsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.indexOf(origin ? origin : '') !== -1 || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by cors'))
//     }
//   },
//   optionsSuccessStatus: 200,
// }
