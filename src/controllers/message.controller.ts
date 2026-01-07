import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query // 'inbox' or 'sent'
    const userId = req.user?.id
    const isAdmin = req.user?.role === 'ADMIN'

    let where: any = {}

    if (type === 'sent') {
      where.senderId = userId
    } else {
      // Inbox - received messages + broadcasts
      where.OR = [
        { receiverId: userId },
        { isBroadcast: true }
      ]
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const isAdmin = req.user?.role === 'ADMIN'
    const { subject, content, receiverId, isBroadcast } = req.body

    // Only admin can send broadcasts
    if (isBroadcast && !isAdmin) {
      return res.status(403).json({ error: 'Only admin can send broadcast messages' })
    }

    const message = await prisma.message.create({
      data: {
        subject,
        content,
        senderId: userId,
        receiverId: isBroadcast ? null : receiverId,
        isBroadcast: isBroadcast || false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })

    res.status(201).json(message)
  } catch (error) {
    console.error('Create message error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const message = await prisma.message.update({
      where: { id },
      data: { isRead: true }
    })

    res.json(message)
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

