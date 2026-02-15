/**
 * Cleanup Script: Delete customer orders & procurement PO-1..PO-3
 *
 * Usage:
 *   npx ts-node scripts/cleanup-orders-and-procurement.ts --preview
 *   npx ts-node scripts/cleanup-orders-and-procurement.ts --execute
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DRY_RUN = !process.argv.includes('--execute')

async function main() {
  console.log('='.repeat(60))
  console.log(DRY_RUN
    ? '  PREVIEW MODE — No data will be deleted'
    : '  EXECUTE MODE — Data WILL be permanently deleted'
  )
  console.log('='.repeat(60))
  console.log()

  // -------------------------------------------------------
  // 1. Preview customer orders to delete
  // -------------------------------------------------------
  const customerOrders = await prisma.order.findMany({
    where: {
      user: { role: 'USER' }
    },
    include: {
      user: { select: { name: true, phone: true, role: true } },
      items: {
        include: { product: { select: { nameEn: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`--- Customer Orders to delete: ${customerOrders.length} ---`)
  for (const order of customerOrders) {
    console.log(
      `  ${order.invoiceNumber} | ${order.status} | ${order.paymentStatus} ` +
      `| SDG ${order.total} | ${order.user?.name || order.user?.phone} ` +
      `| ${order.items.length} items | ${order.createdAt.toISOString().split('T')[0]}`
    )
  }

  const totalOrderItems = customerOrders.reduce((sum, o) => sum + o.items.length, 0)
  console.log(`  Total order items to cascade-delete: ${totalOrderItems}`)
  console.log()

  // -------------------------------------------------------
  // 2. Preview procurement orders PO-1..PO-3
  // -------------------------------------------------------
  const procurements = await prisma.procurement.findMany({
    where: {
      poNumber: { in: [1, 2, 3] }
    },
    include: {
      items: {
        include: { product: { select: { nameEn: true, stock: true } } }
      }
    },
    orderBy: { poNumber: 'asc' }
  })

  console.log(`--- Procurement Orders to delete: ${procurements.length} ---`)
  for (const po of procurements) {
    console.log(
      `  PO-${po.poNumber} (${po.orderNumber}) | ${po.status} ` +
      `| SDG ${po.totalCost} | ${po.supplier || 'No supplier'} ` +
      `| ${po.items.length} items | ${po.createdAt.toISOString().split('T')[0]}`
    )
    for (const item of po.items) {
      console.log(
        `    - ${item.product.nameEn}: qty ${item.quantity} @ SDG ${item.costPrice} ` +
        `(current stock: ${item.product.stock})`
      )
    }
  }
  console.log()

  // -------------------------------------------------------
  // 3. Stock impact summary
  // -------------------------------------------------------
  const stockImpact: Record<string, { name: string; currentStock: number; qtyToReverse: number }> = {}
  for (const po of procurements) {
    for (const item of po.items) {
      if (!stockImpact[item.productId]) {
        stockImpact[item.productId] = {
          name: item.product.nameEn,
          currentStock: item.product.stock,
          qtyToReverse: 0
        }
      }
      stockImpact[item.productId].qtyToReverse += item.quantity
    }
  }

  if (Object.keys(stockImpact).length > 0) {
    console.log('--- Stock Impact (quantities will be subtracted) ---')
    for (const [productId, info] of Object.entries(stockImpact)) {
      const newStock = Math.max(0, info.currentStock - info.qtyToReverse)
      console.log(
        `  ${info.name}: ${info.currentStock} -> ${newStock} (reversing ${info.qtyToReverse})`
      )
    }
    console.log()
  }

  // -------------------------------------------------------
  // 4. Execute (if not dry run)
  // -------------------------------------------------------
  if (DRY_RUN) {
    console.log('='.repeat(60))
    console.log('  PREVIEW ONLY — Run with --execute to delete')
    console.log('  npx ts-node scripts/cleanup-orders-and-procurement.ts --execute')
    console.log('='.repeat(60))
    return
  }

  // Confirm before executing
  console.log('⚠️  EXECUTING IN 3 SECONDS... Press Ctrl+C to abort!')
  await new Promise(resolve => setTimeout(resolve, 3000))

  await prisma.$transaction(async (tx) => {
    // 4a. Reverse stock for procurement PO-1..PO-3
    for (const [productId, info] of Object.entries(stockImpact)) {
      const newStock = Math.max(0, info.currentStock - info.qtyToReverse)
      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock }
      })
      console.log(`  Stock updated: ${info.name} -> ${newStock}`)
    }

    // 4b. Delete procurement items (child rows)
    const deletedProcItems = await tx.procurementItem.deleteMany({
      where: {
        procurement: { poNumber: { in: [1, 2, 3] } }
      }
    })
    console.log(`  Deleted ${deletedProcItems.count} procurement items`)

    // 4c. Delete procurement orders
    const deletedProcs = await tx.procurement.deleteMany({
      where: { poNumber: { in: [1, 2, 3] } }
    })
    console.log(`  Deleted ${deletedProcs.count} procurement orders`)

    // 4d. Delete order items (child rows)
    const deletedOrderItems = await tx.orderItem.deleteMany({
      where: {
        order: { user: { role: 'USER' } }
      }
    })
    console.log(`  Deleted ${deletedOrderItems.count} order items`)

    // 4e. Delete customer orders
    const deletedOrders = await tx.order.deleteMany({
      where: {
        user: { role: 'USER' }
      }
    })
    console.log(`  Deleted ${deletedOrders.count} customer orders`)
  })

  console.log()
  console.log('='.repeat(60))
  console.log('  CLEANUP COMPLETE')
  console.log('='.repeat(60))
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
