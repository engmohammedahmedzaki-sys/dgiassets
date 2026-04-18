#!/bin/bash
# ============================================
# 🚀 Application Deployment Script
# Deploys backend + frontend
# ============================================

set -e

echo "=========================================="
echo "🚀 Deploying Marketplace Application"
echo "=========================================="

APP_DIR="/var/www/marketplace/app"
FRONTEND_DIST="/var/www/marketplace/frontend-dist"

# Check if .env exists
if [ ! -f "$APP_DIR/backend/.env" ]; then
    echo "❌ ERROR: backend/.env not found!"
    echo "Create it first with your database credentials."
    echo ""
    echo "Example:"
    echo "  DB_HOST=127.0.0.1"
    echo "  DB_PORT=5432"
    echo "  DB_USER=marketplace_user"
    echo "  DB_PASSWORD=YOUR_PASSWORD"
    echo "  DB_NAME=marketplace"
    echo "  JWT_SECRET=YOUR_LONG_RANDOM_SECRET"
    echo "  PORT=3000"
    echo "  NODE_ENV=production"
    echo "  CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com"
    exit 1
fi

# Backend
echo "🔧 Building Backend..."
cd "$APP_DIR/backend"
npm install --production
npm run build

# Check if PM2 process exists
if pm2 list | grep -q "marketplace-api"; then
    echo "♻️ Restarting Backend..."
    pm2 restart marketplace-api --update-env
else
    echo "🆕 Starting Backend for first time..."
    pm2 start dist/main.js --name "marketplace-api" --env production
    pm2 save
    pm2 startup systemd -u root --hp /root
fi

# Frontend
echo "🎨 Building Frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# Copy to nginx directory
echo "📁 Copying build to web directory..."
rm -rf $FRONTEND_DIST/*
cp -r dist/frontend/browser/* $FRONTEND_DIST/

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: Served by Nginx"
echo ""
echo "Check status: pm2 status"
echo "Check logs:   pm2 logs marketplace-api"
