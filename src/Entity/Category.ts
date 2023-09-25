import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { User } from './User'
import { Post } from './Post'

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

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[]
}
