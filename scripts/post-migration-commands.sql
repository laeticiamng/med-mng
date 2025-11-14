-- =============================================
-- COMMANDES POST-MIGRATION EDN
-- À exécuter après l'application de 20251114_edn_enrichment_complete.sql
-- =============================================

-- =============================================
-- ÉTAPE 1: ENRICHIR TOUS LES ITEMS EDN
-- =============================================

\echo '🚀 Étape 1/4: Enrichissement de tous les items EDN...'

-- Enrichir tous les items
SELECT enrich_all_edn_items() as enrichment_result;

-- Afficher le rapport détaillé
SELECT
    (enrichment_result->>'total_processed')::int as total_traites,
    (enrichment_result->>'total_enriched')::int as total_enrichis,
    (enrichment_result->>'success_rate')::numeric as taux_succes,
    enrichment_result->>'timestamp' as date_execution
FROM (SELECT enrich_all_edn_items() as enrichment_result) r;

\echo '✅ Enrichissement terminé'
\echo ''

-- =============================================
-- ÉTAPE 2: RAFRAÎCHIR LES VUES MATÉRIALISÉES
-- =============================================

\echo '🔄 Étape 2/4: Rafraîchissement des vues matérialisées...'

-- Rafraîchir la vue des statistiques globales
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_global_stats;

-- Rafraîchir la vue des statistiques par spécialité
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_stats_by_specialite;

\echo '✅ Vues matérialisées rafraîchies'
\echo ''

-- =============================================
-- ÉTAPE 3: VÉRIFIER LES STATISTIQUES GLOBALES
-- =============================================

\echo '📊 Étape 3/4: Statistiques globales du système EDN'
\echo ''

-- Afficher les statistiques globales
SELECT
    total_items as "Total Items",
    complete_items as "Items Complets (≥80%)",
    incomplete_items as "Items Incomplets (<80%)",
    validated_items as "Items Validés",
    round(avg_completeness, 2) as "Complétude Moyenne (%)",
    round(avg_competences_per_item, 2) as "Compétences par Item (Moy)",
    total_competences_rang_a as "Total Compétences Rang A",
    total_competences_rang_b as "Total Compétences Rang B",
    items_with_tableau_a as "Items avec Tableau A",
    items_with_tableau_b as "Items avec Tableau B",
    items_with_music as "Items avec Musique",
    items_with_immersive as "Items avec Immersif",
    items_with_quiz as "Items avec Quiz",
    last_update as "Dernière Mise à Jour"
FROM edn_global_stats;

\echo ''

-- =============================================
-- ÉTAPE 4: RAPPORT DE QUALITÉ GLOBAL
-- =============================================

\echo '📈 Étape 4/4: Rapport de qualité global'
\echo ''

-- Rapport de qualité formaté
SELECT jsonb_pretty(get_edn_quality_global_report()) as "Rapport de Qualité";

-- Distribution par grade
WITH quality_report AS (
    SELECT get_edn_quality_global_report() as report
)
SELECT
    'Excellent (≥90)' as grade,
    (report->'quality_distribution'->>'excellent')::int as nombre_items
FROM quality_report
UNION ALL
SELECT
    'Très Bon (80-89)',
    (report->'quality_distribution'->>'tres_bon')::int
FROM quality_report
UNION ALL
SELECT
    'Bon (70-79)',
    (report->'quality_distribution'->>'bon')::int
FROM quality_report
UNION ALL
SELECT
    'Satisfaisant (60-69)',
    (report->'quality_distribution'->>'satisfaisant')::int
FROM quality_report
UNION ALL
SELECT
    'Moyen (50-59)',
    (report->'quality_distribution'->>'moyen')::int
FROM quality_report
UNION ALL
SELECT
    'Insuffisant (<50)',
    (report->'quality_distribution'->>'insuffisant')::int
FROM quality_report;

\echo ''

-- =============================================
-- TOP 10 MEILLEURS ITEMS
-- =============================================

\echo '🏆 Top 10 des items avec le meilleur score de qualité:'
\echo ''

