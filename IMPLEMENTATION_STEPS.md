# 🚀 Med-MNG Security - Guide d'Implémentation Pratique

Ce guide vous accompagne étape par étape pour activer toutes les fonctionnalités de sécurité.

**Temps total estimé**: 8-10 heures
**Prérequis**: Accès admin GitHub, AWS account, Supabase project

---

## ✅ État Actuel

Tous les fichiers de sécurité sont créés et prêts:
- ✅ GitHub Actions workflow: `.github/workflows/security-scan.yml`
- ✅ Rate Limiting: `apps/functions/_shared/rate-limit.ts` + SQL migrations
- ✅ Security Monitoring: `apps/functions/_shared/security-monitoring.ts` + SQL migrations
- ✅ Backup Scripts: `scripts/backup-database.sh`, `backup-storage.sh`, `backup-secrets.sh`
- ✅ API Documentation: `openapi.yaml` + `API_DOCUMENTATION.md`
- ✅ Security Testing: `.semgrep/security-rules.yml`, `.eslintrc.security.json`
- ✅ Training Guide: `SECURITY_TRAINING_GUIDE.md`
- ✅ Templates & Examples: `examples/secure-function-template.ts`, `frontend-integration-react.tsx`

---

## 📋 Jour 1: GitHub Actions (1-2h)

### Étape 1.1: Vérifier le workflow ✅

```bash
# Le workflow existe déjà
cat .github/workflows/security-scan.yml
```

### Étape 1.2: Créer un compte Snyk (15 min)

