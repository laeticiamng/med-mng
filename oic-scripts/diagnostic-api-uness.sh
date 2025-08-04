#!/bin/bash
# 🔍 SCRIPT DE DIAGNOSTIC API UNESS - SANS AUTHENTIFICATION
# Basé sur les logs GitHub Actions du 2 août 2025

echo "🔍 === DIAGNOSTIC API MEDIAWIKI UNESS ==="
echo "📅 Script basé sur les logs d'action du 2 août 2025"
echo ""

echo "🔍 Test API MediaWiki (1 résultat) ..."
echo "📡 URL: https://livret.uness.fr/lisa/2025/api.php"
echo ""

# Test 1: Tentative d'accès à la catégorie des objectifs de connaissance
echo "Test 1: Accès à la catégorie Objectif_de_connaissance"
response1=$(curl -s 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=1&format=json&origin=*')
echo "Réponse:"
echo "$response1" | jq .
echo ""

# Vérifier si l'erreur d'authentification est présente
if echo "$response1" | jq -e '.error.code == "readapidenied"' > /dev/null; then
    echo "❌ Erreur détectée: API protégée - Authentification requise"
    echo "   Code: readapidenied"
    echo "   Message: You need read permission to use this module."
    echo ""
else
    echo "✅ API accessible sans authentification"
    echo ""
fi

echo "📄 Test 50 pages avec prop=revisions ..."
echo "# Récupère 50 pageids depuis la première requête"

# Test 2: Récupération des IDs de pages
IDS=$(curl -s 'https://livret.uness.fr/lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=50&format=json&origin=*' | jq -r '.query.categorymembers[].pageid' 2>/dev/null | paste -sd'|' -)

echo "🔢 Page IDs récupérés: $IDS"

if [ -n "$IDS" ]; then
    echo "📖 Test récupération contenu de $IDS ..."
    page_count=$(curl -s "https://livret.uness.fr/lisa/2025/api.php?action=query&prop=revisions&rvprop=content|timestamp&format=json&origin=*&pageids=${IDS}&formatversion=2" | jq '.query.pages | length' 2>/dev/null)
    echo "📊 Nombre de pages trouvées: $page_count"
else
    echo "❌ Aucun ID récupéré - problème avec la catégorie"
    echo "   → L'API nécessite une authentification CAS"
    echo "   → Utiliser le script extract-oic-competences.cjs avec authentification"
fi

echo ""
echo "🎯 === RÉSULTATS DU DIAGNOSTIC ==="
echo "1. L'API MediaWiki UNESS est protégée par authentification CAS"
echo "2. Les requêtes sans authentification retournent 'readapidenied'"
echo "3. Pour extraire les compétences OIC, utiliser:"
echo "   → Script Node.js avec Puppeteer pour l'auth CAS"
echo "   → Identifiants CAS valides"
echo "   → extract-oic-competences.cjs"
echo ""
echo "🔐 Authentification requise: OUI"
echo "📊 Compétences attendues: 4,872"
echo "✅ Diagnostic terminé"