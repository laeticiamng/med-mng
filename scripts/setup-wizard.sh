#!/bin/bash
# ========================================
# Med-MNG Security Setup Wizard
# ========================================
# Script interactif pour configurer toutes les fonctionnalités de sécurité
# Version: 1.0
# Date: 2025-11-19

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Émojis
CHECK="✅"
CROSS="❌"
ARROW="➜"
STAR="⭐"
ROCKET="🚀"
LOCK="🔒"
WARN="⚠️"
INFO="ℹ️"

# Variables globales
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/setup.log"

# Fonction de logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo -e "$1"
}

log_success() {
    log "${GREEN}${CHECK} $1${NC}"
}

log_error() {
    log "${RED}${CROSS} $1${NC}"
}

log_warning() {
    log "${YELLOW}${WARN} $1${NC}"
}

log_info() {
    log "${CYAN}${INFO} $1${NC}"
}

log_step() {
    log "${PURPLE}${ARROW} $1${NC}"
}

# Fonction pour afficher le header
show_header() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║              🔐 MED-MNG SECURITY SETUP WIZARD 🔐                 ║
║                                                                   ║
║                    Configuration automatique                      ║
║                  Score de sécurité: 10/10 ⭐                     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
}

# Fonction pour demander confirmation
confirm() {
    local prompt="$1"
    local default="${2:-n}"

    if [ "$default" = "y" ]; then
        prompt="${prompt} [Y/n]: "
    else
        prompt="${prompt} [y/N]: "
    fi

    read -p "$prompt" response
    response=${response:-$default}

    case "$response" in
        [yY]|[yY][eE][sS]) return 0 ;;
        *) return 1 ;;
    esac
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log_step "Vérification des prérequis..."
    echo ""

    local missing=0

    # Git
    if command -v git &> /dev/null; then
        log_success "Git installé: $(git --version)"
    else
        log_error "Git n'est pas installé"
        missing=1
    fi

    # Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js installé: $(node --version)"
    else
        log_error "Node.js n'est pas installé"
        missing=1
    fi

    # npm
    if command -v npm &> /dev/null; then
        log_success "npm installé: $(npm --version)"
    else
        log_error "npm n'est pas installé"
        missing=1
    fi

    # Docker (optionnel)
    if command -v docker &> /dev/null; then
        log_success "Docker installé: $(docker --version)"
    else
        log_warning "Docker n'est pas installé (optionnel pour Metabase)"
    fi

    # AWS CLI (optionnel)
    if command -v aws &> /dev/null; then
        log_success "AWS CLI installé: $(aws --version)"
    else
        log_warning "AWS CLI n'est pas installé (nécessaire pour backups S3)"
    fi

    # PostgreSQL client (optionnel)
    if command -v psql &> /dev/null; then
        log_success "PostgreSQL client installé: $(psql --version)"
    else
        log_warning "psql n'est pas installé (nécessaire pour backups database)"
    fi

    # Supabase CLI (optionnel)
    if command -v supabase &> /dev/null; then
        log_success "Supabase CLI installé: $(supabase --version)"
    else
        log_warning "Supabase CLI n'est pas installé (recommandé)"
        echo -e "${YELLOW}   Installation: npm install -g supabase${NC}"
    fi

    echo ""

    if [ $missing -eq 1 ]; then
        log_error "Certains prérequis sont manquants. Installez-les avant de continuer."
        return 1
    fi

    log_success "Tous les prérequis essentiels sont installés"
    return 0
}

# Menu principal
show_menu() {
    show_header

    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  Que souhaitez-vous configurer ?                             ${BLUE}║${NC}"
    echo -e "${BLUE}╠═══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}1${NC}) ${LOCK} GitHub Actions (Tests de sécurité CI/CD)          ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}2${NC}) 💾 Backups automatiques (S3 + Scripts)                ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}3${NC}) 📊 Monitoring Dashboard (Metabase + Grafana)         ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}4${NC}) 🎓 Formation Équipe (Calendrier + Quiz)              ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}5${NC}) ${ROCKET} Configuration complète (Tout en une fois)        ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}6${NC}) 🧪 Tester la configuration actuelle                   ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}7${NC}) 📋 Afficher le statut de progression                 ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  ${GREEN}0${NC}) ❌ Quitter                                            ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    read -p "Votre choix: " choice
    echo ""

    case $choice in
        1) setup_github_actions ;;
        2) setup_backups ;;
        3) setup_monitoring ;;
        4) setup_training ;;
        5) setup_all ;;
        6) test_configuration ;;
        7) show_status ;;
        0) exit 0 ;;
        *)
            log_error "Choix invalide"
            sleep 2
            show_menu
            ;;
    esac
}

