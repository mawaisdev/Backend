import { Query, Resolver } from 'type-graphql'
import { Comment } from '../Entity/Comment'
import { User } from '../Entity/User'

@Resolver()
export class CommentResolver {
  @Query(() => User)
  comment() {
    return {
      id: 12,
      firstName: 'Awais',
      email: 'awais@gmail.com',
    }
  }
}
