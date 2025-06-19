import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌺 Starting Cattleya database seeding...');

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  
  if (existingUsers > 0) {
    console.log('✅ Database already seeded, skipping...');
    return;
  }

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Demo users data
  const demoUsers = [
    {
      email: 'admin@cattleya.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN' as const,
    },
    {
      email: 'staff@cattleya.com',
      password: hashedPassword,
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF' as const,
    },
    {
      email: 'customer@cattleya.com',
      password: hashedPassword,
      firstName: 'Customer',
      lastName: 'User',
      role: 'CUSTOMER' as const,
    },
  ];

  // Create demo users
  for (const userData of demoUsers) {
    await prisma.user.create({
      data: userData,
    });
    console.log(`✅ Created user: ${userData.email}`);
  }

  // Create some demo categories
  const categories = [
    {
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids for your home and garden',
      isActive: true,
    },
    {
      name: 'Cattleya',
      slug: 'cattleya',
      description: 'Premium Cattleya orchids - the queen of orchids',
      isActive: true,
    },
    {
      name: 'Phalaenopsis',
      slug: 'phalaenopsis',
      description: 'Elegant moth orchids perfect for beginners',
      isActive: true,
    },
  ];

  for (const categoryData of categories) {
    await prisma.category.create({
      data: categoryData,
    });
    console.log(`✅ Created category: ${categoryData.name}`);
  }

  console.log('🌺 Cattleya database seeding completed!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('Admin: admin@cattleya.com / password123');
  console.log('Staff: staff@cattleya.com / password123');
  console.log('Customer: customer@cattleya.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 