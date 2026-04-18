#!/bin/bash
# ============================================
# 🚀 VPS Initial Setup Script
# Run this ONCE on a fresh VPS
# Usage: bash setup-vps.sh
# ============================================

set -e

echo "=========================================="
echo "🚀 Setting up Marketplace VPS"
echo "=========================================="

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install essentials
echo "🔧 Installing essentials..."
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js 20 LTS
echo "📗 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install PM2
echo "⚙️ Installing PM2..."
npm install -g pm2

# Install Docker
echo "🐳 Installing Docker..."
apt install -y docker.io docker-compose-v2
systemctl enable docker
systemctl start docker

# Setup firewall
echo "🔒 Setting up firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Create project directory
echo "📁 Creating project structure..."
mkdir -p /var/www/marketplace/frontend-dist
mkdir -p /var/www/marketplace/backups
mkdir -p /var/www/marketplace/app

echo ""
echo "=========================================="
echo "✅ VPS Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run: bash setup-database.sh"
echo "2. Clone your repo to /var/www/marketplace/app"
echo "3. Run: bash deploy-app.sh"
echo "4. Run: bash setup-nginx.sh YOUR_DOMAIN"
