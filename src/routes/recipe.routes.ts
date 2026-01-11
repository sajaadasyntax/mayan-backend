import { Router } from 'express'
import {
  getAllRecipes,
  getRecipesByProductId,
  checkProductHasRecipes,
  getProductsWithRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipe.controller'
import { authenticate, adminOnly } from '../middleware/auth.middleware'

const router = Router()

// Public routes
router.get('/products-with-recipes', getProductsWithRecipes)
router.get('/product/:productId', getRecipesByProductId)
router.get('/product/:productId/check', checkProductHasRecipes)

// Admin routes
router.get('/', authenticate, adminOnly, getAllRecipes)
router.post('/', authenticate, adminOnly, createRecipe)
router.put('/:id', authenticate, adminOnly, updateRecipe)
router.delete('/:id', authenticate, adminOnly, deleteRecipe)

export default router

