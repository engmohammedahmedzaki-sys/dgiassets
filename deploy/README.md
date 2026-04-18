# 🚀 Deployment Guide - Quick Reference

## First Time VPS Setup (Run once)

### Step 1: SSH into your VPS
```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Upload & run setup scripts
```bash
# Option A: Clone repo first then use scripts
git clone https://github.com/USERNAME/marketplace.git /var/www/marketplace/app
cd /var/www/marketplace/app/deploy
bash setup-vps.sh
bash setup-database.sh    # ⚠️ SAVE the password it generates!
```

### Step 3: Create backend .env
```bash
nano /var/www/marketplace/app/backend/.env
# Paste your production values (use password from step 2)
```

### Step 4: Deploy the app
```bash
bash deploy-app.sh
```

### Step 5: Setup Nginx + SSL
```bash
bash setup-nginx.sh yourdomain.com
```

### Step 6: Update frontend environment
Before deploying, make sure `frontend/src/environments/environment.prod.ts` has:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://yourdomain.com/api'
};
```

---

## GitHub Secrets (for CI/CD)

Go to: GitHub Repo → Settings → Secrets and Variables → Actions

Add these secrets:
| Secret Name | Value |
|-------------|-------|
| `VPS_HOST` | Your VPS IP address |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Your SSH private key |

---

## Daily Operations

### Push changes (auto-deploys via CI/CD):
```bash
git add .
git commit -m "your changes"
git push origin main
```

### Manual deploy (if needed):
```bash
ssh root@YOUR_VPS_IP
cd /var/www/marketplace/app/deploy
bash deploy-app.sh
```

### Check status:
```bash
pm2 status                    # Backend status
pm2 logs marketplace-api      # Backend logs
docker ps                     # Database status
```

### Database backup (manual):
```bash
bash /var/www/marketplace/backup.sh
```

### Restore backup:
```bash
gunzip backup_YYYYMMDD.sql.gz
docker exec -i marketplace_db psql -U marketplace_user marketplace < backup_YYYYMMDD.sql
```
