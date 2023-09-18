import { ValidationError, validate } from 'class-validator'
import { SignupDto } from '../dto/auth/signup.dto'
import { plainToClass } from 'class-transformer'
import { LoginDto } from '../dto/auth/login.dto'

export type UserDataValidation<T> = {
  errors: ValidationError[]
  dto: T
}

export const ValidateSignUpDto = async (
  dto: SignupDto
): Promise<UserDataValidation<SignupDto>> => {
  const userDto = plainToClass(SignupDto, dto)
  const errors = await validate(userDto)

  return { errors, dto: userDto }
}

export const ValidateLoginDto = async (
  dto: LoginDto
): Promise<UserDataValidation<LoginDto>> => {
  const loginDto = plainToClass(LoginDto, dto)
  const errors = await validate(loginDto)
  return { errors, dto: loginDto }
}
