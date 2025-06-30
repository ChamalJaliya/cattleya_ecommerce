import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAttributes() {
  try {
    console.log('🧹 Cleaning up attributes collection...');
    
    // Delete all attributes
    const deleteResult = await prisma.attribute.deleteMany({});
    
    console.log(`✅ Deleted ${deleteResult.count} attributes`);
    
    // Also clean up attribute sets to start fresh
    const deleteSetsResult = await prisma.attributeSet.deleteMany({});
    
    console.log(`✅ Deleted ${deleteSetsResult.count} attribute sets`);
    
    console.log('🎉 Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAttributes(); 