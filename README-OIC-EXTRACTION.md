# 🎫 TICKET 4-bis — Extraction API-first des 4,872 objectifs EDN

Script d'extraction optimisé des compétences OIC depuis l'API MediaWiki de LiSA UNESS.

## 🚀 Setup

### 1. Variables d'environnement

Créer un fichier `.env` :

```bash
# Authentification CAS UNESS
CAS_USER=votre-email@etud.institution.fr
CAS_PASS=votre-mot-de-passe-securise

# Supabase
SUPABASE_URL=https://yaincoxihiqdksxgrsrk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<votre_clé_service_role>
```

### 2. Installation des dépendances

```bash
npm install @supabase/supabase-js puppeteer dotenv
# ou
deno cache --reload src/scripts/scrape_oic.ts
```

## 🎯 Utilisation

### Extraction complète

```bash
# Node.js
node src/scripts/scrape_oic.ts

# Deno  
deno run --allow-net --allow-env --allow-write src/scripts/scrape_oic.ts
```

### Via l'interface web

1. Aller sur `/admin/extract-objectifs`
2. Cliquer sur "Démarrer l'extraction"
3. Suivre le progrès en temps réel

## 🔧 Architecture technique

### Flux d'extraction

1. **Test API publique** : Vérification si `api.php` est accessible sans authentification
2. **Authentification CAS** : Si nécessaire, login via Puppeteer minimal pour récupérer les cookies
3. **Listing des pages** : Récupération des 4,872 IDs via `action=query&list=categorymembers`
4. **Extraction par batches** : Téléchargement du contenu par paquets de 50 pages
5. **Parsing** : Extraction des métadonnées (identifiant, intitulé, rubrique, etc.)
6. **Insertion Supabase** : Sauvegarde avec gestion des doublons
7. **Rapport de complétude** : Analyse des items manquants/incomplets

### Endpoints utilisés

```http
# Listing des pages de catégorie
GET /lisa/2025/api.php?action=query&list=categorymembers&cmtitle=Catégorie:Objectif_de_connaissance&cmlimit=500&format=json

# Contenu des pages (50 max par requête)
GET /lisa/2025/api.php?action=query&prop=revisions&rvprop=content|timestamp&pageids=123|456|789&format=json&formatversion=2
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

### Table `oic_competences`

```sql
CREATE TABLE oic_competences (
  objectif_id TEXT PRIMARY KEY,           -- OIC-099-01-A-01
  intitule TEXT NOT NULL,                 -- Titre de la compétence
  item_parent TEXT NOT NULL,              -- 099 (item EDN)
  rang TEXT CHECK (rang IN ('A', 'B')),  -- Niveau de compétence
  rubrique TEXT,                          -- Génétique, Cancérologie, etc.
  description TEXT,                       -- Description détaillée
  ordre INTEGER,                          -- 01 (ordre dans le rang)
  url_source TEXT UNIQUE,                 -- URL de la page source
  raw_json JSONB,                         -- Contenu brut pour debug
  date_import TIMESTAMP DEFAULT NOW(),    -- Date d'extraction
  hash_content TEXT,                      -- Hash pour détecter doublons
  extraction_status TEXT DEFAULT 'complete'
);
```

### Index de performance

```sql
CREATE INDEX idx_oic_item_parent ON oic_competences(item_parent);
CREATE INDEX idx_oic_rang ON oic_competences(rang);
CREATE INDEX idx_oic_rubrique ON oic_competences(rubrique);
CREATE INDEX idx_oic_date_import ON oic_competences(date_import);
```

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

### Métriques attendues

- **Durée totale** : 3-5 minutes pour 4,872 pages
- **Mémoire** : < 100MB (pas de navigateur headless sauf auth CAS)
- **Requêtes réseau** : ~100 requêtes API (vs 4,872 avec Puppeteer)
- **Taux de réussite** : > 99% avec gestion d'erreurs robuste

### Optimisations

- Traitement par batches de 50 pages (limite MediaWiki)
- Pause de 1s entre batches pour éviter le rate limiting
- Upsert Supabase avec gestion des doublons
- Authentification CAS minimaliste (Puppeteer uniquement si nécessaire)

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