# 🗄️ MongoDB Setup for Cattleya

Since your application uses MongoDB (not PostgreSQL/MySQL), you don't need AWS RDS. Here are your MongoDB options:

## 🚀 **Option 1: MongoDB Atlas (Recommended)**

### **Why MongoDB Atlas?**
- ✅ **Free tier**: 512MB storage, shared clusters
- ✅ **Managed service**: No server management
- ✅ **Automatic backups**: Built-in backup system
- ✅ **Global distribution**: Multiple regions
- ✅ **Security**: Built-in authentication and encryption
- ✅ **Cost**: $0/month (free tier)

### **Setup Steps:**

1. **Create MongoDB Atlas Account**
   ```bash
   # Go to https://www.mongodb.com/atlas
   # Click "Try Free"
   # Create account
   ```

2. **Create Free Cluster**
   ```bash
   # Choose "FREE" tier
   # Select cloud provider: AWS
   # Select region: us-east-1 (same as your EC2)
   # Click "Create"
   ```

3. **Create Database User**
   ```bash
   # Go to Database Access
   # Click "Add New Database User"
   # Username: cattleya_admin
   # Password: your_secure_password
   # Role: Atlas admin
   # Click "Add User"
   ```

4. **Get Connection String**
   ```bash
   # Go to Database
   # Click "Connect"
   # Choose "Connect your application"
   # Copy the connection string
   ```

5. **Update Environment Variables**
   ```env
   DATABASE_URL="mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority"
   ```

## 💻 **Option 2: MongoDB on EC2 (Budget Option)**

### **Why Local MongoDB?**
- ✅ **No additional costs**: Uses your existing EC2
- ✅ **Full control**: Complete database control
- ✅ **No internet dependency**: Local access only
- ❌ **Manual management**: You handle backups, updates
- ❌ **Single point of failure**: If EC2 goes down, DB goes down

### **Setup Steps:**

1. **SSH into EC2**
   ```bash
   ssh -i your-key.pem ec2-user@YOUR_EC2_IP
   ```

2. **Install MongoDB**
   ```bash
   # Update system
   sudo yum update -y
   
   # Create MongoDB repository file
   sudo tee /etc/yum.repos.d/mongodb-org.repo << 'EOF'
   [mongodb-org-7.0]
   name=MongoDB Repository
   baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/7.0/x86_64/
   gpgcheck=1
   enabled=1
   gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
   EOF
   
   # Install MongoDB
   sudo yum install -y mongodb-org
   ```

3. **Start MongoDB**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Check status
   sudo systemctl status mongod
   ```

4. **Create Database and User**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Switch to cattleya database
   use cattleya
   
   # Create admin user
   db.createUser({
     user: "cattleya_admin",
     pwd: "your_secure_password",
     roles: [
       { role: "readWrite", db: "cattleya" },
       { role: "dbAdmin", db: "cattleya" }
     ]
   })
   
   # Test the user
   db.auth("cattleya_admin", "your_secure_password")
   
   # Exit MongoDB shell
   exit
   ```

5. **Enable Authentication**
   ```bash
   # Edit MongoDB configuration
   sudo nano /etc/mongod.conf
   
   # Add security section
   security:
     authorization: enabled
   
   # Restart MongoDB
   sudo systemctl restart mongod
   ```

6. **Update Environment Variables**
   ```env
   DATABASE_URL="mongodb://cattleya_admin:your_password@localhost:27017/cattleya?authSource=cattleya"
   ```

## 🔧 **Database Schema Setup**

After setting up MongoDB, you need to create the database schema:

### **Using Prisma (Recommended)**
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Navigate to backend
cd /opt/cattleya/cattleya-backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (if you have seed data)
npm run db:seed
```

### **Manual Setup (Alternative)**
```bash
# Connect to MongoDB
mongosh "mongodb://cattleya_admin:your_password@localhost:27017/cattleya?authSource=cattleya"

# The collections will be created automatically when your app starts
# But you can verify they exist:
show collections

# Check if data exists
db.users.find().limit(1)
db.products.find().limit(1)
db.categories.find().limit(1)
```

## 🔒 **Security Best Practices**

### **For MongoDB Atlas:**
- ✅ Use strong passwords
- ✅ Enable IP whitelist (add your EC2 IP)
- ✅ Enable VPC peering (optional)
- ✅ Enable encryption at rest
- ✅ Enable audit logging

### **For Local MongoDB:**
- ✅ Use strong passwords
- ✅ Enable authentication
- ✅ Configure firewall rules
- ✅ Regular backups
- ✅ Keep MongoDB updated

## 📊 **Backup Strategy**

### **MongoDB Atlas:**
- ✅ Automatic daily backups
- ✅ Point-in-time recovery
- ✅ Cross-region backups
- ✅ No additional setup needed

### **Local MongoDB:**
```bash
# Create backup script
cat > /opt/cattleya/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/cattleya/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cattleya_$DATE.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --uri="mongodb://cattleya_admin:your_password@localhost:27017/cattleya?authSource=cattleya" --gzip --archive=$BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "cattleya_*.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
EOF

# Make executable
chmod +x /opt/cattleya/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/cattleya/backup-mongodb.sh") | crontab -
```

## 🧪 **Testing Database Connection**

### **Test MongoDB Atlas:**
```bash
# Test connection string
mongosh "mongodb+srv://cattleya_admin:your_password@cluster.mongodb.net/cattleya?retryWrites=true&w=majority"

# Test basic operations
use cattleya
db.users.insertOne({email: "test@example.com", firstName: "Test", lastName: "User"})
db.users.find()
db.users.deleteOne({email: "test@example.com"})
```

### **Test Local MongoDB:**
```bash
# Test connection
mongosh "mongodb://cattleya_admin:your_password@localhost:27017/cattleya?authSource=cattleya"

# Test basic operations
use cattleya
db.users.insertOne({email: "test@example.com", firstName: "Test", lastName: "User"})
db.users.find()
db.users.deleteOne({email: "test@example.com"})
```

## 💰 **Cost Comparison**

| Option | Monthly Cost | Pros | Cons |
|--------|-------------|------|------|
| **MongoDB Atlas (Free)** | $0 | Managed, backups, global | 512MB limit |
| **MongoDB Atlas (Paid)** | $9+ | Full features, scaling | Additional cost |
| **Local MongoDB** | $0 | Full control, no limits | Manual management |
| **AWS DocumentDB** | $200+ | AWS native | Expensive, overkill |

## 🎯 **Recommendation**

**For your startup budget, I recommend MongoDB Atlas Free Tier:**

1. **Start with Atlas Free** ($0/month)
2. **512MB is enough** for initial development
3. **Upgrade when needed** (when you hit limits)
4. **No server management** required
5. **Automatic backups** included

## 📝 **Next Steps**

1. **Choose your MongoDB option** (Atlas recommended)
2. **Set up the database** following the steps above
3. **Update your environment variables**
4. **Test the connection**
5. **Deploy your application**

---

**Remember**: You don't need RDS at all! MongoDB is perfect for your e-commerce application and much more cost-effective for startups. 🚀 