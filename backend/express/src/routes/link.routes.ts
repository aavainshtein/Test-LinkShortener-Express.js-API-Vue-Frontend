// backend/express/src/routes/link.routes.ts
import { Router } from 'express'
import { validateRequest } from '../middlewares/validateRequest.middleware.js'
import { ipLoggerMiddleware } from '../middlewares/ipLogger.middleware.js'
import { createLinkSchema } from '../../shared/schemas/link.schema.js'
import {
  createShortLinkController,
  redirectToOriginalUrlController,
  getLinkInfoController,
  getLinkAnalyticsController,
  deleteShortLinkController,
} from '../controllers/link.controller.js'

const router = Router()

router.post(
  '/api/shorten',
  validateRequest(createLinkSchema, 'body'),
  createShortLinkController,
)

router.get('/:shortAlias', ipLoggerMiddleware, redirectToOriginalUrlController)

router.get('/info/:shortAlias', getLinkInfoController)

router.get('/analytics/:shortAlias', getLinkAnalyticsController)

router.delete('/delete/:shortAlias', deleteShortLinkController)

export default router
