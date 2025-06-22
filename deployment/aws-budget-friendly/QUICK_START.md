# 🚀 Cattleya Quick Start Guide (Budget-Friendly)

Get your Cattleya e-commerce application running on AWS in under 30 minutes with MongoDB Atlas free tier!

## 📋 **Prerequisites**

- ✅ AWS account with billing enabled
- ✅ Domain name (optional but recommended)
- ✅ Git repository access
- ✅ Basic knowledge of AWS services

## ⚡ **Quick Start (30 minutes)**

### **Step 1: MongoDB Atlas Setup (5 minutes)**

1. **Create MongoDB Atlas Account**
   ```bash
   # Go to https://www.mongodb.com/atlas
   # Click "Try Free"
   # Create account with email
   ```

2. **Create Free Cluster**
   ```bash
   # Choose "FREE" tier (M0)
   # Select cloud provider: AWS
   # Select region: us-east-1
   # Click "Create"
   ```

3. **Configure Database Access**
   ```bash
   # Go to Database Access
   # Click "Add New Database User"
   # Username: cattleya_admin
   # Password: your_secure_password
   # Role: Atlas admin
   # Click "Add User"
   ```

4. **Configure Network Access**
   ```bash
   # Go to Network Access
   # Click "Add IP Address"
   # Click "Allow Access from Anywhere" (0.0.0.0/0)
   # Click "Confirm"
   ```

5. **Get Connection String**
   ```bash
   # Go to Database
   # Click "Connect"
   # Choose "Connect your application"
   # Copy the connection string
   ```

**Your connection string will look like:**
```
mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority
```

### **Step 2: AWS Setup (5 minutes)**

1. **Install AWS CLI**
   ```bash
   # Windows
   curl "https://awscli.amazonaws.com/AWSCLIV2.msi" -o "AWSCLIV2.msi"
   msiexec.exe /i AWSCLIV2.msi /quiet

   # macOS
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /

   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. **Configure AWS**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter region: us-east-1
   # Enter output format: json
   ```

3. **Create EC2 Key Pair**
   ```bash
   aws ec2 create-key-pair --key-name cattleya-key --query 'KeyMaterial' --output text > cattleya-key.pem
   chmod 400 cattleya-key.pem
   ```

### **Step 3: Deploy Backend (10 minutes)**

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/Cattleya_E.git
   cd Cattleya_E
   ```

2. **Update Configuration**
   ```bash
   # Edit deployment script
   nano deployment/aws-budget-friendly/deploy-backend.sh
   
   # Update these values:
   # - REPO_URL: Your GitHub repository URL
   # - MONGODB_URL: Your MongoDB Atlas connection string
   ```

3. **Deploy Backend**
   ```bash
   cd deployment/aws-budget-friendly
   chmod +x deploy-backend.sh
   ./deploy-backend.sh
   ```

**Expected Output:**
```
[INFO] Creating EC2 instance...
[SUCCESS] EC2 instance created: i-1234567890abcdef0
[INFO] Waiting for instance to be running...
[SUCCESS] Instance is running
[INFO] Getting public IP...
[SUCCESS] Public IP: 3.123.45.67
[INFO] Installing Docker and dependencies...
[SUCCESS] Backend deployment complete!
```

### **Step 4: Deploy Frontend (10 minutes)**

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Deploy Frontend**
   ```bash
   cd ../../cattleya-app
   amplify init
   amplify add hosting
   amplify publish
   ```

**Expected Output:**
```
[INFO] Initializing Amplify...
[SUCCESS] Amplify initialized
[INFO] Adding hosting...
[SUCCESS] Hosting added
[INFO] Publishing application...
[SUCCESS] Application published: https://main.d1234567890abc.amplifyapp.com
```

## 🔧 **Configuration**

### **Backend Environment Variables**

Create `.env` file in `/opt/cattleya/cattleya-backend/`:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
S3_BUCKET=cattleya-app-uploads
AWS_REGION=us-east-1
CORS_ORIGIN=https://yourdomain.com
```

### **Frontend Environment Variables**

Create `.env.local` file in `cattleya-app/`:

