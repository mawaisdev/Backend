import { allowedOrigins } from './allowedOrigins'
import { CorsOptions } from 'cors'

// currently using this as I will get a new address from free version of ng rok

export const isOriginAllowed = (origin: string): boolean => {
  // Allow specific domains
  if (allowedOrigins.includes(origin)) return true

  // Allow any domain containing "ngrok-free.app"
  const ngrokPattern = /ngrok-free\.app$/
  if (ngrokPattern.test(origin)) return true

  return false
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by cors'))
    }
  },
  optionsSuccessStatus: 200,
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
