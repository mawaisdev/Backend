import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'
import { Post } from './Post'

@Entity('Comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: false })
  text: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User

  // Self-referencing relationship
  @ManyToOne(() => Comment, (comment) => comment.children)
  @JoinColumn({ name: 'parentId' })
  parent: Comment | null

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[]
}
