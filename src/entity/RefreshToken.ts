import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  Index,
} from 'typeorm'

import { User } from './User'

@Entity()
export class RefreshToken extends BaseEntity {
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
