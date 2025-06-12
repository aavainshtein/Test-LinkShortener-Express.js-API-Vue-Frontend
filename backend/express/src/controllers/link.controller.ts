// backend/express/src/controllers/link.controller.ts
import { Request, Response, NextFunction } from 'express'
import {
  createShortLink,
  getOriginalUrl,
  getLinkInfo,
  getLinkAnalytics,
  deleteShortLink,
  getAllLinksPaginated,
} from '../services/link.service.js'
import { CreateLinkDto } from '../../shared/schemas/link.schema.js'

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
    // Получаем IP-адрес из объекта запроса (он был добавлен middleware)
    const ipAddress = req.ipAddress

    const originalUrl = await getOriginalUrl(shortAlias, ipAddress)

    return res.redirect(302, originalUrl)
  } catch (error) {
    next(error)
  }
}

/**
 * Контроллер для получения информации о короткой ссылке.
 * Обрабатывает GET /info/{shortAlias}
 */
export const getLinkInfoController = async (
  req: Request<{ shortAlias: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shortAlias } = req.params
    const linkInfo = await getLinkInfo(shortAlias)

    return res.status(200).json(linkInfo)
  } catch (error) {
    next(error)
  }
}

/**
 * Контроллер для получения аналитики (списка кликов) по короткой ссылке.
 * Обрабатывает GET /analytics/{shortAlias}
 */
export const getLinkAnalyticsController = async (
  req: Request<{ shortAlias: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shortAlias } = req.params
    const linkAnalytics = await getLinkAnalytics(shortAlias)

    return res.status(200).json(linkAnalytics)
  } catch (error) {
    next(error)
  }
}

/**
 * Контроллер для получения всех коротких ссылок с пагинацией.
 * Обрабатывает GET /links?page=1&pageSize=20
 */
export const getAllLinksPaginatedController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('getAllLinksPaginatedController called')
  try {
    console.log('Received request to get all links with pagination')
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20
    console.log(`Fetching links for page ${page} with pageSize ${pageSize}`)
    const result = await getAllLinksPaginated(page, pageSize)
    return res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const deleteShortLinkController = async (
  req: Request<{ shortAlias: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shortAlias } = req.params
    const deletedLink = await deleteShortLink(shortAlias)

    // Отправляем статус 204 No Content, так как ресурс был успешно удален
    // Или 200 OK с сообщением/данными об удаленной ссылке
    return res.status(200).json({
      message: `Short URL '${deletedLink.shortAlias}' and its clicks deleted successfully.`,
      deletedLink,
    })
  } catch (error) {
    next(error)
  }
}
