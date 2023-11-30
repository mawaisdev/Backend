import { Query, Resolver } from 'type-graphql'
import { User } from '../Entity/User'

@Resolver()
export class PostResolver {
  @Query(() => User)
  post() {
    return {
      id: 12,
      firstName: 'Awais',
      email: 'awais@gmail.com',
    }
  }
}
