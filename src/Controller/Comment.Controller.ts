// External libraries
import { Response, Request } from 'express'

// Configuration and constants
import { UserRole } from '../Config/UserRoles'

// DTOs (Data Transfer Objects)
import { CommentDTO } from '../Dto/Comment/Comment.Dto'

// Services
import { CommentService } from '../Services/Comment.Service'

// Types and interfaces
import { ExtendedRequest } from '../Services/types'

// Validators
import { CommentDtoValidator } from '../Utils/Scheme.Validators'

export class CommentController {
  private commentService: CommentService
  /**
   * Initializes a new instance of the CommentController.
   *
   * @param commentService - Service responsible for comment operations.
   */
  constructor(commentService: CommentService) {
    this.commentService = commentService
  }
  /**
   * Handles the addition of a new comment.
   *
   * @param req - The request object containing the comment data.
   * @param res - The response object.
   * @returns Response object with status and message.
   */
  addComment = async (req: ExtendedRequest, res: Response) => {
    try {
      // Validate the comment data from the request body
      const dto = req.body as CommentDTO
      const { dto: commentDto, errors } = await CommentDtoValidator(dto)

      // Return an error if validation fails
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ status: 400, response: 'Bad Request', data: errors })
      }

      // Extract user ID from the authenticated request
      const userId = req.user?.id

      // Return unauthorized if there's no authenticated user
      if (!userId) {
        return res
          .status(401)
          .json({ status: 401, response: 'Unauthorized', data: null })
      }

      // Set the user ID in the comment DTO
      commentDto.userId = userId

      // Save the comment using the service and fetch the result
      const { response, status, data } = await this.commentService.addComment(
        commentDto
      )

      if (status === 201) {
        const result = {
          comment_Id: data?.id,
          comment_text: data?.text,
          childCount: 0,
          hasChild: false,
          userId,
        }
        return res.status(status).json({ status, response, data: result })
      }
    } catch (error) {
      // Log and return any unexpected errors
      console.log('Comment Controller Error: ', error)
      return res
        .status(500)
        .json({ status: 500, response: 'Internal Server Error.', data: null })
    }
  }

  /**
   * Handles the deletion of a comment based on the given ID.
   * Only the original comment author, post author, or an admin can delete the comment.
   *
   * @param req - The request object containing the comment ID.
   * @param res - The response object.
   * @returns Response object with status and message.
   */
  deleteComment = async (req: ExtendedRequest, res: Response) => {
    try {
      // Extract user ID and role from the authenticated request
      const userId = req.user?.id
      const userRole = req.user?.roles ? req.user.roles : null

      // Check for authenticated user; return unauthorized if missing
      if (!userId) {
        return res
          .status(401)
          .json({ status: 401, response: 'Unauthorized', data: null })
      }

      // Convert commentId from request parameters to a number
      const commentId = Number(req.params.id)

      // Attempt to delete the comment using the service
      const { response, status, data } =
        await this.commentService.deleteComment(
          commentId,
          userId,
          userRole ? userRole : UserRole.User
        )

      // Return the response from the service
      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    } catch (error) {
      // Log and return any unexpected errors
      console.log('Comment Controller Error: ', error)
      return res
        .status(500)
        .json({ status: 500, response: 'Internal Server Error.', data: null })
    }
  }

  /**
   * Handles the updating of an existing comment.
   * Only the original comment author can update the comment.
   *
   * @param req - The request object containing the comment ID and new data.
   * @param res - The response object.
   * @returns Response object with status and message.
   */
  updateComment = async (req: ExtendedRequest, res: Response) => {
    try {
      // Extract user ID from the authenticated request
      const userId = req.user?.id

      // Check for authenticated user; return unauthorized if missing
      if (!userId) {
        return res
          .status(401)
          .json({ status: 401, response: 'Unauthorized', data: null })
      }

      // Convert commentId from request parameters to a number
      const commentId = Number(req.params.id)

      // Validate the incoming comment data
      const dto = req.body as CommentDTO
      const { dto: commentDto, errors } = await CommentDtoValidator(dto)

      // If there are validation errors, return them in the response
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ status: 400, response: 'Bad Request', data: errors })
      }

      // Use the service to update the comment
      const { response, status, data } =
        await this.commentService.updateComment(commentDto, commentId, userId)

      // Return the response from the service
      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    } catch (error) {
      // Log and return any unexpected errors
      console.log('Comment Controller Error: ', error)
      return res
        .status(500)
        .json({ status: 500, response: 'Internal Server Error.', data: null })
    }
  }

  /**
   * Retrieves comments for a given post, based on its ID.
   * If a parent ID is provided, retrieves child comments for a specific parent comment.
   *
   * @param req - The request object containing post ID and optional parent ID.
   * @param res - The response object.
   * @returns Response object with status, message, and fetched comments.
   */
  getCommentsForPost = async (req: Request, res: Response) => {
    try {
      const postId = Number(req.params.id)
      const parentId = req.query.parentId ? Number(req.query.parentId) : null

      // Define the page and perPage values for pagination.
      const page = Number(req.query.page) || 1 // Default to page 1 if not provided.
      const perPage = Number(req.query.perPage) || 5 // Default to 5 comments per page if not provided.

      const {
        response,
        status,
        data,
        totalCommentsCount,
        remainingCommentsCount,
        pageNumber,
        pageSize,
      } = await this.commentService.getCommentsForPost(
        postId,
        parentId,
        page, // Pass the page value.
        perPage // Pass the perPage value.
      )

      return res.status(status).json({
        status,
        response,
        data: data ? data : null,
        totalCommentsCount,
        remainingCommentsCount,
        pageNumber,
        pageSize,
      })
    } catch (error) {
      console.log('Comment Controller Error: ', error)
      return res
        .status(500)
        .json({ status: 500, response: 'Internal Server Error.', data: null })
    }
  }
}
