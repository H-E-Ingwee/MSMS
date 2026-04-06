import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const farmer1 = await prisma.user.upsert({
    where: { phone: '+254712345678' },
    update: {},
    create: {
      phone: '+254712345678',
      name: 'Joel M.',
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
      name: 'Sarah N.',
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
      name: 'Peter K.',
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
      name: 'David W.',
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
      name: 'John B.',
      role: 'BUYER',
      location: 'Nairobi',
      verified: true,
    },
  });

  // Create sample listings
  await prisma.listing.createMany({
    data: [
      {
        grade: 'Kangeta',
        quantity: 50,
        price: 600,
        location: 'Meru Central',
        farmerId: farmer1.id,
        description: 'Premium Kangeta grade, freshly harvested',
      },
      {
        grade: 'Alele',
        quantity: 120,
        price: 350,
        location: 'Embu',
        farmerId: farmer2.id,
        description: 'High quality Alele from fertile lands',
      },
      {
        grade: 'Giza',
        quantity: 30,
        price: 850,
        location: 'Igembe South',
        farmerId: farmer3.id,
        description: 'Rare Giza variety, limited quantity',
      },
      {
        grade: 'Lomboko',
        quantity: 80,
        price: 450,
        location: 'Meru North',
        farmerId: farmer4.id,
        description: 'Traditional Lomboko grade',
      },
    ],
  });

  // Create sample predictions
  const today = new Date();
  const predictions = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    predictions.push({
      date,
      grade: 'Kangeta',
      actualPrice: i < 4 ? 450 + Math.random() * 50 : null,
      predictedPrice: 500 + Math.random() * 100,
      demandVolume: 1000 + Math.random() * 1000,
      confidence: 0.8 + Math.random() * 0.2,
    });
  }

  await prisma.prediction.createMany({
    data: predictions,
  });

  // Create sample training modules
  await prisma.trainingModule.createMany({
    data: [
      {
        title: 'Sustainable Soil Management',
        type: 'VIDEO',
        videoUrl: 'https://example.com/video1.mp4',
        duration: '5 mins',
        category: 'Climate Adaptability',
        order: 1,
      },
      {
        title: 'Water Conservation in Dry Seasons',
        type: 'ARTICLE',
        content: 'Learn about effective water conservation techniques...',
        duration: '3 mins read',
        category: 'Climate Adaptability',
        order: 2,
      },
      {
        title: 'Proper Harvesting Techniques',
        type: 'VIDEO',
        videoUrl: 'https://example.com/video2.mp4',
        duration: '8 mins',
        category: 'Quality Control',
        order: 3,
      },
    ],
  });

  // Create sample wallet transactions
  await prisma.walletTransaction.createMany({
    data: [
      {
        userId: farmer1.id,
        type: 'PAYMENT',
        amount: 12000,
        description: 'Payment from John B.',
        status: 'COMPLETED',
        reference: 'MPESA123456',
      },
      {
        userId: farmer1.id,
        type: 'WITHDRAWAL',
        amount: -5000,
        description: 'Withdrawal to M-Pesa',
        status: 'COMPLETED',
        reference: 'MPESA123457',
      },
      {
        userId: farmer1.id,
        type: 'PAYMENT',
        amount: 8500,
        description: 'Escrow Lock (Order #492)',
        status: 'PENDING',
        reference: 'MPESA123458',
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