import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { RefreshToken, User } from './entity/Index'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Awais12345',
  database: 'Posts',
  synchronize: true,
  logging: false,
  entities: [User, RefreshToken],
  migrations: [],
  subscribers: [],
})
