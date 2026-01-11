import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import orderRoutes from './routes/order.routes'
import couponRoutes from './routes/coupon.routes'
import messageRoutes from './routes/message.routes'
import bankAccountRoutes from './routes/bankAccount.routes'
import supportRoutes from './routes/support.routes'
import procurementRoutes from './routes/procurement.routes'
import deliveryRoutes from './routes/delivery.routes'
import reportsRoutes from './routes/reports.routes'
import recipeRoutes from './routes/recipe.routes'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
// CORS configuration - allow multiple origins
const allowedOrigins = [
  'https://www.enabholding.com',
  'https://enabholding.com',
  process.env.FRONTEND_URL,
  'http://localhost:3000' // Development
].filter(Boolean) // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mayan Shop API is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/bank-accounts', bankAccountRoutes)
app.use('/api/support', supportRoutes)
app.use('/api/procurement', procurementRoutes)
app.use('/api/delivery-zones', deliveryRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/recipes', recipeRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/health`)
})

export default app

