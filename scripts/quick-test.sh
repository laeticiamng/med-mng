#!/bin/bash

# Script rapide pour exécuter un seul type de test
# Usage: ./scripts/quick-test.sh [performance|e2e|accessibility|all]

set -e

TEST_TYPE=${1:-all}

case $TEST_TYPE in
  performance)
    echo "📊 Exécution des tests de performance Lighthouse..."
    node scripts/measure-lazy-loading-impact.js
    ;;
  
  e2e)
    echo "🎭 Exécution des tests E2E Playwright..."
    npx playwright test tests/e2e/edn-complete.spec.ts
    npx playwright show-report
    ;;
  
  accessibility)
    echo "♿ Exécution des tests d'accessibilité..."
    npx playwright test tests/accessibility/edn-components.spec.ts --reporter=html
    echo "Rapport généré: playwright-report/index.html"
    ;;
  
  all)
    echo "🚀 Exécution de tous les tests..."
    ./scripts/run-all-performance-tests.sh
    ;;
  
  *)
    echo "Usage: ./scripts/quick-test.sh [performance|e2e|accessibility|all]"
    exit 1
    ;;
esac
