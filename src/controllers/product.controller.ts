import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getImageUrl } from '../middleware/upload.middleware'

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, includeArchived } = req.query

    const where: any = {}
    
    // By default, exclude archived products (for customer-facing pages)
    // Admin can pass includeArchived=true to see all
    if (includeArchived !== 'true') {
      where.isArchived = false
    }
    
    if (categoryId) {
      where.categoryId = categoryId as string
    }
    
    if (search) {
      where.OR = [
        { nameEn: { contains: search as string, mode: 'insensitive' } },
        { nameAr: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      longDescriptionEn,
      longDescriptionAr,
      price,
      image,
      isNew,
      isSale,
      isComingSoon,
      discount,
      loyaltyPointsEnabled,
      loyaltyPointsValue,
      categoryId
    } = req.body

    // Handle file upload if present
    let imageUrl = image
    if (req.file) {
      imageUrl = getImageUrl(req.file.filename)
    }

    // Note: stock defaults to 0, use procurement to add inventory
    // Cost price is tracked per procurement batch, not per product
    const product = await prisma.product.create({
      data: {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        longDescriptionEn: longDescriptionEn || null,
        longDescriptionAr: longDescriptionAr || null,
        price: parseFloat(price),
        stock: 0, // Stock is managed via procurement, not product creation
        image: imageUrl,
        isNew: isNew === 'true' || isNew === true,
        isSale: isSale === 'true' || isSale === true,
        isComingSoon: isComingSoon === 'true' || isComingSoon === true,
        discount: discount ? parseFloat(discount) : null,
        loyaltyPointsEnabled: loyaltyPointsEnabled === 'true' || loyaltyPointsEnabled === true,
        loyaltyPointsValue: loyaltyPointsValue ? parseInt(loyaltyPointsValue) : 0,
        categoryId
      },
      include: {
        category: true
      }
    })

    res.status(201).json(product)
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = { ...req.body }

    // Handle file upload if present
    if (req.file) {
      data.image = getImageUrl(req.file.filename)
    }

    // Remove stock and costPrice from update data
    // Stock is managed via procurement only
    // Cost price is tracked per procurement batch, not per product
    delete data.stock
    delete data.costPrice

    // Convert numeric fields
    if (data.price !== undefined) data.price = parseFloat(data.price)
    if (data.discount !== undefined) data.discount = data.discount ? parseFloat(data.discount) : null
    if (data.loyaltyPointsValue !== undefined) data.loyaltyPointsValue = parseInt(data.loyaltyPointsValue) || 0

    // Convert boolean fields from string
    if (data.isNew !== undefined) data.isNew = data.isNew === 'true' || data.isNew === true
    if (data.isSale !== undefined) data.isSale = data.isSale === 'true' || data.isSale === true
    if (data.isComingSoon !== undefined) data.isComingSoon = data.isComingSoon === 'true' || data.isComingSoon === true
    if (data.loyaltyPointsEnabled !== undefined) {
      data.loyaltyPointsEnabled = data.loyaltyPointsEnabled === 'true' || data.loyaltyPointsEnabled === true
    }
    if (data.isArchived !== undefined) {
      data.isArchived = data.isArchived === 'true' || data.isArchived === true
    }

    // Handle long description fields - convert empty strings to null
    if (data.longDescriptionEn !== undefined) {
      data.longDescriptionEn = data.longDescriptionEn || null
    }
    if (data.longDescriptionAr !== undefined) {
      data.longDescriptionAr = data.longDescriptionAr || null
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true
      }
    })

    res.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.product.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

