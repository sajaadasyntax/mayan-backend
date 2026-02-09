import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(coupons)
  } catch (error) {
    console.error('Get coupons error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minPurchase, maxUses, expiresAt } = req.body

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    })

    res.status(201).json(coupon)
  } catch (error) {
    console.error('Create coupon error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' })
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: 'Coupon is no longer active' })
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' })
    }

    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return res.status(400).json({ 
        error: `Minimum purchase of ${coupon.minPurchase} required` 
      })
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100
    } else {
      discount = coupon.discountValue
    }

    res.json({
      valid: true,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body

    // Handle numeric conversions - convert empty strings to null
    if (data.discountValue !== undefined) {
      data.discountValue = data.discountValue ? parseFloat(data.discountValue) : null
    }
    if (data.minPurchase !== undefined) {
      data.minPurchase = data.minPurchase ? parseFloat(data.minPurchase) : null
    }
    if (data.maxUses !== undefined) {
      data.maxUses = data.maxUses ? parseInt(data.maxUses) : null
    }
    if (data.expiresAt !== undefined) {
      data.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
    }

    // Handle boolean conversions
    if (data.isActive !== undefined) {
      data.isActive = data.isActive === 'true' || data.isActive === true
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data
    })

    res.json(coupon)
  } catch (error) {
    console.error('Update coupon error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.coupon.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete coupon error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

