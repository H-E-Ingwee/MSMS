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

  // Create sample training modules
  await prisma.trainingModule.createMany({
    data: [
      {
        title: 'Introduction to Miraa Farming',
        description: 'Learn the basics of miraa cultivation, from seed selection to harvesting techniques.',
        category: 'FARMING_TECHNIQUES',
        content: `# Introduction to Miraa Farming

## Overview
Miraa (khat) farming is a traditional agricultural practice in Kenya, particularly in the Meru and Embu regions. This module covers the fundamental principles of successful miraa cultivation.

## Key Topics Covered:
1. **Seed Selection and Germination**
   - Choosing quality miraa seeds
   - Optimal germination conditions
   - Nursery management techniques

2. **Soil Preparation**
   - Soil testing and amendment
   - pH requirements for miraa (6.0-7.0)
   - Drainage and irrigation systems

3. **Planting and Early Growth**
   - Transplanting seedlings
   - Spacing requirements (2x2 meters)
   - Weed control methods

4. **Pest and Disease Management**
   - Common pests: aphids, mites, caterpillars
   - Organic pest control methods
   - Disease prevention strategies

## Best Practices
- Regular pruning for bushy growth
- Consistent watering schedule
- Soil fertility maintenance
- Harvest timing optimization

## Expected Outcomes
By the end of this module, farmers will be able to:
- Establish a new miraa plantation
- Implement proper care routines
- Identify and treat common problems
- Maximize yield and quality`,
        duration: 45,
        difficulty: 'BEGINNER',
      },
      {
        title: 'Advanced Pruning Techniques',
        description: 'Master the art of miraa pruning for maximum yield and quality improvement.',
        category: 'FARMING_TECHNIQUES',
        content: `# Advanced Pruning Techniques for Miraa

## Why Pruning Matters
Proper pruning is essential for:
- Increased branching and yield
- Improved shoot quality
- Disease prevention
- Plant longevity

## Pruning Methods

### 1. Initial Training Prune
- Performed on young plants (6-12 months)
- Remove apical dominance
- Encourage lateral branching

### 2. Maintenance Pruning
- Regular removal of old shoots
- Selective harvesting techniques
- Seasonal pruning schedules

### 3. Rejuvenation Pruning
- For older, unproductive plants
- Severe cutting back to stimulate new growth
- Risk management approach

## Tools and Safety
- Sharp pruning shears
- Protective gloves and clothing
- Sterilization between plants
- Proper tool maintenance

## Timing Considerations
- Best done during dry season
- Avoid pruning during active growth periods
- Post-harvest pruning benefits

## Quality Control
- Grading harvested shoots
- Storage and transportation
- Market preparation techniques`,
        duration: 60,
        difficulty: 'INTERMEDIATE',
      },
      {
        title: 'Market Trends and Pricing Strategies',
        description: 'Understanding miraa market dynamics and developing effective pricing strategies.',
        category: 'BUSINESS_MANAGEMENT',
        content: `# Market Trends and Pricing Strategies

## Current Market Landscape
The miraa industry in Kenya faces several challenges and opportunities:
- Growing export markets
- Domestic consumption patterns
- Competition from other regions
- Quality standardization needs

## Pricing Factors
1. **Grade Quality**
   - Kangeta: Premium grade, highest price
   - Alele: Medium grade, balanced pricing
   - Lomboko: Entry-level grade

2. **Seasonal Variations**
   - Peak season (dry months): Higher prices
   - Off-season: Lower prices, storage considerations

3. **Market Location**
   - Local markets vs. export destinations
   - Transportation costs impact
   - Regional demand differences

## Pricing Strategies
- Cost-plus pricing approach
- Market-based pricing
- Dynamic pricing for bulk orders
- Long-term relationship pricing

## Risk Management
- Price fluctuation hedging
- Diversification strategies
- Contract farming arrangements
- Quality improvement investments

## Digital Tools for Market Intelligence
- Price tracking applications
- Market information systems
- Weather impact analysis
- Demand forecasting tools`,
        duration: 40,
        difficulty: 'INTERMEDIATE',
      },
      {
        title: 'Sustainable Farming Practices',
        description: 'Learn eco-friendly farming methods that ensure long-term productivity and environmental health.',
        category: 'SUSTAINABILITY',
        content: `# Sustainable Farming Practices for Miraa

## Environmental Impact of Miraa Farming
Traditional miraa farming can have significant environmental impacts:
- Soil erosion and degradation
- Water resource depletion
- Biodiversity loss
- Chemical runoff concerns

## Sustainable Solutions

### 1. Soil Conservation
- Contour farming techniques
- Cover cropping strategies
- Organic matter management
- Erosion control measures

### 2. Water Management
- Drip irrigation systems
- Rainwater harvesting
- Efficient watering schedules
- Water quality monitoring

### 3. Biodiversity Enhancement
- Intercropping with companion plants
- Natural pest control methods
- Wildlife habitat preservation
- Pollinator-friendly practices

### 4. Waste Management
- Organic waste composting
- Plastic-free farming
- Recycling agricultural materials
- Circular economy approaches

## Certification and Standards
- Organic farming certification
- Sustainable agriculture standards
- Fair trade compliance
- Environmental impact assessments

## Economic Benefits
- Long-term cost savings
- Premium pricing for sustainable products
- Access to green markets
- Government incentives and subsidies

## Implementation Strategies
- Gradual transition planning
- Training and capacity building
- Technology adoption
- Community-based approaches`,
        duration: 55,
        difficulty: 'ADVANCED',
      },
      {
        title: 'Digital Tools for Farmers',
        description: 'Leverage technology for better farm management, market access, and decision making.',
        category: 'TECHNOLOGY',
        content: `# Digital Tools for Modern Miraa Farmers

## Farm Management Software
- **MSMS Platform**: Comprehensive farm management
- **Inventory Tracking**: Real-time stock monitoring
- **Financial Management**: Expense and revenue tracking
- **Production Records**: Historical data analysis

## Market Access Tools
- **Online Marketplaces**: Direct buyer connections
- **Price Information Systems**: Real-time market data
- **Export Platforms**: International market access
- **Logistics Coordination**: Transportation management

## Mobile Applications
- **Weather Apps**: Climate monitoring and forecasting
- **Pest Identification**: AI-powered disease detection
- **Soil Testing**: Mobile soil analysis tools
- **Market Price Alerts**: Instant pricing notifications

## Data-Driven Decision Making
- **Yield Prediction**: AI-powered forecasting
- **Quality Assessment**: Automated grading systems
- **Risk Analysis**: Market and weather risk modeling
- **Performance Analytics**: Farm productivity metrics

## Digital Literacy Skills
- **Basic Computer Skills**: Essential for platform use
- **Mobile Phone Proficiency**: App navigation and usage
- **Data Entry Accuracy**: Proper record keeping
- **Online Safety**: Secure digital practices

## Getting Started
1. **Device Access**: Smartphone or computer setup
2. **Platform Registration**: MSMS account creation
3. **Basic Training**: Digital tool familiarization
4. **Practice Sessions**: Hands-on tool usage
5. **Support Networks**: Community learning groups

## Benefits of Going Digital
- **Increased Efficiency**: Streamlined operations
- **Better Market Access**: Direct buyer connections
- **Improved Record Keeping**: Accurate data management
- **Enhanced Decision Making**: Data-driven insights
- **Financial Inclusion**: Access to digital financial services`,
        duration: 35,
        difficulty: 'BEGINNER',
      },
      {
        title: 'Quality Control and Grading',
        description: 'Master the art of miraa grading and quality assessment for better market positioning.',
        category: 'QUALITY_MANAGEMENT',
        content: `# Quality Control and Grading Standards

## Miraa Grading System
The Kenyan miraa industry uses a well-established grading system based on:
- Shoot size and tenderness
- Color and appearance
- Aroma and freshness
- Stem characteristics

## Grade Categories

### 1. Kangeta (Premium Grade)
**Characteristics:**
- Very tender, young shoots
- Light green to yellowish color
- Strong, pleasant aroma
- Thin stems, minimal fiber

**Market Value:** Highest price point
**Target Market:** Export and premium domestic

### 2. Alele (Medium Grade)
**Characteristics:**
- Moderately tender shoots
- Green coloration
- Good aroma retention
- Balanced stem thickness

**Market Value:** Medium price range
**Target Market:** Domestic wholesale

### 3. Lomboko (Standard Grade)
**Characteristics:**
- Mature shoots acceptable
- Darker green color
- Basic aroma profile
- Thicker stems

**Market Value:** Entry-level pricing
**Target Market:** Local retail markets

## Quality Assessment Criteria
1. **Freshness Indicators**
   - Shoot tenderness
   - Color vibrancy
   - Aroma strength
   - Moisture content

2. **Physical Characteristics**
   - Stem thickness
   - Shoot length
   - Leaf condition
   - Overall appearance

3. **Packaging Standards**
   - Clean wrapping
   - Proper ventilation
   - Temperature control
   - Transit protection

## Grading Process
1. **Visual Inspection**: Initial quality assessment
2. **Tactile Evaluation**: Tenderness and texture check
3. **Aroma Testing**: Scent profile evaluation
4. **Packaging Review**: Presentation quality check

## Quality Improvement Strategies
- **Harvesting Timing**: Optimal maturity selection
- **Post-Harvest Handling**: Proper storage techniques
- **Transportation Methods**: Temperature and humidity control
- **Market Preparation**: Professional presentation

## Certification Benefits
- **Premium Pricing**: Quality-based price premiums
- **Market Access**: Higher-end market entry
- **Brand Reputation**: Quality consistency recognition
- **Export Opportunities**: International market compliance`,
        duration: 50,
        difficulty: 'INTERMEDIATE',
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