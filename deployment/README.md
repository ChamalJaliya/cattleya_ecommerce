# 🚀 Cattleya E-commerce AWS Deployment

This directory contains all the necessary files and scripts to deploy the Cattleya E-commerce application to AWS.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Services Overview](#services-overview)
- [Cost Estimation](#cost-estimation)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

The Cattleya E-commerce platform is deployed on AWS using a modern, scalable architecture with the following components:

- **Frontend**: Next.js application deployed on AWS Amplify
- **Backend**: NestJS API deployed on ECS Fargate
- **Database**: Amazon DocumentDB (MongoDB-compatible)
- **Storage**: Amazon S3 with CloudFront CDN
- **Messaging**: Amazon SQS, SNS, and SES
- **Payment**: Stripe integration with AWS Payment Cryptography
- **Security**: AWS WAF, IAM, and Secrets Manager

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Route 53      │    │   CloudFront    │    │   AWS Amplify   │
│   (DNS)         │    │   (CDN)         │    │   (Frontend)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   S3 Buckets    │    │   AWS WAF       │
│   Load Balancer │    │   (Media)       │    │   (Security)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ECS Fargate   │    │   DocumentDB    │    │   SQS/SNS/SES   │
│   (Backend)     │    │   (Database)    │    │   (Messaging)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Before deploying, ensure you have the following:

### Required Tools
- [AWS CLI](https://aws.amazon.com/cli/) (v2.0 or later)
- [Terraform](https://www.terraform.io/) (v1.0 or later)
- [Docker](https://www.docker.com/) (v20.0 or later)
- [Git](https://git-scm.com/) (v2.0 or later)

### AWS Account Setup
1. **AWS Account**: Active AWS account with billing enabled
2. **IAM User**: User with appropriate permissions (see IAM section below)
3. **Domain Name**: Registered domain for your application
4. **Stripe Account**: Active Stripe account for payments

### Required Permissions
Your AWS user needs the following permissions:
- AdministratorAccess (for initial setup)
- Or create a custom policy with permissions for:
  - ECS, ECR, VPC, EC2, IAM, S3, CloudFront
  - DocumentDB, Secrets Manager, CloudWatch
  - SQS, SNS, SES, WAF, Route 53
  - Lambda, API Gateway (if using)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo>
cd Cattleya_E
```

### 2. Configure AWS
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
```

### 3. Configure Variables
```bash
cd deployment/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 4. Deploy
```bash
cd ../..
chmod +x deployment/scripts/deploy.sh
./deployment/scripts/deploy.sh
```

## 📖 Detailed Setup

### Step 1: Domain Setup

1. **Purchase Domain** (if not already owned):
   - Go to Route 53 or your preferred registrar
   - Purchase domain (e.g., `cattleya.com`)

2. **Configure DNS**:
   - Create hosted zone in Route 53
   - Update nameservers at your registrar

### Step 2: AWS Configuration

1. **Create IAM User**:
```bash
aws iam create-user --user-name cattleya-deploy
aws iam attach-user-policy --user-name cattleya-deploy --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam create-access-key --user-name cattleya-deploy
```

2. **Configure AWS CLI**:
```bash
aws configure
```

### Step 3: Environment Variables

Create `deployment/terraform/terraform.tfvars`:

```hcl
environment = "production"
domain_name = "cattleya.com"
admin_email = "admin@cattleya.com"
stripe_secret_key = "sk_test_your_stripe_secret_key_here"
```

### Step 4: Deploy Infrastructure

```bash
cd deployment/terraform
terraform init
terraform plan
terraform apply
```

### Step 5: Deploy Application

```bash
# Build and push Docker image
cd ../../cattleya-backend
docker build -t cattleya-backend .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ecr-repo-url>
docker tag cattleya-backend:latest <ecr-repo-url>:latest
docker push <ecr-repo-url>:latest

# Deploy to ECS
aws ecs update-service --cluster cattleya-cluster --service cattleya-backend-service --force-new-deployment
```

### Step 6: Frontend Deployment

1. **Connect to Amplify**:
   - Go to AWS Amplify Console
   - Connect your Git repository
   - Configure build settings

2. **Set Environment Variables**:
```bash
NEXT_PUBLIC_API_URL=https://api.cattleya.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_S3_BUCKET=cattleya-media
NEXT_PUBLIC_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

## 🔧 Services Overview

### Core Infrastructure

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **VPC** | Network isolation | 10.0.0.0/16 CIDR, 2 AZs |
| **ECS Fargate** | Container orchestration | 2 tasks, auto-scaling |
| **DocumentDB** | MongoDB database | 2 instances, t3.medium |
| **ALB** | Load balancing | HTTP/HTTPS, health checks |

### Storage & CDN

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **S3** | Media storage | Versioning, lifecycle policies |
| **CloudFront** | Content delivery | Global CDN, compression |
| **S3 Transfer Acceleration** | Fast uploads | Enabled for media |

### Messaging Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **SQS** | Order processing queue | Dead letter queue, retries |
| **SNS** | Notifications | Email, SMS subscriptions |
| **SES** | Transactional emails | Templates, DKIM |

### Security & Monitoring

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **WAF** | Web application firewall | Rate limiting, SQL injection |
| **Secrets Manager** | Secret storage | JWT, Stripe keys |
| **CloudWatch** | Monitoring | Alarms, dashboards |

## 💰 Cost Estimation

### Monthly Costs (Production)

| Service | Cost Range | Notes |
|---------|------------|-------|
| **ECS Fargate** | $200-500 | 2-10 tasks, auto-scaling |
| **DocumentDB** | $300-800 | 2 instances, backups |
| **S3 + CloudFront** | $50-150 | Storage + data transfer |
| **ALB** | $20-50 | Load balancer |
| **Route 53** | $1-5 | DNS hosting |
| **WAF** | $20-50 | Web application firewall |
| **CloudWatch** | $20-50 | Monitoring and logs |
| **SQS/SNS/SES** | $10-30 | Messaging services |
| **Total** | **$600-1600** | Varies with usage |

### Cost Optimization Tips

1. **Use Spot Instances** for non-critical workloads
2. **Enable S3 Lifecycle Policies** to move old data to cheaper storage
3. **Use CloudFront** to reduce S3 data transfer costs
4. **Monitor with CloudWatch** to identify cost drivers
5. **Use Reserved Instances** for predictable workloads

## 🔒 Security

### Network Security
- **VPC**: Private subnets for database and application
- **Security Groups**: Least privilege access
- **NACLs**: Network-level filtering
- **VPC Flow Logs**: Network traffic monitoring

### Application Security
- **WAF**: DDoS protection, SQL injection prevention
- **HTTPS**: SSL/TLS encryption everywhere
- **IAM**: Least privilege access policies
- **Secrets Manager**: Secure credential storage

### Data Security
- **Encryption at Rest**: AES-256 for all data
- **Encryption in Transit**: TLS 1.2+ for all communications
- **Backup Encryption**: Encrypted backups
- **Access Logging**: Comprehensive audit trails

### Compliance
- **PCI DSS**: Payment data protection
- **GDPR**: Data privacy compliance
- **SOC 2**: Security controls
- **ISO 27001**: Information security

## 📊 Monitoring

### CloudWatch Dashboards
- **Application Metrics**: Response times, error rates
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Business Metrics**: Orders, revenue, user activity

### Alerts
- **High Error Rate**: >5% HTTP 5xx errors
- **High CPU/Memory**: >80% utilization
- **Payment Failures**: Stripe webhook failures
- **Database Issues**: Connection failures

### Logging
- **Application Logs**: Structured JSON logging
- **Access Logs**: ALB access logs
- **Security Logs**: WAF, CloudTrail logs

## 🛠️ Troubleshooting

### Common Issues

#### 1. ECS Service Not Starting
```bash
# Check service events
aws ecs describe-services --cluster cattleya-cluster --services cattleya-backend-service

# Check task logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/cattleya-backend"
```

#### 2. Database Connection Issues
```bash
# Check DocumentDB status
aws docdb describe-db-clusters --db-cluster-identifier cattleya-cluster

# Test connectivity
aws docdb describe-db-cluster-endpoints --db-cluster-identifier cattleya-cluster
```

#### 3. S3 Upload Failures
```bash
# Check bucket permissions
aws s3api get-bucket-policy --bucket cattleya-media

# Test upload
aws s3 cp test.txt s3://cattleya-media/
```

#### 4. CloudFront Issues
```bash
# Check distribution status
aws cloudfront get-distribution --id <distribution-id>

# Invalidate cache
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

### Debug Commands

```bash
# Check all resources
terraform show

# Check specific resource
terraform state show aws_ecs_service.cattleya_backend

# Import existing resources
terraform import aws_s3_bucket.cattleya_media cattleya-media-12345678

# Destroy specific resource
terraform destroy -target=aws_ecs_service.cattleya_backend
```

### Performance Optimization

1. **Database Optimization**:
   - Enable read replicas for read-heavy workloads
   - Use connection pooling
   - Optimize indexes

2. **Application Optimization**:
   - Enable compression
   - Use caching (Redis)
   - Optimize Docker images

3. **CDN Optimization**:
   - Set appropriate cache headers
   - Use edge locations
   - Enable compression

## 📚 Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Terraform Documentation](https://www.terraform.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Stripe Documentation](https://stripe.com/docs)

## 🤝 Support

For deployment issues:
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Check AWS Service Health Dashboard
4. Contact AWS Support (if you have a support plan)

For application issues:
1. Check application logs
2. Review error monitoring
3. Check database connectivity
4. Verify environment variables

---

**Note**: This deployment guide assumes you have basic knowledge of AWS services, Terraform, and Docker. For production deployments, consider engaging with AWS Professional Services or a certified AWS partner. 