// 1. Framework specific imports
import { Request, Response } from 'express'

// 2. Configuration and constants
import { UserRole } from '../Config/UserRoles'

// 3. Data sources and utilities
import { AppDataSource } from '../data-source'

// 4. Types and interfaces
import { ExtendedRequest } from '../Services/types'

// 5. Entities or models
import { Post } from '../Entity/Post'
import { Comment } from '../Entity/Comment'
import { Category } from '../Entity/Category'
import { User } from '../Entity/User'

// 6. Services
import { PostService } from '../Services/Post.Service'
import { CategoryService } from '../Services/Category.Service'
import { CommentService } from '../Services/Comment.Service'

// 7. Helpers and validators
import { InternalServerErrorResponse } from '../Helpers/Category/Category.Helpers'
import { CreatePostValidator } from '../Utils/Scheme.Validators'

type GetAllPostsQueryType = {
  skip?: number
  take?: number
}

/**
 * Retrieve all posts based on pagination parameters.
 *
 * @param {Request} req - Express request object containing query parameters for pagination.
 * @param {Response} res - Express response object used to send the data back to the client.
 * @returns {Response} Returns the posts in a paginated format, along with status, response, total post count, and current post count.
 */
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    /**
     * Extract pagination parameters from request query.
     */
    const { skip, take } = req.query as GetAllPostsQueryType

    /**
     * Get post and comment repositories from the data source.
     */
    const postRepository = AppDataSource.getRepository(Post)
    const commentRepository = AppDataSource.getRepository(Comment)

    /**
     * Initialize comment service with repositories.
     */
    const commentService = new CommentService(commentRepository, postRepository)

    /**
     * Initialize post service with repositories and services.
     */
    const postService = new PostService(postRepository, commentService)

    /**
     * Fetch all posts using post service.
     */
    const { status, response, data, totalPostsCount, CurrentCount } =
      await postService.getAllPosts(
        Number(skip ? skip : 0), // Default to 0 if skip is not provided.
        Number(take ? take : 10) // Default to 10 if take is not provided.
      )

    /**
     * Return the fetched posts in the response.
     */
    return res.status(status).json({
      status,
      response,
      data,
      totalPostsCount,
      CurrentPostsCount: CurrentCount,
    })
  } catch (error) {
    /**
     * Log any unexpected errors and return a server error response.
     */
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Add a new post.
 *
 * @param {ExtendedRequest} req - Extended request object containing user and body data.
 * @param {Response} res - Express response object used to send the data back to the client.
 * @returns {Response} Returns a status and response message based on the post creation result.
 */
export const addPost = async (req: ExtendedRequest, res: Response) => {
  try {
    /**
     * Obtain post and comment repositories from the data source.
     */
    const postRepository = AppDataSource.getRepository(Post)
    const commentRepository = AppDataSource.getRepository(Comment)
    const commentService = new CommentService(commentRepository, postRepository)
    const postService = new PostService(postRepository, commentService)

    /**
     * Obtain category and user repositories from the data source.
     */
    const categoryRepository = AppDataSource.getRepository(Category)
    const userRepository = AppDataSource.getRepository(User)
    const categoryService = new CategoryService(
      categoryRepository,
      userRepository
    )

    /**
     * Validate the request body for post creation.
     */
    const { errors: validationErrors, dto: postDto } =
      await CreatePostValidator(req.body)
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 400,
        response: 'Error Occurred while adding a new Post.',
        data: null,
      })
    }

    /**
     * Validate user from request.
     */
    const user = req.user
    if (!user) {
      return res.status(400).json({
        status: 400,
        response: 'Invalid User',
        data: null,
      })
    }

    /**
     * If a category ID is provided, validate the category.
     */
    if (postDto && postDto.categoryId) {
      const category = await categoryService.getCategoryById(postDto.categoryId)
      if (category.status === 404) {
        return res.status(404).json({
          status: 404,
          response: category.response,
          data: null,
        })
      }
    }

    /**
     * Create a new post using the post service.
     */
    const { status, data, response } = await postService.createNewPost(
      postDto,
      user.id
    )

    /**
     * Return the post creation result.
     */
    return res.status(status).json({ status, response, data })
  } catch (error) {
    /**
     * Log any unexpected errors and return a server error response.
     */
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Delete a post based on its ID.
 * Only the user who created the post or an admin can delete it.
 *
 * @param {ExtendedRequest} req - Extended request object containing user data and post ID in params.
 * @param {Response} res - Express response object used to send the deletion result back to the client.
 * @returns {Response} Returns a status and response message based on the post deletion result.
 */
export const deletePost = async (req: ExtendedRequest, res: Response) => {
  try {
    /**
     * Obtain post and comment repositories from the data source.
     */
    const postRepository = AppDataSource.getRepository(Post)
    const commentRepository = AppDataSource.getRepository(Comment)

    /**
     * Initialize comment and post services with the respective repositories.
     */
    const commentService = new CommentService(commentRepository, postRepository)
    const postService = new PostService(postRepository, commentService)

    /**
     * Extract user information from the request object.
     */
    const user = req.user

    /**
     * Extract the post ID from the request parameters.
     */
    const { id: postId } = req.params

    /**
     * Check if the post with the given ID exists.
     */
    const postById = await postService.getPostById(postId, user?.id)
    if (postById.status === 404) {
      return res.status(postById.status).json({
        status: postById.status,
        response: postById.response,
        data: postById.data,
      })
    }

    /**
     * Ensure that only the user who created the post or an admin can delete it.
     */
    if (
      !(user?.roles === UserRole.Admin || user?.id === postById.data?.user.id)
    ) {
      return res.status(401).json({
        status: 401,
        response: 'Not Allowed',
        data: null,
      })
    }

    /**
     * Delete the post using the post service.
     */
    const { status, response, data } = await postService.deletePost(
      Number(postId)
    )

    /**
     * Return the post deletion result.
     */
    return res.status(status).json({ status, response, data })
  } catch (error) {
    /**
     * Log any unexpected errors and return a server error response.
     */
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Retrieve a post based on its ID.
 * If the user is authenticated, additional details related to the user might be fetched.
 *
 * @param {ExtendedRequest} req - Extended request object containing user data and post ID in params.
 * @param {Response} res - Express response object used to send the fetched post data back to the client.
 * @returns {Response} Returns a status, response message, and post data based on the search result.
 */
export const getPostById = async (req: ExtendedRequest, res: Response) => {
  try {
    /**
     * Obtain post and comment repositories from the data source.
     */
    const postRepository = AppDataSource.getRepository(Post)
    const commentRepository = AppDataSource.getRepository(Comment)

    /**
     * Initialize comment and post services with the respective repositories.
     */
    const commentService = new CommentService(commentRepository, postRepository)
    const postService = new PostService(postRepository, commentService)

    /**
     * Extract the post ID from the request parameters.
     */
    const { id } = req.params

    /**
     * Extract user information from the request object.
     */
    const user = req.user

    /**
     * If the user is not authenticated, fetch the post without any user-specific details.
     */
    if (!user) {
      const {
        commentsPageNumber,
        commentsPageSize,
        commentsTotalCount,
        commentsRemainingCount,
        data,
        response,
        status,
      } = await postService.getPostById(id)
      return res.status(status).json({
        status: status,
        response: response,
        data: data ? data : null,
        pageNumber: commentsPageNumber,
        pageSize: commentsPageSize,
        totalCommentsCount: commentsTotalCount,
        remainingCommentsCount: commentsRemainingCount,
      })
    }

    /**
     * If the user is authenticated, fetch the post with potential user-specific details.
     */
    const { data, response, status } = await postService.getPostById(
      id,
      user.id
    )

    /**
     * Return the fetched post data.
     */
    return res
      .status(status)
      .json({ status, response, data: data ? data : null })
  } catch (error) {
    /**
     * Log any unexpected errors and return a server error response.
     */
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Update a post based on its ID and the provided data.
 * Only the authenticated user who created the post or has sufficient rights can update it.
 *
 * @param {ExtendedRequest} req - Extended request object containing user data, post ID in params, and update data in body.
 * @param {Response} res - Express response object used to send the update result back to the client.
 * @returns {Response} Returns a status, response message, and post data based on the update result.
 */
export const updatePost = async (req: ExtendedRequest, res: Response) => {
  try {
    /**
     * Obtain post and comment repositories from the data source.
     */
    const postRepository = AppDataSource.getRepository(Post)
    const commentRepository = AppDataSource.getRepository(Comment)

    /**
     * Initialize comment and post services with the respective repositories.
     */
    const commentService = new CommentService(commentRepository, postRepository)
    const postService = new PostService(postRepository, commentService)

    /**
     * Extract user information from the request object.
     */
    const user = req.user

    /**
     * Ensure the user is authenticated before proceeding.
     */
    if (!user) {
      return res
        .status(401)
        .json({ status: 401, response: 'Not Allowed', data: null })
    }

    /**
     * Extract the post ID from the request parameters and the update data from the request body.
     */
    const { id: postId } = req.params
    const updatePostDto = req.body

    /**
     * Validate the update data using a post validator.
     */
    const { errors, dto } = await CreatePostValidator(updatePostDto)
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ status: 400, response: 'Invalid Post Data', data: null })
    }

    /**
     * Update the post using the post service.
     */
    const { data, response, status } = await postService.updatePost(
      Number(postId),
      updatePostDto,
      user.id
    )

    /**
     * Return the post update result.
     */
    return res.status(status).json({ status, response, data })
  } catch (error) {
    /**
     * Log any unexpected errors and return a server error response.
     */
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}
