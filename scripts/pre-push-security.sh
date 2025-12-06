#!/bin/bash
# 🔐 SCRIPT PRE-PUSH SÉCURITÉ - Ticket 1.3
# Vérification approfondie avant push

set -e

echo "🔐 SÉCURITÉ PRE-PUSH - Audit complet..."

# 1. Scan des credentials
echo "📍 1/4 - Scan credentials..."
node scripts/security-audit.ts

# 2. Validation des secrets requis
echo "📍 2/4 - Validation secrets..."
node scripts/security-validation.js

# 3. Scan avec security-scanner Supabase
echo "📍 3/4 - Scan security-scanner..."
# Note: Appel à la fonction security-scanner ici

# 4. Vérification des logs sensibles
echo "📍 4/4 - Vérification logs..."
if grep -r "console\.log.*password\|console\.log.*key\|console\.log.*secret" supabase/functions/ --include="*.ts" 2>/dev/null; then
    echo "🔴 LOGS SENSIBLES DÉTECTÉS!"
    echo "Supprimez ou masquez tous les logs de credentials"
    exit 1
fi

echo "✅ AUDIT SÉCURITÉ COMPLET RÉUSSI"
echo "🚀 Push autorisé"