import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './Entity/User'
import { RefreshToken } from './Entity/RefreshToken'
import { Category } from './Entity/Category'
import { Post } from './Entity/Post'
import { Comment } from './Entity/Comment'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'awais',
  password: 'Awais12345',
  database: 'PostBlog',
  synchronize: false,
  logging: false,
  entities: [
    'src/Entity/User.ts',
    'src/Entity/RefreshToken.ts',
    'src/Entity/Category.ts',
    'src/Entity/Post.ts',
    'src/Entity/Comment.ts',
  ],
  migrations: ['src/Migration/*{.ts,.js}'],
})
