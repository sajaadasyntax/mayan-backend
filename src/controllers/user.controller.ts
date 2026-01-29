import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        loyaltyPoints: true,
        country: true,
        state: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, password, name, email, role, loyaltyPoints, country, state, address } = req.body

    // Check if phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        email,
        role: role || 'USER',
        loyaltyPoints: parseInt(loyaltyPoints) || 0,
        country,
        state,
        address,
        isActive: true // New users are active by default
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        loyaltyPoints: true,
        country: true,
        state: true,
        address: true,
        isActive: true,
        createdAt: true
      }
    })

    res.status(201).json(user)
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, email, role, loyaltyPoints, country, state, address, password, isActive } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (loyaltyPoints !== undefined) updateData.loyaltyPoints = parseInt(loyaltyPoints)
    if (country !== undefined) updateData.country = country
    if (state !== undefined) updateData.state = state
    if (address !== undefined) updateData.address = address
    if (isActive !== undefined) updateData.isActive = isActive
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        loyaltyPoints: true,
        country: true,
        state: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    // Don't allow deleting yourself
    if (id === req.user?.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    await prisma.user.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        loyaltyPoints: true,
        country: true,
        state: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { name, email, country, state, address } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        country,
        state,
        address
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        loyaltyPoints: true,
        country: true,
        state: true,
        address: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateLoyaltyPoints = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { points } = req.body

    const user = await prisma.user.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: parseInt(points)
        }
      }
    })

    res.json({ 
      id: user.id, 
      loyaltyPoints: user.loyaltyPoints 
    })
  } catch (error) {
    console.error('Update loyalty points error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const orders = await prisma.order.findMany({
      where: { userId: id },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(orders)
  } catch (error) {
    console.error('Get user orders error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

