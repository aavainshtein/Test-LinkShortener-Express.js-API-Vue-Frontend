// shared/schemas/link.schema.ts
import { z } from 'zod'

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .url('Invalid URL format')
    .min(1, 'Original URL cannot be empty'),
  expiresAt: z
    .union([
      z
        .string()
        .datetime({ message: 'Invalid ISO 8601 date format', local: true })
        .optional(),
      z.null(),
    ])
    .optional(), // Optional, can be null or a valid ISO 8601 string
  alias: z.union([
    z
      .string()
      .min(1, 'Alias cannot be empty')
      .max(20, 'Alias too long')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Alias can only contain alphanumeric characters, hyphens, and underscores',
      )
      .optional(),
    z.null(),
  ]),
})

export type CreateLinkDto = z.infer<typeof createLinkSchema>
