import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'
import { UserRole } from '../../Config/UserRoles'

export class SignupDto {
  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  @IsAlpha()
  firstName: string = ''

  @IsString()
  @IsAlpha()
  @IsOptional()
  lastName: string | undefined

  @IsAlphanumeric()
  @IsString()
  userName: string = ''

  @IsEmail()
  email: string = ''

  @IsString()
  @Length(6, 50)
  password: string = ''

  @IsEnum(UserRole)
  role: UserRole.User
}
