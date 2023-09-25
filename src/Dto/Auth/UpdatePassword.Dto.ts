import { IsString, Length } from 'class-validator'

export class UpdatePasswordDto {
  @IsString()
  @Length(6, 50)
  previousPassword: string = ''

  @IsString()
  @Length(6, 50)
  newPassword: string = ''
}
