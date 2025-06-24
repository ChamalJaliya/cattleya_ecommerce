#!/bin/bash

# Redis Setup Script for Cattleya Backend
# Run this script on your EC2 instance

echo "🚀 Setting up Redis for Cattleya Backend..."

# Update system
sudo apt update

# Install Redis
echo "📦 Installing Redis..."
sudo apt install redis-server -y

# Configure Redis for production
sudo tee /etc/redis/redis.conf << EOF
# Network
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300

# General
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16

# Snapshotting
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Replication
replica-serve-stale-data yes
replica-read-only yes

# Security
# requirepass your_redis_password_here

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Append only file
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Lua scripting
lua-time-limit 5000

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency monitor
latency-monitor-threshold 100

# Event notification
notify-keyspace-events ""

# Advanced config
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
aof-rewrite-incremental-fsync yes
rdb-save-incremental-fsync yes
EOF

# Create Redis user and set permissions
sudo mkdir -p /var/lib/redis
sudo chown redis:redis /var/lib/redis
sudo chmod 750 /var/lib/redis

# Enable and start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test Redis connection
echo "🧪 Testing Redis connection..."
redis-cli ping

if [ $? -eq 0 ]; then
    echo "✅ Redis is running successfully"
else
    echo "❌ Redis failed to start"
    exit 1
fi

# Install Redis tools for monitoring
sudo apt install redis-tools -y

# Create Redis monitoring script
cat > redis-monitor.sh << 'EOF'
#!/bin/bash

echo "📊 Redis Memory Usage:"
redis-cli info memory | grep -E "(used_memory|used_memory_peak|used_memory_rss)"

echo ""
echo "📊 Redis Stats:"
redis-cli info stats | grep -E "(total_connections_received|total_commands_processed|instantaneous_ops_per_sec|total_net_input_bytes|total_net_output_bytes|rejected_connections|expired_keys|evicted_keys|keyspace_hits|keyspace_misses)"

echo ""
echo "📊 Redis Keyspace:"
redis-cli info keyspace

echo ""
echo "📊 Redis Clients:"
redis-cli client list | wc -l
echo " active clients"
EOF

chmod +x redis-monitor.sh

# Create Redis backup script
cat > redis-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="redis_backup_$DATE.rdb"

mkdir -p $BACKUP_DIR

echo "💾 Creating Redis backup: $BACKUP_FILE"

# Save current data
redis-cli save

# Copy the dump file
sudo cp /var/lib/redis/dump.rdb $BACKUP_DIR/$BACKUP_FILE

# Compress the backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "redis_backup_*.rdb.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_FILE.gz"
EOF

chmod +x redis-backup.sh

# Add backup to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/redis-backup.sh") | crontab -

echo "✅ Redis setup completed successfully!"
echo ""
echo "📝 Redis Configuration:"
echo "   Host: 127.0.0.1"
echo "   Port: 6379"
echo "   Max Memory: 256MB"
echo "   Policy: LRU eviction"
echo ""
echo "🔧 Useful Redis commands:"
echo "   redis-cli ping              - Test connection"
echo "   redis-cli info              - Get Redis info"
echo "   redis-cli monitor           - Monitor commands"
echo "   redis-cli flushall          - Clear all data"
echo "   ./redis-monitor.sh          - Monitor Redis stats"
echo "   ./redis-backup.sh           - Create backup"
echo ""
echo "⚠️  Remember to:"
echo "   1. Set a strong password in redis.conf"
echo "   2. Configure firewall rules"
echo "   3. Set up monitoring alerts"
echo "   4. Test backup and restore procedures"
EOF 