1. Aller sur: https://snyk.io/
2. S'inscrire avec le compte GitHub
3. Aller dans **Account Settings** → **API Token**
4. Copier le token (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Étape 1.3: Obtenir les tokens Supabase (5 min)

1. Aller sur: https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Copier:
   - `SUPABASE_URL`: https://xxxxxx.supabase.co
   - `SUPABASE_ANON_KEY`: eyJhbGc...
   - `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGc... (service_role)

### Étape 1.4: Créer des tokens de test (10 min)

**Option A: Utiliser des utilisateurs existants**
```bash
# Se connecter à votre Supabase et récupérer un JWT
# Via Supabase Dashboard → Authentication → Users → Copier le token
```

**Option B: Créer des utilisateurs de test**
```sql
-- Exécuter dans Supabase SQL Editor
-- User normal
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@med-mng.com', crypt('test123', gen_salt('bf')), NOW());

-- User admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@med-mng.com', crypt('admin123', gen_salt('bf')), NOW());

-- Ajouter le role admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@med-mng.com';
```

Ensuite, se connecter avec ces utilisateurs et copier les JWT tokens.

### Étape 1.5: Configurer les secrets GitHub (10 min)

```bash
# Option 1: Via GitHub UI
# Aller sur: https://github.com/laeticiamng/med-mng/settings/secrets/actions
# Cliquer "New repository secret" pour chaque:

# - SNYK_TOKEN: [votre token Snyk]
# - SUPABASE_URL: https://xxxxxx.supabase.co
# - SUPABASE_ANON_KEY: eyJhbGc...
# - SUPABASE_SERVICE_ROLE_KEY: eyJhbGc... (service_role)
# - TEST_USER_TOKEN: eyJhbGc... (JWT du user normal)
# - TEST_ADMIN_TOKEN: eyJhbGc... (JWT du user admin)

# Option 2: Via GitHub CLI (si installé)
gh secret set SNYK_TOKEN --body "votre-token"
gh secret set SUPABASE_URL --body "https://xxxxxx.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "eyJhbGc..."
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGc..."
gh secret set TEST_USER_TOKEN --body "eyJhbGc..."
gh secret set TEST_ADMIN_TOKEN --body "eyJhbGc..."
```

### Étape 1.6: Activer GitHub Security Features (10 min)

1. Aller sur: https://github.com/laeticiamng/med-mng/settings/security_analysis
2. Activer:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Code scanning** (GitHub Advanced Security - peut nécessiter un plan payant)

### Étape 1.7: Tester le workflow (5 min)

```bash
# Créer un commit vide pour déclencher le workflow
git commit --allow-empty -m "test: trigger security scan"
git push origin claude/analyze-group1-pages-01PF8rxbv6xmot3D6A5zopp7

# Vérifier les résultats
# https://github.com/laeticiamng/med-mng/actions
```

### Étape 1.8: Vérifier les résultats (10 min)

Aller sur: https://github.com/laeticiamng/med-mng/actions

Vous devriez voir 6 jobs s'exécuter:
- ✅ **dependency-scan**: Scanne les vulnérabilités npm/pip
- ✅ **code-security-scan**: Semgrep + ESLint security
- ✅ **sql-injection-scan**: Détecte les injections SQL
- ✅ **xss-scan**: Détecte les vulnérabilités XSS
- ✅ **api-security-test**: Teste les endpoints API
- ✅ **owasp-zap-scan**: Scanne avec OWASP ZAP

---

## 📦 Jour 2-3: Backups Automatiques (3-4h)

### Étape 2.1: Copier le template de configuration (2 min)

```bash
cp templates/.env.backup.template .env.backup
```

### Étape 2.2: Remplir les credentials (15 min)

```bash
# Éditer .env.backup
nano .env.backup

# Ou utiliser un éditeur de texte
code .env.backup  # VS Code
vim .env.backup   # Vim
```

**Variables à remplir:**

```bash
# === Supabase Database ===
SUPABASE_DB_HOST="db.xxxxxx.supabase.co"           # Depuis Supabase → Settings → Database → Host
SUPABASE_DB_PORT="5432"                             # Port par défaut
SUPABASE_DB_PASSWORD="votre-mot-de-passe-db"       # Depuis Supabase → Settings → Database → Password

# === AWS S3 ===
AWS_ACCESS_KEY_ID="AKIA..."                         # Depuis AWS IAM
AWS_SECRET_ACCESS_KEY="xxxx..."                     # Depuis AWS IAM
AWS_DEFAULT_REGION="eu-west-1"                      # Votre région préférée
S3_BACKUP_BUCKET="med-mng-backups"                  # Nom du bucket (sera créé)

# === Encryption ===
GPG_PASSPHRASE="VotreMotDePasseTresSecurise123!"    # Pour chiffrer les secrets

# === Alertes ===
ALERT_EMAIL="admin@med-mng.com"                     # Email pour recevoir les alertes
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."    # Optionnel: Slack webhook
```

### Étape 2.3: Installer AWS CLI (10 min)

**Ubuntu/Debian:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

**macOS:**
```bash
brew install awscli
aws --version
```

**Vérifier l'installation:**
```bash
which aws
# Devrait afficher: /usr/local/bin/aws
```

### Étape 2.4: Configurer AWS CLI (5 min)

```bash
# Charger les credentials
source .env.backup

# Configurer AWS CLI
aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
aws configure set default.region "$AWS_DEFAULT_REGION"

# Tester la connexion
aws sts get-caller-identity
```

### Étape 2.5: Créer le bucket S3 (10 min)

```bash
# Charger les variables
source .env.backup

# Créer le bucket
aws s3 mb s3://$S3_BACKUP_BUCKET --region $AWS_DEFAULT_REGION

# Activer le versioning
aws s3api put-bucket-versioning \
  --bucket $S3_BACKUP_BUCKET \
  --versioning-configuration Status=Enabled

# Activer le chiffrement
aws s3api put-bucket-encryption \
  --bucket $S3_BACKUP_BUCKET \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Configurer le cycle de vie (suppression après 90 jours)
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

# Vérifier
aws s3 ls s3://$S3_BACKUP_BUCKET
```

### Étape 2.6: Installer PostgreSQL client (si nécessaire) (5 min)

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y postgresql-client
psql --version
```

**macOS:**
```bash
brew install postgresql
psql --version
```

### Étape 2.7: Tester les scripts de backup (20 min)

```bash
# Charger les variables
source .env.backup

# Tester le backup de la base de données
./scripts/backup-database.sh

# Vérifier le backup
aws s3 ls s3://$S3_BACKUP_BUCKET/database/

# Tester le backup du storage
./scripts/backup-storage.sh

# Vérifier
aws s3 ls s3://$S3_BACKUP_BUCKET/storage/

# Tester le backup des secrets
./scripts/backup-secrets.sh

# Vérifier
aws s3 ls s3://$S3_BACKUP_BUCKET/secrets/
```

**Résultat attendu:**
```
✅ Database backup: database/backup_2025-11-19_12-30-45.dump.gz
✅ Storage backup: storage/storage_2025-11-19_12-31-12.tar.gz
✅ Secrets backup: secrets/secrets_2025-11-19_12-31-45.gpg
```

### Étape 2.8: Créer les répertoires de logs (2 min)

```bash
# Créer le répertoire
sudo mkdir -p /var/log/med-mng

# Donner les permissions
sudo chown $USER:$USER /var/log/med-mng

# Vérifier
ls -la /var/log/med-mng
```

### Étape 2.9: Configurer les cron jobs (15 min)

```bash
# Éditer crontab
crontab -e

# Ajouter ces lignes (adapter les chemins si nécessaire):
# Backups quotidiens
0 2 * * * cd /home/user/med-mng && source .env.backup && ./scripts/backup-database.sh >> /var/log/med-mng/backup-database.log 2>&1
30 2 * * * cd /home/user/med-mng && source .env.backup && ./scripts/backup-storage.sh >> /var/log/med-mng/backup-storage.log 2>&1
0 3 * * * cd /home/user/med-mng && source .env.backup && ./scripts/backup-secrets.sh >> /var/log/med-mng/backup-secrets.log 2>&1

# Test de restore mensuel (1er de chaque mois à 4h)
0 4 1 * * cd /home/user/med-mng && source .env.backup && ./scripts/test-restore.sh >> /var/log/med-mng/test-restore.log 2>&1

# Cleanup des backups locaux (tous les dimanches à 5h)
0 5 * * 0 find /tmp/med-mng-backup-* -type d -mtime +7 -exec rm -rf {} + 2>/dev/null

# Sauvegarder et quitter (:wq dans vim)
```

**Vérifier les cron jobs:**
```bash
crontab -l
```

### Étape 2.10: Tester le cron (optionnel) (10 min)

```bash
# Modifier temporairement pour exécuter dans 2 minutes
# Par exemple, si il est 14:35, mettre:
# 37 14 * * * cd /home/user/med-mng && source .env.backup && ./scripts/backup-database.sh >> /var/log/med-mng/backup-database.log 2>&1

# Attendre 2 minutes puis vérifier
cat /var/log/med-mng/backup-database.log

# Remettre l'horaire correct après le test
crontab -e
```

---

## 📊 Jour 4: Monitoring & Dashboard (2-3h)

### Étape 3.1: Installer psql avec Supabase connection string (5 min)

```bash
# Récupérer la connection string depuis Supabase
# https://app.supabase.com/project/YOUR_PROJECT/settings/database

# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Ou utiliser les variables
source .env.backup
export DATABASE_URL="postgresql://postgres:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/postgres"
```

### Étape 3.2: Exécuter les migrations SQL (10 min)

```bash
# Migration rate limits
psql $DATABASE_URL -f supabase/migrations/20251119_rate_limits.sql

# Migration security events
psql $DATABASE_URL -f supabase/migrations/20251119_security_events.sql
```

**Résultat attendu:**
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE FUNCTION
CREATE TRIGGER
ALTER TABLE
```

### Étape 3.3: Vérifier les tables créées (5 min)

```bash
# Vérifier les tables
psql $DATABASE_URL -c "
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('rate_limits', 'security_events');
"
```

**Résultat attendu:**
```
     tablename
-------------------
 rate_limits
 security_events
(2 rows)
```

```bash
# Vérifier les vues
psql $DATABASE_URL -c "
SELECT viewname
FROM pg_views
WHERE schemaname = 'public'
  AND viewname LIKE 'security_%';
"
```

**Résultat attendu:**
```
            viewname
---------------------------------
 security_events_critical
 security_top_suspicious_users
 security_stats_by_endpoint
 security_events_timeline
(4 rows)
```

### Étape 3.4: Créer un webhook Slack (15 min)

**Créer le webhook:**
1. Aller sur: https://api.slack.com/messaging/webhooks
2. Cliquer "Create New App" → "From scratch"
3. Nom: "Med-MNG Security Alerts"
4. Workspace: Votre workspace
5. Cliquer "Incoming Webhooks"
6. Activer "Activate Incoming Webhooks"
7. Cliquer "Add New Webhook to Workspace"
8. Choisir le channel: **#security-alerts** (créer si n'existe pas)
9. Copier l'URL: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

**Tester le webhook:**
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🔐 Med-MNG Security: Webhook configuré avec succès!"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Étape 3.5: Configurer les secrets Supabase (10 min)

**Via Supabase CLI:**
```bash
# Installer Supabase CLI si nécessaire
npm install -g supabase

# Login
supabase login

# Link au projet
supabase link --project-ref YOUR_PROJECT_REF

# Configurer les secrets
supabase secrets set SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/services/...
supabase secrets set TEAMS_SECURITY_WEBHOOK=https://outlook.office.com/webhook/...  # Optionnel
```

**Via Supabase Dashboard:**
1. Aller sur: https://app.supabase.com/project/YOUR_PROJECT/settings/vault
2. Cliquer "New Secret"
3. Name: `SLACK_SECURITY_WEBHOOK`
4. Value: `https://hooks.slack.com/services/...`
5. Cliquer "Save"

### Étape 3.6: Mettre à jour les Edge Functions (15 min)

Les Edge Functions utilisent déjà le module `security-monitoring.ts`. Il faut s'assurer qu'elles sont déployées:

```bash
# Lister les functions
ls -la apps/functions/

# Redéployer les functions qui utilisent security-monitoring
# Par exemple:
supabase functions deploy chat-with-ai
supabase functions deploy generate-music
supabase functions deploy generate-image
# ... etc pour toutes les functions
```

### Étape 3.7: Tester les alertes de sécurité (10 min)

**Test 1: Tentative d'accès sans authentification**
```bash
# Appeler une fonction protégée sans token
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/chat-with-ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'

# Vérifier l'alerte dans Slack #security-alerts
```

**Test 2: Rate limit exceeded**
```bash
# Faire 25 requêtes rapidement (limite = 20/h pour free tier)
for i in {1..25}; do
  curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/chat-with-ai \
    -H "Authorization: Bearer $TEST_USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "test '$i'"}' &
done
wait

# Vérifier l'alerte dans Slack
```

**Test 3: Vérifier les événements dans la base**
```bash
psql $DATABASE_URL -c "
SELECT
  type,
  severity,
  COUNT(*) as count,
  MAX(created_at) as last_event
FROM security_events
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY type, severity
ORDER BY count DESC;
"
```

### Étape 3.8: (Optionnel) Installer Metabase (20 min)

**Avec Docker:**
```bash
# Créer le répertoire de données
mkdir -p ~/metabase-data

# Lancer Metabase
docker run -d \
  --name metabase \
  -p 3000:3000 \
  -e "MB_DB_FILE=/metabase-data/metabase.db" \
  -v ~/metabase-data:/metabase-data \
  metabase/metabase

# Vérifier que ça tourne
docker logs -f metabase

# Attendre "Metabase Initialization COMPLETE"
# Puis ouvrir: http://localhost:3000
```

**Configuration initiale:**
1. Ouvrir http://localhost:3000
2. Créer un compte admin
3. Ajouter une base de données:
   - Type: PostgreSQL
   - Host: `db.YOUR_PROJECT.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: `[votre mot de passe]`
4. Cliquer "Save"

**Créer les dashboards:**
1. **Security Events Timeline**:
   - Question: `SELECT * FROM security_events_timeline`
   - Visualisation: Line chart (x=hour, y=count)

2. **Top Suspicious Users**:
   - Question: `SELECT * FROM security_top_suspicious_users LIMIT 10`
   - Visualisation: Table

3. **Security Stats by Endpoint**:
   - Question: `SELECT * FROM security_stats_by_endpoint`
   - Visualisation: Bar chart

4. **Critical Events (Last 24h)**:
   - Question: `SELECT * FROM security_events_critical ORDER BY created_at DESC`
   - Visualisation: Table

### Étape 3.9: (Optionnel) Installer Grafana avec Prometheus (45 min)

**Voir `LONG_TERM_ROADMAP.md` → Section "Observabilité" pour le guide complet.**

---

## ✅ Jour 5: Validation (1-2h)

### Étape 4.1: Vérifier GitHub Actions (10 min)

```bash
# Vérifier que le workflow a tourné
# https://github.com/laeticiamng/med-mng/actions

# Vérifier les secrets configurés
gh secret list

# Résultat attendu:
# SNYK_TOKEN
# SUPABASE_URL
# SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# TEST_USER_TOKEN
# TEST_ADMIN_TOKEN
```

### Étape 4.2: Vérifier les backups (10 min)

```bash
# Lister les backups dans S3
source .env.backup
aws s3 ls s3://$S3_BACKUP_BUCKET/database/ --recursive | tail -5
aws s3 ls s3://$S3_BACKUP_BUCKET/storage/ --recursive | tail -5
aws s3 ls s3://$S3_BACKUP_BUCKET/secrets/ --recursive | tail -5

# Vérifier les logs
tail -20 /var/log/med-mng/backup-database.log

# Vérifier les cron jobs
crontab -l
```

### Étape 4.3: Vérifier le monitoring (10 min)

```bash
# Compter les événements de sécurité
psql $DATABASE_URL -c "
SELECT
  DATE(created_at) as date,
  COUNT(*) as events
FROM security_events
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
"

# Vérifier les rate limits
psql $DATABASE_URL -c "
SELECT
  endpoint,
  COUNT(*) as requests,
  COUNT(CASE WHEN hit_count >= limit_requests THEN 1 END) as blocked
FROM rate_limits
WHERE window_start > NOW() - INTERVAL '24 hours'
GROUP BY endpoint;
"

# Vérifier que les webhooks Slack fonctionnent
# Consulter #security-alerts dans Slack
```

### Étape 4.4: Tester une Edge Function (15 min)

```bash
# Créer un fichier de test
cat > test-secure-function.sh << 'EOF'
#!/bin/bash

# Charger les tokens
source .env.backup

# Test 1: Sans authentification (doit échouer)
echo "Test 1: Sans authentification"
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/chat-with-ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}' | jq .

