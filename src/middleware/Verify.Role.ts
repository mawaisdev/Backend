import { Response, NextFunction } from 'express'
import { ExtendedRequest } from '../Services/types'

export const verifyRole = (...allowedRoles: string[]) => {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) return res.sendStatus(401)
    const rolesArray = [...allowedRoles]
    const result = rolesArray.includes(req.user.roles)
    if (!result) return res.sendStatus(401)
    next()
  }
}
