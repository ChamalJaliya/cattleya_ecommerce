# 🚀 Quick Start Guide - Cattleya AWS Deployment

## Prerequisites

### 1. AWS Account Setup
```bash
# Install AWS CLI
# Windows: Download from https://aws.amazon.com/cli/
# macOS: brew install awscli
# Linux: sudo apt-get install awscli

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (us-east-1)
# Enter your output format (json)
```

### 2. Install Required Tools
```bash
# Install Node.js (if not already installed)
# Download from https://nodejs.org/

# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Install jq for JSON parsing
# Windows: Download from https://stedolan.github.io/jq/download/
# macOS: brew install jq
# Linux: sudo apt-get install jq
```

### 3. Domain Name (Optional but Recommended)
- Register a domain (e.g., cattleya.com) from Route 53, Namecheap, or GoDaddy
- This will be used for SSL certificates and professional appearance

## Step 1: Database Setup

```bash
cd deployment/aws-budget-friendly

# Run database setup
./setup-database.sh
```

**What this does:**
- Creates RDS PostgreSQL instance (t3.micro)
- Sets up security groups
- Generates database credentials
- Creates database schema

**Expected output:**
```
🌱 Cattleya Database Setup (Budget-Friendly)
============================================

[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check passed.
[INFO] Creating VPC resources for RDS...
[INFO] Creating DB subnet group...
[SUCCESS] DB subnet group created.
[INFO] Creating security group for RDS...
[SUCCESS] Security group created: sg-12345678
[INFO] Generating database password...
[SUCCESS] Database password generated and saved to db-credentials.env
[INFO] Creating RDS instance...
[SUCCESS] RDS instance creation initiated.
[INFO] Waiting for RDS instance to be available...
[SUCCESS] RDS instance is available.
[INFO] Getting database endpoint...
[SUCCESS] Database endpoint: cattleya-db.123456789.us-east-1.rds.amazonaws.com:5432
[INFO] Setting up database schema...
[SUCCESS] Database schema file created: setup-schema.sql
[INFO] Setting up database monitoring...
[SUCCESS] Database monitoring configured.
[INFO] Database Setup Information:

Database Endpoint: cattleya-db.123456789.us-east-1.rds.amazonaws.com
Database Port: 5432
Database Name: cattleya
Database Username: cattleya_admin
Database Password: [saved in db-credentials.env]

Connection String:
postgresql://cattleya_admin:password@cattleya-db.123456789.us-east-1.rds.amazonaws.com:5432/cattleya

[SUCCESS] Database setup complete!
```

## Step 2: Backend Deployment

```bash
# Update the backend deployment script with your database details
# Edit deploy-backend.sh and update the DATABASE_URL

# Run backend deployment
./deploy-backend.sh
```

**What this does:**
- Creates EC2 instance (t3.micro)
- Sets up security groups
- Installs Docker, Node.js, PM2
- Clones your repository
- Builds and starts the backend
- Sets up Nginx reverse proxy
- Configures CloudWatch monitoring

**Expected output:**
```
🌱 Cattleya Backend Deployment (Budget-Friendly)
===============================================

[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check passed.
[INFO] Creating security group...
[SUCCESS] Security group created: sg-87654321
[INFO] Creating key pair...
[SUCCESS] Key pair created: cattleya-key.pem
[INFO] Creating user data script...
[SUCCESS] User data script created.
[INFO] Launching EC2 instance...
[SUCCESS] Instance launched: i-1234567890abcdef0
[INFO] Waiting for instance to be running...
[SUCCESS] Instance is running at: 3.123.45.67
[INFO] Setting up basic monitoring...
[SUCCESS] CloudWatch dashboard created.
[INFO] Deployment Information:

Instance ID: i-1234567890abcdef0
Public IP: 3.123.45.67
SSH Command: ssh -i cattleya-key.pem ec2-user@3.123.45.67
Application URL: http://3.123.45.67

[SUCCESS] Backend deployed successfully!
```

## Step 3: Frontend Deployment

```bash
# Deploy frontend to AWS Amplify
./deploy-frontend.sh
```

**What this does:**
- Initializes Amplify project
- Adds hosting configuration
- Builds the Next.js application
- Deploys to AWS Amplify
- Sets up custom domain (optional)
- Configures CI/CD (optional)

