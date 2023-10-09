import { Router } from 'express'
import { ProfileService } from '../Services/Profile.Service'
import { ProfileController } from '../Controller/Profile.Controller'
import { AppDataSource } from '../data-source'
import { User } from '../Entity/User'
import { RefreshToken } from '../Entity/RefreshToken'

const profileRouter = Router()
const userRepository = AppDataSource.getRepository(User)
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)

const profileService = new ProfileService(
  userRepository,
  refreshTokenRepository
)
const { profile, updatePassword } = new ProfileController(profileService)

profileRouter.get('/', profile)
profileRouter.post('/update-password', updatePassword)

export { profileRouter }
