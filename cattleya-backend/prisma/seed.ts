import { PrismaClient, OrchidSize, ColorPattern } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample orchid data
const orchidData = [
  {
    name: 'Cattleya Purple Majesty',
    slug: 'cattleya-purple-majesty',
    sku: 'CATT-PM-001',
    description: 'A stunning purple Cattleya orchid with large, fragrant blooms. This magnificent specimen produces deep purple flowers with darker veining and a rich, sweet fragrance that fills the room.',
    shortDescription: 'Beautiful purple Cattleya with fragrant blooms',
    basePrice: 149.99,
    salePrice: 129.99,
    isOnSale: true,
    stockQuantity: 15,
    defaultSize: 'YOUNG_PLANT',
    availableSizes: ['YOUNG_PLANT', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#8B5CF6', '#6B46C1'],
    colorPattern: 'BICOLOR',
    category: 'cattleya',
    tags: ['purple', 'fragrant', 'large-flowers'],
    images: [
      'https://images.unsplash.com/photo-1713684254713-228689f55e0e?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1623061275416-24596e40449f?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  },
  {
    name: 'Phalaenopsis White Elegance',
    slug: 'phalaenopsis-white-elegance',
    sku: 'PHAL-WE-002',
    description: 'Classic white Phalaenopsis orchid with pristine white petals and a yellow center. Perfect for beginners, this orchid blooms for months and is easy to care for.',
    shortDescription: 'Classic white Phalaenopsis, perfect for beginners',
    basePrice: 89.99,
    stockQuantity: 25,
    defaultSize: 'MATURE',
    availableSizes: ['SAPLING', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#FFFFFF', '#FEF3C7'],
    colorPattern: 'BICOLOR',
    category: 'phalaenopsis',
    tags: ['white', 'beginner-friendly', 'long-blooming'],
    images: [
      'https://images.unsplash.com/photo-1698434960831-609ca1e10ab8?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1624468575652-6a3c9cbf5f2b?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  },
  {
    name: 'Dendrobium Golden Sunshine',
    slug: 'dendrobium-golden-sunshine',
    sku: 'DEND-GS-003',
    description: 'Vibrant yellow Dendrobium orchid that brings sunshine to any space. These compact orchids produce clusters of bright yellow flowers with excellent longevity.',
    shortDescription: 'Bright yellow Dendrobium with clustered blooms',
    basePrice: 124.99,
    stockQuantity: 18,
    defaultSize: 'MATURE',
    availableSizes: ['YOUNG_PLANT', 'MATURE', 'SPECIMEN'],
    primaryColors: ['#FCD34D', '#F59E0B'],
    colorPattern: 'SOLID',
    category: 'dendrobium',
    tags: ['yellow', 'compact', 'bright'],
    images: [
      'https://images.unsplash.com/photo-1549064066-71a6b24f9b52?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1705950003899-e1722dc6e342?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Oncidium Dancing Lady',
    slug: 'oncidium-dancing-lady',
    sku: 'ONCI-DL-004',
    description: 'Cheerful yellow and brown Oncidium orchid known as the "Dancing Lady" for its distinctive flower shape that resembles a dancing figure in a flowing dress.',
    shortDescription: 'Yellow and brown "Dancing Lady" orchid',
    basePrice: 94.99,
    stockQuantity: 22,
    defaultSize: 'MATURE',
    availableSizes: ['SAPLING', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#FCD34D', '#92400E'],
    colorPattern: 'MULTICOLOR',
    category: 'oncidium',
    tags: ['yellow', 'brown', 'unique-shape'],
    images: [
      'https://images.unsplash.com/photo-1649531372276-1a12ea2bf18a?w=800&h=800&fit=crop&crop=center',
      'https://plus.unsplash.com/premium_photo-1676253696267-15bb9df65b15?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Cattleya Pink Perfection',
    slug: 'cattleya-pink-perfection',
    sku: 'CATT-PP-005',
    description: 'Exquisite pink Cattleya with ruffled petals and a delicate fragrance. This variety produces large, showy flowers perfect for special occasions.',
    shortDescription: 'Pink Cattleya with ruffled petals and fragrance',
    basePrice: 164.99,
    salePrice: 144.99,
    isOnSale: true,
    stockQuantity: 12,
    defaultSize: 'BLOOMING_SIZE',
    availableSizes: ['MATURE', 'BLOOMING_SIZE', 'SPECIMEN'],
    primaryColors: ['#F472B6', '#EC4899'],
    colorPattern: 'SOLID',
    category: 'cattleya',
    tags: ['pink', 'fragrant', 'ruffled', 'large-flowers'],
    images: [
      'https://plus.unsplash.com/premium_photo-1673931249523-69dcbace086b?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586799960848-b58bb43710b3?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  },
  {
    name: 'Vanda Blue Magic',
    slug: 'vanda-blue-magic',
    sku: 'VAND-BM-006',
    description: 'Rare blue Vanda orchid with stunning blue-purple flowers. These orchids are prized for their unique coloration and impressive size when mature.',
    shortDescription: 'Rare blue Vanda with stunning blue-purple flowers',
    basePrice: 299.99,
    stockQuantity: 8,
    defaultSize: 'SPECIMEN',
    availableSizes: ['MATURE', 'BLOOMING_SIZE', 'SPECIMEN'],
    primaryColors: ['#3B82F6', '#6366F1'],
    colorPattern: 'SOLID',
    category: 'vanda',
    tags: ['blue', 'rare', 'large', 'premium'],
    images: [
      'https://images.unsplash.com/photo-1615917726762-a1fbc43144fa?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1704907632137-493a933d8ad3?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  },
  {
    name: 'Phalaenopsis Spotted Beauty',
    slug: 'phalaenopsis-spotted-beauty',
    sku: 'PHAL-SB-007',
    description: 'Unique spotted Phalaenopsis with white petals adorned with purple spots. This variety adds an exotic touch to any orchid collection.',
    shortDescription: 'White Phalaenopsis with distinctive purple spots',
    basePrice: 109.99,
    stockQuantity: 16,
    defaultSize: 'MATURE',
    availableSizes: ['YOUNG_PLANT', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#FFFFFF', '#8B5CF6'],
    colorPattern: 'VARIEGATED',
    category: 'phalaenopsis',
    tags: ['white', 'purple', 'spotted', 'unique'],
    images: [
      'https://images.unsplash.com/photo-1615703771691-b41948c7785a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1610397648930-477b8c7f0943?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Cymbidium Green Goddess',
    slug: 'cymbidium-green-goddess',
    sku: 'CYMB-GG-008',
    description: 'Elegant green Cymbidium orchid with long-lasting flowers. These orchids are perfect for cooler climates and produce spectacular flower spikes.',
    shortDescription: 'Elegant green Cymbidium with long-lasting blooms',
    basePrice: 179.99,
    stockQuantity: 14,
    defaultSize: 'MATURE',
    availableSizes: ['MATURE', 'BLOOMING_SIZE', 'SPECIMEN'],
    primaryColors: ['#22C55E', '#16A34A'],
    colorPattern: 'SOLID',
    category: 'cymbidium',
    tags: ['green', 'cool-climate', 'long-lasting', 'spikes'],
    images: [
      'https://images.unsplash.com/photo-1582862058398-c157c8424b54?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1612528907124-f8a51ef08ed5?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Miltonia Sunset Flame',
    slug: 'miltonia-sunset-flame',
    sku: 'MILT-SF-009',
    description: 'Vibrant orange and red Miltonia orchid resembling a sunset. Known for their pansy-like faces, these orchids bring warmth and color to any collection.',
    shortDescription: 'Orange and red Miltonia with pansy-like flowers',
    basePrice: 134.99,
    stockQuantity: 19,
    defaultSize: 'MATURE',
    availableSizes: ['SAPLING', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#F97316', '#DC2626'],
    colorPattern: 'BICOLOR',
    category: 'miltonia',
    tags: ['orange', 'red', 'pansy-face', 'warm-colors'],
    images: [
      'https://images.unsplash.com/photo-1624819107184-0c4fe02da00c?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1623061275416-24596e40449f?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Paphiopedilum Lady Slipper',
    slug: 'paphiopedilum-lady-slipper',
    sku: 'PAPH-LS-010',
    description: 'Exotic Lady Slipper orchid with unique pouch-shaped flowers. These terrestrial orchids are prized for their unusual form and mottled foliage.',
    shortDescription: 'Exotic Lady Slipper with unique pouch flowers',
    basePrice: 189.99,
    stockQuantity: 10,
    defaultSize: 'MATURE',
    availableSizes: ['YOUNG_PLANT', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#92400E', '#FEF3C7'],
    colorPattern: 'MULTICOLOR',
    category: 'paphiopedilum',
    tags: ['exotic', 'terrestrial', 'unique-shape', 'mottled'],
    images: [
      'https://images.unsplash.com/photo-1618080606404-4ae39d25067b?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1713684254713-228689f55e0e?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  },
  {
    name: 'Cattleya Chocolate Drop',
    slug: 'cattleya-chocolate-drop',
    sku: 'CATT-CD-011',
    description: 'Rich chocolate-brown Cattleya with a sweet fragrance reminiscent of vanilla and chocolate. This unique variety is a conversation starter.',
    shortDescription: 'Chocolate-brown Cattleya with sweet vanilla fragrance',
    basePrice: 174.99,
    stockQuantity: 11,
    defaultSize: 'BLOOMING_SIZE',
    availableSizes: ['MATURE', 'BLOOMING_SIZE', 'SPECIMEN'],
    primaryColors: ['#92400E', '#451A03'],
    colorPattern: 'SOLID',
    category: 'cattleya',
    tags: ['brown', 'chocolate', 'fragrant', 'unique'],
    images: [
      'https://images.unsplash.com/photo-1698434960831-609ca1e10ab8?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1624468575652-6a3c9cbf5f2b?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Dendrobium Nobile Spring',
    slug: 'dendrobium-nobile-spring',
    sku: 'DEND-NS-012',
    description: 'Classic Dendrobium nobile with white and pink flowers that bloom along the entire cane. Perfect for spring displays with abundant blooms.',
    shortDescription: 'Classic white and pink Dendrobium nobile',
    basePrice: 114.99,
    stockQuantity: 21,
    defaultSize: 'MATURE',
    availableSizes: ['YOUNG_PLANT', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#FFFFFF', '#F472B6'],
    colorPattern: 'BICOLOR',
    category: 'dendrobium',
    tags: ['white', 'pink', 'spring', 'abundant'],
    images: [
      'https://images.unsplash.com/photo-1549064066-71a6b24f9b52?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1705950003899-e1722dc6e342?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Brassia Spider Orchid',
    slug: 'brassia-spider-orchid',
    sku: 'BRAS-SO-013',
    description: 'Dramatic spider orchid with long, thin petals that create a spider-like appearance. These unusual orchids are sure to capture attention.',
    shortDescription: 'Dramatic spider orchid with long, thin petals',
    basePrice: 144.99,
    stockQuantity: 13,
    defaultSize: 'MATURE',
    availableSizes: ['SAPLING', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#FCD34D', '#92400E'],
    colorPattern: 'MULTICOLOR',
    category: 'brassia',
    tags: ['spider', 'dramatic', 'unusual', 'long-petals'],
    images: [
      'https://images.unsplash.com/photo-1649531372276-1a12ea2bf18a?w=800&h=800&fit=crop&crop=center',
      'https://plus.unsplash.com/premium_photo-1676253696267-15bb9df65b15?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Phalaenopsis Mini Mark',
    slug: 'phalaenopsis-mini-mark',
    sku: 'PHAL-MM-014',
    description: 'Compact yellow Phalaenopsis with red markings. Perfect for small spaces, this miniature orchid packs a lot of personality into a small package.',
    shortDescription: 'Compact yellow Phalaenopsis with red markings',
    basePrice: 69.99,
    salePrice: 59.99,
    isOnSale: true,
    stockQuantity: 28,
    defaultSize: 'MATURE',
    availableSizes: ['SAPLING', 'MATURE'],
    primaryColors: ['#FCD34D', '#DC2626'],
    colorPattern: 'MULTICOLOR',
    category: 'phalaenopsis',
    tags: ['yellow', 'red', 'compact', 'miniature'],
    images: [
      'https://plus.unsplash.com/premium_photo-1673931249523-69dcbace086b?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586799960848-b58bb43710b3?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Cattleya Lavender Mist',
    slug: 'cattleya-lavender-mist',
    sku: 'CATT-LM-015',
    description: 'Soft lavender Cattleya with a gentle fragrance and ruffled edges. This delicate beauty brings a touch of elegance to any orchid collection.',
    shortDescription: 'Soft lavender Cattleya with gentle fragrance',
    basePrice: 154.99,
    stockQuantity: 17,
    defaultSize: 'BLOOMING_SIZE',
    availableSizes: ['MATURE', 'BLOOMING_SIZE', 'SPECIMEN'],
    primaryColors: ['#C084FC', '#A855F7'],
    colorPattern: 'SOLID',
    category: 'cattleya',
    tags: ['lavender', 'fragrant', 'ruffled', 'elegant'],
    images: [
      'https://images.unsplash.com/photo-1615917726762-a1fbc43144fa?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1704907632137-493a933d8ad3?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  },
  {
    name: 'Oncidium Sharry Baby',
    slug: 'oncidium-sharry-baby',
    sku: 'ONCI-SB-016',
    description: 'Famous chocolate-scented Oncidium with burgundy and white flowers. This orchid literally smells like chocolate and is beloved by collectors.',
    shortDescription: 'Chocolate-scented Oncidium with burgundy flowers',
    basePrice: 124.99,
    stockQuantity: 15,
    defaultSize: 'MATURE',
    availableSizes: ['YOUNG_PLANT', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#7C2D12', '#FFFFFF'],
    colorPattern: 'BICOLOR',
    category: 'oncidium',
    tags: ['chocolate-scent', 'burgundy', 'white', 'famous'],
    images: [
      'https://images.unsplash.com/photo-1615703771691-b41948c7785a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1610397648930-477b8c7f0943?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  },
  {
    name: 'Dendrobium King',
    slug: 'dendrobium-king',
    sku: 'DEND-KG-017',
    description: 'Majestic purple Dendrobium with large, showy flowers. This variety produces impressive blooms that can last for several months.',
    shortDescription: 'Majestic purple Dendrobium with large blooms',
    basePrice: 159.99,
    stockQuantity: 12,
    defaultSize: 'SPECIMEN',
    availableSizes: ['MATURE', 'BLOOMING_SIZE', 'SPECIMEN'],
    primaryColors: ['#8B5CF6', '#6B46C1'],
    colorPattern: 'SOLID',
    category: 'dendrobium',
    tags: ['purple', 'majestic', 'large', 'long-lasting'],
    images: [
      'https://images.unsplash.com/photo-1582862058398-c157c8424b54?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1612528907124-f8a51ef08ed5?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Zygopetalum Rhein Moonlight',
    slug: 'zygopetalum-rhein-moonlight',
    sku: 'ZYGO-RM-018',
    description: 'Fragrant Zygopetalum with green sepals and a white lip decorated with purple markings. Known for their strong, sweet fragrance.',
    shortDescription: 'Fragrant Zygopetalum with green and purple flowers',
    basePrice: 169.99,
    stockQuantity: 9,
    defaultSize: 'MATURE',
    availableSizes: ['MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#22C55E', '#8B5CF6'],
    colorPattern: 'MULTICOLOR',
    category: 'zygopetalum',
    tags: ['fragrant', 'green', 'purple', 'sweet-scent'],
    images: [
      'https://images.unsplash.com/photo-1624819107184-0c4fe02da00c?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1623061275416-24596e40449f?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Phalaenopsis Coral Sunset',
    slug: 'phalaenopsis-coral-sunset',
    sku: 'PHAL-CS-019',
    description: 'Stunning coral-colored Phalaenopsis that captures the beauty of a tropical sunset. This warm-toned orchid brings joy to any space.',
    shortDescription: 'Coral-colored Phalaenopsis with sunset hues',
    basePrice: 99.99,
    stockQuantity: 20,
    defaultSize: 'MATURE',
    availableSizes: ['SAPLING', 'MATURE', 'BLOOMING_SIZE'],
    primaryColors: ['#FB7185', '#F97316'],
    colorPattern: 'BICOLOR',
    category: 'phalaenopsis',
    tags: ['coral', 'sunset', 'warm', 'tropical'],
    images: [
      'https://images.unsplash.com/photo-1618080606404-4ae39d25067b?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1713684254713-228689f55e0e?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: false
  },
  {
    name: 'Cattleya Golden Emperor',
    slug: 'cattleya-golden-emperor',
    sku: 'CATT-GE-020',
    description: 'Magnificent golden-yellow Cattleya with large, ruffled flowers and intense fragrance. This premium orchid is the crown jewel of any collection.',
    shortDescription: 'Golden-yellow Cattleya with ruffled flowers',
    basePrice: 249.99,
    salePrice: 199.99,
    isOnSale: true,
    stockQuantity: 6,
    defaultSize: 'SPECIMEN',
    availableSizes: ['BLOOMING_SIZE', 'SPECIMEN'],
    primaryColors: ['#FCD34D', '#F59E0B'],
    colorPattern: 'SOLID',
    category: 'cattleya',
    tags: ['golden', 'yellow', 'ruffled', 'premium', 'fragrant'],
    images: [
      'https://images.unsplash.com/photo-1698434960831-609ca1e10ab8?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1624468575652-6a3c9cbf5f2b?w=800&h=800&fit=crop&crop=center'
    ],
    isFeatured: true
  }
];

// Sample review data
const reviewTexts = [
  {
    titles: ['Absolutely stunning!', 'Beautiful orchid', 'Exceeded expectations', 'Perfect condition'],
    comments: [
      'This orchid arrived in perfect condition and has been blooming beautifully for months. The colors are even more vibrant than in the photos!',
      'I\'ve been growing orchids for 10 years and this is one of the healthiest specimens I\'ve received. Highly recommend!',
      'The fragrance is incredible and fills my entire living room. Worth every penny!',
      'Perfect packaging and the plant was exactly as described. Will definitely order again.'
    ]
  },
  {
    titles: ['Great for beginners', 'Easy to care for', 'Blooms regularly', 'Healthy plant'],
    comments: [
      'As a beginner, I was worried about caring for orchids, but this one has been very forgiving and rewarding.',
      'The care instructions were clear and the plant has been thriving in my home office.',
      'It\'s been blooming consistently and the flowers last for weeks. Very happy with this purchase.',
      'Arrived quickly and in excellent condition. The root system was very healthy.'
    ]
  },
  {
    titles: ['Unique and beautiful', 'Love the colors', 'Conversation starter', 'Premium quality'],
    comments: [
      'The unique coloration makes this orchid a real standout in my collection. Guests always comment on it.',
      'The color combination is even more beautiful in person. Photos don\'t do it justice.',
      'This has become the centerpiece of my orchid display. Absolutely gorgeous!',
      'You can tell this is a premium quality plant. The attention to detail in packaging was impressive.'
    ]
  }
];

const CATEGORY_ICON_URL = "https://cattleyaorchids.s3.eu-north-1.amazonaws.com/media/49e7d3a1-bd73-4f14-b173-593e04017f67-cattleya.svg";

async function main() {
  console.log('🌺 Starting to seed Cattleya E-commerce database...');

  // Create demo users with correct passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cattleya.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@cattleya.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    }
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: { password: customerPassword },
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'Customer',
      lastName: 'User',
      role: 'CUSTOMER',
    }
  });

  // Create additional demo customers for reviews
  const customers: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.com`,
        password: customerPassword,
        firstName: `Customer${i}`,
        lastName: 'User',
        role: 'CUSTOMER',
      }
    });
    customers.push(customer);
  }

  console.log('✅ Created demo users');
  console.log('   - Admin: admin@cattleya.com / admin123');
  console.log('   - Customer: customer@example.com / customer123');
  console.log(`   - Additional customers: customer1-10@example.com / customer123`);

  // Clean existing data - for MongoDB we can delete all at once
  try {
    await prisma.review.deleteMany();
    await prisma.productVariantAttribute.deleteMany();
    await prisma.productVariantImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productAttribute.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  } catch (error) {
    console.log('⚠️  Some cleanup operations failed, continuing...');
  }

  console.log('✅ Cleaned existing data');

  // Create categories
  const orchidsCategory = await prisma.category.upsert({
    where: { slug: 'orchids' },
    update: {
      name: 'Orchids',
      description: 'Beautiful flowering orchids for your home and garden',
      isActive: true,
      sortOrder: 1,
      icon: CATEGORY_ICON_URL,
    } as any,
    create: {
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids for your home and garden',
      isActive: true,
      sortOrder: 1,
      icon: CATEGORY_ICON_URL,
    } as any
  });

  const categories = {
    cattleya: await prisma.category.upsert({
      where: { slug: 'cattleya-orchids' },
      update: {
        name: 'Cattleya Orchids',
        description: 'The queen of orchids - large, fragrant, and spectacular',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 1,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Cattleya Orchids',
        slug: 'cattleya-orchids',
        description: 'The queen of orchids - large, fragrant, and spectacular',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 1,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    phalaenopsis: await prisma.category.upsert({
      where: { slug: 'phalaenopsis-orchids' },
      update: {
        name: 'Phalaenopsis Orchids',
        description: 'Moth orchids - perfect for beginners with long-lasting blooms',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 2,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Phalaenopsis Orchids',
        slug: 'phalaenopsis-orchids',
        description: 'Moth orchids - perfect for beginners with long-lasting blooms',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 2,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    dendrobium: await prisma.category.upsert({
      where: { slug: 'dendrobium-orchids' },
      update: {
        name: 'Dendrobium Orchids',
        description: 'Tree orchids with diverse forms and abundant flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 3,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Dendrobium Orchids',
        slug: 'dendrobium-orchids',
        description: 'Tree orchids with diverse forms and abundant flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 3,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    oncidium: await prisma.category.upsert({
      where: { slug: 'oncidium-orchids' },
      update: {
        name: 'Oncidium Orchids',
        description: 'Dancing lady orchids with cheerful yellow flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 4,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Oncidium Orchids',
        slug: 'oncidium-orchids',
        description: 'Dancing lady orchids with cheerful yellow flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 4,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    vanda: await prisma.category.upsert({
      where: { slug: 'vanda-orchids' },
      update: {
        name: 'Vanda Orchids',
        description: 'Stunning blue orchids with impressive size and beauty',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 5,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Vanda Orchids',
        slug: 'vanda-orchids',
        description: 'Stunning blue orchids with impressive size and beauty',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 5,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    cymbidium: await prisma.category.upsert({
      where: { slug: 'cymbidium-orchids' },
      update: {
        name: 'Cymbidium Orchids',
        description: 'Cool-climate orchids with long-lasting flower spikes',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 6,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Cymbidium Orchids',
        slug: 'cymbidium-orchids',
        description: 'Cool-climate orchids with long-lasting flower spikes',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 6,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    miltonia: await prisma.category.upsert({
      where: { slug: 'miltonia-orchids' },
      update: {
        name: 'Miltonia Orchids',
        description: 'Pansy orchids with flat, colorful faces',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 7,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Miltonia Orchids',
        slug: 'miltonia-orchids',
        description: 'Pansy orchids with flat, colorful faces',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 7,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    paphiopedilum: await prisma.category.upsert({
      where: { slug: 'paphiopedilum-orchids' },
      update: {
        name: 'Paphiopedilum Orchids',
        description: 'Lady slipper orchids with unique pouch-shaped flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 8,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Paphiopedilum Orchids',
        slug: 'paphiopedilum-orchids',
        description: 'Lady slipper orchids with unique pouch-shaped flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 8,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    brassia: await prisma.category.upsert({
      where: { slug: 'brassia-orchids' },
      update: {
        name: 'Brassia Orchids',
        description: 'Spider orchids with long, dramatic petals',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 9,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Brassia Orchids',
        slug: 'brassia-orchids',
        description: 'Spider orchids with long, dramatic petals',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 9,
        icon: CATEGORY_ICON_URL,
      } as any
    }),
    zygopetalum: await prisma.category.upsert({
      where: { slug: 'zygopetalum-orchids' },
      update: {
        name: 'Zygopetalum Orchids',
        description: 'Fragrant orchids with distinctive markings',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 10,
        icon: CATEGORY_ICON_URL,
      } as any,
      create: {
        name: 'Zygopetalum Orchids',
        slug: 'zygopetalum-orchids',
        description: 'Fragrant orchids with distinctive markings',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 10,
        icon: CATEGORY_ICON_URL,
      } as any
    })
  };

  console.log('✅ Created categories');

  // Create products
  const products: any[] = [];
  for (const orchid of orchidData) {
    const product = await prisma.product.create({
      data: {
        name: orchid.name,
        slug: orchid.slug,
        sku: orchid.sku,
        description: orchid.description,
        shortDescription: orchid.shortDescription,
        basePrice: orchid.basePrice,
        salePrice: orchid.salePrice,
        isOnSale: orchid.isOnSale || false,
        stockQuantity: orchid.stockQuantity,
                 defaultSize: orchid.defaultSize as OrchidSize,
         availableSizes: orchid.availableSizes as OrchidSize[],
         primaryColors: orchid.primaryColors,
         colorPattern: orchid.colorPattern as ColorPattern,
        categoryId: categories[orchid.category].id,
        tags: orchid.tags,
        isActive: true,
        isFeatured: orchid.isFeatured,
        publishedAt: new Date(),
        // We'll calculate these after adding reviews
        averageRating: 0,
        totalReviews: 0,
      }
    });

    products.push(product);

    // Create product images
    for (let i = 0; i < orchid.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: orchid.images[i],
          altText: `${orchid.name} - Image ${i + 1}`,
          isMain: i === 0,
          sortOrder: i + 1
        }
      });
    }

    // Create product attributes
    await prisma.productAttribute.create({
      data: {
        productId: product.id,
        name: 'Light Requirements',
        value: 'Bright, indirect light',
        type: 'TEXT'
      }
    });

    await prisma.productAttribute.create({
      data: {
        productId: product.id,
        name: 'Watering',
        value: 'Water when potting medium is nearly dry',
        type: 'TEXT'
      }
    });

    await prisma.productAttribute.create({
      data: {
        productId: product.id,
        name: 'Humidity',
        value: '50-70%',
        type: 'TEXT'
      }
    });

    await prisma.productAttribute.create({
      data: {
        productId: product.id,
        name: 'Temperature',
        value: '65-80°F (18-27°C)',
        type: 'TEXT'
      }
    });
  }

  console.log(`✅ Created ${products.length} products with images and attributes`);

  // Create reviews for each product
  for (const product of products) {
    const numReviews = Math.floor(Math.random() * 8) + 3; // 3-10 reviews per product
    let totalRating = 0;

    for (let i = 0; i < numReviews; i++) {
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars (mostly positive)
      const reviewType = Math.floor(Math.random() * reviewTexts.length);
      const titleIndex = Math.floor(Math.random() * reviewTexts[reviewType].titles.length);
      const commentIndex = Math.floor(Math.random() * reviewTexts[reviewType].comments.length);

      // Check if this customer already reviewed this product
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_productId: {
            userId: randomCustomer.id,
            productId: product.id
          }
        }
      });

      if (!existingReview) {
        await prisma.review.create({
          data: {
            userId: randomCustomer.id,
            productId: product.id,
            rating: rating,
            title: reviewTexts[reviewType].titles[titleIndex],
            comment: reviewTexts[reviewType].comments[commentIndex],
            isVerifiedPurchase: Math.random() > 0.3, // 70% verified purchases
            isApproved: true,
            isVisible: true,
            helpfulVotes: Math.floor(Math.random() * 15), // 0-14 helpful votes
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within last 90 days
          }
        });

        totalRating += rating;
      }
    }

    // Update product with average rating and review count
    const actualReviewCount = await prisma.review.count({
      where: { productId: product.id }
    });

    if (actualReviewCount > 0) {
      const avgRating = totalRating / actualReviewCount;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
          totalReviews: actualReviewCount
        }
      });
    }
  }

  console.log('✅ Created reviews for all products');

  // Create addresses for each customer
  for (const customer of customers) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        type: 'shipping',
        label: 'Home',
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: 'Orchid Lovers Inc.',
        street: `${100 + Math.floor(Math.random() * 900)} Orchid Lane`,
        apartment: `Apt ${Math.floor(Math.random() * 20) + 1}`,
        city: 'Blossom City',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        phone: `+1-555-01${Math.floor(1000 + Math.random() * 9000)}`,
        isDefault: true,
      }
    });
    await prisma.address.create({
      data: {
        userId: customer.id,
        type: 'billing',
        label: 'Office',
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: 'Orchid Lovers Inc.',
        street: `${200 + Math.floor(Math.random() * 800)} Petal Avenue`,
        apartment: `Suite ${Math.floor(Math.random() * 50) + 1}`,
        city: 'Flora Town',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: `+1-555-02${Math.floor(1000 + Math.random() * 9000)}`,
        isDefault: true,
      }
    });
  }
  console.log('✅ Created addresses for all customers');

  const totalProducts = await prisma.product.count();
  const totalReviews = await prisma.review.count();
  const totalCategories = await prisma.category.count();

  console.log(`🎉 Database seeded successfully!`);
  console.log(`   📦 ${totalProducts} products`);
  console.log(`   📂 ${totalCategories} categories`);
  console.log(`   ⭐ ${totalReviews} reviews`);
  console.log(`   👥 ${customers.length + 2} users`);

  console.log('🔑 Login credentials:');
  console.log('   Admin: admin@cattleya.com / admin123');
  console.log('   Customer: customer@example.com / customer123');

  // --- Clean old notifications for both users ---
  await prisma.notification.deleteMany({ 
    where: { 
      userId: { in: [customerUser.id, adminUser.id] } 
    } 
  });

  // --- Seed notifications for customer user ---
  await prisma.notification.createMany({
    data: [
      {
        userId: customerUser.id,
        type: 'ORDER_CONFIRMATION',
        title: 'Order Confirmed!',
        message: 'Your order #1234 has been confirmed and is being processed.',
        priority: 'HIGH',
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: customerUser.id,
        type: 'PROMOTION',
        title: 'Special Offer - 20% Off!',
        message: 'Get 20% off your next order with code SPRING20. Valid until end of month.',
        priority: 'MEDIUM',
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: customerUser.id,
        type: 'ORDER_SHIPPED',
        title: 'Order Shipped!',
        message: 'Your order #1234 has been shipped and is on its way to you.',
        priority: 'LOW',
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: customerUser.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        message: 'Your payment for order #1234 has been processed successfully.',
        priority: 'MEDIUM',
        isRead: true,
        isArchived: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]
  });

  // --- Seed notifications for admin user ---
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'SYSTEM_ALERT',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight at 2 AM. System will be down for 30 minutes.',
        priority: 'URGENT',
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: adminUser.id,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: 'Cattleya Purple Majesty is running low on stock. Only 3 items remaining.',
        priority: 'HIGH',
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: adminUser.id,
        type: 'SUPPORT_REPLY',
        title: 'New Support Ticket',
        message: 'New support ticket #4567 from customer@example.com requires attention.',
        priority: 'MEDIUM',
        isRead: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: adminUser.id,
        type: 'PAYMENT_FAILED',
        title: 'Payment Processing Error',
        message: 'Payment processing error detected for order #5678. Manual review required.',
        priority: 'HIGH',
        isRead: true,
        isArchived: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]
  });

  console.log('✅ Seeded notifications for both admin and customer users');
  console.log('   - Customer notifications: 4 (3 unread, 1 read)');
  console.log('   - Admin notifications: 4 (3 unread, 1 read)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 