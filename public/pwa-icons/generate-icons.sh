#!/bin/bash

# Script pour générer les icônes PWA à partir d'une icône source
# Usage: ./generate-icons.sh icon-source.png

if [ $# -eq 0 ]; then
    echo "❌ Erreur: Veuillez fournir un fichier source"
    echo "Usage: ./generate-icons.sh icon-source.png"
    exit 1
fi

SOURCE=$1

if [ ! -f "$SOURCE" ]; then
    echo "❌ Erreur: Fichier source '$SOURCE' introuvable"
    exit 1
fi

echo "🎨 Génération des icônes PWA..."
echo ""

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick n'est pas installé"
    echo "Installation:"
    echo "  • Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  • macOS: brew install imagemagick"
    echo "  • Windows: https://imagemagick.org/script/download.php"
    exit 1
fi

# Créer les dossiers si nécessaire
mkdir -p ../

# Générer les icônes
echo "📱 Génération pwa-192x192.png..."
convert "$SOURCE" -resize 192x192 ../pwa-192x192.png

echo "📱 Génération pwa-512x512.png..."
convert "$SOURCE" -resize 512x512 ../pwa-512x512.png

echo "🍎 Génération apple-touch-icon.png..."
convert "$SOURCE" -resize 180x180 ../apple-touch-icon.png

echo "🌐 Génération favicon.ico..."
convert "$SOURCE" -resize 32x32 ../favicon.ico

echo "🎭 Génération mask-icon.svg..."
# Pour le SVG, on garde juste une copie du fichier original si c'est un SVG
if [[ "$SOURCE" == *.svg ]]; then
    cp "$SOURCE" ../mask-icon.svg
else
    echo "⚠️  Conversion SVG non supportée, utilisez un fichier SVG pour mask-icon.svg"
fi

echo ""
echo "✅ Icônes générées avec succès!"
echo ""
echo "📋 Fichiers créés:"
echo "  • pwa-192x192.png (192x192)"
echo "  • pwa-512x512.png (512x512)"
echo "  • apple-touch-icon.png (180x180)"
echo "  • favicon.ico (32x32)"
echo ""
