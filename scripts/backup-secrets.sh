#!/bin/bash
# ========================================
# Secrets Backup Script
# ========================================
# Sauvegarde les secrets/variables d'environnement de manière chiffrée

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/secrets"
BACKUP_FILE="$BACKUP_DIR/secrets_$TIMESTAMP.json.enc"
LOG_FILE="$BACKUP_DIR/backup.log"
TEMP_FILE="/tmp/secrets_temp_$$. json"

# Créer le répertoire si nécessaire
mkdir -p $BACKUP_DIR

# Fonction de logging
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Fonction de nettoyage
cleanup() {
  if [ -f "$TEMP_FILE" ]; then
    rm -f $TEMP_FILE
  fi
}
trap cleanup EXIT

log "========================================="
log "Starting secrets backup"
log "========================================="

# Vérifier que GPG est installé
if ! command -v gpg &> /dev/null; then
  log "ERROR: GPG not installed"
  log "Install with: apt-get install gnupg (Debian/Ubuntu)"
  exit 1
fi

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
  log "ERROR: Supabase CLI not installed"
  log "Install with: npm install -g supabase"
  exit 1
fi

# Exporter les secrets depuis Supabase
log "Exporting secrets from Supabase..."
supabase secrets list --json > $TEMP_FILE 2>&1 | tee -a $LOG_FILE

if [ $? -ne 0 ]; then
  log "ERROR: Failed to export secrets from Supabase"
  exit 1
fi

# Vérifier que le fichier contient des données
if [ ! -s "$TEMP_FILE" ]; then
  log "ERROR: Exported secrets file is empty"
  exit 1
fi

SECRET_COUNT=$(jq 'length' $TEMP_FILE 2>/dev/null || echo "0")
log "Exported $SECRET_COUNT secret(s)"

# Demander la passphrase (ou utiliser variable d'environnement)
if [ -z "$GPG_PASSPHRASE" ]; then
  log "⚠️  GPG_PASSPHRASE not set, prompting for passphrase..."
  echo "Enter GPG passphrase for encryption:"
  read -s GPG_PASSPHRASE
  echo
fi

# Chiffrer avec GPG
log "Encrypting secrets..."
echo "$GPG_PASSPHRASE" | gpg \
  --batch \
  --yes \
  --symmetric \
  --cipher-algo AES256 \
  --passphrase-fd 0 \
  --output $BACKUP_FILE \
  $TEMP_FILE 2>&1 | tee -a $LOG_FILE

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h $BACKUP_FILE | cut -f1)
  log "✅ Secrets encrypted successfully: $BACKUP_FILE ($SIZE)"
else
  log "❌ Encryption failed"
  exit 1
fi

# Créer un lien symbolique vers le dernier backup
ln -sf $(basename $BACKUP_FILE) $BACKUP_DIR/secrets_latest.json.enc
log "Created symlink: secrets_latest.json.enc"

# Uploader vers S3 (si configuré)
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
  log "Uploading to S3..."

  aws s3 cp $BACKUP_FILE s3://$AWS_S3_BACKUP_BUCKET/secrets/ \
    --storage-class STANDARD_IA \
    --server-side-encryption AES256 2>&1 | tee -a $LOG_FILE

  if [ $? -eq 0 ]; then
    log "✅ Uploaded to S3"
  else
    log "⚠️  S3 upload failed, but local backup exists"
  fi
fi

# Nettoyer les backups locaux > 12 mois
log "Cleaning old backups (>365 days)..."
DELETED=$(find $BACKUP_DIR -name "secrets_*.json.enc" -mtime +365 -delete -print | wc -l)
log "🧹 Deleted $DELETED old backup(s)"

# Statistiques
TOTAL_BACKUPS=$(ls -1 $BACKUP_DIR/secrets_*.json.enc 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)

log "========================================="
log "Secrets backup complete!"
log "Total backups: $TOTAL_BACKUPS"
log "Total size: $TOTAL_SIZE"
log "Latest backup: $BACKUP_FILE"
log "========================================="
log "⚠️  IMPORTANT: Store the GPG passphrase securely!"
log "To decrypt: gpg --decrypt $BACKUP_FILE > secrets.json"
