#!/bin/bash

# Docker Installation Script for Amazon Linux 2
# This script installs Docker and Docker Compose on the EC2 instance

set -e

echo "🐳 Installing Docker on Amazon Linux 2..."

# Update system
yum update -y

# Install Docker
yum install -y docker

# Start and enable Docker service
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -a -G docker ec2-user

# Install Docker Compose
echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create symbolic link
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installation
echo "✅ Docker installation complete!"
echo "Docker version:"
docker --version
echo "Docker Compose version:"
docker-compose --version

# Create docker-compose.yml for Cattleya
cat > /opt/cattleya/docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: ./cattleya-backend
    container_name: cattleya-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - S3_BUCKET=${S3_BUCKET}
      - AWS_REGION=${AWS_REGION}
    volumes:
      - ./cattleya-backend:/app
      - /app/node_modules
    networks:
      - cattleya-network

  nginx:
    image: nginx:alpine
    container_name: cattleya-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - cattleya-network

networks:
  cattleya-network:
    driver: bridge
EOF

echo "📋 Docker Compose file created at /opt/cattleya/docker-compose.yml"

# Create nginx configuration
cat > /opt/cattleya/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

echo "📋 Nginx configuration created at /opt/cattleya/nginx.conf"

# Create SSL directory
mkdir -p /opt/cattleya/ssl

echo "🔒 SSL directory created at /opt/cattleya/ssl"

# Set proper permissions
chown -R ec2-user:ec2-user /opt/cattleya

echo "✅ Docker setup complete! You can now use Docker and Docker Compose."
echo "📝 To start the application:"
echo "   cd /opt/cattleya"
echo "   docker-compose up -d" 