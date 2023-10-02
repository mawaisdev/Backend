import { Repository } from 'typeorm'
import { Post } from '../Entity/Post'
import { AppDataSource } from '../data-source'
import { CreatePostDto } from '../Dto/Post/Post.Dto'
import { InternalServerErrorResponse } from '../Helpers/Category/Category.Helpers'
import { dateNow } from '../Utils/Constants'
import { User } from '../Entity/User'
import { Category } from '../Entity/Category'

export class PostService {
  private postRepository: Repository<Post>
  private userRepository: Repository<User>
  private categoryRepository: Repository<Category>

  constructor() {
    this.postRepository = AppDataSource.getRepository(Post)
    this.userRepository = AppDataSource.getRepository(User)
    this.categoryRepository = AppDataSource.getRepository(Category)
  }

  createNewPost = async (dto: CreatePostDto, userId: number) => {
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

  getPostById = async (postId: number) => {
    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['user'],
      })
      return post
        ? { status: 200, response: 'Post Fetched Successfully', data: post }
        : { status: 404, response: 'Post Not Found', data: null }
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
}
