#!/bin/bash

# 🔍 Environment Variables Validation Script
# This script checks if all required environment variables are properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Environment Variables Validation${NC}"
echo "========================================"

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

# Environment to check (default to development)
ENV=${1:-development}
echo -e "${BLUE}Environment: ${ENV}${NC}"
echo ""

# Initialize validation results
MISSING_VARS=()
INVALID_VARS=()
WARNING_VARS=()
VALID_VARS=()

# Function to validate variable
validate_var() {
    local var_name=$1
    local var_value=$2
    local required=$3
    local pattern=$4
    local description=$5

    if [ -z "$var_value" ]; then
        if [ "$required" = "true" ]; then
            MISSING_VARS+=("$var_name: $description")
            print_error "$var_name is missing"
        else
            WARNING_VARS+=("$var_name: $description (optional)")
            print_warning "$var_name is not set (optional)"
        fi
        return 1
    fi

    # Pattern validation if provided
    if [ -n "$pattern" ]; then
        if [[ ! $var_value =~ $pattern ]]; then
            INVALID_VARS+=("$var_name: Invalid format - $description")
            print_error "$var_name has invalid format"
            return 1
        fi
    fi

    VALID_VARS+=("$var_name")
    print_status "$var_name is valid"
    return 0
}

# Core Environment Variables
echo -e "${BLUE}📋 Core Configuration${NC}"
validate_var "NODE_ENV" "$NODE_ENV" true "^(development|staging|production)$" "Application environment"
validate_var "PORT" "$PORT" false "^[0-9]+$" "Server port number"

echo ""

# Supabase Configuration
echo -e "${BLUE}🗄️  Supabase Configuration${NC}"
validate_var "VITE_SUPABASE_URL" "$VITE_SUPABASE_URL" true "^https?://.*supabase\.(co|io)|localhost" "Supabase project URL"
validate_var "VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_ANON_KEY" true "^eyJ" "Supabase anonymous key (JWT format)"

# Server-side Supabase keys
if [ "$ENV" = "production" ] || [ "$ENV" = "staging" ]; then
    validate_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" true "^eyJ" "Supabase service role key"
else
    validate_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" false "^eyJ" "Supabase service role key"
fi

echo ""

# API Keys
echo -e "${BLUE}🔑 External API Keys${NC}"
validate_var "OPENAI_API_KEY" "$OPENAI_API_KEY" false "^sk-" "OpenAI API key"
validate_var "SUNO_API_KEY" "$SUNO_API_KEY" false "^[a-zA-Z0-9]" "Suno AI API key"

echo ""

# Security Configuration
echo -e "${BLUE}🔒 Security Configuration${NC}"
if [ "$ENV" = "production" ]; then
    validate_var "JWT_SECRET" "$JWT_SECRET" true ".{32,}" "JWT signing secret (min 32 chars)"
    validate_var "CORS_ORIGIN" "$CORS_ORIGIN" true "^https?://" "CORS allowed origins"
else
    validate_var "JWT_SECRET" "$JWT_SECRET" false ".{32,}" "JWT signing secret (min 32 chars)"
    validate_var "CORS_ORIGIN" "$CORS_ORIGIN" false "" "CORS allowed origins"
fi

echo ""

# Optional Configuration
echo -e "${BLUE}⚙️  Optional Configuration${NC}"
validate_var "RATE_LIMIT_WINDOW_MS" "$RATE_LIMIT_WINDOW_MS" false "^[0-9]+$" "Rate limit window in milliseconds"
validate_var "RATE_LIMIT_MAX_REQUESTS" "$RATE_LIMIT_MAX_REQUESTS" false "^[0-9]+$" "Maximum requests per window"
validate_var "LOG_LEVEL" "$LOG_LEVEL" false "^(error|warn|info|debug)$" "Logging level"
validate_var "SENTRY_DSN" "$SENTRY_DSN" false "^https://.*@.*\.ingest\.sentry\.io/" "Sentry error tracking DSN"

echo ""

# Feature Flags
echo -e "${BLUE}🚩 Feature Flags${NC}"
validate_var "ENABLE_MUSIC_GENERATION" "$ENABLE_MUSIC_GENERATION" false "^(true|false)$" "Enable music generation feature"
validate_var "ENABLE_REAL_TIME_FEATURES" "$ENABLE_REAL_TIME_FEATURES" false "^(true|false)$" "Enable real-time features"
validate_var "ENABLE_ANALYTICS" "$ENABLE_ANALYTICS" false "^(true|false)$" "Enable analytics tracking"

echo ""

# Summary
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "========================================"

echo -e "${GREEN}✅ Valid Variables: ${#VALID_VARS[@]}${NC}"
for var in "${VALID_VARS[@]}"; do
    echo "   - $var"
done

if [ ${#WARNING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Optional Variables: ${#WARNING_VARS[@]}${NC}"
    for var in "${WARNING_VARS[@]}"; do
        echo "   - $var"
    done
fi

if [ ${#INVALID_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Invalid Variables: ${#INVALID_VARS[@]}${NC}"
    for var in "${INVALID_VARS[@]}"; do
        echo "   - $var"
    done
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Missing Required Variables: ${#MISSING_VARS[@]}${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
fi

echo ""

# Environment-specific recommendations
if [ "$ENV" = "production" ]; then
    echo -e "${BLUE}🚀 Production Recommendations${NC}"
    echo "- Ensure JWT_SECRET is a strong, randomly generated string"
    echo "- Set CORS_ORIGIN to specific domains, not '*'"
    echo "- Configure SENTRY_DSN for error monitoring"
    echo "- Use HTTPS URLs for all external services"
    echo "- Enable all security features"
elif [ "$ENV" = "development" ]; then
    echo -e "${BLUE}🔧 Development Notes${NC}"
    echo "- Some variables are optional in development"
    echo "- JWT_SECRET can use default value for local development"
    echo "- CORS_ORIGIN can be '*' for development"
    echo "- Mock external APIs if keys are not available"
fi

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    echo ""
    echo -e "${BLUE}📝 Creating .env.example file...${NC}"
    cat > .env.example << EOF
# Med Music Platform Environment Configuration
# Copy this file to .env and fill in your values

# Application Environment
NODE_ENV=development
PORT=3000

# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# External API Keys (Optional)
OPENAI_API_KEY=sk-your-openai-key-here
SUNO_API_KEY=your-suno-key-here

# Security Configuration
JWT_SECRET=your-jwt-secret-min-32-characters-long
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Feature Flags
ENABLE_MUSIC_GENERATION=true
ENABLE_REAL_TIME_FEATURES=true
ENABLE_ANALYTICS=true

# Development/Testing
SKIP_ENV_VALIDATION=false
MOCK_EXTERNAL_APIS=false
EOF
    print_status "Created .env.example file"
fi

# Final result
echo ""
if [ ${#MISSING_VARS[@]} -gt 0 ] || [ ${#INVALID_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Environment validation FAILED${NC}"
    echo "Please fix the issues above before starting the application."
    exit 1
else
    echo -e "${GREEN}✅ Environment validation PASSED${NC}"
    echo "All required variables are properly configured."
    exit 0
fi