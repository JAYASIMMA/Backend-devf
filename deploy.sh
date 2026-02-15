#!/bin/bash

# Special Nest Backend - AWS Deployment Script
# This script automates the deployment process on EC2

set -e  # Exit on any error

echo "🚀 Special Nest Backend - AWS Deployment Script"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/special-nest-backend"
APP_NAME="special-nest-backend"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root"
    exit 1
fi

# Step 1: Pull latest code
echo ""
echo "Step 1: Pulling latest code..."
cd $APP_DIR
git pull origin main
print_success "Code updated"

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
npm install --production
print_success "Dependencies installed"

# Step 3: Build application
echo ""
echo "Step 3: Building application..."
npm run build
print_success "Build completed"

# Step 4: Run database migration
echo ""
echo "Step 4: Running database migration..."
read -p "Do you want to run the database migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node dist/scripts/migrate_bookings_status.js
    print_success "Migration completed"
else
    print_warning "Migration skipped"
fi

# Step 5: Restart application
echo ""
echo "Step 5: Restarting application..."
pm2 restart $APP_NAME
print_success "Application restarted"

# Step 6: Check status
echo ""
echo "Step 6: Checking application status..."
sleep 3
pm2 status $APP_NAME

# Step 7: Show recent logs
echo ""
echo "Recent logs:"
pm2 logs $APP_NAME --lines 20 --nostream

echo ""
print_success "Deployment completed successfully! 🎉"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs $APP_NAME"
echo "  - Monitor: pm2 monit"
echo "  - Restart: pm2 restart $APP_NAME"
echo ""
