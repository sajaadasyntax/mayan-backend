import { Router } from 'express'
import { 
  getAllBankAccounts, 
  createBankAccount, 
  updateBankAccount, 
  deleteBankAccount 
} from '../controllers/bankAccount.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', getAllBankAccounts)
router.post('/', authenticate, adminOnly, createBankAccount)
router.put('/:id', authenticate, adminOnly, updateBankAccount)
router.delete('/:id', authenticate, adminOnly, deleteBankAccount)

export default router

