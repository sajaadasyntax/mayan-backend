import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllBankAccounts = async (req: Request, res: Response) => {
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json(bankAccounts)
  } catch (error) {
    console.error('Get bank accounts error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { bankNameEn, bankNameAr, accountName, accountNumber, branchEn, branchAr, image } = req.body
    const file = (req as any).file

    let imagePath = image || null
    if (file) {
      imagePath = `/uploads/bank-accounts/${file.filename}`
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        bankNameEn,
        bankNameAr,
        accountName,
        accountNumber,
        branchEn,
        branchAr,
        image: imagePath
      }
    })

    res.status(201).json(bankAccount)
  } catch (error) {
    console.error('Create bank account error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = { ...req.body }
    const file = (req as any).file

    if (file) {
      data.image = `/uploads/bank-accounts/${file.filename}`
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data
    })

    res.json(bankAccount)
  } catch (error) {
    console.error('Update bank account error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.bankAccount.update({
      where: { id },
      data: { isActive: false }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete bank account error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

