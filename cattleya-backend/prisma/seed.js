const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌺 Starting to seed Cattleya E-commerce database...');

  try {
    // Clean existing data
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('✅ Cleaned existing data');

    // Create categories
    const orchidsCategory = await prisma.category.create({
      data: {
        name: 'Orchids',
        slug: 'orchids',
        description: 'Beautiful flowering orchids of various sizes and colors',
        isActive: true,
        metaTitle: 'Premium Orchids - Cattleya E-commerce',
        metaDescription: 'Discover our collection of premium orchids including Cattleyas, Phalaenopsis, and rare species.'
      }
    });

    const cattleyaCategory = await prisma.category.create({
      data: {
        name: 'Cattleya Orchids',
        slug: 'cattleya-orchids',
        description: 'The queen of orchids - known for their large, fragrant blooms',
        parentId: orchidsCategory.id,
        isActive: true,
        metaTitle: 'Cattleya Orchids - Premium Collection',
        metaDescription: 'Shop our premium collection of Cattleya orchids, the queen of orchids.'
      }
    });

    const phalaenopsisCategory = await prisma.category.create({
      data: {
        name: 'Phalaenopsis Orchids',
        slug: 'phalaenopsis-orchids',
        description: 'Elegant moth orchids perfect for beginners',
        parentId: orchidsCategory.id,
        isActive: true,
        metaTitle: 'Phalaenopsis Orchids - Beginner Friendly',
        metaDescription: 'Beautiful Phalaenopsis orchids perfect for beginners and experts alike.'
      }
    });

    console.log('✅ Created categories');

    // Create products
    const product1 = await prisma.product.create({
      data: {
        name: 'Cattleya Purple Majesty',
        slug: 'cattleya-purple-majesty',
        sku: 'CATT-PM-001',
        description: 'The Cattleya Purple Majesty is a magnificent orchid that produces large, fragrant flowers with deep purple petals and a darker purple lip.',
        shortDescription: 'Stunning purple Cattleya with fragrant ruffled blooms',
        basePrice: 149.99,
        salePrice: 129.99,
        isOnSale: true,
        stockQuantity: 15,
        lowStockThreshold: 5,
        weight: 1.2,
        defaultSize: 'YOUNG_PLANT',
        availableSizes: ['SAPLING', 'YOUNG_PLANT', 'MATURE', 'BLOOMING_SIZE'],
        primaryColors: ['#8B5CF6', '#6B46C1'],
        colorPattern: 'SOLID',
        categoryId: cattleyaCategory.id,
        tags: ['fragrant', 'purple', 'large-flowers', 'intermediate'],
        metaTitle: 'Cattleya Purple Majesty - Premium Orchid',
        metaDescription: 'Beautiful purple Cattleya orchid with large fragrant blooms.',
        metaKeywords: ['cattleya', 'purple', 'orchid', 'fragrant'],
        isActive: true,
        isFeatured: true,
        averageRating: 4.8,
        totalReviews: 24,
        totalSales: 89,
        viewCount: 1247,
        publishedAt: new Date()
      }
    });

    const product2 = await prisma.product.create({
      data: {
        name: 'Phalaenopsis Snow White',
        slug: 'phalaenopsis-snow-white',
        sku: 'PHAL-SW-002',
        description: 'The Phalaenopsis Snow White is an elegant moth orchid featuring pristine white flowers with subtle yellow centers.',
        shortDescription: 'Elegant white moth orchid with long-lasting blooms',
        basePrice: 79.99,
        stockQuantity: 25,
        lowStockThreshold: 8,
        weight: 0.8,
        defaultSize: 'MATURE',
        availableSizes: ['YOUNG_PLANT', 'MATURE', 'BLOOMING_SIZE'],
        primaryColors: ['#FFFFFF', '#FFF8DC'],
        colorPattern: 'SOLID',
        categoryId: phalaenopsisCategory.id,
        tags: ['white', 'beginner-friendly', 'long-blooming', 'elegant'],
        metaTitle: 'Phalaenopsis Snow White - Beginner Orchid',
        metaDescription: 'Perfect white Phalaenopsis orchid for beginners.',
        metaKeywords: ['phalaenopsis', 'white', 'orchid', 'beginner'],
        isActive: true,
        isFeatured: true,
        averageRating: 4.6,
        totalReviews: 18,
        totalSales: 156,
        viewCount: 890,
        publishedAt: new Date()
      }
    });

    const product3 = await prisma.product.create({
      data: {
        name: 'Cattleya Sunset Orange',
        slug: 'cattleya-sunset-orange',
        sku: 'CATT-SO-003',
        description: 'A breathtaking Cattleya hybrid featuring vibrant orange and yellow blooms that mimic a spectacular sunset.',
        shortDescription: 'Vibrant orange and yellow Cattleya hybrid',
        basePrice: 189.99,
        salePrice: 159.99,
        isOnSale: true,
        stockQuantity: 8,
        lowStockThreshold: 3,
        weight: 1.5,
        defaultSize: 'BLOOMING_SIZE',
        availableSizes: ['MATURE', 'BLOOMING_SIZE', 'SPECIMEN'],
        primaryColors: ['#FF8C00', '#FFD700'],
        colorPattern: 'BICOLOR',
        categoryId: cattleyaCategory.id,
        tags: ['orange', 'yellow', 'bicolor', 'spectacular'],
        metaTitle: 'Cattleya Sunset Orange - Spectacular Hybrid',
        metaDescription: 'Amazing orange and yellow Cattleya orchid.',
        metaKeywords: ['cattleya', 'orange', 'yellow', 'bicolor', 'hybrid'],
        isActive: true,
        isFeatured: false,
        averageRating: 4.9,
        totalReviews: 12,
        totalSales: 34,
        viewCount: 654,
        publishedAt: new Date()
      }
    });

    const product4 = await prisma.product.create({
      data: {
        name: 'Phalaenopsis Pink Blush',
        slug: 'phalaenopsis-pink-blush',
        sku: 'PHAL-PB-004',
        description: 'A delicate Phalaenopsis featuring soft pink flowers with darker pink veining and spots.',
        shortDescription: 'Delicate pink Phalaenopsis with beautiful veining',
        basePrice: 89.99,
        stockQuantity: 20,
        lowStockThreshold: 6,
        weight: 0.9,
        defaultSize: 'MATURE',
        availableSizes: ['SAPLING', 'YOUNG_PLANT', 'MATURE'],
        primaryColors: ['#FFB6C1', '#FF69B4'],
        colorPattern: 'VARIEGATED',
        categoryId: phalaenopsisCategory.id,
        tags: ['pink', 'variegated', 'easy-care', 'decorative'],
        metaTitle: 'Phalaenopsis Pink Blush - Delicate Beauty',
        metaDescription: 'Beautiful pink Phalaenopsis with unique veining patterns.',
        metaKeywords: ['phalaenopsis', 'pink', 'variegated', 'decorative'],
        isActive: true,
        isFeatured: false,
        averageRating: 4.4,
        totalReviews: 31,
        totalSales: 89,
        viewCount: 543,
        publishedAt: new Date()
      }
    });

    const product5 = await prisma.product.create({
      data: {
        name: 'Cattleya Royal Purple',
        slug: 'cattleya-royal-purple',
        sku: 'CATT-RP-005',
        description: 'A regal Cattleya with deep royal purple blooms and golden throat.',
        shortDescription: 'Majestic royal purple Cattleya with golden throat',
        basePrice: 299.99,
        salePrice: 249.99,
        isOnSale: true,
        stockQuantity: 5,
        lowStockThreshold: 2,
        weight: 2.0,
        defaultSize: 'SPECIMEN',
        availableSizes: ['BLOOMING_SIZE', 'SPECIMEN'],
        primaryColors: ['#4B0082', '#FFD700'],
        colorPattern: 'BICOLOR',
        categoryId: cattleyaCategory.id,
        tags: ['purple', 'gold', 'fragrant', 'specimen', 'rare'],
        metaTitle: 'Cattleya Royal Purple - Rare Specimen',
        metaDescription: 'Rare royal purple Cattleya with golden throat.',
        metaKeywords: ['cattleya', 'royal', 'purple', 'specimen', 'rare'],
        isActive: true,
        isFeatured: true,
        averageRating: 5.0,
        totalReviews: 8,
        totalSales: 12,
        viewCount: 892,
        publishedAt: new Date()
      }
    });

    console.log('✅ Created products');

    // Create product images for each product
    const products = [product1, product2, product3, product4, product5];
    const imageUrls = [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1609142734650-b62d52514f0d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0f06ba2fe65?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583210214667-6b0e4b1d6e5c?w=800&h=800&fit=crop'
    ];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Create main image
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrls[i % imageUrls.length],
          altText: `${product.name} - Main View`,
          isMain: true,
          sortOrder: 1,
          color: product.primaryColors[0],
          size: product.defaultSize
        }
      });

      // Create additional image
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrls[(i + 1) % imageUrls.length],
          altText: `${product.name} - Side View`,
          isMain: false,
          sortOrder: 2,
          color: product.primaryColors[0],
          size: product.defaultSize
        }
      });

      console.log(`✅ Created images for: ${product.name}`);
    }

    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();
    
    console.log('🎉 Database seeded successfully!');
    console.log(`📊 Created: ${totalProducts} products, ${totalCategories} categories`);
    console.log('🌺 Your Cattleya E-commerce database is ready!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 