import { Router } from 'express'
import { 
  getAllUsers, 
  getUserById, 
  updateProfile,
  updateLoyaltyPoints,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, adminOnly, getAllUsers)
router.get('/:id', authenticate, adminOnly, getUserById)
router.post('/', authenticate, adminOnly, createUser)
router.put('/profile', authenticate, updateProfile)
router.put('/:id', authenticate, adminOnly, updateUser)
router.put('/:id/loyalty', authenticate, adminOnly, updateLoyaltyPoints)
router.delete('/:id', authenticate, adminOnly, deleteUser)

export default router

