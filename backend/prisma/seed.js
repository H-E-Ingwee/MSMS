import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data for a fresh start
  console.log('🧹 Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.trainingCompletion.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared');

  // Create sample users with realistic data
  const farmer1 = await prisma.user.upsert({
    where: { phone: '+254712345678' },
    update: {},
    create: {
      phone: '+254712345678',
      name: 'David Kimathi',
      role: 'FARMER',
      location: 'Meru Central',
      verified: true,
    },
  });

  const farmer2 = await prisma.user.upsert({
    where: { phone: '+254723456789' },
    update: {},
    create: {
      phone: '+254723456789',
      name: 'Grace Wanjiku',
      role: 'FARMER',
      location: 'Embu',
      verified: true,
    },
  });

  const farmer3 = await prisma.user.upsert({
    where: { phone: '+254734567890' },
    update: {},
    create: {
      phone: '+254734567890',
      name: 'Peter Njoroge',
      role: 'FARMER',
      location: 'Igembe South',
      verified: false,
    },
  });

  const farmer4 = await prisma.user.upsert({
    where: { phone: '+254745678901' },
    update: {},
    create: {
      phone: '+254745678901',
      name: 'Mary Muthoni',
      role: 'FARMER',
      location: 'Meru North',
      verified: true,
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { phone: '+254756789012' },
    update: {},
    create: {
      phone: '+254756789012',
      name: 'John Kamau',
      role: 'BUYER',
      location: 'Nairobi',
      verified: true,
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { phone: '+254767890123' },
    update: {},
    create: {
      phone: '+254767890123',
      name: 'Sarah Achieng',
      role: 'BUYER',
      location: 'Nakuru',
      verified: true,
    },
  });

  const buyer3 = await prisma.user.upsert({
    where: { phone: '+254778901234' },
    update: {},
    create: {
      phone: '+254778901234',
      name: 'Michael Oduya',
      role: 'BUYER',
      location: 'Kisumu',
      verified: false,
    },
  });

  // --- UPDATED: Create Predefined Admin User ---
  const admin = await prisma.user.upsert({
    where: { phone: '+254798936316' },
    update: {
      name: 'Admin User',
      location: 'Nairobi',
    },
    create: {
      phone: '+254798936316',
      name: 'Admin User',
      role: 'ADMIN',
      location: 'Nairobi',
      verified: true,
    },
  });

  console.log('👤 Admin user created/verified:', admin.name, '(', admin.phone, ')');

  // Create sample listings with realistic data
  await prisma.listing.createMany({
    data: [
      {
        grade: 'Kangeta',
        quantity: 50,
        price: 600,
        location: 'Meru Central',
        farmerId: farmer1.id,
        description: 'Premium Kangeta grade miraa, freshly harvested from fertile Meru highlands. Known for its quality and longevity.',
      },
      {
        grade: 'Alele',
        quantity: 120,
        price: 350,
        location: 'Embu',
        farmerId: farmer2.id,
        description: 'High-quality Alele miraa from Embu region. Grown using traditional farming methods for authentic flavor.',
      },
      {
        grade: 'Giza',
        quantity: 30,
        price: 850,
        location: 'Igembe South',
        farmerId: farmer3.id,
        description: 'Rare Giza variety miraa, limited quantity available. Known for its unique characteristics and premium pricing.',
      },
      {
        grade: 'Lomboko',
        quantity: 80,
        price: 450,
        location: 'Meru North',
        farmerId: farmer4.id,
        description: 'Traditional Lomboko grade from Meru North. Consistent quality and reliable supply.',
      },
      {
        grade: 'Kangeta',
        quantity: 75,
        price: 580,
        location: 'Meru Central',
        farmerId: farmer1.id,
        description: 'Fresh Kangeta miraa ready for immediate delivery. Competitive pricing for bulk orders.',
      },
      {
        grade: 'Alele',
        quantity: 90,
        price: 420,
        location: 'Embu',
        farmerId: farmer2.id,
        description: 'Premium Alele grade from established Embu farms. Excellent for both local and export markets.',
      },
    ],
  });

  // Get the created listings for reference
  const listings = await prisma.listing.findMany();

  // Create sample orders
  await prisma.order.createMany({
    data: [
      {
        listingId: listings[0].id,
        buyerId: buyer1.id,
        quantity: 25,
        totalPrice: 25 * listings[0].price,
        status: 'APPROVED',
        deliveryAddress: 'Westlands, Nairobi',
      },
      {
        listingId: listings[1].id,
        buyerId: buyer2.id,
        quantity: 50,
        totalPrice: 50 * listings[1].price,
        status: 'PAID',
        deliveryAddress: 'CBD, Nakuru',
      },
      {
        listingId: listings[3].id,
        buyerId: buyer3.id,
        quantity: 30,
        totalPrice: 30 * listings[3].price,
        status: 'PENDING_APPROVAL',
        deliveryAddress: 'Kisumu Central',
      },
    ],
  });

  // Create sample training modules
  await prisma.trainingModule.createMany({
    data: [
      {
        title: 'Sustainable Soil Management',
        description: 'Learn essential techniques for maintaining healthy soil in miraa farming',
        category: 'SUSTAINABILITY',
        content: 'Sustainable soil management is crucial for long-term miraa production. This module covers organic fertilization, crop rotation, and soil testing methods that help maintain soil fertility and prevent degradation. Key topics include: 1) Understanding soil pH and nutrient requirements, 2) Organic matter management, 3) Erosion control techniques, 4) Integrated pest management approaches.',
        duration: 15,
        difficulty: 'BEGINNER',
      },
      {
        title: 'Water Conservation in Dry Seasons',
        description: 'Effective water management strategies for miraa cultivation during dry periods',
        category: 'FARMING_TECHNIQUES',
        content: 'Water conservation is critical in arid and semi-arid regions where miraa is grown. This comprehensive guide covers drip irrigation systems, rainwater harvesting, mulching techniques, and drought-resistant varieties. Learn how to maximize water efficiency while maintaining crop quality and yield.',
        duration: 20,
        difficulty: 'INTERMEDIATE',
      },
      {
        title: 'Proper Harvesting Techniques',
        description: 'Master the art of harvesting miraa to maximize quality and market value',
        category: 'QUALITY_CONTROL',
        content: 'Proper harvesting techniques directly impact the quality and market price of miraa. This module teaches selective harvesting methods, timing considerations, post-harvest handling, and quality grading standards. Topics include: 1) Identifying optimal harvest maturity, 2) Hand harvesting vs mechanical methods, 3) Immediate post-harvest processing, 4) Quality assessment criteria.',
        duration: 25,
        difficulty: 'INTERMEDIATE',
      },
      {
        title: 'Market Price Analysis',
        description: 'Understanding market dynamics and price forecasting for better decision making',
        category: 'MARKET_INSIGHTS',
        content: 'Learn to analyze market trends, understand price determinants, and make informed decisions about when to sell. This module covers supply and demand analysis, seasonal price patterns, quality premiums, and negotiation strategies. Gain insights into regional market variations and international trade considerations.',
        duration: 30,
        difficulty: 'ADVANCED',
      },
      {
        title: 'Business Planning for Farmers',
        description: 'Develop business acumen and financial management skills for farming operations',
        category: 'BUSINESS_MANAGEMENT',
        content: 'Successful miraa farming requires strong business fundamentals. This module covers cost accounting, profit maximization, risk management, and long-term planning. Learn to track expenses, calculate break-even points, manage cash flow, and develop marketing strategies for your produce.',
        duration: 35,
        difficulty: 'ADVANCED',
      },
    ],
  });

  // Create sample wallet transactions
  await prisma.walletTransaction.createMany({
    data: [
      {
        userId: farmer1.id,
        type: 'CREDIT',
        amount: 12000,
        description: 'Payment from John B.',
        status: 'COMPLETED',
        reference: 'MPESA123456',
      },
      {
        userId: farmer1.id,
        type: 'DEBIT',
        amount: 5000,
        description: 'Withdrawal to M-Pesa',
        status: 'COMPLETED',
        reference: 'MPESA123457',
      },
      {
        userId: farmer1.id,
        type: 'DEBIT',
        amount: 8500,
        description: 'Escrow Lock (Order #492)',
        status: 'PENDING',
        reference: 'MPESA123458',
      },
      {
        userId: buyer1.id,
        type: 'CREDIT',
        amount: 25000,
        description: 'M-Pesa deposit',
        status: 'COMPLETED',
        reference: 'MPESA123459',
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });