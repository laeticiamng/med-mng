#!/bin/bash

# Script de détection automatique des credentials dans le code
# Usage: ./scripts/detect-secrets.sh

echo "🔍 AUDIT SÉCURITÉ - Détection des credentials sensibles"
echo "=================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

echo -e "\n${YELLOW}1. Recherche de fallbacks dangereux dans Deno.env.get...${NC}"
FALLBACK_PATTERNS=(
    "Deno\.env\.get.*\|\|.*['\"][^'\"]*['\"]"
    "process\.env\..*\|\|.*['\"][^'\"]*['\"]"
)

for pattern in "${FALLBACK_PATTERNS[@]}"; do
    results=$(grep -r -n -E "$pattern" supabase/functions/ src/ 2>/dev/null || true)
    if [ ! -z "$results" ]; then
        echo -e "${RED}❌ CRITIQUE: Fallback credentials détectés:${NC}"
        echo "$results"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

echo -e "\n${YELLOW}2. Recherche de credentials en dur...${NC}"
HARDCODED_PATTERNS=(
    "password.*=.*['\"][a-zA-Z0-9]+"
    "secret.*=.*['\"][a-zA-Z0-9]+"
    "key.*=.*['\"][a-zA-Z0-9]{10,}"
    "token.*=.*['\"][a-zA-Z0-9]+"
    "api_key.*=.*['\"][a-zA-Z0-9]+"
    "apiKey.*=.*['\"][a-zA-Z0-9]+"
)

for pattern in "${HARDCODED_PATTERNS[@]}"; do
    results=$(grep -r -i -n -E "$pattern" supabase/functions/ src/ 2>/dev/null || true)
    if [ ! -z "$results" ]; then
        echo -e "${RED}❌ CRITIQUE: Credentials en dur détectés:${NC}"
        echo "$results"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

echo -e "\n${YELLOW}3. Recherche de logs sensibles...${NC}"
LOG_PATTERNS=(
    "console\.log.*password"
    "console\.log.*secret"
    "console\.log.*key.*:"
    "console\.log.*token"
    "console\.error.*password"
    "console\.error.*secret"
    "console\.error.*key.*:"
    "console\.error.*token"
)

for pattern in "${LOG_PATTERNS[@]}"; do
    results=$(grep -r -i -n -E "$pattern" supabase/functions/ src/ 2>/dev/null || true)
    if [ ! -z "$results" ]; then
        echo -e "${RED}❌ RISQUE: Logs sensibles détectés:${NC}"
        echo "$results"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

echo -e "\n${YELLOW}4. Recherche de patterns Supabase non sécurisés...${NC}"
SUPABASE_PATTERNS=(
    "supabaseUrl.*=.*['\"]http"
    "supabaseKey.*=.*['\"][a-zA-Z0-9]+"
    "SUPABASE_.*=.*['\"][a-zA-Z0-9]+"
)

for pattern in "${SUPABASE_PATTERNS[@]}"; do
    results=$(grep -r -i -n -E "$pattern" supabase/functions/ src/ 2>/dev/null || true)
    if [ ! -z "$results" ]; then
        echo -e "${YELLOW}⚠️ ATTENTION: Configuration Supabase détectée:${NC}"
        echo "$results"
        echo -e "${YELLOW}Vérifiez que ce sont bien des clés publiques.${NC}"
    fi
done

echo -e "\n${YELLOW}5. Vérification des variables d'environnement requises...${NC}"
REQUIRED_SECRETS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    usage=$(grep -r -n "$secret" supabase/functions/ 2>/dev/null || true)
    if [ ! -z "$usage" ]; then
        echo -e "${GREEN}✅ Variable $secret utilisée correctement${NC}"
    else
        echo -e "${YELLOW}⚠️ Variable $secret non trouvée dans les edge functions${NC}"
    fi
done

echo -e "\n${YELLOW}6. Audit de l'historique Git (derniers 10 commits)...${NC}"
git log --oneline -10 --grep="password\|secret\|key\|token" --all 2>/dev/null || echo "Aucun commit suspect récent"

echo -e "\n=================================================="
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ AUDIT SÉCURITÉ RÉUSSI - Aucun problème critique détecté${NC}"
    exit 0
else
    echo -e "${RED}❌ AUDIT SÉCURITÉ ÉCHOUÉ - $ISSUES_FOUND problème(s) détecté(s)${NC}"
    echo -e "${YELLOW}Action requise: Corrigez les problèmes avant de déployer${NC}"
    exit 1
fi