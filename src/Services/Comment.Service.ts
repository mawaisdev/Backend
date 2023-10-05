import { FindOneOptions, Repository } from 'typeorm'
import { AppDataSource } from '../data-source'
import { CommentServiceResponse } from './types'
import { CommentDTO } from '../Dto/Comment/Comment.Dto'
import { Post } from '../Entity/Post'
import { Comment } from '../Entity/Comment'
import { UserRole } from '../Config/UserRoles'

export class CommentService {
  private commentRepository: Repository<Comment>
  private postRepository: Repository<Post>

  constructor() {
    this.commentRepository = AppDataSource.getRepository(Comment)
    this.postRepository = AppDataSource.getRepository(Post)
  }

  async addComment(dto: CommentDTO): Promise<CommentServiceResponse<Comment>> {
    // Check if there's a parent ID specified
    if (dto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentId },
        relations: ['post'],
      })

      if (!parentComment) {
        return { status: 404, response: 'Parent comment not found.' }
      }

      // Check if the parent comment and child comments are for the same post
      if (parentComment.post.id !== dto.postId) {
        return {
          status: 400,
          response: 'Parent comment does not belong to the provided post.',
        }
      }
    }

    // Check if there's a valid post associated
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
    })
    if (!post) {
      return { status: 404, response: 'Post not found.' }
    }

    // Check if post is a draft
    if (post.isDraft) {
      return { status: 400, response: 'Cannot comment on a draft post.' }
    }

    // Check if post is private and the commenting user is not the post's author
    if (post.isPrivate && post.user.id !== dto.userId) {
      return {
        status: 403,
        response: 'Only the author can comment on a private post.',
      }
    }

    // Create and save the new comment
    const newComment = this.commentRepository.create({
      text: dto.text,
      post: { id: dto.postId }, // TypeORM should be able to associate using just the ID
      user: { id: dto.userId },
      parent: dto.parentId ? { id: dto.parentId } : null,
    })

    await this.commentRepository.save(newComment)

    return {
      status: 201,
      response: 'Comment added successfully.',
      data: newComment,
    }
  }

  async updateComment(
    dto: CommentDTO,
    id: number,
    userId: number // Adding the authenticated userId to the function
  ): Promise<CommentServiceResponse<Comment>> {
    const comment = await this.commentRepository.findOne({ where: { id } })

    if (!comment) {
      return { status: 404, response: 'Comment not found.' }
    }

    // Check if the authenticated user is the author of the comment.
    if (comment.user.id !== userId) {
      return {
        status: 403,
        response: 'You are not authorized to update this comment.',
      }
    }

    comment.text = dto.text
    await this.commentRepository.save(comment)

    return {
      status: 200,
      response: 'Comment updated successfully.',
      data: comment,
    }
  }

  async deleteComment(
    id: number,
    userId: number,
    userRole: string
  ): Promise<CommentServiceResponse<Comment>> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post', 'user'], // Load associated post and user details
    })

    if (!comment) {
      return { status: 404, response: 'Comment not found.' }
    }

    // Check if the user attempting to delete the comment is its author,
    // or the author of the post, or has the admin role.
    if (
      comment.user.id !== userId &&
      comment.post.user.id !== userId &&
      userRole !== UserRole.Admin
    ) {
      return {
        status: 403,
        response: 'You are not authorized to delete this comment.',
      }
    }

    await this.commentRepository.delete(id)

    return {
      status: 200,
      response: 'Comment (and child comments) deleted successfully.',
    }
  }

  async getCommentsForPost(
    postId: number,
    parentId: number | null
  ): Promise<CommentServiceResponse<Comment[]>> {
    try {
      // Fetch comments based on postId and parentId
      const comments = await this.commentRepository.find({
        where: {
          post: { id: postId },
          parent: parentId ? { id: parentId } : undefined,
        },
        relations: ['user'], // fetching the user of each comment
      })

      // For each comment, check if it has child comments
      const commentsWithHasChild = await Promise.all(
        comments.map(async (comment) => {
          const hasChild =
            (await this.commentRepository.count({
              where: { parent: { id: comment.id } },
            })) > 0
          return { ...comment, hasChild }
        })
      )

      return {
        status: 200,
        response: 'Comments fetched successfully',
        data: commentsWithHasChild,
      }
    } catch (error) {
      console.log('Comment Service Error: ', error)
      return { status: 500, response: 'Internal server error' }
    }
  }
}