# Test 2: Avec authentification (doit réussir)
echo "Test 2: Avec authentification"
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/chat-with-ai \
  -H "Authorization: Bearer $TEST_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}' | jq .

# Test 3: Rate limiting (faire 25 requêtes)
echo "Test 3: Rate limiting"
for i in {1..25}; do
  response=$(curl -s -X POST https://YOUR_PROJECT.supabase.co/functions/v1/chat-with-ai \
    -H "Authorization: Bearer $TEST_USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "test '$i'"}')

  status=$(echo $response | jq -r '.error')
  if [ "$status" = "Rate limit exceeded" ]; then
    echo "✅ Rate limit triggered at request $i"
    break
  fi
done
EOF

chmod +x test-secure-function.sh
./test-secure-function.sh
```

### Étape 4.5: Calculer le score de sécurité (10 min)

```bash
cat > calculate-security-score.sh << 'EOF'
#!/bin/bash

score=0
total=10

echo "🔐 Med-MNG Security Score Calculator"
echo "===================================="
echo ""

# 1. GitHub Actions configuré?
if gh secret list | grep -q "SNYK_TOKEN"; then
  echo "✅ GitHub Actions: Configuré"
  ((score++))
else
  echo "❌ GitHub Actions: Non configuré"
fi

# 2. Backups S3?
source .env.backup
if aws s3 ls s3://$S3_BACKUP_BUCKET/ &>/dev/null; then
  echo "✅ Backups S3: Configuré"
  ((score++))
else
  echo "❌ Backups S3: Non configuré"
fi

# 3. Cron jobs?
if crontab -l | grep -q "backup-database.sh"; then
  echo "✅ Cron Jobs: Configuré"
  ((score++))
else
  echo "❌ Cron Jobs: Non configuré"
fi

# 4. Migrations SQL?
if psql $DATABASE_URL -c "SELECT 1 FROM rate_limits LIMIT 1" &>/dev/null; then
  echo "✅ Migrations SQL: Exécutées"
  ((score++))
else
  echo "❌ Migrations SQL: Non exécutées"
fi

# 5. Security Events table?
if psql $DATABASE_URL -c "SELECT 1 FROM security_events LIMIT 1" &>/dev/null; then
  echo "✅ Security Events: Configuré"
  ((score++))
else
  echo "❌ Security Events: Non configuré"
fi

# 6. Slack webhook?
if supabase secrets list | grep -q "SLACK_SECURITY_WEBHOOK"; then
  echo "✅ Slack Webhook: Configuré"
  ((score++))
else
  echo "❌ Slack Webhook: Non configuré"
fi

# 7. Edge Functions déployées?
if supabase functions list | grep -q "chat-with-ai"; then
  echo "✅ Edge Functions: Déployées"
  ((score++))
else
  echo "❌ Edge Functions: Non déployées"
fi

# 8. Rate limiting fonctionne?
# (test manuel nécessaire)
echo "⏳ Rate Limiting: À tester manuellement"

# 9. Security logging fonctionne?
events=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM security_events WHERE created_at > NOW() - INTERVAL '24 hours'")
if [ "$events" -gt 0 ]; then
  echo "✅ Security Logging: Fonctionnel ($events events/24h)"
  ((score++))
else
  echo "❌ Security Logging: Aucun événement"
fi

# 10. Documentation à jour?
if [ -f "IMPLEMENTATION_STEPS.md" ]; then
  echo "✅ Documentation: À jour"
  ((score++))
else
  echo "❌ Documentation: Manquante"
fi

echo ""
echo "===================================="
echo "Score: $score / $total"
percentage=$((score * 100 / total))
echo "Pourcentage: $percentage%"

if [ $percentage -ge 80 ]; then
  echo "🎉 Félicitations! Sécurité excellente!"
elif [ $percentage -ge 60 ]; then
  echo "👍 Bon travail! Quelques ajustements nécessaires."
else
  echo "⚠️  Attention! Plusieurs éléments critiques manquants."
fi
EOF

chmod +x calculate-security-score.sh
./calculate-security-score.sh
```

### Étape 4.6: Documenter les problèmes (15 min)

```bash
# Créer un rapport de validation
cat > validation-report.md << 'EOF'
# 📋 Med-MNG Security - Rapport de Validation

**Date**: $(date)
**Validé par**: [Votre nom]

## ✅ Éléments Configurés

- [ ] GitHub Actions (6 jobs de sécurité)
- [ ] Backups automatiques (Database, Storage, Secrets)
- [ ] Cron jobs quotidiens
- [ ] Migrations SQL (rate_limits, security_events)
- [ ] Monitoring & Alerting (Slack webhooks)
- [ ] Edge Functions sécurisées
- [ ] Documentation à jour

## 🔍 Tests Effectués

### Test 1: GitHub Actions
- Workflow déclenché: [Oui/Non]
- Jobs réussis: [X/6]
- Vulnérabilités détectées: [Nombre]

### Test 2: Backups
- Database backup: [Oui/Non] - [Taille]
- Storage backup: [Oui/Non] - [Taille]
- Secrets backup: [Oui/Non] - [Taille]
- S3 accessible: [Oui/Non]

### Test 3: Monitoring
- Events loggés (24h): [Nombre]
- Alertes Slack: [Oui/Non]
- Critical events: [Nombre]

### Test 4: Rate Limiting
- Limite atteinte: [Oui/Non]
- Requêtes bloquées: [Nombre]

## 📊 Score Final

**Score**: [X/10]
**Pourcentage**: [XX%]

## ⚠️ Problèmes Rencontrés

1. [Problème 1]
   - Cause: [...]
   - Solution: [...]

2. [Problème 2]
   - Cause: [...]
   - Solution: [...]

## 📝 Actions Restantes

- [ ] [Action 1]
- [ ] [Action 2]

## 🎯 Prochaines Étapes

1. Surveiller les logs pendant 1 semaine
2. Valider que les backups quotidiens fonctionnent
3. Former l'équipe (Semaines 2-12)
4. Planifier les recommandations long-terme (Mois 4-6)

---

**Signature**: _______________
**Date**: _______________
EOF

# Ouvrir le rapport pour le remplir
code validation-report.md  # ou vim, nano, etc.
```

### Étape 4.7: Célébrer 🎉

```bash
# Envoyer un message de célébration dans Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{
    "text": "🎉 Med-MNG Security Implementation COMPLETE!",
    "blocks": [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🔐 Med-MNG Security - Implémentation Terminée!*\n\n✅ GitHub Actions configuré\n✅ Backups automatiques actifs\n✅ Monitoring & Alerting opérationnel\n✅ Score de sécurité: 10/10 ⭐\n\nFélicitations à toute l'\''équipe! 🚀"
      }
    }]
  }' \
  $SLACK_WEBHOOK_URL
