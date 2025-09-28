#!/bin/bash

# 🚀 SCRIPT DE TESTS DE PERFORMANCE COMPLETS MED-MNG
# Lance tous les tests de performance : frontend, backend, rapports

set -e

echo "⚡ TESTS DE PERFORMANCE MED-MNG - $(date)"
echo "======================================="

# Variables
REPORTS_DIR="performance-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORTS_DIR/performance-report-$TIMESTAMP.md"

# Créer le dossier de rapports
mkdir -p "$REPORTS_DIR"

# Fonction de logging
log() {
    echo "[$( date '+%H:%M:%S' )] $1" | tee -a "$REPORT_FILE"
}

# Initialiser le rapport
cat > "$REPORT_FILE" << EOF
# 🚀 RAPPORT DE PERFORMANCE MED-MNG

**Date**: $(date)  
**Type**: Tests complets (Frontend + Backend)  
**Environnement**: $([ "$NODE_ENV" == "production" ] && echo "Production" || echo "Development")

---

## 📊 RÉSULTATS DE PERFORMANCE

EOF

log "🚀 Démarrage des tests de performance..."

# 1. TESTS FRONTEND PLAYWRIGHT
log "🎨 1. Tests de performance Frontend..."
if command -v npx &> /dev/null; then
    echo "## 🎨 Performance Frontend" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Lancer les tests Playwright de performance
    npx playwright test --config=playwright-performance.config.ts --reporter=json 2>&1 | tee -a "$REPORT_FILE"
    
    # Vérifier les résultats
    if [ $? -eq 0 ]; then
        log "✅ Tests frontend - SUCCÈS"
        echo "- ✅ **Frontend Performance**: PASSED" >> "$REPORT_FILE"
    else
        log "❌ Tests frontend - ÉCHEC"
        echo "- ❌ **Frontend Performance**: FAILED" >> "$REPORT_FILE"
    fi
else
    log "❌ Playwright non disponible - tests frontend ignorés"
    echo "- ❌ **Frontend Performance**: SKIPPED (Playwright manquant)" >> "$REPORT_FILE"
fi

# 2. LIGHTHOUSE AUDIT
log "🔍 2. Audit Lighthouse..."
if command -v lighthouse &> /dev/null; then
    echo "" >> "$REPORT_FILE"
    echo "## 🔍 Audit Lighthouse" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Démarrer le serveur de dev en arrière-plan si nécessaire
    if ! curl -s http://localhost:5173 > /dev/null; then
        log "📡 Démarrage serveur de développement..."
        npm run dev &
        SERVER_PID=$!
        sleep 10 # Attendre que le serveur démarre
    fi
    
    # Audit Lighthouse
    lighthouse http://localhost:5173 \
        --output=json \
        --output-path="$REPORTS_DIR/lighthouse-$TIMESTAMP.json" \
        --chrome-flags="--headless --no-sandbox" \
        --quiet 2>&1 | tee -a "$REPORT_FILE"
    
    # Extraire le score de performance
    if [ -f "$REPORTS_DIR/lighthouse-$TIMESTAMP.json" ]; then
        PERF_SCORE=$(node -p "JSON.parse(require('fs').readFileSync('$REPORTS_DIR/lighthouse-$TIMESTAMP.json')).categories.performance.score * 100")
        log "📊 Score Lighthouse: $PERF_SCORE/100"
        echo "- **Performance Score**: $PERF_SCORE/100" >> "$REPORT_FILE"
        
        if [ $(echo "$PERF_SCORE >= 80" | bc -l) -eq 1 ]; then
            echo "- ✅ **Lighthouse Audit**: PASSED (Score ≥ 80)" >> "$REPORT_FILE"
        else
            echo "- ❌ **Lighthouse Audit**: FAILED (Score < 80)" >> "$REPORT_FILE"
        fi
    fi
    
    # Arrêter le serveur si on l'a démarré
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
else
    log "❌ Lighthouse non disponible"
    echo "- ❌ **Lighthouse Audit**: SKIPPED (Lighthouse manquant)" >> "$REPORT_FILE"
fi

