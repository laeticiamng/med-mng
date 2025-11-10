#!/bin/bash

# Script d'audit rapide pour MED-MNG
# Vérifie les points clés d'accessibilité, SEO et performance

echo "🔍 AUDIT RAPIDE MED-MNG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

score=0
total=0

# Fonction de vérification
check() {
  ((total++))
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅${NC} $2"
    ((score++))
  else
    echo -e "${RED}❌${NC} $2"
  fi
}

echo "📊 VÉRIFICATION DU CODE..."
echo ""

# 1. Vérifier les aria-labels
echo "1️⃣  Accessibilité - ARIA Labels"
missing_aria=$(grep -r "Button.*onClick" src/ --include="*.tsx" | grep -v "aria-label" | wc -l)
check $missing_aria "Tous les boutons ont des aria-labels"

# 2. Vérifier les alt sur les images
echo ""
echo "2️⃣  Accessibilité - Images ALT"
missing_alt=$(grep -r "<img" src/ --include="*.tsx" | grep -v "alt=" | wc -l)
check $missing_alt "Toutes les images ont des attributs alt"

# 3. Vérifier les balises H1
echo ""
echo "3️⃣  SEO - Balises H1"
h1_count=$(grep -r "<h1" src/pages/ --include="*.tsx" | wc -l)
if [ $h1_count -gt 0 ]; then
  check 0 "Balises H1 présentes dans les pages"
else
  check 1 "Balises H1 présentes dans les pages"
fi

# 4. Vérifier les meta descriptions
echo ""
echo "4️⃣  SEO - Meta Descriptions"
meta_desc=$(grep -r "meta.*description" src/ --include="*.tsx" | wc -l)
if [ $meta_desc -gt 0 ]; then
  check 0 "Meta descriptions configurées"
else
  check 1 "Meta descriptions configurées"
fi

# 5. Vérifier SEOHead component
echo ""
echo "5️⃣  SEO - Composant SEOHead"
seo_head=$(grep -r "SEOHead" src/pages/ --include="*.tsx" | wc -l)
if [ $seo_head -gt 3 ]; then
  check 0 "SEOHead utilisé dans les pages principales"
else
  check 1 "SEOHead utilisé dans les pages principales"
fi

# 6. Vérifier le lazy loading
echo ""
echo "6️⃣  Performance - Lazy Loading"
lazy_load=$(grep -r "lazy.*import" src/ --include="*.tsx" | wc -l)
if [ $lazy_load -gt 5 ]; then
  check 0 "Lazy loading implémenté"
else
  check 1 "Lazy loading implémenté"
fi

# 7. Vérifier les Suspense
echo ""
echo "7️⃣  Performance - Suspense Boundaries"
suspense_count=$(grep -r "<Suspense" src/ --include="*.tsx" | wc -l)
if [ $suspense_count -gt 3 ]; then
  check 0 "Suspense boundaries présents"
else
  check 1 "Suspense boundaries présents"
fi

# 8. Vérifier le contraste (mode sombre)
echo ""
echo "8️⃣  Accessibilité - Contraste Mode Sombre"
dark_mode=$(grep -r "dark.*background.*\(12\|16\)%" src/index.css | wc -l)
if [ $dark_mode -gt 0 ]; then
  check 0 "Contraste amélioré pour mode sombre"
else
  check 1 "Contraste amélioré pour mode sombre"
fi

# 9. Vérifier les semantic tokens
echo ""
echo "9️⃣  Design System - Semantic Tokens"
semantic=$(grep -r "text-white\|bg-white" src/ --include="*.tsx" | wc -l)
if [ $semantic -lt 10 ]; then
  check 0 "Utilisation de tokens sémantiques"
else
  check 1 "Utilisation de tokens sémantiques (éviter text-white, bg-white)"
fi

# 10. Vérifier les focus states
echo ""
echo "🔟 Accessibilité - Focus States"
focus_states=$(grep -r "focus:" src/ --include="*.tsx" --include="*.css" | wc -l)
if [ $focus_states -gt 5 ]; then
  check 0 "États de focus définis"
else
  check 1 "États de focus définis"
fi

# Résultats
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
percentage=$((score * 100 / total))
echo ""
echo "📈 RÉSULTAT: $score/$total ($percentage%)"
echo ""

if [ $percentage -ge 90 ]; then
  echo -e "${GREEN}🎉 Excellent! Votre code suit les meilleures pratiques${NC}"
elif [ $percentage -ge 70 ]; then
  echo -e "${YELLOW}⚠️  Bon, mais quelques améliorations possibles${NC}"
else
  echo -e "${RED}❌ Des améliorations importantes sont nécessaires${NC}"
fi

echo ""
echo "💡 Pour un audit complet Lighthouse:"
echo "   1. Ouvrez Chrome DevTools (F12)"
echo "   2. Onglet Lighthouse"
echo "   3. Cochez toutes les catégories"
echo "   4. Cliquez 'Analyze page load'"
echo ""
echo "📚 Ou consultez: scripts/audit-manuel.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0