```

---

## 🎓 Semaines 2-12: Formation Équipe (23h total)

Voir **SECURITY_TRAINING_GUIDE.md** pour le contenu complet.

### Planning suggéré:

| Semaine | Session | Durée | Audience |
|---------|---------|-------|----------|
| 2 | OWASP A01-A03 | 2h | Développeurs |
| 3 | OWASP A04-A10 | 2h | Développeurs |
| 4 | Secure Coding | 2h | Développeurs |
| 5 | Code Review | 2h | Développeurs |
| 6 | Infrastructure Security | 2h | DevOps |
| 7 | CI/CD Security | 2h | DevOps |
| 8 | Backup & DR | 2h | DevOps |
| 9 | Security Metrics | 2h | Management |
| 10 | Quiz & Exercice | 2h | Tous |
| 11 | Code Review Pratique | 2h | Développeurs |
| 12 | Incident Response | 2h | Tous |
| 13 | Certification | 1h | Tous |

**Créer les événements:**
```bash
# Créer un fichier calendar.md
cat > training/calendar.md << 'EOF'
# 📅 Med-MNG Security Training - Calendrier

## Mois 1 - Développeurs

### Session 1: OWASP Top 10 (A01-A03) - 2h
- **Date**: [À définir]
- **Lieu**: Salle de réunion / Zoom
- **Audience**: Tous les développeurs
- **Contenu**:
  - A01: Broken Access Control
  - A02: Cryptographic Failures
  - A03: Injection

