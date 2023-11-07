import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { User } from './User'
import { Category } from './Category'
import { Comment } from './Comment' // For future use

@Entity('Posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: false })
  title: string

  @Column('text', { nullable: false })
  body: string

  @Column('text', { nullable: true })
  imageUrl: string | null

  @Column({ type: 'boolean', default: true })
  isDraft: boolean // true means post is in draft mode, false means it's published

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean // true means post is private, false means it's public

  @Column()
  updatedBy: number // assuming this is the ID of the user who last updated the post

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column() // <-- Direct access to the foreign key
  userId: number
  @Column() // <-- Direct access to the foreign key
  categoryId: number

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE', // delete posts if the user is deleted
    nullable: false,
  })
  @JoinColumn({ name: 'userId' }) // This ensures that the relation uses the userId column
  user: User

  @ManyToOne(() => Category, (category) => category.posts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' }) // This ensures that the relation uses the categoryId column
  category: Category

  @OneToMany(() => Comment, (comment) => comment.post, {
    onDelete: 'CASCADE', // Delete comments when the post is deleted
  })
  comments: Comment[]

  // You can still add other fields like created at, updated at, etc.
}
