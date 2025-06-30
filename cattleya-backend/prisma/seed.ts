import { PrismaClient, OrchidSize, ColorPattern } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORY_ICON_URL = 'https://cattleya-ecommerce.s3.amazonaws.com/categories/orchid-icon.svg';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cattleya.com' },
    update: {},
    create: {
      email: 'admin@cattleya.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890',
    },
  });

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      phone: '+1234567891',
    },
  });

  // Create additional demo customers
  for (let i = 1; i <= 10; i++) {
    await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.com`,
        password: customerPassword,
        firstName: `Customer${i}`,
        lastName: 'Demo',
        role: 'CUSTOMER',
        phone: `+123456789${i + 1}`,
      },
    });
  }

  console.log('✅ Created demo users');
  console.log('   - Admin: admin@cattleya.com / admin123');
  console.log('   - Customer: customer@example.com / customer123');
  console.log(`   - Additional customers: customer1-10@example.com / customer123`);

  // Clean existing data
  try {
    await prisma.review.deleteMany();
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
    },
    create: {
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids for your home and garden',
      isActive: true,
      sortOrder: 1,
      icon: CATEGORY_ICON_URL,
    }
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
      },
      create: {
        name: 'Cattleya Orchids',
        slug: 'cattleya-orchids',
        description: 'The queen of orchids - large, fragrant, and spectacular',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 1,
        icon: CATEGORY_ICON_URL,
      }
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
      },
      create: {
        name: 'Phalaenopsis Orchids',
        slug: 'phalaenopsis-orchids',
        description: 'Moth orchids - perfect for beginners with long-lasting blooms',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 2,
        icon: CATEGORY_ICON_URL,
      }
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
      },
      create: {
        name: 'Dendrobium Orchids',
        slug: 'dendrobium-orchids',
        description: 'Tree orchids with diverse forms and abundant flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 3,
        icon: CATEGORY_ICON_URL,
      }
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
      },
      create: {
        name: 'Oncidium Orchids',
        slug: 'oncidium-orchids',
        description: 'Dancing lady orchids with cheerful yellow flowers',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 4,
        icon: CATEGORY_ICON_URL,
      }
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
      },
      create: {
        name: 'Vanda Orchids',
        slug: 'vanda-orchids',
        description: 'Stunning blue orchids with impressive size and beauty',
        parentId: orchidsCategory.id,
        isActive: true,
        sortOrder: 5,
        icon: CATEGORY_ICON_URL,
      }
    }),
  };

  console.log('✅ Created categories');

  // Create sample products
  const products = [
    {
      name: 'Purple Cattleya Orchid',
      slug: 'purple-cattleya-orchid',
      sku: 'CATT-001',
      description: 'A stunning purple Cattleya orchid with large, fragrant flowers. Perfect for collectors and enthusiasts.',
      shortDescription: 'Beautiful purple Cattleya with fragrant blooms',
      basePrice: 89.99,
      salePrice: 79.99,
      isOnSale: true,
      costPrice: 45.00,
      stock: 15,
      lowStockThreshold: 5,
      trackQuantity: true,
      weight: 2.5,
      dimensions: '30x20x15',
      defaultSize: OrchidSize.BLOOMING_SIZE,
      availableSizes: [OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE, OrchidSize.SPECIMEN],
      primaryColors: ['#8B5CF6', '#A855F7'],
      colorPattern: ColorPattern.SOLID,
      categoryId: categories.cattleya.id,
      tags: ['cattleya', 'purple', 'fragrant', 'collector'],
      metaTitle: 'Purple Cattleya Orchid - Premium Quality',
      metaDescription: 'Buy a beautiful purple Cattleya orchid with fragrant blooms. Perfect for collectors.',
      metaKeywords: ['cattleya', 'orchid', 'purple', 'fragrant', 'premium'],
      isActive: true,
      isFeatured: true,
      isDigital: false,
      publishedAt: new Date(),
      averageRating: 4.8,
      totalReviews: 12,
      totalSales: 8,
      viewCount: 156,
      attributes: [
        { name: 'Care Level', value: 'Intermediate' },
        { name: 'Blooming Season', value: 'Spring' },
        { name: 'Fragrance', value: 'Yes' },
        { name: 'Origin', value: 'Brazil' }
      ]
    },
    {
      name: 'White Phalaenopsis Orchid',
      slug: 'white-phalaenopsis-orchid',
      sku: 'PHAL-001',
      description: 'A classic white Phalaenopsis orchid, perfect for beginners. Long-lasting blooms and easy care.',
      shortDescription: 'Classic white Phalaenopsis for beginners',
      basePrice: 49.99,
      salePrice: null,
      isOnSale: false,
      costPrice: 25.00,
      stock: 25,
      lowStockThreshold: 5,
      trackQuantity: true,
      weight: 1.8,
      dimensions: '25x18x12',
      defaultSize: OrchidSize.BLOOMING_SIZE,
      availableSizes: [OrchidSize.YOUNG_PLANT, OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE],
      primaryColors: ['#FFFFFF', '#F8F9FA'],
      colorPattern: ColorPattern.SOLID,
      categoryId: categories.phalaenopsis.id,
      tags: ['phalaenopsis', 'white', 'beginner', 'easy-care'],
      metaTitle: 'White Phalaenopsis Orchid - Perfect for Beginners',
      metaDescription: 'Beautiful white Phalaenopsis orchid with easy care requirements. Perfect for beginners.',
      metaKeywords: ['phalaenopsis', 'orchid', 'white', 'beginner', 'easy-care'],
      isActive: true,
      isFeatured: true,
      isDigital: false,
      publishedAt: new Date(),
      averageRating: 4.9,
      totalReviews: 28,
      totalSales: 22,
      viewCount: 342,
      attributes: [
        { name: 'Care Level', value: 'Beginner' },
        { name: 'Blooming Season', value: 'Year-round' },
        { name: 'Fragrance', value: 'No' },
        { name: 'Origin', value: 'Southeast Asia' }
      ]
    },
    {
      name: 'Yellow Dendrobium Orchid',
      slug: 'yellow-dendrobium-orchid',
      sku: 'DEND-001',
      description: 'A vibrant yellow Dendrobium orchid with multiple flower spikes. Great for adding color to any space.',
      shortDescription: 'Vibrant yellow Dendrobium with multiple spikes',
      basePrice: 69.99,
      salePrice: 59.99,
      isOnSale: true,
      costPrice: 35.00,
      stock: 12,
      lowStockThreshold: 5,
      trackQuantity: true,
      weight: 2.2,
      dimensions: '28x22x16',
      defaultSize: OrchidSize.MATURE,
      availableSizes: [OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE],
      primaryColors: ['#FFD700', '#FFA500'],
      colorPattern: ColorPattern.SOLID,
      categoryId: categories.dendrobium.id,
      tags: ['dendrobium', 'yellow', 'vibrant', 'multiple-spikes'],
      metaTitle: 'Yellow Dendrobium Orchid - Vibrant and Colorful',
      metaDescription: 'Bright yellow Dendrobium orchid with multiple flower spikes. Adds vibrant color to any space.',
      metaKeywords: ['dendrobium', 'orchid', 'yellow', 'vibrant', 'colorful'],
      isActive: true,
      isFeatured: false,
      isDigital: false,
      publishedAt: new Date(),
      averageRating: 4.7,
      totalReviews: 8,
      totalSales: 5,
      viewCount: 89,
      attributes: [
        { name: 'Care Level', value: 'Intermediate' },
        { name: 'Blooming Season', value: 'Spring-Summer' },
        { name: 'Fragrance', value: 'Yes' },
        { name: 'Origin', value: 'Australia' }
      ]
    }
  ];

  for (const productData of products) {
    const { attributes, ...productFields } = productData;
    
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: productFields,
      create: productFields,
    });

    // Create product attributes
    for (const attr of attributes) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          name: attr.name,
          value: attr.value
        }
      });
    }

    // Create sample product images
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `https://cattleya-ecommerce.s3.amazonaws.com/products/${product.slug}/main.jpg`,
        altText: `${product.name} - Main Image`,
        isMain: true,
        sortOrder: 1
      }
    });
  }

  console.log(`✅ Created ${products.length} sample products`);

  // Create sample reviews
  const reviews = [
    {
      userId: customer.id,
      productId: (await prisma.product.findFirst({ where: { sku: 'CATT-001' } }))!.id,
      rating: 5,
      title: 'Absolutely Beautiful!',
      comment: 'This purple Cattleya is stunning. The flowers are large and fragrant. Highly recommended!',
      images: [],
      isVerifiedPurchase: true,
      isApproved: true,
      isVisible: true
    },
    {
      userId: customer.id,
      productId: (await prisma.product.findFirst({ where: { sku: 'PHAL-001' } }))!.id,
      rating: 5,
      title: 'Perfect for Beginners',
      comment: 'My first orchid and it\'s thriving! Easy to care for and beautiful blooms.',
      images: [],
      isVerifiedPurchase: true,
      isApproved: true,
      isVisible: true
    }
  ];

  for (const reviewData of reviews) {
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: reviewData.userId,
          productId: reviewData.productId
        }
      },
      update: reviewData,
      create: reviewData
    });
  }

  console.log(`✅ Created ${reviews.length} sample reviews`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 