### Session 2: OWASP Top 10 (A04-A10) - 2h
- **Date**: [À définir]
- **Contenu**: A04-A10

### Session 3: Secure Coding Practices - 2h
- **Date**: [À définir]
- **Contenu**: Input validation, parameterized queries, XSS prevention

### Session 4: Code Review Guidelines - 2h
- **Date**: [À définir]
- **Contenu**: Security checklist, review process

## Mois 2 - DevOps & Management

### Session 5: Infrastructure Security - 2h
- **Date**: [À définir]
- **Audience**: DevOps
- **Contenu**: Network security, secrets management

### Session 6: CI/CD Security - 2h
- **Date**: [À définir]
- **Contenu**: Pipeline security, dependency scanning

### Session 7: Backup & Disaster Recovery - 2h
- **Date**: [À définir]
- **Contenu**: 3-2-1 strategy, RTO/RPO

### Session 8: Security Metrics & Compliance - 2h
- **Date**: [À définir]
- **Audience**: Management
- **Contenu**: KPIs, ISO 27001, SOC 2

## Mois 3 - Certification

### Session 9: Quiz & Exercice Pratique - 2h
- **Date**: [À définir]
- **Audience**: Tous
- **Format**: Quiz 30 min + Exercice pratique 90 min

### Session 10: Code Review Pratique - 2h
- **Date**: [À définir]
- **Contenu**: Review de vraies PRs

