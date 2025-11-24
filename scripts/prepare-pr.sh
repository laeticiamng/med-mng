#!/bin/bash
# Script de préparation pour la Pull Request
# Usage: ./scripts/prepare-pr.sh

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=================================="
echo "🚀 Préparation de la Pull Request"
echo "=================================="
echo ""

BRANCH_NAME="claude/complete-frontend-elements-01DmRiYUhvE26tAnk2vDeDxW"

# 1. Vérifier qu'on est sur la bonne branche
echo "1️⃣  Vérification de la branche..."
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo -e "${YELLOW}⚠${NC} Vous n'êtes pas sur la branche $BRANCH_NAME"
    echo "   Branche actuelle: $CURRENT_BRANCH"
    echo ""
    read -p "Voulez-vous checkout la bonne branche? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout "$BRANCH_NAME"
        echo -e "${GREEN}✓${NC} Changement de branche effectué"
    else
        echo -e "${RED}✗${NC} Opération annulée"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Vous êtes sur la bonne branche"
fi
echo ""

# 2. Vérifier qu'il n'y a pas de changements non committés
echo "2️⃣  Vérification des changements non committés..."
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓${NC} Pas de changements non committés"
else
    echo -e "${YELLOW}⚠${NC} Il y a des changements non committés:"
    git status --short
    echo ""
    read -p "Voulez-vous les committer maintenant? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Message de commit: " COMMIT_MSG
        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}✓${NC} Changements committés"
    else
        echo -e "${YELLOW}⚠${NC} Continuez avec des changements non committés"
    fi
fi
echo ""

# 3. Mettre à jour avec origin
echo "3️⃣  Mise à jour avec origin..."
git fetch origin
echo -e "${GREEN}✓${NC} Fetch effectué"
echo ""

# 4. Vérifier les différences avec main
echo "4️⃣  Comparaison avec main..."
COMMITS_AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")
echo "   Commits en avance sur main: $COMMITS_AHEAD"

FILES_CHANGED=$(git diff --stat origin/main...HEAD | tail -1)
echo "   $FILES_CHANGED"
echo ""

# 5. Valider les pages
echo "5️⃣  Validation des pages..."
if [ -f "./scripts/validate-pages.sh" ]; then
    ./scripts/validate-pages.sh
else
    echo -e "${YELLOW}⚠${NC} Script de validation non trouvé, skip"
fi
echo ""

# 6. Vérifier la documentation
echo "6️⃣  Vérification de la documentation..."
REQUIRED_DOCS=(
    "FRONTEND_COMPLETION_SUMMARY.md"
    "QUICK_START_GUIDE.md"
    "PR_TEMPLATE.md"
    "CREATE_PR.md"
)

ALL_DOCS_OK=true
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${RED}✗${NC} $doc manquant"
        ALL_DOCS_OK=false
    fi
done
echo ""

# 7. Résumé
echo "=================================="
echo "📊 Résumé"
echo "=================================="
echo ""
echo "Branche: $BRANCH_NAME"
echo "Commits: $COMMITS_AHEAD en avance sur main"
echo "Fichiers: $FILES_CHANGED"
echo "Documentation: $([ "$ALL_DOCS_OK" = true ] && echo -e "${GREEN}✓ Complète${NC}" || echo -e "${RED}✗ Incomplète${NC}")"
echo ""

# 8. Commandes suggérées
echo "=================================="
echo "🎯 Prochaines étapes"
echo "=================================="
echo ""
echo "Pour créer la PR via GitHub CLI:"
echo -e "${BLUE}gh pr create --title \"feat: Complete all missing frontend pages (8 pages)\" --body-file PR_TEMPLATE.md${NC}"
echo ""
echo "Ou manuellement sur GitHub:"
echo -e "${BLUE}https://github.com/laeticiamng/med-mng/compare/main...$BRANCH_NAME${NC}"
echo ""
echo "Pour pousser les derniers changements:"
echo -e "${BLUE}git push -u origin $BRANCH_NAME${NC}"
echo ""

if [ "$ALL_DOCS_OK" = true ] && [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ Tout est prêt pour la PR!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Quelques éléments nécessitent votre attention${NC}"
    exit 0
fi
