import { Not, Repository } from 'typeorm'
import { AppDataSource } from '../data-source'
import { User } from '../Entity/User'
import { RefreshToken } from '../Entity/RefreshToken'
import { UserProfile } from './types'
import { UpdatePasswordDto } from '../Dto/Auth/UpdatePassword.Dto'
import { hashPassword, isValidPassword } from '../Helpers/Auth/Auth.Helpers'
import { dateNow } from '../Utils/Constants'

/**
 * ProfileService provides functionality to manage user profiles.
 */
export class ProfileService {
  private userRepository: Repository<User>
  private refreshTokenRepository: Repository<RefreshToken>

  constructor() {
    this.userRepository = AppDataSource.getRepository(User)
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
  }

  /**
   * Retrieves the profile of a user.
   * @param username - The username of the user.
   * @returns The user profile or null if not found.
   */
  getProfile = async (username: string): Promise<UserProfile | null> => {
    // Fetch user data based on username
    const userData = await this.userRepository.findOne({
      where: { userName: username },
      select: [
        'firstName',
        'lastName',
        'userName',
        'email',
        'profilePicture',
        'bio',
        'lastLogin',
        'role',
      ],
    })

    return userData
  }

  /**
   * Updates the password of a user.
   * @param {UpdatePasswordDto} - The DTO containing previous and new passwords.
   * @param username - The username of the user.
   * @param ip - The IP address of the request.
   * @returns An object containing the status, error, and message.
   */
  updatePassword = async (
    { previousPassword, newPassword }: UpdatePasswordDto,
    username: string,
    ip: string
  ) => {
    // Find the user by username
    const user = await this.userRepository.findOne({
      where: {
        userName: username,
      },
    })

    if (!user) return { error: 'Invalid user', status: 400, message: '' }

    // Check if the new password is the same as the existing one
    const isSamePassword = await isValidPassword(newPassword, user.password)
    if (isSamePassword)
      return {
        error: 'Same Password Can not be Updated',
        status: 400,
        message: '',
      }

    // Validate the previous password provided by the user
    const isValidPreviousPassword = await isValidPassword(
      previousPassword,
      user.password
    )
    if (!isValidPreviousPassword)
      return { error: 'Invalid Previous Password', status: 400, message: '' }

    // Update the user password and set the updated timestamp
    user.password = await hashPassword(newPassword)
    user.updatedAt = dateNow

    // Remove all refresh tokens for the user, excluding the current session IP
    const tokens = await this.refreshTokenRepository.find({
      relations: ['user'],
      where: { user: { id: user.id }, ipAddress: Not(ip) },
    })
    await this.refreshTokenRepository.remove(tokens)

    // Save the updated user data
    await this.userRepository.save(user)
    return { error: '', status: 200, message: 'Password Updated Successfully' }
  }
}
