# 🎫 TICKET - Problème Extraction OIC : Récupération OK mais Insertion Bloquée

## 🚨 Problème Principal
- **Base de données** : `oic_competences` reste à **0 entrées** malgré extraction active
- **API MediaWiki** : Récupération des données fonctionne (4,872 compétences détectées)
- **Parsing** : Semble OK (JSON généré avec objectif_id, intitule, etc.)
- **Insertion Supabase** : **BLOQUÉE** - aucune donnée n'entre en base

## 📋 État Actuel

### ✅ Fonctionnel
- Scripts de diagnostic créés et déployés
- Edge Functions opérationnelles :
  - `test-oic-curl` : Test API MediaWiki
  - `generate-cas-cookie` : Authentification CAS
  - `test-batch-50` : Test lot 50 pages
  - `test-extraction-sample` : Test end-to-end
- Extraction principale : `extract-edn-objectifs`
- Cron désactivé (comme demandé)

### ❌ Problématique
```sql
SELECT count(*) FROM oic_competences;
-- Résultat : 0 (attendu : 4,872)
```

## 🔍 Diagnostics Disponibles

### Scripts de test créés :
1. **`test-insertion-unitaire.js`** - Test insertion d'un échantillon
2. **`immediate-diagnostic-test.js`** - Test complet 3 étapes
3. **Edge Function `test-extraction-sample`** - Test end-to-end avec logs détaillés

### Logs attendus mais manquants :
- `SAMPLE ➜ {...}` (structure des données parsées)
- `INSERT_ERR` (erreurs d'insertion Supabase)
- Résultat du `count(*)` après batch test

## 🎯 Hypothèses du Problème

### 1. **Problème de Parsing**
```javascript
// Possible cause : extraction objectif_id échoue
const match = title.match(/OIC-(\d{3})-(\d{2})-([AB])-(\d{2})/);
if (!match) return null; // ← Peut-être que le format ne match pas
```

### 2. **Problème RLS Supabase**
```sql
-- Table oic_competences peut avoir des policies restrictives
-- ou permissions insuffisantes pour l'insertion
```

### 3. **Problème de Structure de Données**
```javascript
// L'objet généré ne correspond pas au schéma attendu
const competence = {
  objectif_id,    // ← Peut être undefined
  intitule,       // ← Peut être undefined  
  // ... autres champs manquants ?
};
```

## 🔧 Actions de Debug Nécessaires

### Étape 1: Vérifier la récupération
```bash
# Tester via Edge Function
curl -X POST "https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/test-extraction-sample" \
  -H "Authorization: Bearer [anon-key]"
```

### Étape 2: Tester insertion unitaire
```sql
-- Tester manuellement l'insertion avec données sample
INSERT INTO oic_competences (objectif_id, intitule, item_parent, rang, rubrique) 
VALUES ('OIC-001-23-A-01', 'Test', '001', 'A', 'Test');
```

### Étape 3: Vérifier permissions
```sql
-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'oic_competences';
```

## 📊 Structure de la Table
```sql
CREATE TABLE oic_competences (
  objectif_id TEXT PRIMARY KEY,
  intitule TEXT NOT NULL,
  item_parent TEXT,
  rang TEXT,
  rubrique TEXT,
  description TEXT,
  ordre INTEGER,
  url_source TEXT,
  hash_content TEXT,
  date_import TIMESTAMP,
  extraction_status TEXT
);
```

## 🎯 Objectif Immédiat
1. **Prouver** qu'on récupère des données valides (JSON non vide)
2. **Identifier** pourquoi l'insertion échoue
3. **Corriger** le problème d'insertion
4. **Valider** avec `count(*) >= 50` sur un batch test
5. **Lancer** l'extraction complète pour atteindre 4,872 entrées

## 🚫 Contraintes
- **Pas de cron** tant que `count(*) < 50`
- **Tests obligatoires** avant extraction complète
- **Logs détaillés** requis pour debug

## 🔗 Ressources
- **Projet Supabase** : `1b544bf9-a0a9-40d7-aa20-d14835dcd1a3`
- **Edge Functions** : `supabase/functions/`
- **Parser OIC** : `supabase/functions/extract-edn-objectifs/oic-parser.ts`
- **Table concernée** : `public.oic_competences`

---

**Urgent** : Besoin d'identifier si c'est un problème de parsing, de permissions Supabase, ou de structure de données.