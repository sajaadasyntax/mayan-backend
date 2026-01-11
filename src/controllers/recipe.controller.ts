import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// Get all recipes (admin)
export const getAllRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const recipes = await prisma.productRecipe.findMany({
      include: {
        product: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(recipes)
  } catch (error) {
    console.error('Get recipes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get recipes for a specific product (public)
export const getRecipesByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params

    const recipes = await prisma.productRecipe.findMany({
      where: {
        productId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Also get the product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        image: true,
        descriptionEn: true,
        descriptionAr: true
      }
    })

    res.json({
      product,
      recipes
    })
  } catch (error) {
    console.error('Get product recipes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Check if a product has recipes (public)
export const checkProductHasRecipes = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params

    const count = await prisma.productRecipe.count({
      where: {
        productId,
        isActive: true
      }
    })

    res.json({ hasRecipes: count > 0, count })
  } catch (error) {
    console.error('Check recipes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get products that have recipes (public - for showing the button)
export const getProductsWithRecipes = async (req: Request, res: Response) => {
  try {
    const productsWithRecipes = await prisma.product.findMany({
      where: {
        recipes: {
          some: {
            isActive: true
          }
        }
      },
      select: {
        id: true
      }
    })

    const productIds = productsWithRecipes.map(p => p.id)
    res.json(productIds)
  } catch (error) {
    console.error('Get products with recipes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Create a new recipe (admin)
export const createRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, recipeNameEn, recipeNameAr, descriptionEn, descriptionAr, imageUrl } = req.body

    const recipe = await prisma.productRecipe.create({
      data: {
        productId,
        recipeNameEn,
        recipeNameAr,
        descriptionEn,
        descriptionAr,
        imageUrl
      },
      include: {
        product: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true
          }
        }
      }
    })

    res.status(201).json(recipe)
  } catch (error) {
    console.error('Create recipe error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Update a recipe (admin)
export const updateRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body

    const recipe = await prisma.productRecipe.update({
      where: { id },
      data,
      include: {
        product: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true
          }
        }
      }
    })

    res.json(recipe)
  } catch (error) {
    console.error('Update recipe error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete a recipe (admin)
export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.productRecipe.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Delete recipe error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

