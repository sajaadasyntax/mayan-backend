import { Router } from 'express'
import { 
  getAllSupportInfo, 
  createSupportInfo, 
  updateSupportInfo, 
  deleteSupportInfo 
} from '../controllers/support.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', getAllSupportInfo)
router.post('/', authenticate, adminOnly, createSupportInfo)
router.put('/:id', authenticate, adminOnly, updateSupportInfo)
router.delete('/:id', authenticate, adminOnly, deleteSupportInfo)

export default router

