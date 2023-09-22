import { Router } from 'express'
import { ProfileService } from '../service/profileService'
import { ProfileController } from '../controller/Profile.Controller'

const profileRouter = Router()
const profileService = new ProfileService()
const { profile } = new ProfileController(profileService)

profileRouter.get('/', profile)

export { profileRouter }
