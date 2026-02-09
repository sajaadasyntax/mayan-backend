import { Router } from 'express'
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder 
} from '../controllers/order.controller'
import { authenticate } from '../middleware/auth.middleware'
import { uploadPaymentProof } from '../middleware/upload.middleware'

const router = Router()

router.get('/', authenticate, getAllOrders)
router.get('/:id', authenticate, getOrderById)
router.post('/', authenticate, createOrder)
router.put('/:id', authenticate, uploadPaymentProof, updateOrder)

export default router

