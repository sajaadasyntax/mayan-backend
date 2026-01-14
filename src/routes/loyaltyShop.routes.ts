import { Router } from 'express'
import { authenticate, adminOnly } from '../middleware/auth.middleware'
import {
  getLoyaltySettings,
  updateLoyaltySettings,
  checkLoyaltyShopAccess,
  getLoyaltyProducts,
  addLoyaltyProduct,
  updateLoyaltyProduct,
  removeLoyaltyProduct,
  redeemLoyaltyProduct,
  getMyRedemptions,
  getAllRedemptions,
  updateRedemptionStatus,
  getAvailableProducts
} from '../controllers/loyaltyShop.controller'

const router = Router()

// Public routes
router.get('/settings', getLoyaltySettings)

// Authenticated user routes
router.get('/access', authenticate, checkLoyaltyShopAccess)
router.get('/products', authenticate, getLoyaltyProducts)
router.post('/redeem', authenticate, redeemLoyaltyProduct)
router.get('/my-redemptions', authenticate, getMyRedemptions)

// Admin routes
router.put('/settings', authenticate, adminOnly, updateLoyaltySettings)
router.post('/products', authenticate, adminOnly, addLoyaltyProduct)
router.put('/products/:id', authenticate, adminOnly, updateLoyaltyProduct)
router.delete('/products/:id', authenticate, adminOnly, removeLoyaltyProduct)
router.get('/available-products', authenticate, adminOnly, getAvailableProducts)
router.get('/redemptions', authenticate, adminOnly, getAllRedemptions)
router.put('/redemptions/:id/status', authenticate, adminOnly, updateRedemptionStatus)

export default router