**Expected output:**
```
🌱 Cattleya Frontend Deployment (Budget-Friendly)
=================================================

[INFO] Checking prerequisites...
[SUCCESS] Prerequisites check passed.
[INFO] Initializing Amplify project...
[SUCCESS] Amplify project initialized.
[INFO] Adding hosting to Amplify project...
[SUCCESS] Hosting added to Amplify project.
[INFO] Configuring environment variables...
[SUCCESS] Environment variables configured.
[INFO] Building the application...
[SUCCESS] Application built successfully.
[INFO] Deploying to AWS Amplify...
[SUCCESS] Application deployed to Amplify.
[INFO] Frontend Deployment Information:

Amplify App ID: d1234567890abc
Application URL: https://main.d1234567890abc.amplifyapp.com

[SUCCESS] Frontend deployed successfully!

💰 Cost Breakdown:
- AWS Amplify: Free tier (1,000 build minutes/month)
- Data Transfer: Free tier (15GB/month)
- Storage: Free tier (5GB)
- Total: $0/month (within free tier limits)
```

## Step 4: SSL Certificate Setup (Optional)

```bash
# SSH into your backend instance
ssh -i cattleya-key.pem ec2-user@YOUR_BACKEND_IP

# Run SSL setup (replace with your domain)
sudo /opt/cattleya/scripts/setup-ssl.sh cattleya.com admin@cattleya.com
```

## Step 5: Environment Configuration

### Backend Environment Variables
```bash
# SSH into your backend instance
ssh -i cattleya-key.pem ec2-user@YOUR_BACKEND_IP

# Edit environment file
sudo nano /opt/cattleya/cattleya-backend/.env
```

**Required environment variables:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://cattleya_admin:password@cattleya-db.123456789.us-east-1.rds.amazonaws.com:5432/cattleya
JWT_SECRET=your_super_secret_jwt_key_here
S3_BUCKET=cattleya-app-uploads
AWS_REGION=us-east-1
```

### Frontend Environment Variables
```bash
# In your local cattleya-app directory
nano .env.production
```

**Required environment variables:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=cattleya-app-uploads
```

## Step 6: Testing Your Deployment

### Test Backend
```bash
# Test health endpoint
curl http://YOUR_BACKEND_IP/health

# Test API endpoint
curl http://YOUR_BACKEND_IP/api/products
```

### Test Frontend
- Visit your Amplify URL: `https://main.d1234567890abc.amplifyapp.com`
- Test user registration and login
- Test product browsing and cart functionality

## Step 7: Monitoring and Maintenance

### CloudWatch Dashboard
- Visit AWS CloudWatch console
- Find your dashboard: "Cattleya-Budget-Dashboard-production"
- Monitor CPU, memory, and network usage

### Logs
```bash
# SSH into backend to view logs
ssh -i cattleya-key.pem ec2-user@YOUR_BACKEND_IP

# View application logs
pm2 logs cattleya-backend

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Management
```bash
# Connect to database
psql -h cattleya-db.123456789.us-east-1.rds.amazonaws.com -U cattleya_admin -d cattleya

# Run schema setup
psql -h cattleya-db.123456789.us-east-1.rds.amazonaws.com -U cattleya_admin -d cattleya -f setup-schema.sql
```

## Troubleshooting

### Common Issues

1. **EC2 Instance Not Starting**
   ```bash
   # Check instance status
   aws ec2 describe-instances --instance-ids i-1234567890abcdef0
   
   # Check system logs
   aws ec2 get-console-output --instance-id i-1234567890abcdef0
   ```

2. **Database Connection Issues**
   ```bash
   # Check security group rules
   aws ec2 describe-security-groups --group-ids sg-12345678
   
   # Test database connection
   telnet cattleya-db.123456789.us-east-1.rds.amazonaws.com 5432
   ```

3. **Application Not Responding**
   ```bash
   # SSH into instance and check services
   ssh -i cattleya-key.pem ec2-user@YOUR_BACKEND_IP
   
   # Check PM2 status
   pm2 status
   
   # Check nginx status
   sudo systemctl status nginx
   ```

### Cost Optimization Tips

1. **Monitor Usage**
   - Set up AWS Cost Explorer
   - Enable billing alerts
   - Review monthly costs

2. **Scale Down During Off-Hours**
   - Stop EC2 instance when not in use
   - Use AWS Lambda for non-critical functions

3. **Use Free Tier**
   - Stay within free tier limits
   - Monitor usage closely

## Next Steps

1. **Set up CI/CD pipeline**
2. **Configure custom domain**
3. **Set up monitoring alerts**
4. **Implement backup strategy**
5. **Add security scanning**
6. **Set up staging environment**

## Support

- **AWS Documentation**: https://docs.aws.amazon.com/
- **AWS Support**: $29/month (Developer plan)
- **Community**: Stack Overflow, Reddit r/aws
- **GitHub Issues**: Report bugs in your repository

---

**Remember**: This is a budget-friendly setup perfect for learning AWS. As you grow, you can easily migrate to the full production setup! 