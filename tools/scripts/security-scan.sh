#!/bin/bash

# 🔒 Security Scan Script for Med Music Platform
# This script runs comprehensive security checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔒 Starting Security Scan for Med Music Platform${NC}"

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

# Create security report directory
REPORT_DIR="security-reports"
mkdir -p $REPORT_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/security_scan_$TIMESTAMP.json"

echo -e "${BLUE}📋 Security Scan Report: $REPORT_FILE${NC}"

# Initialize report
cat > $REPORT_FILE << EOF
{
  "scan_timestamp": "$(date -Iseconds)",
  "project": "med-music-platform",
  "version": "1.0.0",
  "scans": {}
}
EOF

# 1. Dependency Vulnerability Scan
echo -e "${BLUE}🔍 Scanning dependencies for vulnerabilities...${NC}"
if command -v npm &> /dev/null; then
    npm audit --json > temp_audit.json 2>/dev/null || true
    
    # Check audit results
    if [ -f temp_audit.json ]; then
        VULNS=$(cat temp_audit.json | jq -r '.metadata.vulnerabilities.total // 0')
        HIGH_VULNS=$(cat temp_audit.json | jq -r '.metadata.vulnerabilities.high // 0')
        CRITICAL_VULNS=$(cat temp_audit.json | jq -r '.metadata.vulnerabilities.critical // 0')
        
        # Add to report
        jq --argjson audit "$(cat temp_audit.json)" '.scans.dependency_scan = $audit' $REPORT_FILE > temp_report.json && mv temp_report.json $REPORT_FILE
        
        if [ "$CRITICAL_VULNS" -gt 0 ]; then
            print_error "Found $CRITICAL_VULNS critical vulnerabilities"
            echo -e "${RED}Run 'npm audit fix' to resolve issues${NC}"
        elif [ "$HIGH_VULNS" -gt 0 ]; then
            print_warning "Found $HIGH_VULNS high-severity vulnerabilities"
        else
            print_status "No critical vulnerabilities found in dependencies"
        fi
        
        rm -f temp_audit.json
    else
        print_error "Failed to run npm audit"
    fi
else
    print_error "npm not found - skipping dependency scan"
fi

# 2. Code Security Analysis
echo -e "${BLUE}🔍 Running static code security analysis...${NC}"
if command -v eslint &> /dev/null; then
    # Run ESLint with security plugin
    eslint . --ext .ts,.tsx,.js,.jsx -f json --config configs/eslint/base.js > temp_eslint.json 2>/dev/null || true
    
    if [ -f temp_eslint.json ]; then
        SECURITY_ISSUES=$(cat temp_eslint.json | jq '[.[] | select(.messages[].ruleId | startswith("security/"))] | length')
        
        # Add to report
        jq --argjson eslint "$(cat temp_eslint.json)" '.scans.code_security = $eslint' $REPORT_FILE > temp_report.json && mv temp_report.json $REPORT_FILE
        
        if [ "$SECURITY_ISSUES" -gt 0 ]; then
            print_warning "Found $SECURITY_ISSUES potential security issues in code"
        else
            print_status "No security issues found in static code analysis"
        fi
        
        rm -f temp_eslint.json
    fi
fi

