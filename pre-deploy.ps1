# Special Nest Backend - Windows Deployment Helper
# Run this locally before deploying to AWS

Write-Host "🚀 Special Nest Backend - Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

# Configuration
$ErrorActionPreference = "Stop"

function Print-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Print-Warning {
    param($message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Print-Error {
    param($message)
    Write-Host "❌ $message" -ForegroundColor Red
}

function Print-Info {
    param($message)
    Write-Host "ℹ️  $message" -ForegroundColor Blue
}

# Check 1: Node.js version
Write-Host "`nChecking Node.js version..."
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 18) {
            Print-Success "Node.js version: $nodeVersion"
        } else {
            Print-Warning "Node.js version $nodeVersion detected. Recommended: v18 or higher"
        }
    }
} catch {
    Print-Error "Node.js not found. Please install Node.js 18+"
    exit 1
}

# Check 2: Dependencies installed
Write-Host "`nChecking dependencies..."
if (Test-Path "node_modules") {
    Print-Success "Dependencies installed"
} else {
    Print-Warning "Dependencies not found. Installing..."
    npm install
    Print-Success "Dependencies installed"
}

# Check 3: Build application
Write-Host "`nBuilding application..."
try {
    npm run build
    Print-Success "Build successful"
} catch {
    Print-Error "Build failed. Please fix errors before deploying."
    exit 1
}

# Check 4: Environment file
Write-Host "`nChecking environment configuration..."
if (Test-Path ".env") {
    Print-Success ".env file found"
    Print-Warning "Remember to update .env on AWS with production values!"
} else {
    Print-Error ".env file not found"
    Print-Info "Create .env file before deploying"
}

# Check 5: Required environment variables
Write-Host "`nChecking required environment variables..."
$requiredVars = @(
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET_NAME"
)

$envContent = Get-Content .env -ErrorAction SilentlyContinue
$missingVars = @()

foreach ($var in $requiredVars) {
    if ($envContent -match "^$var=") {
        # Variable exists
    } else {
        $missingVars += $var
    }
}

if ($missingVars.Count -eq 0) {
    Print-Success "All required environment variables present"
} else {
    Print-Warning "Missing environment variables:"
    foreach ($var in $missingVars) {
        Write-Host "  - $var" -ForegroundColor Yellow
    }
}

# Check 6: Migration scripts
Write-Host "`nChecking migration scripts..."
if (Test-Path "dist/scripts/migrate_bookings_status.js") {
    Print-Success "Production migration script ready"
} else {
    Print-Error "Migration script not found. Run 'npm run build' first."
}

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "Pre-Deployment Summary" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "✅ Local checks completed`n"

Write-Host "Next Steps for AWS Deployment:`n" -ForegroundColor Yellow

Write-Host "1. Setup RDS PostgreSQL Database" -ForegroundColor White
Write-Host "   - Create RDS instance in AWS Console"
Write-Host "   - Note down the endpoint, username, and password`n"

Write-Host "2. Launch EC2 Instance or Elastic Beanstalk" -ForegroundColor White
Write-Host "   - Ubuntu 22.04 LTS recommended for EC2"
Write-Host "   - Configure security groups`n"

Write-Host "3. Upload Code to Server" -ForegroundColor White
Write-Host "   - Use git clone, SCP, or EB deploy"
Write-Host "   - Copy .env file with production values`n"

Write-Host "4. Run Migration on Server" -ForegroundColor White
Write-Host "   - node dist/scripts/migrate_bookings_status.js`n"

Write-Host "5. Start Application" -ForegroundColor White
Write-Host "   - EC2: pm2 start dist/server.js --name special-nest-backend"
Write-Host "   - EB: eb deploy`n"

Write-Host "📖 See aws_deployment_guide.md for detailed instructions`n" -ForegroundColor Cyan

# Generate deployment checklist
Write-Host "Generating deployment checklist..." -ForegroundColor Cyan
$checklist = @"
# AWS Deployment Checklist

## Pre-Deployment
- [ ] Code built successfully (npm run build)
- [ ] All tests passing
- [ ] .env file prepared with production values
- [ ] Migration scripts tested locally

## AWS Setup
- [ ] RDS PostgreSQL instance created
- [ ] RDS security group configured
- [ ] EC2/EB instance launched
- [ ] Security groups allow necessary traffic
- [ ] IAM roles configured (for EB)

## Database
- [ ] Database connection tested
- [ ] Migration script executed: node dist/scripts/migrate_bookings_status.js
- [ ] Database tables verified

## Application
- [ ] Code deployed to server
- [ ] Dependencies installed (npm install --production)
- [ ] .env file uploaded with correct values
- [ ] Application built on server (npm run build)
- [ ] PM2/EB configured and running

## Post-Deployment
- [ ] Health check endpoint responding
- [ ] API endpoints tested
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy configured

## Production Values to Update in .env
DB_HOST=<RDS-ENDPOINT>
DB_PASSWORD=<STRONG-PASSWORD>
JWT_SECRET=<RANDOM-32-CHAR-STRING>
NODE_ENV=production
FRONTEND_URL=<YOUR-FRONTEND-URL>

## Important Commands

### On AWS Server (EC2)
```bash
# Deploy
cd /var/www/special-nest-backend
git pull origin main
npm install --production
npm run build
node dist/scripts/migrate_bookings_status.js
pm2 restart special-nest-backend

# Monitor
pm2 logs special-nest-backend
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
```
"@

$checklist | Out-File -FilePath "DEPLOYMENT_CHECKLIST.md" -Encoding UTF8
Print-Success "Deployment checklist created: DEPLOYMENT_CHECKLIST.md"

Write-Host "`n🎉 Pre-deployment checks complete!`n" -ForegroundColor Green
