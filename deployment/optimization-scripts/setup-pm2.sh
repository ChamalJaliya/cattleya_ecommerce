#!/bin/bash

# PM2 Setup Script for Cattleya Backend
# Run this script on your EC2 instance

echo "🚀 Setting up PM2 for Cattleya Backend..."

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cattleya-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000,
    shutdown_with_message: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Create PM2 startup script
pm2 startup ubuntu

# Build the application
echo "🔨 Building the application..."
npm run build

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss

echo "✅ PM2 setup completed successfully!"
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Useful PM2 commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart all applications"
echo "   pm2 stop all        - Stop all applications"
echo "   pm2 delete all      - Delete all applications"
echo "   pm2 monit           - Monitor applications" 