import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { generateInvoiceNumber } from '../utils/invoice.utils'

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query
    
    const where: any = {}
    
    // Admin sees all, users see only their own
    if (req.user?.role !== 'ADMIN') {
      where.userId = req.user?.id
    }
    
    if (status) {
      where.status = status as string
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check authorization
    if (req.user?.role !== 'ADMIN' && order.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { items, country, state, address, couponCode, useLoyaltyPoints } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' })
    }

    // Calculate totals and loyalty points
    let subtotal = 0
    let totalLoyaltyPointsEarned = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` })
      }

      subtotal += product.price * item.quantity
      
      // Calculate loyalty points earned for this item
      const itemLoyaltyPoints = product.loyaltyPointsEnabled 
        ? product.loyaltyPointsValue * item.quantity 
        : 0
      totalLoyaltyPointsEarned += itemLoyaltyPoints

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        loyaltyPointsEarned: itemLoyaltyPoints
      })
    }

    // Get delivery price
    let delivery = 0
    if (country && state) {
      const zone = await prisma.deliveryZone.findUnique({
        where: {
          country_state: { country, state }
        }
      })
      delivery = zone?.price || 3000
    }

    // Apply coupon
    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      })

      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minPurchase || subtotal >= coupon.minPurchase) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            if (coupon.discountType === 'percentage') {
              discount = (subtotal * coupon.discountValue) / 100
            } else {
              discount = coupon.discountValue
            }

            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: coupon.usedCount + 1 }
            })
          }
        }
      }
    }

    // Handle loyalty points usage
    let loyaltyPointsUsed = 0
    if (useLoyaltyPoints) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user && user.loyaltyPoints > 0) {
        // 1 loyalty point = 1 SDG discount (adjust as needed)
        const maxDiscount = subtotal + delivery - discount
        loyaltyPointsUsed = Math.min(user.loyaltyPoints, maxDiscount)
        
        // Deduct points from user
        await prisma.user.update({
          where: { id: userId },
          data: { loyaltyPoints: { decrement: loyaltyPointsUsed } }
        })
      }
    }

    const total = Math.max(0, subtotal + delivery - discount - loyaltyPointsUsed)

    // Create order
    const order = await prisma.order.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        userId: userId!,
        subtotal,
        delivery,
        discount,
        total,
        loyaltyPointsEarned: totalLoyaltyPointsEarned,
        loyaltyPointsUsed,
        country,
        state,
        address,
        couponCode,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status, paymentStatus, paymentProof } = req.body

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Only admin can update status
    if ((status || paymentStatus) && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update status' })
    }

    // Users can only update their own order's payment proof
    if (req.user?.role !== 'ADMIN' && order.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (paymentProof) updateData.paymentProof = paymentProof

    // Award loyalty points when payment is verified
    if (paymentStatus === 'VERIFIED' && order.paymentStatus !== 'VERIFIED' && order.loyaltyPointsEarned > 0) {
      await prisma.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: order.loyaltyPointsEarned } }
      })
    }

    // Refund loyalty points if order is cancelled and points were used
    if (status === 'CANCELLED' && order.status !== 'CANCELLED' && order.loyaltyPointsUsed > 0) {
      await prisma.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: order.loyaltyPointsUsed } }
      })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            loyaltyPoints: true
          }
        }
      }
    })

    res.json(updatedOrder)
  } catch (error) {
    console.error('Update order error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

