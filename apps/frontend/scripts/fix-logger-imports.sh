#!/bin/bash

# Script pour corriger les imports logger mal placés

# Trouver tous les fichiers avec le pattern problématique
grep -rl "import {\$" src/ | while read file; do
  # Vérifier si le fichier contient le pattern exact
  if grep -q "import {\$" "$file"; then
    # Afficher le fichier
    echo "Fixing: $file"

    # Fix: déplacer l'import logger avant le import {
    sed -i '/import {$/i\
import logger from '"'"'@/lib/logger'"'"';' "$file"

    # Supprimer la ligne dupliquée
    sed -i '/^import logger from/!b;N;/\nimport logger from/D' "$file"
  fi
done

echo "Done fixing imports"