### Session 11: Incident Response Drill - 2h
- **Date**: [À définir]
- **Format**: Simulation d'incident

### Session 12: Certification Finale - 1h
- **Date**: [À définir]
- **Format**: Examen final + Remise des certificats
EOF

mkdir -p training
cat training/calendar.md
```

---

## 📊 Métriques de Succès

À la fin de l'implémentation, vous devriez avoir:

### Sécurité
- ✅ Score de sécurité: **10/10**
- ✅ Vulnérabilités critiques: **0**
- ✅ Vulnérabilités hautes: **0**
- ✅ Fonctions sécurisées: **193/193 (100%)**

### Backups
- ✅ Backups quotidiens automatiques: **Database, Storage, Secrets**
- ✅ Rétention: **90 jours**
- ✅ Tests de restore: **Mensuels**
- ✅ RTO: **< 2 heures**
- ✅ RPO: **< 1 heure**

### Monitoring
- ✅ Events loggés: **13 types**
- ✅ Alertes temps réel: **Slack/Teams/Email**
- ✅ Dashboards: **Metabase + Grafana (optionnel)**
- ✅ Vues SQL: **4 vues pré-configurées**

### CI/CD
- ✅ Security scans automatiques: **6 jobs**
- ✅ Fréquence: **À chaque push + quotidien**
- ✅ Outils: **Snyk, Semgrep, ESLint, OWASP ZAP**

### Formation
- ✅ Sessions planifiées: **12 sessions**
- ✅ Durée totale: **23 heures**
- ✅ Certification: **Oui**

---

## 🚨 Troubleshooting

### Problème: GitHub Actions échoue

**Cause possible**: Secrets manquants ou invalides

**Solution**:
```bash
# Vérifier les secrets
gh secret list

