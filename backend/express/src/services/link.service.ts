// backend/express/src/services/link.service.ts
import { PrismaClient } from '@prisma/client'
import { CreateLinkDto } from '../../shared/schemas/link.schema'
import { NotFoundError, ConflictError } from '../utils/errors.util'

const prisma = new PrismaClient()

export const generateUniqueShortAlias = async (): Promise<string> => {
  return Math.random().toString(36).substring(2, 9)
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

export const getOriginalUrl = async (shortAlias: string) => {
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

  return link.originalUrl
}
