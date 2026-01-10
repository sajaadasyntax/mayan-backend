import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

// Arabic translations for products (approximate translations)
const arabicNames: Record<string, string> = {
  // Whitening products
  'tretinoin powder': 'مسحوق تريتينوين',
  'alpha arbutin': 'ألفا أربيوتين',
  'tranexamic acid': 'حمض الترانيكساميك',
  'niaciamide': 'نياسيناميد',
  'azalic acid': 'حمض الأزيليك',
  'caffiene': 'كافيين',
  'glutathione': 'جلوتاثيون',
  'hydroquinone': 'هيدروكينون',
  'vit c': 'فيتامين سي',
  'kojic acid': 'حمض الكوجيك',
  'map': 'ماب',
  'collagen powder': 'مسحوق الكولاجين',
  'ferulic acid': 'حمض الفيروليك',
  'butyl-resorsinol': 'بيوتيل ريسورسينول',
  'zinc pca': 'زنك بي سي أيه',
  'kojic acid di palmitate': 'كوجيك أسيد دي بالميتات',
  'spirulina': 'سبيرولينا',
  
  // Peeling products
  'salicylic acid': 'حمض الساليسيليك',
  'glycolic acid': 'حمض الجليكوليك',
  'mandalic acid': 'حمض المانديليك',
  'lactic acid': 'حمض اللاكتيك',
  
  // Moisturizing products
  'hyalronic acid': 'حمض الهيالورونيك',
  'aloevera powder': 'مسحوق الصبار',
  'urea': 'يوريا',
  'panthenol powder': 'مسحوق البانثينول',
  'cermide np+ap': 'سيراميد إن بي + أي بي',
  'vit e powder': 'مسحوق فيتامين إي',
  'centella asiatica': 'سنتيلا آسياتيكا',
  
  // Preservatives
  'potassium sorbate': 'سوربات البوتاسيوم',
  'sodium meta bisuf': 'ميتا بيسلفيت الصوديوم',
  'bht': 'بي إتش تي',
  'edta': 'إي دي تي أيه',
  'total guard phoenix': 'توتال جارد فينيكس',
  
  // Others (Raw materials)
  'ipm': 'آي بي إم',
  'dimethicone': 'ديميثيكون',
  'zinc oxide': 'أكسيد الزنك',
  'propylene glycol': 'بروبيلين جلايكول',
  'allantoin': 'ألانتوين',
  
  // Essential oils
  'chamomile-blue': 'البابونج الأزرق',
  'peppermint': 'النعناع',
  'lavender': 'اللافندر',
  'rosemary': 'إكليل الجبل',
  'lemon': 'الليمون',
  'ylang ylang': 'يلانج يلانج',
  'teatree': 'شجرة الشاي',
  
  // Carrier oils
  'coconut': 'جوز الهند',
  'sweet almond': 'اللوز الحلو',
  
  // Butters
  'shea butter': 'زبدة الشيا',
  'cocoa butter': 'زبدة الكاكاو',
  
  // Waxes
  'nf ewax': 'إن إف إيواكس',
  'gms': 'جي إم إس',
  'lanette 0': 'لانيت أو',
  'emulgin b2': 'إمولجين بي 2',
  
  // Ready to package
  'serum': 'سيروم',
  'whitening cream': 'كريم التفتيح',
  
  // Tools
  'ph paper': 'ورق الأس الهيدروجيني'
}

// Helper function to get Arabic name
const getArabicName = (name: string): string => {
  return arabicNames[name.toLowerCase()] || name
}

