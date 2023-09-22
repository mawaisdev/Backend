import { ValidationError, validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { SignupDto } from '../dto/auth/signup.dto'
import { LoginDto } from '../dto/auth/login.dto'

/**
 * Type definition for the result of data validation.
 * Contains any validation errors and the validated DTO.
 */
export type UserDataValidation<T> = {
  errors: ValidationError[]
  dto: T
}

/**
 * Validates the data for user signup using the SignupDto.
 *
 * @param dto - The data to validate, as a plain object.
 * @returns UserDataValidation<SignupDto> - The validated DTO and any validation errors.
 */
export const ValidateSignUpDto = async (
  dto: SignupDto
): Promise<UserDataValidation<SignupDto>> => {
  // Convert the plain object to a SignupDto instance.
  const userDto = plainToClass(SignupDto, dto)

  // Validate the DTO using class-validator.
  const errors = await validate(userDto)

  return { errors, dto: userDto }
}

/**
 * Validates the data for user login using the LoginDto.
 *
 * @param dto - The data to validate, as a plain object.
 * @returns UserDataValidation<LoginDto> - The validated DTO and any validation errors.
 */
export const ValidateLoginDto = async (
  dto: LoginDto
): Promise<UserDataValidation<LoginDto>> => {
  // Convert the plain object to a LoginDto instance.
  const loginDto = plainToClass(LoginDto, dto)

  // Validate the DTO using class-validator.
  const errors = await validate(loginDto)

  return { errors, dto: loginDto }
}
