import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure uploads directories exist
const uploadsDir = 'uploads/products'
const bankAccountsDir = 'uploads/bank-accounts'

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(bankAccountsDir)) {
  fs.mkdirSync(bankAccountsDir, { recursive: true })
}

// Configure storage for products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `product-${uniqueSuffix}${ext}`)
  }
})

// Configure storage for bank accounts
const bankAccountStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bankAccountsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `bank-${uniqueSuffix}${ext}`)
  }
})

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'))
  }
}

// Configure multer for products
export const uploadProductImage = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image')

// Configure multer for bank accounts
export const uploadBankAccountImage = multer({
  storage: bankAccountStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image')

// Helper to get public URL for uploaded file
export const getImageUrl = (filename: string): string => {
  return `/uploads/products/${filename}`
}

