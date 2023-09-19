import { Request, Response } from 'express'

export const getAllPosts = (req: Request, res: Response) => {
  return res.status(200).json({ data: { name: 'Post 1' } })
}

export const getPostById = {}
