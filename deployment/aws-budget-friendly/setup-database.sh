#!/bin/bash

# 🌱 Cattleya Database Setup (Budget-Friendly)
# This script sets up a single RDS instance for the database

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
DB_INSTANCE_CLASS="db.t3.micro"
DB_ENGINE="postgres"
DB_NAME="cattleya"
DB_USERNAME="cattleya_admin"
DB_INSTANCE_IDENTIFIER="cattleya-db"
SUBNET_GROUP_NAME="cattleya-db-subnet-group"
SECURITY_GROUP_NAME="cattleya-db-sg"

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

# Create VPC and subnets for RDS
create_vpc_resources() {
    print_status "Creating VPC resources for RDS..."
    
    # Get default VPC
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=is-default,Values=true" \
        --region $REGION \
        --query 'Vpcs[0].VpcId' --output text)
    
    # Get availability zones
    AZS=$(aws ec2 describe-availability-zones \
        --region $REGION \
        --query 'AvailabilityZones[0:2].ZoneName' --output text)
    
    AZ1=$(echo $AZS | cut -d' ' -f1)
    AZ2=$(echo $AZS | cut -d' ' -f2)
    
    print_status "Using VPC: $VPC_ID"
    print_status "Using AZs: $AZ1, $AZ2"
    
    # Create subnet group
    if ! aws rds describe-db-subnet-groups --db-subnet-group-name $SUBNET_GROUP_NAME --region $REGION &> /dev/null; then
        print_status "Creating DB subnet group..."
        
        # Get subnets
        SUBNET1=$(aws ec2 describe-subnets \
            --filters "Name=vpc-id,Values=$VPC_ID" "Name=availability-zone,Values=$AZ1" \
            --region $REGION \
            --query 'Subnets[0].SubnetId' --output text)
        
        SUBNET2=$(aws ec2 describe-subnets \
            --filters "Name=vpc-id,Values=$VPC_ID" "Name=availability-zone,Values=$AZ2" \
            --region $REGION \
            --query 'Subnets[0].SubnetId' --output text)
        
        aws rds create-db-subnet-group \
            --db-subnet-group-name $SUBNET_GROUP_NAME \
            --db-subnet-group-description "Subnet group for Cattleya database" \
            --subnet-ids $SUBNET1 $SUBNET2 \
            --region $REGION
        
        print_success "DB subnet group created."
    else
        print_warning "DB subnet group $SUBNET_GROUP_NAME already exists."
    fi
}

# Create security group for RDS
create_security_group() {
    print_status "Creating security group for RDS..."
    
    if aws ec2 describe-security-groups --group-names $SECURITY_GROUP_NAME --region $REGION &> /dev/null; then
        print_warning "Security group $SECURITY_GROUP_NAME already exists."
        return
    fi
    
    # Create security group
    SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for Cattleya database" \
        --vpc-id $(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region $REGION --query 'Vpcs[0].VpcId' --output text) \
        --region $REGION \
        --query 'GroupId' --output text)
    
    # Add rule for PostgreSQL
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 5432 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    print_success "Security group created: $SG_ID"
}

# Generate database password
generate_password() {
    print_status "Generating database password..."
    
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Save password to file
    echo "DB_PASSWORD=$DB_PASSWORD" > db-credentials.env
    chmod 600 db-credentials.env
    
    print_success "Database password generated and saved to db-credentials.env"
}

# Create RDS instance
create_rds_instance() {
    print_status "Creating RDS instance..."
    
    if aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE_IDENTIFIER --region $REGION &> /dev/null; then
        print_warning "RDS instance $DB_INSTANCE_IDENTIFIER already exists."
        return
    fi
    
    # Get security group ID
    SG_ID=$(aws ec2 describe-security-groups \
        --group-names $SECURITY_GROUP_NAME \
        --region $REGION \
        --query 'SecurityGroups[0].GroupId' --output text)
    
    # Create RDS instance
    aws rds create-db-instance \
        --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
        --db-instance-class $DB_INSTANCE_CLASS \
        --engine $DB_ENGINE \
        --master-username $DB_USERNAME \
        --master-user-password $DB_PASSWORD \
        --allocated-storage 20 \
        --storage-type gp2 \
        --db-name $DB_NAME \
        --db-subnet-group-name $SUBNET_GROUP_NAME \
        --vpc-security-group-ids $SG_ID \
        --no-multi-az \
        --no-publicly-accessible \
        --backup-retention-period 7 \
        --preferred-backup-window "03:00-04:00" \
        --preferred-maintenance-window "sun:04:00-sun:05:00" \
        --region $REGION
    
    print_success "RDS instance creation initiated."
    
    # Wait for instance to be available
    print_status "Waiting for RDS instance to be available..."
    aws rds wait db-instance-available \
        --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
        --region $REGION
    
    print_success "RDS instance is available."
}

