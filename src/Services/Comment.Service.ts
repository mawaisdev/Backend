// External dependencies
import { Repository } from 'typeorm'

// Application's internal modules and configurations
import { CommentServiceResponse, CommentsDbResponse } from './types'
import { CommentDTO } from '../Dto/Comment/Comment.Dto'
import { Post } from '../Entity/Post'
import { Comment } from '../Entity/Comment'
import { UserRole } from '../Config/UserRoles'

/**
 * This module gathers necessary imports for Comment services.
 * It imports from both external libraries (e.g., 'typeorm') and internal modules.
 * Included are type definitions, entities, configurations, and data sources.
 */

export class CommentService {
  private commentRepository: Repository<Comment>
  private postRepository: Repository<Post>

  /**
   * Initializes the CommentService by setting up repositories for Comment and Post entities.
   */
  constructor(
    commentRepository: Repository<Comment>,
    postRepository: Repository<Post>
  ) {
    // Set up the Comment repository.
    this.commentRepository = commentRepository

    // Set up the Post repository.
    this.postRepository = postRepository
  }

  /**
   * Adds a comment to the database based on the provided CommentDTO.
   * Validates the parent comment and post, ensuring comments are correctly associated.
   *
   * @param dto - The Comment Data Transfer Object containing the details of the comment to be added.
   * @returns - A service response that includes the status, response message, and the added comment.
   */
  async addComment(dto: CommentDTO): Promise<CommentServiceResponse<Comment>> {
    // Check for a specified parent comment ID.
    if (dto.parentId) {
      // Fetch the parent comment using the provided ID.
      const parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentId },
        relations: ['post'],
      })

      // Handle case when parent comment isn't found.
      if (!parentComment) {
        return { status: 404, response: 'Parent comment not found.' }
      }

      // Ensure parent comment is associated with the intended post.
      if (parentComment.post.id !== dto.postId) {
        return {
          status: 400,
          response: 'Parent comment does not belong to the provided post.',
        }
      }
    }

    // Retrieve the intended post for the comment.
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
    })

    // Handle case when the post isn't found.
    if (!post) {
      return { status: 404, response: 'Post not found.' }
    }

    // Prevent commenting on draft posts.
    if (post.isDraft) {
      return { status: 400, response: 'Cannot comment on a draft post.' }
    }

    // For private posts, ensure only the author can comment.
    if (post.isPrivate && post.user.id !== dto.userId) {
      return {
        status: 403,
        response: 'Only the author can comment on a private post.',
      }
    }

    // Construct a new comment entity.
    const newComment = this.commentRepository.create({
      text: dto.text,
      post: { id: dto.postId },
      user: { id: dto.userId },
      parent: dto.parentId ? { id: dto.parentId } : null,
    })

    // Persist the new comment in the database.
    await this.commentRepository.save(newComment)

    // Return success status with the new comment details.
    return {
      status: 201,
      response: 'Comment added successfully.',
      data: newComment,
    }
  }

  /**
   * Updates an existing comment in the database.
   * Only the original author of the comment is allowed to update it.
   *
   * @param dto - The Comment Data Transfer Object containing the updated details of the comment.
   * @param id - The ID of the comment to be updated.
   * @param userId - The ID of the authenticated user making the update request.
   * @returns - A service response that includes the status, response message, and the updated comment.
   */
  async updateComment(
    dto: CommentDTO,
    id: number,
    userId: number // ID of the authenticated user
  ): Promise<CommentServiceResponse<Comment>> {
    // Fetch the comment using the provided ID, and include the author details.
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .select(['comment.id', 'comment.text', 'user.id'])
      .leftJoin('comment.user', 'user')
      .where('comment.id = :commentId', { commentId: id })
      .getOne()

    // Handle case when the comment isn't found.
    if (!comment) {
      return { status: 404, response: 'Comment not found.' }
    }

    // Ensure only the original author can update the comment.
    if (comment.user.id !== userId) {
      return {
        status: 403,
        response: 'You are not authorized to update this comment.',
      }
    }

    // Update the comment's text with the provided content.
    comment.text = dto.text

    // Save the updated comment in the database.
    await this.commentRepository.save(comment)

    // Return success status with the updated comment details.
    return {
      status: 200,
      response: 'Comment updated successfully.',
      data: comment,
    }
  }

  /**
   * Deletes a comment from the database.
   * Only the comment's author, the post's author, or an admin can delete the comment.
   *
   * @param id - The ID of the comment to be deleted.
   * @param userId - The ID of the authenticated user making the delete request.
   * @param userRole - The role of the authenticated user (e.g. Admin, User).
   * @returns - A service response that includes the status and a response message.
   */
  async deleteComment(
    id: number,
    userId: number,
    userRole: string
  ): Promise<CommentServiceResponse<Comment>> {
    // Fetch the comment using the provided ID, including its associated post and user.
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post', 'user'],
    })

    // Handle case when the comment isn't found.
    if (!comment) {
      return { status: 404, response: 'Comment not found.' }
    }

    // Ensure only the comment's author, post's author, or an admin can delete the comment.
    if (
      comment.user.id !== userId &&
      userRole !== UserRole.Admin &&
      comment.post.userId !== userId
    ) {
      return {
        status: 403,
        response: 'You are not authorized to delete this comment.',
      }
    }

    // Remove the comment from the database.
    await this.commentRepository.delete(id)

    // Return success status with a confirmation message.
    return {
      status: 200,
      response: 'Comment deleted successfully.',
    }
  }

  /**
   * Retrieves comments associated with a given post with pagination.
   * If a parent ID is provided, the function fetches child comments for that specific parent comment.
   * Otherwise, it retrieves top-level comments (those without a parent).
   *
   * @param postId - The ID of the post whose comments are to be fetched.
   * @param parentId - An optional parent comment ID to fetch specific child comments.
   * @param page - The current page number.
   * @param perPage - The number of comments to retrieve per page.
   * @returns - A service response that includes the status, a response message, and the fetched comments for the specified page.
   */
  async getCommentsForPost(
    postId: number,
    parentId: number | null,
    page: number,
    perPage: number
  ): Promise<CommentServiceResponse<Comment[]>> {
    try {
      // Calculate the offset based on the current page and comments per page.
      const offset = (page - 1) * perPage

      // Query to count the total comments for the post.
      const totalCommentsQuery = await this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.post = :postId', { postId: postId })

      if (parentId === null) {
        totalCommentsQuery.andWhere('comment.parent IS NULL')
      } else {
        totalCommentsQuery.andWhere('comment.parent = :parentId', {
          parentId: parentId,
        })
      }

      const totalComments = await totalCommentsQuery.getCount()

      const commentsWithChildCounts = await this.fetchCommentsWithChildCounts(
        postId,
        parentId,
        offset,
        perPage
      )

      const commentsWithHasChild = commentsWithChildCounts.map((comment) => {
        const hasChildStatus = comment.childcount > 0
        const childCount = comment.childcount
        return {
          ...comment,
          childCount,
          childcount: undefined,
          hasChild: hasChildStatus,
        }
      })

      // Calculate the remaining comments.
      const remainingComments = Math.max(totalComments - (offset + perPage), 0)

      // Create the response object with the additional fields.
      const response = {
        status: 200,
        response: 'Comments fetched successfully',
        data: commentsWithHasChild,
        totalCommentsCount: totalComments,
        pageNumber: page,
        pageSize: perPage,
        remainingCommentsCount: remainingComments,
      }

      return response
    } catch (error) {
      console.log('Comment Service Error: ', error)
      return { status: 500, response: 'Internal server error' }
    }
  }

  /**
   * Fetches comments for a specific post with the count of child comments for each of them with pagination.
   *
   * @param postId - ID of the target post.
   * @param parentId - ID of the parent comment (if fetching child comments).
   * @param offset - The offset to start fetching comments from.
   * @param limit - The maximum number of comments to retrieve.
   * @returns Promise resolving to an array of comments with child counts.
   */
  async fetchCommentsWithChildCounts(
    postId: number,
    parentId: number | null,
    offset: number,
    limit: number
  ): Promise<CommentsDbResponse[]> {
    return await this.commentRepository
      .createQueryBuilder('comment') // Initialize a query targeting the Comment entity.
      .leftJoin('comment.children', 'childComments') // Join with child comments of each comment.
      .select([
        // Define fields to select in the resulting data set.
        'comment.id', // Select comment ID.
        'comment.text', // Select comment text.
        'comment.userId',
        'COUNT(childComments.id) as childCount', // Count the number of child comments.
      ])
      .where('comment.post = :postId', { postId: postId }) // Filter comments belonging to a specific post.
      .andWhere(
        // Conditionally filter based on parentId.
        parentId ? 'comment.parent = :parentId' : 'comment.parent IS NULL',
        { parentId: parentId }
      )
      .groupBy('comment.id') // Group by comment ID to cater for the COUNT function.
      .offset(offset) // Offset for pagination.
      .limit(limit) // Limit the number of comments per page.
      .orderBy('comment.createdAt', 'DESC') // Order by creation date (newest first
      .getRawMany() // Fetch raw data (not entity instances) and get multiple records.
  }
}