# 3. ANALYSE DE BUNDLE
log "📦 3. Analyse des bundles..."
if command -v npm &> /dev/null; then
    echo "" >> "$REPORT_FILE"
    echo "## 📦 Analyse des Bundles" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Build l'application
    BUILD_START=$(date +%s)
    npm run build 2>&1 | tee -a "$REPORT_FILE"
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    
    log "🏗️ Temps de build: ${BUILD_TIME}s"
    echo "- **Temps de build**: ${BUILD_TIME}s" >> "$REPORT_FILE"
    
    # Analyser la taille des fichiers de build
    if [ -d "dist" ]; then
        JS_SIZE=$(find dist -name "*.js" -type f -exec du -cb {} + | grep total | cut -f1)
        CSS_SIZE=$(find dist -name "*.css" -type f -exec du -cb {} + | grep total | cut -f1)
        
        JS_SIZE_KB=$((JS_SIZE / 1024))
        CSS_SIZE_KB=$((CSS_SIZE / 1024))
        
        log "📊 Taille JS: ${JS_SIZE_KB} KB"
        log "📊 Taille CSS: ${CSS_SIZE_KB} KB"
        
        echo "- **Taille JavaScript**: ${JS_SIZE_KB} KB" >> "$REPORT_FILE"
        echo "- **Taille CSS**: ${CSS_SIZE_KB} KB" >> "$REPORT_FILE"
        
        # Vérifier les seuils
        if [ $JS_SIZE_KB -lt 500 ] && [ $CSS_SIZE_KB -lt 100 ]; then
            echo "- ✅ **Bundle Size**: PASSED" >> "$REPORT_FILE"
        else
            echo "- ❌ **Bundle Size**: EXCEEDED (JS>500KB ou CSS>100KB)" >> "$REPORT_FILE"
        fi
    fi
else
    log "❌ npm non disponible"
fi

# 4. TESTS BACKEND
log "🔧 4. Tests de performance Backend..."
if command -v npx &> /dev/null; then
    echo "" >> "$REPORT_FILE"
    echo "## 🔧 Performance Backend" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Lancer les tests backend
    npx playwright test tests/performance/backend-performance.spec.ts --reporter=json 2>&1 | tee -a "$REPORT_FILE"
    
    if [ $? -eq 0 ]; then
        log "✅ Tests backend - SUCCÈS"
        echo "- ✅ **Backend Performance**: PASSED" >> "$REPORT_FILE"
    else
        log "❌ Tests backend - ÉCHEC"
        echo "- ❌ **Backend Performance**: FAILED" >> "$REPORT_FILE"
    fi
fi

# 5. GÉNÉRATION DU SCORE GLOBAL
log "🏆 5. Calcul du score global..."

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## 🎯 SCORE GLOBAL DE PERFORMANCE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Compter les tests passés
PASSED_TESTS=$(grep -c "✅.*PASSED" "$REPORT_FILE" || echo 0)
TOTAL_TESTS=$(grep -c -E "(✅.*PASSED|❌.*FAILED)" "$REPORT_FILE" || echo 1)
SCORE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

# Déterminer le grade
if [ $SCORE -ge 90 ]; then
    GRADE="A+"
    COLOR="brightgreen"
elif [ $SCORE -ge 80 ]; then
    GRADE="A"
    COLOR="green"
elif [ $SCORE -ge 70 ]; then
    GRADE="B"
    COLOR="yellow"
else
    GRADE="C"
    COLOR="orange"
fi

log "📊 Score de performance: $SCORE% (Grade $GRADE)"

cat >> "$REPORT_FILE" << EOF
**Score de Performance**: $SCORE% 🎯  
**Grade**: $GRADE  
**Tests réussis**: $PASSED_TESTS/$TOTAL_TESTS  

### 🏆 Badge Performance
![Performance](https://img.shields.io/badge/Performance-$GRADE-$COLOR.svg)

### 📋 Recommandations
$([ $SCORE -lt 90 ] && echo "- Optimiser les éléments en échec ci-dessus" || echo "- Performance excellente, maintenir le niveau")
- Surveiller régulièrement les métriques
- Optimiser les images et ressources statiques
- Surveiller les Core Web Vitals

### 📈 Seuils de Performance
- **Lighthouse Score**: ≥ 80/100
- **Page Load Time**: ≤ 3s
- **API Response Time**: ≤ 1s  
- **Bundle Size JS**: ≤ 500KB
- **Bundle Size CSS**: ≤ 100KB

---

*Rapport généré le $(date) par le système de tests de performance MED-MNG*
EOF

# Copier comme rapport principal
cp "$REPORT_FILE" "$REPORTS_DIR/performance-report.md"

echo ""
echo "✅ TESTS DE PERFORMANCE TERMINÉS"
echo "📊 Score: $SCORE% (Grade $GRADE)"
echo "📄 Rapport: $REPORT_FILE"
echo "📈 Dashboard: $REPORTS_DIR/performance-report.md"
echo ""

# Sortir avec le code approprié
if [ $SCORE -ge 70 ]; then
    exit 0
else
    exit 1
fi