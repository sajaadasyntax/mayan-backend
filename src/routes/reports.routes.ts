import { Router } from 'express'
import { 
  getTopProductsSales, 
  getTopCustomersSales, 
  getProfitLossReport,
  getAllReports
} from '../controllers/reports.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, adminOnly, getAllReports)
router.get('/top-products', authenticate, adminOnly, getTopProductsSales)
router.get('/top-customers', authenticate, adminOnly, getTopCustomersSales)
router.get('/profit-loss', authenticate, adminOnly, getProfitLossReport)

export default router

