#!/bin/bash

# Script de migration automatique des couleurs hardcodées
# Usage: ./scripts/run-migration.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   MIGRATION AUTOMATIQUE DES COULEURS HARDCODÉES            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

# Vérifier que le script existe
if [ ! -f "scripts/migrate-colors.js" ]; then
    echo -e "${RED}❌ Le script migrate-colors.js n'existe pas${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Étape 1: Analyse du projet (statistiques)${NC}"
echo "─────────────────────────────────────────────────────────────"
node scripts/migrate-colors.js --stats
echo ""

echo -e "${YELLOW}⏸️  Pause - Consultez les statistiques ci-dessus${NC}"
echo ""
read -p "Continuer avec le dry-run? (o/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo -e "${YELLOW}⏹️  Migration annulée${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔍 Étape 2: Dry-run (prévisualisation des changements)${NC}"
echo "─────────────────────────────────────────────────────────────"
node scripts/migrate-colors.js --dry-run
echo ""

echo -e "${YELLOW}⏸️  Pause - Vérifiez les changements proposés ci-dessus${NC}"
echo ""
read -p "Appliquer ces changements? (o/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo -e "${YELLOW}⏹️  Migration annulée${NC}"
    exit 0
fi

# Créer une branche de sauvegarde
CURRENT_BRANCH=$(git branch --show-current)
BACKUP_BRANCH="backup-before-color-migration-$(date +%Y%m%d-%H%M%S)"

echo ""
echo -e "${BLUE}💾 Création d'une branche de sauvegarde: ${BACKUP_BRANCH}${NC}"
git branch $BACKUP_BRANCH

echo ""
echo -e "${BLUE}🚀 Étape 3: Application de la migration${NC}"
echo "─────────────────────────────────────────────────────────────"
node scripts/migrate-colors.js
echo ""

echo -e "${GREEN}✅ Migration terminée avec succès!${NC}"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier les changements: git status"
echo "   2. Tester visuellement l'application (light + dark mode)"
echo "   3. Exécuter les tests: npm test"
echo "   4. Commit les changements: git add . && git commit -m 'chore: migrate hardcoded colors to semantic tokens'"
echo ""
echo "💡 En cas de problème:"
echo "   - Revenir à l'état précédent: git checkout ${BACKUP_BRANCH}"
echo "   - Supprimer la branche de backup: git branch -D ${BACKUP_BRANCH}"
echo ""
