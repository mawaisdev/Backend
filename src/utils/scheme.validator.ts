import { ValidationError, validate } from 'class-validator'
import { SignupDto } from '../dto/auth/signup.dto'
import { plainToClass } from 'class-transformer'

export type UserDataValidation = {
  errors: ValidationError[]
  userDto: SignupDto
}

export const ValidateUserDto = async (
  dto: SignupDto
): Promise<UserDataValidation> => {
  const userDto = plainToClass(SignupDto, dto)
  const errors = await validate(userDto)

  return { errors, userDto }
}
