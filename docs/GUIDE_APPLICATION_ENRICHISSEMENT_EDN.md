# Guide d'Application - Enrichissement EDN

## 🎯 Objectif

Appliquer l'enrichissement complet du système EDN comprenant :
- Vues matérialisées pour les statistiques
- Index optimisés pour les performances
- Fonctions d'enrichissement et d'analyse
- Contraintes de validation
- Triggers automatiques

---

## 🚀 Méthode 1 : Script Automatique (Recommandé)

### Prérequis
- Supabase CLI installé (`npm install -g supabase`)
- Projet Supabase lié (`supabase link`)

### Exécution

```bash
# Depuis la racine du projet
./scripts/apply-edn-enrichment.sh
```

Le script va automatiquement :
1. ✅ Appliquer la migration SQL
2. ✅ Vérifier les vues matérialisées
3. ✅ Enrichir tous les items
4. ✅ Rafraîchir les statistiques
5. ✅ Générer un rapport de qualité

**Durée estimée** : 2-5 minutes

---

## 📝 Méthode 2 : Application Manuelle via Dashboard

### Étape 1 : Appliquer la Migration SQL

1. Connectez-vous à votre [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet `med-mng`
3. Allez dans **SQL Editor**
4. Cliquez sur **New Query**
5. Copiez l'intégralité du fichier :
   ```
   supabase/migrations/20251114_edn_enrichment_complete.sql
   ```
6. Collez dans l'éditeur
7. Cliquez sur **Run**
8. Attendez la confirmation ✅

**Durée** : ~30 secondes

### Étape 2 : Enrichir Tous les Items

Dans le **SQL Editor**, exécutez :

```sql
-- Enrichir tous les items EDN
SELECT enrich_all_edn_items();
```

**Résultat attendu** :
```json
{
  "total_processed": 367,
  "total_enriched": 367,
  "success_rate": 100.00,
  "timestamp": "2025-11-14T..."
}
```

**Durée** : ~1 minute

### Étape 3 : Rafraîchir les Vues Matérialisées

```sql
-- Rafraîchir les statistiques globales
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_global_stats;

-- Rafraîchir les statistiques par spécialité
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_stats_by_specialite;

-- Vérifier les résultats
SELECT * FROM edn_global_stats;
```

**Durée** : ~10 secondes

### Étape 4 : Vérifier le Rapport de Qualité

```sql
-- Rapport global de qualité
SELECT jsonb_pretty(get_edn_quality_global_report());

-- Top 10 meilleurs items
SELECT item_code, title, completeness_score
FROM edn_items_complete
ORDER BY completeness_score DESC
LIMIT 10;

-- Top 10 items à améliorer
SELECT item_code, title, completeness_score
FROM edn_items_complete
ORDER BY completeness_score ASC
LIMIT 10;
```

---

## 🔧 Méthode 3 : Via Supabase CLI (Local)

### Configuration Initiale

```bash
# Démarrer Supabase en local (si pas déjà fait)
supabase start

# Appliquer toutes les migrations
supabase db push
```

### Enrichissement

```bash
# Exécuter l'enrichissement
supabase db execute "SELECT enrich_all_edn_items();"

# Rafraîchir les vues
supabase db execute "REFRESH MATERIALIZED VIEW edn_global_stats;"
supabase db execute "REFRESH MATERIALIZED VIEW edn_stats_by_specialite;"

# Vérifier les stats
supabase db execute "SELECT * FROM edn_global_stats;"
```

---

## ✅ Vérifications Post-Application

### 1. Vérifier les Vues Matérialisées

```sql
SELECT
    schemaname,
    matviewname,
    hasindexes
FROM pg_matviews
WHERE schemaname = 'public'
    AND matviewname LIKE 'edn%';
```

**Résultat attendu** : 2 vues matérialisées
- `edn_global_stats`
- `edn_stats_by_specialite`

### 2. Vérifier les Index

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'edn_items_complete'
ORDER BY indexname;
```

**Résultat attendu** : 18 index

### 3. Vérifier les Fonctions

```sql
SELECT
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname LIKE '%edn%'
    AND pronamespace = 'public'::regnamespace
ORDER BY proname;
```

**Résultat attendu** : 6 nouvelles fonctions
- `analyze_edn_item_quality`
- `enrich_all_edn_items`
- `enrich_edn_item_metadata`
- `get_edn_quality_global_report`
- `get_similar_edn_items`
- `search_edn_items`

### 4. Vérifier les Contraintes

```sql
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'edn_items_complete'::regclass
    AND contype = 'c'  -- CHECK constraints
ORDER BY conname;
```

**Résultat attendu** : 5 contraintes CHECK
- `check_completeness_score_range`
- `check_competences_counts_positive`
- `check_niveau_complexite_valid`
- `check_slug_format`
- `check_status_valid`

### 5. Vérifier les Triggers

```sql
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'edn_items_complete'
ORDER BY trigger_name;
```

**Résultat attendu** : 3 triggers
- `trigger_auto_calculate_completeness`
- `trigger_auto_update_competences_counts`
- `trigger_update_edn_items_complete_updated_at`

---

## 📊 Statistiques Attendues

Après l'application, vous devriez voir :

### Statistiques Globales

```sql
SELECT * FROM edn_global_stats;
```

Exemple de résultat :
```
total_items: 367
complete_items: ~250-300
incomplete_items: ~67-117
validated_items: ~200-250
avg_completeness: ~70-80
avg_competences_per_item: ~10-15
total_competences_rang_a: ~2,700
total_competences_rang_b: ~2,100
items_with_tableau_a: ~300
items_with_tableau_b: ~300
items_with_music: ~100-200
items_with_immersive: ~10-50
items_with_quiz: ~50-150
```

### Distribution de Qualité

```sql
SELECT jsonb_pretty(get_edn_quality_global_report());
```

Exemple :
```json
{
  "total_items": 367,
  "average_quality_score": 72.5,
  "quality_distribution": {
    "excellent": 45,      // score ≥ 90
    "tres_bon": 89,       // score 80-89
    "bon": 120,           // score 70-79
    "satisfaisant": 67,   // score 60-69
    "moyen": 32,          // score 50-59
    "insuffisant": 14     // score < 50
  }
}
```

---

## ⚙️ Configuration Post-Application

### 1. Rafraîchissement Automatique des Vues (Recommandé)

Configurez `pg_cron` pour rafraîchir automatiquement les vues :

```sql
-- Activer pg_cron (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Rafraîchir toutes les 15 minutes
SELECT cron.schedule(
    'refresh-edn-global-stats',
    '*/15 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY edn_global_stats'
);

SELECT cron.schedule(
    'refresh-edn-stats-specialite',
    '*/15 * * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY edn_stats_by_specialite'
);

-- Vérifier les jobs planifiés
SELECT * FROM cron.job WHERE jobname LIKE '%edn%';
```

### 2. Permissions et Sécurité

Vérifiez les permissions RLS :

```sql
-- Vérifier RLS sur edn_items_complete
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'edn_items_complete';

-- Lister les policies
SELECT
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'edn_items_complete';
```

---

## 🧪 Tests de Fonctionnement

### Test 1 : Enrichissement d'un Item Spécifique

```sql
SELECT enrich_edn_item_metadata('IC-1');
```

**Résultat attendu** :
```json
{
  "item_code": "IC-1",
  "enriched": true,
  "extracted_keywords_count": 10-20,
  "inferred_complexity": "intermediaire",
  "medical_tags_count": 5-10,
  "timestamp": "2025-11-14T..."
}
```

### Test 2 : Analyse de Qualité

```sql
SELECT jsonb_pretty(analyze_edn_item_quality('IC-1'));
```

**Résultat attendu** :
- `quality_score` : 0-100
- `quality_grade` : Excellent / Très bon / Bon / etc.
- `missing_elements` : array vide ou liste d'éléments manquants
- `suggestions` : array de suggestions

### Test 3 : Recherche Full-Text

```sql
SELECT * FROM search_edn_items('cardiologie', 5, 0);
```

**Résultat attendu** :
- Liste d'items contenant "cardiologie"
- Triés par pertinence (`rank`)
- Avec `completeness_score`

### Test 4 : Items Similaires

```sql
SELECT * FROM get_similar_edn_items('IC-1', 5);
```

**Résultat attendu** :
- 5 items similaires à IC-1
- Avec `similarity_score`
- Avec `shared_tags`

---

## 🐛 Dépannage

### Erreur : "relation edn_global_stats does not exist"

**Cause** : La vue matérialisée n'a pas été créée

**Solution** :
```sql
-- Réappliquer la section vues matérialisées
CREATE MATERIALIZED VIEW edn_global_stats AS ...;
```

### Erreur : "function enrich_all_edn_items does not exist"

**Cause** : Les fonctions n'ont pas été créées

**Solution** :
```sql
-- Réappliquer la section fonctions
CREATE OR REPLACE FUNCTION enrich_all_edn_items() ...;
```

### Erreur : "constraint check_completeness_score_range violated"

**Cause** : Données existantes ne respectent pas les contraintes

**Solution** :
```sql
-- Corriger les données avant d'ajouter la contrainte
UPDATE edn_items_complete
SET completeness_score = CASE
    WHEN completeness_score > 100 THEN 100
    WHEN completeness_score < 0 THEN 0
    ELSE completeness_score
END;

-- Puis réappliquer la contrainte
ALTER TABLE edn_items_complete
ADD CONSTRAINT check_completeness_score_range
CHECK (completeness_score >= 0 AND completeness_score <= 100);
```

### Performance Lente sur Recherche

**Cause** : Index pas encore construits ou statistiques obsolètes

**Solution** :
```sql
-- Analyser la table pour mettre à jour les statistiques
ANALYZE edn_items_complete;

-- Reconstruire les index si nécessaire
REINDEX TABLE edn_items_complete;
```

---

## 📈 Monitoring des Performances

### Requêtes les Plus Lentes

```sql
SELECT
    query,
    calls,
    mean_exec_time,
    total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%edn%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Utilisation des Index

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'edn_items_complete'
ORDER BY idx_scan DESC;
```

### Taille des Vues Matérialisées

```sql
SELECT
    schemaname,
    matviewname,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
FROM pg_matviews
WHERE schemaname = 'public'
    AND matviewname LIKE 'edn%';
```

---

## 🎯 Prochaines Étapes

Une fois l'enrichissement appliqué avec succès :

### Frontend (React)

1. **Créer les hooks React Query** (`src/hooks/`)
   - `useEdnGlobalStats.ts`
   - `useEdnQuality.ts`
   - `useEdnSearch.ts`
   - `useEdnSimilarItems.ts`

2. **Créer le Dashboard de Qualité** (`src/pages/EdnQualityDashboard.tsx`)
   - Affichage des statistiques globales
   - Graphiques de distribution
   - Liste des items à améliorer

3. **Améliorer la Recherche** (`src/components/edn/EdnAdvancedSearch.tsx`)
   - Utiliser `search_edn_items()`
   - Afficher le ranking de pertinence
   - Filtres combinés

### Backend (Supabase)

1. **Configurer pg_cron** pour rafraîchissement auto
2. **Créer des Edge Functions** pour analytics avancées
3. **Implémenter le système de recommandations**

### Documentation

1. **Créer des exemples d'utilisation** pour chaque fonction
2. **Documenter les hooks React Query**
3. **Créer un guide utilisateur** pour le dashboard

---

## 📚 Ressources

- **Documentation complète** : `docs/ANALYSE_EDN_COMPLETE_2025-11-14.md`
- **Migration SQL** : `supabase/migrations/20251114_edn_enrichment_complete.sql`
- **Types TypeScript** : `src/types/edn.ts`
- **Script d'application** : `scripts/apply-edn-enrichment.sh`

---

## ✅ Checklist de Vérification

Après application, cochez chaque élément :

- [ ] Migration SQL appliquée sans erreur
- [ ] Vues matérialisées créées (2)
- [ ] Index créés (18 sur edn_items_complete)
- [ ] Fonctions créées (6)
- [ ] Contraintes ajoutées (5)
- [ ] Triggers activés (3)
- [ ] Enrichissement exécuté sur tous les items
- [ ] Vues matérialisées rafraîchies
- [ ] Statistiques globales visibles
- [ ] Rapport de qualité généré
- [ ] Tests de fonctionnement réussis
- [ ] pg_cron configuré (optionnel)

---

**Besoin d'aide ?**

En cas de problème, consultez :
1. La section [Dépannage](#-dépannage)
2. Le rapport complet : `docs/ANALYSE_EDN_COMPLETE_2025-11-14.md`
3. Les logs Supabase dans le dashboard
