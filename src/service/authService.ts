import { CreateUserResponse, LoginResponse, LoggedInUserData } from './types'
import { User } from '../entity/User'
import { SignupDto } from '../dto'
import { DateTime } from 'luxon'
import bcrypt from 'bcrypt'
import { LoginDto } from '../dto/auth/login.dto'

export const signup = async (
  userDto: SignupDto
): Promise<CreateUserResponse> => {
  try {
    const { userName, email, firstName, lastName = '', password } = userDto

    // Check if user exists based on username or email
    const userExist = await User.findOne({
      where: [{ userName: userName }, { email: email }],
    })

    if (userExist) {
      return { errors: 'User with this email or username already exists' }
    }

    const currentDate = DateTime.now().setZone('UTC').toJSDate()
    const hashedPassword = await hashPassword(password)

    const user = User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      createdAt: currentDate,
      updatedAt: currentDate,
      lastLogin: currentDate,
    })

    await user.save()

    return { errors: '', user }
  } catch (error) {
    console.error('Signup error:', error)
    throw new Error('An unexpected error occurred during signup.')
  }
}

export const login = async (dto: LoginDto): Promise<LoginResponse> => {
  return {
    token: '',
    refreshToken: '',
    status: 201,
    userData: { email: '', username: '' },
  }
  // Validate the user's credentials
  // Generate JWT token and refresh token if valid
  // Return the tokens
}

export const logout = async (refreshToken: string) => {
  // Invalidate the refresh token
  // Any other cleanup tasks when logging out
}

export const refreshToken = async (refreshToken: string) => {
  // Validate the refresh token
  // If valid, generate a new JWT token and return it
}

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}
