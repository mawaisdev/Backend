import { Query, Resolver } from 'type-graphql'
import { User } from '../Entity/User'

@Resolver()
export class UserResolver {
  @Query(() => User)
  me() {}

  @Query(() => Boolean)
  isVerified() {
    return true
  }
}
