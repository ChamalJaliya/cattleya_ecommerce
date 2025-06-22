#!/bin/bash

# Cattleya E-commerce AWS Deployment Script
# This script deploys the entire infrastructure to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All prerequisites are installed."
}

# Check AWS credentials
check_aws_credentials() {
    print_status "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS credentials are configured."
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    
    cd deployment/terraform
    
    # Create S3 bucket for Terraform state if it doesn't exist
    BUCKET_NAME="cattleya-terraform-state"
    if ! aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
        print_status "Creating S3 bucket for Terraform state..."
        aws s3 mb "s3://$BUCKET_NAME" --region us-east-1
        aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled
        aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    fi
    
    terraform init
    print_success "Terraform initialized successfully."
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_error "terraform.tfvars file not found. Please create it with your configuration."
        exit 1
    fi
    
    # Plan the deployment
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan
    
    # Ask for confirmation
    read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled."
        exit 0
    fi
    
    # Apply the deployment
    print_status "Applying Terraform deployment..."
    terraform apply tfplan
    
    print_success "Infrastructure deployed successfully."
}

# Build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    # Get ECR repository URL
    ECR_REPO_URL=$(terraform output -raw ecr_repository_url)
    
    # Login to ECR
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPO_URL
    
    # Build image
    cd ../../cattleya-backend
    docker build -t $ECR_REPO_URL:latest .
    
    # Push image
    docker push $ECR_REPO_URL:latest
    
    print_success "Docker image built and pushed successfully."
}

# Deploy application
deploy_application() {
    print_status "Deploying application..."
    
    # Update ECS service
    CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
    SERVICE_NAME=$(terraform output -raw ecs_service_name)
    
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment
    
    print_success "Application deployed successfully."
}

# Wait for deployment to complete
wait_for_deployment() {
    print_status "Waiting for deployment to complete..."
    
    CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
    SERVICE_NAME=$(terraform output -raw ecs_service_name)
    
    aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME
    
    print_success "Deployment completed successfully."
}

# Display deployment information
show_deployment_info() {
    print_status "Deployment Information:"
    echo
    
    ALB_DNS=$(terraform output -raw alb_dns_name)
    CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain)
    
    echo "Load Balancer DNS: $ALB_DNS"
    echo "CloudFront Domain: $CLOUDFRONT_DOMAIN"
    echo "ECS Cluster: $(terraform output -raw ecs_cluster_name)"
    echo "ECS Service: $(terraform output -raw ecs_service_name)"
    echo
    
    print_success "Deployment completed! Your application should be available at:"
    echo "Backend API: http://$ALB_DNS"
    echo "Media CDN: https://$CLOUDFRONT_DOMAIN"
}

# Main deployment function
main() {
    echo "🚀 Cattleya E-commerce AWS Deployment"
    echo "====================================="
    echo
    
    check_prerequisites
    check_aws_credentials
    init_terraform
    deploy_infrastructure
    build_and_push_image
    deploy_application
    wait_for_deployment
    show_deployment_info
}

# Run main function
main "$@" 