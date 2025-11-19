#!/bin/bash
# ========================================
# Med-MNG Security - Commandes à Exécuter
# ========================================
# Ce fichier contient TOUTES les commandes à exécuter
# Copiez-collez les commandes une par une
# Date: $(date)

echo "======================================"
echo "MED-MNG SECURITY - COMMANDES À EXÉCUTER"
echo "======================================"
echo ""

# ============================================
# ÉTAPE 1: Créer compte Snyk (5 min)
# ============================================
echo "ÉTAPE 1: Créer compte Snyk"
echo "1. Aller sur: https://snyk.io/"
echo "2. Sign up with GitHub"
echo "3. Account Settings → API Token"
echo "4. Copier le token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
echo ""
read -p "Appuyez sur Enter quand c'est fait..."
echo ""

# Demander le token
echo "Entrez votre SNYK_TOKEN:"
read SNYK_TOKEN
echo ""

# ============================================
# ÉTAPE 2: Obtenir credentials Supabase (5 min)
# ============================================
echo "ÉTAPE 2: Obtenir credentials Supabase"
echo "1. Aller sur: https://app.supabase.com/project/YOUR_PROJECT/settings/api"
echo "2. Copier les valeurs"
echo ""
read -p "Appuyez sur Enter quand c'est fait..."
echo ""

echo "Entrez votre SUPABASE_URL (https://xxx.supabase.co):"
read SUPABASE_URL

echo "Entrez votre SUPABASE_ANON_KEY:"
read SUPABASE_ANON_KEY

echo "Entrez votre SUPABASE_SERVICE_ROLE_KEY:"
read SUPABASE_SERVICE_ROLE_KEY

# ============================================
# ÉTAPE 3: Créer tokens de test (10 min)
# ============================================
echo ""
echo "ÉTAPE 3: Créer tokens de test"
echo "Exécuter ce SQL dans Supabase SQL Editor:"
echo ""
cat << 'EOSQL'
-- User test normal
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('test@med-mng.com', crypt('test123456', gen_salt('bf')), NOW(), 'authenticated')
ON CONFLICT DO NOTHING;

-- User test admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@med-mng.com', crypt('admin123456', gen_salt('bf')), NOW(), 'authenticated')
ON CONFLICT DO NOTHING;

-- Ajouter rôle admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@med-mng.com'
ON CONFLICT DO NOTHING;
EOSQL
echo ""
echo "Ensuite:"
echo "1. Se connecter avec test@med-mng.com / test123456"
echo "2. Copier le JWT token (depuis localStorage ou Network tab)"
echo "3. Se connecter avec admin@med-mng.com / admin123456"
echo "4. Copier le JWT token"
echo ""
read -p "Appuyez sur Enter quand c'est fait..."
echo ""

echo "Entrez TEST_USER_TOKEN:"
read TEST_USER_TOKEN

echo "Entrez TEST_ADMIN_TOKEN:"
read TEST_ADMIN_TOKEN

# ============================================
# ÉTAPE 4: Configurer secrets GitHub
# ============================================
echo ""
echo "ÉTAPE 4: Configuration des secrets GitHub"
echo "Exécution des commandes..."
echo ""

# Vérifier si gh est installé
if ! command -v gh &>/dev/null; then
    echo "❌ GitHub CLI non installé!"
    echo "Installer avec: https://github.com/cli/cli#installation"
    echo ""
    echo "OU configurer manuellement sur:"
    echo "https://github.com/laeticiamng/med-mng/settings/secrets/actions"
    echo ""
    echo "Secrets à créer:"
    echo "- SNYK_TOKEN: $SNYK_TOKEN"
    echo "- SUPABASE_URL: $SUPABASE_URL"
    echo "- SUPABASE_ANON_KEY: $SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY: $SUPABASE_SERVICE_ROLE_KEY"
    echo "- TEST_USER_TOKEN: $TEST_USER_TOKEN"
    echo "- TEST_ADMIN_TOKEN: $TEST_ADMIN_TOKEN"
    exit 0
fi

# Configurer avec gh
gh secret set SNYK_TOKEN --body "$SNYK_TOKEN"
echo "✅ SNYK_TOKEN configuré"

gh secret set SUPABASE_URL --body "$SUPABASE_URL"
echo "✅ SUPABASE_URL configuré"

gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"
echo "✅ SUPABASE_ANON_KEY configuré"

gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SUPABASE_SERVICE_ROLE_KEY"
echo "✅ SUPABASE_SERVICE_ROLE_KEY configuré"

gh secret set TEST_USER_TOKEN --body "$TEST_USER_TOKEN"
echo "✅ TEST_USER_TOKEN configuré"

gh secret set TEST_ADMIN_TOKEN --body "$TEST_ADMIN_TOKEN"
echo "✅ TEST_ADMIN_TOKEN configuré"

echo ""
echo "✅ Tous les secrets GitHub sont configurés!"
echo ""

# ============================================
# ÉTAPE 5: Tester GitHub Actions
# ============================================
echo "ÉTAPE 5: Test GitHub Actions"
echo "Déclenchement du workflow..."
git commit --allow-empty -m "test: trigger security scan"
git push

echo ""
echo "✅ Workflow déclenché!"
echo "Vérifier: https://github.com/laeticiamng/med-mng/actions"
echo ""

# ============================================
# ÉTAPE 6: Exécuter le wizard de configuration
# ============================================
echo "ÉTAPE 6: Wizard de configuration"
echo "Le wizard va configurer:"
echo "- Supabase DB credentials"
echo "- AWS S3 credentials"
echo "- GPG encryption"
echo "- Alertes"
echo "- Migrations SQL"
echo "- Backups"
echo ""
read -p "Lancer le wizard maintenant? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/config-wizard.sh
fi

echo ""
echo "======================================"
echo "🎉 CONFIGURATION COMPLÈTE!"
echo "======================================"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifier le statut: ./scripts/check-security-status.sh"
echo "2. Lire le rapport: cat ACTIVATION_REPORT.md"
echo "3. Configurer cron jobs (voir ACTIVATION_REPORT.md)"
echo ""
