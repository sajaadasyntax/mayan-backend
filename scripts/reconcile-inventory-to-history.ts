import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY_RUN = !process.argv.includes('--execute')

async function main() {
  console.log('='.repeat(60))
  console.log(
    DRY_RUN
      ? '  INVENTORY RECONCILIATION — PREVIEW ONLY'
      : '  INVENTORY RECONCILIATION — EXECUTE MODE (stocks will be updated)'
  )
  console.log('='.repeat(60))
  console.log()

  const products = await prisma.product.findMany({
    include: {
      procurementItems: true,
      orderItems: true,
    },
    orderBy: { nameEn: 'asc' },
  })

  type Change = {
    id: string
    name: string
    currentStock: number
    expectedStock: number
    totalProcured: number
    totalSold: number
    reason: 'STOCK_MISMATCH'
  }

  const changes: Change[] = []

  for (const p of products) {
    const totalProcured = p.procurementItems.reduce((sum, pi) => sum + pi.quantity, 0)
    const totalSold = p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0)
    const expectedStock = totalProcured - totalSold

    // Only reconcile simple mismatches where expectedStock is non-negative
    if (p.stock !== expectedStock && expectedStock >= 0) {
      changes.push({
        id: p.id,
        name: p.nameEn,
        currentStock: p.stock,
        expectedStock,
        totalProcured,
        totalSold,
        reason: 'STOCK_MISMATCH',
      })
    }
  }

  if (changes.length === 0) {
    console.log('No products need reconciliation based on current history.')
    return
  }

  console.log(`Products whose stock will be aligned to (procured - sold):`)
  for (const c of changes) {
    console.log(
      [
        `- ${c.name}`,
        `(id: ${c.id})`,
        `reason: ${c.reason}`,
        `currentStock=${c.currentStock}`,
        `expectedStock=${c.expectedStock}`,
        `totalProcured=${c.totalProcured}`,
        `totalSold=${c.totalSold}`,
      ].join(' | ')
    )
  }

  console.log()
  if (DRY_RUN) {
    console.log('DRY RUN — no changes were made.')
    console.log('Run with --execute to apply these stock values.')
    return
  }

  console.log('Applying stock updates...')
  for (const c of changes) {
    await prisma.product.update({
      where: { id: c.id },
      data: { stock: c.expectedStock },
    })
    console.log(`  Updated ${c.name}: ${c.currentStock} -> ${c.expectedStock}`)
  }

  console.log()
  console.log('Reconciliation complete.')
  console.log('Note: stock is now equal to (totalProcured - totalSold) for updated products.')
}

main()
  .catch((e) => {
    console.error('Error during inventory reconciliation:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

