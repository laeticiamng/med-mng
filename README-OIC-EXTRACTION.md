# 🎯 Extraction des Compétences OIC UNESS

Scripts d'extraction optimisés des compétences OIC depuis l'API MediaWiki de LiSA UNESS avec authentification CAS automatique.

## 🚀 Setup

### 1. Variables d'environnement

Créer un fichier `.env` dans le dossier `oic-scripts/` :

```bash
# Supabase
SUPABASE_SERVICE_ROLE_KEY=<votre_clé_service_role>

# Authentification CAS UNESS (pour GitHub Actions)
CAS_USERNAME=<votre_username_cas>
CAS_PASSWORD=<votre_password_cas>
```

### 2. Installation des dépendances

```bash
cd oic-scripts/
npm install
```

## 🎯 Utilisation

### Extraction complète via GitHub Actions

L'extraction s'effectue automatiquement via GitHub Actions :

- **Manuel** : Workflow `extract-oic-completion.yml` 
- **Automatique** : Tous les dimanches à 2h00

### Extraction locale

```bash
cd oic-scripts/
node extract-oic-competences.cjs
```

### Via diagnostic API

```bash
./diagnostic-api-uness.sh
```

## 🔧 Architecture technique

### Flux d'extraction optimisé

1. **Authentification CAS** : Login automatique via Puppeteer avec les credentials GitHub Secrets
2. **Test d'accès API** : Vérification de l'accessibilité de l'API MediaWiki avec authentification
3. **Listing des pages** : Récupération complète via `action=query&list=categorymembers`
4. **Extraction par batches** : Téléchargement du contenu par paquets de 50 pages maximum
5. **Parsing intelligent** : Extraction des métadonnées avec patterns robustes
6. **Sauvegarde Supabase** : Insertion dans `backup_oic_competences` avec gestion des doublons
7. **Rapport détaillé** : Génération automatique de statistiques et logs

### Endpoints utilisés

```http
# Authentification CAS
POST https://cas.uness.fr/login

# Listing des pages de catégorie OIC
GET /lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json

# Contenu des pages (batches de 50)
GET /lisa/2025/api.php?action=query&prop=revisions&rvprop=content&pageids=123|456|789&format=json
```

### Parsing des données

**Format identifiant :** `OIC-XXX-YY-R-ZZ`
- `XXX` : Item parent (001-367)
- `YY` : Code rubrique (01-11)
- `R` : Rang (A ou B) 
- `ZZ` : Ordre (01-99)

**Champs extraits :**
- Intitulé : Pattern `|intitulé=...` ou titre de page
- Description : Pattern `|description=...` ou premier paragraphe
- Rubrique : Mapping du code YY vers nom complet
- URL source : Reconstituée depuis le titre

## 📊 Schéma de données

### Table `backup_oic_competences`

```sql
CREATE TABLE backup_oic_competences (
  objectif_id TEXT,                       -- OIC-099-01-A-01
  intitule TEXT,                          -- Titre de la compétence
  item_parent TEXT,                       -- IC-099 (item EDN parent)
  rang TEXT,                              -- A ou B (niveau de compétence)
  rubrique TEXT,                          -- Génétique, Immunopathologie, etc.
  description TEXT,                       -- Description détaillée extraite
  ordre INTEGER,                          -- Ordre dans le rang (01-99)
  url_source TEXT,                        -- URL source de la page
  raw_json JSONB,                         -- Contenu brut MediaWiki
  hash_content TEXT,                      -- Hash du contenu pour déduplication
  date_import TIMESTAMP,                  -- Date d'extraction
  extraction_status TEXT,                 -- complete, partial, error
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Rubriques supportées

- `01` : Génétique
- `02` : Immunopathologie  
- `03` : Inflammation
- `04` : Cancérologie
- `05` : Pharmacologie
- `06` : Douleur
- `07` : Santé publique
- `08` : Thérapeutique
- `09` : Urgences
- `10` : Vieillissement
- `11` : Interprétation

## 📈 Rapport de complétude

Le script génère automatiquement un rapport JSON détaillé :

```json
{
  "summary": {
    "total_expected": 4872,
    "total_extracted": 4845,
    "completeness_pct": "99.45",
    "items_covered": 365,
    "items_missing": 2
  },
  "by_item": [
    {
      "item_parent": "001",
      "rang_a_count": 12,
      "rang_b_count": 8,
      "total_count": 20
    }
  ],
  "missing_items": ["042", "156"],
  "generated_at": "2025-01-07T10:30:00.000Z"
}
```

## 🔍 Debugging

### Logs détaillés

Le script affiche des logs complets :

```
🚀 EXTRACTION API-FIRST DES 4,872 OBJECTIFS EDN
===============================================
🔍 Test d'accès public à l'API MediaWiki...
✅ API MediaWiki publique accessible!
📋 Récupération des IDs de pages de la catégorie...
   → 4872 pages OIC trouvées...
✅ 4872 pages OIC listées au total
🔄 Traitement par batches de 50 pages...
📦 Batch 1/98 - Pages 1 à 50
   ✅ 47/50 compétences insérées (3 erreurs)
```

### En cas d'erreur

1. **API inaccessible** : Vérifier la connexion réseau et les credentials CAS
2. **Parsing échoué** : Examiner le champ `raw_json` en base pour le format réel
3. **Insertion Supabase** : Vérifier les contraintes de la table et les permissions RLS

### Reprise d'extraction

Pour reprendre une extraction interrompue :

```bash
# Supprimer les données partielles
DELETE FROM oic_competences WHERE date_import > '2025-01-07 10:00:00';

# Relancer l'extraction
deno run --allow-net --allow-env --allow-write src/scripts/scrape_oic.ts
```

## ⚡ Performance

### Métriques de performance

- **Durée totale** : 5-10 minutes pour extraction complète
- **Pages traitées** : ~4,000+ compétences OIC attendues
- **Authentification** : Automatique via Puppeteer + CAS
- **Taux de réussite** : > 95% avec gestion d'erreurs robuste
- **Format de sortie** : JSON structuré + rapports détaillés

### Optimisations

- Authentification CAS persistante avec cookies
- Traitement par batches de 50 pages (limite MediaWiki API)
- Gestion des timeouts et retry automatique
- Parsing robuste avec multiple patterns fallback
- Sauvegarde incrémentale avec détection des doublons
- Rapports détaillés pour monitoring et debug

## 🛠 Maintenance

### Mise à jour du parsing

Si le format des pages MediaWiki évolue, ajuster les regex dans `parseOICPage()` :

```typescript
const intitulePatterns = [
  /\|\s*[Ii]ntitulé\s*=\s*([^\n\|]+)/,
  /\|\s*[Tt]itre\s*=\s*([^\n\|]+)/,
  // Ajouter nouveaux patterns ici
];
```

### Ajout de nouvelles rubriques

Compléter le mapping `RUBRIQUES_MAP` :

```typescript
const RUBRIQUES_MAP: Record<string, string> = {
  '12': 'Nouvelle rubrique',
  // etc.
};
```

### Monitoring

Surveiller les métriques d'extraction :

- Taux de complétude par item EDN
- Évolution du nombre total de pages
- Fréquence des échecs de parsing

## 📞 Support

Pour toute question ou problème :

- Slack : @laeticia
- GitHub : Issues sur le repo du projet
- WhatsApp : Contact direct