#!/bin/bash
# Script de validation automatique des pages frontend complétées
# Usage: ./scripts/validate-pages.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "🔍 Validation des Pages Frontend"
echo "=================================="
echo ""

# Fonction pour vérifier qu'un fichier existe
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 existe"
        return 0
    else
        echo -e "${RED}✗${NC} $2 manquant: $1"
        return 1
    fi
}

# Fonction pour vérifier qu'une page n'a pas de message "en développement"
check_no_dev_message() {
    if ! grep -q "en développement\|En développement" "$1"; then
        echo -e "${GREEN}✓${NC} $2 - Pas de message 'en développement'"
        return 0
    else
        echo -e "${RED}✗${NC} $2 - Contient toujours 'en développement'"
        return 1
    fi
}

# Fonction pour vérifier les imports TypeScript
check_typescript() {
    if ! grep -q "any" "$1"; then
        echo -e "${GREEN}✓${NC} $2 - Pas de type 'any' trouvé"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $2 - Contient des types 'any' (à vérifier)"
        return 0
    fi
}

echo "📄 Vérification des fichiers de pages..."
echo ""

PAGES=(
    "apps/frontend/src/pages/EventCreate.tsx:EventCreate"
    "apps/frontend/src/pages/EventsDashboard.tsx:EventsDashboard"
    "apps/frontend/src/pages/GlobalSearch.tsx:GlobalSearch"
    "apps/frontend/src/pages/SearchGlobal.tsx:SearchGlobal"
    "apps/frontend/src/pages/SearchSaved.tsx:SearchSaved"
    "apps/frontend/src/pages/TeamChallenges.tsx:TeamChallenges"
    "apps/frontend/src/pages/ReportViewer.tsx:ReportViewer"
    "apps/frontend/src/pages/LearningDashboard.tsx:LearningDashboard"
)

FAILED=0

for page in "${PAGES[@]}"; do
    IFS=':' read -r filepath pagename <<< "$page"

    echo "Vérification de $pagename..."

    if check_file "$filepath" "$pagename"; then
        check_no_dev_message "$filepath" "$pagename" || ((FAILED++))
        check_typescript "$filepath" "$pagename"
    else
        ((FAILED++))
    fi

    echo ""
done

echo "📚 Vérification de la documentation..."
echo ""

DOCS=(
    "FRONTEND_COMPLETION_SUMMARY.md:Documentation technique"
    "QUICK_START_GUIDE.md:Guide de démarrage rapide"
    "PR_TEMPLATE.md:Template PR"
    "CREATE_PR.md:Guide création PR"
)

for doc in "${DOCS[@]}"; do
    IFS=':' read -r filepath docname <<< "$doc"
    check_file "$filepath" "$docname" || ((FAILED++))
done

echo ""
echo "=================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Validation réussie!${NC}"
    echo "Toutes les pages sont complètes et prêtes."
    exit 0
else
    echo -e "${RED}✗ $FAILED erreur(s) détectée(s)${NC}"
    echo "Veuillez corriger les erreurs ci-dessus."
    exit 1
fi
