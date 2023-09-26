import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNotEmpty,
} from 'class-validator'

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  body: string

  @IsOptional() // because it's nullable in Post entity
  @IsString()
  imageUrl?: string

  @IsOptional() // default is true, but can be provided
  @IsBoolean()
  isDraft?: boolean

  @IsOptional() // default is false, but can be provided
  @IsBoolean()
  isPrivate?: boolean

  @IsNotEmpty()
  @IsInt()
  createdBy: number

  @IsNotEmpty()
  @IsInt()
  updatedBy: number

  @IsNotEmpty()
  @IsInt()
  userId: number // assuming this will be provided in the DTO to link post to user

  @IsOptional() // because it's nullable in your Post entity
  @IsInt()
  categoryId?: number // assuming this will be provided in the DTO to link post to category
}
