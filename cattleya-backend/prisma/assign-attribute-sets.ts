import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignAttributeSets() {
  console.log('🔗 Assigning attribute sets to products...');

  try {
    // Get all attribute sets
    const attributeSets = await prisma.attributeSet.findMany({
      include: {
        attributes: true
      }
    });

    if (attributeSets.length === 0) {
      console.log('No attribute sets found. Please run seed-attributes.ts first.');
      return;
    }

    console.log(`Found ${attributeSets.length} attribute sets:`);
    attributeSets.forEach(set => {
      console.log(`  - ${set.name} (${set.attributes.length} attributes)`);
    });

    // Get all products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true
      }
    });

    if (products.length === 0) {
      console.log('No products found.');
      return;
    }

    console.log(`\nFound ${products.length} products to assign attribute sets to.`);

    let assignedCount = 0;

    for (const product of products) {
      let attributeSetId: string | null = null;

      // Determine which attribute set to assign based on category or product name
      if (product.category?.name?.toLowerCase().includes('orchid') || 
          product.name.toLowerCase().includes('cattleya') ||
          product.name.toLowerCase().includes('phalaenopsis') ||
          product.name.toLowerCase().includes('dendrobium') ||
          product.name.toLowerCase().includes('oncidium')) {
        // Orchid products
        const orchidSet = attributeSets.find(set => set.name === 'Orchid Attributes');
        if (orchidSet) {
          attributeSetId = orchidSet.id;
        }
      } else if (product.category?.name?.toLowerCase().includes('pot') ||
                 product.category?.name?.toLowerCase().includes('planter') ||
                 product.name.toLowerCase().includes('pot') ||
                 product.name.toLowerCase().includes('planter')) {
        // Pot & Planter products
        const potSet = attributeSets.find(set => set.name === 'Pot & Planter Attributes');
        if (potSet) {
          attributeSetId = potSet.id;
        }
      } else if (product.category?.name?.toLowerCase().includes('care') ||
                 product.category?.name?.toLowerCase().includes('fertilizer') ||
                 product.category?.name?.toLowerCase().includes('soil')) {
        // Care Essentials products
        const careSet = attributeSets.find(set => set.name === 'Care Essentials Attributes');
        if (careSet) {
          attributeSetId = careSet.id;
        }
      } else if (product.category?.name?.toLowerCase().includes('accessory') ||
                 product.category?.name?.toLowerCase().includes('tool')) {
        // Accessories & Tools products
        const accessorySet = attributeSets.find(set => set.name === 'Accessories & Tools Attributes');
        if (accessorySet) {
          attributeSetId = accessorySet.id;
        }
      }

      // If no specific match, assign the first available set (usually Orchid)
      if (!attributeSetId && attributeSets.length > 0) {
        attributeSetId = attributeSets[0].id;
      }

      if (attributeSetId) {
        await prisma.product.update({
          where: { id: product.id },
          data: { attributeSetId }
        });

        const assignedSet = attributeSets.find(set => set.id === attributeSetId);
        console.log(`  ✅ Assigned "${assignedSet?.name}" to "${product.name}"`);
        assignedCount++;
      } else {
        console.log(`  ⚠️  No attribute set found for "${product.name}"`);
      }
    }

    console.log(`\n🎉 Successfully assigned attribute sets to ${assignedCount} products!`);

  } catch (error) {
    console.error('❌ Error assigning attribute sets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
assignAttributeSets()
  .catch((error) => {
    console.error('❌ Assignment failed:', error);
    process.exit(1);
  }); 