import { PrismaClient, AttributeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting attribute system seeding...');

  // Clean existing attribute data
  try {
    await prisma.attribute.deleteMany();
    await prisma.attributeSet.deleteMany();
  } catch (error) {
    console.log('⚠️  Some cleanup operations failed, continuing...');
  }

  console.log('✅ Cleaned existing attribute data');

  // 1. Orchid Attribute Set
  const orchidAttributeSet = await prisma.attributeSet.create({
    data: {
      name: 'Orchid Attributes',
      description: 'Standard attributes for orchid products including size, color, fragrance, and care requirements',
      isActive: true,
      attributes: {
        create: [
          {
            name: 'Size',
            type: AttributeType.SELECT,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 0,
            options: ['Seedling', 'Young Plant', 'Mature', 'Blooming Size', 'Specimen'],
          },
          {
            name: 'Color',
            type: AttributeType.COLOR,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 1,
            options: ['White', 'Pink', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue', 'Green', 'Multicolor'],
            allowCustom: true,
          },
          {
            name: 'Fragrance',
            type: AttributeType.RADIO,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 2,
            options: ['Yes', 'No'],
          },
          {
            name: 'Blooming Season',
            type: AttributeType.MULTISELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 3,
            options: ['Spring', 'Summer', 'Autumn', 'Winter'],
          },
          {
            name: 'Origin',
            type: AttributeType.TEXT,
            isRequired: false,
            isSearchable: true,
            isFilterable: false,
            sortOrder: 4,
            maxLength: 100,
          },
          {
            name: 'Care Level',
            type: AttributeType.SELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 5,
            options: ['Beginner', 'Intermediate', 'Advanced'],
          },
          {
            name: 'Light Requirements',
            type: AttributeType.SELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 6,
            options: ['Low Light', 'Medium Light', 'Bright Light', 'Direct Sun'],
          },
          {
            name: 'Watering Frequency',
            type: AttributeType.SELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 7,
            options: ['Weekly', 'Bi-weekly', 'Monthly', 'As needed'],
          },
          {
            name: 'Temperature Range',
            type: AttributeType.TEXT,
            isRequired: false,
            isSearchable: true,
            isFilterable: false,
            sortOrder: 8,
            maxLength: 50,
          },
          {
            name: 'Humidity Requirements',
            type: AttributeType.SELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 9,
            options: ['Low (30-40%)', 'Medium (40-60%)', 'High (60-80%)', 'Very High (80%+)'],
          },
        ],
      },
    },
  });

  // 2. Pot & Planter Attribute Set
  const potAttributeSet = await prisma.attributeSet.create({
    data: {
      name: 'Pot & Planter Attributes',
      description: 'Attributes for pots, planters, and containers',
      isActive: true,
      attributes: {
        create: [
          {
            name: 'Material',
            type: AttributeType.SELECT,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 0,
            options: ['Ceramic', 'Plastic', 'Terracotta', 'Metal', 'Glass', 'Wood', 'Fiber', 'Stone'],
          },
          {
            name: 'Diameter',
            type: AttributeType.NUMBER,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 1,
            minValue: 1,
            maxValue: 100,
            unit: 'cm',
          },
          {
            name: 'Height',
            type: AttributeType.NUMBER,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 2,
            minValue: 1,
            maxValue: 100,
            unit: 'cm',
          },
          {
            name: 'Color',
            type: AttributeType.COLOR,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 3,
            options: ['White', 'Black', 'Brown', 'Green', 'Blue', 'Red', 'Yellow', 'Gray', 'Natural'],
            allowCustom: true,
          },
          {
            name: 'Drainage Holes',
            type: AttributeType.BOOLEAN,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 4,
          },
          {
            name: 'Style',
            type: AttributeType.SELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 5,
            options: ['Modern', 'Traditional', 'Rustic', 'Minimalist', 'Decorative', 'Hanging'],
          },
          {
            name: 'Indoor/Outdoor',
            type: AttributeType.RADIO,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 6,
            options: ['Indoor', 'Outdoor', 'Both'],
          },
        ],
      },
    },
  });

  // 3. Care Essentials Attribute Set
  const careAttributeSet = await prisma.attributeSet.create({
    data: {
      name: 'Care Essentials Attributes',
      description: 'Attributes for watering cans, fertilizers, and care products',
      isActive: true,
      attributes: {
        create: [
          {
            name: 'Product Type',
            type: AttributeType.SELECT,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 0,
            options: ['Watering Can', 'Fertilizer', 'Pesticide', 'Growth Hormone', 'Soil Mix', 'Misting Bottle'],
          },
          {
            name: 'Volume',
            type: AttributeType.NUMBER,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 1,
            minValue: 0.1,
            maxValue: 50,
            unit: 'L',
          },
          {
            name: 'Weight',
            type: AttributeType.NUMBER,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 2,
            minValue: 0.1,
            maxValue: 10,
            unit: 'kg',
          },
          {
            name: 'Nutrient Content',
            type: AttributeType.TEXT,
            isRequired: false,
            isSearchable: true,
            isFilterable: false,
            sortOrder: 3,
            maxLength: 50,
          },
          {
            name: 'Application Frequency',
            type: AttributeType.SELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 4,
            options: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Seasonal'],
          },
          {
            name: 'Organic',
            type: AttributeType.BOOLEAN,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 5,
          },
          {
            name: 'Target Plants',
            type: AttributeType.MULTISELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 6,
            options: ['Orchids', 'General Houseplants', 'Succulents', 'Tropical Plants', 'All Plants'],
          },
        ],
      },
    },
  });

  // 4. Accessories & Tools Attribute Set
  const toolsAttributeSet = await prisma.attributeSet.create({
    data: {
      name: 'Accessories & Tools Attributes',
      description: 'Attributes for gardening tools and accessories',
      isActive: true,
      attributes: {
        create: [
          {
            name: 'Tool Type',
            type: AttributeType.SELECT,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 0,
            options: ['Pruning Shears', 'Watering Tool', 'Soil Tool', 'Measuring Tool', 'Support Tool', 'Cleaning Tool'],
          },
          {
            name: 'Material',
            type: AttributeType.SELECT,
            isRequired: true,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 1,
            options: ['Stainless Steel', 'Carbon Steel', 'Plastic', 'Wood', 'Aluminum', 'Copper'],
          },
          {
            name: 'Size',
            type: AttributeType.SELECT,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 2,
            options: ['Small', 'Medium', 'Large', 'Extra Large'],
          },
          {
            name: 'Handle Length',
            type: AttributeType.NUMBER,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 3,
            minValue: 5,
            maxValue: 100,
            unit: 'cm',
          },
          {
            name: 'Color',
            type: AttributeType.COLOR,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 4,
            options: ['Silver', 'Black', 'Red', 'Green', 'Blue', 'Yellow', 'Orange'],
            allowCustom: true,
          },
          {
            name: 'Ergonomic',
            type: AttributeType.BOOLEAN,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 5,
          },
          {
            name: 'Indoor/Outdoor',
            type: AttributeType.RADIO,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 6,
            options: ['Indoor', 'Outdoor', 'Both'],
          },
          {
            name: 'Warranty',
            type: AttributeType.NUMBER,
            isRequired: false,
            isSearchable: true,
            isFilterable: true,
            sortOrder: 7,
            minValue: 0,
            maxValue: 10,
            unit: 'years',
          },
        ],
      },
    },
  });

  console.log('✅ Created attribute sets:');
  console.log(`   - ${orchidAttributeSet.name} (${orchidAttributeSet.id})`);
  console.log(`   - ${potAttributeSet.name} (${potAttributeSet.id})`);
  console.log(`   - ${careAttributeSet.name} (${careAttributeSet.id})`);
  console.log(`   - ${toolsAttributeSet.name} (${toolsAttributeSet.id})`);

  // Get all attribute sets for reference
  const attributeSets = await prisma.attributeSet.findMany({
    include: {
      attributes: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  console.log('\n📋 Attribute Sets Summary:');
  for (const set of attributeSets) {
    console.log(`\n   ${set.name}:`);
    console.log(`   - Description: ${set.description}`);
    console.log(`   - Attributes: ${set.attributes.length}`);
    set.attributes.forEach(attr => {
      console.log(`     • ${attr.name} (${attr.type}) - Required: ${attr.isRequired}, Searchable: ${attr.isSearchable}, Filterable: ${attr.isFilterable}`);
    });
  }

  console.log('\n🎉 Attribute system seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 