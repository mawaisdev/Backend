import { Query, Resolver } from 'type-graphql'
import { Category } from '../Entity/Category'
import { User } from '../Entity/User'

@Resolver()
export class CategoryResolver {
  @Query(() => User)
  category() {
    return {
      id: 12,
      firstName: 'Awais',
      email: 'awais@gmail.com',
    }
  }
}
