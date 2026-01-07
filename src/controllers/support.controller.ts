import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllSupportInfo = async (req: Request, res: Response) => {
  try {
    const supportInfo = await prisma.supportInfo.findMany({
      orderBy: { createdAt: 'desc' }
    })

    res.json(supportInfo)
  } catch (error) {
    console.error('Get support info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createSupportInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { titleEn, titleAr, contentEn, contentAr, phone, email } = req.body

    const supportInfo = await prisma.supportInfo.create({
      data: {
        titleEn,
        titleAr,
        contentEn,
        contentAr,
        phone,
        email
      }
    })

    res.status(201).json(supportInfo)
  } catch (error) {
    console.error('Create support info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateSupportInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body

    const supportInfo = await prisma.supportInfo.update({
      where: { id },
      data
    })

    res.json(supportInfo)
  } catch (error) {
    console.error('Update support info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteSupportInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.supportInfo.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete support info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