SELECT
    item_code as "Code Item",
    LEFT(title, 60) as "Titre",
    completeness_score as "Score",
    CASE
        WHEN completeness_score >= 90 THEN '⭐⭐⭐⭐⭐'
        WHEN completeness_score >= 80 THEN '⭐⭐⭐⭐'
        WHEN completeness_score >= 70 THEN '⭐⭐⭐'
        WHEN completeness_score >= 60 THEN '⭐⭐'
        ELSE '⭐'
    END as "Étoiles",
    CASE WHEN is_validated THEN '✅' ELSE '❌' END as "Validé",
    specialite as "Spécialité"
FROM edn_items_complete
ORDER BY completeness_score DESC
LIMIT 10;

\echo ''

-- =============================================
-- TOP 10 ITEMS NÉCESSITANT ATTENTION
-- =============================================

\echo '⚠️  Top 10 des items nécessitant amélioration:'
\echo ''

SELECT
    item_code as "Code Item",
    LEFT(title, 60) as "Titre",
    completeness_score as "Score",
    CASE
        WHEN completeness_score >= 50 THEN '🔶'
        WHEN completeness_score >= 30 THEN '🔴'
        ELSE '🔴🔴'
    END as "Priorité",
    specialite as "Spécialité"
FROM edn_items_complete
ORDER BY completeness_score ASC
LIMIT 10;

\echo ''

-- =============================================
-- STATISTIQUES PAR SPÉCIALITÉ
-- =============================================

\echo '🏥 Statistiques par spécialité médicale:'
\echo ''

SELECT
    specialite as "Spécialité",
    domaine_medical as "Domaine",
    item_count as "Nb Items",
    round(avg_completeness, 2) as "Complétude Moy (%)",
    round(avg_competences, 2) as "Compétences Moy",
    validated_count as "Items Validés"
FROM edn_stats_by_specialite
ORDER BY item_count DESC
LIMIT 15;

\echo ''

-- =============================================
-- TESTS DE FONCTIONNEMENT
-- =============================================

\echo '🧪 Tests de fonctionnement des nouvelles fonctions:'
\echo ''

-- Test 1: Enrichissement d'un item spécifique
\echo 'Test 1: Enrichissement item IC-1'
SELECT jsonb_pretty(enrich_edn_item_metadata('IC-1')) as "Résultat Enrichissement IC-1";

\echo ''

-- Test 2: Analyse de qualité
\echo 'Test 2: Analyse de qualité item IC-1'
SELECT
    (quality->>'item_code') as "Item Code",
    (quality->>'quality_score')::int as "Score",
    (quality->>'quality_grade') as "Grade",
    array_length(
        ARRAY(SELECT jsonb_array_elements_text(quality->'missing_elements')),
        1
    ) as "Éléments Manquants"
FROM (SELECT analyze_edn_item_quality('IC-1') as quality) q;

\echo ''

-- Test 3: Recherche full-text
\echo 'Test 3: Recherche "cardiologie"'
SELECT
    item_code as "Code",
    LEFT(title, 50) as "Titre",
    specialite as "Spécialité",
    completeness_score as "Score",
    round(rank::numeric, 3) as "Pertinence"
FROM search_edn_items('cardiologie', 5, 0);

\echo ''

-- Test 4: Items similaires
\echo 'Test 4: Items similaires à IC-1'
SELECT
    item_code as "Code",
    LEFT(title, 50) as "Titre",
    round(similarity_score::numeric, 3) as "Similarité",
    shared_tags as "Tags Partagés"
FROM get_similar_edn_items('IC-1', 5);

\echo ''

-- =============================================
-- VÉRIFICATIONS SYSTÈME
-- =============================================

\echo '🔍 Vérifications système:'
\echo ''

-- Vérifier les vues matérialisées
\echo 'Vues matérialisées créées:'
SELECT
    matviewname as "Vue Matérialisée",
    hasindexes as "Avec Index",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as "Taille"
FROM pg_matviews
WHERE schemaname = 'public'
    AND matviewname LIKE 'edn%'