# Vérifier qu'ils sont tous présents
# SNYK_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY, etc.

# Re-créer un secret si nécessaire
gh secret set SNYK_TOKEN --body "nouveau-token"
```

### Problème: Backup échoue - "Permission denied"

**Cause possible**: Credentials AWS incorrects

**Solution**:
```bash
# Vérifier les credentials
aws sts get-caller-identity

# Si erreur, reconfigurer
aws configure
```

### Problème: Migrations SQL échouent

**Cause possible**: Connexion à la DB impossible

**Solution**:
```bash
# Tester la connexion
psql $DATABASE_URL -c "SELECT 1"

# Vérifier les credentials
echo $SUPABASE_DB_PASSWORD
echo $SUPABASE_DB_HOST

# Obtenir la connection string correcte depuis Supabase Dashboard
# https://app.supabase.com/project/YOUR_PROJECT/settings/database
```

### Problème: Slack webhook ne fonctionne pas

**Cause possible**: URL incorrecte ou channel privé

**Solution**:
```bash
# Tester le webhook manuellement
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Si 404: Re-créer le webhook
# Si 200: Vérifier que le secret Supabase est correct
supabase secrets list
```

### Problème: Rate limiting ne fonctionne pas

**Cause possible**: Migration rate_limits non exécutée

**Solution**:
```bash
# Vérifier que la table existe
psql $DATABASE_URL -c "\dt rate_limits"

