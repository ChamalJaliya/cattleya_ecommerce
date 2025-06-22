# 🚀 Deploy Cattleya to Existing AWS Infrastructure

Since you already have EC2, S3, and CloudFront set up, let's deploy your application step by step.

## 📋 **Prerequisites Check**

### **1. Verify Your AWS Resources**

First, let's check what you have:

```bash
# Check EC2 instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' --output table

# Check S3 buckets
aws s3 ls

# Check CloudFront distributions
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status]' --output table
```

### **2. Required Resources**

You need:
- ✅ **EC2 instance** (running)
- ✅ **S3 bucket** (for file uploads)
- ✅ **CloudFront distribution** (optional, for CDN)
- ✅ **MongoDB Atlas account** (free tier)

## 🗄️ **Step 1: MongoDB Atlas Setup**

Since your app uses MongoDB, we need to set up MongoDB Atlas (free tier):

### **Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free"
3. Create account with your email

### **Create Free Cluster**
1. Choose "FREE" tier (M0)
2. Select cloud provider: AWS
3. Select region: us-east-1 (same as your EC2)
4. Click "Create"

### **Configure Database Access**
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `cattleya_admin`
4. Password: `your_secure_password`
5. Role: "Atlas admin"
6. Click "Add User"

### **Configure Network Access**
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### **Get Connection String**
1. Go to "Database"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

**Your connection string will look like:**
```
mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority
```

## 🖥️ **Step 2: Backend Deployment**

### **SSH into Your EC2 Instance**

```bash
# Replace with your actual EC2 IP and key file
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

### **Install Dependencies**

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### **Deploy Application**

```bash
# Create application directory
sudo mkdir -p /opt/cattleya
sudo chown ec2-user:ec2-user /opt/cattleya
cd /opt/cattleya

# Clone repository (replace with your repo URL)
git clone https://github.com/your-username/Cattleya_E.git .

# Navigate to backend
cd cattleya-backend

# Install dependencies
npm install

# Build application
npm run build

# Generate Prisma client
npx prisma generate

# Push schema to MongoDB
npx prisma db push
```

### **Configure Environment Variables**

```bash
# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL=mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1
CORS_ORIGIN=https://yourdomain.com
EOF
```

**Important:** Replace the placeholders:
- `your_password` with your MongoDB password
- `your-s3-bucket-name` with your S3 bucket name
- `yourdomain.com` with your domain (or leave as is for development)

### **Start Application**

```bash
# Start with PM2
pm2 start npm --name "cattleya-backend" -- start:prod

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### **Configure Nginx**

```bash
# Create Nginx configuration
sudo tee /etc/nginx/conf.d/cattleya.conf > /dev/null << 'EOF'
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
EOF

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 🌐 **Step 3: Frontend Deployment**

### **Install Amplify CLI**

```bash
# Install globally
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure
```

### **Deploy to Amplify**

```bash
# Navigate to frontend directory
cd ../../cattleya-app

# Initialize Amplify
amplify init --yes

# Add hosting
amplify add hosting --yes

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP:3001
NEXT_PUBLIC_S3_BUCKET=your-s3-bucket-name
NEXT_PUBLIC_AWS_REGION=us-east-1
EOF

# Build and publish
amplify publish --yes
```

## 🔒 **Step 4: SSL Certificate Setup**

### **Install Certbot**

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com --email admin@yourdomain.com --non-interactive --agree-tos

# Setup auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
```

## 🧪 **Step 5: Testing**

### **Test Backend**

```bash
# Health check
curl http://YOUR_EC2_IP:3001/health

# Test MongoDB connection
mongosh "mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority"

# Test basic operations
use cattleya
db.users.insertOne({email: "test@example.com", firstName: "Test", lastName: "User"})
db.users.find()
db.users.deleteOne({email: "test@example.com"})
```

### **Test Frontend**

```bash
# Get Amplify URL
amplify status --json | jq -r '.hosting.amplifyhosting.url'

# Open in browser and test:
# - User registration
# - User login
# - Product browsing
# - Cart functionality
```

## 📊 **Step 6: Monitoring**

### **Application Logs**

```bash
# Check PM2 logs
pm2 logs cattleya-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
free -h
```

### **Database Monitoring**

MongoDB Atlas provides built-in monitoring:
1. Go to MongoDB Atlas dashboard
2. Check "Metrics" tab
3. Monitor connections, operations, and storage

## 🔧 **Step 7: Configuration**

### **Update DNS Records**

If you have a domain:
1. Go to your DNS provider
2. Add A record: `yourdomain.com` → `YOUR_EC2_IP`
3. Add CNAME record: `www.yourdomain.com` → `yourdomain.com`

### **Update CORS Settings**

```bash
# SSH into EC2 and update .env file
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Edit .env file
nano /opt/cattleya/cattleya-backend/.env

# Update CORS_ORIGIN
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Restart application
pm2 restart cattleya-backend
```

## 💰 **Cost Optimization**

### **Current Costs**
- **EC2 t3.micro**: $8-12/month
- **MongoDB Atlas**: $0/month (free tier)
- **S3**: $1-5/month
- **CloudFront**: $5-10/month
- **Total**: $14-27/month

### **Free Tier Usage**
- ✅ **EC2**: 750 hours/month (t3.micro)
- ✅ **MongoDB Atlas**: 512MB storage
- ✅ **S3**: 5GB storage, 20,000 GET requests
- ✅ **CloudFront**: 1TB data transfer
- ✅ **Amplify**: 1,000 build minutes/month

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend not starting**
   ```bash
   # Check logs
   pm2 logs cattleya-backend
   
   # Check environment variables
   cat /opt/cattleya/cattleya-backend/.env
   
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
   ssh -i your-key.pem ec2-user@YOUR_EC2_IP
   
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

## 📋 **Deployment Checklist**

- [ ] MongoDB Atlas account created
- [ ] Free cluster created and configured
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] EC2 instance accessible via SSH
- [ ] Dependencies installed (Docker, Node.js, PM2, Nginx)
- [ ] Application cloned and built
- [ ] Environment variables configured
- [ ] Application started with PM2
- [ ] Nginx configured and running
- [ ] Frontend deployed to Amplify
- [ ] SSL certificate obtained (if using domain)
- [ ] DNS records updated (if using domain)
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Backup procedures verified

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

**🎉 Congratulations! Your Cattleya e-commerce application is now live on your existing AWS infrastructure with MongoDB Atlas!**

**Total Setup Time**: ~2 hours  
**Monthly Cost**: $14-27  
**Next**: Follow the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) for detailed verification steps. 