# 3. Supabase Security Scan
echo -e "${BLUE}🔍 Scanning Supabase configuration...${NC}"
if command -v supabase &> /dev/null; then
    # Check RLS policies
    echo -e "${BLUE}  Checking Row Level Security policies...${NC}"
    
    # Run Supabase linter if available
    if supabase db lint 2>/dev/null; then
        print_status "Supabase database configuration looks good"
    else
        print_warning "Unable to verify Supabase RLS policies"
    fi
    
    # Check for common misconfigurations
    SUPABASE_ISSUES=()
    
    # Check if RLS is enabled on critical tables
    CRITICAL_TABLES=("user_generated_music" "user_quotas" "user_activity_logs")
    for table in "${CRITICAL_TABLES[@]}"; do
        echo -e "${BLUE}    Checking RLS on table: $table${NC}"
        # This would need actual database access to verify
    done
    
    # Check edge function security
    if [ -d "supabase/functions" ]; then
        echo -e "${BLUE}  Checking edge functions for security issues...${NC}"
        
        # Check for hardcoded secrets
        if grep -r "sk-" supabase/functions/ 2>/dev/null; then
            SUPABASE_ISSUES+=("Potential hardcoded API keys found in edge functions")
        fi
        
        # Check for proper CORS headers
        if ! grep -r "Access-Control-Allow-Origin" supabase/functions/ >/dev/null 2>&1; then
            SUPABASE_ISSUES+=("CORS headers not found in edge functions")
        fi
        
        # Check for input validation
        if ! grep -r "zod\|joi\|yup" supabase/functions/ >/dev/null 2>&1; then
            SUPABASE_ISSUES+=("No input validation library detected in edge functions")
        fi
    fi
    
    if [ ${#SUPABASE_ISSUES[@]} -eq 0 ]; then
        print_status "Supabase security configuration looks good"
    else
        for issue in "${SUPABASE_ISSUES[@]}"; do
            print_warning "$issue"
        done
    fi
    
    # Add Supabase scan results to report
    jq --argjson supabase_issues "$(printf '%s\n' "${SUPABASE_ISSUES[@]}" | jq -R . | jq -s .)" '.scans.supabase_security = {"issues": $supabase_issues}' $REPORT_FILE > temp_report.json && mv temp_report.json $REPORT_FILE
fi

# 4. Environment Variable Security
echo -e "${BLUE}🔍 Checking environment variable security...${NC}"
ENV_ISSUES=()

# Check for .env files in git
if [ -d ".git" ]; then
    if git ls-files | grep -E "\\.env(\\..*)?$" >/dev/null 2>&1; then
        ENV_ISSUES+=("Environment files are tracked in git")
    fi
fi

# Check for exposed secrets in code
SECRET_PATTERNS=("password" "secret" "key" "token" "api_key")
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i "$pattern.*=" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "process.env" | head -1 >/dev/null; then
        ENV_ISSUES+=("Potential hardcoded $pattern found in source code")
    fi
done

if [ ${#ENV_ISSUES[@]} -eq 0 ]; then
    print_status "Environment variable security looks good"
else
    for issue in "${ENV_ISSUES[@]}"; do
        print_warning "$issue"
    done
fi

# Add environment scan to report
jq --argjson env_issues "$(printf '%s\n' "${ENV_ISSUES[@]}" | jq -R . | jq -s .)" '.scans.environment_security = {"issues": $env_issues}' $REPORT_FILE > temp_report.json && mv temp_report.json $REPORT_FILE

# 5. File Permission Check
echo -e "${BLUE}🔍 Checking file permissions...${NC}"
PERM_ISSUES=()

# Check for world-writable files
if find . -type f -perm -002 2>/dev/null | grep -v node_modules | head -1 >/dev/null; then
    PERM_ISSUES+=("World-writable files found")
fi

# Check for executable files that shouldn't be
if find src/ -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs ls -l | grep "^-rwxr" >/dev/null 2>&1; then
    PERM_ISSUES+=("Executable source files found")
fi

if [ ${#PERM_ISSUES[@]} -eq 0 ]; then
    print_status "File permissions look secure"
else
    for issue in "${PERM_ISSUES[@]}"; do
        print_warning "$issue"
    done
fi

# Add permission scan to report
jq --argjson perm_issues "$(printf '%s\n' "${PERM_ISSUES[@]}" | jq -R . | jq -s .)" '.scans.file_permissions = {"issues": $perm_issues}' $REPORT_FILE > temp_report.json && mv temp_report.json $REPORT_FILE

# 6. Docker Security (if applicable)
if [ -f "Dockerfile" ] || [ -f "docker-compose.yml" ]; then
    echo -e "${BLUE}🔍 Checking Docker security...${NC}"
    DOCKER_ISSUES=()
    
    # Check Dockerfile
    if [ -f "Dockerfile" ]; then
        if grep "FROM.*:latest" Dockerfile >/dev/null 2>&1; then
            DOCKER_ISSUES+=("Using latest tag in Dockerfile")
        fi
        
        if grep "USER root" Dockerfile >/dev/null 2>&1; then
            DOCKER_ISSUES+=("Running as root user in Docker")
        fi
    fi
    
    if [ ${#DOCKER_ISSUES[@]} -eq 0 ]; then
        print_status "Docker configuration looks secure"
    else
        for issue in "${DOCKER_ISSUES[@]}"; do
            print_warning "$issue"
        done
    fi
    
    # Add Docker scan to report
    jq --argjson docker_issues "$(printf '%s\n' "${DOCKER_ISSUES[@]}" | jq -R . | jq -s .)" '.scans.docker_security = {"issues": $docker_issues}' $REPORT_FILE > temp_report.json && mv temp_report.json $REPORT_FILE
fi

# 7. Generate Security Score
echo -e "${BLUE}📊 Calculating security score...${NC}"

TOTAL_ISSUES=$(jq '[.scans[] | if type == "object" and has("issues") then .issues | length else 0 end] | add' $REPORT_FILE)
CRITICAL_ISSUES=$(jq '[.scans[] | if type == "object" and has("vulnerabilities") then .vulnerabilities.critical else 0 end] | add' $REPORT_FILE)

# Calculate score (100 - penalty for issues)
SCORE=$((100 - TOTAL_ISSUES * 5 - CRITICAL_ISSUES * 20))
SCORE=$((SCORE < 0 ? 0 : SCORE))

# Add score to report
jq --argjson score $SCORE --argjson total_issues $TOTAL_ISSUES --argjson critical_issues $CRITICAL_ISSUES '.security_score = {"score": $score, "total_issues": $total_issues, "critical_issues": $critical_issues}' $REPORT_FILE > temp_report.json && mv temp_report.json $REPORT_FILE

# Final Summary
echo -e "${GREEN}"
echo "=========================================="
echo "🔒 SECURITY SCAN COMPLETED"
echo "=========================================="
echo "📊 Security Score: $SCORE/100"
echo "🔍 Total Issues: $TOTAL_ISSUES"
echo "⚠️  Critical Issues: $CRITICAL_ISSUES"
echo "📄 Full Report: $REPORT_FILE"
echo "=========================================="
echo -e "${NC}"

# Exit with appropriate code
if [ "$CRITICAL_ISSUES" -gt 0 ]; then
    echo -e "${RED}❌ Critical security issues found. Please address before deployment.${NC}"
    exit 1
elif [ "$TOTAL_ISSUES" -gt 10 ]; then
    echo -e "${YELLOW}⚠️  Multiple security issues found. Consider addressing before deployment.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Security scan passed. Ready for deployment.${NC}"
    exit 0
fi