// Helper function to capitalize product name
const capitalize = (str: string): string => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional - uncomment if you want to reset)
  console.log('🧹 Clearing existing data...')
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.procurementItem.deleteMany()
  await prisma.procurement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.supportInfo.deleteMany()
  await prisma.deliveryZone.deleteMany()
  await prisma.message.deleteMany()
  // Keep users to preserve admin

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

  // ============================================
  // CREATE CATEGORIES AND SUBCATEGORIES
  // ============================================

  // 1. RAW MATERIAL (Main Category)
  const rawMaterial = await prisma.category.create({
    data: {
      nameEn: 'Raw Material',
      nameAr: 'المواد الخام',
      description: 'Raw materials for skincare formulations'
    }
  })

  // Raw Material Subcategories
  const whitening = await prisma.category.create({
    data: {
      nameEn: 'Whitening',
      nameAr: 'التفتيح',
      description: 'Skin whitening and brightening ingredients',
      parentId: rawMaterial.id
    }
  })

  const peeling = await prisma.category.create({
    data: {
      nameEn: 'Peeling',
      nameAr: 'التقشير',
      description: 'Chemical peeling and exfoliation ingredients',
      parentId: rawMaterial.id
    }
  })

  const moisturizing = await prisma.category.create({
    data: {
      nameEn: 'Moisturizing',
      nameAr: 'الترطيب',
      description: 'Moisturizing and hydrating ingredients',
      parentId: rawMaterial.id
    }
  })

  const preservatives = await prisma.category.create({
    data: {
      nameEn: 'Preservatives',
      nameAr: 'المواد الحافظة',
      description: 'Preservatives for formulation stability',
      parentId: rawMaterial.id
    }
  })

  const othersRaw = await prisma.category.create({
    data: {
      nameEn: 'Others',
      nameAr: 'أخرى',
      description: 'Other raw material ingredients',
      parentId: rawMaterial.id
    }
  })

  console.log('✅ Created Raw Material category with subcategories')

  // 2. OILS & BUTTERS (Main Category)
  const oilsButters = await prisma.category.create({
    data: {
      nameEn: 'Oils & Butters',
      nameAr: 'الزيوت والزبدة',
      description: 'Natural oils and butters for skincare'
    }
  })

  // Oils subcategory
  const oils = await prisma.category.create({
    data: {
      nameEn: 'Oils',
      nameAr: 'الزيوت',
      description: 'Natural oils for skincare',
      parentId: oilsButters.id
    }
  })

  // Oils sub-subcategories
  const essentialOils = await prisma.category.create({
    data: {
      nameEn: 'Essential Oils',
      nameAr: 'الزيوت العطرية',
      description: 'Concentrated plant extracts',
      parentId: oils.id
    }
  })

  const carrierOils = await prisma.category.create({
    data: {
      nameEn: 'Carrier Oils',
      nameAr: 'الزيوت الحاملة',
      description: 'Base oils for diluting essential oils',
      parentId: oils.id
    }
  })

  // Butters subcategory
  const butters = await prisma.category.create({
    data: {
      nameEn: 'Butters',
      nameAr: 'الزبدة',
      description: 'Natural butters for skincare',
      parentId: oilsButters.id
    }
  })

  console.log('✅ Created Oils & Butters category with subcategories')

  // 3. WAXES (Main Category)
  const waxes = await prisma.category.create({
    data: {
      nameEn: 'Waxes',
      nameAr: 'الشموع',
      description: 'Emulsifying waxes and thickeners'
    }
  })

  console.log('✅ Created Waxes category')

  // 4. READY TO PACKAGE (Main Category)
  const readyToPackage = await prisma.category.create({
    data: {
      nameEn: 'Ready to Package',
      nameAr: 'جاهز للتعبئة',
      description: 'Pre-formulated products ready for packaging'
    }
  })

  console.log('✅ Created Ready to Package category')

  // 5. TOOLS (Main Category)
  const tools = await prisma.category.create({
    data: {
      nameEn: 'Tools',
      nameAr: 'الأدوات',
      description: 'Laboratory and formulation tools'
    }
  })

  console.log('✅ Created Tools category')

  // ============================================
  // CREATE PRODUCTS
  // ============================================

  // Default prices (can be adjusted)
  const defaultPrice = 500
  const defaultCostPrice = 300

  // Whitening Products
  const whiteningProducts = [
    'tretinoin powder', 'alpha arbutin', 'tranexamic acid', 'niaciamide',
    'azalic acid', 'caffiene', 'glutathione', 'hydroquinone', 'vit c',
    'kojic acid', 'map', 'collagen powder', 'ferulic acid', 'butyl-resorsinol',
    'zinc pca', 'kojic acid di palmitate', 'spirulina'
  ]

  for (const name of whiteningProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `High quality ${name} for skin whitening and brightening.`,
        descriptionAr: `${getArabicName(name)} عالي الجودة لتفتيح وإشراق البشرة.`,
        price: defaultPrice,
        costPrice: defaultCostPrice,
        stock: 100,
        categoryId: whitening.id,
        isNew: true
      }
    })
  }
  console.log(`✅ Created ${whiteningProducts.length} whitening products`)

  // Peeling Products
  const peelingProducts = ['salicylic acid', 'glycolic acid', 'mandalic acid', 'lactic acid']

  for (const name of peelingProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `Professional grade ${name} for chemical peeling.`,
        descriptionAr: `${getArabicName(name)} بدرجة احترافية للتقشير الكيميائي.`,
        price: defaultPrice,
        costPrice: defaultCostPrice,
        stock: 80,
        categoryId: peeling.id,
        isNew: true
      }
    })
  }
  console.log(`✅ Created ${peelingProducts.length} peeling products`)

  // Moisturizing Products
  const moisturizingProducts = [
    'hyalronic acid', 'aloevera powder', 'urea', 'panthenol powder',
    'cermide np+ap', 'vit e powder', 'centella asiatica'
  ]

  for (const name of moisturizingProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `Premium ${name} for deep hydration and moisturizing.`,
        descriptionAr: `${getArabicName(name)} الممتاز للترطيب العميق.`,
        price: defaultPrice,
        costPrice: defaultCostPrice,
        stock: 120,
        categoryId: moisturizing.id,
        isNew: true
      }
    })
  }
  console.log(`✅ Created ${moisturizingProducts.length} moisturizing products`)

  // Preservatives Products
  const preservativeProducts = [
    'potassium sorbate', 'sodium meta bisuf', 'bht', 'edta', 'total guard phoenix'
  ]

  for (const name of preservativeProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `${capitalize(name)} preservative for formulation stability.`,
        descriptionAr: `مادة حافظة ${getArabicName(name)} لاستقرار التركيبات.`,
        price: 400,
        costPrice: 250,
        stock: 150,
        categoryId: preservatives.id
      }
    })
  }
  console.log(`✅ Created ${preservativeProducts.length} preservative products`)

  // Others (Raw Materials) Products
  const othersProducts = ['ipm', 'dimethicone', 'zinc oxide', 'propylene glycol', 'allantoin']

  for (const name of othersProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `Quality ${name} for various formulations.`,
        descriptionAr: `${getArabicName(name)} عالي الجودة للتركيبات المختلفة.`,
        price: 450,
        costPrice: 280,
        stock: 100,
        categoryId: othersRaw.id
      }
    })
  }
  console.log(`✅ Created ${othersProducts.length} other raw material products`)

  // Essential Oils Products
  const essentialOilProducts = [
    'chamomile-blue', 'peppermint', 'lavender', 'rosemary', 'lemon', 'ylang ylang', 'teatree'
  ]

  for (const name of essentialOilProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name) + ' Oil',
        nameAr: 'زيت ' + getArabicName(name),
        descriptionEn: `Pure ${name} essential oil for aromatherapy and skincare.`,
        descriptionAr: `زيت ${getArabicName(name)} العطري النقي للعلاج بالعطور والعناية بالبشرة.`,
        price: 600,
        costPrice: 350,
        stock: 60,
        categoryId: essentialOils.id,
        isNew: true
      }
    })
  }
  console.log(`✅ Created ${essentialOilProducts.length} essential oil products`)

  // Carrier Oils Products
  const carrierOilProducts = ['coconut', 'sweet almond']

  for (const name of carrierOilProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name) + ' Oil',
        nameAr: 'زيت ' + getArabicName(name),
        descriptionEn: `Pure ${name} carrier oil for diluting essential oils.`,
        descriptionAr: `زيت ${getArabicName(name)} الحامل النقي لتخفيف الزيوت العطرية.`,
        price: 350,
        costPrice: 200,
        stock: 100,
        categoryId: carrierOils.id
      }
    })
  }
  console.log(`✅ Created ${carrierOilProducts.length} carrier oil products`)

  // Butters Products
  const butterProducts = ['shea butter', 'cocoa butter']

  for (const name of butterProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `Organic ${name} for deep nourishment.`,
        descriptionAr: `${getArabicName(name)} العضوي للتغذية العميقة.`,
        price: 400,
        costPrice: 250,
        stock: 80,
        categoryId: butters.id,
        isNew: true
      }
    })
  }
  console.log(`✅ Created ${butterProducts.length} butter products`)

  // Waxes Products
  const waxProducts = ['nf ewax', 'gms', 'lanette 0', 'emulgin b2']

  for (const name of waxProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `${capitalize(name)} emulsifying wax for stable formulations.`,
        descriptionAr: `${getArabicName(name)} شمع مستحلب للتركيبات المستقرة.`,
        price: 350,
        costPrice: 200,
        stock: 120,
        categoryId: waxes.id
      }
    })
  }
  console.log(`✅ Created ${waxProducts.length} wax products`)

  // Ready to Package Products
  const readyProducts = ['serum', 'whitening cream']

  for (const name of readyProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `Pre-formulated ${name} ready for packaging and sale.`,
        descriptionAr: `${getArabicName(name)} الجاهز للتعبئة والبيع.`,
        price: 800,
        costPrice: 450,
        stock: 50,
        categoryId: readyToPackage.id,
        isNew: true,
        isSale: true,
        discount: 10
      }
    })
  }
  console.log(`✅ Created ${readyProducts.length} ready-to-package products`)

  // Tools Products
  const toolProducts = ['ph paper']

  for (const name of toolProducts) {
    await prisma.product.create({
      data: {
        nameEn: capitalize(name),
        nameAr: getArabicName(name),
        descriptionEn: `${capitalize(name)} for pH testing in formulations.`,
        descriptionAr: `${getArabicName(name)} لاختبار درجة الحموضة في التركيبات.`,
        price: 150,
        costPrice: 80,
        stock: 200,
        categoryId: tools.id
      }
    })
  }
  console.log(`✅ Created ${toolProducts.length} tool products`)

  // ============================================
  // CREATE OTHER DATA
  // ============================================

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
  await prisma.coupon.create({
    data: {
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

  // Summary
  const totalCategories = await prisma.category.count()
  const totalProducts = await prisma.product.count()
  console.log(`\n🎉 Seeding completed!`)
  console.log(`📦 Total categories: ${totalCategories}`)
  console.log(`🛍️ Total products: ${totalProducts}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
