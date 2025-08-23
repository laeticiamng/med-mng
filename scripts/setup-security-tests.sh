#!/bin/bash

# Script d'installation et configuration des tests de sécurité

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Configuration des tests de sécurité...${NC}"

# Rendre le script de test exécutable
if [[ -f "scripts/test-security.sh" ]]; then
    chmod +x scripts/test-security.sh
    echo -e "${GREEN}✅ Script test-security.sh rendu exécutable${NC}"
else
    echo -e "${YELLOW}⚠️  Script test-security.sh introuvable${NC}"
fi

# Vérifier la configuration Vitest
if [[ -f "vitest.config.ts" ]]; then
    echo -e "${GREEN}✅ Configuration Vitest principale trouvée${NC}"
else
    echo -e "${YELLOW}⚠️  vitest.config.ts introuvable${NC}"
fi

# Vérifier la configuration spécialisée
if [[ -f "vitest.security.config.ts" ]]; then
    echo -e "${GREEN}✅ Configuration Vitest pour la sécurité créée${NC}"
fi

# Créer le dossier de couverture s'il n'existe pas
if [[ ! -d "coverage" ]]; then
    mkdir -p coverage
    echo -e "${GREEN}✅ Dossier coverage créé${NC}"
fi

# Vérifier les fichiers de test
echo -e "${BLUE}🔍 Vérification des fichiers de test...${NC}"

if [[ -f "tests/security/securityMiddleware.test.ts" ]]; then
    echo -e "${GREEN}✅ Tests du middleware de sécurité présents${NC}"
fi

if [[ -f "tests/security/rateLimitService.test.ts" ]]; then
    echo -e "${GREEN}✅ Tests du service de rate limiting présents${NC}"
fi

if [[ -f "tests/security/README.md" ]]; then
    echo -e "${GREEN}✅ Documentation des tests présente${NC}"
fi

# Créer des alias pratiques
echo -e "${BLUE}📋 Création des commandes pratiques...${NC}"

cat > .security-test-aliases << 'EOF'
# Aliases pour les tests de sécurité
# Source: source .security-test-aliases

alias test-security='./scripts/test-security.sh --all'
alias test-security-middleware='./scripts/test-security.sh --middleware'
alias test-security-ratelimit='./scripts/test-security.sh --ratelimit'
alias test-security-coverage='./scripts/test-security.sh --all --coverage'
alias test-security-watch='./scripts/test-security.sh --all --watch'

# Tests avec configuration spécialisée
alias test-security-strict='npx vitest run --config vitest.security.config.ts'
alias test-security-strict-coverage='npx vitest run --config vitest.security.config.ts --coverage'

echo "🔒 Aliases de tests de sécurité chargés!"
EOF

echo -e "${GREEN}✅ Aliases créés dans .security-test-aliases${NC}"
echo -e "${YELLOW}💡 Pour charger les aliases: source .security-test-aliases${NC}"

# Valider l'environnement de test
echo -e "${BLUE}🧪 Validation de l'environnement de test...${NC}"

# Vérifier que Node.js est installé
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} installé${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js non trouvé${NC}"
fi

# Vérifier que npm est installé
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm ${NPM_VERSION} installé${NC}"
else
    echo -e "${YELLOW}⚠️  npm non trouvé${NC}"
fi

# Tester si vitest est disponible
if npx vitest --version &> /dev/null; then
    VITEST_VERSION=$(npx vitest --version)
    echo -e "${GREEN}✅ Vitest ${VITEST_VERSION} disponible${NC}"
else
    echo -e "${YELLOW}⚠️  Vitest non disponible - installer avec: npm install${NC}"
fi

# Test rapide
echo -e "${BLUE}🚀 Test rapide de validation...${NC}"

# Exécuter un test simple pour vérifier que tout fonctionne
if npx vitest run tests/security/ --reporter=basic --no-coverage 2>/dev/null; then
    echo -e "${GREEN}✅ Tests de sécurité fonctionnels!${NC}"
else
    echo -e "${YELLOW}⚠️  Erreur dans les tests - vérifier la configuration${NC}"
fi

echo ""
echo -e "${BLUE}🎉 Configuration des tests de sécurité terminée!${NC}"
echo ""
echo -e "${YELLOW}Commandes disponibles:${NC}"
echo "  ./scripts/test-security.sh --help     # Aide complète"
echo "  ./scripts/test-security.sh --all      # Tous les tests"
echo "  ./scripts/test-security.sh --coverage # Avec couverture"
echo "  source .security-test-aliases          # Charger les aliases"
echo ""
echo -e "${BLUE}Documentation complète: tests/security/README.md${NC}"