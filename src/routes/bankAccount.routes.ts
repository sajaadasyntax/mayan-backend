import { Router } from 'express'
import { 
  getAllBankAccounts, 
  createBankAccount, 
  updateBankAccount, 
  deleteBankAccount 
} from '../controllers/bankAccount.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'
import { uploadBankAccountImage } from '../middleware/upload.middleware'

const router = Router()

router.get('/', getAllBankAccounts)
router.post('/', authenticate, adminOnly, uploadBankAccountImage, createBankAccount)
router.put('/:id', authenticate, adminOnly, uploadBankAccountImage, updateBankAccount)
router.delete('/:id', authenticate, adminOnly, deleteBankAccount)

export default router

