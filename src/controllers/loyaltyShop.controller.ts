import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// Get loyalty shop settings (public - to check unlock threshold)
export const getLoyaltySettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.loyaltySettings.findFirst()
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.loyaltySettings.create({
        data: {
          id: 'default',
          minPointsToUnlock: 500,
          pointsPerCurrency: 1
        }
      })
    }

    res.json(settings)
  } catch (error) {
    console.error('Get loyalty settings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Update loyalty shop settings (admin only)
export const updateLoyaltySettings = async (req: AuthRequest, res: Response) => {
  try {
    const { minPointsToUnlock, pointsPerCurrency } = req.body

    let settings = await prisma.loyaltySettings.findFirst()

    if (settings) {
      settings = await prisma.loyaltySettings.update({
        where: { id: settings.id },
        data: {
          minPointsToUnlock: minPointsToUnlock ?? settings.minPointsToUnlock,
          pointsPerCurrency: pointsPerCurrency ?? settings.pointsPerCurrency
        }
      })
    } else {
      settings = await prisma.loyaltySettings.create({
        data: {
          id: 'default',
          minPointsToUnlock: minPointsToUnlock ?? 500,
          pointsPerCurrency: pointsPerCurrency ?? 1
        }
      })
    }

    res.json(settings)
  } catch (error) {
    console.error('Update loyalty settings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Check if user can access loyalty shop
export const checkLoyaltyShopAccess = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.json({ canAccess: false, reason: 'not_authenticated' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const settings = await prisma.loyaltySettings.findFirst()

    if (!user || !settings) {
      return res.json({ canAccess: false, reason: 'error' })
    }

    const canAccess = user.loyaltyPoints >= settings.minPointsToUnlock

    res.json({
      canAccess,
      userPoints: user.loyaltyPoints,
      requiredPoints: settings.minPointsToUnlock,
      reason: canAccess ? 'unlocked' : 'insufficient_points'
    })
  } catch (error) {
    console.error('Check loyalty shop access error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get all loyalty products (for authenticated users who have enough points)
export const getLoyaltyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const isAdmin = req.user?.role === 'ADMIN'

    // Admins can see all, users need to have enough points
    if (!isAdmin && userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      const settings = await prisma.loyaltySettings.findFirst()

      if (!user || !settings || user.loyaltyPoints < settings.minPointsToUnlock) {
        return res.status(403).json({ error: 'You need more points to access the loyalty shop' })
      }
    }

    const where = isAdmin ? {} : { isActive: true }

    const loyaltyProducts = await prisma.loyaltyProduct.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        pointsRequired: 'asc'
      }
    })

    // Filter out products that are out of stock (for non-admins)
    const filteredProducts = isAdmin
      ? loyaltyProducts
      : loyaltyProducts.filter(lp => {
          if (lp.stockLimit === null) return true
          return lp.stockUsed < lp.stockLimit
        })

    res.json(filteredProducts)
  } catch (error) {
    console.error('Get loyalty products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Add product to loyalty shop (admin only)
export const addLoyaltyProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, pointsRequired, stockLimit, isActive } = req.body

    if (!productId || !pointsRequired) {
      return res.status(400).json({ error: 'productId and pointsRequired are required' })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if product is already in loyalty shop
    const existing = await prisma.loyaltyProduct.findUnique({ where: { productId } })
    if (existing) {
      return res.status(400).json({ error: 'Product is already in the loyalty shop' })
    }

    const loyaltyProduct = await prisma.loyaltyProduct.create({
      data: {
        productId,
        pointsRequired,
        stockLimit: stockLimit || null,
        isActive: isActive ?? true
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    res.status(201).json(loyaltyProduct)
  } catch (error) {
    console.error('Add loyalty product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Update loyalty product (admin only)
export const updateLoyaltyProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { pointsRequired, stockLimit, isActive } = req.body

    const loyaltyProduct = await prisma.loyaltyProduct.findUnique({ where: { id } })
    if (!loyaltyProduct) {
      return res.status(404).json({ error: 'Loyalty product not found' })
    }

    const updated = await prisma.loyaltyProduct.update({
      where: { id },
      data: {
        pointsRequired: pointsRequired ?? loyaltyProduct.pointsRequired,
        stockLimit: stockLimit === undefined ? loyaltyProduct.stockLimit : stockLimit,
        isActive: isActive ?? loyaltyProduct.isActive
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Update loyalty product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Remove product from loyalty shop (admin only)
export const removeLoyaltyProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const loyaltyProduct = await prisma.loyaltyProduct.findUnique({ where: { id } })
    if (!loyaltyProduct) {
      return res.status(404).json({ error: 'Loyalty product not found' })
    }

    await prisma.loyaltyProduct.delete({ where: { id } })

    res.json({ message: 'Product removed from loyalty shop' })
  } catch (error) {
    console.error('Remove loyalty product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Redeem a loyalty product
export const redeemLoyaltyProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { loyaltyProductId, quantity = 1, country, state, address } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!loyaltyProductId) {
      return res.status(400).json({ error: 'loyaltyProductId is required' })
    }

    // Get user and check points
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get loyalty product
    const loyaltyProduct = await prisma.loyaltyProduct.findUnique({
      where: { id: loyaltyProductId },
      include: { product: true }
    })

    if (!loyaltyProduct) {
      return res.status(404).json({ error: 'Loyalty product not found' })
    }

    if (!loyaltyProduct.isActive) {
      return res.status(400).json({ error: 'This product is currently unavailable' })
    }

    // Check stock
    if (loyaltyProduct.stockLimit !== null) {
      const availableStock = loyaltyProduct.stockLimit - loyaltyProduct.stockUsed
      if (availableStock < quantity) {
        return res.status(400).json({ error: 'Not enough stock available' })
      }
    }

    // Calculate total points needed
    const totalPointsRequired = loyaltyProduct.pointsRequired * quantity

    // Check if user has enough points
    if (user.loyaltyPoints < totalPointsRequired) {
      return res.status(400).json({
        error: 'Insufficient points',
        required: totalPointsRequired,
        available: user.loyaltyPoints
      })
    }

    // Check settings for shop access
    const settings = await prisma.loyaltySettings.findFirst()
    if (settings && user.loyaltyPoints < settings.minPointsToUnlock) {
      return res.status(403).json({ error: 'You need more points to access the loyalty shop' })
    }

    // Create redemption and deduct points in a transaction
    const [redemption] = await prisma.$transaction([
      // Create redemption record
      prisma.loyaltyRedemption.create({
        data: {
          userId,
          loyaltyProductId,
          pointsSpent: totalPointsRequired,
          quantity,
          country,
          state,
          address,
          status: 'pending'
        },
        include: {
          loyaltyProduct: {
            include: {
              product: true
            }
          }
        }
      }),
      // Deduct points from user
      prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { decrement: totalPointsRequired } }
      }),
      // Update stock used
      prisma.loyaltyProduct.update({
        where: { id: loyaltyProductId },
        data: { stockUsed: { increment: quantity } }
      })
    ])

    res.status(201).json({
      message: 'Product redeemed successfully',
      redemption,
      pointsSpent: totalPointsRequired,
      remainingPoints: user.loyaltyPoints - totalPointsRequired
    })
  } catch (error) {
    console.error('Redeem loyalty product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get user's redemption history
export const getMyRedemptions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const redemptions = await prisma.loyaltyRedemption.findMany({
      where: { userId },
      include: {
        loyaltyProduct: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(redemptions)
  } catch (error) {
    console.error('Get my redemptions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get all redemptions (admin only)
export const getAllRedemptions = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query

    const where = status ? { status: status as string } : {}

    const redemptions = await prisma.loyaltyRedemption.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        loyaltyProduct: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(redemptions)
  } catch (error) {
    console.error('Get all redemptions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Update redemption status (admin only)
export const updateRedemptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const redemption = await prisma.loyaltyRedemption.findUnique({
      where: { id },
      include: { loyaltyProduct: true }
    })

    if (!redemption) {
      return res.status(404).json({ error: 'Redemption not found' })
    }

    // If cancelling, refund points and restore stock
    if (status === 'cancelled' && redemption.status !== 'cancelled') {
      await prisma.$transaction([
        // Refund points to user
        prisma.user.update({
          where: { id: redemption.userId },
          data: { loyaltyPoints: { increment: redemption.pointsSpent } }
        }),
        // Restore stock
        prisma.loyaltyProduct.update({
          where: { id: redemption.loyaltyProductId },
          data: { stockUsed: { decrement: redemption.quantity } }
        }),
        // Update redemption status
        prisma.loyaltyRedemption.update({
          where: { id },
          data: { status }
        })
      ])

      const updated = await prisma.loyaltyRedemption.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true }
          },
          loyaltyProduct: { include: { product: true } }
        }
      })

      return res.json({ ...updated, pointsRefunded: redemption.pointsSpent })
    }

    const updated = await prisma.loyaltyRedemption.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true }
        },
        loyaltyProduct: { include: { product: true } }
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Update redemption status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get products not in loyalty shop (for admin selection)
export const getAvailableProducts = async (req: AuthRequest, res: Response) => {
  try {
    // Get IDs of products already in loyalty shop
    const loyaltyProductIds = await prisma.loyaltyProduct.findMany({
      select: { productId: true }
    })
    const existingIds = loyaltyProductIds.map(lp => lp.productId)

    // Get products not in loyalty shop
    const products = await prisma.product.findMany({
      where: {
        id: {
          notIn: existingIds
        }
      },
      include: {
        category: true
      },
      orderBy: {
        nameEn: 'asc'
      }
    })

    res.json(products)
  } catch (error) {
    console.error('Get available products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

