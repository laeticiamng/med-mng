#!/bin/bash

# Script pour exécuter les tests de sécurité avec différentes options

set -e

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo -e "${BLUE}🔒 Script de tests de sécurité${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 [OPTIONS]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --all              Exécuter tous les tests de sécurité"
    echo "  --middleware       Tester uniquement le middleware de sécurité"
    echo "  --ratelimit        Tester uniquement le rate limiting"
    echo "  --coverage         Exécuter avec couverture de code"
    echo "  --watch            Mode watch (développement)"
    echo "  --help, -h         Afficher cette aide"
    echo ""
    echo -e "${YELLOW}Exemples:${NC}"
    echo "  $0 --all --coverage    # Tous les tests avec couverture"
    echo "  $0 --middleware        # Tests du middleware uniquement"
    echo "  $0 --watch            # Mode développement"
}

# Paramètres par défaut
RUN_ALL=false
RUN_MIDDLEWARE=false
RUN_RATELIMIT=false
WITH_COVERAGE=false
WATCH_MODE=false

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            RUN_ALL=true
            shift
            ;;
        --middleware)
            RUN_MIDDLEWARE=true
            shift
            ;;
        --ratelimit)
            RUN_RATELIMIT=true
            shift
            ;;
        --coverage)
            WITH_COVERAGE=true
            shift
            ;;
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Si aucune option spécifique, exécuter tous les tests
if [[ "$RUN_ALL" == "false" && "$RUN_MIDDLEWARE" == "false" && "$RUN_RATELIMIT" == "false" ]]; then
    RUN_ALL=true
fi

# Construction de la commande vitest
VITEST_CMD="npx vitest"

if [[ "$WATCH_MODE" == "true" ]]; then
    VITEST_CMD="$VITEST_CMD --watch"
else
    VITEST_CMD="$VITEST_CMD run"
fi

if [[ "$WITH_COVERAGE" == "true" ]]; then
    VITEST_CMD="$VITEST_CMD --coverage"
fi

# Détermination des fichiers de test à exécuter
TEST_PATTERN=""

if [[ "$RUN_ALL" == "true" ]]; then
    TEST_PATTERN="tests/security/"
    echo -e "${GREEN}🚀 Exécution de tous les tests de sécurité...${NC}"
elif [[ "$RUN_MIDDLEWARE" == "true" ]]; then
    TEST_PATTERN="tests/security/securityMiddleware.test.ts"
    echo -e "${GREEN}🛡️  Exécution des tests du middleware de sécurité...${NC}"
elif [[ "$RUN_RATELIMIT" == "true" ]]; then
    TEST_PATTERN="tests/security/rateLimitService.test.ts"
    echo -e "${GREEN}⏱️  Exécution des tests de rate limiting...${NC}"
fi

# Exécution des tests
echo -e "${BLUE}Commande: $VITEST_CMD $TEST_PATTERN${NC}"
echo ""

# Vérification que les fichiers de test existent
if [[ ! -d "tests/security" ]]; then
    echo -e "${RED}❌ Répertoire tests/security introuvable!${NC}"
    exit 1
fi

if [[ "$RUN_MIDDLEWARE" == "true" && ! -f "tests/security/securityMiddleware.test.ts" ]]; then
    echo -e "${RED}❌ Fichier tests/security/securityMiddleware.test.ts introuvable!${NC}"
    exit 1
fi

if [[ "$RUN_RATELIMIT" == "true" && ! -f "tests/security/rateLimitService.test.ts" ]]; then
    echo -e "${RED}❌ Fichier tests/security/rateLimitService.test.ts introuvable!${NC}"
    exit 1
fi

# Définir les variables d'environnement pour les tests
export NODE_ENV=test
export SKIP_ENV_VALIDATION=true
export VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-"https://test.supabase.co"}
export VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-"test-key"}

# Exécution
eval "$VITEST_CMD $TEST_PATTERN"
EXIT_CODE=$?

# Résumé des résultats
echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}✅ Tous les tests de sécurité sont passés avec succès!${NC}"
    
    if [[ "$WITH_COVERAGE" == "true" ]]; then
        echo -e "${BLUE}📊 Rapport de couverture disponible dans coverage/${NC}"
    fi
else
    echo -e "${RED}❌ Certains tests de sécurité ont échoué.${NC}"
    echo -e "${YELLOW}💡 Vérifiez les logs ci-dessus pour plus de détails.${NC}"
fi

exit $EXIT_CODE