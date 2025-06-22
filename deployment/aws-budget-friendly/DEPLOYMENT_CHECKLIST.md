# 📋 Cattleya Deployment Checklist (Budget-Friendly)

Complete this checklist to deploy your Cattleya e-commerce application on AWS with MongoDB Atlas.

## 🗄️ **Phase 1: Database Setup (MongoDB Atlas)**

### **MongoDB Atlas Setup**
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/atlas
- [ ] Create free cluster (M0 tier)
- [ ] Configure database user (cattleya_admin)
- [ ] Set up IP whitelist (add your EC2 IP or 0.0.0.0/0 for development)
- [ ] Get connection string
- [ ] Test connection with MongoDB Compass or mongosh

**Connection String Format:**
```
mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority
```

### **Database Schema Setup**
- [ ] SSH into EC2 instance
- [ ] Navigate to backend directory: `cd /opt/cattleya/cattleya-backend`
- [ ] Install dependencies: `npm install`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Push schema to database: `npx prisma db push`
- [ ] Seed database (if available): `npm run db:seed`
- [ ] Verify collections created: `npx prisma studio`

## 🖥️ **Phase 2: Backend Deployment (EC2)**

### **EC2 Instance Setup**
- [ ] Verify EC2 instance is running
- [ ] Check security group allows ports 22, 80, 443, 3001
- [ ] SSH into instance: `ssh -i your-key.pem ec2-user@YOUR_EC2_IP`
- [ ] Update system: `sudo yum update -y`

### **Docker Installation**
- [ ] Install Docker: `sudo yum install -y docker`
- [ ] Start Docker service: `sudo systemctl start docker`
- [ ] Enable Docker: `sudo systemctl enable docker`
- [ ] Add user to docker group: `sudo usermod -a -G docker ec2-user`
- [ ] Install Docker Compose: `sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose`

### **Application Deployment**
- [ ] Create application directory: `sudo mkdir -p /opt/cattleya`
- [ ] Clone repository: `sudo git clone https://github.com/your-username/Cattleya_E.git /opt/cattleya`
- [ ] Set permissions: `sudo chown -R ec2-user:ec2-user /opt/cattleya`
- [ ] Navigate to backend: `cd /opt/cattleya/cattleya-backend`
- [ ] Install dependencies: `npm install`
- [ ] Build application: `npm run build`

### **Environment Configuration**
- [ ] Create .env file with MongoDB connection
- [ ] Set NODE_ENV=production
- [ ] Configure JWT_SECRET
- [ ] Set S3_BUCKET and AWS credentials
- [ ] Configure CORS_ORIGIN
- [ ] Test environment variables

**Example .env file:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1
CORS_ORIGIN=https://yourdomain.com
```

### **Process Management**
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start application: `pm2 start npm --name "cattleya-backend" -- start:prod`
- [ ] Save PM2 configuration: `pm2 save`
- [ ] Setup PM2 startup: `pm2 startup`
- [ ] Verify application is running: `pm2 status`

### **Nginx Configuration**
- [ ] Install Nginx: `sudo yum install -y nginx`
- [ ] Configure Nginx for reverse proxy
- [ ] Start Nginx: `sudo systemctl start nginx`
- [ ] Enable Nginx: `sudo systemctl enable nginx`
- [ ] Test Nginx configuration: `sudo nginx -t`

## 🌐 **Phase 3: Frontend Deployment (Amplify)**

### **AWS Amplify Setup**
- [ ] Install Amplify CLI: `npm install -g @aws-amplify/cli`
- [ ] Configure Amplify: `amplify configure`
- [ ] Initialize Amplify in frontend directory
- [ ] Add hosting: `amplify add hosting`
- [ ] Publish application: `amplify publish`

### **Frontend Configuration**
- [ ] Update API endpoint in frontend
- [ ] Configure environment variables
- [ ] Test API connectivity
- [ ] Verify all features work

## 🔒 **Phase 4: Security & SSL**

### **SSL Certificate**
- [ ] Install Certbot: `sudo yum install -y certbot python3-certbot-nginx`
- [ ] Obtain SSL certificate: `sudo certbot --nginx -d yourdomain.com`
- [ ] Test SSL configuration
- [ ] Setup auto-renewal: `sudo crontab -e` (add: `0 12 * * * /usr/bin/certbot renew --quiet`)

### **Security Hardening**
- [ ] Configure firewall rules
- [ ] Update security groups
- [ ] Enable CloudWatch monitoring
- [ ] Setup log rotation
- [ ] Configure backup strategy

## 📊 **Phase 5: Monitoring & Testing**

### **Health Checks**
- [ ] Test backend API endpoints
- [ ] Verify database connectivity
- [ ] Check frontend functionality
- [ ] Test payment integration (if applicable)
- [ ] Verify email notifications

### **Performance Testing**
- [ ] Load test with basic traffic
- [ ] Monitor response times
- [ ] Check memory and CPU usage
- [ ] Verify auto-scaling (if configured)

## 🚀 **Phase 6: Go Live**

### **Final Verification**
- [ ] Update DNS records
- [ ] Test from different locations
- [ ] Verify SSL certificate
- [ ] Check all user flows
- [ ] Monitor error logs

### **Documentation**
- [ ] Update deployment documentation
- [ ] Create runbook for common issues
- [ ] Document backup procedures
- [ ] Setup monitoring alerts

## 💰 **Cost Optimization Verification**

### **Free Tier Usage**
- [ ] EC2 usage within 750 hours/month
- [ ] MongoDB Atlas free tier (512MB)
- [ ] S3 usage within 5GB
- [ ] CloudFront usage within 1TB
- [ ] SES usage within 62,000 emails/month

### **Monthly Cost Tracking**
- [ ] Set up AWS Cost Explorer alerts
- [ ] Monitor spending patterns
- [ ] Optimize resource usage
- [ ] Review and adjust instance sizes

## 🔧 **Troubleshooting**

### **Common Issues**
- [ ] Database connection problems
- [ ] SSL certificate issues
- [ ] Nginx configuration errors
- [ ] PM2 process management
- [ ] Environment variable issues

### **Emergency Procedures**
- [ ] Backup procedures documented
- [ ] Rollback procedures ready
- [ ] Support contacts available
- [ ] Monitoring alerts configured

---

## ✅ **Deployment Complete Checklist**

### **Pre-Launch**
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Team trained on deployment

### **Launch Day**
- [ ] DNS propagation complete
- [ ] SSL certificate active
- [ ] Monitoring alerts active
- [ ] Backup systems verified
- [ ] Support team ready

### **Post-Launch**
- [ ] Monitor for 24 hours
- [ ] Check error rates
- [ ] Verify user feedback
- [ ] Performance optimization
- [ ] Cost analysis

---

**Total Estimated Cost: $15-35/month** 🎉

**Next Steps:**
1. Follow this checklist step by step
2. Use the [Quick Start Guide](QUICK_START.md) for detailed instructions
3. Refer to [MongoDB Setup Guide](mongodb-setup.md) for database configuration
4. Monitor costs and performance regularly 