import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator'

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsOptional()
  password?: string

  @IsString()
  @IsOptional()
  token?: string
}
