import { Router } from 'express'
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'
import { uploadProductImage } from '../middleware/upload.middleware'

const router = Router()

router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.post('/', authenticate, adminOnly, uploadProductImage, createProduct)
router.put('/:id', authenticate, adminOnly, uploadProductImage, updateProduct)
router.delete('/:id', authenticate, adminOnly, deleteProduct)

export default router

