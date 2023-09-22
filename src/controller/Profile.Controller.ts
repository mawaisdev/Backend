import { Response } from 'express'
import { ProfileService } from '../service/profileService'
import { ExtendedRequest } from '../service/types'

export class ProfileController {
  private profileService: ProfileService

  constructor(profileService: ProfileService) {
    this.profileService = profileService
  }

  profile = async (req: ExtendedRequest, res: Response) => {
    const user = req.user
    if (!user) return res.status(401).json({ message: 'Unauthorized' })

    const data = await this.profileService.getProfile(user.userName)

    if (!data) return res.status(401).json({ message: 'Unauthorized' })

    return res
      .status(200)
      .json({ status: 200, message: 'Successfully retrieved data', user: data })
  }
}
