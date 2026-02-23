import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('='.repeat(60))
  console.log('  INVENTORY AUDIT')
  console.log('='.repeat(60))
  console.log()

  const products = await prisma.product.findMany({
    include: {
      procurementItems: true,
      orderItems: true,
    },
    orderBy: { nameEn: 'asc' },
  })

  type Anomaly = {
    id: string
    name: string
    currentStock: number
    expectedStock: number
    totalProcured: number
    totalSold: number
    reason: string
  }

  const anomalies: Anomaly[] = []

  for (const p of products) {
    const totalProcured = p.procurementItems.reduce((sum, pi) => sum + pi.quantity, 0)
    const totalSold = p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0)
    const expectedStock = totalProcured - totalSold

    // Exact mismatch between stored stock and what history implies
    if (p.stock !== expectedStock) {
      anomalies.push({
        id: p.id,
        name: p.nameEn,
        currentStock: p.stock,
        expectedStock,
        totalProcured,
        totalSold,
        reason: 'STOCK_MISMATCH',
      })
      continue
    }

    // Products with stock but no supporting history at all
    if (p.stock > 0 && totalProcured === 0 && totalSold === 0) {
      anomalies.push({
        id: p.id,
        name: p.nameEn,
        currentStock: p.stock,
        expectedStock,
        totalProcured,
        totalSold,
        reason: 'PHANTOM_STOCK_NO_HISTORY',
      })
      continue
    }

    // Products where stock is positive but history suggests it should be zero or negative
    if (p.stock > 0 && expectedStock <= 0) {
      anomalies.push({
        id: p.id,
        name: p.nameEn,
        currentStock: p.stock,
        expectedStock,
        totalProcured,
        totalSold,
        reason: 'PHANTOM_STOCK_OVER_SOLD',
      })
      continue
    }
  }

  if (anomalies.length === 0) {
    console.log('No obvious stock inconsistencies detected.')
  } else {
    console.log(`Found ${anomalies.length} products with potential stock inconsistencies:`)
    for (const a of anomalies) {
      console.log(
        [
          `- ${a.name}`,
          `(id: ${a.id})`,
          `reason: ${a.reason}`,
          `currentStock=${a.currentStock}`,
          `expectedStock=${a.expectedStock}`,
          `totalProcured=${a.totalProcured}`,
          `totalSold=${a.totalSold}`,
        ].join(' | ')
      )
    }
  }

  console.log()
  console.log('Note: expectedStock is computed as totalProcured - totalSold based on procurement_items and order_items history.')
  console.log('If procurements/orders were manually edited or deleted, some phantom stock may not be explainable from history.')
}

main()
  .catch((e) => {
    console.error('Error during inventory audit:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

