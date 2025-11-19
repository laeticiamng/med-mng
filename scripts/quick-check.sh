#!/bin/bash
# Vérification rapide du statut

echo "🔐 MED-MNG SECURITY - QUICK CHECK"
echo "=================================="
echo ""

# Fichiers
echo "📁 Fichiers essentiels:"
[ -f .env.backup ] && echo "✅ .env.backup" || echo "❌ .env.backup MANQUANT"
[ -f .github/workflows/security-scan.yml ] && echo "✅ GitHub Actions workflow" || echo "❌ Workflow MANQUANT"
[ -f scripts/backup-database.sh ] && echo "✅ Scripts backup" || echo "❌ Scripts MANQUANTS"
echo ""

# Prérequis
echo "🔧 Prérequis:"
command -v git &>/dev/null && echo "✅ git" || echo "❌ git"
command -v node &>/dev/null && echo "✅ node" || echo "❌ node"
command -v psql &>/dev/null && echo "✅ psql" || echo "❌ psql"
command -v aws &>/dev/null && echo "✅ aws" || echo "❌ aws"
command -v gh &>/dev/null && echo "✅ gh" || echo "❌ gh"
echo ""

# GitHub secrets
if command -v gh &>/dev/null; then
    echo "🔑 GitHub Secrets:"
    gh secret list 2>/dev/null | grep -E "SNYK|SUPABASE|TEST" || echo "⚠️  Aucun secret configuré"
    echo ""
fi

# .env.backup
if [ -f .env.backup ]; then
    echo "⚙️  Configuration (.env.backup):"
    source .env.backup 2>/dev/null
    [ -n "$SUPABASE_DB_HOST" ] && echo "✅ Supabase DB" || echo "❌ Supabase DB"
    [ -n "$AWS_ACCESS_KEY_ID" ] && echo "✅ AWS" || echo "❌ AWS"
    [ -n "$GPG_PASSPHRASE" ] && echo "✅ GPG" || echo "❌ GPG"
    echo ""
fi

# Score
echo "📊 Pour un check complet:"
echo "   ./scripts/check-security-status.sh"
echo ""
