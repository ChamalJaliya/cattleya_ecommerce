// MongoDB Replica Set Initialization Script
try {
  print('🌺 Initializing MongoDB Replica Set for Cattleya...');
  
  const config = {
    _id: 'rs0',
    version: 1,
    members: [
      {
        _id: 0,
        host: 'mongodb:27017',
        priority: 1
      }
    ]
  };
  
  // Initialize replica set
  rs.initiate(config);
  
  print('✅ Replica set initialized successfully!');
  print('🌺 Cattleya MongoDB is ready for transactions!');
} catch (error) {
  print('❌ Error initializing replica set:', error);
} 