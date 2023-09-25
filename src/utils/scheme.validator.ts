import { ValidationError, validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { SignupDto } from '../dto/auth/signup.dto'
import { LoginDto } from '../dto/auth/login.dto'
import { ResetPasswordDto } from '../dto/auth/resetPassword.dto'
import { ResetPasswordValidation } from '../service/types'
import { UpdatePasswordDto } from '../dto/auth/updatePassword.dto'
import { CreateCategoryDto } from '../dto/category/category.dto'

/**
 * Type definition for the result of data validation.
 * Contains any validation errors and the validated DTO.
 */
export type UserDataValidation<T> = {
  errors: string[]
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
  const validationErrors = await validate(userDto)
  const errors = extractErrorMessages(validationErrors)

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
  const validationErrors = await validate(loginDto)
  const errors = extractErrorMessages(validationErrors)

  return { errors, dto: loginDto }
}

/**
 * Validates the data for resetting a password using the ResetPasswordDto.
 *
 * @param dto - The data to validate, as a plain object.
 * @returns ResetPasswordValidation<ResetPasswordDto> - The validated DTO and any validation errors.
 */
export const ValidateResetPasswordDto = async (
  dto: ResetPasswordDto
): Promise<ResetPasswordValidation> => {
  // Convert the plain object to a ResetPasswordDto instance.
  const resetPasswordDto = plainToClass(ResetPasswordDto, dto)

  // Validate the DTO using class-validator.
  const validationErrors = await validate(resetPasswordDto)
  const errors = extractErrorMessages(validationErrors)

  return { errors, dto: resetPasswordDto }
}

export const UpdatePasswordValidator = async (dto: UpdatePasswordDto) => {
  // Convert the plain object to a UpdatePasswordDto instance
  const updatePasswordDto = plainToClass(UpdatePasswordDto, dto)

  // validate the DTO using class validator
  const validationErrors = await validate(updatePasswordDto)
  const errors = extractErrorMessages(validationErrors)

  return { errors, dto: updatePasswordDto }
}

export const CreateCAategoryValidator = async (dto: CreateCategoryDto) => {
  // Convert the plain object to a CreateCAategoryValidator instance
  const createCategoryDto = plainToClass(CreateCategoryDto, dto)

  // validate the DTO using class validator
  const validationErrors = await validate(createCategoryDto)
  const errors = extractErrorMessages(validationErrors)

  return { errors, dto: createCategoryDto }
}

// Utility to extract error messages from validation results
const extractErrorMessages = (errors: ValidationError[]): string[] => {
  return errors.map((error) => Object.values(error.constraints!)).flat()
}
