import { Query, Resolver } from 'type-graphql'
import { User } from '../Entity/User'

@Resolver()
export class ProfileResolver {
  @Query(() => User)
  profile() {
    return {
      id: 12,
      firstName: 'Awais',
      email: 'awais@gmail.com',
    }
  }
}
