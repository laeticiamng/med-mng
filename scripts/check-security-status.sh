#!/bin/bash
# ========================================
# Med-MNG Security Status Checker
# ========================================
# Script pour vérifier l'état de la configuration de sécurité
# Version: 1.0
# Date: 2025-11-19

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Compteurs
PASSED=0
FAILED=0
TOTAL=0

# Fonction pour afficher le header
show_header() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║        🔐 MED-MNG SECURITY STATUS CHECKER 🔐                     ║
║                                                                   ║
║           Vérification de la configuration actuelle               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
}

# Fonction pour tester un élément
check_item() {
    local name="$1"
    local command="$2"

    ((TOTAL++))

    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✅${NC} $name"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name"
        ((FAILED++))
        return 1
    fi
}

# Fonction pour tester avec output
check_item_with_output() {
    local name="$1"
    local command="$2"
    local expected="$3"

    ((TOTAL++))

    output=$(eval "$command" 2>/dev/null || echo "")

    if [ ! -z "$output" ] && [[ "$output" == *"$expected"* ]]; then
        echo -e "${GREEN}✅${NC} $name: ${CYAN}$output${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name"
        ((FAILED++))
        return 1
    fi
}

show_header

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📁 FICHIERS DE CONFIGURATION${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_ROOT"

check_item "GitHub Actions workflow" "test -f .github/workflows/security-scan.yml"
check_item "Rate Limit module" "test -f apps/functions/_shared/rate-limit.ts"
check_item "Security Monitoring module" "test -f apps/functions/_shared/security-monitoring.ts"
check_item "Rate Limits SQL migration" "test -f supabase/migrations/20251119_rate_limits.sql"
check_item "Security Events SQL migration" "test -f supabase/migrations/20251119_security_events.sql"
check_item "Backup Database script" "test -x scripts/backup-database.sh"
check_item "Backup Storage script" "test -x scripts/backup-storage.sh"
check_item "Backup Secrets script" "test -x scripts/backup-secrets.sh"
check_item "Test Restore script" "test -x scripts/test-restore.sh"
check_item "Setup Wizard script" "test -x scripts/setup-wizard.sh"
check_item "Configuration template" "test -f templates/.env.backup.template"
check_item "Secure Function template" "test -f examples/secure-function-template.ts"
check_item "React integration example" "test -f examples/frontend-integration-react.tsx"
check_item "Semgrep security rules" "test -f .semgrep/security-rules.yml"
check_item "ESLint security config" "test -f .eslintrc.security.json"
check_item "OWASP ZAP rules" "test -f .zap/rules.tsv"
check_item "OpenAPI specification" "test -f openapi.yaml"
check_item "API Documentation" "test -f API_DOCUMENTATION.md"
check_item "Security Training Guide" "test -f SECURITY_TRAINING_GUIDE.md"
check_item "Implementation Guide" "test -f IMPLEMENTATION_GUIDE.md"
check_item "Long-term Roadmap" "test -f LONG_TERM_ROADMAP.md"
check_item "Quick Start Checklist" "test -f QUICK_START_CHECKLIST.md"
check_item "Implementation Steps" "test -f IMPLEMENTATION_STEPS.md"

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🔧 PRÉREQUIS SYSTÈME${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_item_with_output "Git" "git --version | head -1" "git version"
check_item_with_output "Node.js" "node --version" "v"
check_item_with_output "npm" "npm --version" ""
check_item "Docker" "docker --version"
check_item "PostgreSQL client" "psql --version"
check_item "AWS CLI" "aws --version"
check_item "GitHub CLI" "gh --version"
check_item "Supabase CLI" "supabase --version"
check_item "jq (JSON parser)" "jq --version"
check_item "curl" "curl --version"

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📝 CONFIGURATION${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_item ".env.backup file" "test -f .env.backup"
check_item "AWS credentials" "test -f ~/.aws/credentials"
check_item "Cron jobs configured" "crontab -l | grep -q backup-database"
check_item "Log directory" "test -d /var/log/med-mng"

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🔐 GITHUB SECRETS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v gh &>/dev/null; then
    check_item "SNYK_TOKEN" "gh secret list | grep -q SNYK_TOKEN"
    check_item "SUPABASE_URL" "gh secret list | grep -q SUPABASE_URL"
    check_item "SUPABASE_ANON_KEY" "gh secret list | grep -q SUPABASE_ANON_KEY"
    check_item "SUPABASE_SERVICE_ROLE_KEY" "gh secret list | grep -q SUPABASE_SERVICE_ROLE_KEY"
    check_item "TEST_USER_TOKEN" "gh secret list | grep -q TEST_USER_TOKEN"
    check_item "TEST_ADMIN_TOKEN" "gh secret list | grep -q TEST_ADMIN_TOKEN"
else
    echo -e "${YELLOW}⏳${NC} GitHub CLI non installé - secrets non vérifiés"
    ((TOTAL += 6))
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}☁️  AWS S3${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f .env.backup ]; then
    source .env.backup

    if command -v aws &>/dev/null && [ ! -z "$S3_BACKUP_BUCKET" ]; then
        check_item "S3 bucket exists" "aws s3 ls s3://$S3_BACKUP_BUCKET/"
        check_item "Database backups" "aws s3 ls s3://$S3_BACKUP_BUCKET/database/ | grep -q .dump"
        check_item "Storage backups" "aws s3 ls s3://$S3_BACKUP_BUCKET/storage/ | grep -q .tar"
        check_item "Secrets backups" "aws s3 ls s3://$S3_BACKUP_BUCKET/secrets/ | grep -q .gpg"
    else
        echo -e "${YELLOW}⏳${NC} AWS CLI ou S3_BACKUP_BUCKET non configuré"
        ((TOTAL += 4))
    fi
else
    echo -e "${YELLOW}⏳${NC} .env.backup non trouvé - S3 non vérifié"
    ((TOTAL += 4))
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🗄️  SUPABASE DATABASE${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f .env.backup ]; then
    source .env.backup

    if [ ! -z "$SUPABASE_DB_HOST" ] && [ ! -z "$SUPABASE_DB_PASSWORD" ]; then
        export DATABASE_URL="postgresql://postgres:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/postgres"

        check_item "Database connection" "psql $DATABASE_URL -c 'SELECT 1' -t"
        check_item "rate_limits table" "psql $DATABASE_URL -c '\dt rate_limits' -t | grep -q rate_limits"
        check_item "security_events table" "psql $DATABASE_URL -c '\dt security_events' -t | grep -q security_events"
        check_item "security_events_critical view" "psql $DATABASE_URL -c '\dv security_events_critical' -t | grep -q security_events_critical"
        check_item "security_top_suspicious_users view" "psql $DATABASE_URL -c '\dv security_top_suspicious_users' -t | grep -q security_top_suspicious_users"
        check_item "security_stats_by_endpoint view" "psql $DATABASE_URL -c '\dv security_stats_by_endpoint' -t | grep -q security_stats_by_endpoint"
        check_item "security_events_timeline view" "psql $DATABASE_URL -c '\dv security_events_timeline' -t | grep -q security_events_timeline"

        # Compter les événements de sécurité
        events_count=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM security_events WHERE created_at > NOW() - INTERVAL '24 hours'" 2>/dev/null | xargs || echo "0")
        if [ "$events_count" -gt 0 ]; then
            echo -e "${GREEN}✅${NC} Security events (24h): ${CYAN}$events_count${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️${NC}  Security events (24h): ${CYAN}0${NC} (aucun événement récent)"
        fi
        ((TOTAL++))

        # Compter les rate limits
        rate_limits_count=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM rate_limits WHERE window_start > NOW() - INTERVAL '24 hours'" 2>/dev/null | xargs || echo "0")
        if [ "$rate_limits_count" -ge 0 ]; then
            echo -e "${GREEN}✅${NC} Rate limits (24h): ${CYAN}$rate_limits_count${NC}"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️${NC}  Rate limits: Non testé"
        fi
        ((TOTAL++))
    else
        echo -e "${YELLOW}⏳${NC} Credentials Supabase non configurés dans .env.backup"
        ((TOTAL += 9))
    fi
else
    echo -e "${YELLOW}⏳${NC} .env.backup non trouvé - Database non vérifiée"
    ((TOTAL += 9))
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📊 RÉSUMÉ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

percentage=$((PASSED * 100 / TOTAL))

echo ""
echo -e "${CYAN}Tests réussis:${NC} ${GREEN}$PASSED${NC} / $TOTAL"
echo -e "${CYAN}Tests échoués:${NC} ${RED}$FAILED${NC}"
echo -e "${CYAN}Pourcentage:${NC} ${YELLOW}$percentage%${NC}"
echo ""

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 Excellent! Configuration presque complète!${NC}"
    echo -e "${CYAN}   Consultez IMPLEMENTATION_STEPS.md pour les étapes restantes.${NC}"
elif [ $percentage -ge 70 ]; then
    echo -e "${YELLOW}👍 Bon départ! Continuez l'implémentation.${NC}"
    echo -e "${CYAN}   Consultez IMPLEMENTATION_STEPS.md pour le guide complet.${NC}"
elif [ $percentage -ge 50 ]; then
    echo -e "${YELLOW}⚠️  Implémentation en cours. Suivez le guide.${NC}"
    echo -e "${CYAN}   Commencez par: IMPLEMENTATION_STEPS.md - Jour 1${NC}"
else
    echo -e "${RED}⚠️  Configuration minimale. Implémentation nécessaire.${NC}"
    echo -e "${CYAN}   Suivez le guide complet: IMPLEMENTATION_STEPS.md${NC}"
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📋 PROCHAINES ACTIONS${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $percentage -lt 90 ]; then
    echo -e "${CYAN}1.${NC} Lire le guide: ${YELLOW}cat IMPLEMENTATION_STEPS.md${NC}"
    echo -e "${CYAN}2.${NC} Commencer par Jour 1: GitHub Actions (1-2h)"
    echo -e "${CYAN}3.${NC} Continuer avec Jour 2-3: Backups (3-4h)"
    echo -e "${CYAN}4.${NC} Puis Jour 4: Monitoring (2-3h)"
    echo -e "${CYAN}5.${NC} Finir avec Jour 5: Validation (1-2h)"
else
    echo -e "${GREEN}✅${NC} Configuration presque terminée!"
    echo -e "${CYAN}1.${NC} Vérifier les derniers éléments manquants"
    echo -e "${CYAN}2.${NC} Exécuter les tests de validation (Jour 5)"
    echo -e "${CYAN}3.${NC} Planifier la formation équipe (Semaines 2-12)"
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Pour plus d'informations:${NC}"
echo -e "  - Guide d'implémentation: ${YELLOW}IMPLEMENTATION_STEPS.md${NC}"
echo -e "  - Quick start: ${YELLOW}QUICK_START_CHECKLIST.md${NC}"
echo -e "  - Setup wizard: ${YELLOW}./scripts/setup-wizard.sh${NC}"
echo ""
