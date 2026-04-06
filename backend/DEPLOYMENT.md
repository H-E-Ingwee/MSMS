# MiraaLink Smart Market System - Production Deployment Guide

This guide covers deploying the backend API to production environments.

## 🚀 Quick Production Setup

### 1. Environment Preparation

```bash
# Clone repository
git clone <repository-url>
cd msms/backend

# Install dependencies
npm ci --only=production

# Copy environment template
cp .env.example .env

# Edit .env with production values
nano .env
```

### 2. Production Environment Variables

```env
# Database - Use PostgreSQL in production
DATABASE_URL="postgresql://username:password@localhost:5432/msms_prod"

# Strong JWT secret (generate randomly)
JWT_SECRET="your-256-bit-secret-here"

# Production settings
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"

# Optional: Redis for OTP storage
REDIS_URL="redis://localhost:6379"

# Optional: Email service for OTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="app-specific-password"
```

### 3. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL and create database
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE msms_prod;
CREATE USER msms_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE msms_prod TO msms_user;
\q

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://msms_user:secure-password@localhost:5432/msms_prod"

# Run migrations
npm run db:migrate
npm run db:seed
```

### 4. Process Management (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'msms-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 5. Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/msms-backend

# Add this configuration:
server {
    listen 80;
    server_name your-api-domain.com;

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

# Enable site
sudo ln -s /etc/nginx/sites-available/msms-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-api-domain.com

# Certificates auto-renew
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S msms -u 1001

# Change ownership
RUN chown -R msms:nodejs /app
USER msms

EXPOSE 3001

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  msms-backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://msms_user:password@db:5432/msms_prod
      - JWT_SECRET=your-jwt-secret
      - NODE_ENV=production
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=msms_prod
      - POSTGRES_USER=msms_user
      - POSTGRES_PASSWORD=secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Run

```bash
# Build and start
docker-compose up -d

# Run migrations in container
docker-compose exec msms-backend npx prisma migrate deploy
docker-compose exec msms-backend npm run db:seed
```

## ☁️ Cloud Deployment Options

### Vercel (Serverless)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# DATABASE_URL, JWT_SECRET, etc.
```

### Railway

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npx prisma generate`
4. Set start command: `npm start`
5. Add environment variables

### AWS EC2

```bash
# Launch EC2 instance (t3.micro for development, t3.small+ for production)
# Ubuntu 22.04 LTS recommended

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Configure PostgreSQL (same as local setup)

# Clone and deploy application
git clone <repository-url>
cd msms/backend
npm ci --only=production
cp .env.example .env
# Edit .env with production values

# Set up PM2 (same as local setup)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔒 Security Checklist

### Pre-deployment
- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up monitoring (PM2, Grafana)
- [ ] Configure log rotation
- [ ] Set up backups

### Database Security
- [ ] Use connection pooling
- [ ] Enable SSL for database connections
- [ ] Regular backup strategy
- [ ] Database user with minimal privileges

### Application Security
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation active
- [ ] Error messages don't leak sensitive info
- [ ] Security headers enabled (Helmet)

## 📊 Monitoring & Maintenance

### Logs
```bash
# View PM2 logs
pm2 logs msms-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks
```bash
# Application health
curl https://your-api-domain.com/health

# Database connectivity
docker-compose exec db pg_isready -U msms_user -d msms_prod
```

### Backups
```bash
# Database backup
pg_dump -U msms_user -h localhost msms_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
crontab -e
# Add: 0 2 * * * pg_dump -U msms_user -h localhost msms_prod > /backups/backup_$(date +%Y%m%d).sql
```

## 🚨 Troubleshooting Production

### Common Issues

**Application not starting:**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs msms-backend --lines 100

# Restart application
pm2 restart msms-backend
```

**Database connection issues:**
```bash
# Test database connection
psql -U msms_user -d msms_prod -h localhost -c "SELECT 1;"

# Check PostgreSQL service
sudo systemctl status postgresql
```

**High memory usage:**
```bash
# Monitor memory usage
pm2 monit

# Restart if needed
pm2 restart msms-backend
```

**SSL certificate issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew
```

## 📞 Support

For production deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Check network/firewall settings
5. Review security configurations

## 🔄 Updates & Maintenance

### Rolling Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci --only=production

# Run database migrations
npx prisma migrate deploy

# Restart application
pm2 restart msms-backend
```

### Zero-downtime Deployment
```bash
# Start new version
pm2 start ecosystem.config.js --name msms-backend-new

# Wait for startup, test health
curl http://localhost:3001/health

# Switch to new version
pm2 stop msms-backend
pm2 delete msms-backend
pm2 rename msms-backend-new msms-backend
```