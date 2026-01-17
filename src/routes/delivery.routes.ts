import { Router } from 'express'
import { 
  getAllDeliveryZones, 
  getDeliveryPrice,
  createDeliveryZone, 
  updateDeliveryZone,
  deleteDeliveryZone 
} from '../controllers/delivery.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', getAllDeliveryZones)
router.get('/price', getDeliveryPrice)
router.post('/', authenticate, adminOnly, createDeliveryZone)
router.put('/:id', authenticate, adminOnly, updateDeliveryZone)
router.delete('/:id', authenticate, adminOnly, deleteDeliveryZone)

export default router

