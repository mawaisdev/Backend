import { Router } from 'express'
import { ProfileService } from '../Services/Profile.Service'
import { ProfileController } from '../Controller/Profile.Controller'

const profileRouter = Router()
const profileService = new ProfileService()
const { profile, updatePassword } = new ProfileController(profileService)

profileRouter.get('/', profile)
profileRouter.post('/update-password', updatePassword)

export { profileRouter }