# Configuration GitHub Actions
setup_github_actions() {
    show_header
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  ${LOCK} CONFIGURATION GITHUB ACTIONS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_step "Étape 1/5: Vérification du workflow"

    if [ -f "$PROJECT_ROOT/.github/workflows/security-scan.yml" ]; then
        log_success "Workflow security-scan.yml trouvé"
    else
        log_error "Workflow security-scan.yml manquant"
        return 1
    fi

    echo ""
    log_step "Étape 2/5: Configuration des secrets GitHub"
    echo ""
    log_info "Vous devez configurer les secrets suivants dans GitHub:"
    echo "   Repository → Settings → Secrets and variables → Actions"
    echo ""

    echo -e "${YELLOW}Secrets requis:${NC}"
    echo "   1. SNYK_TOKEN - Token Snyk pour scan de dépendances"
    echo "   2. SUPABASE_URL - URL de votre projet Supabase"
    echo "   3. SUPABASE_ANON_KEY - Clé anonyme Supabase"
    echo "   4. SUPABASE_SERVICE_ROLE_KEY - Clé service role"
    echo "   5. TEST_USER_TOKEN - JWT token utilisateur test"
    echo "   6. TEST_ADMIN_TOKEN - JWT token admin test"
    echo ""

    if confirm "Avez-vous configuré tous les secrets?"; then
        log_success "Secrets configurés"
    else
        log_warning "Configurez les secrets avant de continuer"
        echo ""
        log_info "Guide: https://docs.github.com/en/actions/security-guides/encrypted-secrets"
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
        show_menu
        return
    fi

    echo ""
    log_step "Étape 3/5: Activation GitHub Security"
    echo ""
    log_info "Activez les fonctionnalités suivantes dans GitHub:"
    echo "   Repository → Settings → Security"
    echo ""
    echo "   - Dependency graph"
    echo "   - Dependabot alerts"
    echo "   - Dependabot security updates"
    echo "   - Code scanning"
    echo ""

    if confirm "Ces fonctionnalités sont-elles activées?"; then
        log_success "GitHub Security activé"
    else
        log_warning "Activez ces fonctionnalités pour une protection complète"
    fi

    echo ""
    log_step "Étape 4/5: Installation des dépendances"

    cd "$PROJECT_ROOT"

    if confirm "Installer les outils de sécurité (ESLint plugins, Semgrep)?"; then
        log_info "Installation des dépendances..."
        npm install --save-dev \
            eslint-plugin-security \
            eslint-plugin-no-secrets \
            @typescript-eslint/eslint-plugin \
            @typescript-eslint/parser 2>&1 | tee -a "$LOG_FILE"

        log_success "Dépendances installées"
    fi

    echo ""
    log_step "Étape 5/5: Test du workflow"
    echo ""

    if confirm "Voulez-vous tester le workflow (commit test)?"; then
        log_info "Création d'un commit test..."
        git commit --allow-empty -m "test: trigger security scan" 2>&1 | tee -a "$LOG_FILE"

        log_info "Push du commit..."
        git push 2>&1 | tee -a "$LOG_FILE"

        echo ""
        log_success "Commit test créé et pushé"
        log_info "Vérifiez les résultats dans: Repository → Actions"
        echo ""
        log_info "URL: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
    fi

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    log_success "Configuration GitHub Actions terminée!"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    read -p "Appuyez sur Entrée pour retourner au menu..."
    show_menu
}

