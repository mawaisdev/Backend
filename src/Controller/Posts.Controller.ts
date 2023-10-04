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

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { skip, take } = req.query as GetAllPostsQueryType

    const postService = new PostService()
    const { status, response, data, totalPostsCount, CurrentCount } =
      await postService.getAllPosts(
        Number(skip ? skip : 0),
        Number(take ? take : 10)
      )

    return res.status(status).json({
      status,
      response,
      data,
      totalPostsCount,
      CurrentPostsCount: CurrentCount,
    }) // <-- Return the total count here
  } catch (error) {
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

export const addPost = async (req: ExtendedRequest, res: Response) => {
  try {
    const postService = new PostService()
    const categoryService = new CategoryService()

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

    if (postDto && postDto.categoryId) {
      const category = await categoryService.getCategoryById(postDto.categoryId)
      if (category.status === 404)
        return res
          .status(404)
          .json({ status: 404, response: category.response, data: null })
    }

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
    const postById = await postService.getPostById(postId)
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

export const getPostById = async (req: ExtendedRequest, res: Response) => {
  try {
    const postService = new PostService()

    const { id } = req.params

    const user = req.user
    if (!user) {
      const { data, response, status } = await postService.getPostById(id)
      return res
        .status(status)
        .json({ status, response, data: data ? data : null })
    }
    const { data, response, status } = await postService.getPostById(
      id,
      user.id
    )
    return res
      .status(status)
      .json({ status, response, data: data ? data : null })
  } catch (error) {
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}

export const updatePost = async (req: ExtendedRequest, res: Response) => {
  try {
    const postService = new PostService()
    const user = req.user
    if (!user)
      return res
        .status(401)
        .json({ status: 401, response: 'Not Allowed', data: null })

    const { id: postId } = req.params
    const updatePostDto = req.body
    const { errors, dto } = await CreatePostValidator(updatePostDto)
    if (errors.length > 0)
      return res
        .status(400)
        .json({ status: 400, response: 'Invalid Post Data', data: null })

    const { data, response, status } = await postService.updatePost(
      Number(postId),
      updatePostDto,
      user.id
    )
    return res.status(status).json({ status, response, data })
  } catch (error) {
    console.log('Post Controller Error: ', error)
    return InternalServerErrorResponse()
  }
}
