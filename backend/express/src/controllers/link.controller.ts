// backend/express/src/controllers/link.controller.ts
import { Request, Response, NextFunction } from 'express'
import { createShortLink, getOriginalUrl } from '../services/link.service'
import { CreateLinkDto } from '../../shared/schemas/link.schema'

/**
 * Контроллер для создания новой короткой ссылки.
 * Обрабатывает POST /shorten
 */
export const createShortLinkController = async (
  req: Request<{}, {}, CreateLinkDto>, // Указываем тип req.body
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('Received request to create short link:', req.body)
    const newLink = await createShortLink(req.body)

    return res.status(201).json({
      shortUrl: `${req.protocol}://${req.get('host')}/${newLink.shortAlias}`,
      originalUrl: newLink.originalUrl,
      alias: newLink.alias,
      expiresAt: newLink.expiresAt,
      clickCount: newLink.clickCount,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Контроллер для перенаправления по короткой ссылке.
 * Обрабатывает GET /{shortUrl}
 */
export const redirectToOriginalUrlController = async (
  req: Request<{ shortAlias: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shortAlias } = req.params
    const originalUrl = await getOriginalUrl(shortAlias)

    return res.redirect(302, originalUrl) 
  } catch (error) {
    next(error)
  }
}
