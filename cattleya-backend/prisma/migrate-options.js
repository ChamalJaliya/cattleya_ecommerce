const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateOptions() {
  try {
    console.log('Starting options migration...');
    
    // Get all attributes that have options
    const attributes = await prisma.attribute.findMany({
      where: {
        options: {
          not: []
        }
      }
    });

    console.log(`Found ${attributes.length} attributes with options to migrate`);

    for (const attribute of attributes) {
      const currentOptions = attribute.options;
      
      // Skip if already in new format
      if (Array.isArray(currentOptions) && currentOptions.length > 0 && currentOptions[0].label) {
        console.log(`Skipping ${attribute.name} - already in new format`);
        continue;
      }

      // Convert old format to new format
      let newOptions = [];
      
      if (Array.isArray(currentOptions)) {
        newOptions = currentOptions.map((option, index) => {
          if (typeof option === 'string') {
            return {
              value: option.toLowerCase().replace(/\s+/g, '_'),
              label: option,
              isDefault: index === 0 // First option as default
            };
          }
          return option;
        });
      }

      // Update the attribute
      await prisma.attribute.update({
        where: { id: attribute.id },
        data: { options: newOptions }
      });

      console.log(`Migrated ${attribute.name}: ${currentOptions.length} options`);
    }

    console.log('Options migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateOptions(); 