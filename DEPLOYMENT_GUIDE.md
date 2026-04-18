# 🚀 دليل النشر - Deployment Guide

## 📋 **المتطلبات - Prerequisites**

### **Local Development:**

- Node.js v18+
- Docker & Docker Compose
- PostgreSQL 15+
- npm or yarn

### **Production Server:**

- Ubuntu 20.04+ or similar Linux
- 2GB+ RAM
- 20GB+ Storage
- Domain name (optional)
- SSL Certificate (Let's Encrypt recommended)

---

## 🏗️ **1. إعداد المشروع - Project Setup**

### **Clone from GitHub:**

```bash
git clone https://github.com/your-username/ai-card-mahmoud.git
cd ai-card-mahmoud
```

---

## 🔧 **2. Backend Setup**

### **Install Dependencies:**

```bash
cd backend
npm install
```

### **Environment Configuration:**

```bash
# Copy the template
cp .env.production.template .env

# Edit with your values
nano .env
```

**Required .env values:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_STRONG_PASSWORD
DB_NAME=marketplace_db
JWT_SECRET=YOUR_32_CHAR_RANDOM_SECRET
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### **Generate JWT Secret:**

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Database Setup:**

#### **Option A: Docker (Recommended):**

```bash
# From project root
docker-compose up -d
```

#### **Option B: Manual PostgreSQL:**

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE marketplace_db;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO your_user;
\q
```

### **Run Migrations:**

```bash
# The database will auto-sync (TypeORM synchronize=true)
# For production, set synchronize=false and use migrations
npm run start:prod
```

### **Build for Production:**

```bash
npm run build
```

### **Start Production Server:**

```bash
npm run start:prod
```

---

## 🎨 **3. Frontend Setup**

### **Install Dependencies:**

```bash
cd frontend
npm install
```

### **Environment Configuration:**

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://api.yourdomain.com", // Your backend URL
};
```

### **Build for Production:**

```bash
npm run build
# Output will be in dist/frontend
```

---

## 🐳 **4. Docker Deployment (Recommended)**

### **Using Docker Compose:**

```bash
# From project root
docker-compose -f docker-compose.prod.yml up -d
```

### **Docker Compose Production File:**

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: marketplace_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
    env_file:
      - ./backend/.env
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### **Backend Dockerfile:**

Create `backend/Dockerfile.prod`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
RUN mkdir -p uploads
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### **Frontend Dockerfile:**

Create `frontend/Dockerfile.prod`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🌐 **5. Nginx Configuration**

### **For Frontend (nginx.conf):**

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name yourdomain.com;
        root /usr/share/nginx/html;
        index index.html;

        # Angular routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 🔒 **6. SSL Configuration**

### **Using Let's Encrypt:**

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 **7. Process Management (PM2)**

### **Install PM2:**

```bash
npm install -g pm2
```

### **Start Backend:**

```bash
cd backend
pm2 start dist/main.js --name marketplace-backend
pm2 save
pm2 startup
```

### **PM2 Commands:**

```bash
pm2 list              # List all processes
pm2 logs              # View logs
pm2 restart all       # Restart all
pm2 stop all          # Stop all
pm2 delete all        # Delete all
```

---

## 🔍 **8. Monitoring & Logs**

### **View Logs:**

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2 logs
pm2 logs

# System logs
journalctl -u marketplace-backend -f
```

### **Health Check:**

```bash
# Backend health
curl http://localhost:3000/api/health

# Frontend
curl http://localhost
```

---

## 🚀 **9. Deployment Steps**

### **Production Deployment Checklist:**

- [ ] Set `synchronize: false` in TypeORM config
- [ ] Generate strong JWT secret
- [ ] Configure secure database password
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Test all endpoints
- [ ] Enable firewall rules
- [ ] Set up process manager (PM2)

### **Quick Deploy Commands:**

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Build both
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# 4. Restart services
pm2 restart all
# OR
docker-compose restart
```

---

## 🔐 **10. Security Checklist**

- [ ] Strong database passwords
- [ ] JWT secret is random & secure (32+ chars)
- [ ] HTTPS enabled (SSL)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] File upload size limits
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (TypeORM)
- [ ] XSS protection
- [ ] Environment variables secured

---

## 🐛 **11. Troubleshooting**

### **Backend won't start:**

```bash
# Check logs
pm2 logs marketplace-backend
# OR
docker-compose logs backend

# Verify database connection
psql -U postgres -h localhost -p 5432
```

### **Frontend shows 404:**

```bash
# Rebuild frontend
cd frontend
npm run build

# Check nginx config
nginx -t
```

### **Database connection failed:**

```bash
# Check PostgreSQL is running
docker-compose ps
# OR
systemctl status postgresql

# Test connection
psql -U your_user -d marketplace_db -h localhost
```

---

## 📈 **12. Performance Optimization**

### **Database Indexing:**

```sql
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_offers_status ON offers(status);
```

### **Enable Caching:**

- Redis for session/cache
- CDN for static assets
- Browser caching headers

---

## 📱 **13. Platforms**

### **Deploy to:**

#### **DigitalOcean:**

- Droplet (Ubuntu 20.04)
- Managed Database (PostgreSQL)
- Spaces (file storage)

#### **AWS:**

- EC2 (backend)
- RDS (database)
- S3 (file storage)
- CloudFront (CDN)

#### **Heroku:**

```bash
# Backend
heroku create your-app-backend
git subtree push --prefix backend heroku main

# Add PostgreSQL
heroku addons:create heroku-postgresql
```

#### **Vercel (Frontend only):**

```bash
cd frontend
vercel
```

---

## ✅ **14. Post-Deployment**

### **Verify:**

```bash
# Test API
curl https://api.yourdomain.com/projects

# Test Frontend
curl https://yourdomain.com

# Test database
psql -U user -h host -d db -c "SELECT COUNT(*) FROM projects;"
```

### **Monitor:**

- Set up uptime monitoring (UptimeRobot)
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance (Lighthouse)

---

## 🆘 **Support & Resources**

- **Backend Logs:** `pm2 logs` or `docker-compose logs backend`
- **Frontend Logs:** Browser Developer Console
- **Database Logs:** `docker-compose logs postgres`

**الف مبروك! 🎉 المشروع الآن على الإنترنت!**
