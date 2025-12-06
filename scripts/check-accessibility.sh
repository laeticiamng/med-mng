#!/bin/bash

# Script de vérification de l'accessibilité
# Vérifie les images sans alt, les pages sans Helmet, et les contrastes

echo "🔍 Vérification de l'accessibilité MED-MNG"
echo "=========================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
total_issues=0

# 1. Vérifier les images sans attribut alt
echo -e "\n📸 Vérification des images sans attribut alt..."
img_without_alt=$(grep -rn "<img" src/ --include="*.tsx" --include="*.jsx" | grep -v "alt=" | wc -l)
avatar_without_alt=$(grep -rn "<AvatarImage" src/ --include="*.tsx" | grep -v "alt=" | wc -l)

total_img_issues=$((img_without_alt + avatar_without_alt))

if [ $total_img_issues -gt 0 ]; then
  echo -e "${RED}❌ $total_img_issues images sans attribut alt trouvées${NC}"
  total_issues=$((total_issues + total_img_issues))
  
  # Afficher les fichiers concernés
  echo "Fichiers concernés:"
  grep -rn "<img" src/ --include="*.tsx" --include="*.jsx" | grep -v "alt=" | cut -d: -f1 | sort -u
  grep -rn "<AvatarImage" src/ --include="*.tsx" | grep -v "alt=" | cut -d: -f1 | sort -u
else
  echo -e "${GREEN}✅ Toutes les images ont un attribut alt${NC}"
fi

# 2. Vérifier les pages sans Helmet SEO
echo -e "\n🔍 Vérification des pages sans Helmet SEO..."
pages_without_helmet=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    if ! grep -q "Helmet" "$file"; then
      echo -e "${RED}❌ $file${NC}"
      pages_without_helmet=$((pages_without_helmet + 1))
    fi
  fi
done

if [ $pages_without_helmet -gt 0 ]; then
  echo -e "${RED}❌ $pages_without_helmet pages sans Helmet SEO${NC}"
  total_issues=$((total_issues + pages_without_helmet))
else
  echo -e "${GREEN}✅ Toutes les pages ont un Helmet SEO${NC}"
fi

# 3. Vérifier les aria-label manquants sur les boutons sans texte
echo -e "\n🔘 Vérification des boutons sans label accessible..."
buttons_without_label=$(grep -rn "<button" src/ --include="*.tsx" --include="*.jsx" | grep -v "aria-label=" | grep -v ">" | wc -l)

if [ $buttons_without_label -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $buttons_without_label boutons potentiellement sans label accessible${NC}"
  # Note: Ceci est un avertissement, pas une erreur, car certains boutons ont du texte
else
  echo -e "${GREEN}✅ Tous les boutons semblent avoir des labels${NC}"
fi

# 4. Vérifier la présence de skip links
echo -e "\n⏭️  Vérification des skip links..."
skip_links=$(grep -rn "skip-link\|Aller au contenu" src/ --include="*.tsx" | wc -l)

if [ $skip_links -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Aucun skip link trouvé${NC}"
  echo "   Recommandation: Ajouter un lien 'Aller au contenu principal' en haut de page"
else
  echo -e "${GREEN}✅ Skip links présents ($skip_links)${NC}"
fi

# 5. Vérifier les titres de page (H1)
echo -e "\n📑 Vérification des titres H1..."
pages_without_h1=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    if ! grep -q "<h1\|<H1\|heading.*level.*1" "$file"; then
      echo -e "${YELLOW}⚠️  $file (pas de H1 trouvé)${NC}"
      pages_without_h1=$((pages_without_h1 + 1))
    fi
  fi
done

if [ $pages_without_h1 -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $pages_without_h1 pages sans H1 apparent${NC}"
else
  echo -e "${GREEN}✅ Toutes les pages semblent avoir un H1${NC}"
fi

# 6. Vérifier les focus-visible
echo -e "\n👁️  Vérification du focus-visible..."
focus_styles=$(grep -rn "focus:" src/index.css src/components/ --include="*.css" --include="*.tsx" | wc -l)

if [ $focus_styles -gt 10 ]; then
  echo -e "${GREEN}✅ Styles de focus détectés ($focus_styles occurrences)${NC}"
else
  echo -e "${YELLOW}⚠️  Peu de styles de focus détectés ($focus_styles occurrences)${NC}"
fi

# Résumé final
echo -e "\n=========================================="
echo -e "📊 RÉSUMÉ"
echo -e "=========================================="

if [ $total_issues -eq 0 ]; then
  echo -e "${GREEN}✅ Aucun problème critique d'accessibilité détecté !${NC}"
  exit 0
else
  echo -e "${RED}❌ $total_issues problèmes critiques d'accessibilité détectés${NC}"
  echo -e "\nProblèmes à corriger:"
  [ $total_img_issues -gt 0 ] && echo -e "  - $total_img_issues images sans alt"
  [ $pages_without_helmet -gt 0 ] && echo -e "  - $pages_without_helmet pages sans Helmet SEO"
  
  echo -e "\nConsultez docs/AUDIT_CORRECTIONS.md pour les solutions"
  exit 1
fi
