import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { AppDataSource } from '../data-source'
import { UserProfile } from './types'

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

  updatePassword = async (password: string, newPassword: string) => {
    return ''
  }
}
