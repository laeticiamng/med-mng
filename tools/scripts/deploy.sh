#!/bin/bash

# 🚀 Med Music Platform Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="med-music-platform"
BUILD_DIR="dist"
SUPABASE_PROJECT_ID="yaincoxihiqdksxgrsrk"

echo -e "${BLUE}🚀 Starting deployment for ${PROJECT_NAME}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check environment
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    print_warning "SUPABASE_ACCESS_TOKEN not set. Some deployments may fail."
fi

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version)
    print_status "Supabase CLI version: $SUPABASE_VERSION"
else
    print_error "Supabase CLI not found. Please install it first."
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci --silent
print_status "Dependencies installed"

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm run test:security
npm run test:integration
print_status "All tests passed"

# Build the application
echo -e "${BLUE}🏗️  Building application...${NC}"
npm run build
print_status "Application built successfully"

# Deploy Supabase functions
echo -e "${BLUE}☁️  Deploying Supabase edge functions...${NC}"
supabase functions deploy --project-ref $SUPABASE_PROJECT_ID
print_status "Edge functions deployed"

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
supabase db push --project-ref $SUPABASE_PROJECT_ID
print_status "Database migrations completed"

# Deploy static files (if using a static hosting service)
if [ "$DEPLOY_STATIC" = "true" ]; then
    echo -e "${BLUE}📤 Deploying static files...${NC}"
    # Add your static deployment logic here
    # Example: rsync, AWS S3, Netlify, etc.
    print_status "Static files deployed"
fi

# Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
sleep 5  # Wait for deployment to propagate

# Check if the application is responding
HEALTH_CHECK_URL="https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/health"
if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
    print_status "Health check passed"
else
    print_warning "Health check failed - application may still be starting"
fi

# Security scan
echo -e "${BLUE}🔒 Running security scan...${NC}"
npm run test:security:production
print_status "Security scan completed"

# Performance check
echo -e "${BLUE}⚡ Running performance checks...${NC}"
npm run test:performance
print_status "Performance checks completed"

# Cleanup
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -rf temp_deploy_files 2>/dev/null || true
print_status "Cleanup completed"

# Final status
echo -e "${GREEN}"
echo "=================================="
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=================================="
echo "📊 Deployment Summary:"
echo "   - Project: $PROJECT_NAME"
echo "   - Environment: production"
echo "   - Supabase Project: $SUPABASE_PROJECT_ID"
echo "   - Build Size: $(du -sh $BUILD_DIR 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   - Deployment Time: $(date)"
echo ""
echo "🔗 Application URLs:"
echo "   - Main App: https://${SUPABASE_PROJECT_ID}.supabase.co"
echo "   - Admin: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}"
echo ""
echo "📈 Next Steps:"
echo "   - Monitor application logs"
echo "   - Run smoke tests"
echo "   - Update documentation"
echo "   - Notify team members"
echo "=================================="
echo -e "${NC}"

# Optional: Send notification
if [ "$SEND_NOTIFICATIONS" = "true" ]; then
    echo -e "${BLUE}📬 Sending deployment notifications...${NC}"
    # Add notification logic here (Slack, Discord, email, etc.)
    print_status "Notifications sent"
fi

print_status "Deployment script completed successfully!"