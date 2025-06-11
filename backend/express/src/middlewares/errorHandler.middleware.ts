import { Request, Response, NextFunction } from 'express'
import { CustomError, InternalServerError } from '../utils/errors.util'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('An error occurred:', err)

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
        ...(err.details && { details: err.details }),
      },
    })
  }

  const internalError = new InternalServerError()
  return res.status(internalError.statusCode).json({
    error: {
      message: internalError.message,
      statusCode: internalError.statusCode,
    },
  })
}
