# 🚀 Guide de Mise en Œuvre - Actions Recommandées

Ce guide détaille les étapes pratiques pour activer toutes les fonctionnalités de sécurité implémentées.

---

## 📋 Table des Matières

1. [GitHub Actions Setup](#github-actions-setup)
2. [Backup Automation](#backup-automation)
3. [Formation Schedule](#formation-schedule)
4. [Monitoring Dashboard](#monitoring-dashboard)
5. [Validation & Testing](#validation--testing)

---

## 🔧 1. GitHub Actions Setup

### Étape 1.1: Vérifier le Workflow

```bash
# Vérifier que le workflow existe
cat .github/workflows/security-scan.yml

# Le workflow devrait s'activer automatiquement sur le prochain push
```

### Étape 1.2: Configurer les Secrets GitHub

**Aller dans GitHub → Settings → Secrets and variables → Actions**

Ajouter les secrets suivants :

#### 1. Snyk Token (pour dependency scanning)

```bash
# 1. Créer un compte Snyk gratuit: https://snyk.io/
# 2. Aller dans Account Settings → API Token
# 3. Copier le token

# Ajouter dans GitHub:
Nom: SNYK_TOKEN
Valeur: [votre-token-snyk]
```

#### 2. Supabase Credentials (pour tests API)

```bash
# Ajouter dans GitHub:
Nom: SUPABASE_URL
Valeur: https://your-project.supabase.co

Nom: SUPABASE_ANON_KEY
Valeur: [votre-anon-key]

Nom: SUPABASE_SERVICE_ROLE_KEY
Valeur: [votre-service-role-key]
```

#### 3. Test User Token (pour API security tests)

```bash
# 1. Créer un utilisateur de test dans Supabase
# 2. Se connecter et récupérer le JWT token
# 3. Ajouter dans GitHub:
Nom: TEST_USER_TOKEN
Valeur: [jwt-token-test-user]

Nom: TEST_ADMIN_TOKEN
Valeur: [jwt-token-admin-user]
```

### Étape 1.3: Tester le Workflow

```bash
# Option 1: Push un commit pour déclencher le workflow
git commit --allow-empty -m "test: trigger security scan"
git push

# Option 2: Déclencher manuellement
# GitHub → Actions → Security Scan → Run workflow

# Vérifier les résultats
# GitHub → Actions → Vérifier le dernier run
```

### Étape 1.4: Activer GitHub Security Features

```bash
# 1. Aller dans GitHub → Settings → Security
# 2. Activer "Dependency graph"
# 3. Activer "Dependabot alerts"
# 4. Activer "Dependabot security updates"
# 5. Activer "Code scanning" (Semgrep SARIF uploads)
```

---

## 💾 2. Backup Automation

### Étape 2.1: Configuration des Variables d'Environnement

Créer un fichier `.env.backup` (NE PAS COMMITER) :

```bash
# .env.backup
# Supabase Database
SUPABASE_DB_HOST=db.your-project.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_PASSWORD=your-db-password

# AWS S3 (pour backup off-site)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BACKUP_BUCKET=med-mng-backups
AWS_DEFAULT_REGION=eu-west-1

# GPG (pour chiffrement secrets)
GPG_PASSPHRASE=your-secure-passphrase
```

Charger les variables :

```bash
# Ajouter au .bashrc ou .zshrc
source /path/to/med-mng/.env.backup
```

### Étape 2.2: Créer le Bucket S3

```bash
# 1. Installer AWS CLI
# macOS:
brew install awscli

# Linux:
sudo apt-get install awscli

# 2. Configurer AWS CLI
aws configure
# AWS Access Key ID: [votre-access-key]
# AWS Secret Access Key: [votre-secret-key]
# Default region: eu-west-1
# Default output format: json

# 3. Créer le bucket S3
aws s3 mb s3://med-mng-backups --region eu-west-1

# 4. Activer le versioning (protection contre suppression)
aws s3api put-bucket-versioning \
  --bucket med-mng-backups \
  --versioning-configuration Status=Enabled

# 5. Activer le chiffrement par défaut
aws s3api put-bucket-encryption \
  --bucket med-mng-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# 6. Configurer la lifecycle policy (rétention)
cat > lifecycle-policy.json <<EOF
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "database/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "DeleteOldStorageBackups",
      "Status": "Enabled",
      "Prefix": "storage/",
      "Expiration": {
        "Days": 7
      }
    },
    {
      "Id": "TransitionToGlacier",
      "Status": "Enabled",
      "Prefix": "secrets/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket med-mng-backups \
  --lifecycle-configuration file://lifecycle-policy.json
```

### Étape 2.3: Tester les Scripts de Backup

```bash
# Test 1: Backup database
./scripts/backup-database.sh

# Vérifier que le backup a été créé
ls -lh backups/database/
aws s3 ls s3://med-mng-backups/database/

# Test 2: Backup storage
./scripts/backup-storage.sh

# Vérifier les backups storage
ls -lh backups/storage/
aws s3 ls s3://med-mng-backups/storage/

# Test 3: Backup secrets
./scripts/backup-secrets.sh

# Vérifier le backup chiffré
ls -lh backups/secrets/
gpg --decrypt backups/secrets/secrets_latest.json.enc
```

### Étape 2.4: Configurer les Cron Jobs

```bash
# Éditer le crontab
crontab -e

# Ajouter les lignes suivantes:

# Backup database quotidien à 3 AM
0 3 * * * cd /path/to/med-mng && ./scripts/backup-database.sh >> /var/log/med-mng/backup-db.log 2>&1

# Backup storage quotidien à 4 AM
0 4 * * * cd /path/to/med-mng && ./scripts/backup-storage.sh >> /var/log/med-mng/backup-storage.log 2>&1

# Backup secrets mensuel (1er du mois à 5 AM)
0 5 1 * * cd /path/to/med-mng && ./scripts/backup-secrets.sh >> /var/log/med-mng/backup-secrets.log 2>&1

# Test de restauration mensuel (1er du mois à 10 AM)
0 10 1 * * cd /path/to/med-mng && ./scripts/test-restore.sh >> /var/log/med-mng/restore-test.log 2>&1

# Sauvegarder le crontab
# :wq pour quitter
```

Créer les répertoires de logs :

```bash
sudo mkdir -p /var/log/med-mng
sudo chown $USER:$USER /var/log/med-mng
```

### Étape 2.5: Configurer les Alertes Email

```bash
# Installer mailutils (pour notifications email)
sudo apt-get install mailutils

# Créer un script de notification
cat > scripts/backup-notify.sh <<'EOF'
#!/bin/bash

BACKUP_TYPE=$1
STATUS=$2
LOG_FILE=$3

if [ "$STATUS" = "success" ]; then
  SUBJECT="✅ Backup $BACKUP_TYPE réussi"
else
  SUBJECT="❌ Backup $BACKUP_TYPE échoué"
fi

BODY=$(tail -n 50 $LOG_FILE)

echo "$BODY" | mail -s "$SUBJECT" backup-alerts@med-mng.fr
EOF

chmod +x scripts/backup-notify.sh
```

Modifier les cron jobs pour inclure les notifications :

```bash
# Exemple avec notification
0 3 * * * cd /path/to/med-mng && ./scripts/backup-database.sh >> /var/log/med-mng/backup-db.log 2>&1 && ./scripts/backup-notify.sh "Database" "success" "/var/log/med-mng/backup-db.log" || ./scripts/backup-notify.sh "Database" "failure" "/var/log/med-mng/backup-db.log"
```

---

## 🎓 3. Formation Schedule

### Étape 3.1: Créer le Calendrier de Formation

**Calendrier suggéré (sur 3 mois)** :

#### Mois 1: Formation Développeurs

| Semaine | Date | Module | Durée | Participants |
|---------|------|--------|-------|--------------|
| S1 | Lun 25/11 | OWASP Top 10 (A01-A03) | 2h | Tous devs |
| S2 | Lun 02/12 | OWASP Top 10 (A04-A10) | 2h | Tous devs |
| S3 | Lun 09/12 | Secure Coding Practices | 2h | Tous devs |
| S4 | Lun 16/12 | Code Review Guidelines | 2h | Tous devs |

#### Mois 2: Formation DevOps & Management

| Semaine | Date | Module | Durée | Participants |
|---------|------|--------|-------|--------------|
| S1 | Lun 06/01 | Infrastructure Security | 2h | DevOps |
| S2 | Lun 13/01 | CI/CD Security | 2h | DevOps |
| S3 | Lun 20/01 | Backup & DR | 2h | DevOps |
| S4 | Lun 27/01 | Security Metrics | 2h | Management |

#### Mois 3: Certification & Pratique

| Semaine | Date | Module | Durée | Participants |
|---------|------|--------|-------|--------------|
| S1 | Lun 03/02 | Quiz & Exercice Pratique | 2h | Tous |
| S2 | Lun 10/02 | Code Review Pratique | 2h | Devs |
| S3 | Lun 17/02 | Incident Response Drill | 2h | Tous |
| S4 | Lun 24/02 | Certification | 1h | Tous |

### Étape 3.2: Préparer les Sessions

Créer un dossier de formation :

```bash
mkdir -p training/sessions
```

Template pour chaque session :

```markdown
# Session: [Nom du Module]

**Date**: [JJ/MM/AAAA]
**Durée**: 2 heures
**Participants**: [Liste]
**Formateur**: [Nom]

## Objectifs
- [ ] Objectif 1
- [ ] Objectif 2
- [ ] Objectif 3

## Agenda
- 00:00-00:15 : Introduction
- 00:15-00:45 : Théorie + Exemples
- 00:45-01:15 : Exercices pratiques
- 01:15-01:45 : Code review en groupe
- 01:45-02:00 : Q&A + Quiz

## Matériel
- [ ] Slides préparés
- [ ] Code examples prêts
- [ ] Exercices pratiques
- [ ] Quiz préparé

## Suivi
- [ ] Présence enregistrée
- [ ] Quiz complété (score min: 80%)
- [ ] Feedback collecté
- [ ] Certificat délivré (si applicable)
```

### Étape 3.3: Créer le Quiz en Ligne

Utiliser Google Forms ou Typeform :

```
Quiz URL: https://forms.google.com/med-mng-security-quiz
```

**Questions du quiz** (reprendre du SECURITY_TRAINING_GUIDE.md):
- 5 questions OWASP Top 10
- 5 questions Secure Coding
- 1 exercice pratique

### Étape 3.4: Créer les Certificats

Template de certificat :

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        MED-MNG SECURITY CERTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This certifies that

        [NOM DU PARTICIPANT]

has successfully completed the Med-MNG
Secure Development Training Program

Topics covered:
✓ OWASP Top 10 (2021)
✓ Secure Coding Practices
✓ Code Review Guidelines
✓ Incident Response

Quiz Score: [XX]%
Date: [JJ/MM/AAAA]
Valid until: [JJ/MM/AAAA + 1 an]

Signed: _________________
        Security Lead

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 4. Monitoring Dashboard

### Étape 4.1: Créer des Vues SQL dans Supabase

Aller dans **Supabase Dashboard → SQL Editor**

Exécuter les migrations créées :

```sql
-- 1. Migration rate limiting
\i supabase/migrations/20251119_rate_limits.sql

-- 2. Migration security events
\i supabase/migrations/20251119_security_events.sql
```

### Étape 4.2: Créer un Dashboard avec Metabase

```bash
# 1. Installer Metabase avec Docker
docker run -d -p 3000:3000 \
  --name metabase \
  -e "MB_DB_FILE=/metabase-data/metabase.db" \
  -v ~/metabase-data:/metabase-data \
  metabase/metabase

# 2. Accéder à Metabase
# http://localhost:3000

# 3. Configurer la connexion à Supabase PostgreSQL
# Database type: PostgreSQL
# Host: db.your-project.supabase.co
# Port: 5432
# Database name: postgres
# Username: postgres
# Password: [votre-db-password]
```

### Étape 4.3: Créer les Dashboards

**Dashboard 1: Security Overview** (temps réel)

Widgets :
- Total événements de sécurité (24h)
- Événements critiques (7 jours)
- Top 5 utilisateurs suspects
- Timeline des événements (par heure)

Requête :

```sql
-- Widget: Total événements 24h
SELECT COUNT(*) as total_events
FROM security_events
WHERE timestamp > NOW() - INTERVAL '24 hours';

-- Widget: Événements critiques 7j
SELECT * FROM security_events_critical;

-- Widget: Top utilisateurs suspects
SELECT * FROM security_top_suspicious_users;

-- Widget: Timeline
SELECT * FROM security_events_timeline
WHERE hour > NOW() - INTERVAL '24 hours';
```

**Dashboard 2: Rate Limiting** (surveillance API)

Widgets :
- Requêtes par endpoint (24h)
- Top utilisateurs by request count
- Rate limit violations (7 jours)
- Coût estimé par endpoint

Requête :

```sql
-- Widget: Requêtes par endpoint
SELECT
  endpoint,
  COUNT(*) as request_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(count) as avg_requests_per_user
FROM rate_limits
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint
ORDER BY request_count DESC;

-- Widget: Rate limit violations
SELECT
  user_id,
  endpoint,
  COUNT(*) as violation_count
FROM security_events
WHERE event_type = 'RATE_LIMIT_EXCEEDED'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY user_id, endpoint
ORDER BY violation_count DESC
LIMIT 10;
```

**Dashboard 3: Backup Status**

Widgets :
- Dernier backup database
- Dernier backup storage
- Dernier test de restauration
- Taille totale des backups

Créer une table pour tracker les backups :

```sql
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL,
  size_mb NUMERIC,
  duration_seconds INTEGER,
  s3_uploaded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer dans les scripts de backup:
-- psql $DATABASE_URL -c "INSERT INTO backup_logs (backup_type, status, size_mb, duration_seconds, s3_uploaded) VALUES ('database', 'success', 123, 45, true);"
```

### Étape 4.4: Configurer les Alertes Slack

Dans `apps/functions/_shared/security-monitoring.ts`, le système est déjà prêt.

Configurer le webhook Slack :

```bash
# 1. Créer un Incoming Webhook dans Slack
# https://api.slack.com/messaging/webhooks
# Channel: #security-alerts

# 2. Copier l'URL du webhook

# 3. Ajouter dans Supabase Secrets
supabase secrets set SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# 4. Tester l'alerte
curl -X POST https://your-project.supabase.co/functions/v1/test-security-alert \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Pour Microsoft Teams :

```bash
# 1. Créer un Incoming Webhook dans Teams
# Teams → Channel → Connectors → Incoming Webhook

# 2. Ajouter dans Supabase Secrets
supabase secrets set TEAMS_SECURITY_WEBHOOK=https://outlook.office.com/webhook/YOUR/WEBHOOK/URL
```

---

## ✅ 5. Validation & Testing

### Étape 5.1: Checklist de Validation

**GitHub Actions** :
- [ ] Workflow security-scan.yml existe
- [ ] SNYK_TOKEN configuré
- [ ] Workflow s'exécute sur push/PR
- [ ] Tous les jobs passent (green)
- [ ] Résultats visibles dans GitHub Security

**Backups** :
- [ ] Variables d'environnement configurées
- [ ] Bucket S3 créé avec versioning
- [ ] Script backup-database.sh testé
- [ ] Script backup-storage.sh testé
- [ ] Script backup-secrets.sh testé
- [ ] Script test-restore.sh testé
- [ ] Cron jobs configurés
- [ ] Notifications email fonctionnelles

**Monitoring** :
- [ ] Migrations SQL exécutées
- [ ] Tables security_events & rate_limits créées
- [ ] Vues SQL fonctionnelles
- [ ] Metabase/Dashboard configuré
- [ ] Alertes Slack/Teams configurées
- [ ] Alertes testées

**Formation** :
- [ ] Calendrier de formation créé
- [ ] Sessions planifiées (3 mois)
- [ ] Quiz en ligne créé
- [ ] Template de certificat préparé
- [ ] Invitations envoyées

### Étape 5.2: Tests End-to-End

**Test 1: Security Scan complet**

```bash
# Déclencher tous les scans
git commit --allow-empty -m "test: full security scan"
git push

# Vérifier GitHub Actions
# Tous les jobs doivent être verts
```

**Test 2: Backup & Restore complet**

```bash
# 1. Créer des données de test
psql $DATABASE_URL <<EOF
INSERT INTO users (email, name) VALUES ('test@example.com', 'Test User');
EOF

# 2. Faire un backup
./scripts/backup-database.sh

# 3. Supprimer les données de test
psql $DATABASE_URL <<EOF
DELETE FROM users WHERE email = 'test@example.com';
EOF

# 4. Restaurer le backup
LATEST_BACKUP=$(ls -t backups/database/backup_*.sql | head -1)
pg_restore -h $SUPABASE_DB_HOST -U postgres -d postgres $LATEST_BACKUP

# 5. Vérifier que les données sont restaurées
psql $DATABASE_URL -c "SELECT * FROM users WHERE email = 'test@example.com';"
```

**Test 3: Security Monitoring**

```bash
# 1. Tester une tentative d'accès non autorisé
curl -X POST https://your-project.supabase.co/functions/v1/admin-export \
  -H "Content-Type: application/json" \
  -d '{"type":"all"}'

# Devrait retourner 401 et logger un événement

# 2. Vérifier l'événement dans la DB
psql $DATABASE_URL -c "SELECT * FROM security_events WHERE event_type = 'UNAUTHORIZED_ACCESS' ORDER BY timestamp DESC LIMIT 1;"

# 3. Vérifier l'alerte Slack
# Vérifier le channel #security-alerts dans Slack
```

**Test 4: Rate Limiting**

```bash
# Générer 25 requêtes (limite: 20/h)
for i in {1..25}; do
  echo "Request $i"
  curl -X POST https://your-project.supabase.co/functions/v1/content-ai-generator \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"prompt":"test"}'
  sleep 1
done

# Les 20 premières devraient retourner 200
# Les 5 suivantes devraient retourner 429
```

### Étape 5.3: Documentation de Validation

Créer un rapport de validation :

```markdown
# Rapport de Validation - Mise en Œuvre Sécurité

**Date**: [JJ/MM/AAAA]
**Validé par**: [Nom]

## GitHub Actions
- [x] Workflow configuré
- [x] Secrets configurés
- [x] Tests passés
- [ ] Issues: [décrire si des problèmes]

## Backups
- [x] S3 bucket créé
- [x] Scripts testés
- [x] Cron jobs configurés
- [x] Test de restauration réussi
- [ ] Issues: [décrire si des problèmes]

## Monitoring
- [x] Dashboard créé
- [x] Alertes configurées
- [x] Tests passés
- [ ] Issues: [décrire si des problèmes]

## Formation
- [x] Calendrier créé
- [x] Sessions planifiées
- [ ] Première session donnée
- [ ] Issues: [décrire si des problèmes]

## Recommandations
- [ ] Recommandation 1
- [ ] Recommandation 2

## Signature
Validé par: ___________________
Date: ___________________
```

---

## 📞 Support

**En cas de problème** :

1. **GitHub Actions ne se déclenchent pas**
   - Vérifier `.github/workflows/security-scan.yml`
   - Vérifier les permissions du workflow
   - Vérifier les secrets GitHub

2. **Backups échouent**
   - Vérifier `.env.backup`
   - Vérifier les credentials AWS
   - Vérifier les logs: `/var/log/med-mng/`

3. **Alertes ne fonctionnent pas**
   - Vérifier les webhooks Slack/Teams
   - Vérifier les secrets Supabase
   - Tester manuellement avec curl

**Contact**:
- Email: security@med-mng.fr
- Slack: #infrastructure
- Documentation: Ce guide + SECURITY_TESTING_GUIDE.md + BACKUP_DISASTER_RECOVERY.md

---

**Dernière mise à jour**: 2025-11-19
**Version**: 1.0
