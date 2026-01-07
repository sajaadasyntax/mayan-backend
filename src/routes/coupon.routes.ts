import { Router } from 'express'
import { 
  getAllCoupons, 
  createCoupon, 
  validateCoupon,
  updateCoupon,
  deleteCoupon 
} from '../controllers/coupon.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, adminOnly, getAllCoupons)
router.post('/', authenticate, adminOnly, createCoupon)
router.post('/validate', validateCoupon)
router.put('/:id', authenticate, adminOnly, updateCoupon)
router.delete('/:id', authenticate, adminOnly, deleteCoupon)

export default router

