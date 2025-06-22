# 🚀 Cattleya E-commerce AWS Deployment Guide

## Table of Contents
1. [Domain Setup](#domain-setup)
2. [Infrastructure as Code (Terraform)](#infrastructure-as-code)
3. [Backend Deployment (ECS)](#backend-deployment)
4. [Frontend Deployment (Amplify)](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [S3 Bucket Configuration](#s3-configuration)
7. [Messaging Services](#messaging-services)
8. [Payment Integration](#payment-integration)
9. [Security & Monitoring](#security-monitoring)
10. [CI/CD Pipeline](#cicd-pipeline)

## Domain Setup

### 1. Purchase Domain
```bash
# Recommended domains:
# - cattleya.com (main domain)
# - shop.cattleya.com (store frontend)
# - api.cattleya.com (backend API)
```

### 2. Route 53 Configuration
```yaml
# Route 53 Hosted Zone
HostedZone:
  Name: cattleya.com
  Type: Public

# DNS Records
Records:
  - Name: api.cattleya.com
    Type: A
    Alias: true
    Target: ALB-ARN
  
  - Name: shop.cattleya.com
    Type: A
    Alias: true
    Target: CloudFront-Distribution
  
  - Name: cattleya.com
    Type: A
    Alias: true
    Target: CloudFront-Distribution
```

## Infrastructure as Code

### Terraform Configuration
```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC Configuration
resource "aws_vpc" "cattleya_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "cattleya-vpc"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.cattleya_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "cattleya-public-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.cattleya_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "cattleya-private-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.cattleya_vpc.id

  tags = {
    Name = "cattleya-igw"
  }
}

# NAT Gateway
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "cattleya-nat"
  }
}

# Elastic IP for NAT
resource "aws_eip" "nat" {
  domain = "vpc"
}
```

## Backend Deployment (ECS)

### Dockerfile for Backend
```dockerfile
# cattleya-backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
CMD ["npm", "run", "start:prod"]
```

### ECS Task Definition
```json
{
  "family": "cattleya-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/cattleya-task-role",
  "containerDefinitions": [
    {
      "name": "cattleya-backend",
      "image": "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/cattleya-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "mongodb://documentdb-cluster:27017/cattleya"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:cattleya/jwt-secret"
        },
        {
          "name": "STRIPE_SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:cattleya/stripe-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cattleya-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Frontend Deployment (Amplify)

### Amplify Configuration
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Environment Variables
```bash
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=https://api.cattleya.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_S3_BUCKET=cattleya-media
NEXT_PUBLIC_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

## Database Setup

### DocumentDB Cluster
```hcl
# DocumentDB Cluster
resource "aws_docdb_cluster" "cattleya" {
  cluster_identifier      = "cattleya-cluster"
  engine                  = "docdb"
  master_username         = "cattleya_admin"
  master_password         = aws_secretsmanager_secret_version.db_password.secret_string
  db_subnet_group_name    = aws_docdb_subnet_group.cattleya.name
  vpc_security_group_ids  = [aws_security_group.docdb.id]
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Name = "cattleya-docdb-cluster"
  }
}

resource "aws_docdb_cluster_instance" "cattleya" {
  count              = 2
  identifier         = "cattleya-instance-${count.index}"
  cluster_identifier = aws_docdb_cluster.cattleya.id
  instance_class     = "db.t3.medium"
}
```

## S3 Configuration

### S3 Bucket Setup
```hcl
# S3 Bucket for Media
resource "aws_s3_bucket" "cattleya_media" {
  bucket = "cattleya-media-${random_string.bucket_suffix.result}"

  tags = {
    Name = "cattleya-media-bucket"
  }
}

# S3 Bucket Policy
resource "aws_s3_bucket_policy" "cattleya_media_policy" {
  bucket = aws_s3_bucket.cattleya_media.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.cattleya_media.arn}/*"
        Condition = {
          StringEquals = {
            "aws:PrincipalOrgID" = "o-xxxxxxxxxx"
          }
        }
      }
    ]
  })
}

# S3 CORS Configuration
resource "aws_s3_bucket_cors_configuration" "cattleya_media_cors" {
  bucket = aws_s3_bucket.cattleya_media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["https://shop.cattleya.com", "https://cattleya.com"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
```

### CloudFront Distribution
```hcl
# CloudFront Distribution
resource "aws_cloudfront_distribution" "cattleya_media" {
  origin {
    domain_name = aws_s3_bucket.cattleya_media.bucket_regional_domain_name
    origin_id   = "S3-cattleya-media"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cattleya_media.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["media.cattleya.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-cattleya-media"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn           = aws_acm_certificate.cattleya_media.arn
    ssl_support_method            = "sni-only"
    minimum_protocol_version      = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
```

## Messaging Services

### SQS Queues
```hcl
# Order Processing Queue
resource "aws_sqs_queue" "order_processing" {
  name                      = "cattleya-order-processing"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0
  visibility_timeout_seconds = 30

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.order_processing_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name = "cattleya-order-processing"
  }
}

# Dead Letter Queue
resource "aws_sqs_queue" "order_processing_dlq" {
  name = "cattleya-order-processing-dlq"

  tags = {
    Name = "cattleya-order-processing-dlq"
  }
}

# Email Queue
resource "aws_sqs_queue" "email_queue" {
  name                      = "cattleya-email-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 0

  tags = {
    Name = "cattleya-email-queue"
  }
}
```

### SES Configuration
```hcl
# SES Domain Verification
resource "aws_ses_domain_identity" "cattleya" {
  domain = "cattleya.com"
}

# SES DKIM
resource "aws_ses_domain_dkim" "cattleya" {
  domain = aws_ses_domain_identity.cattleya.domain
}

# SES Email Template
resource "aws_ses_template" "order_confirmation" {
  name    = "order-confirmation"
  subject = "Order Confirmation - Cattleya"
  html    = file("${path.module}/templates/order-confirmation.html")
  text    = file("${path.module}/templates/order-confirmation.txt")
}
```

### SNS Topics
```hcl
# Order Notifications Topic
resource "aws_sns_topic" "order_notifications" {
  name = "cattleya-order-notifications"

  tags = {
    Name = "cattleya-order-notifications"
  }
}

# Customer Notifications Topic
resource "aws_sns_topic" "customer_notifications" {
  name = "cattleya-customer-notifications"

  tags = {
    Name = "cattleya-customer-notifications"
  }
}
```

## Payment Integration

### Stripe Configuration
```typescript
// Backend: src/modules/payments/stripe.service.ts
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async createCustomer(email: string, name: string) {
    return await this.stripe.customers.create({
      email,
      name,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }
}
```

### AWS Payment Cryptography
```hcl
# Payment Cryptography Key
resource "aws_paymentcryptography_key" "cattleya_payment" {
  key_attributes {
    key_usage = "TR31_B0_BASE_DERIVATION_KEY"
    key_class = "SYMMETRIC_KEY"
    key_algorithm = "TDES_2KEY"
  }

  tags = {
    Name = "cattleya-payment-key"
  }
}
```

## Security & Monitoring

### WAF Configuration
```hcl
# WAF Web ACL
resource "aws_wafv2_web_acl" "cattleya" {
  name        = "cattleya-web-acl"
  description = "WAF for Cattleya E-commerce"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimit"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "RateLimitRule"
      sampled_requests_enabled  = true
    }
  }

  rule {
    name     = "SQLInjection"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "SQLInjectionRule"
      sampled_requests_enabled  = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "CattleyaWAF"
    sampled_requests_enabled  = true
  }
}
```

### CloudWatch Alarms
```hcl
# High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "cattleya-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.cattleya.name
    ServiceName = aws_ecs_service.cattleya_backend.name
  }
}

# High Memory Alarm
resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "cattleya-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.cattleya.name
    ServiceName = aws_ecs_service.cattleya_backend.name
  }
}
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: cattleya-backend
  ECS_CLUSTER: cattleya-cluster
  ECS_SERVICE: cattleya-backend-service

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment

  deploy-frontend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Deploy to Amplify
      run: |
        aws amplify start-job --app-id ${{ secrets.AMPLIFY_APP_ID }} --branch-name main --job-type RELEASE
```

## Deployment Checklist

### Pre-deployment
- [ ] Purchase domain name
- [ ] Set up AWS account with billing alerts
- [ ] Configure IAM roles and permissions
- [ ] Set up AWS CLI and Terraform
- [ ] Configure environment variables
- [ ] Set up SSL certificates

### Infrastructure
- [ ] Deploy VPC and networking
- [ ] Set up DocumentDB cluster
- [ ] Configure S3 buckets and CloudFront
- [ ] Set up ECS cluster and services
- [ ] Configure load balancers
- [ ] Set up monitoring and alerts

### Application
- [ ] Build and push Docker images
- [ ] Deploy backend to ECS
- [ ] Deploy frontend to Amplify
- [ ] Configure DNS records
- [ ] Test all endpoints
- [ ] Verify SSL certificates

### Post-deployment
- [ ] Set up backup strategies
- [ ] Configure monitoring dashboards
- [ ] Test payment processing
- [ ] Verify email notifications
- [ ] Performance testing
- [ ] Security audit

## Cost Estimation (Monthly)

### Development/Staging
- ECS Fargate: $50-100
- DocumentDB: $100-200
- S3 + CloudFront: $20-50
- Amplify: $15-30
- Route 53: $1-5
- **Total: ~$200-400/month**

### Production
- ECS Fargate: $200-500
- DocumentDB: $300-800
- S3 + CloudFront: $50-150
- Amplify: $30-100
- Route 53: $1-5
- WAF: $20-50
- CloudWatch: $20-50
- **Total: ~$600-1600/month**

## Security Best Practices

1. **Use AWS Secrets Manager** for all sensitive data
2. **Enable VPC Flow Logs** for network monitoring
3. **Use least privilege IAM policies**
4. **Enable CloudTrail** for audit logging
5. **Regular security updates** and patches
6. **Implement proper backup strategies**
7. **Use AWS Shield** for DDoS protection
8. **Enable AWS Config** for compliance monitoring

## Monitoring & Alerting

### Key Metrics to Monitor
- Application response times
- Error rates
- Database performance
- Payment success rates
- Order processing times
- User registration/login rates
- File upload success rates

### Recommended Alerts
- High error rates (>5%)
- Payment failures
- Database connection issues
- High CPU/Memory usage
- SSL certificate expiration
- Domain expiration warnings 