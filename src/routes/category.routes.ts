import { Router } from 'express'
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

router.get('/', getAllCategories)
router.get('/:id', getCategoryById)
router.post('/', authenticate, adminOnly, createCategory)
router.put('/:id', authenticate, adminOnly, updateCategory)
router.delete('/:id', authenticate, adminOnly, deleteCategory)

export default router

