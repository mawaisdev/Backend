import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import {
  IsAlphanumeric,
  IsEmail,
  Length,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  IsDate,
  IsOptional,
} from 'class-validator'
import { RefreshToken } from './RefreshToken'
import { UserRole } from '../Config/UserRoles'
import { Category } from './Category'
import { Post } from './Post'
import { Comment } from './Comment'
import { Field, Int, ObjectType } from 'type-graphql'

@Entity('Users')
@ObjectType()
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20 })
  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @MaxLength(20)
  firstName: string

  @Column()
  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  lastName: string

  @Column()
  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsAlphanumeric()
  userName: string

  @Column()
  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @Column()
  @IsNotEmpty()
  @Length(6, 20)
  password: string

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  @IsOptional()
  profilePicture: string

  @Column({ length: 300, nullable: true })
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(300)
  bio: string

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  lastLogin: Date

  @IsOptional()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole

  @Column({ nullable: true })
  resetPasswordCode: string

  @Column({ default: false })
  @IsBoolean()
  isVerified: boolean

  @Column({ default: false })
  @IsBoolean()
  isDeleted: boolean

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  createdAt: Date

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  updatedAt: Date

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  deletedAt: Date

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
  })
  refreshTokens: RefreshToken[]

  @OneToMany(() => Category, (category) => category.createdBy)
  categories: Category[]

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]
}