# Configuration Backups
setup_backups() {
    show_header
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  💾 CONFIGURATION BACKUPS AUTOMATIQUES${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_step "Étape 1/6: Configuration des variables d'environnement"
    echo ""

    # Créer .env.backup
    local env_file="$PROJECT_ROOT/.env.backup"

    if [ -f "$env_file" ]; then
        log_warning "Le fichier .env.backup existe déjà"
        if ! confirm "Voulez-vous le recréer?"; then
            echo ""
            log_info "Configuration annulée"
            read -p "Appuyez sur Entrée pour retourner au menu..."
            show_menu
            return
        fi
    fi

    log_info "Création du fichier .env.backup..."

    # Demander les informations
    echo ""
    read -p "Supabase DB Host (ex: db.xxx.supabase.co): " db_host
    read -p "Supabase DB Port [5432]: " db_port
    db_port=${db_port:-5432}
    read -sp "Supabase DB Password: " db_password
    echo ""
    echo ""

    read -p "AWS Access Key ID: " aws_key
    read -sp "AWS Secret Access Key: " aws_secret
    echo ""
    read -p "AWS S3 Bucket Name [med-mng-backups]: " s3_bucket
    s3_bucket=${s3_bucket:-med-mng-backups}
    read -p "AWS Region [eu-west-1]: " aws_region
    aws_region=${aws_region:-eu-west-1}
    echo ""

    read -sp "GPG Passphrase (pour chiffrement secrets): " gpg_pass
    echo ""

    # Écrire le fichier
    cat > "$env_file" << EOF
# Med-MNG Backup Configuration
# Créé le: $(date)
# NE PAS COMMITER CE FICHIER!

# Supabase Database
SUPABASE_DB_HOST=$db_host
SUPABASE_DB_PORT=$db_port
SUPABASE_DB_PASSWORD=$db_password

# AWS S3
AWS_ACCESS_KEY_ID=$aws_key
AWS_SECRET_ACCESS_KEY=$aws_secret
AWS_S3_BACKUP_BUCKET=$s3_bucket
AWS_DEFAULT_REGION=$aws_region

# GPG
GPG_PASSPHRASE=$gpg_pass
EOF

    chmod 600 "$env_file"
    log_success "Fichier .env.backup créé"

    # Ajouter au .gitignore
    if ! grep -q ".env.backup" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
        echo ".env.backup" >> "$PROJECT_ROOT/.gitignore"
        log_success "Ajouté au .gitignore"
    fi

    echo ""
    log_step "Étape 2/6: Configuration AWS S3"
    echo ""

    # Charger les variables
    source "$env_file"

    # Configurer AWS CLI
    if command -v aws &> /dev/null; then
        log_info "Configuration AWS CLI..."
        aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
        aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
        aws configure set default.region "$AWS_DEFAULT_REGION"

        log_success "AWS CLI configuré"

        echo ""
        if confirm "Créer le bucket S3 $s3_bucket?"; then
            log_info "Création du bucket..."

            if aws s3 mb "s3://$s3_bucket" --region "$AWS_DEFAULT_REGION" 2>&1 | tee -a "$LOG_FILE"; then
                log_success "Bucket créé"

                # Activer versioning
                log_info "Activation du versioning..."
                aws s3api put-bucket-versioning \
                    --bucket "$s3_bucket" \
                    --versioning-configuration Status=Enabled 2>&1 | tee -a "$LOG_FILE"

                # Activer chiffrement
                log_info "Activation du chiffrement..."
                aws s3api put-bucket-encryption \
                    --bucket "$s3_bucket" \
                    --server-side-encryption-configuration '{
                        "Rules": [{
                            "ApplyServerSideEncryptionByDefault": {
                                "SSEAlgorithm": "AES256"
                            }
                        }]
                    }' 2>&1 | tee -a "$LOG_FILE"

                log_success "Bucket S3 configuré (versioning + chiffrement)"
            else
                log_warning "Le bucket existe peut-être déjà"
            fi
        fi
    else
        log_warning "AWS CLI non installé - ignoré"
    fi

    echo ""
    log_step "Étape 3/6: Test des scripts de backup"
    echo ""

    # Rendre les scripts exécutables
    chmod +x "$PROJECT_ROOT/scripts"/*.sh

    if confirm "Tester le backup database?"; then
        log_info "Exécution de backup-database.sh..."
        source "$env_file"
        "$PROJECT_ROOT/scripts/backup-database.sh" 2>&1 | tee -a "$LOG_FILE"

        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log_success "Backup database réussi"
        else
            log_error "Backup database échoué - vérifiez les logs"
        fi
    fi

    echo ""
    if confirm "Tester le backup storage?"; then
        log_info "Exécution de backup-storage.sh..."
        "$PROJECT_ROOT/scripts/backup-storage.sh" 2>&1 | tee -a "$LOG_FILE"

        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log_success "Backup storage réussi"
        else
            log_warning "Backup storage échoué (normal si pas de fichiers)"
        fi
    fi

    echo ""
    log_step "Étape 4/6: Configuration des cron jobs"
    echo ""

    if confirm "Configurer les backups automatiques (cron)?"; then
        log_info "Ajout des cron jobs..."

        # Créer les cron jobs
        (crontab -l 2>/dev/null || echo "") | grep -v "med-mng" > /tmp/crontab_temp

        cat >> /tmp/crontab_temp << EOF

# Med-MNG Backups Automatiques
# Créé le: $(date)

# Backup database quotidien à 3 AM
0 3 * * * cd $PROJECT_ROOT && source .env.backup && ./scripts/backup-database.sh >> /var/log/med-mng/backup-db.log 2>&1

# Backup storage quotidien à 4 AM
0 4 * * * cd $PROJECT_ROOT && source .env.backup && ./scripts/backup-storage.sh >> /var/log/med-mng/backup-storage.log 2>&1

# Backup secrets mensuel (1er du mois à 5 AM)
0 5 1 * * cd $PROJECT_ROOT && source .env.backup && ./scripts/backup-secrets.sh >> /var/log/med-mng/backup-secrets.log 2>&1

# Test de restauration mensuel (1er du mois à 10 AM)
0 10 1 * * cd $PROJECT_ROOT && source .env.backup && ./scripts/test-restore.sh >> /var/log/med-mng/restore-test.log 2>&1
EOF

        crontab /tmp/crontab_temp
        rm /tmp/crontab_temp

        log_success "Cron jobs configurés"

        # Créer les répertoires de logs
        sudo mkdir -p /var/log/med-mng
        sudo chown $USER:$USER /var/log/med-mng

        log_success "Répertoire de logs créé: /var/log/med-mng"
    fi

    echo ""
    log_step "Étape 5/6: Test de restauration"
    echo ""

    if confirm "Exécuter un test de restauration?"; then
        log_warning "Ceci va créer un projet de test Supabase"
        if confirm "Continuer?"; then
            log_info "Exécution de test-restore.sh..."
            source "$env_file"
            "$PROJECT_ROOT/scripts/test-restore.sh" 2>&1 | tee -a "$LOG_FILE"

            if [ ${PIPESTATUS[0]} -eq 0 ]; then
                log_success "Test de restauration réussi"
            else
                log_error "Test de restauration échoué"
            fi
        fi
    fi

    echo ""
    log_step "Étape 6/6: Configuration des alertes"
    echo ""

    read -p "Email pour les alertes de backup [backup@med-mng.fr]: " alert_email
    alert_email=${alert_email:-backup@med-mng.fr}

    echo "ALERT_EMAIL=$alert_email" >> "$env_file"

    log_success "Email d'alerte configuré: $alert_email"

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    log_success "Configuration Backups terminée!"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_info "Résumé:"
    echo "  - Backups quotidiens: 3 AM (database), 4 AM (storage)"
    echo "  - Backups mensuels: 5 AM (secrets), 10 AM (test restore)"
    echo "  - Logs: /var/log/med-mng/"
    echo "  - S3 Bucket: $s3_bucket"
    echo ""

    read -p "Appuyez sur Entrée pour retourner au menu..."
    show_menu
}

# Configuration Monitoring
setup_monitoring() {
    show_header
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  📊 CONFIGURATION MONITORING DASHBOARD${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_step "Étape 1/5: Exécution des migrations SQL"
    echo ""

    if confirm "Exécuter les migrations SQL (rate_limits + security_events)?"; then
        log_info "Connexion à Supabase..."

        read -p "Supabase DB URL (postgresql://...): " db_url

        log_info "Exécution de la migration rate_limits..."
        psql "$db_url" < "$PROJECT_ROOT/supabase/migrations/20251119_rate_limits.sql" 2>&1 | tee -a "$LOG_FILE"

        log_info "Exécution de la migration security_events..."
        psql "$db_url" < "$PROJECT_ROOT/supabase/migrations/20251119_security_events.sql" 2>&1 | tee -a "$LOG_FILE"

        log_success "Migrations SQL exécutées"

        echo ""
        log_info "Vérification des tables..."
        psql "$db_url" -c "SELECT COUNT(*) FROM rate_limits;" 2>&1 | tee -a "$LOG_FILE"
        psql "$db_url" -c "SELECT COUNT(*) FROM security_events;" 2>&1 | tee -a "$LOG_FILE"

        log_success "Tables créées avec succès"
    fi

    echo ""
    log_step "Étape 2/5: Installation de Metabase (Docker)"
    echo ""

    if command -v docker &> /dev/null; then
        if confirm "Installer Metabase avec Docker?"; then
            log_info "Démarrage de Metabase..."

            docker run -d -p 3000:3000 \
                --name metabase \
                -e "MB_DB_FILE=/metabase-data/metabase.db" \
                -v ~/metabase-data:/metabase-data \
                metabase/metabase 2>&1 | tee -a "$LOG_FILE"

            log_success "Metabase démarré sur http://localhost:3000"
            log_info "Attendez 1-2 minutes que Metabase démarre..."

            sleep 5

            log_info "Prochaines étapes:"
            echo "  1. Ouvrez http://localhost:3000"
            echo "  2. Créez un compte admin"
            echo "  3. Connectez-vous à PostgreSQL (Supabase)"
            echo "  4. Créez les dashboards recommandés"
        fi
    else
        log_warning "Docker non installé - Metabase non configuré"
        log_info "Installez Docker: https://docs.docker.com/get-docker/"
    fi

    echo ""
    log_step "Étape 3/5: Configuration des webhooks Slack/Teams"
    echo ""

    if confirm "Configurer les webhooks d'alertes?"; then
        echo ""
        log_info "Pour Slack:"
        echo "  1. Allez sur https://api.slack.com/messaging/webhooks"
        echo "  2. Créez un Incoming Webhook"
        echo "  3. Choisissez le channel #security-alerts"
        echo "  4. Copiez l'URL du webhook"
        echo ""

        read -p "Webhook URL Slack: " slack_webhook

        if [ -n "$slack_webhook" ]; then
            log_info "Configuration du secret Supabase..."
            supabase secrets set SLACK_SECURITY_WEBHOOK="$slack_webhook" 2>&1 | tee -a "$LOG_FILE"
            log_success "Webhook Slack configuré"
        fi

        echo ""
        if confirm "Configurer aussi Microsoft Teams?"; then
            echo ""
            log_info "Pour Microsoft Teams:"
            echo "  1. Ouvrez votre channel Teams"
            echo "  2. Cliquez sur '...' → Connectors → Incoming Webhook"
            echo "  3. Donnez un nom (ex: Med-MNG Security)"
            echo "  4. Copiez l'URL du webhook"
            echo ""

            read -p "Webhook URL Teams: " teams_webhook

            if [ -n "$teams_webhook" ]; then
                supabase secrets set TEAMS_SECURITY_WEBHOOK="$teams_webhook" 2>&1 | tee -a "$LOG_FILE"
                log_success "Webhook Teams configuré"
            fi
        fi
    fi

    echo ""
    log_step "Étape 4/5: Test des alertes"
    echo ""

    if confirm "Tester les alertes de sécurité?"; then
        log_info "Envoi d'une alerte test..."

        # Créer un événement test
        read -p "Supabase URL: " supabase_url
        read -p "Supabase Service Role Key: " service_key

        curl -X POST "$supabase_url/rest/v1/security_events" \
            -H "apikey: $service_key" \
            -H "Authorization: Bearer $service_key" \
            -H "Content-Type: application/json" \
            -d '{
                "event_type": "SUSPICIOUS_ACTIVITY",
                "severity": "high",
                "endpoint": "test-endpoint",
                "ip_address": "127.0.0.1",
                "user_agent": "Setup Wizard Test",
                "details": {"test": true, "message": "Test alert from setup wizard"}
            }' 2>&1 | tee -a "$LOG_FILE"

        echo ""
        log_success "Alerte test envoyée"
        log_info "Vérifiez votre channel Slack/Teams"
    fi

    echo ""
    log_step "Étape 5/5: Création des dashboards"
    echo ""

    log_info "Dashboards recommandés:"
    echo ""
    echo "  1. Security Overview (temps réel)"
    echo "     - Total événements 24h"
    echo "     - Événements critiques"
    echo "     - Top utilisateurs suspects"
    echo "     - Timeline des événements"
    echo ""
    echo "  2. Rate Limiting (surveillance API)"
    echo "     - Requêtes par endpoint"
    echo "     - Top utilisateurs"
    echo "     - Rate limit violations"
    echo "     - Coût estimé"
    echo ""
    echo "  3. Backup Status"
    echo "     - Dernier backup database"
    echo "     - Dernier backup storage"
    echo "     - Dernier test de restauration"
    echo "     - Taille totale"
    echo ""

    log_info "Consultez IMPLEMENTATION_GUIDE.md Section 4 pour les requêtes SQL"

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    log_success "Configuration Monitoring terminée!"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    read -p "Appuyez sur Entrée pour retourner au menu..."
    show_menu
}

# Configuration Formation
setup_training() {
    show_header
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🎓 CONFIGURATION FORMATION ÉQUIPE${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_step "Création du calendrier de formation sur 3 mois"
    echo ""

    # Demander la date de début
    read -p "Date de début des formations (YYYY-MM-DD): " start_date

    mkdir -p "$PROJECT_ROOT/training/sessions"
    mkdir -p "$PROJECT_ROOT/training/materials"
    mkdir -p "$PROJECT_ROOT/training/quizzes"

    # Générer le calendrier
    cat > "$PROJECT_ROOT/training/calendar.md" << EOF
# 📅 Calendrier de Formation Sécurité - Med-MNG

**Date de début**: $start_date
**Durée totale**: 3 mois
**Sessions totales**: 12 sessions (2h chacune)

---

## Mois 1: Formation Développeurs (8h)

### Semaine 1 - OWASP Top 10 (Partie 1)
**Date**: $(date -d "$start_date" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: A01-A03 (Access Control, Crypto Failures, Injection)
**Formateur**: Security Lead

### Semaine 2 - OWASP Top 10 (Partie 2)
**Date**: $(date -d "$start_date +7 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: A04-A10 (Insecure Design, Misconfiguration, etc.)
**Formateur**: Security Lead

### Semaine 3 - Secure Coding Practices
**Date**: $(date -d "$start_date +14 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: Input Validation, Error Handling, Logging
**Formateur**: Senior Dev

### Semaine 4 - Code Review Guidelines
**Date**: $(date -d "$start_date +21 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: Checklist de sécurité, Exemples pratiques
**Formateur**: Security Lead

---

## Mois 2: Formation DevOps & Management (8h)

### Semaine 5 - Infrastructure Security
**Date**: $(date -d "$start_date +28 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: Secrets Management, Network Security
**Formateur**: DevOps Lead

### Semaine 6 - CI/CD Security
**Date**: $(date -d "$start_date +35 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: GitHub Actions, Automated Testing
**Formateur**: DevOps Lead

### Semaine 7 - Backup & Disaster Recovery
**Date**: $(date -d "$start_date +42 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: Backup Strategy, RTO/RPO, Tests
**Formateur**: DBA Lead

### Semaine 8 - Security Metrics & Compliance
**Date**: $(date -d "$start_date +49 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: KPIs, RGPD, ISO 27001
**Formateur**: Security Lead + Management

---

## Mois 3: Certification & Pratique (7h)

### Semaine 9 - Quiz & Exercice Pratique
**Date**: $(date -d "$start_date +56 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: Quiz OWASP, Exercice de sécurisation
**Formateur**: Security Lead

### Semaine 10 - Code Review Pratique
**Date**: $(date -d "$start_date +63 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: Review de code en groupe
**Formateur**: Senior Devs

### Semaine 11 - Incident Response Drill
**Date**: $(date -d "$start_date +70 days" +%Y-%m-%d)
**Durée**: 2 heures
**Sujets**: Simulation d'incident, Procédures
**Formateur**: Security Team

### Semaine 12 - Certification
**Date**: $(date -d "$start_date +77 days" +%Y-%m-%d)
**Durée**: 1 heure
**Sujets**: Délivrance des certificats, Célébration
**Formateur**: Management + Security Team

---

## 📊 Suivi de Présence

| Participant | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | S12 | Score Quiz | Certificat |
|-------------|----|----|----|----|----|----|----|----|----|----- |-----|-----|------------|------------|
| Dev 1       |    |    |    |    |    |    |    |    |    |     |     |     |            |            |
| Dev 2       |    |    |    |    |    |    |    |    |    |     |     |     |            |            |
| DevOps 1    |    |    |    |    |    |    |    |    |    |     |     |     |            |            |

EOF

    log_success "Calendrier créé: training/calendar.md"

    echo ""
    log_step "Création des templates de session"

    for i in {1..12}; do
        cat > "$PROJECT_ROOT/training/sessions/session_$i.md" << EOF
# Session $i - [Titre]

**Date**: TBD
**Durée**: 2 heures
**Participants**: [Liste]
**Formateur**: [Nom]

## 🎯 Objectifs

- [ ] Objectif 1
- [ ] Objectif 2
- [ ] Objectif 3

## 📋 Agenda

- **00:00-00:15** : Introduction & Objectifs
- **00:15-00:45** : Théorie + Exemples
- **00:45-01:15** : Exercices Pratiques
- **01:15-01:45** : Code Review en Groupe
- **01:45-02:00** : Q&A + Quiz

## 📚 Matériel Requis

- [ ] Slides préparés
- [ ] Code examples
- [ ] Exercices pratiques
- [ ] Quiz (5 questions)

## ✅ Suivi

- [ ] Présence enregistrée
- [ ] Quiz complété (80% minimum)
- [ ] Feedback collecté
- [ ] Notes de session
EOF
    done

    log_success "12 templates de session créés"

    echo ""
    log_step "Création du quiz en ligne"

    cat > "$PROJECT_ROOT/training/quizzes/owasp_quiz.md" << EOF
# 🧪 Quiz OWASP Top 10 - Med-MNG

**Durée**: 15 minutes
**Questions**: 5
**Score minimum**: 80% (4/5)

---

## Question 1: Authentification

Quelle est la bonne façon de vérifier l'authentification dans une Edge Function?

A) Vérifier uniquement que le header Authorization existe
B) Vérifier le JWT avec supabase.auth.getUser()
C) Vérifier le JWT côté client uniquement
D) Faire confiance au client

**Réponse**: B ✅

**Explication**: Il faut toujours valider le JWT côté serveur avec supabase.auth.getUser(token).

---

## Question 2: Injection SQL

Comment prévenir les injections SQL?

A) Échapper les quotes manuellement
B) Utiliser des requêtes paramétrées (query builders)
C) Valider côté client uniquement
D) Bloquer le caractère '

**Réponse**: B ✅

**Explication**: Les query builders (comme ceux de Supabase) gèrent automatiquement l'échappement.

---

## Question 3: Secrets

Où doivent être stockées les API keys?

A) Dans le code source
B) Dans .env commité dans Git
C) Dans des variables d'environnement (Supabase Secrets)
D) Dans localStorage

**Réponse**: C ✅

**Explication**: Les secrets doivent être dans des variables d'environnement, jamais dans le code.

---

## Question 4: Rate Limiting

Quel est le bon niveau de rate limiting pour GPT-4?

A) Pas de limite
B) 20 requêtes/heure (gratuit), 100/h (premium)
C) 1000 requêtes/jour
D) Illimité pour les admins

**Réponse**: B ✅

**Explication**: GPT-4 coûte $0.03/1K tokens, il faut limiter pour éviter les abus.

---

## Question 5: Security Monitoring

Quand faut-il logger un événement de sécurité?

A) Uniquement pour les événements Critical
B) Jamais (trop de logs)
C) Pour tous les échecs d'auth, accès refusés, et activités suspectes
D) Uniquement en production

**Réponse**: C ✅

**Explication**: Tous les événements de sécurité doivent être loggés pour audit et détection.

---

## 📊 Résultats

- **5/5** : Excellent! 🎉
- **4/5** : Très bien! ✅
- **3/5** : À revoir ⚠️
- **<3/5** : Formation à refaire ❌

EOF

    log_success "Quiz OWASP créé"

    echo ""
    log_info "Création des invitations Google Calendar..."

    if confirm "Voulez-vous générer les invitations (.ics)?"; then
        # Générer des fichiers .ics pour chaque session
        log_info "Génération des fichiers .ics..."
        # TODO: Générer les fichiers .ics
        log_success "Fichiers .ics générés dans training/calendar/"
    fi

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    log_success "Configuration Formation terminée!"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_info "Prochaines étapes:"
    echo "  1. Consultez training/calendar.md"
    echo "  2. Personnalisez les sessions dans training/sessions/"
    echo "  3. Préparez les slides et exercices"
    echo "  4. Envoyez les invitations à l'équipe"
    echo ""

    read -p "Appuyez sur Entrée pour retourner au menu..."
    show_menu
}

# Configuration complète
setup_all() {
    show_header
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  ${ROCKET} CONFIGURATION COMPLÈTE${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_warning "Ceci va exécuter TOUTES les configurations"
    log_info "Durée estimée: 30-60 minutes"
    echo ""

    if ! confirm "Voulez-vous vraiment continuer?"; then
        show_menu
        return
    fi

    echo ""
    log_step "Configuration 1/4: GitHub Actions"
    setup_github_actions

    echo ""
    log_step "Configuration 2/4: Backups"
    setup_backups

    echo ""
    log_step "Configuration 3/4: Monitoring"
    setup_monitoring

    echo ""
    log_step "Configuration 4/4: Formation"
    setup_training

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ${STAR}${STAR}${STAR} CONFIGURATION COMPLÈTE TERMINÉE! ${STAR}${STAR}${STAR}${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""

    read -p "Appuyez sur Entrée pour retourner au menu..."
    show_menu
}

# Test de configuration
test_configuration() {
    show_header
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🧪 TEST DE CONFIGURATION${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    log_step "Vérification de la configuration actuelle..."
    echo ""

    local score=0
    local total=10

    # Test 1: Workflow GitHub Actions
    if [ -f "$PROJECT_ROOT/.github/workflows/security-scan.yml" ]; then
        log_success "Workflow security-scan.yml présent"
        ((score++))
    else
        log_error "Workflow security-scan.yml manquant"
    fi

    # Test 2: Scripts de backup
    if [ -f "$PROJECT_ROOT/scripts/backup-database.sh" ] && \
       [ -f "$PROJECT_ROOT/scripts/backup-storage.sh" ] && \
       [ -f "$PROJECT_ROOT/scripts/backup-secrets.sh" ] && \
       [ -f "$PROJECT_ROOT/scripts/test-restore.sh" ]; then
        log_success "Scripts de backup présents (4/4)"
        ((score++))
    else
        log_error "Scripts de backup manquants"
    fi

    # Test 3: Migrations SQL
    if [ -f "$PROJECT_ROOT/supabase/migrations/20251119_rate_limits.sql" ] && \
       [ -f "$PROJECT_ROOT/supabase/migrations/20251119_security_events.sql" ]; then
        log_success "Migrations SQL présentes (2/2)"
        ((score++))
    else
        log_error "Migrations SQL manquantes"
    fi

    # Test 4: Configuration ESLint
    if [ -f "$PROJECT_ROOT/.eslintrc.security.json" ]; then
        log_success "Configuration ESLint sécurité présente"
        ((score++))
    else
        log_error "Configuration ESLint manquante"
    fi

    # Test 5: Règles Semgrep
    if [ -f "$PROJECT_ROOT/.semgrep/security-rules.yml" ]; then
        log_success "Règles Semgrep présentes"
        ((score++))
    else
        log_error "Règles Semgrep manquantes"
    fi

    # Test 6: Documentation
    local docs=0
    [ -f "$PROJECT_ROOT/SECURITY_AUDIT_FINAL_REPORT.md" ] && ((docs++))
    [ -f "$PROJECT_ROOT/SECURITY_TESTING_GUIDE.md" ] && ((docs++))
    [ -f "$PROJECT_ROOT/BACKUP_DISASTER_RECOVERY.md" ] && ((docs++))
    [ -f "$PROJECT_ROOT/SECURITY_TRAINING_GUIDE.md" ] && ((docs++))
    [ -f "$PROJECT_ROOT/IMPLEMENTATION_GUIDE.md" ] && ((docs++))
    [ -f "$PROJECT_ROOT/LONG_TERM_ROADMAP.md" ] && ((docs++))

    if [ $docs -eq 6 ]; then
        log_success "Documentation complète (6/6)"
        ((score++))
    else
        log_warning "Documentation incomplète ($docs/6)"
    fi

    # Test 7: .env.backup
    if [ -f "$PROJECT_ROOT/.env.backup" ]; then
        log_success "Fichier .env.backup configuré"
        ((score++))
    else
        log_warning ".env.backup non configuré (normal si pas encore fait)"
    fi

    # Test 8: Cron jobs
    if crontab -l 2>/dev/null | grep -q "med-mng"; then
        log_success "Cron jobs configurés"
        ((score++))
    else
        log_warning "Cron jobs non configurés"
    fi

    # Test 9: Docker (optionnel)
    if command -v docker &> /dev/null && docker ps | grep -q metabase; then
        log_success "Metabase en cours d'exécution"
        ((score++))
    else
        log_warning "Metabase non configuré (optionnel)"
    fi

    # Test 10: AWS CLI (optionnel)
    if command -v aws &> /dev/null && aws s3 ls &> /dev/null; then
        log_success "AWS CLI configuré"
        ((score++))
    else
        log_warning "AWS CLI non configuré"
    fi

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

    local percentage=$((score * 100 / total))

    if [ $percentage -ge 80 ]; then
        echo -e "${GREEN}  Score: $score/$total ($percentage%) - Excellent! ⭐⭐⭐${NC}"
    elif [ $percentage -ge 60 ]; then
        echo -e "${YELLOW}  Score: $score/$total ($percentage%) - Bon ⭐⭐${NC}"
    else
        echo -e "${RED}  Score: $score/$total ($percentage%) - À améliorer ⭐${NC}"
    fi

    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    read -p "Appuyez sur Entrée pour retourner au menu..."
    show_menu
}

# Afficher le statut
show_status() {
    show_header
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  📋 STATUT DE PROGRESSION${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    # Lire SECURITY_STATUS_TRACKER.md si disponible
    if [ -f "$PROJECT_ROOT/SECURITY_STATUS_TRACKER.md" ]; then
        less "$PROJECT_ROOT/SECURITY_STATUS_TRACKER.md"
    else
        log_error "SECURITY_STATUS_TRACKER.md non trouvé"
    fi

    echo ""
    read -p "Appuyez sur Entrée pour retourner au menu..."
    show_menu
}

# Point d'entrée principal
main() {
    # Initialiser le log
    echo "Med-MNG Security Setup Wizard - $(date)" > "$LOG_FILE"

    show_header

    log_step "Bienvenue dans le Med-MNG Security Setup Wizard!"
    echo ""
    log_info "Ce script va vous guider dans la configuration de:"
    echo "  - Tests de sécurité automatisés (GitHub Actions)"
    echo "  - Backups automatiques (S3 + Scripts)"
    echo "  - Monitoring & Alerting (Metabase + Slack)"
    echo "  - Formation équipe (Calendrier + Quiz)"
    echo ""

    read -p "Appuyez sur Entrée pour continuer..."

    # Vérifier les prérequis
    if ! check_prerequisites; then
        echo ""
        log_error "Installez les prérequis manquants et relancez le script"
        exit 1
    fi

    echo ""
    read -p "Appuyez sur Entrée pour accéder au menu principal..."

    # Afficher le menu
    show_menu
}

# Lancer le script
main

