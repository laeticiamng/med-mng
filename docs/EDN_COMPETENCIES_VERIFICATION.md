# Vérification de la Complétude EDN - Compétences

Guide complet pour vérifier et améliorer la complétude des items EDN avec leurs compétences OIC.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Outils disponibles](#outils-disponibles)
- [Utilisation](#utilisation)
- [Interprétation des résultats](#interprétation-des-résultats)
- [Actions correctives](#actions-correctives)
- [Automatisation](#automatisation)

## Vue d'ensemble

Chaque item EDN (IC-1 à IC-367) doit être lié aux compétences appropriées du référentiel OIC (UNESS). Ces compétences sont divisées en deux niveaux :

- **Rang A** : Compétences de base
- **Rang B** : Compétences avancées

### Structure actuelle

```sql
edn_items_complete (367 items)
├── competences_oic_rang_a: TEXT[]  -- Array de codes OIC Rang A
├── competences_oic_rang_b: TEXT[]  -- Array de codes OIC Rang B
├── competences_count_rang_a: INTEGER
├── competences_count_rang_b: INTEGER
├── competences_count_total: INTEGER
└── completeness_score: INTEGER (0-100)

oic_competences (~4,872 compétences)
├── code_oic: TEXT (ex: "001-001-002")
├── intitule: TEXT
├── rang: TEXT ('A' ou 'B')
└── item_parent: TEXT (ex: "001" lie à IC-1)
```

### Métriques cibles

- ✅ **Complétude minimale** : 70%
- ✅ **Compétences par item** : 10-15 en moyenne
- ✅ **Couverture Rang A** : >90% des items
- ✅ **Couverture Rang B** : >80% des items
- ✅ **Items publiés** : 100% doivent avoir des compétences

## Outils disponibles

### 1. Script SQL (Audit complet base de données)

**Fichier** : `/home/user/med-mng/scripts/verify-edn-competencies-completeness.sql`

Analyse complète avec 12 sections :
1. Statistiques globales
2. Analyse de couverture des compétences
3. Items sans compétences
4. Distribution du nombre de compétences
5. Compétences par spécialité
6. Compétences déséquilibrées
7. Corrélation complétude/compétences
8. Contenu sans compétences
9. Top 20 items par couverture
10. Liste de priorité (items à corriger)
11. Analyse de réutilisation des compétences
12. Compétences non utilisées

**Exécution** :

```bash
# Depuis Supabase Studio
# Ouvrir SQL Editor > Nouveau query > Coller le contenu du script > Run

# Ou en ligne de commande
psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql
```

**Sortie** :
- Rapports SQL détaillés dans la console
- Notices avec recommandations
- Tables de résultats interactives

### 2. Script TypeScript (Rapport interactif)

**Fichier** : `/home/user/med-mng/apps/functions/admin/scripts/verify-edn-completeness.ts`

Analyse TypeScript avec export JSON et intégration possible dans l'admin.

**Installation** :

```bash
cd apps/functions/admin
npm install @supabase/supabase-js
```

**Exécution** :

```bash
# Rapport console uniquement
npx tsx scripts/verify-edn-completeness.ts

# Avec export JSON
npx tsx scripts/verify-edn-completeness.ts --export-json

# Mode fix automatique (à venir)
npx tsx scripts/verify-edn-completeness.ts --fix-mode
```

**Variables d'environnement requises** :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Sortie** :
- Rapport formaté dans la console
- Fichier `edn-completeness-report.json` (si --export-json)
- Exit code 1 si problèmes critiques détectés

## Utilisation

### Workflow recommandé

#### 1. Audit initial

```bash
# Exécuter le script SQL pour un audit complet
psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql > audit-$(date +%Y%m%d).log

# Examiner les sections :
# - Section 3 : Items sans compétences
# - Section 6 : Compétences déséquilibrées
# - Section 10 : Liste de priorité
```

#### 2. Identifier les problèmes critiques

Les problèmes sont classés par sévérité :

- 🔴 **CRITICAL** : Items publiés sans compétences OU contenu sans compétences
- 🟠 **HIGH** : Moins de 5 compétences OU déséquilibre important
- 🟡 **MEDIUM** : Score de complétude < 70%
- 🟢 **LOW** : Optimisations mineures

#### 3. Correction manuelle (priorité)

Pour chaque item problématique :

```sql
-- 1. Vérifier l'item
SELECT
  item_code,
  title,
  competences_oic_rang_a,
  competences_oic_rang_b,
  completeness_score
FROM edn_items_complete
WHERE item_code = 'IC-XXX';

-- 2. Trouver les compétences OIC associées
SELECT code_oic, intitule, rang
FROM oic_competences
WHERE item_parent = 'XXX'  -- Sans le préfixe 'IC-'
ORDER BY rang, code_oic;

-- 3. Mettre à jour (exemple)
UPDATE edn_items_complete
SET
  competences_oic_rang_a = ARRAY['001-001-001', '001-001-002', '001-002-001'],
  competences_oic_rang_b = ARRAY['001-003-001', '001-003-002']
WHERE item_code = 'IC-001';

-- 4. Le trigger auto-calcule les compteurs et le score
-- Vérifier le résultat :
SELECT item_code, competences_count_total, completeness_score
FROM edn_items_complete
WHERE item_code = 'IC-001';
```

#### 4. Enrichissement automatique (optionnel)

Pour les items avec contenu existant :

```sql
-- Enrichir un item spécifique
SELECT enrich_edn_item_metadata('IC-001');

-- Enrichir plusieurs items par spécialité
SELECT enrich_edn_item_metadata(item_code)
FROM edn_items_complete
WHERE specialite = 'Cardiologie'
  AND completeness_score < 80;

-- Enrichir tous les items en dessous d'un seuil
DO $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT item_code
    FROM edn_items_complete
    WHERE completeness_score < 70
    ORDER BY status DESC, completeness_score ASC
  LOOP
    PERFORM enrich_edn_item_metadata(item.item_code);
    RAISE NOTICE 'Enriched: %', item.item_code;
  END LOOP;
END $$;
```

#### 5. Vérification post-correction

```bash
# Réexécuter l'audit
npx tsx scripts/verify-edn-completeness.ts --export-json

# Comparer les métriques avant/après
# - Items sans compétences : doit être 0
# - Score moyen : doit être > 80%
# - Items publiés problématiques : doit être 0
```

## Interprétation des résultats

### Section 1 : Statistiques Globales

```
total_edn_items: 367
published_items: 350
avg_completeness_score: 87.5
```

**Interprétation** :
- ✅ Bon : avg_completeness ≥ 80
- ⚠️ À surveiller : 70-79
- 🔴 Critique : < 70

### Section 3 : Items Sans Compétences

```
item_code | title                    | status    | completeness_score
----------|--------------------------|-----------|-------------------
IC-045    | Insuffisance cardiaque   | published | 65
IC-123    | Diabète type 2           | draft     | 45
```

**Action** :
1. **Published** → URGENT : Ajouter compétences OU dépublier
2. **Draft** → Planifier avant publication

### Section 6 : Compétences Déséquilibrées

```
item_code | count_rang_a | count_rang_b | imbalance_type
----------|--------------|--------------|------------------
IC-078    | 25           | 0            | High Rang A, No Rang B
IC-156    | 2            | 18           | High Rang B, No Rang A
```

**Interprétation** :
- Items complexes devraient avoir des deux rangs
- Un déséquilibre > 15 indique probablement un manque de compétences appropriées

### Section 10 : Liste de Priorité

Priorisée par :
1. Items publiés sans compétences (CRITICAL)
2. Items avec < 5 compétences (HIGH)
3. Items avec score < 70% (MEDIUM)

**Action** : Traiter dans l'ordre, de haut en bas

### Section 11 : Compétences Les Plus Utilisées

```
competency_code | rank   | usage_count | pct_of_items
----------------|--------|-------------|-------------
001-001-001     | Rang A | 245         | 66.8%
002-003-004     | Rang B | 198         | 54.0%
```

**Utilisation** :
- Identifier les compétences "universelles" vs spécifiques
- Vérifier la cohérence : compétences surutilisées peuvent indiquer un problème

### Section 12 : Compétences Non Utilisées

**Action** :
- Vérifier si ces compétences sont pertinentes
- Si oui, trouver les items appropriés pour les lier
- Si non, documenter pourquoi elles ne sont pas utilisées

## Actions correctives

### Procédures par type de problème

#### Problème : Item sans compétences

```sql
-- 1. Identifier le domaine de l'item
SELECT item_code, title, specialite, domaine_medical
FROM edn_items_complete
WHERE item_code = 'IC-XXX';

-- 2. Chercher les compétences OIC du même domaine
SELECT code_oic, intitule, rang
FROM oic_competences
WHERE item_parent = 'XXX'  -- Code numérique de l'item
ORDER BY rang, code_oic;

-- 3. Sélectionner les compétences pertinentes
-- Critères :
-- - Rang A : Connaissances de base nécessaires
-- - Rang B : Compétences avancées si applicable

-- 4. Mettre à jour
UPDATE edn_items_complete
SET
  competences_oic_rang_a = ARRAY[...],
  competences_oic_rang_b = ARRAY[...]
WHERE item_code = 'IC-XXX';
```

#### Problème : Compétences déséquilibrées

```sql
-- Vérifier l'équilibre actuel
SELECT
  item_code,
  title,
  competences_count_rang_a,
  competences_count_rang_b,
  competences_oic_rang_a,
  competences_oic_rang_b
FROM edn_items_complete
WHERE item_code = 'IC-XXX';

-- Si trop de Rang A, ajouter Rang B :
UPDATE edn_items_complete
SET competences_oic_rang_b = competences_oic_rang_b || ARRAY['XXX-XXX-XXX']
WHERE item_code = 'IC-XXX';

-- Si trop de Rang B, ajouter Rang A :
UPDATE edn_items_complete
SET competences_oic_rang_a = competences_oic_rang_a || ARRAY['XXX-XXX-XXX']
WHERE item_code = 'IC-XXX';
```

#### Problème : Score de complétude bas

```sql
-- Utiliser la fonction d'analyse
SELECT * FROM analyze_edn_item_quality('IC-XXX');

-- Vérifier quels champs manquent
SELECT
  item_code,
  CASE WHEN tableau_rang_a IS NULL THEN 'Missing Tableau A' ELSE 'OK' END,
  CASE WHEN quiz_questions IS NULL THEN 'Missing Quiz' ELSE 'OK' END,
  CASE WHEN scene_immersive IS NULL THEN 'Missing Scene' ELSE 'OK' END,
  CASE WHEN competences_count_total < 5 THEN 'Too Few Competencies' ELSE 'OK' END
FROM edn_items_complete
WHERE item_code = 'IC-XXX';

-- Compléter les champs manquants selon les besoins
```

### Workflow d'enrichissement en masse

```sql
-- Script d'enrichissement progressif
DO $$
DECLARE
  v_item RECORD;
  v_total INTEGER;
  v_processed INTEGER := 0;
  v_improved INTEGER := 0;
  v_old_score INTEGER;
  v_new_score INTEGER;
BEGIN
  -- Compter le total
  SELECT COUNT(*) INTO v_total
  FROM edn_items_complete
  WHERE completeness_score < 80;

  RAISE NOTICE 'Starting enrichment of % items', v_total;

  -- Traiter chaque item
  FOR v_item IN
    SELECT item_code, completeness_score
    FROM edn_items_complete
    WHERE completeness_score < 80
    ORDER BY status DESC, completeness_score ASC
  LOOP
    v_old_score := v_item.completeness_score;

    -- Enrichir
    PERFORM enrich_edn_item_metadata(v_item.item_code);

    -- Vérifier l'amélioration
    SELECT completeness_score INTO v_new_score
    FROM edn_items_complete
    WHERE item_code = v_item.item_code;

    v_processed := v_processed + 1;

    IF v_new_score > v_old_score THEN
      v_improved := v_improved + 1;
      RAISE NOTICE '[%/%] Improved % from % to %',
        v_processed, v_total, v_item.item_code, v_old_score, v_new_score;
    ELSE
      RAISE NOTICE '[%/%] No change for % (score: %)',
        v_processed, v_total, v_item.item_code, v_new_score;
    END IF;

    -- Petit délai pour éviter la surcharge
    PERFORM pg_sleep(0.1);
  END LOOP;

  RAISE NOTICE 'Enrichment complete: % processed, % improved',
    v_processed, v_improved;
END $$;
```

## Automatisation

### Monitoring continu

Créer une vue pour le monitoring :

```sql
CREATE OR REPLACE VIEW edn_completeness_monitoring AS
SELECT
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE status = 'published') as published_items,
  COUNT(*) FILTER (
    WHERE (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
      AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
  ) as items_without_competencies,
  COUNT(*) FILTER (
    WHERE status = 'published'
      AND (
        (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
        AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
      )
  ) as published_without_competencies,
  ROUND(AVG(completeness_score), 2) as avg_completeness,
  COUNT(*) FILTER (WHERE completeness_score < 70) as items_below_threshold,
  now() as last_updated
FROM edn_items_complete;

-- Consulter rapidement
SELECT * FROM edn_completeness_monitoring;
```

### Alertes automatiques

```sql
-- Fonction d'alerte
CREATE OR REPLACE FUNCTION check_edn_completeness_alerts()
RETURNS TABLE (
  alert_type TEXT,
  alert_severity TEXT,
  alert_message TEXT,
  item_count INTEGER
) AS $$
BEGIN
  -- Alerte critique : items publiés sans compétences
  RETURN QUERY
  SELECT
    'no_competencies'::TEXT,
    'CRITICAL'::TEXT,
    'Published items without competencies'::TEXT,
    COUNT(*)::INTEGER
  FROM edn_items_complete
  WHERE status = 'published'
    AND (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
    AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
  HAVING COUNT(*) > 0;

  -- Alerte haute : score moyen < 75%
  RETURN QUERY
  SELECT
    'low_avg_completeness'::TEXT,
    'HIGH'::TEXT,
    'Average completeness score is below 75%'::TEXT,
    ROUND(AVG(completeness_score))::INTEGER
  FROM edn_items_complete
  HAVING AVG(completeness_score) < 75;

  -- Alerte moyenne : beaucoup d'items sous 70%
  RETURN QUERY
  SELECT
    'many_low_completeness'::TEXT,
    'MEDIUM'::TEXT,
    'Many items have completeness < 70%'::TEXT,
    COUNT(*)::INTEGER
  FROM edn_items_complete
  WHERE completeness_score < 70
  HAVING COUNT(*) > 50;
END;
$$ LANGUAGE plpgsql;

-- Vérifier les alertes
SELECT * FROM check_edn_completeness_alerts();
```

### Intégration CI/CD

Ajouter à votre pipeline :

```yaml
# .github/workflows/edn-quality-check.yml
name: EDN Quality Check

on:
  schedule:
    - cron: '0 2 * * 1'  # Tous les lundis à 2h
  workflow_dispatch:

jobs:
  check-completeness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd apps/functions/admin
          npm install

      - name: Run completeness check
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          npx tsx scripts/verify-edn-completeness.ts --export-json

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: edn-completeness-report
          path: edn-completeness-report.json

      - name: Check for critical issues
        run: |
          # Script exits with code 1 if critical issues found
          npx tsx scripts/verify-edn-completeness.ts || exit 1
```

## Métriques de succès

### Objectifs à atteindre

| Métrique | Cible | Acceptable | Critique |
|----------|-------|------------|----------|
| Items sans compétences | 0 | < 5 | > 10 |
| Score moyen complétude | > 85% | > 75% | < 70% |
| Items publiés avec compétences | 100% | > 95% | < 90% |
| Compétences par item (moyenne) | 12-15 | 8-20 | < 5 ou > 25 |
| Couverture Rang A | > 90% | > 80% | < 70% |
| Couverture Rang B | > 85% | > 70% | < 60% |

### Dashboard recommandé

```sql
-- Créer une vue dashboard
CREATE OR REPLACE VIEW edn_quality_dashboard AS
SELECT
  'Items Sans Compétences' as metric,
  COUNT(*) as value,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Excellent'
    WHEN COUNT(*) < 5 THEN '⚠️ Acceptable'
    ELSE '🔴 Critique'
  END as status
FROM edn_items_complete
WHERE (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
  AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)

UNION ALL

SELECT
  'Score Moyen Complétude',
  ROUND(AVG(completeness_score)),
  CASE
    WHEN AVG(completeness_score) >= 85 THEN '✅ Excellent'
    WHEN AVG(completeness_score) >= 75 THEN '⚠️ Acceptable'
    ELSE '🔴 Critique'
  END
FROM edn_items_complete

UNION ALL

SELECT
  'Items Publiés OK',
  ROUND(COUNT(*) FILTER (WHERE completeness_score >= 70) * 100.0 / COUNT(*)),
  CASE
    WHEN COUNT(*) FILTER (WHERE completeness_score >= 70) * 100.0 / COUNT(*) >= 95 THEN '✅ Excellent'
    WHEN COUNT(*) FILTER (WHERE completeness_score >= 70) * 100.0 / COUNT(*) >= 85 THEN '⚠️ Acceptable'
    ELSE '🔴 Critique'
  END
FROM edn_items_complete
WHERE status = 'published';

-- Consulter
SELECT * FROM edn_quality_dashboard;
```

## Support et ressources

### Fichiers de référence

- **Schema complet** : `/home/user/med-mng/docs/schema_documentation.md`
- **Diagrammes** : `/home/user/med-mng/docs/schema_diagram.txt`
- **Exemples de requêtes** : `/home/user/med-mng/docs/schema_example_queries.md`
- **Migrations** : `/home/user/med-mng/supabase/migrations/`

### Fonctions SQL utiles

```sql
-- Analyser un item
SELECT * FROM analyze_edn_item_quality('IC-001');

-- Enrichir un item
SELECT enrich_edn_item_metadata('IC-001');

-- Rechercher des items
SELECT * FROM search_edn_items('cardiologie');

-- Obtenir le rapport global
SELECT * FROM get_edn_quality_global_report();

-- Rafraîchir les vues matérialisées
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_global_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_stats_by_specialite;
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_items_unified_view;
```

## FAQ

**Q: Combien de compétences un item devrait-il avoir ?**
R: En moyenne 10-15. Items simples : 5-10. Items complexes : 15-25.

**Q: Faut-il toujours avoir des compétences Rang A ET Rang B ?**
R: Idéalement oui, mais certains items basiques peuvent n'avoir que du Rang A. Les items avancés doivent avoir les deux.

**Q: Que faire si aucune compétence OIC ne correspond ?**
R: Vérifier le champ `item_parent` dans `oic_competences`. S'il n'y a vraiment aucune compétence, documenter pourquoi et contacter l'équipe pédagogique.

**Q: Peut-on automatiser complètement l'attribution des compétences ?**
R: Partiellement. La fonction `enrich_edn_item_metadata()` peut suggérer des compétences basées sur `item_parent`, mais une révision manuelle est recommandée pour la précision.

**Q: À quelle fréquence faut-il vérifier la complétude ?**
R: Minimum hebdomadaire. Idéalement après chaque ajout/modification d'items EDN.

---

**Dernière mise à jour** : 2025-11-16
**Mainteneur** : Équipe Med-Mng
