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

  throw new ShortAliasGenerationError()
}

export const createShortLink = async (data: CreateLinkDto) => {
  const { originalUrl, expiresAt, alias } = data

  let shortAlias: string

  if (alias) {
    const existingLink = await prisma.link.findUnique({
      where: { alias: alias },
    })
    if (existingLink) {
      throw new ConflictError()
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
      throw new ConflictError()
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
    throw new NotFoundError()
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    throw new NotFoundError()
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
    throw new NotFoundError()
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
      createdAt: true,
      expiresAt: true,
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
    throw new NotFoundError()
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
    throw new NotFoundError()
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

// ...existing code...

/**
 * Получает список всех коротких ссылок с пагинацией.
 * @param page Номер страницы (начиная с 1).
 * @param pageSize Количество ссылок на странице.
 * @returns Объект с массивом ссылок и общим количеством.
 */
export const getAllLinksPaginated = async (
  page: number = 1,
  pageSize: number = 20,
) => {
  const skip = (page - 1) * pageSize

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalUrl: true,
        shortAlias: true,
        alias: true,
        createdAt: true,
        expiresAt: true,
        clickCount: true,
      },
    }),
    prisma.link.count(),
  ])

  return {
    links,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
