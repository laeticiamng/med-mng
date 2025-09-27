#!/bin/bash

# ================================================
# 🏥 MED-MNG - Audit Global Automatisé
# ================================================

set -e

# Colors pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="audit-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/audit_global_$TIMESTAMP.md"

echo -e "${BLUE}🔍 MED-MNG - Audit Global Démarré${NC}"
echo "================================================"
echo "Timestamp: $(date)"
echo "Rapport: $REPORT_FILE"
echo "================================================"

# Créer le répertoire de rapports
mkdir -p $REPORT_DIR

# Initialiser le rapport
cat > $REPORT_FILE << EOF
# 🏥 MED-MNG - Rapport d'Audit Global

**Date**: $(date)
**Version**: $(git describe --tags --always 2>/dev/null || echo "dev")
**Branche**: $(git branch --show-current 2>/dev/null || echo "unknown")

---

EOF

# ================================================
# 1. AUDIT SÉCURITÉ
# ================================================
echo -e "${YELLOW}1. 🔐 Audit Sécurité...${NC}"

echo "## 🔐 Audit Sécurité" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Vérifier les secrets
echo -e "  ${BLUE}→ Scan des secrets...${NC}"
if command -v trufflehog &> /dev/null; then
    trufflehog filesystem . --json > "$REPORT_DIR/secrets_scan_$TIMESTAMP.json" 2>/dev/null || true
    SECRET_COUNT=$(cat "$REPORT_DIR/secrets_scan_$TIMESTAMP.json" | wc -l)
    if [ $SECRET_COUNT -gt 0 ]; then
        echo -e "    ${RED}⚠️  $SECRET_COUNT secrets potentiels détectés${NC}"
        echo "- ❌ **$SECRET_COUNT secrets potentiels détectés**" >> $REPORT_FILE
    else
        echo -e "    ${GREEN}✅ Aucun secret exposé${NC}"
        echo "- ✅ **Aucun secret exposé**" >> $REPORT_FILE
    fi
else
    echo -e "    ${YELLOW}⚠️  TruffleHog non installé${NC}"
    echo "- ⚠️ **TruffleHog non installé** - Installer: \`pip install truffleHog\`" >> $REPORT_FILE
fi

# Vérifier les fichiers sensibles
echo -e "  ${BLUE}→ Vérification fichiers sensibles...${NC}"
SENSITIVE_FILES=()
for file in .env .env.local .env.production config/database.yml; do
    if [ -f "$file" ]; then
        SENSITIVE_FILES+=("$file")
    fi
done

