import { Router } from 'express'
import { 
  getAllProcurements, 
  getProcurementById,
  createProcurement, 
  updateProcurementStatus 
} from '../controllers/procurement.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, adminOnly, getAllProcurements)
router.get('/:id', authenticate, adminOnly, getProcurementById)
router.post('/', authenticate, adminOnly, createProcurement)
router.put('/:id/status', authenticate, adminOnly, updateProcurementStatus)

export default router

