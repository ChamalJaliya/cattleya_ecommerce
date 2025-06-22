#!/bin/bash

# 🌱 Cattleya Frontend Deployment (Budget-Friendly)
# This script deploys the frontend to AWS Amplify

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

# Configuration
APP_NAME="cattleya-frontend"
ENVIRONMENT="production"
REGION="us-east-1"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v amplify &> /dev/null; then
        print_error "AWS Amplify CLI is not installed. Please install it first:"
        echo "npm install -g @aws-amplify/cli"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed."
}

# Initialize Amplify project
init_amplify() {
    print_status "Initializing Amplify project..."
    
    cd ../../cattleya-app
    
    # Check if amplify is already initialized
    if [ -d ".amplify" ]; then
        print_warning "Amplify project already initialized."
        return
    fi
    
    # Initialize Amplify
    amplify init \
        --app $APP_NAME \
        --envName $ENVIRONMENT \
        --defaultEditor code \
        --framework react \
        --yes
    
    print_success "Amplify project initialized."
}

# Add hosting
add_hosting() {
    print_status "Adding hosting to Amplify project..."
    
    # Check if hosting is already added
    if amplify status | grep -q "hosting"; then
        print_warning "Hosting already added to Amplify project."
        return
    fi
    
    # Add hosting
    amplify add hosting \
        --envName $ENVIRONMENT \
        --appId $(amplify status --json | jq -r '.amplify.appId') \
        --yes
    
    print_success "Hosting added to Amplify project."
}

# Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."
    
    # Create environment file
    cat > .env.production << 'EOF'
# Backend API URL (update with your backend URL)
NEXT_PUBLIC_API_URL=http://your-backend-ip:3001

# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=cattleya-app-uploads

# Stripe Configuration (if using)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Feature flags
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_COMPARISON=true
EOF

    print_success "Environment variables configured."
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    # Install dependencies
    npm install
    
    # Build the application
    npm run build
    
    print_success "Application built successfully."
}

# Deploy to Amplify
deploy_to_amplify() {
    print_status "Deploying to AWS Amplify..."
    
    # Publish to Amplify
    amplify publish \
        --envName $ENVIRONMENT \
        --yes
    
    print_success "Application deployed to Amplify."
}

# Setup custom domain (optional)
setup_custom_domain() {
    print_status "Setting up custom domain (optional)..."
    
    read -p "Do you want to set up a custom domain? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your domain name (e.g., cattleya.com): " DOMAIN_NAME
        
        if [ -n "$DOMAIN_NAME" ]; then
            # Add custom domain
            amplify add custom-domain \
                --domainName $DOMAIN_NAME \
                --envName $ENVIRONMENT
            
            print_success "Custom domain configured: $DOMAIN_NAME"
            print_warning "You'll need to update your DNS records as shown in the output above."
        fi
    else
        print_status "Skipping custom domain setup."
    fi
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Add analytics (optional)
    read -p "Do you want to add analytics? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        amplify add analytics \
            --envName $ENVIRONMENT \
            --yes
        
        print_success "Analytics added to the project."
    else
        print_status "Skipping analytics setup."
    fi
}

# Display deployment info
show_deployment_info() {
    print_status "Frontend Deployment Information:"
    echo
    
    # Get Amplify app info
    APP_ID=$(amplify status --json | jq -r '.amplify.appId')
    APP_URL=$(aws amplify get-app --app-id $APP_ID --region $REGION --query 'app.defaultDomain' --output text)
    
    echo "Amplify App ID: $APP_ID"
    echo "Application URL: https://$APP_URL"
    echo
    print_success "Frontend deployed successfully!"
    echo
    echo "Next steps:"
    echo "1. Update your backend API URL in the environment variables"
    echo "2. Test the application at https://$APP_URL"
    echo "3. Set up custom domain if needed"
    echo "4. Configure CI/CD for automatic deployments"
    echo "5. Set up monitoring and analytics"
}

# Setup CI/CD (optional)
setup_cicd() {
    print_status "Setting up CI/CD (optional)..."
    
    read -p "Do you want to set up CI/CD with GitHub? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Connect to GitHub repository
        amplify console \
            --envName $ENVIRONMENT
        
        print_success "CI/CD setup initiated. Follow the instructions in the browser."
        print_warning "You'll need to connect your GitHub repository and configure build settings."
    else
        print_status "Skipping CI/CD setup."
    fi
}

# Main deployment function
main() {
    echo "🌱 Cattleya Frontend Deployment (Budget-Friendly)"
    echo "================================================="
    echo
    
    check_prerequisites
    init_amplify
    add_hosting
    configure_environment
    build_application
    deploy_to_amplify
    setup_custom_domain
    setup_monitoring
    show_deployment_info
    setup_cicd
    
    echo
    print_success "Frontend deployment complete!"
    echo
    echo "💰 Cost Breakdown:"
    echo "- AWS Amplify: Free tier (1,000 build minutes/month)"
    echo "- Data Transfer: Free tier (15GB/month)"
    echo "- Storage: Free tier (5GB)"
    echo "- Total: $0/month (within free tier limits)"
}

# Run main function
main "$@" 