#!/bin/bash
# ========================================
# Storage Backup Script
# ========================================
# Sauvegarde tous les buckets Supabase Storage

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/storage"
LOG_FILE="$BACKUP_DIR/backup.log"

# Buckets à sauvegarder
BUCKETS=("avatars" "documents" "generated-music" "generated-images")

# Créer le répertoire si nécessaire
mkdir -p $BACKUP_DIR

# Fonction de logging
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "========================================="
log "Starting storage backup"
log "========================================="

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
  log "ERROR: Supabase CLI not installed"
  log "Install with: npm install -g supabase"
  exit 1
fi

# Lister tous les fichiers
log "Listing all files..."
supabase storage ls --recursive > $BACKUP_DIR/file_list_$TIMESTAMP.txt 2>&1 | tee -a $LOG_FILE

# Backup de chaque bucket
for BUCKET in "${BUCKETS[@]}"; do
  log "========================================="
  log "Backing up bucket: $BUCKET"

  # Créer un répertoire pour le bucket
  BUCKET_DIR="$BACKUP_DIR/${BUCKET}_$TIMESTAMP"
  mkdir -p $BUCKET_DIR

  # Télécharger tous les fichiers du bucket
  log "Downloading files from $BUCKET..."

  # Utiliser l'API Supabase Storage
  supabase storage download $BUCKET/* $BUCKET_DIR/ --recursive 2>&1 | tee -a $LOG_FILE || {
    log "⚠️  Some files may have failed to download"
  }

  # Compter les fichiers téléchargés
  FILE_COUNT=$(find $BUCKET_DIR -type f | wc -l)
  log "Downloaded $FILE_COUNT files"

  # Compresser le bucket
  log "Compressing $BUCKET..."
  tar -czf $BACKUP_DIR/${BUCKET}_$TIMESTAMP.tar.gz -C $BACKUP_DIR ${BUCKET}_$TIMESTAMP 2>&1 | tee -a $LOG_FILE

  # Vérifier la compression
  if [ -f "$BACKUP_DIR/${BUCKET}_$TIMESTAMP.tar.gz" ]; then
    SIZE=$(du -h $BACKUP_DIR/${BUCKET}_$TIMESTAMP.tar.gz | cut -f1)
    log "✅ Compressed: ${BUCKET}_$TIMESTAMP.tar.gz ($SIZE)"

    # Supprimer le répertoire non compressé
    rm -rf $BUCKET_DIR
  else
    log "❌ Compression failed for $BUCKET"
  fi
done

# Uploader vers S3 (si configuré)
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
  log "========================================="
  log "Uploading to S3..."

  aws s3 sync $BACKUP_DIR s3://$AWS_S3_BACKUP_BUCKET/storage/ \
    --exclude "*" \
    --include "*.tar.gz" \
    --include "file_list_*.txt" \
    --storage-class STANDARD_IA \
    --server-side-encryption AES256 2>&1 | tee -a $LOG_FILE

  if [ $? -eq 0 ]; then
    log "✅ Uploaded to S3"
  else
    log "⚠️  S3 upload failed, but local backups exist"
  fi
fi

# Nettoyer les backups locaux > 7 jours
log "========================================="
log "Cleaning old backups (>7 days)..."
DELETED=$(find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete -print | wc -l)
log "🧹 Deleted $DELETED old backup(s)"

# Statistiques
TOTAL_BACKUPS=$(ls -1 $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)

log "========================================="
log "Storage backup complete!"
log "Total backups: $TOTAL_BACKUPS"
log "Total size: $TOTAL_SIZE"
log "========================================="
