#!/bin/bash

# Rendre tous les scripts exécutables

chmod +x scripts/test-security.sh
chmod +x scripts/setup-security-tests.sh
chmod +x scripts/make-executable.sh

echo "✅ Tous les scripts sont maintenant exécutables"
echo ""
echo "Pour configurer les tests de sécurité:"
echo "  ./scripts/setup-security-tests.sh"
echo ""  
echo "Pour lancer les tests de sécurité:"
echo "  ./scripts/test-security.sh --help"