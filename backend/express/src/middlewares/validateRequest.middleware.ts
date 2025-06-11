import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { BadRequestError } from '../utils/errors.util'

/**
 * Middleware для валидации входящих данных запроса (body, query, params) с помощью Zod.
 * @param schema Zod-схема для валидации.
 * @param type Тип валидируемых данных ('body', 'query', 'params'). По умолчанию 'body'.
 */
export const validateRequest =
  (schema: AnyZodObject, type: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[type])
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }))

        next(new BadRequestError('Validation failed', errorDetails))
      } else {
        next(error)
      }
    }
  }
