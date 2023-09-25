import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './Entity/User'
import { RefreshToken } from './Entity/RefreshToken'
import { Category } from './Entity/Category'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'awais',
  password: 'Awais12345',
  database: 'Posts',
  synchronize: true,
  logging: false,
  entities: [User, RefreshToken, Category],
  migrations: [],
  subscribers: [],
})
