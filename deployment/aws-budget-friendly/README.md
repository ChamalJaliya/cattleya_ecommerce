# 🌱 Cattleya E-commerce - Budget-Friendly AWS Deployment

Perfect for startups! This deployment strategy focuses on **cost optimization** while maintaining scalability and reliability.

## 💰 **Budget Breakdown**

### **Monthly Costs: $50-150** (vs $600-1600 for full production)

| Service | Cost | Optimization |
|---------|------|--------------|
| **EC2 t3.micro** | $8-12 | Single instance, auto-scaling |
| **RDS t3.micro** | $15-20 | Single instance, no multi-AZ |
| **S3** | $1-5 | Minimal storage, lifecycle policies |
| **CloudFront** | $5-10 | Free tier eligible |
| **Route 53** | $1 | Hosted zone only |
| **SES** | $0-1 | Free tier: 62,000 emails/month |
| **CloudWatch** | $0-2 | Basic monitoring |
| **Total** | **$30-50** | Startup-friendly! |

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
│   RDS Instance  │
│   (Database)    │
└─────────────────┘
```

## 🚀 **Quick Start (Budget Version)**

### 1. **Prerequisites**
```bash
# Install tools
npm install -g @aws-amplify/cli
aws configure
```

### 2. **Deploy Backend (EC2)**
```bash
cd deployment/aws-budget-friendly
./deploy-backend.sh
```

### 3. **Deploy Frontend (Amplify)**
```bash
cd ../../cattleya-app
amplify init
amplify add hosting
amplify publish
```

### 4. **Setup Database**
```bash
cd ../deployment/aws-budget-friendly
./setup-database.sh
```

## 📁 **File Structure**

```
deployment/aws-budget-friendly/
├── README.md                 # This file
├── deploy-backend.sh         # Backend deployment script
├── setup-database.sh         # Database setup script
├── cloudformation/
│   ├── backend-stack.yml     # EC2 + RDS stack
│   └── s3-stack.yml          # S3 + CloudFront stack
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
- **RDS**: 750 hours/month (t3.micro)
- **S3**: 5GB storage, 20,000 GET requests
- **CloudFront**: 1TB data transfer
- **SES**: 62,000 emails/month

### **2. Instance Sizing**
- **EC2**: t3.micro (1 vCPU, 1GB RAM) - $8/month
- **RDS**: t3.micro (1 vCPU, 1GB RAM) - $15/month
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

### **Database Setup**
```bash
#!/bin/bash
# setup-database.sh

echo "🗄️ Setting up RDS Database"

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier cattleya-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username cattleya_admin \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 20 \
  --storage-type gp2 \
  --no-multi-az \
  --no-publicly-accessible

echo "✅ Database setup complete!"
```

## 🔒 **Security (Budget-Friendly)**

### **Basic Security**
- **Security Groups**: Minimal required ports (80, 443, 22)
- **IAM**: Least privilege access
- **SSL**: Let's Encrypt (free)
- **Backup**: Daily automated backups

### **No-Cost Security Features**
- **AWS WAF**: Use CloudFlare (free tier)
- **DDoS Protection**: Basic AWS protection
- **Monitoring**: CloudWatch basic monitoring

## 📊 **Scaling Strategy**

### **Phase 1: MVP (Current)**
- Single EC2 instance
- Single RDS instance
- Basic monitoring
- **Cost: $30-50/month**

### **Phase 2: Growth**
- Add load balancer
- Multi-AZ RDS
- Auto-scaling group
- **Cost: $100-200/month**

### **Phase 3: Production**
- Full ECS deployment
- DocumentDB cluster
- Advanced monitoring
- **Cost: $300-600/month**

## 🚨 **Important Notes**

### **Limitations**
- **Single Point of Failure**: Single instance deployment
- **Limited Scalability**: Manual scaling required
- **Basic Monitoring**: Limited alerting capabilities
- **No Multi-AZ**: Potential downtime during maintenance

### **When to Upgrade**
- **Traffic > 1000 users/day**
- **Revenue > $1000/month**
- **Uptime requirements > 99.5%**
- **Need for auto-scaling**

## 🛠️ **Maintenance**

### **Daily Tasks**
- Check CloudWatch metrics
- Monitor disk space
- Review error logs

### **Weekly Tasks**
- Update security patches
- Review backup status
- Check cost usage

### **Monthly Tasks**
- Review and optimize costs
- Update SSL certificates
- Performance analysis

## 📞 **Support**

### **Free Resources**
- **AWS Documentation**: Comprehensive guides
- **Stack Overflow**: Community support
- **GitHub Issues**: Open source solutions

### **Paid Support**
- **AWS Support**: $29/month (Developer)
- **Third-party**: Various options

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Uptime**: >95%
- **Response Time**: <2 seconds
- **Error Rate**: <1%

### **Business Metrics**
- **Cost per User**: <$0.10/month
- **Revenue per User**: >$1/month
- **ROI**: >1000%

---

**Remember**: This is a startup-friendly deployment. As you grow, you can easily migrate to the full production setup without changing your application code! 