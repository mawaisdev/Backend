import { CommentDTO } from '../Dto/Comment/Comment.Dto'
import { CommentService } from '../Services/Comment.Service'
import { ExtendedRequest } from '../Services/types'
import { Response } from 'express'
import { CommentDtoValidator } from '../Utils/Scheme.Validators'
import { UserRole } from '../Config/UserRoles'

export class CommentController {
  private commentService: CommentService
  constructor(commentService: CommentService) {
    this.commentService = commentService
  }

  addComment = async (req: ExtendedRequest, res: Response) => {
    try {
      const dto = req.body as CommentDTO
      const { dto: commentDto, errors } = await CommentDtoValidator(dto)
      if (errors.length > 0)
        return res
          .status(400)
          .json({ status: 400, response: 'Bad Request', data: errors })
      const userId = req.user?.id
      if (!userId)
        return res
          .status(401)
          .json({ status: 401, response: 'Unauthorized', data: null })

      commentDto.userId = userId
      const { response, status, data } = await this.commentService.addComment(
        commentDto
      )
      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    } catch (error) {
      console.log('Comment Controller Error: ', error)
      return res
        .status(500)
        .json({ status: 500, response: 'Internal Server Error.', data: null })
    }
  }

  deleteComment = async (req: ExtendedRequest, res: Response) => {
    try {
      const userId = req.user?.id
      const userRole = req.user?.roles ? req.user.roles : null
      if (!userId)
        return res
          .status(401)
          .json({ status: 401, response: 'Unauthorized', data: null })
      const commentId = Number(req.params.id)
      const { response, status, data } =
        await this.commentService.deleteComment(
          commentId,
          userId,
          userRole ? userRole : UserRole.User
        )
      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    } catch (error) {
      console.log('Comment Controller Error: ', error)
      return res
        .status(500)
        .json({ status: 500, response: 'Internal Server Error.', data: null })
    }
  }
}
