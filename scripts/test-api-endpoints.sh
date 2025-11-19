#!/bin/bash

# Script de test rapide des endpoints MED-MNG API
# Point 3 du ticket global: QA Backend
# Usage: ./scripts/test-api-endpoints.sh [user_token]

set -e

# Configuration
API_BASE="https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/med-mng-api"
USER_TOKEN="${1:-$TEST_USER_TOKEN}"
RESULTS_FILE="api-test-results-$(date +%Y%m%d-%H%M%S).json"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Tests des endpoints MED-MNG API${NC}"
echo "======================================"

# Initialiser le fichier de résultats
echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","tests":[' > "$RESULTS_FILE"

# Fonction helper pour tester un endpoint
test_endpoint() {
    local method="$1"
    local path="$2"
    local description="$3"
    local auth="$4"
    local body="$5"
    local expected_status="$6"
    
    echo -n "Testing: $description... "
    
    local headers="Content-Type: application/json"
    if [ "$auth" = "true" ] && [ -n "$USER_TOKEN" ]; then
        headers="$headers, Authorization: Bearer $USER_TOKEN"
    fi
    
    local start_time=$(date +%s%3N)
    
    if [ -n "$body" ]; then
        response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
            -X "$method" \
            -H "$headers" \
            -d "$body" \
            "$API_BASE$path" 2>/dev/null || echo -e "\nERROR\n0")
    else
        response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
            -X "$method" \
            -H "$headers" \
            "$API_BASE$path" 2>/dev/null || echo -e "\nERROR\n0")
    fi
    
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    # Parser la réponse
    local body_response=$(echo "$response" | head -n -2)
    local status_code=$(echo "$response" | tail -n 2 | head -n 1)
    local time_total=$(echo "$response" | tail -n 1)
    
    # Vérifier le statut
    local test_result="PASS"
    local color="$GREEN"
    
    if [ "$status_code" = "ERROR" ]; then
        test_result="ERROR"
        color="$RED"
    elif [ -n "$expected_status" ] && [ "$status_code" != "$expected_status" ]; then
        test_result="FAIL"
        color="$RED"
    elif [ "$status_code" -ge 500 ]; then
        test_result="ERROR"
        color="$RED"
    elif [ "$status_code" -ge 400 ]; then
        test_result="WARN"
        color="$YELLOW"
    fi
    
    echo -e "${color}$test_result${NC} (${status_code}, ${duration}ms)"
    
    # Ajouter au rapport JSON
    cat >> "$RESULTS_FILE" << EOF
{
  "description": "$description",
  "method": "$method",
  "path": "$path",
  "status_code": $status_code,
  "duration_ms": $duration,
  "result": "$test_result",
  "expected_status": ${expected_status:-null},
  "response_body": $(echo "$body_response" | jq -R . 2>/dev/null || echo "\"$body_response\"")
},
EOF
}

echo -e "\n${BLUE}📊 1. Endpoints publics${NC}"
test_endpoint "GET" "/health" "Health check" false "" "200"
test_endpoint "GET" "/edn?limit=5" "Liste EDN (limitée)" false "" "200"
test_endpoint "GET" "/edn/ic-1" "Item EDN spécifique" false "" "200"
test_endpoint "GET" "/edn/item-inexistant" "Item EDN inexistant" false "" "404"

echo -e "\n${BLUE}🔒 2. Endpoints authentifiés (sans token)${NC}"
test_endpoint "GET" "/songs" "Liste chansons (sans auth)" false "" "401"
test_endpoint "GET" "/library" "Bibliothèque (sans auth)" false "" "401"
test_endpoint "GET" "/quota" "Quota (sans auth)" false "" "401"

if [ -n "$USER_TOKEN" ]; then
    echo -e "\n${BLUE}🎵 3. Endpoints chansons (avec auth)${NC}"
    test_endpoint "GET" "/songs?limit=5" "Liste chansons" true "" "200"
    test_endpoint "GET" "/songs?search=test" "Recherche chansons" true "" "200"
    test_endpoint "POST" "/songs" "Création chanson (données invalides)" true '{"title":""}' "400"
    
    echo -e "\n${BLUE}📚 4. Endpoints bibliothèque${NC}"
    test_endpoint "GET" "/library?limit=5" "Bibliothèque utilisateur" true "" "200"
    
    echo -e "\n${BLUE}⚡ 5. Autres endpoints${NC}"
    test_endpoint "GET" "/quota" "Quota utilisateur" true "" "200"
    test_endpoint "POST" "/subscriptions" "Création abonnement (invalide)" true '{"plan_id":""}' "400"
else
    echo -e "\n${YELLOW}⚠️  TOKEN manquant - tests authentifiés skippés${NC}"
fi

echo -e "\n${BLUE}🚫 6. Endpoints invalides${NC}"
test_endpoint "GET" "/endpoint-inexistant" "Endpoint inexistant" false "" "404"
test_endpoint "PATCH" "/edn" "Méthode non supportée" false "" "404"

echo -e "\n${BLUE}🔍 7. Tests de sécurité${NC}"
test_endpoint "GET" "/edn?search=%3Cscript%3Ealert%281%29%3C%2Fscript%3E" "Protection XSS" false "" "200"
test_endpoint "GET" "/songs/invalid-uuid/stream" "UUID invalide" true "" "400"

# Finaliser le fichier JSON
sed -i '$ s/,$//' "$RESULTS_FILE" 2>/dev/null || sed -i '' '$ s/,$//' "$RESULTS_FILE" 2>/dev/null || true
echo ']}' >> "$RESULTS_FILE"

echo -e "\n${GREEN}✅ Tests terminés${NC}"
echo "Rapport détaillé: $RESULTS_FILE"

# Résumé des résultats
if command -v jq &> /dev/null; then
    echo -e "\n${BLUE}📊 Résumé:${NC}"
    
    total=$(jq '.tests | length' "$RESULTS_FILE")
    pass=$(jq '[.tests[] | select(.result == "PASS")] | length' "$RESULTS_FILE")
    fail=$(jq '[.tests[] | select(.result == "FAIL")] | length' "$RESULTS_FILE")
    error=$(jq '[.tests[] | select(.result == "ERROR")] | length' "$RESULTS_FILE")
    warn=$(jq '[.tests[] | select(.result == "WARN")] | length' "$RESULTS_FILE")
    
    echo "Total: $total"
    echo -e "${GREEN}Pass: $pass${NC}"
    echo -e "${YELLOW}Warn: $warn${NC}"
    echo -e "${RED}Fail: $fail${NC}"
    echo -e "${RED}Error: $error${NC}"
    
    # Performance moyenne
    avg_duration=$(jq '[.tests[].duration_ms] | add / length' "$RESULTS_FILE" 2>/dev/null || echo "N/A")
    echo "Durée moyenne: ${avg_duration}ms"
    
    # Endpoints les plus lents
    echo -e "\n${BLUE}⏱️  Endpoints les plus lents:${NC}"
    jq -r '.tests | sort_by(.duration_ms) | reverse | .[0:3] | .[] | "\(.duration_ms)ms - \(.description)"' "$RESULTS_FILE" 2>/dev/null || echo "N/A"
fi

echo -e "\n${BLUE}💡 Commandes utiles:${NC}"
echo "- Voir les erreurs: jq '.tests[] | select(.result == \"ERROR\" or .result == \"FAIL\")' $RESULTS_FILE"
echo "- Voir la performance: jq '.tests | sort_by(.duration_ms) | reverse' $RESULTS_FILE"
echo "- Lancer les tests Jest: npm run test:integration"

exit 0