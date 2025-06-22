# 🚀 Deploy Cattleya to Existing AWS Infrastructure

Since you already have EC2, RDS, S3, and CloudFront set up, let's deploy your application step by step.

## 📋 Prerequisites Check

First, let's verify your AWS setup:

```bash
# Check your AWS configuration
aws configure list

# Verify your AWS account
aws sts get-caller-identity

# List your existing resources
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' --output table

aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,Engine,DBInstanceStatus,Endpoint.Address]' --output table

aws s3 ls

aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status]' --output table
```

## 🗄️ Step 1: Database Setup (MongoDB)

Since your app uses MongoDB, we need to set up MongoDB on your existing RDS or use MongoDB Atlas.

### Option A: Use MongoDB Atlas (Recommended)
```bash
# 1. Go to https://www.mongodb.com/atlas
# 2. Create a free cluster
# 3. Get your connection string
# 4. Update your environment variables
```

### Option B: Install MongoDB on EC2
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Install MongoDB
sudo yum update -y
sudo yum install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongosh
use cattleya
db.createUser({
  user: "cattleya_admin",
  pwd: "your_secure_password",
  roles: ["readWrite", "dbAdmin"]
})
exit
```

## 🖥️ Step 2: Backend Deployment on EC2

### 2.1 SSH into your EC2 instance
```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

### 2.2 Install required software
```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Install Nginx
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.3 Clone and setup your application
```bash
# Create application directory
mkdir -p /opt/cattleya
cd /opt/cattleya

# Clone your repository
git clone https://github.com/ChamalJaliya/cattleya_ecommerce.git .

# Navigate to backend
cd cattleya-backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 2.4 Configure environment variables
```bash
# Create environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001

# MongoDB Connection (update with your actual connection string)
DATABASE_URL="mongodb://cattleya_admin:your_password@localhost:27017/cattleya?authSource=cattleya"

# JWT Configuration
JWT_SECRET="your_super_secret_jwt_key_here_make_it_long_and_random"

# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket-name
S3_ACCESS_KEY_ID=your_access_key_id
S3_SECRET_ACCESS_KEY=your_secret_access_key

# CloudFront Configuration
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# Email Configuration (if using SES)
SES_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com

# Stripe Configuration (if using)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

### 2.5 Build and start the application
```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "cattleya-backend" -- start:prod

# Save PM2 configuration
pm2 save
pm2 startup
```

### 2.6 Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/conf.d/cattleya.conf > /dev/null << 'EOF'
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
EOF

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🌐 Step 3: Frontend Deployment

### 3.1 Deploy to AWS Amplify
```bash
# Navigate to frontend directory
cd /opt/cattleya/cattleya-app

# Install dependencies
npm install

# Build the application
npm run build
```

### 3.2 Configure Amplify (if not already done)
```bash
# Install Amplify CLI locally
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### 3.3 Update frontend environment variables
```bash
# Create production environment file
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=your-s3-bucket-name
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
EOF
```

## ☁️ Step 4: S3 and CloudFront Configuration

### 4.1 Configure S3 bucket for file uploads
```bash
# Create S3 bucket policy for file uploads
aws s3api put-bucket-policy --bucket your-s3-bucket-name --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-s3-bucket-name/*"
    }
  ]
}'

# Enable CORS for S3
aws s3api put-bucket-cors --bucket your-s3-bucket-name --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}'
```

### 4.2 Configure CloudFront distribution
```bash
# Update CloudFront distribution to serve S3 content
# Go to AWS Console > CloudFront > Your Distribution
# Set origin to your S3 bucket
# Configure cache behaviors for optimal performance
```

## 🔒 Step 5: Security Configuration

### 5.1 Configure security groups
```bash
# Update EC2 security group to allow necessary ports
aws ec2 authorize-security-group-ingress \
    --group-id your-security-group-id \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id your-security-group-id \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id your-security-group-id \
    --protocol tcp \
    --port 3001 \
    --cidr 0.0.0.0/0
```

### 5.2 Set up SSL certificate (optional)
```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com --non-interactive --agree-tos --email admin@yourdomain.com
```

## 🧪 Step 6: Testing

### 6.1 Test backend
```bash
# Test health endpoint
curl http://YOUR_EC2_IP/health

# Test API endpoint
curl http://YOUR_EC2_IP/api/products

# Check application logs
pm2 logs cattleya-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
```

### 6.2 Test frontend
- Visit your Amplify URL
- Test user registration and login
- Test product browsing
- Test file uploads to S3

### 6.3 Test database
```bash
# Connect to MongoDB
mongosh "mongodb://cattleya_admin:your_password@localhost:27017/cattleya?authSource=cattleya"

# Check collections
show collections

# Test queries
db.users.find().limit(1)
```

## 📊 Step 7: Monitoring Setup

### 7.1 Set up CloudWatch monitoring
```bash
# Install CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Start CloudWatch agent
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent
```

### 7.2 Create CloudWatch dashboard
```bash
# Create dashboard configuration
cat > dashboard.json << 'EOF'
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/EC2", "CPUUtilization"],
                    [".", "NetworkIn"],
                    [".", "NetworkOut"]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "EC2 Metrics"
            }
        }
    ]
}
EOF

# Create dashboard
aws cloudwatch put-dashboard \
    --dashboard-name "Cattleya-Dashboard" \
    --dashboard-body file://dashboard.json
```

## 🔄 Step 8: CI/CD Setup (Optional)

### 8.1 Set up GitHub Actions
```bash
# Create .github/workflows/deploy.yml in your repository
mkdir -p .github/workflows
```

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ec2-user
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /opt/cattleya
          git pull origin main
          cd cattleya-backend
          npm install
          npm run build
          pm2 restart cattleya-backend
```

## 📝 Step 9: Environment Variables Summary

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mongodb://cattleya_admin:password@localhost:27017/cattleya?authSource=cattleya
JWT_SECRET=your_super_secret_jwt_key_here
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket-name
S3_ACCESS_KEY_ID=your_access_key_id
S3_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=your-s3-bucket-name
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## 🚨 Troubleshooting

### Common Issues:

1. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check MongoDB logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

2. **Application Not Starting**
   ```bash
   # Check PM2 status
   pm2 status
   
   # Check application logs
   pm2 logs cattleya-backend
   
   # Check if port is in use
   sudo netstat -tlnp | grep :3001
   ```

3. **Nginx Issues**
   ```bash
   # Check Nginx status
   sudo systemctl status nginx
   
   # Check Nginx configuration
   sudo nginx -t
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **S3 Upload Issues**
   ```bash
   # Check S3 bucket permissions
   aws s3 ls s3://your-s3-bucket-name
   
   # Test S3 upload
   aws s3 cp test.txt s3://your-s3-bucket-name/
   ```

## ✅ Final Checklist

- [ ] MongoDB is running and accessible
- [ ] Backend application is running on port 3001
- [ ] Nginx is configured and serving the backend
- [ ] Frontend is deployed and accessible
- [ ] S3 bucket is configured for file uploads
- [ ] CloudFront is serving content from S3
- [ ] SSL certificate is installed (if using custom domain)
- [ ] Environment variables are properly configured
- [ ] Application is tested and working
- [ ] Monitoring is set up
- [ ] Backups are configured

---

**Your Cattleya e-commerce application is now deployed on your existing AWS infrastructure!** 🎉

**Next steps:**
1. Test all functionality thoroughly
2. Set up monitoring alerts
3. Configure automated backups
4. Set up CI/CD pipeline
5. Implement security best practices 