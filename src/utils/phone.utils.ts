// Validate Sudanese phone number
export function isValidSudanesePhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '')
  
  // Valid formats:
  // 09XXXXXXXX (10 digits starting with 09)
  // +249XXXXXXXXX (13 chars starting with +249)
  // 249XXXXXXXXX (12 digits starting with 249)
  
  const patterns = [
    /^09\d{8}$/,           // 09XXXXXXXX
    /^\+249\d{9}$/,        // +249XXXXXXXXX
    /^249\d{9}$/           // 249XXXXXXXXX
  ]
  
  return patterns.some(pattern => pattern.test(cleanPhone))
}

// Normalize phone to standard format (+249XXXXXXXXX)
export function normalizePhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s-]/g, '')
  
  if (cleanPhone.startsWith('+249')) {
    return cleanPhone
  }
  if (cleanPhone.startsWith('249')) {
    return '+' + cleanPhone
  }
  if (cleanPhone.startsWith('09')) {
    return '+249' + cleanPhone.substring(1)
  }
  return cleanPhone
}

