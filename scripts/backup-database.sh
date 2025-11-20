#!/bin/bash
# ========================================
# Database Backup Script
# ========================================
# Crée un backup complet de la base de données PostgreSQL
# Utilise pg_dump avec compression

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/database"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Créer le répertoire si nécessaire
mkdir -p $BACKUP_DIR

# Fonction de logging
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "========================================="
log "Starting database backup"
log "========================================="

# Vérifier que les variables d'environnement sont définies
if [ -z "$SUPABASE_DB_HOST" ]; then
  log "ERROR: SUPABASE_DB_HOST not set"
  exit 1
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  log "ERROR: SUPABASE_DB_PASSWORD not set"
  exit 1
fi

# Backup complet avec pg_dump
log "Creating database backup..."

PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
  -h ${SUPABASE_DB_HOST:-db.your-project.supabase.co} \
  -p ${SUPABASE_DB_PORT:-5432} \
  -U postgres \
  -d postgres \
  --format=custom \
  --compress=9 \
  --verbose \
  --file=$BACKUP_FILE 2>&1 | tee -a $LOG_FILE

# Vérifier que le backup a réussi
if [ $? -eq 0 ]; then
  SIZE=$(du -h $BACKUP_FILE | cut -f1)
  log "✅ Backup created successfully: $BACKUP_FILE ($SIZE)"
else
  log "❌ Backup failed"
  exit 1
fi

# Uploader vers S3 (si configuré)
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
  log "Uploading to S3..."

  aws s3 cp $BACKUP_FILE s3://$AWS_S3_BACKUP_BUCKET/database/ \
    --storage-class STANDARD_IA \
    --server-side-encryption AES256 2>&1 | tee -a $LOG_FILE

  if [ $? -eq 0 ]; then
    log "✅ Uploaded to S3: s3://$AWS_S3_BACKUP_BUCKET/database/"
  else
    log "⚠️  S3 upload failed, but local backup exists"
  fi
fi

# Nettoyer les backups locaux > 30 jours
log "Cleaning old backups (>30 days)..."
DELETED=$(find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete -print | wc -l)
log "🧹 Deleted $DELETED old backup(s)"

# Statistiques
TOTAL_BACKUPS=$(ls -1 $BACKUP_DIR/backup_*.sql 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)

log "========================================="
log "Backup complete!"
log "Total backups: $TOTAL_BACKUPS"
log "Total size: $TOTAL_SIZE"
log "Latest backup: $BACKUP_FILE"
log "========================================="
