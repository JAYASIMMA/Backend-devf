# AWS Deployment Checklist - Special Nest Backend

## Pre-Deployment ✅

- [ ] Code built successfully (`npm run build`)
- [ ] All dependencies installed
- [ ] Migration scripts tested locally
- [ ] .env file prepared with production values
- [ ] AWS account setup and credentials ready

---

## AWS Infrastructure Setup

### RDS PostgreSQL Database
- [ ] RDS PostgreSQL instance created
  - Instance identifier: `special-nest-db`
  - Engine: PostgreSQL 14+
  - Instance class: `db.t3.micro` (free tier) or `db.t3.small` (production)
  - Storage: 20 GB with autoscaling enabled
  - Database name: `special_nest_db`
  
- [ ] RDS security group configured
  - Inbound rule: PostgreSQL (5432) from EC2 security group
  
- [ ] Database credentials saved securely
  - Endpoint: `___________________________`
  - Username: `___________________________`
  - Password: `___________________________`

### EC2 Instance (Option A) OR Elastic Beanstalk (Option B)

#### Option A: EC2
- [ ] EC2 instance launched
  - AMI: Ubuntu Server 22.04 LTS
  - Instance type: `t2.micro` or `t2.small`
  - Key pair created/selected
  
- [ ] Security group configured
  - SSH (22): Your IP
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Custom TCP (3000): 0.0.0.0/0 or ALB only
  
- [ ] Elastic IP assigned (optional but recommended)

#### Option B: Elastic Beanstalk
- [ ] EB CLI installed (`pip install awsebcli`)
- [ ] EB application initialized (`eb init`)
- [ ] EB environment created (`eb create`)

---

## Server Setup (EC2 Only)

- [ ] SSH access verified
- [ ] System updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally (`sudo npm install -g pm2`)
- [ ] PostgreSQL client installed (`sudo apt install postgresql-client`)
- [ ] Nginx installed (optional but recommended)

---

## Application Deployment

### Code Deployment
- [ ] Application directory created (`/var/www/special-nest-backend`)
- [ ] Code uploaded (git clone or SCP)
- [ ] Dependencies installed (`npm install --production`)
- [ ] TypeScript compiled (`npm run build`)

### Environment Configuration
- [ ] .env file created on server with production values:

```env
# Update these values!
DB_HOST=<RDS-ENDPOINT>.rds.amazonaws.com
DB_PORT=5432
DB_NAME=special_nest_db
DB_USER=postgres
DB_PASSWORD=<STRONG-PASSWORD>

PORT=3000
NODE_ENV=production

JWT_SECRET=<RANDOM-32-CHAR-STRING>

AWS_REGION=<YOUR-REGION>
AWS_ACCESS_KEY_ID=<YOUR-KEY>
AWS_SECRET_ACCESS_KEY=<YOUR-SECRET>
S3_BUCKET_NAME=<YOUR-BUCKET>

FRONTEND_URL=https://<YOUR-FRONTEND-DOMAIN>
```

- [ ] .env file permissions set (`chmod 600 .env`)

---

## Database Migration

> **CRITICAL**: Run the production-safe migration script

- [ ] Database connection tested:
```bash
psql -h <RDS-ENDPOINT> -U postgres -d special_nest_db
```

- [ ] Migration script executed:
```bash
node dist/scripts/migrate_bookings_status.js
```

- [ ] Migration output verified:
  - ✅ ENUM type created/verified
  - ✅ Added temporary status_new column
  - ✅ Migrated existing data to new column
  - ✅ Dropped old status column
  - ✅ Renamed status_new to status
  - ✅ Set NOT NULL constraint
  - 🎉 Migration completed successfully!

- [ ] Database tables verified:
```sql
\d bookings
-- Verify status column is type enum_bookings_status
```

---

## Application Start

### EC2 with PM2
- [ ] Application started with PM2:
```bash
pm2 start dist/server.js --name special-nest-backend
```

- [ ] PM2 configuration saved:
```bash
pm2 save
pm2 startup systemd
```

- [ ] Application status verified:
```bash
pm2 status
pm2 logs special-nest-backend
```

### Elastic Beanstalk
- [ ] Application deployed:
```bash
eb deploy
```

- [ ] Environment health checked:
```bash
eb health
eb status
```

---

## Nginx Configuration (EC2 Only - Optional)

- [ ] Nginx installed and configured
- [ ] Site configuration created (`/etc/nginx/sites-available/special-nest`)
- [ ] Site enabled (`ln -s /etc/nginx/sites-available/special-nest /etc/nginx/sites-enabled/`)
- [ ] Nginx configuration tested (`sudo nginx -t`)
- [ ] Nginx restarted (`sudo systemctl restart nginx`)

