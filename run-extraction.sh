#!/bin/bash
# 🚀 Script de lancement pour extract-oic-competences.cjs

echo "🚀 LANCEMENT EXTRACTION OIC AVEC VOTRE SCRIPT ÉPROUVÉ"
echo "===================================================="

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier que le script existe
if [ ! -f "extract-oic-competences.cjs" ]; then
    echo "❌ Le fichier extract-oic-competences.cjs n'existe pas"
    exit 1
fi

# Vérifier les variables d'environnement nécessaires
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️ SUPABASE_SERVICE_ROLE_KEY manquant, utilisation des valeurs par défaut"
fi

if [ -z "$CAS_USERNAME" ]; then
    echo "⚠️ CAS_USERNAME manquant, utilisation de laeticia.moto-ngane@etud.u-picardie.fr"
fi

if [ -z "$CAS_PASSWORD" ]; then
    echo "⚠️ CAS_PASSWORD manquant, utilisation du mot de passe par défaut"
fi

echo "🔧 Installation des dépendances si nécessaire..."
npm install puppeteer @supabase/supabase-js dotenv 2>/dev/null || true

echo "🚀 Lancement de l'extraction OIC..."
echo "📊 Extraction des 4,872 compétences OIC en cours..."

# Lancer le script avec gestion des erreurs
node extract-oic-competences.cjs

if [ $? -eq 0 ]; then
    echo "✅ Extraction terminée avec succès !"
    echo "📊 Vérifiez le rapport JSON généré"
else
    echo "❌ Erreur lors de l'extraction"
    exit 1
fi