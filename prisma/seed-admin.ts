import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// Use normalized format (+249...) so login works with 249..., 09..., or +249...
const ADMIN_PHONE = '+249123654376'
const ADMIN_NAME = 'Developers'
const ADMIN_PASSWORD = 'Admin.101'

async function main() {
  console.log('🌱 Seeding admin user...')

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const admin = await prisma.user.upsert({
    where: { phone: ADMIN_PHONE },
    update: {
      name: ADMIN_NAME,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    },
    create: {
      phone: ADMIN_PHONE,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log('✅ Admin user created/updated:', admin.name, '(' + admin.phone + ')')
  console.log('   Role:', admin.role)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
