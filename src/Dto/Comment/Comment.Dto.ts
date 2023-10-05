import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator'

export class CommentDTO {
  @IsString()
  @IsNotEmpty()
  text: string

  @IsInt()
  @IsNotEmpty()
  postId: number

  @IsInt()
  @IsOptional()
  userId: number

  @IsInt()
  @IsOptional()
  parentId?: number | null
}