if [ ${#SENSITIVE_FILES[@]} -gt 0 ]; then
    echo -e "    ${RED}⚠️  Fichiers sensibles trouvés: ${SENSITIVE_FILES[*]}${NC}"
    echo "- ❌ **Fichiers sensibles**: ${SENSITIVE_FILES[*]}" >> $REPORT_FILE
else
    echo -e "    ${GREEN}✅ Aucun fichier sensible exposé${NC}"
    echo "- ✅ **Aucun fichier sensible exposé**" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# ================================================
# 2. AUDIT CODE QUALITÉ
# ================================================
echo -e "${YELLOW}2. 🧹 Audit Qualité Code...${NC}"

echo "## 🧹 Audit Qualité Code" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# ESLint
echo -e "  ${BLUE}→ ESLint...${NC}"
if npm run lint 2>&1 | tee "$REPORT_DIR/eslint_$TIMESTAMP.log"; then
    echo -e "    ${GREEN}✅ ESLint: Aucune erreur${NC}"
    echo "- ✅ **ESLint**: Aucune erreur" >> $REPORT_FILE
else
    ERROR_COUNT=$(grep -c "error" "$REPORT_DIR/eslint_$TIMESTAMP.log" 2>/dev/null || echo "0")
    WARNING_COUNT=$(grep -c "warning" "$REPORT_DIR/eslint_$TIMESTAMP.log" 2>/dev/null || echo "0")
    echo -e "    ${RED}❌ ESLint: $ERROR_COUNT erreurs, $WARNING_COUNT avertissements${NC}"
    echo "- ❌ **ESLint**: $ERROR_COUNT erreurs, $WARNING_COUNT avertissements" >> $REPORT_FILE
fi

# TypeScript
echo -e "  ${BLUE}→ TypeScript...${NC}"
if npx tsc --noEmit 2>&1 | tee "$REPORT_DIR/typescript_$TIMESTAMP.log"; then
    echo -e "    ${GREEN}✅ TypeScript: Aucune erreur${NC}"
    echo "- ✅ **TypeScript**: Aucune erreur de type" >> $REPORT_FILE
else
    TS_ERROR_COUNT=$(grep -c "error TS" "$REPORT_DIR/typescript_$TIMESTAMP.log" 2>/dev/null || echo "0")
    echo -e "    ${RED}❌ TypeScript: $TS_ERROR_COUNT erreurs de type${NC}"
    echo "- ❌ **TypeScript**: $TS_ERROR_COUNT erreurs de type" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# ================================================
# 3. AUDIT DÉPENDANCES
# ================================================
echo -e "${YELLOW}3. 📦 Audit Dépendances...${NC}"

echo "## 📦 Audit Dépendances" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# npm audit
echo -e "  ${BLUE}→ npm audit...${NC}"
if npm audit --json > "$REPORT_DIR/npm_audit_$TIMESTAMP.json" 2>/dev/null; then
    CRITICAL=$(cat "$REPORT_DIR/npm_audit_$TIMESTAMP.json" | jq '.vulnerabilities | to_entries | map(select(.value.severity == "critical")) | length')
    HIGH=$(cat "$REPORT_DIR/npm_audit_$TIMESTAMP.json" | jq '.vulnerabilities | to_entries | map(select(.value.severity == "high")) | length')
    MODERATE=$(cat "$REPORT_DIR/npm_audit_$TIMESTAMP.json" | jq '.vulnerabilities | to_entries | map(select(.value.severity == "moderate")) | length')
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo -e "    ${RED}❌ Vulnérabilités: $CRITICAL critiques, $HIGH élevées, $MODERATE modérées${NC}"
        echo "- ❌ **Vulnérabilités**: $CRITICAL critiques, $HIGH élevées, $MODERATE modérées" >> $REPORT_FILE
    else
        echo -e "    ${GREEN}✅ Aucune vulnérabilité critique${NC}"
        echo "- ✅ **Aucune vulnérabilité critique**" >> $REPORT_FILE
    fi
else
    echo -e "    ${YELLOW}⚠️  Erreur npm audit${NC}"
    echo "- ⚠️ **Erreur lors de npm audit**" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# ================================================
# 4. AUDIT PERFORMANCE
# ================================================
echo -e "${YELLOW}4. ⚡ Audit Performance...${NC}"

echo "## ⚡ Audit Performance" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Build test
echo -e "  ${BLUE}→ Test de build...${NC}"
if npm run build 2>&1 | tee "$REPORT_DIR/build_$TIMESTAMP.log"; then
    # Analyser la taille du bundle
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist | cut -f1)
        echo -e "    ${GREEN}✅ Build réussi - Taille: $BUNDLE_SIZE${NC}"
        echo "- ✅ **Build réussi** - Taille: $BUNDLE_SIZE" >> $REPORT_FILE
    else
        echo -e "    ${GREEN}✅ Build réussi${NC}"
        echo "- ✅ **Build réussi**" >> $REPORT_FILE
    fi
else
    echo -e "    ${RED}❌ Échec du build${NC}"
    echo "- ❌ **Échec du build** - Voir logs pour détails" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# ================================================
# 5. AUDIT TESTS
# ================================================
echo -e "${YELLOW}5. 🧪 Audit Tests...${NC}"

echo "## 🧪 Audit Tests" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Tests unitaires
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo -e "  ${BLUE}→ Tests unitaires...${NC}"
    if npm test 2>&1 | tee "$REPORT_DIR/tests_$TIMESTAMP.log"; then
        echo -e "    ${GREEN}✅ Tous les tests passent${NC}"
        echo "- ✅ **Tests unitaires**: Tous passent" >> $REPORT_FILE
    else
        FAILED_TESTS=$(grep -c "FAIL" "$REPORT_DIR/tests_$TIMESTAMP.log" 2>/dev/null || echo "0")
        echo -e "    ${RED}❌ $FAILED_TESTS tests échouent${NC}"
        echo "- ❌ **Tests unitaires**: $FAILED_TESTS échecs" >> $REPORT_FILE
    fi
else
    echo -e "    ${YELLOW}⚠️  Aucun test configuré${NC}"
    echo "- ⚠️ **Aucun test unitaire configuré**" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE

# ================================================
# 6. AUDIT STRUCTURE
# ================================================
echo -e "${YELLOW}6. 📁 Audit Structure...${NC}"

echo "## 📁 Audit Structure" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Vérifier les fichiers essentiels
ESSENTIAL_FILES=(
    "README.md"
    "package.json"
    ".gitignore"
    "src/App.tsx"
    "src/main.tsx"
    "index.html"
)

echo "### Fichiers Essentiels" >> $REPORT_FILE
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "    ${GREEN}✅ $file${NC}"
        echo "- ✅ $file" >> $REPORT_FILE
    else
        echo -e "    ${RED}❌ $file manquant${NC}"
        echo "- ❌ $file manquant" >> $REPORT_FILE
    fi
done

echo "" >> $REPORT_FILE

# ================================================
# 7. RÉSUMÉ FINAL
# ================================================
echo "## 📊 Résumé Exécutif" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Calcul du score global
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Compter les vérifications dans le rapport
TOTAL_CHECKS=$(grep -c "^- " $REPORT_FILE)
PASSED_CHECKS=$(grep -c "^- ✅" $REPORT_FILE)

if [ $TOTAL_CHECKS -gt 0 ]; then
    SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    
    if [ $SCORE -ge 90 ]; then
        STATUS="🟢 EXCELLENT"
        COLOR=$GREEN
    elif [ $SCORE -ge 70 ]; then
        STATUS="🟡 BON"
        COLOR=$YELLOW
    else
        STATUS="🔴 À AMÉLIORER"
        COLOR=$RED
    fi
    
    echo -e "**Score Global**: $SCORE% ($PASSED_CHECKS/$TOTAL_CHECKS)" >> $REPORT_FILE
    echo -e "**Statut**: $STATUS" >> $REPORT_FILE
else
    SCORE=0
    STATUS="🔴 ERREUR AUDIT"
    COLOR=$RED
fi

echo "" >> $REPORT_FILE
echo "### Recommandations Prioritaires" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Ajouter les recommandations basées sur les résultats
if grep -q "❌.*secrets" $REPORT_FILE; then
    echo "1. **🔐 CRITIQUE**: Éliminer tous les secrets exposés" >> $REPORT_FILE
fi
if grep -q "❌.*Vulnérabilités" $REPORT_FILE; then
    echo "2. **📦 URGENT**: Corriger les vulnérabilités critiques" >> $REPORT_FILE
fi
if grep -q "❌.*ESLint" $REPORT_FILE; then
    echo "3. **🧹 IMPORTANT**: Résoudre les erreurs ESLint" >> $REPORT_FILE
fi

echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "**Généré par**: \`scripts/audit-global.sh\`" >> $REPORT_FILE
echo "**Commande**: \`npm run audit:global\`" >> $REPORT_FILE

# ================================================
# AFFICHAGE FINAL
# ================================================
echo ""
echo "================================================"
echo -e "${COLOR}🎯 AUDIT TERMINÉ - Score: $SCORE% - $STATUS${NC}"
echo "================================================"
echo -e "📄 Rapport complet: ${BLUE}$REPORT_FILE${NC}"
echo -e "📊 Logs détaillés: ${BLUE}$REPORT_DIR/${NC}"
echo ""

if [ $SCORE -lt 70 ]; then
    echo -e "${RED}⚠️  Action requise: Score inférieur à 70%${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Audit réussi: Plateforme en bon état${NC}"
    exit 0
fi