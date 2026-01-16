import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    // Get first (and only) settings record, or return empty object
    let settings = await prisma.siteSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.siteSettings.create({
        data: {}
      })
    }

    res.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      supportPhone,
      supportEmail,
      supportWhatsapp,
      supportAddressEn,
      supportAddressAr,
      workingHoursEn,
      workingHoursAr
    } = req.body

    // Get existing settings or create new
    let settings = await prisma.siteSettings.findFirst()
    
    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          supportPhone,
          supportEmail,
          supportWhatsapp,
          supportAddressEn,
          supportAddressAr,
          workingHoursEn,
          workingHoursAr
        }
      })
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          supportPhone,
          supportEmail,
          supportWhatsapp,
          supportAddressEn,
          supportAddressAr,
          workingHoursEn,
          workingHoursAr
        }
      })
    }

    res.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const uploadBanner = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const bannerImage = `/uploads/${req.file.filename}`

    // Get existing settings or create new
    let settings = await prisma.siteSettings.findFirst()
    
    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { bannerImage }
      })
    } else {
      settings = await prisma.siteSettings.create({
        data: { bannerImage }
      })
    }

    res.json({ bannerImage: settings.bannerImage })
  } catch (error) {
    console.error('Upload banner error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

