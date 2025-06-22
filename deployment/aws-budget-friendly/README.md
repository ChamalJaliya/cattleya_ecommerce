# 🌱 Cattleya E-commerce - Budget-Friendly AWS Deployment

Perfect for startups! This deployment strategy focuses on **cost optimization** while maintaining scalability and reliability.

## 💰 **Budget Breakdown**

### **Monthly Costs: $15-35** (vs $600-1600 for full production)

| Service | Cost | Optimization |
|---------|------|--------------|
| **EC2 t3.micro** | $8-12 | Single instance, auto-scaling |
| **MongoDB Atlas** | $0 | Free tier (512MB storage) |
| **S3** | $1-5 | Minimal storage, lifecycle policies |
| **CloudFront** | $5-10 | Free tier eligible |
| **Route 53** | $1 | Hosted zone only |
| **SES** | $0-1 | Free tier: 62,000 emails/month |
| **CloudWatch** | $0-2 | Basic monitoring |
| **Total** | **$15-35** | Startup-friendly! |

## 🏗️ **Simplified Architecture**

```
┌─────────────────┐    ┌─────────────────┐
│   Route 53      │    │   CloudFront    │
│   (DNS)         │    │   (CDN)         │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   EC2 Instance  │    │   S3 Bucket     │
│   (Backend)     │    │   (Media)       │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│ MongoDB Atlas   │
│ (Free Tier)     │
└─────────────────┘
```

## 🚀 **Quick Start (Budget Version)**

### 1. **Prerequisites**
```bash
# Install tools
npm install -g @aws-amplify/cli
aws configure
```

### 2. **Setup MongoDB Atlas (Free)**
```bash
# Go to https://www.mongodb.com/atlas
# Create free account and cluster
# Get connection string
```

### 3. **Deploy Backend (EC2)**
```bash
cd deployment/aws-budget-friendly
./deploy-backend.sh
```

### 4. **Deploy Frontend (Amplify)**
```bash
cd ../../cattleya-app
amplify init
amplify add hosting
amplify publish
```

## 📁 **File Structure**

```
deployment/aws-budget-friendly/
├── README.md                 # This file
├── deploy-backend.sh         # Backend deployment script
├── deploy-frontend.sh        # Frontend deployment script
├── deploy-to-existing.sh     # Deploy to existing AWS resources
├── mongodb-setup.md          # MongoDB setup guide
├── cloudformation/
│   └── backend-stack.yml     # EC2 stack (no RDS)
├── scripts/
│   ├── install-docker.sh     # Docker installation
│   ├── setup-nginx.sh        # Nginx configuration
│   └── setup-ssl.sh          # SSL certificate setup
└── config/
    ├── nginx.conf            # Nginx configuration
    ├── pm2.config.js         # PM2 process manager
    └── environment.env       # Environment variables
```

## 🔧 **Cost Optimization Strategies**

### **1. Use Free Tier**
- **EC2**: 750 hours/month (t3.micro)
- **MongoDB Atlas**: 512MB storage, shared clusters
- **S3**: 5GB storage, 20,000 GET requests
- **CloudFront**: 1TB data transfer
- **SES**: 62,000 emails/month

### **2. Instance Sizing**
- **EC2**: t3.micro (1 vCPU, 1GB RAM) - $8/month
- **MongoDB Atlas**: Free tier - $0/month
- **Auto-scaling**: Scale to 0 during off-hours

### **3. Storage Optimization**
- **S3 Lifecycle**: Move old files to IA after 30 days
- **Image Compression**: Use CloudFront image optimization
- **Database**: Regular cleanup of old data

### **4. Monitoring on a Budget**
- **CloudWatch Basic**: Free tier monitoring
- **Custom Metrics**: Use application-level monitoring
- **Alerts**: Email notifications only

## 🛠️ **Deployment Scripts**

### **Backend Deployment**
```bash
#!/bin/bash
# deploy-backend.sh

echo "🚀 Deploying Cattleya Backend (Budget Version)"

# Create EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.micro \
  --key-name cattleya-key \
  --security-group-ids sg-12345678 \
  --subnet-id subnet-12345678 \
  --user-data file://scripts/install-docker.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=cattleya-backend}]'

echo "✅ Backend deployed successfully!"
```

### **MongoDB Setup**
```bash
# Option 1: MongoDB Atlas (Recommended)
# Go to https://www.mongodb.com/atlas
# Create free cluster
# Get connection string

# Option 2: Local MongoDB on EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🔒 **Security (Budget-Friendly)**

### **Basic Security**
- **Security Groups**: Minimal required ports (80, 443, 22)
- **IAM**: Least privilege access
- **SSL**: Let's Encrypt (free)
- **Backup**: MongoDB Atlas handles backups automatically

### **No-Cost Security Features**
- **AWS WAF**: Use CloudFlare (free tier)
- **DDoS Protection**: Basic AWS protection
- **Monitoring**: CloudWatch basic monitoring

## 📊 **Scaling Strategy**

### **Phase 1: MVP (Current)**
- Single EC2 instance
- MongoDB Atlas free tier
- Basic monitoring
- **Cost: $15-35/month**

### **Phase 2: Growth**
- Add load balancer
- MongoDB Atlas paid tier ($9/month)
- Auto-scaling group
- **Cost: $50-100/month**

### **Phase 3: Production**
- Full ECS deployment
- MongoDB Atlas dedicated cluster
- Advanced monitoring
- **Cost: $200-500/month**

## 🚨 **Important Notes**

### **Limitations**
- **Single Point of Failure**: Single instance deployment
- **Limited Scalability**: Manual scaling required
- **Basic Monitoring**: Limited alerting capabilities
- **MongoDB Atlas Limits**: 512MB storage, shared clusters

### **When to Upgrade**
- **Traffic > 1000 users/day**
- **Database > 512MB storage**
- **Need dedicated resources**
- **Require advanced features**

## 🎯 **MongoDB Atlas Benefits**

### **Free Tier Features**
- ✅ **512MB storage** (enough for startup)
- ✅ **Shared clusters** (managed infrastructure)
- ✅ **Automatic backups** (daily)
- ✅ **Global distribution** (multiple regions)
- ✅ **Built-in security** (authentication, encryption)
- ✅ **No server management** required

### **Easy Migration Path**
- **Free → Paid**: Seamless upgrade when needed
- **Storage**: 512MB → 10GB+ (pay as you grow)
- **Performance**: Shared → Dedicated clusters
- **Features**: Basic → Advanced (monitoring, analytics)

## 📝 **Next Steps**

1. **Set up MongoDB Atlas** (free tier)
2. **Deploy backend** to EC2
3. **Deploy frontend** to Amplify
4. **Configure domain** and SSL
5. **Set up monitoring** and alerts
6. **Test thoroughly** before going live

---

**Ready to deploy?** Start with the [Quick Start Guide](QUICK_START.md) or [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)! 🚀 