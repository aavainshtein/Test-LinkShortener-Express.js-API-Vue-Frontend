// backend/express/src/routes/link.routes.ts
import { Router } from 'express'
import { validateRequest } from '../middlewares/validateRequest.middleware'
import { createLinkSchema } from '../../shared/schemas/link.schema' 
import {
  createShortLinkController,
  redirectToOriginalUrlController,
} from '../controllers/link.controller'

const router = Router()


router.post(
  '/api/shorten',
  validateRequest(createLinkSchema, 'body'),
  createShortLinkController,
)


router.get('/:shortAlias', redirectToOriginalUrlController)

export default router
