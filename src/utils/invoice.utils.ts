// Generate unique invoice number
export function generateInvoiceNumber(): string {
  const prefix = 'SD'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `${prefix}${timestamp}${random}`
}

// Generate unique procurement order number
export function generateProcurementNumber(): string {
  const prefix = 'PO'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return `${prefix}${timestamp}${random}`
}

