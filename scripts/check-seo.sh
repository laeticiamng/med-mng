#!/bin/bash

# Script de vérification SEO
# Vérifie les meta descriptions, titres, et structure sémantique

echo "🔍 Vérification SEO MED-MNG"
echo "=========================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

total_issues=0

# 1. Vérifier les meta descriptions
echo -e "\n📝 Vérification des meta descriptions..."
pages_without_description=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    if grep -q "Helmet" "$file"; then
      if ! grep -q "meta name=\"description\"" "$file"; then
        echo -e "${RED}❌ $(basename $file) - Helmet présent mais pas de description${NC}"
        pages_without_description=$((pages_without_description + 1))
      else
        # Vérifier la longueur de la description
        desc=$(grep "meta name=\"description\"" "$file" | sed 's/.*content="\([^"]*\)".*/\1/')
        desc_length=${#desc}
        
        if [ $desc_length -lt 50 ]; then
          echo -e "${YELLOW}⚠️  $(basename $file) - Description trop courte ($desc_length caractères)${NC}"
        elif [ $desc_length -gt 160 ]; then
          echo -e "${YELLOW}⚠️  $(basename $file) - Description trop longue ($desc_length caractères)${NC}"
        else
          echo -e "${GREEN}✅ $(basename $file) - Description OK ($desc_length caractères)${NC}"
        fi
      fi
    else
      echo -e "${YELLOW}⚠️  $(basename $file) - Pas de Helmet${NC}"
      pages_without_description=$((pages_without_description + 1))
    fi
  fi
done

total_issues=$((total_issues + pages_without_description))

# 2. Vérifier les titres de page
echo -e "\n🏷️  Vérification des titres de page..."
pages_without_title=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    if grep -q "Helmet" "$file"; then
      if ! grep -q "<title>" "$file"; then
        echo -e "${RED}❌ $(basename $file) - Pas de balise title${NC}"
        pages_without_title=$((pages_without_title + 1))
      else
        # Vérifier la longueur du titre
        title=$(grep "<title>" "$file" | sed 's/.*<title>\(.*\)<\/title>.*/\1/')
        title_length=${#title}
        
        if [ $title_length -gt 60 ]; then
          echo -e "${YELLOW}⚠️  $(basename $file) - Titre trop long ($title_length caractères)${NC}"
        fi
      fi
    fi
  fi
done

total_issues=$((total_issues + pages_without_title))

# 3. Vérifier les canonical URLs
echo -e "\n🔗 Vérification des URLs canoniques..."
pages_without_canonical=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    if grep -q "Helmet" "$file"; then
      if ! grep -q "rel=\"canonical\"" "$file"; then
        echo -e "${YELLOW}⚠️  $(basename $file) - Pas d'URL canonique${NC}"
        pages_without_canonical=$((pages_without_canonical + 1))
      fi
    fi
  fi
done

# 4. Vérifier les Open Graph tags
echo -e "\n🌐 Vérification des Open Graph tags..."
pages_with_og=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    if grep -q "meta property=\"og:" "$file"; then
      pages_with_og=$((pages_with_og + 1))
    fi
  fi
done

echo -e "${GREEN}✅ $pages_with_og pages avec Open Graph tags${NC}"

# 5. Vérifier la structure sémantique (headings)
echo -e "\n📑 Vérification de la structure des headings..."

# Vérifier qu'il n'y a qu'un seul H1 par page
files_with_multiple_h1=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    h1_count=$(grep -o "<h1\|<H1" "$file" | wc -l)
    if [ $h1_count -gt 1 ]; then
      echo -e "${YELLOW}⚠️  $(basename $file) - Multiple H1 détectés ($h1_count)${NC}"
      files_with_multiple_h1=$((files_with_multiple_h1 + 1))
    fi
  fi
done

# 6. Vérifier les keywords meta
echo -e "\n🔑 Vérification des meta keywords..."
pages_with_keywords=0

for file in src/pages/*.tsx; do
  if [ -f "$file" ]; then
    if grep -q "meta name=\"keywords\"" "$file"; then
      pages_with_keywords=$((pages_with_keywords + 1))
    fi
  fi
done

echo -e "${GREEN}✅ $pages_with_keywords pages avec meta keywords${NC}"

# 7. Vérifier le sitemap.xml et robots.txt
echo -e "\n🗺️  Vérification des fichiers SEO essentiels..."

if [ -f "public/sitemap.xml" ]; then
  echo -e "${GREEN}✅ sitemap.xml présent${NC}"
else
  echo -e "${RED}❌ sitemap.xml manquant${NC}"
  total_issues=$((total_issues + 1))
fi

if [ -f "public/robots.txt" ]; then
  echo -e "${GREEN}✅ robots.txt présent${NC}"
else
  echo -e "${YELLOW}⚠️  robots.txt manquant${NC}"
fi

# Résumé final
echo -e "\n=========================================="
echo -e "📊 RÉSUMÉ SEO"
echo -e "=========================================="
echo -e "Pages sans description: $pages_without_description"
echo -e "Pages sans titre: $pages_without_title"
echo -e "Pages sans canonical: $pages_without_canonical"
echo -e "Pages avec Open Graph: $pages_with_og"
echo -e "Pages avec keywords: $pages_with_keywords"
echo -e "Pages avec multiple H1: $files_with_multiple_h1"

if [ $total_issues -eq 0 ]; then
  echo -e "\n${GREEN}✅ Bon niveau de SEO !${NC}"
  exit 0
else
  echo -e "\n${YELLOW}⚠️  $total_issues problèmes SEO à corriger${NC}"
  echo -e "\nConsultez docs/AUDIT_CORRECTIONS.md pour les solutions"
  exit 1
fi
