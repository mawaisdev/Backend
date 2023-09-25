import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'
import { Category } from './Category'
// import { Like } from "./Like";    // For future use
// import { Comment } from "./Comment";  // For future use

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
  createdBy: number // assuming this is the ID of the user who created the post

  @CreateDateColumn()
  createdAt: Date

  @Column()
  updatedBy: number // assuming this is the ID of the user who last updated the post

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE', // delete posts if the user is deleted
    nullable: false,
  })
  user: User

  @ManyToOne(() => Category, (category) => category.posts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  category: Category

  // Future placeholders for likes and comments
  // @OneToMany(() => Like, like => like.post)
  // likes: Like[];

  // @OneToMany(() => Comment, comment => comment.post)
  // comments: Comment[];

  // You can still add other fields like created at, updated at, etc.
}
