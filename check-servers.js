const http = require('http');
const https = require('https');

const servers = [
  { name: 'Frontend (Next.js)', url: 'http://localhost:3000', port: 3000 },
  { name: 'Backend (NestJS)', url: 'http://localhost:3001', port: 3001 },
  { name: 'Backend API Health', url: 'http://localhost:3001/api/health', port: 3001 },
  { name: 'Backend CORS Test', url: 'http://localhost:3001/api/cors-test', port: 3001 },
];

async function checkServer(server) {
  return new Promise((resolve) => {
    const client = server.url.startsWith('https') ? https : http;
    
    const req = client.get(server.url, (res) => {
      console.log(`✅ ${server.name}: ${res.statusCode} - ${res.statusMessage}`);
      resolve({ server: server.name, status: 'success', code: res.statusCode });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${server.name}: ${err.message}`);
      resolve({ server: server.name, status: 'error', error: err.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${server.name}: Timeout`);
      req.destroy();
      resolve({ server: server.name, status: 'timeout' });
    });
  });
}

async function checkAllServers() {
  console.log('🔍 Checking server status...\n');
  
  const results = await Promise.all(servers.map(checkServer));
  
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');
  
  console.log(`✅ Working: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n🚨 Failed servers:');
    failed.forEach(f => {
      console.log(`   - ${f.server}: ${f.error || 'timeout'}`);
    });
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Start backend: cd cattleya-backend && npm run start:dev');
    console.log('3. Start frontend: cd cattleya-app && npm run dev:fast');
    console.log('4. Check if ports 3000 and 3001 are available');
  } else {
    console.log('\n🎉 All servers are running successfully!');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:3001');
    console.log('📚 API Docs: http://localhost:3001/api/docs');
  }
}

// Check if ports are in use
function checkPorts() {
  console.log('🔍 Checking port availability...\n');
  
  servers.forEach(server => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(2000);
    
    socket.on('connect', () => {
      console.log(`✅ Port ${server.port}: In use (${server.name})`);
      socket.destroy();
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Port ${server.port}: Available (${server.name} not running)`);
      socket.destroy();
    });
    
    socket.on('error', () => {
      console.log(`❌ Port ${server.port}: Available (${server.name} not running)`);
    });
    
    socket.connect(server.port, 'localhost');
  });
}

// Run checks
console.log('🌺 Cattleya Server Status Checker\n');
console.log('=' .repeat(50));

setTimeout(() => {
  checkPorts();
  
  setTimeout(() => {
    console.log('\n' + '=' .repeat(50));
    checkAllServers();
  }, 3000);
}, 1000); 