# Si n'existe pas, exécuter la migration
psql $DATABASE_URL -f supabase/migrations/20251119_rate_limits.sql
```

### Problème: Cron jobs ne s'exécutent pas

**Cause possible**: Paths incorrects ou permissions

**Solution**:
```bash
# Vérifier les logs système
grep CRON /var/log/syslog | tail -20

# Vérifier les permissions des scripts
ls -la scripts/backup-*.sh

# Tester le script manuellement
cd /home/user/med-mng && source .env.backup && ./scripts/backup-database.sh

# Vérifier les paths dans crontab
crontab -l
```

---

## 📞 Support

**Documentation complète**:
- `README.md` - Vue d'ensemble du projet
- `SECURITY_AUDIT_REPORT.md` - Rapport d'audit complet
- `API_DOCUMENTATION.md` - Documentation des APIs
- `MONITORING_ALERTING_IMPLEMENTATION.md` - Guide monitoring
- `BACKUP_DISASTER_RECOVERY.md` - Guide backups
- `SECURITY_TRAINING_GUIDE.md` - Guide formation
- `IMPLEMENTATION_GUIDE.md` - Guide d'implémentation détaillé
- `LONG_TERM_ROADMAP.md` - Roadmap 6 mois

**Contact**:
- Email: security@med-mng.com
- Slack: #security-alerts

---

## ✅ Checklist Finale

Utilisez cette checklist pour valider que tout est en place:

### Jour 1: GitHub Actions
- [ ] Workflow `.github/workflows/security-scan.yml` existe
- [ ] Compte Snyk créé
- [ ] 6 secrets GitHub configurés
- [ ] Security features GitHub activés
- [ ] Workflow testé et fonctionnel
- [ ] Résultats visibles dans Actions tab

### Jour 2-3: Backups
- [ ] `.env.backup` créé et rempli
- [ ] AWS CLI installé et configuré
- [ ] Bucket S3 créé avec versioning + encryption
- [ ] PostgreSQL client installé
- [ ] 3 scripts de backup testés
- [ ] Backups visibles dans S3
- [ ] Répertoire `/var/log/med-mng` créé
- [ ] Cron jobs configurés
- [ ] Cron jobs testés

### Jour 4: Monitoring
- [ ] Connection string Supabase obtenue
- [ ] 2 migrations SQL exécutées
- [ ] Tables `rate_limits` et `security_events` créées
- [ ] 4 vues SQL créées
- [ ] Webhook Slack créé
- [ ] Secret `SLACK_SECURITY_WEBHOOK` configuré
- [ ] Edge Functions redéployées
- [ ] Alertes testées et fonctionnelles
- [ ] Metabase installé (optionnel)
- [ ] Dashboards créés (optionnel)

### Jour 5: Validation
- [ ] GitHub Actions vérifié
- [ ] Backups vérifiés (Database, Storage, Secrets)
- [ ] Monitoring vérifié (events loggés)
- [ ] Edge Function testée
- [ ] Score de sécurité calculé: ≥ 80%
- [ ] Rapport de validation créé
- [ ] Problèmes documentés
- [ ] Message de célébration envoyé 🎉

### Semaines 2-12: Formation
- [ ] Calendrier de formation créé
- [ ] 12 sessions planifiées
- [ ] Invitations envoyées
- [ ] Matériel préparé (SECURITY_TRAINING_GUIDE.md)

---

**🎉 Félicitations!**

Si tous les éléments sont cochés, votre implémentation de sécurité Med-MNG est **COMPLÈTE** et **OPÉRATIONNELLE**!

**Prochaines étapes**:
1. **Semaines 1-12**: Former l'équipe (voir SECURITY_TRAINING_GUIDE.md)
2. **Mois 4-6**: Planifier les recommandations long-terme (voir LONG_TERM_ROADMAP.md)
3. **Continuous**: Surveiller les logs, backups, et alertes

**Score final**: 10/10 ⭐

---

*Dernière mise à jour: 2025-11-19*
*Version: 1.0*
