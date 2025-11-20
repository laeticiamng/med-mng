# 💾 Backup & Disaster Recovery Plan - Med-MNG

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Stratégie de Backup](#stratégie-de-backup)
3. [Configuration Supabase](#configuration-supabase)
4. [Scripts de Backup](#scripts-de-backup)
5. [Disaster Recovery](#disaster-recovery)
6. [Tests de Restauration](#tests-de-restauration)
7. [RTO & RPO](#rto--rpo)
8. [Procédures d'Urgence](#procédures-durgence)

---

## 🚀 Introduction

Ce plan décrit la stratégie complète de backup et de disaster recovery pour la plateforme Med-MNG, incluant la base de données, les fichiers, les configurations et le code.

### Objectifs

- **RTO (Recovery Time Objective)**: <2 heures
- **RPO (Recovery Point Objective)**: <1 heure
- **Disponibilité**: 99.9% (8.76h downtime/an max)
- **Rétention**: 30 jours backups quotidiens, 12 mois backups mensuels

---

## 💾 Stratégie de Backup

### Architecture 3-2-1

La stratégie de backup suit la règle **3-2-1**:
- **3** copies des données (prod + 2 backups)
- **2** types de médias différents (S3 + local)
- **1** copie off-site (région différente)

### Types de Backup

#### 1. **Database (Supabase PostgreSQL)**

| Type | Fréquence | Rétention | Méthode |
|------|-----------|-----------|---------|
| Full backup | Quotidien 3 AM UTC | 30 jours | Supabase PITR |
| Transaction logs | Continu | 7 jours | WAL archiving |
| Snapshot manuel | Avant chaque déploiement | 7 jours | pg_dump |

#### 2. **Storage (Fichiers)**

| Type | Fréquence | Rétention | Méthode |
|------|-----------|-----------|---------|
| Full backup | Hebdomadaire | 4 semaines | S3 sync |
| Incremental | Quotidien | 7 jours | rsync |
| Versioning | Continu | Permanent | S3 versioning |

#### 3. **Code & Configuration**

| Type | Fréquence | Rétention | Méthode |
|------|-----------|-----------|---------|
| Git commits | Continu | Permanent | GitHub |
| Secrets/ENV | Mensuel | 12 mois | Encrypted backup |
| Docker images | À chaque build | 10 derniers | Container registry |

#### 4. **Edge Functions**

| Type | Fréquence | Rétention | Méthode |
|------|-----------|-----------|---------|
| Code source | Continu | Permanent | Git |
| Deployed versions | À chaque deploy | 10 derniers | Supabase |

---

## ⚙️ Configuration Supabase

### 1. Point-in-Time Recovery (PITR)

**Activer PITR** dans Supabase Dashboard:

```sql
-- Vérifier que PITR est activé
SELECT name, setting
FROM pg_settings
WHERE name IN ('wal_level', 'archive_mode', 'max_wal_senders');

-- Résultat attendu:
-- wal_level: replica
-- archive_mode: on
-- max_wal_senders: 10
```

**Avantages**:
- Restauration à n'importe quel point dans le temps (derniers 7 jours)
- RPO: ~5 minutes
- Automatique, pas de configuration manuelle

**Restaurer à un point dans le temps**:
1. Aller dans Supabase Dashboard → Database → Backups
2. Sélectionner "Point in Time Recovery"
3. Choisir la date/heure
4. Créer un nouveau projet avec les données restaurées

---

### 2. Backups Quotidiens Automatiques

Supabase effectue automatiquement:
- **Backups quotidiens**: Chaque jour à 3 AM UTC
- **Rétention**: 30 jours
- **Stockage**: Multi-région AWS S3

**Vérifier les backups**:
```bash
# Via Supabase CLI
supabase db backups list

# Derniers backups
supabase db backups list --limit 10
```

---

### 3. Backups Manuels (pg_dump)

**Script de backup manuel**:
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/database"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "🔄 Starting database backup..."

# Backup complet avec pg_dump
PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
  -h $SUPABASE_DB_HOST \
  -p $SUPABASE_DB_PORT \
  -U postgres \
  -d postgres \
  --format=custom \
  --compress=9 \
  --verbose \
  --file=$BACKUP_FILE

# Vérifier la taille du backup
SIZE=$(du -h $BACKUP_FILE | cut -f1)
echo "✅ Backup created: $BACKUP_FILE ($SIZE)"

# Uploader vers S3 (optionnel)
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
  echo "📤 Uploading to S3..."
  aws s3 cp $BACKUP_FILE s3://$AWS_S3_BACKUP_BUCKET/database/
  echo "✅ Uploaded to S3"
fi

# Nettoyer les backups > 30 jours
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
echo "🧹 Cleaned old backups"

echo "✅ Backup complete!"
```

**Utilisation**:
```bash
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh
```

---

### 4. Backup Storage (Fichiers)

**Script de backup des fichiers**:
```bash
#!/bin/bash
# scripts/backup-storage.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/storage"

mkdir -p $BACKUP_DIR

echo "🔄 Starting storage backup..."

# Utiliser Supabase CLI pour télécharger tous les fichiers
supabase storage ls --recursive > $BACKUP_DIR/file_list_$TIMESTAMP.txt

# Backup des buckets importants
BUCKETS=("avatars" "documents" "generated-music" "generated-images")

for BUCKET in "${BUCKETS[@]}"; do
  echo "📦 Backing up bucket: $BUCKET"

  # Créer un répertoire pour le bucket
  mkdir -p $BACKUP_DIR/$BUCKET

  # Télécharger tous les fichiers du bucket
  supabase storage download $BUCKET/* $BACKUP_DIR/$BUCKET/ --recursive

  # Compresser
  tar -czf $BACKUP_DIR/${BUCKET}_$TIMESTAMP.tar.gz -C $BACKUP_DIR $BUCKET
  rm -rf $BACKUP_DIR/$BUCKET

  echo "✅ Backed up $BUCKET"
done

# Uploader vers S3
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
  echo "📤 Uploading to S3..."
  aws s3 sync $BACKUP_DIR s3://$AWS_S3_BACKUP_BUCKET/storage/
  echo "✅ Uploaded to S3"
fi

# Nettoyer les backups > 7 jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Storage backup complete!"
```

---

### 5. Backup Secrets & Environment Variables

**Script de backup sécurisé**:
```bash
#!/bin/bash
# scripts/backup-secrets.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/secrets"
BACKUP_FILE="$BACKUP_DIR/secrets_$TIMESTAMP.json.enc"

mkdir -p $BACKUP_DIR

echo "🔄 Starting secrets backup..."

# Exporter les secrets depuis Supabase
supabase secrets list --json > /tmp/secrets_temp.json

# Chiffrer avec GPG
gpg --symmetric --cipher-algo AES256 \
  --output $BACKUP_FILE \
  /tmp/secrets_temp.json

# Nettoyer le fichier temporaire
rm /tmp/secrets_temp.json

echo "✅ Secrets backed up and encrypted: $BACKUP_FILE"

# Uploader vers S3 (chiffré)
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
  aws s3 cp $BACKUP_FILE s3://$AWS_S3_BACKUP_BUCKET/secrets/
  echo "✅ Uploaded to S3"
fi

echo "⚠️  Store the GPG passphrase securely!"
```

**Déchiffrer les secrets**:
```bash
gpg --decrypt backups/secrets/secrets_20251119_030000.json.enc > secrets.json
```

---

## 🔄 Disaster Recovery

### Scénarios de Disaster

#### 1. Database Corruption

**Symptômes**:
- Erreurs de requête SQL
- Données incohérentes
- Tables manquantes

**Procédure de récupération**:

```bash
# Étape 1: Identifier l'heure du problème
echo "Problem occurred at: 2025-11-19 14:30:00 UTC"

# Étape 2: Restaurer via PITR
# Dans Supabase Dashboard:
# 1. Database → Backups → Point in Time Recovery
# 2. Sélectionner: 2025-11-19 14:25:00 UTC (5 min avant)
# 3. Créer nouveau projet avec données restaurées

# Étape 3: Migrer vers le nouveau projet
# Mettre à jour SUPABASE_URL et SUPABASE_ANON_KEY

# Étape 4: Vérifier l'intégrité
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM security_events;"

# Étape 5: Redémarrer les applications
```

**RTO**: 1-2 heures
**RPO**: 5-10 minutes

---

#### 2. Complete Data Loss

**Symptômes**:
- Projet Supabase supprimé
- Base de données inaccessible
- Perte totale

**Procédure de récupération**:

```bash
# Étape 1: Créer un nouveau projet Supabase
supabase projects create med-mng-recovery

# Étape 2: Restaurer depuis le dernier backup pg_dump
LATEST_BACKUP=$(ls -t backups/database/backup_*.sql | head -1)
echo "Restoring from: $LATEST_BACKUP"

pg_restore \
  -h $NEW_SUPABASE_DB_HOST \
  -U postgres \
  -d postgres \
  --verbose \
  $LATEST_BACKUP

# Étape 3: Exécuter les migrations manquantes
supabase db push

# Étape 4: Restaurer les fichiers storage
aws s3 sync s3://$AWS_S3_BACKUP_BUCKET/storage/ ./storage_restore/

# Uploader vers nouveau projet Supabase
for BUCKET in avatars documents generated-music; do
  supabase storage upload $BUCKET ./storage_restore/$BUCKET/*
done

# Étape 5: Restaurer les secrets
gpg --decrypt backups/secrets/secrets_latest.json.enc > secrets.json
cat secrets.json | jq -r 'to_entries[] | "\(.key)=\(.value)"' | \
  xargs -I {} supabase secrets set {}

# Étape 6: Mettre à jour les variables d'environnement
echo "Update SUPABASE_URL and SUPABASE_ANON_KEY in production"

# Étape 7: Déployer les Edge Functions
supabase functions deploy --all

# Étape 8: Tests de validation
npm run test:e2e
```

**RTO**: 3-4 heures
**RPO**: 24 heures (dernier backup quotidien)

---

#### 3. Storage Bucket Deleted

**Procédure de récupération**:

```bash
# Étape 1: Recréer le bucket
supabase storage buckets create avatars --public

# Étape 2: Restaurer depuis S3
aws s3 sync s3://$AWS_S3_BACKUP_BUCKET/storage/avatars/ ./temp_restore/

# Étape 3: Uploader vers Supabase
supabase storage upload avatars ./temp_restore/*

# Étape 4: Vérifier
supabase storage ls avatars --recursive
```

**RTO**: 30 minutes
**RPO**: 1 jour

---

#### 4. Ransomware Attack

**Procédure de récupération**:

```bash
# Étape 1: ISOLER IMMÉDIATEMENT
# - Bloquer tous les accès
# - Révoquer tous les tokens
# - Désactiver les API keys

# Étape 2: Analyse forensique
# - Identifier le point d'entrée
# - Analyser les logs de sécurité
# - Documenter l'incident

# Étape 3: Restauration depuis backup immutable (S3)
# Les backups S3 avec versioning sont protégés contre suppression

# Restaurer à partir du dernier backup non-infecté
CLEAN_BACKUP=$(aws s3 ls s3://$AWS_S3_BACKUP_BUCKET/database/ | grep "backup_" | tail -2 | head -1)

# Étape 4: Nettoyer et restaurer
# Suivre la procédure "Complete Data Loss"

# Étape 5: Renforcer la sécurité
# - Changer tous les mots de passe
# - Régénérer toutes les API keys
# - Audit de sécurité complet
# - Patch les vulnérabilités identifiées
```

**RTO**: 4-6 heures
**RPO**: Variable (dernier backup propre)

---

## 🧪 Tests de Restauration

### Test Mensuel de Restauration

**Procédure**:

```bash
#!/bin/bash
# scripts/test-restore.sh

set -e

echo "🧪 Starting monthly restore test..."

# Étape 1: Créer un projet de test
TEST_PROJECT="med-mng-restore-test-$(date +%Y%m)"

echo "Creating test project: $TEST_PROJECT"
supabase projects create $TEST_PROJECT

# Étape 2: Restaurer le dernier backup
LATEST_BACKUP=$(ls -t backups/database/backup_*.sql | head -1)
echo "Restoring from: $LATEST_BACKUP"

pg_restore \
  -h $TEST_DB_HOST \
  -U postgres \
  -d postgres \
  $LATEST_BACKUP

# Étape 3: Vérifier l'intégrité des données
echo "Verifying data integrity..."

TESTS=(
  "SELECT COUNT(*) FROM users"
  "SELECT COUNT(*) FROM security_events"
  "SELECT COUNT(*) FROM rate_limits"
  "SELECT COUNT(*) FROM user_roles"
)

for TEST in "${TESTS[@]}"; do
  RESULT=$(psql $TEST_DB_URL -t -c "$TEST")
  echo "✅ $TEST: $RESULT"
done

# Étape 4: Tester les fonctionnalités critiques
echo "Testing critical functions..."

# Test authentification
curl -X POST $TEST_URL/functions/v1/customer-portal \
  -H "Authorization: Bearer $TEST_TOKEN" \
  || echo "❌ Auth test failed"

# Test rate limiting
curl -X POST $TEST_URL/functions/v1/content-ai-generator \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}' \
  || echo "❌ Rate limit test failed"

# Étape 5: Nettoyer
echo "Cleaning up test project..."
supabase projects delete $TEST_PROJECT

echo "✅ Restore test complete!"

# Étape 6: Documenter les résultats
cat > test-results/restore_test_$(date +%Y%m%d).txt <<EOF
Restore Test Results
Date: $(date)
Backup used: $LATEST_BACKUP
Test project: $TEST_PROJECT
Status: SUCCESS
Duration: $SECONDS seconds
EOF
```

**Planifier mensuellement**:
```bash
# Ajouter au crontab
0 4 1 * * /path/to/scripts/test-restore.sh
```

---

## 📊 RTO & RPO

### Tableau Récapitulatif

| Scénario | RTO | RPO | Impact Business |
|----------|-----|-----|-----------------|
| **Database corruption** | 1-2h | 5-10 min | Faible |
| **Single table deleted** | 30 min | 5-10 min | Très faible |
| **Complete data loss** | 3-4h | 24h | Moyen |
| **Storage bucket deleted** | 30 min | 24h | Faible |
| **Ransomware attack** | 4-6h | Variable | Élevé |
| **Region failure** | 2-3h | 1h | Moyen |

### Calcul du RTO

```
RTO = Temps détection + Temps décision + Temps restauration + Temps validation

Exemple (Database corruption):
RTO = 15 min (détection) + 15 min (décision) + 60 min (restauration) + 30 min (validation)
RTO = 2 heures
```

### Calcul du RPO

```
RPO = Fréquence des backups

- PITR: 5-10 minutes
- Backup quotidien: 24 heures
- Transaction logs: Continue (0 RPO)
```

---

## 🚨 Procédures d'Urgence

### Contact d'Urgence

| Rôle | Nom | Contact | Disponibilité |
|------|-----|---------|---------------|
| **DBA Lead** | [Nom] | +33 X XX XX XX XX | 24/7 |
| **DevOps Lead** | [Nom] | +33 X XX XX XX XX | 24/7 |
| **Security Lead** | [Nom] | +33 X XX XX XX XX | 24/7 |
| **CTO** | [Nom] | +33 X XX XX XX XX | 24/7 |

### Escalation Matrix

**Level 1** (0-30 min): DevOps team
**Level 2** (30-60 min): DBA + Security team
**Level 3** (60+ min): CTO + Management

### Communication Plan

**Interne**:
- Slack channel: #incident-response
- Email: incidents@med-mng.fr

**Externe** (si nécessaire):
- Status page: status.med-mng.fr
- Email clients: support@med-mng.fr
- Réseaux sociaux: @medmng

---

## ✅ Checklist de Vérification

### Quotidienne
- [ ] Vérifier que le backup automatique Supabase a réussi
- [ ] Vérifier l'espace disque des backups locaux
- [ ] Review des logs de backup

### Hebdomadaire
- [ ] Exécuter backup manuel (pg_dump)
- [ ] Backup des fichiers storage
- [ ] Vérifier la synchronisation S3

### Mensuelle
- [ ] Test de restauration complet
- [ ] Backup des secrets/env variables
- [ ] Audit des politiques de rétention
- [ ] Review du disaster recovery plan

### Trimestrielle
- [ ] Disaster recovery drill (simulation)
- [ ] Update des procédures
- [ ] Formation équipe sur DR
- [ ] Audit externe des backups

---

## 🔐 Sécurité des Backups

### Chiffrement

**En transit**:
- TLS 1.3 pour tous les transferts
- SSH pour rsync

**Au repos**:
- AES-256 pour les backups locaux
- S3 Server-Side Encryption (SSE-S3)
- GPG pour les secrets

### Accès

**Contrôle d'accès**:
- IAM roles pour S3
- MFA requis pour restauration
- Audit trail de tous les accès

**Rétention**:
- 30 jours: backups quotidiens
- 12 mois: backups mensuels
- 7 ans: backups annuels (compliance RGPD)

---

## 📚 Documentation

**Ressources**:
- Supabase Backup Docs: https://supabase.com/docs/guides/platform/backups
- PostgreSQL Backup Best Practices: https://www.postgresql.org/docs/current/backup.html
- AWS S3 Backup: https://docs.aws.amazon.com/AmazonS3/latest/userguide/backup-and-restore.html

**Support**:
- Email: backup@med-mng.fr
- Slack: #infrastructure