---

## SSL/HTTPS Setup

- [ ] Domain DNS configured (A record pointing to EC2/ALB)
- [ ] SSL certificate obtained (Certbot for Let's Encrypt)
```bash
sudo certbot --nginx -d your-domain.com
```
- [ ] Auto-renewal tested (`sudo certbot renew --dry-run`)

---

## Testing & Verification

### Health Checks
- [ ] Server responds to health check:
```bash
curl http://<SERVER-IP>:3000/
# Expected: {"message":"Welcome to Special Nest API"}
```

### API Endpoint Tests
- [ ] Schools API:
```bash
curl http://<SERVER-IP>:3000/api/schools
```

- [ ] Authentication API:
```bash
curl -X POST http://<SERVER-IP>:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

- [ ] Bookings API:
```bash
curl http://<SERVER-IP>:3000/api/bookings
```

### Database Verification
- [ ] Database connection successful (check logs)
- [ ] Tables synced correctly
- [ ] ENUM type working (create test booking)

---

## Post-Deployment Configuration

### Monitoring & Logging
- [ ] CloudWatch logs configured (EB automatic)
- [ ] PM2 monitoring setup (EC2):
```bash
pm2 install pm2-logrotate
```

- [ ] Log rotation configured
- [ ] Monitoring dashboard accessible

### Backups
- [ ] RDS automated backups enabled (7-day retention)
- [ ] Manual snapshot created:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier special-nest-db \
  --db-snapshot-identifier special-nest-backup-initial
```

### Security
- [ ] Security groups reviewed and tightened
- [ ] RDS public access disabled (if using VPC)
- [ ] SSH key-based authentication only
- [ ] .env file secured (chmod 600)
- [ ] Sensitive data not in git repository

---

## Production Readiness

- [ ] CORS configured for production frontend URLs
- [ ] Rate limiting implemented (if applicable)
- [ ] Error handling reviewed
- [ ] Logging level set to appropriate level (info/warn)
- [ ] Health monitoring alerts configured
- [ ] Backup and disaster recovery plan documented

---

## Documentation

- [ ] Deployment guide reviewed: `aws_deployment_guide.md`
- [ ] Database fix summary reviewed: `database_fix_summary.md`
- [ ] Server credentials documented securely
- [ ] Runbook created for common operations
- [ ] Team notified of deployment

---

## Quick Reference Commands

### EC2 Deployment
```bash
# SSH into server
ssh -i your-key.pem ubuntu@<EC2-IP>

# Navigate to app
cd /var/www/special-nest-backend

# Update code
git pull origin main

# Install & build
npm install --production
npm run build

# Restart
pm2 restart special-nest-backend

# View logs
pm2 logs special-nest-backend

# Monitor
pm2 monit
```

### Elastic Beanstalk
```bash
# Deploy
eb deploy

# SSH
eb ssh

# Logs
eb logs

# Status
eb health
eb status
```

### Database Operations
```bash
# Connect to RDS
psql -h <RDS-ENDPOINT> -U postgres -d special_nest_db

# Run migration
node dist/scripts/migrate_bookings_status.js

# Backup
aws rds create-db-snapshot \
  --db-instance-identifier special-nest-db \
  --db-snapshot-identifier backup-$(date +%Y%m%d)
```

---

## Rollback Plan

If deployment fails:

1. **Application Issues**:
   ```bash
   # EC2
   pm2 restart special-nest-backend
   # or revert code
   git checkout <previous-commit>
   npm run build
   pm2 restart special-nest-backend
   
   # EB
   eb deploy <previous-version>
   ```

2. **Database Issues**:
   ```bash
   # Restore from snapshot
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier special-nest-db-restored \
     --db-snapshot-identifier <snapshot-id>
   ```

3. **Complete Rollback**:
   - Revert application code
   - Restore database from backup
   - Update DNS if needed
   - Notify users of maintenance

---

## Support Contacts

- AWS Support: [AWS Console](https://console.aws.amazon.com/support/)
- Database Admin: ___________________________
- DevOps Lead: ___________________________
- Emergency Contact: ___________________________

---

## Notes

**Date Deployed**: ___________________________

**Deployed By**: ___________________________

**Version/Commit**: ___________________________

**Issues Encountered**: 
___________________________
___________________________
___________________________

**Resolution**: 
___________________________
___________________________
___________________________

---

**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Completed | ⬜ Issues

**Deployment Sign-off**: ___________________________

---

*For detailed instructions, see [aws_deployment_guide.md](file:///C:/Users/Jayasimma%20D/.gemini/antigravity/brain/1818dacc-c2ed-418f-827b-0bae8596d7a5/aws_deployment_guide.md)*
