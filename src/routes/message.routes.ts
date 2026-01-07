import { Router } from 'express'
import { 
  getMessages, 
  createMessage, 
  markAsRead 
} from '../controllers/message.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, getMessages)
router.post('/', authenticate, createMessage)
router.put('/:id/read', authenticate, markAsRead)

export default router

