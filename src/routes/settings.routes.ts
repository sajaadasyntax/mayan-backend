import { Router } from 'express'
import { getSettings, updateSettings, uploadBanner } from '../controllers/settings.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

const router = Router()

// Public routes
router.get('/', getSettings)

// Admin routes
router.put('/', authenticate, adminOnly, updateSettings)
router.post('/banner', authenticate, adminOnly, upload.single('image'), uploadBanner)

export default router

