import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './entity/User'
import { RefreshToken } from './entity/RefreshToken'
import { Category } from './entity/Category'

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
