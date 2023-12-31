import { ValidationError, validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { SignupDto } from '../Dto/Auth/Signup.Dto'
import { LoginDto } from '../Dto/Auth/Login.Dto'
import { ResetPasswordDto } from '../Dto/Auth/ResetPassword.Dto'
import { ResetPasswordValidation } from '../Services/types'
import { UpdatePasswordDto } from '../Dto/Auth/UpdatePassword.Dto'
import { CategoryDto } from '../Dto/Category/Category.Dto'
import { PostDto } from '../Dto/Post/Post.Dto'
import { CommentDTO } from '../Dto/Comment/Comment.Dto'

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

export const CreateCategoryValidator = async (dto: CategoryDto) => {
  // Convert the plain object to a CreateCAategoryValidator instance
  const createCategoryDto = plainToClass(CategoryDto, dto)

  // validate the DTO using class validator
  const validationErrors = await validate(createCategoryDto)
  const errors = extractErrorMessages(validationErrors)

  return { errors, dto: createCategoryDto }
}

export const CreatePostValidator = async (dto: PostDto) => {
  // Convert the plain object to a CreatePostDto instance
  const createPostDto = plainToClass(PostDto, dto)

  // validate the DTO using class validator
  const validationErrors = await validate(createPostDto)
  const errors = extractErrorMessages(validationErrors)

  return { errors, dto: createPostDto }
}

export const CommentDtoValidator = async (dto: CommentDTO) => {
  const commentDto = plainToClass(CommentDTO, dto)
  const validationErrors = await validate(commentDto)
  const errors = extractErrorMessages(validationErrors)

  return { errors, dto: commentDto }
}

// Utility to extract error messages from validation results
const extractErrorMessages = (errors: ValidationError[]): string[] => {
  return errors.map((error) => Object.values(error.constraints!)).flat()
}
