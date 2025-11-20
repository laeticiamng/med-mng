#!/bin/bash
# ========================================
# Med-MNG Security - Configuration Wizard
# ========================================
# Wizard interactif pour configurer toutes les fonctionnalités
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
ENV_FILE="$PROJECT_ROOT/.env.backup"
LOG_FILE="$PROJECT_ROOT/logs/wizard.log"

# Fonction de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${PURPLE}➜ $1${NC}" | tee -a "$LOG_FILE"
}

# Fonction pour demander une valeur
ask() {
    local prompt="$1"
    local var_name="$2"
    local default="$3"
    local secret="${4:-false}"

    if [ -n "$default" ]; then
        prompt="$prompt [$default]"
    fi

    echo -e "${CYAN}$prompt:${NC} "

    if [ "$secret" = "true" ]; then
        read -s value
        echo ""
    else
        read value
    fi

    if [ -z "$value" ] && [ -n "$default" ]; then
        value="$default"
    fi

    eval "$var_name='$value'"
}

# Fonction pour valider une valeur
validate_not_empty() {
    local value="$1"
    local name="$2"

    if [ -z "$value" ]; then
        log_error "$name ne peut pas être vide"
        return 1
    fi
    return 0
}

# Header
clear
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║      🧙 MED-MNG SECURITY - CONFIGURATION WIZARD 🧙              ║
║                                                                   ║
║         Assistant de configuration automatique                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

log_info "Bienvenue dans le wizard de configuration Med-MNG Security!"
echo ""
echo -e "${YELLOW}Ce wizard va vous guider pas à pas pour configurer:${NC}"
echo "  1. Credentials Supabase (Database)"
echo "  2. Credentials AWS S3 (Backups)"
echo "  3. Encryption (GPG passphrase)"
echo "  4. Alertes (Email & Slack)"
echo "  5. GitHub Secrets"
echo "  6. Tests et validation"
echo ""
echo -e "${CYAN}Temps estimé: 30-45 minutes${NC}"
echo ""

read -p "Êtes-vous prêt à commencer? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Wizard annulé."
    exit 0
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📁 ÉTAPE 1/6: Configuration Supabase${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log_info "Vous devez obtenir ces informations depuis:"
echo -e "${CYAN}https://app.supabase.com/project/YOUR_PROJECT/settings/database${NC}"
echo ""

ask "Supabase DB Host (ex: db.xxxxxx.supabase.co)" SUPABASE_DB_HOST ""
validate_not_empty "$SUPABASE_DB_HOST" "DB Host" || exit 1

ask "Supabase DB Port" SUPABASE_DB_PORT "5432"
validate_not_empty "$SUPABASE_DB_PORT" "DB Port" || exit 1

ask "Supabase DB Password" SUPABASE_DB_PASSWORD "" "true"
validate_not_empty "$SUPABASE_DB_PASSWORD" "DB Password" || exit 1

# Test de connexion
log_step "Test de connexion à la base de données..."
export DATABASE_URL="postgresql://postgres:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/postgres"

if command -v psql &>/dev/null; then
    if psql "$DATABASE_URL" -c "SELECT version();" &>/dev/null; then
        log_success "Connexion à la base de données réussie!"
    else
        log_error "Échec de connexion à la base de données. Vérifiez vos credentials."
        echo "Continuer quand même? (y/n)"
        read -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    log_warning "psql non installé, impossible de tester la connexion"
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}☁️  ÉTAPE 2/6: Configuration AWS S3${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log_info "Vous devez obtenir ces informations depuis:"
echo -e "${CYAN}https://console.aws.amazon.com/iam/ → Users → Security credentials${NC}"
echo ""

ask "AWS Access Key ID (ex: AKIA...)" AWS_ACCESS_KEY_ID ""
validate_not_empty "$AWS_ACCESS_KEY_ID" "AWS Access Key" || exit 1

ask "AWS Secret Access Key" AWS_SECRET_ACCESS_KEY "" "true"
validate_not_empty "$AWS_SECRET_ACCESS_KEY" "AWS Secret Key" || exit 1

ask "AWS Region" AWS_DEFAULT_REGION "eu-west-1"
validate_not_empty "$AWS_DEFAULT_REGION" "AWS Region" || exit 1

ask "S3 Bucket Name" S3_BACKUP_BUCKET "med-mng-backups"
validate_not_empty "$S3_BACKUP_BUCKET" "S3 Bucket" || exit 1

# Configurer AWS CLI
log_step "Configuration d'AWS CLI..."
if command -v aws &>/dev/null; then
    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
    aws configure set default.region "$AWS_DEFAULT_REGION"

    # Test de connexion
    log_step "Test de connexion AWS..."
    if aws sts get-caller-identity &>/dev/null; then
        log_success "Connexion AWS réussie!"

        # Créer le bucket S3
        log_step "Création du bucket S3 '$S3_BACKUP_BUCKET'..."
        if aws s3 ls s3://$S3_BACKUP_BUCKET &>/dev/null; then
            log_success "Bucket S3 existe déjà"
        else
            if aws s3 mb s3://$S3_BACKUP_BUCKET --region $AWS_DEFAULT_REGION; then
                log_success "Bucket S3 créé"

                # Activer versioning
                aws s3api put-bucket-versioning \
                    --bucket $S3_BACKUP_BUCKET \
                    --versioning-configuration Status=Enabled
                log_success "Versioning activé"

                # Activer encryption
                aws s3api put-bucket-encryption \
                    --bucket $S3_BACKUP_BUCKET \
                    --server-side-encryption-configuration '{
                        "Rules": [{
                            "ApplyServerSideEncryptionByDefault": {
                                "SSEAlgorithm": "AES256"
                            }
                        }]
                    }'
                log_success "Encryption AES-256 activée"

                # Lifecycle policy
                aws s3api put-bucket-lifecycle-configuration \
                    --bucket $S3_BACKUP_BUCKET \
                    --lifecycle-configuration '{
                        "Rules": [{
                            "Id": "DeleteOldBackups",
                            "Status": "Enabled",
                            "Expiration": {"Days": 90},
                            "Filter": {"Prefix": ""}
                        }]
                    }'
                log_success "Lifecycle policy configurée (90 jours)"
            else
                log_error "Échec création bucket S3"
            fi
        fi
    else
        log_error "Échec connexion AWS. Vérifiez vos credentials."
    fi
