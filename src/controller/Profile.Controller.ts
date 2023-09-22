import { Response } from 'express'
import { ProfileService } from '../service/profileService'
import { ExtendedRequest } from '../service/types'
import { UpdatePasswordDto } from '../dto/auth/updatePassword.dto'
import { UpdatePasswordValidator } from '../utils/scheme.validator'

/**
 * Controller to handle profile-related operations.
 */
export class ProfileController {
  private profileService: ProfileService

  constructor(profileService: ProfileService) {
    this.profileService = profileService
  }

  /**
   * Fetch user profile details.
   * @param req - Extended request object containing user details.
   * @param res - Express response object.
   * @returns Express response object.
   */
  profile = async (req: ExtendedRequest, res: Response): Promise<Response> => {
    const user = req.user

    if (!user) return this.sendUnauthorizedResponse(res)

    const data = await this.profileService.getProfile(user.userName)

    if (!data) return res.status(404).json({ message: 'Profile not found' })

    return res
      .status(200)
      .json({ status: 200, message: 'Successfully retrieved data', user: data })
  }

  /**
   * Update a user's password.
   * @param req - Extended request object containing update details.
   * @param res - Express response object.
   * @returns Express response object.
   */
  updatePassword = async (
    req: ExtendedRequest,
    res: Response
  ): Promise<Response> => {
    // Check user authorization
    const user = req.user
    if (!user) return this.sendUnauthorizedResponse(res)

    // Validate request payload
    const { errors, dto } = await UpdatePasswordValidator(
      req.body as UpdatePasswordDto
    )
    if (errors.length > 0) {
      return this.sendBadRequestResponse(res, errors)
    }

    // Update password through service and send appropriate response
    const updateResult = await this.profileService.updatePassword(
      dto,
      user.userName
    )
    return res.status(updateResult.status).json(updateResult)
  }

  /**
   * Utility to send a bad request response.
   * @param res - Express response object.
   * @param errorMessages - Array of error messages.
   * @returns Express response object.
   */
  private sendBadRequestResponse(
    res: Response,
    errorMessages: string[]
  ): Response {
    return res
      .status(400)
      .json({ status: 400, errors: errorMessages, message: '' })
  }

  /**
   * Utility to send an unauthorized response.
   * @param res - Express response object.
   * @returns Express response object.
   */
  private sendUnauthorizedResponse(res: Response): Response {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
