import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  name: string

  @Column({ nullable: true })
  description: string

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date

  @CreateDateColumn({ nullable: true }) createdAt: Date

  @Column({ nullable: true })
  updatedById: number

  @ManyToOne((type) => User, (user) => user.categories)
  createdBy: User
}
