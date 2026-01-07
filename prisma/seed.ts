import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { phone: '+249123456789' },
    update: {},
    create: {
      phone: '+249123456789',
      password: hashedPassword,
      name: 'Admin',
      email: 'admin@mayan.sd',
      role: 'ADMIN'
    }
  })

  console.log('✅ Created admin user:', admin.phone)

  // Create categories
  const whiteningCategory = await prisma.category.upsert({
    where: { id: 'whitening' },
    update: {},
    create: {
      id: 'whitening',
      nameEn: 'Whitening Agent',
      nameAr: 'مستحضرات التفتيح',
      description: 'Skin whitening and brightening products'
    }
  })

  const peelingCategory = await prisma.category.upsert({
    where: { id: 'peeling' },
    update: {},
    create: {
      id: 'peeling',
      nameEn: 'Peeling Agent',
      nameAr: 'مستحضرات التقشير',
      description: 'Skin peeling and exfoliation products'
    }
  })

  console.log('✅ Created categories')

  // Create products
  const products = [
    {
      nameEn: 'Tretinoin',
      nameAr: 'تريتينوين',
      descriptionEn: 'Tretinoin cream for skin renewal and anti-aging.',
      descriptionAr: 'كريم تريتينوين لتجديد البشرة ومكافحة الشيخوخة.',
      price: 500,
      costPrice: 300,
      stock: 100,
      categoryId: whiteningCategory.id,
      isNew: true,
      isSale: true,
      discount: 10
    },
    {
      nameEn: 'Alpha Arbutin',
      nameAr: 'ألفا أربيوتين',
      descriptionEn: 'Alpha Arbutin serum for skin brightening.',
      descriptionAr: 'سيروم ألفا أربيوتين لتفتيح البشرة.',
      price: 500,
      costPrice: 280,
      stock: 150,
      categoryId: whiteningCategory.id,
      isNew: true,
      isSale: true,
      discount: 15
    },
    {
      nameEn: 'Tranexamic Acid',
      nameAr: 'حمض الترانيكساميك',
      descriptionEn: 'Tranexamic acid for hyperpigmentation treatment.',
      descriptionAr: 'حمض الترانيكساميك لعلاج فرط التصبغ.',
      price: 500,
      costPrice: 320,
      stock: 80,
      categoryId: whiteningCategory.id,
      isNew: true,
      isSale: true,
      discount: 20
    },
    {
      nameEn: 'Niacinamide',
      nameAr: 'نياسيناميد',
      descriptionEn: 'Niacinamide serum for pore minimizing.',
      descriptionAr: 'سيروم نياسيناميد لتصغير المسام.',
      price: 500,
      costPrice: 250,
      stock: 200,
      categoryId: whiteningCategory.id,
      isNew: true,
      isSale: true
    },
    {
      nameEn: 'Glycolic Acid Peel',
      nameAr: 'تقشير حمض الجليكوليك',
      descriptionEn: 'Glycolic acid chemical peel for skin renewal.',
      descriptionAr: 'تقشير كيميائي بحمض الجليكوليك لتجديد البشرة.',
      price: 600,
      costPrice: 350,
      stock: 60,
      categoryId: peelingCategory.id,
      isNew: true,
      isSale: true,
      discount: 10
    },
    {
      nameEn: 'Salicylic Acid',
      nameAr: 'حمض الساليسيليك',
      descriptionEn: 'Salicylic acid for acne treatment and exfoliation.',
      descriptionAr: 'حمض الساليسيليك لعلاج حب الشباب والتقشير.',
      price: 450,
      costPrice: 270,
      stock: 120,
      categoryId: peelingCategory.id,
      isNew: true,
      isSale: true
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log('✅ Created', products.length, 'products')

  // Create delivery zones
  const zones = [
    { country: 'Sudan', state: 'Khartoum', price: 2000 },
    { country: 'Sudan', state: 'Kassala', price: 3000 },
    { country: 'Sudan', state: 'Port Sudan', price: 3500 },
    { country: 'Sudan', state: 'Omdurman', price: 2500 },
  ]

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { country_state: { country: zone.country, state: zone.state } },
      update: { price: zone.price },
      create: zone
    })
  }

  console.log('✅ Created delivery zones')

  // Create a sample coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      maxUses: 100
    }
  })

  console.log('✅ Created coupon: WELCOME10')

  // Create bank account info
  await prisma.bankAccount.create({
    data: {
      bankNameEn: 'Bank of Khartoum',
      bankNameAr: 'بنك الخرطوم',
      accountName: 'Hussam Mohamed Alamin Qasim',
      accountNumber: '1297014',
      branchEn: 'Al-Jumhuriya Branch',
      branchAr: 'فرع الجمهورية',
      image: '/images/bank-card.png'
    }
  })

  console.log('✅ Created bank account info')

  // Create support info
  await prisma.supportInfo.create({
    data: {
      titleEn: 'Customer Support',
      titleAr: 'خدمة العملاء',
      contentEn: 'We are here to help you with any questions or concerns.',
      contentAr: 'نحن هنا لمساعدتك في أي أسئلة أو استفسارات.',
      phone: '+249123456789',
      email: 'support@mayan.sd'
    }
  })

  console.log('✅ Created support info')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

