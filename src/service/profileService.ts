import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { AppDataSource } from '../data-source'
import { UserProfile } from './types'
import { UpdatePasswordDto } from '../dto/auth/updatePassword.dto'
import { hashPassword, isValidPassword } from '../helpers/auth/auth.helper'
import { dateNow } from '../utils/constants'

export class ProfileService {
  private userRepository: Repository<User>

  constructor() {
    this.userRepository = AppDataSource.getRepository(User)
  }

  getProfile = async (username: string): Promise<UserProfile | null> => {
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

  updatePassword = async (
    { previousPassword, newPassword }: UpdatePasswordDto,
    username: string
  ) => {
    const user = await this.userRepository.findOne({
      where: {
        userName: username,
      },
    })

    if (!user) return { error: 'Invalid user', status: 400, message: '' }
    const isSamePassword = await isValidPassword(newPassword, user.password)
    if (isSamePassword)
      return {
        error: 'Same Password Can not be Updated',
        status: 400,
        message: '',
      }
    const isValidPreviousPassword = await isValidPassword(
      previousPassword,
      user.password
    )
    if (!isValidPreviousPassword)
      return { error: 'Invalid Previous Password', status: 400, message: '' }

    user.password = await hashPassword(newPassword)
    user.updatedAt = dateNow

    await this.userRepository.save(user)
    return { error: '', status: 200, message: 'Password Updated Successfully' }
  }
}
