# ✅ Cattleya AWS Deployment Checklist

## Pre-Deployment Checklist

### AWS Account Setup
- [ ] AWS account created and verified
- [ ] AWS CLI installed and configured
- [ ] IAM user with appropriate permissions created
- [ ] Billing alerts set up
- [ ] Default region set to `us-east-1`

### Local Environment Setup
- [ ] Node.js 18+ installed
- [ ] AWS Amplify CLI installed: `npm install -g @aws-amplify/cli`
- [ ] jq installed for JSON parsing
- [ ] Git configured with your repository access

### Domain Setup (Optional but Recommended)
- [ ] Domain name registered (e.g., cattleya.com)
- [ ] DNS provider configured
- [ ] Domain pointing to AWS (if using Route 53)

## Deployment Steps

### Step 1: Database Setup
- [ ] Run `./setup-database.sh`
- [ ] Verify RDS instance is running
- [ ] Test database connection
- [ ] Save database credentials securely
- [ ] Run database schema setup

**Expected Output:**
```
Database Endpoint: cattleya-db.123456789.us-east-1.rds.amazonaws.com
Database Port: 5432
Database Name: cattleya
Database Username: cattleya_admin
```

### Step 2: Backend Deployment
- [ ] Update `deploy-backend.sh` with your repository URL
- [ ] Run `./deploy-backend.sh`
- [ ] Verify EC2 instance is running
- [ ] SSH into instance and check logs
- [ ] Test health endpoint: `curl http://YOUR_IP/health`
- [ ] Update environment variables with database connection

**Expected Output:**
```
Instance ID: i-1234567890abcdef0
Public IP: 3.123.45.67
SSH Command: ssh -i cattleya-key.pem ec2-user@3.123.45.67
Application URL: http://3.123.45.67
```

### Step 3: Frontend Deployment
- [ ] Run `./deploy-frontend.sh`
- [ ] Verify Amplify app is created
- [ ] Test frontend application
- [ ] Update environment variables with backend URL
- [ ] Configure custom domain (optional)

**Expected Output:**
```
Amplify App ID: d1234567890abc
Application URL: https://main.d1234567890abc.amplifyapp.com
```

### Step 4: SSL Certificate Setup (Optional)
- [ ] SSH into backend instance
- [ ] Run SSL setup script: `sudo /opt/cattleya/scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com`
- [ ] Verify SSL certificate is working
- [ ] Test HTTPS access

### Step 5: Environment Configuration
- [ ] Update backend `.env` file with:
  - [ ] Database connection string
  - [ ] JWT secret
  - [ ] AWS credentials
  - [ ] S3 bucket name
- [ ] Update frontend environment variables with:
  - [ ] Backend API URL
  - [ ] AWS region
  - [ ] S3 bucket name

## Post-Deployment Verification

### Backend Testing
- [ ] Health check: `curl http://YOUR_IP/health`
- [ ] API endpoints: `curl http://YOUR_IP/api/products`
- [ ] Database connection working
- [ ] Logs are being generated
- [ ] PM2 process is running

### Frontend Testing
- [ ] Application loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Product browsing works
- [ ] Cart functionality works
- [ ] Responsive design works

### Security Verification
- [ ] Security groups configured correctly
- [ ] Only necessary ports are open
- [ ] SSL certificate is valid (if configured)
- [ ] Environment variables are secure
- [ ] Database is not publicly accessible

### Performance Testing
- [ ] Page load times are acceptable
- [ ] API response times are good
- [ ] Database queries are optimized
- [ ] Images are loading correctly
- [ ] No memory leaks detected

## Monitoring Setup

### CloudWatch Dashboard
- [ ] Dashboard is accessible
- [ ] EC2 metrics are showing
- [ ] Application logs are being collected
- [ ] Nginx logs are being collected
- [ ] Alarms are configured

### Log Monitoring
- [ ] Application logs are readable
- [ ] Error logs are being captured
- [ ] Access logs are being captured
- [ ] Log rotation is configured
- [ ] Log retention is set

## Cost Optimization

### Free Tier Usage
- [ ] EC2 usage within free tier limits
- [ ] RDS usage within free tier limits
- [ ] S3 usage within free tier limits
- [ ] CloudFront usage within free tier limits
- [ ] SES usage within free tier limits

### Cost Monitoring
- [ ] AWS Cost Explorer enabled
- [ ] Billing alerts configured
- [ ] Monthly cost tracking set up
- [ ] Cost optimization recommendations reviewed
- [ ] Unused resources identified and removed

## Backup and Recovery

### Database Backup
- [ ] Automated backups enabled
- [ ] Backup retention period set
- [ ] Backup restoration tested
- [ ] Point-in-time recovery available
- [ ] Cross-region backup configured (optional)

### Application Backup
- [ ] Code repository backed up
- [ ] Environment configuration backed up
- [ ] SSL certificates backed up
- [ ] Recovery procedures documented
- [ ] Disaster recovery plan created

## Documentation

### Technical Documentation
- [ ] Deployment guide completed
- [ ] Environment variables documented
- [ ] API documentation updated
- [ ] Database schema documented
- [ ] Troubleshooting guide created

### Operational Documentation
- [ ] Monitoring procedures documented
- [ ] Backup procedures documented
- [ ] Scaling procedures documented
- [ ] Security procedures documented
- [ ] Incident response plan created

## Future Enhancements

### Performance Improvements
- [ ] CDN optimization
- [ ] Database query optimization
- [ ] Image optimization
- [ ] Caching implementation
- [ ] Load balancing setup

### Security Enhancements
- [ ] WAF implementation
- [ ] DDoS protection
- [ ] Security scanning
- [ ] Penetration testing
- [ ] Compliance audit

### Scalability Planning
- [ ] Auto-scaling configuration
- [ ] Load balancer setup
- [ ] Multi-AZ deployment
- [ ] Database clustering
- [ ] Microservices architecture

## Support and Maintenance

### Monitoring and Alerting
- [ ] Critical alerts configured
- [ ] Performance alerts configured
- [ ] Cost alerts configured
- [ ] Security alerts configured
- [ ] On-call procedures established

### Maintenance Procedures
- [ ] Regular security updates
- [ ] Database maintenance
- [ ] Application updates
- [ ] Infrastructure updates
- [ ] Backup verification

---

## Quick Commands Reference

```bash
# Check deployment status
aws ec2 describe-instances --filters "Name=tag:Name,Values=cattleya-backend"

# SSH into backend
ssh -i cattleya-key.pem ec2-user@YOUR_IP

# Check application logs
pm2 logs cattleya-backend

# Check nginx logs
sudo tail -f /var/log/nginx/access.log

# Test database connection
psql -h YOUR_DB_ENDPOINT -U cattleya_admin -d cattleya

# Check CloudWatch dashboard
aws cloudwatch get-dashboard --dashboard-name Cattleya-Budget-Dashboard

# Monitor costs
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics BlendedCost
```

---

**Remember**: This checklist ensures a complete and secure deployment. Check off each item as you complete it! 