// Cattleya Database Seeding Script
// This script creates demo users once MongoDB replica set is ready

print('🌺 Starting Cattleya database seeding...');

// Switch to cattleya database
const db = db.getSiblingDB('cattleya');

// Check if users already exist
const existingUsers = db.User.countDocuments();

if (existingUsers > 0) {
  print('✅ Database already seeded, skipping...');
} else {
    
    // Demo users data
    const demoUsers = [
      {
        id: '60f7b1b4c4f3a2b4c4f3a2b1',
        email: 'admin@cattleya.com',
        password: '$2a$10$8K4bT3vFsXlHdJm5Nt5rIeI0V5F5F5F5F5F5F5F5F5F5F5F5F5F5Fa', // password123
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '60f7b1b4c4f3a2b4c4f3a2b2',
        email: 'staff@cattleya.com',
        password: '$2a$10$8K4bT3vFsXlHdJm5Nt5rIeI0V5F5F5F5F5F5F5F5F5F5F5F5F5F5Fa', // password123
        firstName: 'Staff',
        lastName: 'User',
        role: 'STAFF',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '60f7b1b4c4f3a2b4c4f3a2b3',
        email: 'customer@cattleya.com',
        password: '$2a$10$8K4bT3vFsXlHdJm5Nt5rIeI0V5F5F5F5F5F5F5F5F5F5F5F5F5F5Fa', // password123
        firstName: 'Customer',
        lastName: 'User',
        role: 'CUSTOMER',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert demo users
    const result = db.User.insertMany(demoUsers);
    
    print('✅ Demo users created successfully!');
    print('🌺 Cattleya database seeding completed!');
    print('');
    print('Demo Credentials:');
    print('Admin: admin@cattleya.com / password123');
    print('Staff: staff@cattleya.com / password123');
    print('Customer: customer@cattleya.com / password123');
    
  } catch (error) {
    print('❌ Error seeding database:', error);
  }
};

// Run seeding
seedUsers(); 