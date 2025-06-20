import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌺 Starting to seed Cattleya E-commerce database...');

  // Create demo users first
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cattleya.com' },
    update: {},
    create: {
      email: 'admin@cattleya.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    }
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      firstName: 'Customer',
      lastName: 'User',
      role: 'CUSTOMER',
    }
  });

  console.log('✅ Created demo users');
  console.log('   - Admin: admin@cattleya.com / password123');
  console.log('   - Customer: customer@example.com / password123');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.productVariantAttribute.deleteMany();
  await prisma.productVariantImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create categories
  const orchidsCategory = await prisma.category.create({
    data: {
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids',
      isActive: true,
      sortOrder: 1,
    }
  });

  const cattleyaCategory = await prisma.category.create({
    data: {
      name: 'Cattleya Orchids',
      slug: 'cattleya-orchids',
      description: 'The queen of orchids',
      parentId: orchidsCategory.id,
      isActive: true,
      sortOrder: 1,
    }
  });

  console.log('✅ Created categories');

  // Create a simple product
  const product1 = await prisma.product.create({
    data: {
      name: 'Cattleya Purple Majesty',
      slug: 'cattleya-purple-majesty',
      sku: 'CATT-PM-001',
      description: 'Beautiful purple Cattleya orchid',
      basePrice: 149.99,
      stockQuantity: 15,
      defaultSize: 'YOUNG_PLANT',
      availableSizes: ['YOUNG_PLANT', 'MATURE'],
      primaryColors: ['#8B5CF6'],
      colorPattern: 'SOLID',
      categoryId: cattleyaCategory.id,
      tags: ['purple', 'fragrant'],
      isActive: true,
      isFeatured: true,
      publishedAt: new Date()
    }
  });

  console.log('✅ Created product');

  // Create product image
  await prisma.productImage.create({
    data: {
      productId: product1.id,
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      altText: 'Purple Cattleya',
      isMain: true,
      sortOrder: 1
    }
  });

  console.log('✅ Created product image');

  const totalProducts = await prisma.product.count();
  console.log(`🎉 Database seeded successfully with ${totalProducts} products!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 