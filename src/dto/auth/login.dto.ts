import { IsAlphanumeric, IsString, Length } from 'class-validator'

export class LoginDto {
  @IsAlphanumeric()
  @IsString()
  userName: string = ''

  @IsString()
  @Length(6, 50)
  password: string = ''
}
