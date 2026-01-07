import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// Get top 10 selling products for this month
export const getTopProductsSales = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true
      },
      where: {
        order: {
          paymentStatus: 'VERIFIED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    })

    // Get product details
    const productIds = topProducts.map(p => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        price: true,
        costPrice: true
      }
    })

    const result = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId)
      return {
        productId: tp.productId,
        name: product?.nameEn || 'Unknown',
        nameAr: product?.nameAr || 'غير معروف',
        totalQuantity: tp._sum.quantity || 0,
        totalRevenue: (tp._sum.price || 0) * (tp._sum.quantity || 0)
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get top products error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get top 10 customers by purchase amount this month
export const getTopCustomersSales = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      _sum: {
        total: true
      },
      _count: {
        id: true
      },
      where: {
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      orderBy: {
        _sum: {
          total: 'desc'
        }
      },
      take: 10
    })

    // Get customer details
    const userIds = topCustomers.map(c => c.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    })

    const result = topCustomers.map(tc => {
      const user = users.find(u => u.id === tc.userId)
      return {
        userId: tc.userId,
        name: user?.name || user?.phone || 'Unknown',
        phone: user?.phone || '',
        email: user?.email || '',
        totalOrders: tc._count.id,
        totalSpent: tc._sum.total || 0
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Get top customers error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get profit and loss report for this month
export const getProfitLossReport = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get daily sales data with cost
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'VERIFIED',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                costPrice: true
              }
            }
          }
        }
      }
    })

    // Group by day
    const dailyData: { [key: string]: { revenue: number; cost: number; profit: number } } = {}

    // Initialize all days of the month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const day = i.toString().padStart(2, '0')
      dailyData[day] = { revenue: 0, cost: 0, profit: 0 }
    }

    // Calculate revenue and cost for each order
    orders.forEach(order => {
      const day = new Date(order.createdAt).getDate().toString().padStart(2, '0')
      
      let orderCost = 0
      order.items.forEach(item => {
        const itemCost = (item.product.costPrice || 0) * item.quantity
        orderCost += itemCost
      })

      dailyData[day].revenue += order.total
      dailyData[day].cost += orderCost
      dailyData[day].profit = dailyData[day].revenue - dailyData[day].cost
    })

    // Also get procurement costs for the month
    const procurements = await prisma.procurement.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const totalProcurementCost = procurements.reduce((sum, p) => sum + p.totalCost, 0)

    // Convert to array format for charts
    const chartData = Object.entries(dailyData).map(([day, data]) => ({
      day: `Day ${parseInt(day)}`,
      dayNum: parseInt(day),
      revenue: Math.round(data.revenue),
      cost: Math.round(data.cost),
      profit: Math.round(data.profit)
    })).sort((a, b) => a.dayNum - b.dayNum)

    // Calculate totals
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0)
    const totalCost = chartData.reduce((sum, d) => sum + d.cost, 0)
    const totalProfit = totalRevenue - totalCost

    res.json({
      chartData,
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        totalProcurementCost,
        netProfit: totalProfit - totalProcurementCost
      }
    })
  } catch (error) {
    console.error('Get profit/loss report error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Get all reports combined
export const getAllReports = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Get basic stats
    const [totalOrders, pendingOrders, verifiedOrders, totalUsers] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      prisma.order.count({
        where: {
          paymentStatus: 'PENDING',
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      prisma.order.count({
        where: {
          paymentStatus: 'VERIFIED',
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        }
      })
    ])

    // Get revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        paymentStatus: 'VERIFIED',
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      }
    })

    res.json({
      totalOrders,
      pendingOrders,
      verifiedOrders,
      totalUsers,
      totalRevenue: revenueResult._sum.total || 0,
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    })
  } catch (error) {
    console.error('Get all reports error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

