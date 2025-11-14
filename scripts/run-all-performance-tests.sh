#!/bin/bash

# Script pour exécuter tous les tests de performance, E2E et accessibilité
# Auteur: Tests automatisés EDN Complete
# Date: 2024-11

set -e

echo "🚀 Début des tests complets - EDN Complete"
echo "=========================================="
echo ""

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Mesure de performance Lighthouse
echo -e "${BLUE}📊 ÉTAPE 1/3: Mesure de performance Lighthouse${NC}"
echo "Objectifs: FCP < 1.8s, LCP < 2.5s, TBT < 300ms"
echo ""

if node scripts/measure-lazy-loading-impact.js; then
    echo -e "${GREEN}✅ Mesure de performance terminée avec succès${NC}"
else
    echo -e "${RED}❌ Échec de la mesure de performance${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo ""

# 2. Tests E2E Playwright
echo -e "${BLUE}🎭 ÉTAPE 2/3: Tests E2E Playwright (15 scénarios)${NC}"
echo "Validation du flux complet utilisateur sur /edn-complete"
echo ""

if npx playwright test tests/e2e/edn-complete.spec.ts; then
    echo -e "${GREEN}✅ Tests E2E réussis (15/15)${NC}"
    echo ""
    echo "Génération du rapport HTML..."
    npx playwright show-report --host localhost --port 9323 &
    REPORT_PID=$!
    echo -e "${GREEN}📊 Rapport E2E disponible sur http://localhost:9323${NC}"
else
    echo -e "${RED}❌ Échec des tests E2E${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo ""

# 3. Tests d'accessibilité avec axe-core
echo -e "${BLUE}♿ ÉTAPE 3/3: Tests d'accessibilité WCAG 2.1 AA (16 tests)${NC}"
echo "Validation navigation clavier, ARIA, contraste"
echo ""

if npx playwright test tests/accessibility/edn-components.spec.ts --reporter=html; then
    echo -e "${GREEN}✅ Tests d'accessibilité réussis (16/16)${NC}"
    echo ""
    echo -e "${GREEN}📊 Rapport accessibilité: playwright-report/index.html${NC}"
else
    echo -e "${RED}❌ Échec des tests d'accessibilité${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo ""
echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS${NC}"
echo ""
echo "📊 Rapports générés:"
echo "  - Performance: performance-reports/comparison-*.json"
echo "  - E2E: http://localhost:9323 (serveur actif)"
echo "  - Accessibilité: playwright-report/index.html"
echo ""
echo "📈 Métriques de performance à vérifier:"
echo "  - First Contentful Paint (FCP)"
echo "  - Largest Contentful Paint (LCP)"
echo "  - Total Blocking Time (TBT)"
echo "  - Cumulative Layout Shift (CLS)"
echo ""
echo "Pour voir le rapport E2E, appuyez sur Ctrl+C quand vous avez fini"
wait $REPORT_PID
