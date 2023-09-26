import { Request, Response } from 'express'
import { CreatePostValidator } from '../Utils/Scheme.Validators'
import { ExtendedRequest } from '../Services/types'
import { PostService } from '../Services/Post.Service'
import { InternalServerErrorResponse } from '../Helpers/Category/Category.Helpers'
import { UserRole } from '../Config/UserRoles'

export const getAllPosts = (req: Request, res: Response) => {
  return res.status(200).json({ data: { name: 'Post 1' } })
}

export const addPost = async (req: ExtendedRequest, res: Response) => {
  try {
    const postService = new PostService()
    const { errors: validationErrors, dto: postDto } =
      await CreatePostValidator(req.body)

    if (validationErrors.length > 0)
      return {
        status: 400,
        response: 'Error Occured while adding new Post.',
        data: null,
      }

    const user = req.user
    if (!user)
      return {
        status: 400,
        response: 'Invalid User',
        data: null,
      }
    user.id
    const { status, data, response } = await postService.createNewPost(
      postDto,
      user.id
    )
    return res.status(status).json({ status, response, data })
  } catch (error) {
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

export const deletePost = async (req: ExtendedRequest, res: Response) => {
  try {
    const postService = new PostService()
    const user = req.user

    const { id: postId } = req.params
    const postById = await postService.getPostById(Number(postId))
    if (postById.status === 404)
      return res.status(postById.status).json({
        status: postById.status,
        response: postById.response,
        data: postById.data,
      })
    if (
      !(user?.roles === UserRole.Admin || user?.id === postById.data?.user.id)
    )
      return res
        .status(401)
        .json({ status: 401, response: 'Not Allowed', data: null })

    const { status, response, data } = await postService.deletePost(
      Number(postId)
    )

    return res.status(status).json({ status, response, data })
  } catch (error) {
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}
