import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedVariants() {
  console.log('🌱 Seeding product variants with dynamic attributes...');

  try {
    // Get products with their attribute sets
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        attributeSet: {
          include: {
            attributes: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      },
      take: 5 // Limit to first 5 products for demo
    });

    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      return;
    }

    const variants: any[] = [];

    for (const product of products) {
      console.log(`Creating variants for product: ${product.name}`);

      if (!product.attributeSet) {
        console.log(`  ⚠️  Product ${product.name} has no attribute set, skipping...`);
        continue;
      }

      // Generate variant combinations based on attribute set
      const variantCombinations = generateVariantCombinations(product.attributeSet.attributes);
      
      for (const combination of variantCombinations) {
        // Calculate price based on attributes and base product price
        const variantPrice = calculateVariantPrice(product.basePrice || 25, combination);
        
        // Generate SKU
        let sku = generateSKU(product.sku, combination);
        let finalSku = sku;
        let attempt = 0;
        while (await prisma.productVariant.findUnique({ where: { sku: finalSku } })) {
          finalSku = sku + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          attempt++;
          if (attempt > 5) break; // avoid infinite loop
        }

        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: finalSku,
            price: variantPrice,
            stock: Math.floor(Math.random() * 20) + 1, // Random stock 1-20
            isActive: true,
            attributes: combination
          }
        });

        variants.push(variant);
        console.log(`  ✅ Created variant: ${finalSku} - $${variantPrice}`);
      }
    }

    console.log(`🎉 Successfully created ${variants.length} variants!`);
    console.log(`📊 Variants created for ${products.length} products`);

  } catch (error) {
    console.error('❌ Error seeding variants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateVariantCombinations(attributes: any[]): Record<string, any>[] {
  const combinations: Record<string, any>[] = [{}];

  for (const attribute of attributes) {
    if (!attribute.isRequired) continue; // Only use required attributes for variants

    const newCombinations: Record<string, any>[] = [];
    
    for (const combination of combinations) {
      const options = getAttributeOptions(attribute);
      
      for (const option of options) {
        newCombinations.push({
          ...combination,
          [attribute.name]: option
        });
      }
    }
    
    combinations.length = 0;
    combinations.push(...newCombinations);
  }

  return combinations;
}

function getAttributeOptions(attribute: any): any[] {
  switch (attribute.type) {
    case 'SELECT':
    case 'RADIO':
    case 'COLOR':
      return attribute.options || [];
    case 'BOOLEAN':
      return [true, false];
    case 'NUMBER':
      // Generate a few sample numbers within the range
      const min = attribute.minValue || 1;
      const max = attribute.maxValue || 100;
      return [
        Math.floor((min + max) / 3),
        Math.floor((min + max) / 2),
        Math.floor((min + max) * 2 / 3)
      ];
    case 'TEXT':
      // Generate sample text values
      return [`Sample ${attribute.name}`];
    case 'MULTISELECT':
      // For multiselect, create a few combinations
      const options = attribute.options || [];
      return [
        options.slice(0, 1),
        options.slice(0, 2),
        options.slice(0, Math.min(3, options.length))
      ];
    default:
      return [];
  }
}

function calculateVariantPrice(basePrice: number, attributes: Record<string, any>): number {
  let multiplier = 1.0;

  // Size-based pricing
  if (attributes['Size']) {
    const sizeMultipliers: Record<string, number> = {
      'Seedling': 0.3,
      'Young Plant': 0.5,
      'Mature': 1.0,
      'Blooming Size': 1.5,
      'Specimen': 2.0
    };
    multiplier *= sizeMultipliers[attributes['Size']] || 1.0;
  }

  // Material-based pricing for pots
  if (attributes['Material']) {
    const materialMultipliers: Record<string, number> = {
      'Plastic': 0.7,
      'Terracotta': 0.9,
      'Ceramic': 1.2,
      'Metal': 1.5,
      'Glass': 1.8,
      'Stone': 2.0
    };
    multiplier *= materialMultipliers[attributes['Material']] || 1.0;
  }

  // Diameter-based pricing for pots
  if (attributes['Diameter']) {
    const diameter = Number(attributes['Diameter']);
    if (diameter > 20) multiplier *= 1.3;
    else if (diameter > 15) multiplier *= 1.1;
  }

  return Math.round(basePrice * multiplier * 100) / 100;
}

function generateSKU(baseSKU: string, attributes: Record<string, any>): string {
  const parts = [baseSKU];
  
  // Add key attribute values to SKU
  if (attributes['Size']) {
    parts.push(attributes['Size'].substring(0, 3).toUpperCase());
  }
  if (attributes['Color']) {
    parts.push(attributes['Color'].substring(0, 3).toUpperCase());
  }
  if (attributes['Material']) {
    parts.push(attributes['Material'].substring(0, 3).toUpperCase());
  }
  if (attributes['Diameter']) {
    parts.push(`D${attributes['Diameter']}`);
  }

  return parts.join('-');
}

// Run the seed function
seedVariants()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }); 