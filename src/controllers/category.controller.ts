import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { flat } = req.query
    
    if (flat === 'true') {
      // Return flat list for dropdowns
      const categories = await prisma.category.findMany({
        include: {
          parent: true,
          _count: {
            select: { products: true, children: true }
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      })
      return res.json(categories)
    }

    // Return hierarchical structure (only root categories with nested children)
    const categories = await prisma.category.findMany({
      where: {
        parentId: null
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                _count: {
                  select: { products: true }
                }
              },
              orderBy: {
                sortOrder: 'asc'
              }
            },
            _count: {
              select: { products: true, children: true }
            }
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        _count: {
          select: { products: true, children: true }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        products: true,
        _count: {
          select: { products: true, children: true }
        }
      }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { nameEn, nameAr, description, parentId } = req.body

    const category = await prisma.category.create({
      data: {
        nameEn,
        nameAr,
        description,
        parentId: parentId || null
      },
      include: {
        parent: true
      }
    })

    res.status(201).json(category)
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { nameEn, nameAr, description, parentId } = req.body

    const category = await prisma.category.update({
      where: { id },
      data: {
        nameEn,
        nameAr,
        description,
        parentId: parentId === '' ? null : parentId
      },
      include: {
        parent: true
      }
    })

    res.json(category)
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.category.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateCategoryOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { categories } = req.body // Array of { id, sortOrder }

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Invalid data format' })
    }

    // Update all categories in a transaction
    await prisma.$transaction(
      categories.map(cat => 
        prisma.category.update({
          where: { id: cat.id },
          data: { sortOrder: cat.sortOrder }
        })
      )
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Update category order error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