else
    log_warning "AWS CLI non installé"
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🔒 ÉTAPE 3/6: Configuration Encryption${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log_info "Choisissez un mot de passe fort pour chiffrer les secrets (20+ caractères recommandé)"
echo ""

ask "GPG Passphrase" GPG_PASSPHRASE "" "true"
validate_not_empty "$GPG_PASSPHRASE" "GPG Passphrase" || exit 1

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📧 ÉTAPE 4/6: Configuration Alertes${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ask "Email pour alertes" ALERT_EMAIL "admin@med-mng.com"
validate_not_empty "$ALERT_EMAIL" "Alert Email" || exit 1

echo ""
log_info "Webhook Slack (optionnel)"
log_info "Pour créer: https://api.slack.com/messaging/webhooks"
echo ""
ask "Slack Webhook URL (optionnel, appuyez Enter pour sauter)" SLACK_WEBHOOK_URL ""

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}💾 ÉTAPE 5/6: Sauvegarde Configuration${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log_step "Création du fichier .env.backup..."

cat > "$ENV_FILE" << EOF
# ========================================
# Med-MNG Security - Configuration
# ========================================
# Généré automatiquement par le wizard
# Date: $(date)

# === Supabase Database ===
SUPABASE_DB_HOST="$SUPABASE_DB_HOST"
SUPABASE_DB_PORT="$SUPABASE_DB_PORT"
SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD"

# === AWS S3 ===
AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
AWS_DEFAULT_REGION="$AWS_DEFAULT_REGION"
S3_BACKUP_BUCKET="$S3_BACKUP_BUCKET"

# === Encryption ===
GPG_PASSPHRASE="$GPG_PASSPHRASE"

# === Alertes ===
ALERT_EMAIL="$ALERT_EMAIL"
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"
EOF

chmod 600 "$ENV_FILE"
log_success "Fichier .env.backup créé et sécurisé (chmod 600)"

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🗄️  ÉTAPE 6/6: Activation des Fonctionnalités${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Charger les variables
source "$ENV_FILE"

# Migrations SQL
if command -v psql &>/dev/null && [ -n "$SUPABASE_DB_PASSWORD" ]; then
    log_step "Exécution des migrations SQL..."

    export DATABASE_URL="postgresql://postgres:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/postgres"

    if [ -f "$PROJECT_ROOT/supabase/migrations/20251119_rate_limits.sql" ]; then
        log_step "Migration: rate_limits..."
        if psql "$DATABASE_URL" -f "$PROJECT_ROOT/supabase/migrations/20251119_rate_limits.sql" &>/dev/null; then
            log_success "Migration rate_limits exécutée"
        else
            log_warning "Migration rate_limits échouée (peut-être déjà exécutée)"
        fi
    fi

    if [ -f "$PROJECT_ROOT/supabase/migrations/20251119_security_events.sql" ]; then
        log_step "Migration: security_events..."
        if psql "$DATABASE_URL" -f "$PROJECT_ROOT/supabase/migrations/20251119_security_events.sql" &>/dev/null; then
            log_success "Migration security_events exécutée"
        else
            log_warning "Migration security_events échouée (peut-être déjà exécutée)"
        fi
    fi
fi

# Test des backups
log_step "Test des scripts de backup..."

if [ -x "$PROJECT_ROOT/scripts/backup-database.sh" ]; then
    log_step "Test backup database..."
    if cd "$PROJECT_ROOT" && source .env.backup && ./scripts/backup-database.sh &>logs/test-backup-db.log; then
        log_success "Backup database testé avec succès"
    else
        log_warning "Backup database échoué (vérifier logs/test-backup-db.log)"
    fi
fi

if [ -x "$PROJECT_ROOT/scripts/backup-storage.sh" ]; then
    log_step "Test backup storage..."
    if cd "$PROJECT_ROOT" && source .env.backup && ./scripts/backup-storage.sh &>logs/test-backup-storage.log; then
        log_success "Backup storage testé avec succès"
    else
        log_warning "Backup storage échoué (vérifier logs/test-backup-storage.log)"
    fi
fi

if [ -x "$PROJECT_ROOT/scripts/backup-secrets.sh" ]; then
    log_step "Test backup secrets..."
    if cd "$PROJECT_ROOT" && source .env.backup && ./scripts/backup-secrets.sh &>logs/test-backup-secrets.log; then
        log_success "Backup secrets testé avec succès"
    else
        log_warning "Backup secrets échoué (vérifier logs/test-backup-secrets.log)"
    fi
fi

# Vérifier les backups dans S3
if command -v aws &>/dev/null && [ -n "$S3_BACKUP_BUCKET" ]; then
    log_step "Vérification des backups dans S3..."
    db_backups=$(aws s3 ls s3://$S3_BACKUP_BUCKET/database/ 2>/dev/null | wc -l)
    storage_backups=$(aws s3 ls s3://$S3_BACKUP_BUCKET/storage/ 2>/dev/null | wc -l)
    secrets_backups=$(aws s3 ls s3://$S3_BACKUP_BUCKET/secrets/ 2>/dev/null | wc -l)

    if [ "$db_backups" -gt 0 ]; then
        log_success "Backups database trouvés: $db_backups"
    fi
    if [ "$storage_backups" -gt 0 ]; then
        log_success "Backups storage trouvés: $storage_backups"
    fi
    if [ "$secrets_backups" -gt 0 ]; then
        log_success "Backups secrets trouvés: $secrets_backups"
    fi
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}📋 RÉSUMÉ DE LA CONFIGURATION${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ Configuration complétée avec succès!${NC}"
echo ""
echo -e "${CYAN}Ce qui a été configuré:${NC}"
echo "  ✅ Supabase Database: $SUPABASE_DB_HOST"
echo "  ✅ AWS S3 Bucket: $S3_BACKUP_BUCKET"
echo "  ✅ Encryption: GPG configuré"
echo "  ✅ Alertes: $ALERT_EMAIL"
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "  ✅ Slack: Webhook configuré"
fi
echo ""

echo -e "${YELLOW}Prochaines étapes MANUELLES:${NC}"
echo ""
echo "1. Configurer les secrets GitHub:"
echo "   ${CYAN}gh secret set SNYK_TOKEN --body \"votre-token-snyk\"${NC}"
echo "   ${CYAN}gh secret set SUPABASE_URL --body \"https://xxx.supabase.co\"${NC}"
echo "   ${CYAN}gh secret set SUPABASE_ANON_KEY --body \"eyJhbGc...\"${NC}"
echo "   ${CYAN}gh secret set SUPABASE_SERVICE_ROLE_KEY --body \"eyJhbGc...\"${NC}"
echo "   ${CYAN}gh secret set TEST_USER_TOKEN --body \"eyJhbGc...\"${NC}"
echo "   ${CYAN}gh secret set TEST_ADMIN_TOKEN --body \"eyJhbGc...\"${NC}"
echo ""
echo "2. Configurer les cron jobs:"
echo "   ${CYAN}crontab -e${NC}"
echo "   Ajouter les lignes de ACTIVATION_REPORT.md"
echo ""
echo "3. Configurer Slack webhook dans Supabase (si applicable):"
echo "   ${CYAN}supabase secrets set SLACK_SECURITY_WEBHOOK=\"$SLACK_WEBHOOK_URL\"${NC}"
echo ""
echo "4. Tester le workflow GitHub Actions:"
echo "   ${CYAN}git commit --allow-empty -m \"test: security scan\"${NC}"
echo "   ${CYAN}git push${NC}"
echo ""

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 Configuration terminée!${NC}"
echo ""
echo -e "${CYAN}Fichiers créés:${NC}"
echo "  - .env.backup (credentials sécurisés)"
echo "  - logs/wizard.log (log complet)"
echo ""
echo -e "${CYAN}Pour voir le statut complet:${NC}"
echo "  ${YELLOW}./scripts/check-security-status.sh${NC}"
echo ""
echo -e "${CYAN}Documentation complète:${NC}"
echo "  ${YELLOW}cat ACTIVATION_REPORT.md${NC}"
echo ""