# Get database endpoint
get_database_endpoint() {
    print_status "Getting database endpoint..."
    
    DB_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
        --region $REGION \
        --query 'DBInstances[0].Endpoint.Address' --output text)
    
    DB_PORT=$(aws rds describe-db-instances \
        --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
        --region $REGION \
        --query 'DBInstances[0].Endpoint.Port' --output text)
    
    print_success "Database endpoint: $DB_ENDPOINT:$DB_PORT"
    
    # Save connection details
    echo "DB_ENDPOINT=$DB_ENDPOINT" >> db-credentials.env
    echo "DB_PORT=$DB_PORT" >> db-credentials.env
    echo "DB_NAME=$DB_NAME" >> db-credentials.env
    echo "DB_USERNAME=$DB_USERNAME" >> db-credentials.env
}

# Setup database schema
setup_database_schema() {
    print_status "Setting up database schema..."
    
    # Create schema file
    cat > setup-schema.sql << 'EOF'
-- Cattleya Database Schema
-- This is a basic schema for the e-commerce application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_blocked BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    is_on_sale BOOLEAN DEFAULT FALSE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    track_quantity BOOLEAN DEFAULT TRUE,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    category_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(255),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER REFERENCES wishlist(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO categories (name, slug, description) VALUES 
('Orchids', 'orchids', 'Beautiful orchid varieties'),
('Phalaenopsis', 'phalaenopsis', 'Moth orchids'),
('Cattleya', 'cattleya', 'Corsage orchids')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, base_price, sku, stock_quantity, category_id) VALUES 
('White Phalaenopsis', 'white-phalaenopsis', 'Beautiful white moth orchid', 29.99, 'ORCH-001', 50, 1),
('Pink Cattleya', 'pink-cattleya', 'Stunning pink cattleya orchid', 39.99, 'ORCH-002', 30, 1)
ON CONFLICT (slug) DO NOTHING;

EOF

    print_success "Database schema file created: setup-schema.sql"
    print_warning "You'll need to run this schema manually or use a migration tool."
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up database monitoring..."
    
    # Create CloudWatch alarm for high CPU
    aws cloudwatch put-metric-alarm \
        --alarm-name "cattleya-db-cpu-high" \
        --alarm-description "High CPU utilization on Cattleya database" \
        --metric-name CPUUtilization \
        --namespace AWS/RDS \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --dimensions Name=DBInstanceIdentifier,Value=$DB_INSTANCE_IDENTIFIER \
        --region $REGION
    
    print_success "Database monitoring configured."
}

# Display setup info
show_setup_info() {
    print_status "Database Setup Information:"
    echo
    
    if [ -f db-credentials.env ]; then
        source db-credentials.env
        echo "Database Endpoint: $DB_ENDPOINT"
        echo "Database Port: $DB_PORT"
        echo "Database Name: $DB_NAME"
        echo "Database Username: $DB_USERNAME"
        echo "Database Password: [saved in db-credentials.env]"
        echo
        echo "Connection String:"
        echo "postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_ENDPOINT:$DB_PORT/$DB_NAME"
        echo
        print_success "Database setup complete!"
        echo
        echo "Next steps:"
        echo "1. Update your application's DATABASE_URL"
        echo "2. Run the schema setup: psql -h $DB_ENDPOINT -U $DB_USERNAME -d $DB_NAME -f setup-schema.sql"
        echo "3. Test the connection from your application"
        echo "4. Set up regular backups (already configured)"
    else
        print_error "Database credentials not found."
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up temporary files..."
    # Keep db-credentials.env and setup-schema.sql for reference
    print_success "Cleanup complete."
}

# Main setup function
main() {
    echo "🌱 Cattleya Database Setup (Budget-Friendly)"
    echo "============================================"
    echo
    
    check_prerequisites
    create_vpc_resources
    create_security_group
    generate_password
    create_rds_instance
    get_database_endpoint
    setup_database_schema
    setup_monitoring
    show_setup_info
    cleanup
}

# Run main function
main "$@" 