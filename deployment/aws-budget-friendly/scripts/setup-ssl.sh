#!/bin/bash

# SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt

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

# Check if domain is provided
if [ $# -eq 0 ]; then
    print_error "Usage: $0 <domain-name> [email]"
    echo "Example: $0 cattleya.com admin@cattleya.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

print_status "Setting up SSL certificate for domain: $DOMAIN"
print_status "Email: $EMAIL"

# Install certbot
install_certbot() {
    print_status "Installing Certbot..."
    
    # Install EPEL repository
    yum install -y epel-release
    
    # Install certbot and nginx plugin
    yum install -y certbot python3-certbot-nginx
    
    print_success "Certbot installed successfully."
}

# Update nginx configuration
update_nginx_config() {
    print_status "Updating Nginx configuration..."
    
    # Create nginx configuration with SSL
    cat > /etc/nginx/conf.d/cattleya.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuration will be added by certbot
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF

    # Test nginx configuration
    nginx -t
    
    # Reload nginx
    systemctl reload nginx
    
    print_success "Nginx configuration updated."
}

# Obtain SSL certificate
obtain_certificate() {
    print_status "Obtaining SSL certificate from Let's Encrypt..."
    
    # Stop nginx temporarily for certbot
    systemctl stop nginx
    
    # Obtain certificate
    certbot certonly \
        --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --domains $DOMAIN,www.$DOMAIN \
        --non-interactive
    
    print_success "SSL certificate obtained successfully."
}

# Configure nginx with SSL
configure_nginx_ssl() {
    print_status "Configuring Nginx with SSL..."
    
    # Update nginx configuration with SSL
    cat > /etc/nginx/conf.d/cattleya.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF

    # Test nginx configuration
    nginx -t
    
    # Start nginx
    systemctl start nginx
    
    print_success "Nginx configured with SSL."
}

# Setup auto-renewal
setup_auto_renewal() {
    print_status "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /opt/cattleya/renew-ssl.sh << 'EOF'
#!/bin/bash

# SSL Certificate Renewal Script
echo "Renewing SSL certificates..."

# Renew certificates
certbot renew --quiet

# Reload nginx if certificates were renewed
if [ $? -eq 0 ]; then
    echo "Certificates renewed successfully. Reloading nginx..."
    systemctl reload nginx
else
    echo "Certificate renewal failed."
    exit 1
fi
EOF

    chmod +x /opt/cattleya/renew-ssl.sh
    
    # Add to crontab (run twice daily)
    (crontab -l 2>/dev/null; echo "0 2,14 * * * /opt/cattleya/renew-ssl.sh") | crontab -
    
    print_success "Auto-renewal configured (runs at 2 AM and 2 PM daily)."
}

# Test SSL configuration
test_ssl() {
    print_status "Testing SSL configuration..."
    
    # Test nginx configuration
    if nginx -t; then
        print_success "Nginx configuration is valid."
    else
        print_error "Nginx configuration is invalid."
        exit 1
    fi
    
    # Test SSL certificate
    if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        print_success "SSL certificate is valid."
    else
        print_warning "SSL certificate test failed. Please check manually."
    fi
}

# Display information
show_info() {
    print_status "SSL Setup Information:"
    echo
    echo "Domain: $DOMAIN"
    echo "Email: $EMAIL"
    echo "Certificate Path: /etc/letsencrypt/live/$DOMAIN/"
    echo "Nginx Config: /etc/nginx/conf.d/cattleya.conf"
    echo "Renewal Script: /opt/cattleya/renew-ssl.sh"
    echo
    print_success "SSL setup complete!"
    echo
    echo "🔒 Your site is now accessible via HTTPS:"
    echo "   https://$DOMAIN"
    echo
    echo "📝 Next steps:"
    echo "1. Test your website at https://$DOMAIN"
    echo "2. Update your DNS records if needed"
    echo "3. Certificates will auto-renew every 60 days"
    echo "4. Monitor renewal logs: tail -f /var/log/letsencrypt/letsencrypt.log"
}

# Main function
main() {
    echo "🔒 SSL Certificate Setup for Cattleya"
    echo "====================================="
    echo
    
    install_certbot
    update_nginx_config
    obtain_certificate
    configure_nginx_ssl
    setup_auto_renewal
    test_ssl
    show_info
}

# Run main function
main "$@" 