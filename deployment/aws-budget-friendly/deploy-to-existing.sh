#!/bin/bash

# 🌱 Cattleya Deployment to Existing AWS Infrastructure
# This script deploys your application to your existing EC2, S3, and CloudFront

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
MONGODB_URL="YOUR_MONGODB_CONNECTION_STRING"  # MongoDB Atlas or local MongoDB

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
    
    # Note: MongoDB will be set up separately (Atlas or local on EC2)
    print_status "MongoDB will be configured separately (Atlas or local installation)"
}

# Deploy backend to EC2
deploy_backend() {
    print_status "Deploying backend to EC2..."
    
    # Create deployment script
    cat > deploy-backend-remote.sh << 'EOF'
#!/bin/bash
set -e

# Update system
sudo yum update -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
fi

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Create application directory
sudo mkdir -p /opt/cattleya
sudo chown ec2-user:ec2-user /opt/cattleya
cd /opt/cattleya

# Clone or update repository
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/your-username/Cattleya_E.git .
fi

# Deploy backend
cd cattleya-backend

# Install dependencies
npm install

# Build application
npm run build

# Create environment file
cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=MONGODB_URL_PLACEHOLDER
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
S3_BUCKET=S3_BUCKET_PLACEHOLDER
AWS_REGION=us-east-1
CORS_ORIGIN=https://yourdomain.com
ENV_EOF

# Replace placeholders
sed -i "s|MONGODB_URL_PLACEHOLDER|$MONGODB_URL|g" .env
sed -i "s|S3_BUCKET_PLACEHOLDER|$S3_BUCKET|g" .env

# Start application with PM2
pm2 delete cattleya-backend 2>/dev/null || true
pm2 start npm --name "cattleya-backend" -- start:prod
pm2 save
pm2 startup

# Setup Nginx if not installed
if ! command -v nginx &> /dev/null; then
    sudo yum install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Configure Nginx
sudo tee /etc/nginx/conf.d/cattleya.conf > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    
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
    }
}
NGINX_EOF

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "Backend deployment complete!"
EOF

    # Copy script to EC2
    scp -i "$EC2_KEY" -o StrictHostKeyChecking=no deploy-backend-remote.sh ec2-user@$EC2_IP:/tmp/
    
    # Execute script on EC2
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "chmod +x /tmp/deploy-backend-remote.sh && MONGODB_URL='$MONGODB_URL' S3_BUCKET='$S3_BUCKET' /tmp/deploy-backend-remote.sh"
    
    # Clean up local script
    rm deploy-backend-remote.sh
    
    print_success "Backend deployed successfully!"
}

# Deploy frontend to Amplify
deploy_frontend() {
    print_status "Deploying frontend to Amplify..."
    
    # Check if Amplify CLI is installed
    if ! command -v amplify &> /dev/null; then
        print_error "AWS Amplify CLI is not installed. Please install it first: npm install -g @aws-amplify/cli"
        exit 1
    fi
    
    # Navigate to frontend directory
    cd ../../cattleya-app
    
    # Initialize Amplify if not already done
    if [ ! -d "amplify" ]; then
        print_status "Initializing Amplify..."
        amplify init --yes
    fi
    
    # Add hosting if not already done
    if ! amplify status | grep -q "hosting"; then
        print_status "Adding hosting..."
        amplify add hosting --yes
    fi
    
    # Create environment file
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://$EC2_IP:3001
NEXT_PUBLIC_S3_BUCKET=$S3_BUCKET
NEXT_PUBLIC_AWS_REGION=us-east-1
EOF
    
    # Build and publish
    print_status "Building and publishing frontend..."
    amplify publish --yes
    
    print_success "Frontend deployed successfully!"
}

# Setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Create SSL setup script
    cat > setup-ssl-remote.sh << 'EOF'
#!/bin/bash
set -e

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    sudo yum install -y certbot python3-certbot-nginx
fi

# Get domain from user
read -p "Enter your domain name (e.g., cattleya.com): " DOMAIN
read -p "Enter your email address: " EMAIL

# Obtain SSL certificate
sudo certbot --nginx -d $DOMAIN --email $EMAIL --non-interactive --agree-tos

# Setup auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "SSL certificate setup complete!"
EOF

    # Copy script to EC2
    scp -i "$EC2_KEY" -o StrictHostKeyChecking=no setup-ssl-remote.sh ec2-user@$EC2_IP:/tmp/
    
    # Execute script on EC2
    ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "chmod +x /tmp/setup-ssl-remote.sh && /tmp/setup-ssl-remote.sh"
    
    # Clean up local script
    rm setup-ssl-remote.sh
    
    print_success "SSL certificate setup complete!"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test backend health
    if curl -s "http://$EC2_IP:3001/health" | grep -q "ok"; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Test frontend (if Amplify URL is available)
    AMPLIFY_URL=$(amplify status --json | jq -r '.hosting.amplifyhosting.url' 2>/dev/null || echo "")
    if [ -n "$AMPLIFY_URL" ]; then
        if curl -s "$AMPLIFY_URL" | grep -q "Cattleya"; then
            print_success "Frontend is accessible"
        else
            print_warning "Frontend accessibility check failed"
        fi
    fi
    
    print_success "Deployment testing complete!"
}

# Main deployment function
main() {
    echo "🌱 Cattleya Deployment to Existing AWS Infrastructure"
    echo "====================================================="
    echo ""
    
    check_prerequisites
    verify_aws_resources
    
    echo ""
    print_status "Starting deployment..."
    
    deploy_backend
    deploy_frontend
    
    echo ""
    print_status "Deployment completed! Setting up SSL certificate..."
    setup_ssl
    
    echo ""
    print_status "Testing deployment..."
    test_deployment
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Deployment Summary:"
    echo "======================"
    echo "Backend URL: http://$EC2_IP:3001"
    echo "Frontend URL: $(amplify status --json | jq -r '.hosting.amplifyhosting.url' 2>/dev/null || echo 'Check Amplify console')"
    echo "S3 Bucket: $S3_BUCKET"
    echo "CloudFront: $CLOUDFRONT_DOMAIN"
    echo ""
    echo "🔧 Next Steps:"
    echo "=============="
    echo "1. Update your domain DNS records"
    echo "2. Configure environment variables"
    echo "3. Set up monitoring and alerts"
    echo "4. Test all application features"
    echo "5. Monitor costs and performance"
    echo ""
    echo "📚 Documentation:"
    echo "================="
    echo "- MongoDB Setup: mongodb-setup.md"
    echo "- Deployment Checklist: DEPLOYMENT_CHECKLIST.md"
    echo "- Quick Start Guide: QUICK_START.md"
    echo ""
    echo "💰 Estimated Monthly Cost: $15-35"
}

# Run main function
main "$@" 