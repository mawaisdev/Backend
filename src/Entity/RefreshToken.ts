import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  Index,
} from 'typeorm'

import { User } from './User'

@Entity('RefreshTokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  ipAddress: string

  @Column()
  issuedAt: Date

  @Column()
  expiresAt: Date

  @Column()
  @Index()
  token: string

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User
}
