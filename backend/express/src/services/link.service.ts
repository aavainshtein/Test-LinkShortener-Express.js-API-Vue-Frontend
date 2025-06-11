// backend/express/src/services/link.service.ts
import { PrismaClient } from '@prisma/client'
import { CreateLinkDto } from '../../shared/schemas/link.schema.js'
import {
  NotFoundError,
  ConflictError,
  ShortAliasGenerationError,
} from '../utils/errors.util.js'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

export const generateUniqueShortAlias = async (): Promise<string> => {
  let uniqueAlias: string
  const MAX_ATTEMPTS = 10

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    uniqueAlias = nanoid(7)
    const existingLink = await prisma.link.findUnique({
      where: { shortAlias: uniqueAlias },
    })
    if (!existingLink) {
      return uniqueAlias
    }
  }

  throw new ShortAliasGenerationError(
    'Could not generate a unique short alias after multiple attempts.',
  )
}

export const createShortLink = async (data: CreateLinkDto) => {
  const { originalUrl, expiresAt, alias } = data

  let shortAlias: string

  if (alias) {
    const existingLink = await prisma.link.findUnique({
      where: { alias: alias },
    })
    if (existingLink) {
      throw new ConflictError(`The alias '${alias}' is already in use.`)
    }
    shortAlias = alias
  } else {
    shortAlias = await generateUniqueShortAlias()
  }

  try {
    const link = await prisma.link.create({
      data: {
        originalUrl: originalUrl,
        shortAlias: shortAlias,
        alias: alias,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        clickCount: 0,
      },
    })
    return link
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ConflictError(
        `The generated short URL '${shortAlias}' already exists. Please try again or provide a custom alias.`,
      )
    }
    console.error('Error creating short link:', error)
    throw error
  }
}

export const getOriginalUrl = async (
  shortAlias: string,
  ipAddress: string | undefined,
) => {
  const link = await prisma.link.findUnique({
    where: { shortAlias: shortAlias },
  })

  if (!link) {
    throw new NotFoundError('Short URL not found.')
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    throw new NotFoundError('Short URL has expired.')
  }

  await prisma.link.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } },
  })

  await prisma.click.create({
    data: {
      linkId: link.id,
      ipAddress: ipAddress || 'UNKNOWN',
      clickedAt: new Date(),
    },
  })

  return link.originalUrl
}

/**
 * Получает полную информацию о короткой ссылке по её shortAlias.
 * @param shortAlias Короткий алиас ссылки.
 * @returns Объект Link из базы данных.
 * @throws NotFoundError если ссылка не найдена.
 */
export const getLinkInfo = async (shortAlias: string) => {
  const link = await prisma.link.findUnique({
    where: { shortAlias: shortAlias },
    select: {
      // Указываем, какие поля нам нужны
      id: true,
      originalUrl: true,
      shortAlias: true,
      alias: true,
      createdAt: true,
      expiresAt: true,
      clickCount: true,
    },
  })

  if (!link) {
    throw new NotFoundError('Short URL information not found.')
  }

  return link
}

/**
 * Получает аналитику (список кликов) для короткой ссылки по её shortAlias.
 * @param shortAlias Короткий алиас ссылки.
 * @returns Массив объектов Click, связанных с данной ссылкой.
 * @throws NotFoundError если ссылка не найдена.
 */
export const getLinkAnalytics = async (shortAlias: string) => {
  const link = await prisma.link.findUnique({
    where: { shortAlias: shortAlias },
    select: {
      id: true,
      originalUrl: true,
      shortAlias: true,
      alias: true,
      clickCount: true,
      clicks: {
        select: {
          id: true,
          ipAddress: true,
          clickedAt: true,
        },
        orderBy: {
          clickedAt: 'asc',
        },
      },
    },
  })

  if (!link) {
    throw new NotFoundError('Short URL analytics not found.')
  }

  return link
}

/**
 * Удаляет короткую ссылку и все связанные с ней клики по shortAlias.
 * @param shortAlias Короткий алиас ссылки.
 * @returns Удаленная ссылка (или null, если не найдена и не удалось удалить).
 * @throws NotFoundError если ссылка не найдена.
 */
export const deleteShortLink = async (shortAlias: string) => {
  const linkToDelete = await prisma.link.findUnique({
    where: { shortAlias: shortAlias },
    select: { id: true },
  })

  if (!linkToDelete) {
    throw new NotFoundError('Short URL to delete not found.')
  }

  const [deletedClicks, deletedLink] = await prisma.$transaction([
    prisma.click.deleteMany({
      where: { linkId: linkToDelete.id },
    }),
    prisma.link.delete({
      where: { id: linkToDelete.id },
    }),
  ])

  return deletedLink
}
