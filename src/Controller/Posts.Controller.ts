import e, { Request, Response } from 'express'
import { CreatePostValidator } from '../Utils/Scheme.Validators'
import { ExtendedRequest } from '../Services/types'
import { PostService } from '../Services/Post.Service'
import { InternalServerErrorResponse } from '../Helpers/Category/Category.Helpers'
import { UserRole } from '../Config/UserRoles'
import { CategoryService } from '../Services/Category.Service'

type GetAllPostsQueryType = {
  skip?: number
  take?: number
}
/**
 * Fetches all posts with optional pagination.
 *
 * @param req - The request object containing optional query parameters: `skip` and `take`.
 * @param res - The response object.
 * @returns Response object with status, message, and list of posts.
 *          Also includes `totalPostsCount` for total posts in the database and `CurrentPostsCount`
 *          representing the number of posts in the current batch.
 */
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // Extract pagination options from query parameters
    const { skip, take } = req.query as GetAllPostsQueryType

    // Initialize post service instance
    const postService = new PostService()

    // Fetch posts using the service
    const { status, response, data, totalPostsCount, CurrentCount } =
      await postService.getAllPosts(
        Number(skip ? skip : 0),
        Number(take ? take : 10)
      )

    // Return the fetched posts along with the total count and current count
    return res.status(status).json({
      status,
      response,
      data,
      totalPostsCount,
      CurrentPostsCount: CurrentCount,
    })
  } catch (error) {
    // Log any unexpected errors and send a generic error response
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Handles the addition of a new post. Validates the provided post data,
 * checks the associated category, and ensures the user is authorized.
 *
 * @param req - The request object containing post data and the user who created the request.
 * @param res - The response object.
 * @returns Response object with status, message, and the created post (if successful).
 */
export const addPost = async (req: ExtendedRequest, res: Response) => {
  try {
    // Initialize post and category service instances
    const postService = new PostService()
    const categoryService = new CategoryService()

    // Validate the incoming post data
    const { errors: validationErrors, dto: postDto } =
      await CreatePostValidator(req.body)

    // If there are validation errors, return a 400 Bad Request
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 400,
        response: 'Error Occurred while adding a new Post.',
        data: null,
      })
    }

    // Check if the request has an associated user
    const user = req.user
    if (!user) {
      return res.status(400).json({
        status: 400,
        response: 'Invalid User',
        data: null,
      })
    }

    // If a category ID is provided in the post data, check if it's valid
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

    // Attempt to create a new post using the service
    const { status, data, response } = await postService.createNewPost(
      postDto,
      user.id
    )

    // Return the response (either the created post or an error message)
    return res.status(status).json({ status, response, data })
  } catch (error) {
    // Log any unexpected errors and send a generic error response
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Handles the deletion of a post based on the given ID.
 * Only the original post author or an admin can delete the post.
 *
 * @param req - The request object containing the post ID and the user who initiated the request.
 * @param res - The response object.
 * @returns Response object with status and message.
 */
export const deletePost = async (req: ExtendedRequest, res: Response) => {
  try {
    // Initialize post service instance
    const postService = new PostService()

    // Retrieve user from the request
    const user = req.user

    // Extract post ID from the request parameters
    const { id: postId } = req.params

    // Check if the post exists
    const postById = await postService.getPostById(postId)
    if (postById.status === 404) {
      return res.status(postById.status).json({
        status: postById.status,
        response: postById.response,
        data: postById.data,
      })
    }

    // Ensure the request initiator is either the post author or an admin
    if (
      !(user?.roles === UserRole.Admin || user?.id === postById.data?.user.id)
    ) {
      return res.status(401).json({
        status: 401,
        response: 'Not Allowed',
        data: null,
      })
    }

    // Attempt to delete the post
    const { status, response, data } = await postService.deletePost(
      Number(postId)
    )

    // Return the response indicating the result of the deletion attempt
    return res.status(status).json({ status, response, data })
  } catch (error) {
    // Log any unexpected errors and send a generic error response
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Retrieves a post based on the given ID.
 * If the request is made by a logged-in user, additional user-specific information might be included.
 *
 * @param req - The request object containing the post ID and optional user data.
 * @param res - The response object.
 * @returns Response object with status, message, and the retrieved post.
 */
export const getPostById = async (req: ExtendedRequest, res: Response) => {
  try {
    // Initialize post service instance
    const postService = new PostService()

    // Extract post ID from request parameters
    const { id } = req.params

    // Retrieve user from request, if available
    const user = req.user

    // If there's no logged-in user, retrieve the post without user-specific details
    if (!user) {
      const { data, response, status } = await postService.getPostById(id)
      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    }

    // If there's a logged-in user, retrieve the post with potential user-specific details
    const { data, response, status } = await postService.getPostById(
      id,
      user.id
    )

    // Return the fetched post
    return res
      .status(status)
      .json({ status, response, data: data ? data : null })
  } catch (error) {
    // Log unexpected errors and send a generic error response
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

/**
 * Updates an existing post based on the provided post ID and data.
 * Only the original post author can update the post.
 *
 * @param req - The request object containing the post ID, update data, and optional user data.
 * @param res - The response object.
 * @returns Response object with status, message, and the updated post data.
 */
export const updatePost = async (req: ExtendedRequest, res: Response) => {
  try {
    // Initialize post service instance
    const postService = new PostService()

    // Retrieve user from request
    const user = req.user

    // If no user is authenticated, return unauthorized
    if (!user) {
      return res
        .status(401)
        .json({ status: 401, response: 'Not Allowed', data: null })
    }

    // Extract post ID from request parameters
    const { id: postId } = req.params

    // Get update data from request body
    const updatePostDto = req.body

    // Validate the provided post update data
    const { errors, dto } = await CreatePostValidator(updatePostDto)
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ status: 400, response: 'Invalid Post Data', data: null })
    }

    // Attempt to update the post
    const { data, response, status } = await postService.updatePost(
      Number(postId),
      updatePostDto,
      user.id
    )

    // Return the result of the update operation
    return res.status(status).json({ status, response, data })
  } catch (error) {
    // Log unexpected errors and send a generic error response
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}
