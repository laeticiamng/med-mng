# 🎯 Scripts d'Extraction OIC UNESS

Ce dossier contient les scripts optimisés pour l'extraction des compétences OIC depuis l'API MediaWiki de LiSA UNESS.

## 📁 Structure

```
oic-scripts/
├── extract-oic-competences.cjs   # Script principal d'extraction Node.js
├── diagnostic-api-uness.sh       # Script de diagnostic API
├── package.json                  # Dépendances Node.js
├── .cache/                       # Cache des cookies CAS
└── extraction-*.json             # Rapports d'extraction générés
```

## 🚀 Utilisation

### 1. Installation des dépendances

```bash
cd oic-scripts/
npm install
```

### 2. Configuration

Créer un fichier `.env` :

```bash
SUPABASE_SERVICE_ROLE_KEY=<votre_clé_service_role>
CAS_USERNAME=<username_cas>
CAS_PASSWORD=<password_cas>
```

### 3. Exécution

#### Extraction complète
```bash
node extract-oic-competences.cjs
```

#### Mode complétion uniquement
```bash
FORCE_UPDATE=false node extract-oic-competences.cjs
```

#### Mode force update (re-extraction complète)
```bash
FORCE_UPDATE=true node extract-oic-competences.cjs
```

#### Diagnostic API
```bash
./diagnostic-api-uness.sh
```

## 🔧 Scripts disponibles

### `extract-oic-competences.cjs`

Script principal qui :
- Authentifie automatiquement via CAS avec Puppeteer
- Extrait toutes les compétences OIC depuis l'API MediaWiki
- Parse et structure les données (objectif_id, intitulé, description, etc.)
- Sauvegarde dans la table `backup_oic_competences` de Supabase
- Génère un rapport détaillé de l'extraction

**Fonctionnalités :**
- Authentification CAS automatique avec cache de cookies
- Extraction par batches avec retry automatique
- Parsing robuste avec multiple patterns de fallback
- Gestion des doublons et mise à jour incrémentale
- Rapports détaillés JSON avec statistiques

### `diagnostic-api-uness.sh`

Script de diagnostic qui :
- Teste l'accessibilité de l'API MediaWiki
- Vérifie les endpoints critiques
- Valide les réponses API
- Génère un rapport de santé de l'API

## 📊 Rapports générés

### Rapport d'extraction (`extraction-YYYY-MM-DD-HH-mm.json`)

```json
{
  "timestamp": "2025-01-07T15:30:00.000Z",
  "mode": "completion",
  "status": "success",
  "auth": {
    "method": "cas_cookies",
    "login_time": "2025-01-07T15:25:12.000Z"
  },
  "extraction": {
    "total_pages_found": 4253,
    "total_processed": 4253,
    "total_success": 4180,
    "total_errors": 73,
    "success_rate": "98.3%"
  },
  "database": {
    "total_inserted": 3847,
    "total_updated": 333,
    "total_errors": 73
  },
  "performance": {
    "duration_minutes": 8.5,
    "pages_per_minute": 500,
    "average_batch_time": "2.3s"
  },
  "errors": [
    {
      "page_id": "12345",
      "title": "OIC-001-01-A-01",
      "error": "Parse error: invalid format",
      "timestamp": "2025-01-07T15:28:15.000Z"
    }
  ]
}
```

## 🔄 Intégration GitHub Actions

Les scripts s'intègrent avec les workflows GitHub Actions :

### `.github/workflows/extract-oic-completion.yml`
- Extraction automatique tous les dimanches à 2h00
- Déclenchement manuel possible
- Upload automatique des rapports comme artifacts

### Secrets requis
- `SUPABASE_SERVICE_ROLE_KEY`
- `CAS_USERNAME` 
- `CAS_PASSWORD`

## 🛠 Maintenance

### Mise à jour des patterns de parsing

Si le format des pages MediaWiki évolue, modifier les patterns dans `extract-oic-competences.cjs` :

```javascript
const intitulePatterns = [
  /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
  /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
  // Ajouter nouveaux patterns ici
];
```

### Gestion des erreurs

Les erreurs sont loggées dans :
- Console (temps réel)
- Fichier de rapport JSON
- Supabase logs (via edge functions)

### Cache des cookies CAS

Le cache des cookies est stocké dans `.cache/cas-cookies.json` pour éviter les re-authentifications fréquentes.

**Durée de vie :** 1 heure  
**Nettoyage :** Automatique à chaque exécution

## 📞 Support

- **GitHub Issues** : Pour signaler des bugs ou demander des fonctionnalités
- **Documentation** : `README-OIC-EXTRACTION.md` pour les détails techniques
- **Logs** : Consultez les artifacts GitHub Actions pour les rapports détaillés