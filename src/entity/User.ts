import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm'
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
import { UserRole } from '../config/userRoles'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 20 })
  @IsNotEmpty()
  @MaxLength(20)
  firstName: string

  @Column()
  @IsNotEmpty()
  lastName: string

  @Column()
  @IsNotEmpty()
  @IsAlphanumeric()
  userName: string

  @Column()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @Column()
  @IsNotEmpty()
  @Length(6, 20)
  password: string

  @Column({ nullable: true })
  @IsOptional()
  profilePicture: string

  @Column({ length: 300, nullable: true })
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
}