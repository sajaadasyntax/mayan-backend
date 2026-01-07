import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllDeliveryZones = async (req: Request, res: Response) => {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: [
        { country: 'asc' },
        { state: 'asc' }
      ]
    })

    res.json(zones)
  } catch (error) {
    console.error('Get delivery zones error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getDeliveryPrice = async (req: Request, res: Response) => {
  try {
    const { country, state } = req.query

    if (!country || !state) {
      return res.status(400).json({ error: 'Country and state are required' })
    }

    const zone = await prisma.deliveryZone.findUnique({
      where: {
        country_state: {
          country: country as string,
          state: state as string
        }
      }
    })

    if (!zone) {
      return res.json({ price: 3000 }) // Default price
    }

    res.json({ price: zone.price })
  } catch (error) {
    console.error('Get delivery price error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createDeliveryZone = async (req: AuthRequest, res: Response) => {
  try {
    const { country, state, price } = req.body

    const zone = await prisma.deliveryZone.create({
      data: {
        country,
        state,
        price: parseFloat(price)
      }
    })

    res.status(201).json(zone)
  } catch (error) {
    console.error('Create delivery zone error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateDeliveryZone = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { price, isActive } = req.body

    const zone = await prisma.deliveryZone.update({
      where: { id },
      data: {
        price: price ? parseFloat(price) : undefined,
        isActive
      }
    })

    res.json(zone)
  } catch (error) {
    console.error('Update delivery zone error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

