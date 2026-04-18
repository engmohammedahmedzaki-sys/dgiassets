#!/bin/bash
# ============================================
# 🗄️ Database Setup Script
# Sets up PostgreSQL via Docker
# ============================================

set -e

echo "=========================================="
echo "🗄️ Setting up PostgreSQL Database"
echo "=========================================="

# Generate a random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d /=+ | head -c 32)

cd /var/www/marketplace

# Create docker-compose for production database
cat > docker-compose.yml << EOF
services:
  db:
    image: postgres:15-alpine
    container_name: marketplace_db
    restart: always
    environment:
      POSTGRES_USER: marketplace_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: marketplace
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# Test connection
docker exec marketplace_db pg_isready -U marketplace_user -d marketplace

echo ""
echo "=========================================="
echo "✅ Database Setup Complete!"
echo "=========================================="
echo ""
echo "⚠️  SAVE THESE CREDENTIALS (they won't be shown again):"
echo "   DB_HOST=127.0.0.1"
echo "   DB_PORT=5432"
echo "   DB_USER=marketplace_user"
echo "   DB_PASSWORD=${DB_PASSWORD}"
echo "   DB_NAME=marketplace"
echo ""

# Setup backup cron
echo "📋 Setting up daily backups..."
mkdir -p /var/www/marketplace/backups

cat > /var/www/marketplace/backup.sh << 'BACKUP'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec marketplace_db pg_dump -U marketplace_user marketplace > /var/www/marketplace/backups/backup_$DATE.sql
gzip /var/www/marketplace/backups/backup_$DATE.sql
# Delete backups older than 30 days
find /var/www/marketplace/backups -name "*.sql.gz" -mtime +30 -delete
echo "Backup completed: backup_$DATE.sql.gz"
BACKUP

chmod +x /var/www/marketplace/backup.sh

# Add cron job for daily backup at 3 AM
(crontab -l 2>/dev/null | grep -v backup.sh; echo "0 3 * * * /var/www/marketplace/backup.sh >> /var/log/marketplace-backup.log 2>&1") | crontab -

echo "✅ Daily backups configured (3:00 AM)"
