# MiraaLink Smart Market System - Troubleshooting Guide

Common issues and solutions for the backend system.

## 🚀 Quick Diagnostics

### 1. Check System Status

```bash
# Health check
curl http://localhost:3001/health

# Check if server is running
ps aux | grep node

# Check port usage
netstat -tlnp | grep :3001
```

### 2. View Application Logs

```bash
# PM2 logs (production)
pm2 logs msms-backend

# Direct logs (development)
npm run dev  # Logs appear in terminal

# Check error logs
tail -f logs/err.log
tail -f logs/out.log
```

### 3. Database Connection Test

```bash
# Open Prisma Studio
npm run db:studio

# Check database file (SQLite)
ls -la prisma/dev.db

# Test database connection
npx prisma db push --preview-feature
```

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot find package 'express'"

**Symptoms:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express'
```

**Solutions:**
```bash
# Install dependencies
npm install

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be >= 18.0.0
```

### Issue: "Port 3001 already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**
```bash
# Find process using port
lsof -i :3001
netstat -tlnp | grep :3001

# Kill the process
kill -9 <PID>

# Or change port in .env
echo "PORT=3002" >> .env
```

### Issue: Database connection failed

**Symptoms:**
```
Error: P1001: Can't reach database server
```

**Solutions:**
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# For SQLite, ensure file exists
touch prisma/dev.db

# Reset database
npx prisma migrate reset --force

# Generate Prisma client
npm run db:generate
```

### Issue: JWT Authentication fails

**Symptoms:**
```
401 Unauthorized: Invalid token
```

**Solutions:**
```bash
# Check JWT_SECRET in .env
echo $JWT_SECRET

# Verify token format
# Should be: Authorization: Bearer <token>

# Check token expiration (7 days default)
# Regenerate token by logging in again
```

### Issue: CORS errors in browser

**Symptoms:**
```
Access to fetch ... has been blocked by CORS policy
```

**Solutions:**
```bash
# Check FRONTEND_URL in .env
cat .env | grep FRONTEND_URL

# Update to match your frontend URL
# For development: http://localhost:5173
# For production: https://yourdomain.com
```

### Issue: Rate limiting triggered

**Symptoms:**
```
429 Too Many Requests
```

**Solutions:**
```bash
# Wait 15 minutes (rate limit window)
# Or increase limits in server.js
# Current: 100 requests per 15 minutes per IP
```

---

## 🗄️ Database Issues

### Issue: Migration fails

**Symptoms:**
```
Error: P3009: migrate found failed migrations
```

**Solutions:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Mark migration as applied
npx prisma migrate resolve --applied <migration-name>

# Force push schema
npm run db:push
```

### Issue: Seed data fails

**Symptoms:**
```
Error during seeding
```

**Solutions:**
```bash
# Check seed.js for errors
node prisma/seed.js

# Ensure database is empty or reset
npx prisma migrate reset

# Run seed again
npm run db:seed
```

### Issue: Data inconsistency

**Symptoms:**
```
Foreign key constraint failed
```

**Solutions:**
```bash
# Reset and reseed database
npx prisma migrate reset
npm run db:seed

# Check data relationships in Prisma Studio
npm run db:studio
```

---

## 🔐 Authentication Issues

### Issue: OTP not received

**Symptoms:**
```
OTP not showing in logs
```

**Solutions:**
```bash
# Check backend console for OTP
npm run dev

# Look for: 📱 OTP for +254...: 123456

# In production, implement SMS service
# Update auth.js to use actual SMS API
```

### Issue: User registration fails

**Symptoms:**
```
Phone number already exists
```

**Solutions:**
```bash
# Check existing users
npx prisma studio

# Delete test user
npx prisma db execute --file <(echo "DELETE FROM users WHERE phone='+254712345678';")

# Or use different phone number
```

### Issue: Permission denied

**Symptoms:**
```
403 Forbidden: Insufficient permissions
```

**Solutions:**
```bash
# Check user role in database
npx prisma studio

# Update user role if needed
npx prisma db execute --file <(echo "UPDATE users SET role='ADMIN' WHERE id='<user-id>';")

# Or create admin user
npm run db:seed  # Includes admin user
```

---

## 🌐 Network & Deployment Issues

### Issue: Cannot connect to API

**Symptoms:**
```
Failed to fetch / Network Error
```

**Solutions:**
```bash
# Check if server is running
curl http://localhost:3001/health

# Check firewall
sudo ufw status