ORDER BY matviewname;

\echo ''

-- Vérifier les index
\echo 'Nombre d''index sur edn_items_complete:'
SELECT
    COUNT(*) as "Total Index",
    COUNT(*) FILTER (WHERE indexdef LIKE '%gin%') as "Index GIN",
    COUNT(*) FILTER (WHERE indexdef LIKE '%btree%') as "Index BTree"
FROM pg_indexes
WHERE tablename = 'edn_items_complete';

\echo ''

-- Vérifier les fonctions
\echo 'Fonctions EDN créées:'
SELECT
    proname as "Fonction",
    pg_get_function_arguments(oid) as "Arguments"
FROM pg_proc
WHERE proname IN (
    'enrich_edn_item_metadata',
    'enrich_all_edn_items',
    'analyze_edn_item_quality',
    'get_edn_quality_global_report',
    'search_edn_items',
    'get_similar_edn_items'
)
ORDER BY proname;

\echo ''

-- Vérifier les contraintes
\echo 'Contraintes de validation:'
SELECT
    conname as "Contrainte",
    LEFT(pg_get_constraintdef(oid), 60) as "Définition"
FROM pg_constraint
WHERE conrelid = 'edn_items_complete'::regclass
    AND contype = 'c'
ORDER BY conname;

\echo ''

-- Vérifier les triggers
\echo 'Triggers actifs:'
SELECT
    trigger_name as "Trigger",
    event_manipulation as "Événement"
FROM information_schema.triggers
WHERE event_object_table = 'edn_items_complete'
ORDER BY trigger_name;

\echo ''

-- =============================================
-- ANALYSE DE PERFORMANCE
-- =============================================

\echo '⚡ Analyse de performance:'
\echo ''

-- Statistiques sur la table
SELECT
    schemaname as "Schéma",
    tablename as "Table",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "Taille Totale",
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "Taille Table",
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as "Taille Index"
FROM pg_tables
WHERE tablename = 'edn_items_complete';

\echo ''

-- Index les plus utilisés
\echo 'Index les plus utilisés (Top 5):'
SELECT
    indexrelname as "Index",
    idx_scan as "Nb Scans",
    pg_size_pretty(pg_relation_size(indexrelid)) as "Taille"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND relname = 'edn_items_complete'
ORDER BY idx_scan DESC
LIMIT 5;

\echo ''

-- =============================================
-- RÉSUMÉ FINAL
-- =============================================

\echo '==========================================================='
\echo '✅ ENRICHISSEMENT EDN TERMINÉ AVEC SUCCÈS!'
\echo '==========================================================='
\echo ''
\echo '📋 Actions effectuées:'
\echo '  1. ✅ Enrichissement de tous les items'
\echo '  2. ✅ Rafraîchissement des vues matérialisées'
\echo '  3. ✅ Vérification des statistiques'
\echo '  4. ✅ Génération du rapport de qualité'
\echo '  5. ✅ Tests de fonctionnement'
\echo '  6. ✅ Vérifications système'
\echo ''
\echo '🚀 Prochaines étapes recommandées:'
\echo '  1. Consulter le guide complet: docs/GUIDE_APPLICATION_ENRICHISSEMENT_EDN.md'
\echo '  2. Configurer pg_cron pour rafraîchissement automatique'
\echo '  3. Créer les hooks React Query pour le frontend'
\echo '  4. Implémenter le dashboard de qualité'
\echo ''
\echo '💡 Commandes utiles:'
\echo '  - Enrichir un item: SELECT enrich_edn_item_metadata(''IC-XXX'');'
\echo '  - Analyser qualité: SELECT analyze_edn_item_quality(''IC-XXX'');'
\echo '  - Rechercher: SELECT * FROM search_edn_items(''terme'', 10, 0);'
\echo '  - Items similaires: SELECT * FROM get_similar_edn_items(''IC-XXX'', 5);'
\echo '  - Rafraîchir stats: REFRESH MATERIALIZED VIEW edn_global_stats;'
\echo ''
\echo '==========================================================='