```env
NEXT_PUBLIC_API_URL=http://3.123.45.67:3001
NEXT_PUBLIC_S3_BUCKET=cattleya-app-uploads
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## 🧪 **Testing**

### **Backend Health Check**
```bash
curl http://3.123.45.67:3001/health
# Expected: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### **Database Connection**
```bash
# SSH into EC2
ssh -i cattleya-key.pem ec2-user@3.123.45.67

# Test MongoDB connection
mongosh "mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority"

# Test basic operations
use cattleya
db.users.insertOne({email: "test@example.com", firstName: "Test", lastName: "User"})
db.users.find()
db.users.deleteOne({email: "test@example.com"})
```

### **Frontend Testing**
```bash
# Open in browser
https://main.d1234567890abc.amplifyapp.com

# Test features:
# - User registration
# - User login
# - Product browsing
# - Cart functionality
```

## 🔒 **Security Setup (Optional)**

### **SSL Certificate**
```bash
# SSH into EC2
ssh -i cattleya-key.pem ec2-user@3.123.45.67

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### **Domain Configuration**
```bash
# Update DNS records
# A record: yourdomain.com → 3.123.45.67
# CNAME record: www.yourdomain.com → yourdomain.com

# Update CORS_ORIGIN in backend .env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## 📊 **Monitoring**

### **Application Logs**
```bash
# SSH into EC2
ssh -i cattleya-key.pem ec2-user@3.123.45.67

# Check PM2 logs
pm2 logs cattleya-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **System Monitoring**
```bash
# Check system resources
htop
df -h
free -h

# Check running services
sudo systemctl status nginx
sudo systemctl status docker
pm2 status
```

## 💰 **Cost Monitoring**

### **Check Current Costs**
```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost

# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "MonthlyCostAlert" \
  --alarm-description "Alert when monthly cost exceeds $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

### **Expected Monthly Costs**
- **EC2 t3.micro**: $8-12
- **MongoDB Atlas**: $0 (free tier)
- **S3**: $1-5
- **CloudFront**: $5-10
- **Route 53**: $1
- **Total**: $15-28/month

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend not starting**
   ```bash
   # Check logs
   pm2 logs cattleya-backend
   
   # Restart application
   pm2 restart cattleya-backend
   ```

2. **Database connection failed**
   ```bash
   # Test connection string
   mongosh "your_connection_string"
   
   # Check IP whitelist in MongoDB Atlas
   # Add EC2 IP to Network Access
   ```

3. **Frontend not loading**
   ```bash
   # Check Amplify build logs
   amplify console
   
   # Rebuild application
   amplify publish
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

### **Emergency Procedures**

1. **Backup Database**
   ```bash
   # MongoDB Atlas handles backups automatically
   # Manual backup (if needed)
   mongodump --uri="your_connection_string" --out=backup/
   ```

2. **Restart Services**
   ```bash
   # SSH into EC2
   ssh -i cattleya-key.pem ec2-user@3.123.45.67
   
   # Restart all services
   sudo systemctl restart nginx
   pm2 restart all
   ```

3. **Rollback Deployment**
   ```bash
   # Revert to previous version
   cd /opt/cattleya
   git log --oneline
   git reset --hard HEAD~1
   pm2 restart cattleya-backend
   ```

## 🎯 **Next Steps**

### **Immediate (Week 1)**
- [ ] Set up monitoring alerts
- [ ] Configure backup procedures
- [ ] Test all user flows
- [ ] Set up error tracking

### **Short Term (Month 1)**
- [ ] Optimize performance
- [ ] Add caching layer
- [ ] Implement CDN
- [ ] Set up analytics

### **Long Term (3 months)**
- [ ] Scale to multiple instances
- [ ] Add load balancer
- [ ] Implement auto-scaling
- [ ] Add advanced monitoring

---

## 📞 **Support**

### **Free Resources**
- **AWS Documentation**: https://docs.aws.amazon.com/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Amplify Documentation**: https://docs.amplify.aws/

### **Community Support**
- **Stack Overflow**: Tag with `aws`, `mongodb`, `nextjs`
- **GitHub Issues**: Report bugs in your repository
- **Discord/Slack**: Join developer communities

---

**🎉 Congratulations! Your Cattleya e-commerce application is now live on AWS with MongoDB Atlas!**

**Total Setup Time**: ~30 minutes  
**Monthly Cost**: $15-28  
**Next**: Follow the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) for detailed verification steps. 