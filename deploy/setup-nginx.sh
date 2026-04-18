#!/bin/bash
# ============================================
# 🌐 Nginx + SSL Setup Script
# Usage: bash setup-nginx.sh yourdomain.com
# ============================================

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Usage: bash setup-nginx.sh yourdomain.com"
    exit 1
fi

echo "=========================================="
echo "🌐 Setting up Nginx for: $DOMAIN"
echo "=========================================="

# Create Nginx config
cat > /etc/nginx/sites-available/marketplace << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend (Angular - Static Files)
    location / {
        root /var/www/marketplace/frontend-dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (Proxy to NestJS)
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Upload size limit (50MB)
        client_max_body_size 50M;
    }

    # Uploads directory
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

echo ""
echo "✅ Nginx configured for http://$DOMAIN"
echo ""

# Setup SSL
echo "🔒 Setting up SSL with Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

echo ""
echo "=========================================="
echo "✅ Nginx + SSL Setup Complete!"
echo "=========================================="
echo ""
echo "Your site is live at:"
echo "  🌐 https://$DOMAIN"
echo "  🔗 API: https://$DOMAIN/api/"
echo ""
echo "SSL auto-renewal is enabled by certbot."
