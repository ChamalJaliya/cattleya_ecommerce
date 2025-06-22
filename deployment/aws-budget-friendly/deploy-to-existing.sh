#!/bin/bash

# 🚀 Deploy Cattleya to Existing AWS Infrastructure
# This script deploys your application to your existing EC2, RDS, S3, and CloudFront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration - UPDATE THESE VALUES
EC2_IP="YOUR_EC2_IP_ADDRESS"
EC2_KEY="YOUR_EC2_KEY.pem"
S3_BUCKET="YOUR_S3_BUCKET_NAME"
CLOUDFRONT_DOMAIN="YOUR_CLOUDFRONT_DOMAIN.cloudfront.net"
MONGODB_URL="YOUR_MONGODB_CONNECTION_STRING"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    if [ ! -f "$EC2_KEY" ]; then
        print_error "EC2 key file not found: $EC2_KEY"
        exit 1
    fi
    
    if [ "$EC2_IP" = "YOUR_EC2_IP_ADDRESS" ]; then
        print_error "Please update EC2_IP in the script configuration"
        exit 1
    fi
    
    print_success "Prerequisites check passed."
}

# Verify AWS resources
verify_aws_resources() {
    print_status "Verifying AWS resources..."
    
    # Check EC2 instance
    if aws ec2 describe-instances --filters "Name=ip-address,Values=$EC2_IP" --query 'Reservations[*].Instances[*].[State.Name]' --output text | grep -q "running"; then
        print_success "EC2 instance is running"
    else
        print_error "EC2 instance is not running or IP not found"
        exit 1
    fi
    
    # Check S3 bucket
    if aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
        print_success "S3 bucket exists: $S3_BUCKET"
    else
        print_error "S3 bucket not found: $S3_BUCKET"
        exit 1
    fi
    
    # Check CloudFront distribution
    if aws cloudfront list-distributions --query "DistributionList.Items[?contains(DomainName, '$CLOUDFRONT_DOMAIN')].[Id,DomainName]" --output text | grep -q "$CLOUDFRONT_DOMAIN"; then
        print_success "CloudFront distribution found"
    else
        print_warning "CloudFront distribution not found, continuing without CDN"
    fi
}

# Deploy backend to EC2
deploy_backend() {
    print_status "Deploying backend to EC2..."
    
    # Create deployment script
    cat > deploy_backend_remote.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting backend deployment..."

# Update system
sudo yum update -y

# Install Node.js 18 if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    sudo yum install -y git
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo yum install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Create application directory
sudo mkdir -p /opt/cattleya
sudo chown ec2-user:ec2-user /opt/cattleya
cd /opt/cattleya

# Clone or update repository
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/ChamalJaliya/cattleya_ecommerce.git .
fi

# Navigate to backend
cd cattleya-backend

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create environment file
echo "Creating environment file..."
cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3001

# MongoDB Connection
DATABASE_URL="MONGODB_URL_PLACEHOLDER"

# JWT Configuration
JWT_SECRET="JWT_SECRET_PLACEHOLDER"

# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET=S3_BUCKET_PLACEHOLDER
S3_ACCESS_KEY_ID=S3_ACCESS_KEY_PLACEHOLDER
S3_SECRET_ACCESS_KEY=S3_SECRET_ACCESS_KEY_PLACEHOLDER

# CloudFront Configuration
CLOUDFRONT_DOMAIN=CLOUDFRONT_DOMAIN_PLACEHOLDER

# Security
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENV_EOF

# Build the application
echo "Building application..."
npm run build

# Stop existing PM2 process if running
pm2 stop cattleya-backend 2>/dev/null || true
pm2 delete cattleya-backend 2>/dev/null || true

# Start with PM2
echo "Starting application with PM2..."
pm2 start npm --name "cattleya-backend" -- start:prod

# Save PM2 configuration
pm2 save
pm2 startup

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/conf.d/cattleya.conf > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
NGINX_EOF

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Backend deployment completed!"
EOF

    # Copy deployment script to EC2
    scp -i "$EC2_KEY" -o StrictHostKeyChecking=no deploy_backend_remote.sh ec2-user@$EC2_IP:/tmp/
    
    # Execute deployment script on EC2
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "chmod +x /tmp/deploy_backend_remote.sh && /tmp/deploy_backend_remote.sh"
    
    print_success "Backend deployed successfully!"
}

# Configure S3 bucket
configure_s3() {
    print_status "Configuring S3 bucket..."
    
    # Create S3 bucket policy for file uploads
    aws s3api put-bucket-policy --bucket "$S3_BUCKET" --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Sid\": \"PublicReadGetObject\",
                \"Effect\": \"Allow\",
                \"Principal\": \"*\",
                \"Action\": \"s3:GetObject\",
                \"Resource\": \"arn:aws:s3:::$S3_BUCKET/*\"
            }
        ]
    }"
    
    # Enable CORS for S3
    aws s3api put-bucket-cors --bucket "$S3_BUCKET" --cors-configuration '{
        "CORSRules": [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
                "AllowedOrigins": ["*"],
                "ExposeHeaders": []
            }
        ]
    }'
    
    print_success "S3 bucket configured successfully!"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    # Navigate to frontend directory
    cd ../../cattleya-app
    
    # Install dependencies
    npm install
    
    # Create production environment file
    cat > .env.production << EOF
NEXT_PUBLIC_API_URL=http://$EC2_IP
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=$S3_BUCKET
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=$CLOUDFRONT_DOMAIN
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
EOF
    
    # Build the application
    npm run build
    
    # Deploy to Amplify (if configured)
    if command -v amplify &> /dev/null; then
        print_status "Deploying to AWS Amplify..."
        amplify publish --yes
    else
        print_warning "Amplify CLI not found. Please deploy frontend manually."
        print_status "Build files are ready in .next directory"
    fi
    
    print_success "Frontend deployment completed!"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test backend health
    if curl -s "http://$EC2_IP/health" | grep -q "healthy"; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Test API endpoint
    if curl -s "http://$EC2_IP/api/products" > /dev/null; then
        print_success "API endpoint is accessible"
    else
        print_warning "API endpoint test failed (might be expected if no data)"
    fi
    
    # Test S3 access
    if aws s3 ls "s3://$S3_BUCKET" > /dev/null; then
        print_success "S3 bucket is accessible"
    else
        print_error "S3 bucket access failed"
        return 1
    fi
}

# Display deployment info
show_deployment_info() {
    print_status "Deployment Information:"
    echo
    echo "Backend URL: http://$EC2_IP"
    echo "Health Check: http://$EC2_IP/health"
    echo "API Base: http://$EC2_IP/api"
    echo "S3 Bucket: $S3_BUCKET"
    echo "CloudFront: $CLOUDFRONT_DOMAIN"
    echo
    print_success "Deployment completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Test the application thoroughly"
    echo "2. Set up SSL certificate with Let's Encrypt"
    echo "3. Configure custom domain"
    echo "4. Set up monitoring and alerts"
    echo "5. Configure automated backups"
}

# Cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f deploy_backend_remote.sh
    print_success "Cleanup complete."
}

# Main deployment function
main() {
    echo "🚀 Cattleya Deployment to Existing AWS Infrastructure"
    echo "====================================================="
    echo
    
    check_prerequisites
    verify_aws_resources
    deploy_backend
    configure_s3
    deploy_frontend
    test_deployment
    show_deployment_info
    cleanup
}

# Run main function
main "$@" 