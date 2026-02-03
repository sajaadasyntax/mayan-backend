import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { generateProcurementNumber } from '../utils/invoice.utils'

export const getAllProcurements = async (req: AuthRequest, res: Response) => {
  try {
    const procurements = await prisma.procurement.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        createdBy: {
          select: { name: true, phone: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(procurements)
  } catch (error) {
    console.error('Get procurements error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProcurementById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        createdBy: {
          select: { name: true, phone: true }
        }
      }
    })

    if (!procurement) {
      return res.status(404).json({ error: 'Procurement not found' })
    }

    res.json(procurement)
  } catch (error) {
    console.error('Get procurement error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createProcurement = async (req: AuthRequest, res: Response) => {
  try {
    const { items, supplier, notes, totalCost } = req.body
    const userId = req.user?.id

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in procurement order' })
    }

    const procurement = await prisma.procurement.create({
      data: {
        orderNumber: generateProcurementNumber(),
        supplier,
        notes,
        totalCost: parseFloat(totalCost),
        createdById: userId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            costPrice: parseFloat(item.costPrice)
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        createdBy: {
          select: { name: true, phone: true }
        }
      }
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })
    }

    res.status(201).json(procurement)
  } catch (error) {
    console.error('Create procurement error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProcurement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { items, supplier, notes, totalCost } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in procurement order' })
    }

    // Get the existing procurement with items to adjust stock
    const existingProcurement = await prisma.procurement.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingProcurement) {
      return res.status(404).json({ error: 'Procurement not found' })
    }

    // Calculate stock adjustments
    // First, reverse the old items (subtract quantities)
    for (const oldItem of existingProcurement.items) {
      await prisma.product.update({
        where: { id: oldItem.productId },
        data: { stock: { decrement: oldItem.quantity } }
      })
    }

    // Delete old items
    await prisma.procurementItem.deleteMany({
      where: { procurementId: id }
    })

    // Update procurement and create new items
    const procurement = await prisma.procurement.update({
      where: { id },
      data: {
        supplier,
        notes,
        totalCost: parseFloat(totalCost),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            costPrice: parseFloat(item.costPrice)
          }))
        }
      },
      include: {
        items: {
          include: { product: true }
        },
        createdBy: {
          select: { name: true, phone: true }
        }
      }
    })

    // Add new items to stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      })
    }

    res.json(procurement)
  } catch (error) {
    console.error('Update procurement error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProcurementStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const procurement = await prisma.procurement.update({
      where: { id },
      data: { status }
    })

    res.json(procurement)
  } catch (error) {
    console.error('Update procurement status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

