#!/bin/bash

# 🔍 SCRIPT D'AUDIT GLOBAL MED-MNG
# Lance tous les audits : sécurité, données, infra, tests, logs

set -e

echo "🎯 AUDIT GLOBAL MED-MNG - $(date)"
echo "=================================="

# Variables globales
AUDIT_DIR="audit_reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$AUDIT_DIR/audit-global-$TIMESTAMP.md"

# Créer le dossier de rapports
mkdir -p "$AUDIT_DIR"

# Fonction de logging
log() {
    echo "[$( date '+%H:%M:%S' )] $1" | tee -a "$REPORT_FILE"
}

# Fonction de vérification de succès
check_success() {
    if [ $? -eq 0 ]; then
        log "✅ $1 - SUCCÈS"
        return 0
    else
        log "❌ $1 - ÉCHEC"
        return 1
    fi
}

# Initialiser le rapport
cat > "$REPORT_FILE" << EOF
# 🔍 RAPPORT D'AUDIT GLOBAL MED-MNG

**Date**: $(date)  
**Durée**: [À compléter]  
**Status**: [À compléter]

---

## 📊 RÉSUMÉ EXÉCUTIF

| Composant | Status | Score | Détails |
|-----------|--------|-------|---------|
EOF

log "🚀 Démarrage audit global..."

# 1. AUDIT SÉCURITÉ
log "🔒 1. Audit sécurité..."
if command -v node &> /dev/null; then
    node scripts/security-scanner.js >> "$REPORT_FILE" 2>&1
    check_success "Scan sécurité"
else
    log "❌ Node.js non trouvé - audit sécurité ignoré"
fi

# 2. AUDIT SECRETS
log "🔐 2. Validation secrets..."
if [ -f "scripts/security-validation.js" ]; then
    node scripts/security-validation.js >> "$REPORT_FILE" 2>&1
    check_success "Validation secrets"
else
    log "❌ Script validation secrets manquant"
fi

# 3. TESTS SUITE
log "🧪 3. Suite de tests..."
if command -v npm &> /dev/null; then
    npm test >> "$REPORT_FILE" 2>&1
    check_success "Tests unitaires"
    
    if [ -f "package.json" ] && grep -q "test:e2e" package.json; then
        npm run test:e2e >> "$REPORT_FILE" 2>&1
        check_success "Tests E2E"
    fi
else
    log "❌ npm non trouvé - tests ignorés"
fi

# 4. BUILD VALIDATION
log "🏗️ 4. Validation build..."
if command -v npm &> /dev/null; then
    npm run build >> "$REPORT_FILE" 2>&1
    check_success "Build application"
else
    log "❌ Build ignoré - npm manquant"
fi

# 5. AUDIT BASE DE DONNÉES
log "🗃️ 5. Audit base de données..."
# Vérification de la connectivité Supabase
if command -v curl &> /dev/null; then
    SUPABASE_URL="https://yaincoxihiqdksxgrsrk.supabase.co"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU")
    
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 401 ]; then
        log "✅ Supabase accessible (HTTP $HTTP_STATUS)"
    else
        log "❌ Supabase inaccessible (HTTP $HTTP_STATUS)"
    fi
else
    log "❌ curl manquant - audit DB ignoré"
fi

# 6. AUDIT LOGS & MONITORING
log "📊 6. Audit logs & monitoring..."
# Vérifier la présence des dashboards
if [ -f "src/components/admin/AdminDashboard.tsx" ]; then
    log "✅ Dashboard admin présent"
else
    log "❌ Dashboard admin manquant"
fi

if [ -f "src/components/security/SecurityDashboard.tsx" ]; then
    log "✅ Dashboard sécurité présent"
else
    log "❌ Dashboard sécurité manquant"
fi

# 7. AUDIT DOCUMENTATION
log "📚 7. Audit documentation..."
DOCS_FILES=("README.md" "docs/FAQ.md" "docs/storybook-guide.md")
for file in "${DOCS_FILES[@]}"; do
    if [ -f "$file" ]; then
        log "✅ $file présent"
    else
        log "❌ $file manquant"
    fi
done

# 8. AUDIT PIPELINE CI/CD
log "⚙️ 8. Audit pipeline CI/CD..."
if [ -f ".github/workflows/ci-cd.yml" ]; then
    log "✅ Pipeline CI/CD configuré"
else
    log "❌ Pipeline CI/CD manquant"
fi

# 9. AUDIT PERFORMANCE
log "🚀 9. Audit performance..."
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    # Test build time
    START_TIME=$(date +%s)
    npm run build > /dev/null 2>&1
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))
    
    if [ $BUILD_TIME -lt 60 ]; then
        log "✅ Build rapide (${BUILD_TIME}s)"
    else
        log "⚠️ Build lent (${BUILD_TIME}s)"
    fi
fi

# 10. GÉNÉRATION BADGES
log "🏆 10. Génération badges..."

# Calculer le score global
TOTAL_CHECKS=10
PASSED_CHECKS=$(grep -c "✅" "$REPORT_FILE" || echo 0)
SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

# Déterminer le grade
if [ $SCORE -ge 90 ]; then
    GRADE="A"
    COLOR="brightgreen"
elif [ $SCORE -ge 80 ]; then
    GRADE="B" 
    COLOR="green"
elif [ $SCORE -ge 70 ]; then
    GRADE="C"
    COLOR="yellow"
else
    GRADE="F"
    COLOR="red"
fi

log "📊 Score global: $SCORE% (Grade $GRADE)"

# Finaliser le rapport
END_TIME=$(date)
DURATION=$(($(date +%s) - $(date -d "$START_TIME_STR" +%s 2>/dev/null || echo 0)))

cat >> "$REPORT_FILE" << EOF

---

## 🎯 RÉSULTATS FINAUX

**Score global**: $SCORE% (Grade $GRADE)  
**Checks réussis**: $PASSED_CHECKS/$TOTAL_CHECKS  
**Durée totale**: ${DURATION}s  
**Status**: $([ $SCORE -ge 80 ] && echo "SUCCÈS ✅" || echo "ATTENTION ⚠️")

### 🏆 Badge Audit
![Audit Score](https://img.shields.io/badge/Audit-$GRADE-$COLOR.svg)

### 📋 Actions recommandées
$([ $SCORE -lt 100 ] && echo "- Corriger les problèmes identifiés ci-dessus" || echo "- Aucune action requise - audit parfait!")
- Relancer l'audit après corrections
- Surveiller les métriques de performance

---

*Rapport généré le $(date) par le script d'audit global MED-MNG*
EOF

echo ""
echo "✅ AUDIT GLOBAL TERMINÉ"
echo "📊 Score: $SCORE% (Grade $GRADE)"
echo "📄 Rapport: $REPORT_FILE"
echo ""

# Copier le dernier rapport comme rapport principal
cp "$REPORT_FILE" "$AUDIT_DIR/audit-report.md"
log "📋 Rapport principal mis à jour: $AUDIT_DIR/audit-report.md"

# Sortir avec le code approprié
if [ $SCORE -ge 80 ]; then
    exit 0
else
    exit 1
fi