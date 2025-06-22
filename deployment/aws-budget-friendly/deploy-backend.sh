#!/bin/bash

# 🌱 Cattleya Backend Deployment (Budget-Friendly)
# This script deploys the backend to a single EC2 instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
REGION="us-east-1"
INSTANCE_TYPE="t3.micro"
AMI_ID="ami-0c02fb55956c7d316"  # Amazon Linux 2
KEY_NAME="cattleya-key"
SECURITY_GROUP_NAME="cattleya-backend-sg"
INSTANCE_NAME="cattleya-backend"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed."
}

# Create security group
create_security_group() {
    print_status "Creating security group..."
    
    # Check if security group already exists
    if aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $REGION &> /dev/null; then
        print_warning "Security group $SECURITY_GROUP_NAME already exists."
        return
    fi
    
    # Create security group
    SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for Cattleya backend" \
        --region $REGION \
        --query 'GroupId' --output text)
    
    # Add rules
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 3001 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    print_success "Security group created: $SG_ID"
}

# Create key pair
create_key_pair() {
    print_status "Creating key pair..."
    
    if aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION &> /dev/null; then
        print_warning "Key pair $KEY_NAME already exists."
        return
    fi
    
    aws ec2 create-key-pair \
        --key-name $KEY_NAME \
        --region $REGION \
        --query 'KeyMaterial' --output text > $KEY_NAME.pem
    
    chmod 400 $KEY_NAME.pem
    print_success "Key pair created: $KEY_NAME.pem"
}

# Create user data script
create_user_data() {
    print_status "Creating user data script..."
    
    cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y
yum install -y docker git nginx

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2
npm install -g pm2

# Create application directory
mkdir -p /opt/cattleya
cd /opt/cattleya

# Clone repository (you'll need to update this with your repo)
git clone https://github.com/your-username/Cattleya_E.git .

# Build and start backend
cd cattleya-backend
npm install
npm run build
pm2 start npm --name "cattleya-backend" -- start:prod

# Setup Nginx
cat > /etc/nginx/conf.d/cattleya.conf << 'NGINX_EOF'
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
NGINX_EOF

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Setup SSL with Let's Encrypt (optional)
# yum install -y certbot python3-certbot-nginx
# certbot --nginx -d your-domain.com --non-interactive --agree-tos --email your-email@example.com

echo "Cattleya backend setup complete!"
EOF

    print_success "User data script created."
}

# Launch EC2 instance
launch_instance() {
    print_status "Launching EC2 instance..."
    
    # Get security group ID
    SG_ID=$(aws ec2 describe-security-groups \
        --group-names $SECURITY_GROUP_NAME \
        --region $REGION \
        --query 'SecurityGroups[0].GroupId' --output text)
    
    # Get default VPC and subnet
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=is-default,Values=true" \
        --region $REGION \
        --query 'Vpcs[0].VpcId' --output text)
    
    SUBNET_ID=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --region $REGION \
        --query 'Subnets[0].SubnetId' --output text)
    
    # Launch instance
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id $AMI_ID \
        --instance-type $INSTANCE_TYPE \
        --key-name $KEY_NAME \
        --security-group-ids $SG_ID \
        --subnet-id $SUBNET_ID \
        --user-data file://user-data.sh \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
        --region $REGION \
        --query 'Instances[0].InstanceId' --output text)
    
    print_success "Instance launched: $INSTANCE_ID"
    
    # Wait for instance to be running
    print_status "Waiting for instance to be running..."
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION
    
    # Get public IP
    PUBLIC_IP=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --region $REGION \
        --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
    
    print_success "Instance is running at: $PUBLIC_IP"
    
    # Save instance details
    echo "INSTANCE_ID=$INSTANCE_ID" > instance-details.env
    echo "PUBLIC_IP=$PUBLIC_IP" >> instance-details.env
    echo "KEY_FILE=$KEY_NAME.pem" >> instance-details.env
    
    print_success "Instance details saved to instance-details.env"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up basic monitoring..."
    
    # Create CloudWatch dashboard
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
                    ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "cattleya-backend"],
                    [".", "NetworkIn", ".", "."],
                    [".", "NetworkOut", ".", "."]
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
        --dashboard-name "Cattleya-Budget-Dashboard" \
        --dashboard-body file://dashboard.json \
        --region $REGION
    
    print_success "CloudWatch dashboard created."
}

# Display deployment info
show_deployment_info() {
    print_status "Deployment Information:"
    echo
    
    if [ -f instance-details.env ]; then
        source instance-details.env
        echo "Instance ID: $INSTANCE_ID"
        echo "Public IP: $PUBLIC_IP"
        echo "SSH Command: ssh -i $KEY_FILE ec2-user@$PUBLIC_IP"
        echo "Application URL: http://$PUBLIC_IP"
        echo
        print_success "Backend deployed successfully!"
        echo
        echo "Next steps:"
        echo "1. SSH into the instance to check logs"
        echo "2. Update DNS to point to $PUBLIC_IP"
        echo "3. Setup SSL certificate with Let's Encrypt"
        echo "4. Deploy frontend to AWS Amplify"
    else
        print_error "Instance details not found."
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f user-data.sh dashboard.json
    print_success "Cleanup complete."
}

# Main deployment function
main() {
    echo "🌱 Cattleya Backend Deployment (Budget-Friendly)"
    echo "================================================"
    echo
    
    check_prerequisites
    create_security_group
    create_key_pair
    create_user_data
    launch_instance
    setup_monitoring
    show_deployment_info
    cleanup
}

# Run main function
main "$@" 