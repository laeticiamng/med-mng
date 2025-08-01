#!/bin/bash
# Déclenchement immédiat de l'extraction OIC autonome

echo "🚀 DÉCLENCHEMENT EXTRACTION OIC IMMÉDIATE"
echo "=========================================="
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trouvé"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules/@octokit" ]; then
    echo "📦 Installation des dépendances..."
    npm install @octokit/rest --save-dev
fi

# Exécuter le script de déclenchement
echo "⚡ Démarrage de l'extraction autonome..."
node scripts/trigger-immediate-extraction.js

echo ""
echo "✅ Script de déclenchement exécuté"
echo "📊 L'extraction se déroule maintenant en autonomie"
echo "🔗 Surveillez le progrès sur GitHub Actions"
echo "⏰ Durée estimée: 15-30 minutes pour 4,872 compétences"