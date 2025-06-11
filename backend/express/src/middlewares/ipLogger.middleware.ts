import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../utils/errors.util.js'

export const ipLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ipAddress = req.ip

  if (!ipAddress) {
    console.warn('Warning: Could not determine IP address for the request.')

    req.ipAddress = 'UNKNOWN'
  } else {
    req.ipAddress = ipAddress
  }
  next()
}

declare global {
  namespace Express {
    interface Request {
      ipAddress?: string
    }
  }
}