# Check nginx configuration (production)
sudo nginx -t
sudo systemctl status nginx
```

### Issue: SSL certificate issues

**Symptoms:**
```
SSL certificate problem
```

**Solutions:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Restart nginx
sudo systemctl restart nginx
```

### Issue: Memory usage high

**Symptoms:**
```
Application consuming too much memory
```

**Solutions:**
```bash
# Monitor memory usage
pm2 monit

# Restart application
pm2 restart msms-backend

# Check for memory leaks in code
# Implement proper error handling
```

---

## 🧪 Testing Issues

### Issue: API tests fail

**Symptoms:**
```
Test script returns errors
```

**Solutions:**
```bash
# Run tests individually
node test-api.js

# Check test script for correct endpoints
cat test-api.js

# Ensure server is running
curl http://localhost:3001/health
```

### Issue: Frontend cannot connect

**Symptoms:**
```
CORS error or connection refused
```

**Solutions:**
```bash
# Check VITE_API_BASE_URL in frontend .env
cat ../.env | grep VITE_API_BASE_URL

# Update to correct backend URL
# Development: http://localhost:3001/api
# Production: https://api.yourdomain.com/api
```

---

## 📊 Performance Issues

### Issue: Slow response times

**Symptoms:**
```
API responses taking >5 seconds
```

**Solutions:**
```bash
# Check database queries
npx prisma studio

# Add database indexes if needed
# Check server logs for bottlenecks

# Monitor with PM2
pm2 monit
```

### Issue: High CPU usage

**Symptoms:**
```
Server CPU usage >80%
```

**Solutions:**
```bash
# Check for infinite loops in code
# Implement proper error handling
# Add request timeouts

# Scale horizontally with PM2 cluster
pm2 reload ecosystem.config.js
```

---

## 🔄 Update & Migration Issues

### Issue: Update breaks application

**Symptoms:**
```
Application fails after git pull
```

**Solutions:**
```bash
# Check for breaking changes in changelog
# Backup database before updates

# Rollback if needed
git checkout <previous-commit>
npm install
npm run db:migrate

# Update step by step
npm install
npm run db:migrate
npm run db:generate
pm2 restart msms-backend
```

---

## 🚨 Emergency Recovery

### Complete System Reset

```bash
# Stop application
pm2 stop msms-backend

# Backup database (if using PostgreSQL)
pg_dump -U msms_user -h localhost msms_prod > emergency_backup.sql

# Reset everything
rm -rf node_modules prisma/migrations/*.db
npm install
npm run db:migrate
npm run db:seed

# Restart application
pm2 start ecosystem.config.js
```

### Database Recovery

```bash
# For SQLite
cp prisma/dev.db prisma/dev.db.backup
rm prisma/dev.db
npm run db:migrate
npm run db:seed

# For PostgreSQL
psql -U msms_user -d msms_prod < emergency_backup.sql
```

---

## 📞 Getting Help

### Debug Information to Provide

When reporting issues, include:

1. **Environment:**
   ```bash
   node --version
   npm --version
   uname -a
   ```

2. **Error Logs:**
   ```bash
   pm2 logs msms-backend --lines 50
   ```

3. **Configuration:**
   ```bash
   cat .env | grep -v SECRET  # Hide secrets
   ```

4. **Database Status:**
   ```bash
   npx prisma db push --preview-feature
   ```

5. **Network:**
   ```bash
   curl -I http://localhost:3001/health
   ```

### Support Checklist

- [ ] Server logs checked
- [ ] Environment variables verified
- [ ] Database connection tested
- [ ] Dependencies installed
- [ ] Firewall rules checked
- [ ] SSL certificates valid
- [ ] Rate limits not exceeded

---

## 🛡️ Security Issues

### Issue: Suspected security breach

**Immediate Actions:**
```bash
# Change all secrets
# Rotate JWT_SECRET
# Update database passwords
# Check access logs for suspicious activity
# Implement additional security measures
```

### Issue: Exposed sensitive data

**Recovery:**
```bash
# Rotate all credentials
# Audit code for data leaks
# Implement proper input validation
# Add security headers
# Set up monitoring
```

---

## 📈 Monitoring & Alerts

### Set up basic monitoring:

```bash
# PM2 monitoring
pm2 monit

# Simple health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "❌ API is down"
    # Send alert here
fi
EOF

chmod +x health-check.sh

# Add to crontab for regular checks
crontab -e
# */5 * * * * /path/to/health-check.sh
```

This comprehensive troubleshooting guide should help resolve most common issues with the MiraaLink backend system.