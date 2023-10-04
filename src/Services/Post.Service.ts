import { Repository } from 'typeorm'
import { Post } from '../Entity/Post'
import { AppDataSource } from '../data-source'
import { PostDto } from '../Dto/Post/Post.Dto'
import { InternalServerErrorResponse } from '../Helpers/Category/Category.Helpers'
import { dateNow } from '../Utils/Constants'
import { User } from '../Entity/User'
import { Category } from '../Entity/Category'

type getAllPostsType = {
  status: number
  response: string
  data: Post[]
  totalPostsCount: number
  CurrentCount: number
}
export class PostService {
  private postRepository: Repository<Post>
  private userRepository: Repository<User>
  private categoryRepository: Repository<Category>

  constructor() {
    this.postRepository = AppDataSource.getRepository(Post)
    this.userRepository = AppDataSource.getRepository(User)
    this.categoryRepository = AppDataSource.getRepository(Category)
  }

  createNewPost = async (dto: PostDto, userId: number) => {
    try {
      const { body, title, categoryId, imageUrl, isDraft, isPrivate } = dto
      const post = await this.postRepository.save({
        body,
        createdAt: dateNow,
        imageUrl,
        isDraft,
        title,
        isPrivate,
        userId,
        categoryId,
      })

      // const post = await this.postRepository.save(postSave)

      return {
        status: 201,
        response: 'Post Created Successfully',
        data: post,
      }
    } catch (error) {
      console.log('Post Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  deletePost = async (postId: number) => {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      select: ['id', 'title', 'body', 'isPrivate', 'isDraft'],
    })
    if (!post) return { status: 400, response: 'Post not Found', data: null }
    await this.postRepository.remove(post)
    return { status: 200, response: 'Post deleted Successfully', data: post }
  }
  getPostById = async (postId: string, userId?: number) => {
    try {
      const post = await this.postRepository
        .createQueryBuilder('post')
        .select([
          'post.id',
          'post.title',
          'post.body',
          'post.createdAt',
          'post.updatedAt',
          'post.isDraft',
          'post.isPrivate',
          'user.id',
          'user.userName',
          'user.email',
          'category.id',
          'category.name',
        ])
        .leftJoin('post.user', 'user')
        .leftJoin('post.category', 'category')
        .where('post.id = :postId', { postId: Number(postId) })
        .getOne()

      if (!post) {
        return { status: 404, response: 'Post Not Found', data: null }
      }

      // If post is neither draft nor private, return to anyone
      if (!post.isDraft && !post.isPrivate) {
        return {
          status: 200,
          response: 'Post Fetched Successfully',
          data: post,
        }
      }

      // If there's no logged-in user, and the post is draft/private, don't return it
      if (!userId) {
        return { status: 404, response: 'Post Not Found', data: null }
      }

      // If there's a logged-in user and the post belongs to them, return the post
      if (userId === post.user.id) {
        return {
          status: 200,
          response: 'Post Fetched Successfully',
          data: post,
        }
      }

      // If none of the above conditions are met, restrict access
      return { status: 403, response: 'Access Denied', data: null }
    } catch (error) {
      console.log('Post Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  // Get All User Specific Posts that are Public fetch Category and User

  getAllPostsbyUserId = async (userId: number) => {
    try {
      const posts = await this.postRepository.find({
        where: { userId },
        relations: ['category', 'user'],
      })
      return {
        status: 200,
        response: 'Posts Fetched Successfully',
        data: posts,
      }
    } catch (error) {
      console.log('Post Service Error: ', error)
      return InternalServerErrorResponse()
    }
  }

  // Get All Posts that are Public fetch Category and User
  getAllPosts = async (skip = 0, take = 10): Promise<getAllPostsType> => {
    try {
      const posts = await this.getPostsFromDb(skip, take)

      const totalPosts = await this.postRepository.count({
        where: { isDraft: false, isPrivate: false },
      }) // <-- Fetch total post count

      return {
        status: 200,
        response: 'Posts Fetched Successfully',
        data: posts,
        totalPostsCount: totalPosts,
        CurrentCount: posts.length,
      }
    } catch (error) {
      console.log('Post Service Error: ', error)
      return {
        response: 'Internal Server Error',
        status: 500,
        data: [],
        totalPostsCount: 0,
        CurrentCount: 0,
      }
    }
  }

  getPostsFromDb = async (skip = 0, take = 10) => {
    const posts = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.title',
        'post.body',
        'post.createdAt',
        'post.updatedAt',
        'category.id',
        'category.name', // Selecting only the 'name' field from 'category'
        'user.id',
        'user.userName',
        'user.email',
        'user.role',
      ])
      .leftJoin('post.category', 'category') // Use leftJoin instead of leftJoinAndSelect
      .leftJoin('post.user', 'user') // Use leftJoin instead of leftJoinAndSelect
      .where('post.isPrivate = :isPrivate', { isPrivate: false })
      .andWhere('post.isDraft = :isDraft', { isDraft: false })
      .skip(skip)
      .take(take)
      .getMany()

    return posts
  }
}
