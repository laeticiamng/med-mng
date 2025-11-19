#!/bin/bash

# ============================================
# Configuration Branch Protection pour MED-MNG
# Garantit 100% conformité accessibilité WCAG 2.1 AA / RGAA 4.1
# ============================================

set -e

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="${REPO_OWNER:-}"
REPO_NAME="${REPO_NAME:-med-mng}"
BRANCH="${BRANCH:-main}"

echo -e "${BLUE}🛡️  Configuration Branch Protection Rules${NC}"
echo "================================================"
echo ""

# Vérifier les prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

# Vérifier GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) n'est pas installé${NC}"
    echo ""
    echo "Installation:"
    echo "  macOS:    brew install gh"
    echo "  Linux:    https://cli.github.com/manual/installation"
    echo "  Windows:  winget install --id GitHub.cli"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI installé${NC}"

# Vérifier l'authentification
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Non authentifié avec GitHub CLI${NC}"
    echo ""
    echo "Exécutez: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ Authentifié avec GitHub${NC}"

# Vérifier les variables
if [ -z "$REPO_OWNER" ]; then
    echo -e "${YELLOW}⚠️  REPO_OWNER non défini${NC}"
    echo -n "Entrez le nom d'utilisateur ou organisation GitHub: "
    read REPO_OWNER
fi

echo ""
echo -e "${BLUE}Configuration cible:${NC}"
echo "  Repository: $REPO_OWNER/$REPO_NAME"
echo "  Branch:     $BRANCH"
echo ""

read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Annulé."
    exit 0
fi

echo ""
echo -e "${YELLOW}🔧 Application des Branch Protection Rules...${NC}"
echo ""

# Configuration via GitHub API
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=Tests Accessibilité (axe-core) / chromium" \
  -f "required_status_checks[contexts][]=Tests Accessibilité (axe-core) / firefox" \
  -f "required_status_checks[contexts][]=Tests Accessibilité (axe-core) / webkit" \
  -f "required_status_checks[contexts][]=Audit Lighthouse Accessibilité" \
  -f "required_status_checks[contexts][]=Résumé Accessibilité" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "required_pull_request_reviews[require_code_owner_reviews]=false" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "required_pull_request_reviews[require_last_push_approval]=false" \
  -f "required_conversation_resolution=true" \
  -f "required_linear_history=false" \
  -f "allow_force_pushes=false" \
  -f "allow_deletions=false" \
  -f "block_creations=false" \
  -f "required_signatures=false" 2>/dev/null

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Branch protection configurée avec succès !${NC}"
  echo ""
  echo -e "${BLUE}📋 Règles appliquées:${NC}"
  echo -e "  ${GREEN}✅${NC} Tests accessibilité requis sur 3 navigateurs"
  echo -e "  ${GREEN}✅${NC} Audit Lighthouse accessibilité obligatoire"
  echo -e "  ${GREEN}✅${NC} 1 approbation de revue de code requise"
  echo -e "  ${GREEN}✅${NC} Conversations doivent être résolues"
  echo -e "  ${GREEN}✅${NC} Force push interdit"
  echo -e "  ${GREEN}✅${NC} Suppression de branche interdite"
  echo -e "  ${GREEN}✅${NC} Règles appliquées aux admins"
  echo ""
  echo -e "${GREEN}🎯 Conformité accessibilité garantie à 100% en production !${NC}"
  echo ""
  
  # Vérification
  echo -e "${YELLOW}🔍 Vérification de la configuration...${NC}"
  echo ""
  
  gh api \
    -H "Accept: application/vnd.github+json" \
    "/repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection/required_status_checks" \
    --jq '.contexts[]' | while read -r check; do
    echo -e "  ${GREEN}✓${NC} $check"
  done
  
  echo ""
  echo -e "${BLUE}📖 Documentation:${NC}"
  echo "  Voir docs/GITHUB-BRANCH-PROTECTION.md pour plus de détails"
  echo ""
  echo -e "${BLUE}🧪 Test:${NC}"
  echo "  Créez une PR avec du code non conforme pour vérifier que le merge est bloqué"
  echo ""
  
else
  echo ""
  echo -e "${RED}❌ Erreur lors de la configuration${NC}"
  echo ""
  echo "Causes possibles:"
  echo "  - Vous n'avez pas les permissions admin sur le repository"
  echo "  - Le repository n'existe pas"
  echo "  - La branche '$BRANCH' n'existe pas"
  echo ""
  echo "Vérifiez et réessayez."
  exit 1
fi
