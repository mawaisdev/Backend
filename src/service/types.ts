import { User } from '../entity/User'

export type CreateUserResponse = {
  errors?: string
  user?: User
}
