import { Response } from 'express'
import { ProfileService } from '../service/profileService'
import { ExtendedRequest } from '../service/types'
import { UpdatePasswordDto } from '../dto/auth/updatePassword.dto'
import { UpdatePasswordValidator } from '../utils/scheme.validator'

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

  updatePassword = async (req: ExtendedRequest, res: Response) => {
    const user = req.user
    if (!user) return res.status(401).json({ message: 'Unauthorized' })
    const data = req.body as UpdatePasswordDto
    const { errors, dto } = await UpdatePasswordValidator(data)
    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints!))
        .flat()
      return res
        .status(400)
        .json({ status: 400, errors: [...errorMessages], message: '' })
    }

    const { error, message, status } = await this.profileService.updatePassword(
      data,
      user.userName
    )
    return res.status(status).json({ status, error, message })
  }
}
