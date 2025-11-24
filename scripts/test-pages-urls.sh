#!/bin/bash
# Script pour tester l'accès aux URLs des pages complétées
# Prérequis: Le serveur dev doit être lancé (npm run dev)
# Usage: ./scripts/test-pages-urls.sh [base-url]

BASE_URL="${1:-http://localhost:5173}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=================================="
echo "🌐 Test des URLs des Pages"
echo "=================================="
echo ""
echo "Base URL: $BASE_URL"
echo ""

# Fonction pour tester une URL
test_url() {
    local url="$1"
    local name="$2"

    echo -n "Testing $name... "

    # Test avec curl (timeout 5 secondes)
    if curl -s -f -m 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# Vérifier que le serveur est accessible
echo "Vérification du serveur..."
if ! curl -s -f -m 5 "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}✗ Serveur non accessible${NC}"
    echo ""
    echo "Assurez-vous que le serveur dev est lancé:"
    echo "  npm run dev"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Serveur accessible${NC}"
echo ""

echo "Test des pages complétées..."
echo ""

FAILED=0

# Liste des URLs à tester
declare -A PAGES=(
    ["/event-create"]="EventCreate"
    ["/events"]="EventsDashboard"
    ["/global-search"]="GlobalSearch"
    ["/search-global"]="SearchGlobal"
    ["/search-saved"]="SearchSaved"
    ["/team-challenges"]="TeamChallenges"
    ["/report-viewer"]="ReportViewer (Admin)"
    ["/learning-dashboard"]="LearningDashboard"
)

for url in "${!PAGES[@]}"; do
    if ! test_url "${BASE_URL}${url}" "${PAGES[$url]}"; then
        ((FAILED++))
    fi
done

echo ""
echo "=================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Tous les tests ont réussi!${NC}"
    echo "Toutes les pages sont accessibles."
    exit 0
else
    echo -e "${RED}✗ $FAILED page(s) non accessible(s)${NC}"
    echo ""
    echo "Vérifiez:"
    echo "1. Le serveur dev est lancé (npm run dev)"
    echo "2. Les routes sont correctement configurées"
    echo "3. Pas d'erreurs dans la console"
    exit 1
fi
