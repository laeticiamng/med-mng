-- =============================================
-- VERIFICATION COMPLETE DES FONCTIONNALITES EDN
-- =============================================
-- Date: 2025-11-16
-- Objectif: Vérifier à 100% que chaque item EDN dispose de:
-- 1. Rangs A et B complets avec compétences OIC
-- 2. Paroles musicales fixes (idéalement séparées par Rang A, B, A+B)
-- 3. Intégration Suno pour génération musicale
-- 4. Quiz interactif
-- 5. Bande dessinée fixe (comic strip)
-- =============================================

\echo '====================================================='
\echo 'VERIFICATION COMPLETE DES ITEMS EDN'
\echo '====================================================='
\echo ''

-- =============================================
-- SECTION 1: STATISTIQUES GLOBALES
-- =============================================
\echo '1. STATISTIQUES GLOBALES'
\echo '-----------------------------------------------------'

SELECT
  'Items EDN totaux' as metric,
  COUNT(*)::text as value
FROM edn_items_complete
UNION ALL
SELECT
  'Items avec Rang A complet',
  COUNT(*)::text
FROM edn_items_complete
WHERE competences_oic_rang_a IS NOT NULL
  AND jsonb_array_length(competences_oic_rang_a) > 0
UNION ALL
SELECT
  'Items avec Rang B complet',
  COUNT(*)::text
FROM edn_items_complete
WHERE competences_oic_rang_b IS NOT NULL
  AND jsonb_array_length(competences_oic_rang_b) > 0
UNION ALL
SELECT
  'Items avec Rangs A ET B',
  COUNT(*)::text
FROM edn_items_complete
WHERE competences_oic_rang_a IS NOT NULL
  AND jsonb_array_length(competences_oic_rang_a) > 0
  AND competences_oic_rang_b IS NOT NULL
  AND jsonb_array_length(competences_oic_rang_b) > 0
UNION ALL
SELECT
  'Items avec paroles musicales',
  COUNT(*)::text
FROM edn_items_complete
WHERE paroles_musicales IS NOT NULL
  AND array_length(paroles_musicales, 1) > 0
UNION ALL
SELECT
  'Items avec quiz',
  COUNT(*)::text
FROM edn_items_complete
WHERE quiz_questions IS NOT NULL
  AND quiz_questions != '{}'::jsonb
UNION ALL
SELECT
  'Items avec tableau Rang A',
  COUNT(*)::text
FROM edn_items_complete
WHERE tableau_rang_a IS NOT NULL
  AND tableau_rang_a != '{}'::jsonb
UNION ALL
SELECT
  'Items avec tableau Rang B',
  COUNT(*)::text
FROM edn_items_complete
WHERE tableau_rang_b IS NOT NULL
  AND tableau_rang_b != '{}'::jsonb;

\echo ''
\echo '====================================================='
\echo '2. ANALYSE PAR CRITERE DE COMPLETUDE'
\echo '====================================================='
\echo ''

-- Items 100% complets (tous les critères)
\echo 'Items 100% complets (Rang A + Rang B + Paroles + Quiz):'
\echo '-----------------------------------------------------'

SELECT
  item_code,
  title,
  jsonb_array_length(competences_oic_rang_a) as comp_rang_a,
  jsonb_array_length(competences_oic_rang_b) as comp_rang_b,
  array_length(paroles_musicales, 1) as paroles_count,
  CASE
    WHEN quiz_questions IS NOT NULL AND quiz_questions != '{}'::jsonb THEN 'Oui'
    ELSE 'Non'
  END as has_quiz,
  completeness_score
FROM edn_items_complete
WHERE competences_oic_rang_a IS NOT NULL
  AND jsonb_array_length(competences_oic_rang_a) > 0
  AND competences_oic_rang_b IS NOT NULL
  AND jsonb_array_length(competences_oic_rang_b) > 0
  AND paroles_musicales IS NOT NULL
  AND array_length(paroles_musicales, 1) > 0
  AND quiz_questions IS NOT NULL
  AND quiz_questions != '{}'::jsonb
ORDER BY item_code;

\echo ''
\echo '====================================================='
\echo '3. ITEMS INCOMPLETS - ANALYSE DETAILLEE'
\echo '====================================================='
\echo ''

\echo 'Items SANS Rang A:'
\echo '-----------------------------------------------------'
SELECT
  item_code,
  title,
  specialite
FROM edn_items_complete
WHERE competences_oic_rang_a IS NULL
  OR jsonb_array_length(competences_oic_rang_a) = 0
ORDER BY item_code
LIMIT 20;

\echo ''
\echo 'Items SANS Rang B:'
\echo '-----------------------------------------------------'
SELECT
  item_code,
  title,
  specialite
FROM edn_items_complete
WHERE competences_oic_rang_b IS NULL
  OR jsonb_array_length(competences_oic_rang_b) = 0
ORDER BY item_code
LIMIT 20;

\echo ''
\echo 'Items SANS Paroles Musicales:'
\echo '-----------------------------------------------------'
SELECT
  item_code,
  title,
  specialite
FROM edn_items_complete
WHERE paroles_musicales IS NULL
  OR array_length(paroles_musicales, 1) = 0
  OR array_length(paroles_musicales, 1) IS NULL
ORDER BY item_code
LIMIT 20;

\echo ''
\echo 'Items SANS Quiz:'
\echo '-----------------------------------------------------'
SELECT
  item_code,
  title,
  specialite
FROM edn_items_complete
WHERE quiz_questions IS NULL
  OR quiz_questions = '{}'::jsonb
ORDER BY item_code
LIMIT 20;

\echo ''
\echo '====================================================='
\echo '4. VERIFICATION INTEGRATION SUNO'
\echo '====================================================='
\echo ''

\echo 'Chansons Suno existantes:'
\echo '-----------------------------------------------------'
SELECT
  COUNT(*) as total_songs,
  COUNT(DISTINCT suno_audio_id) as unique_audio_ids
FROM med_mng_songs;

\echo ''
\echo 'Analyse des métadonnées Suno:'
\echo '-----------------------------------------------------'
SELECT
  id,
  title,
  suno_audio_id,
  CASE
    WHEN lyrics IS NOT NULL AND lyrics != '{}'::jsonb THEN 'Oui'
    ELSE 'Non'
  END as has_lyrics,
  CASE
    WHEN meta IS NOT NULL AND meta != '{}'::jsonb THEN 'Oui'
    ELSE 'Non'
  END as has_meta,
  created_at
FROM med_mng_songs
ORDER BY created_at DESC
LIMIT 10;

\echo ''
\echo '====================================================='
\echo '5. VERIFICATION BANDES DESSINEES (COMIC PANELS)'
\echo '====================================================='
\echo ''

\echo 'Statistiques des comic panels:'
\echo '-----------------------------------------------------'
SELECT
  'Total de panneaux' as metric,
  COUNT(*)::text as value
FROM comic_panels
UNION ALL
SELECT
  'Panneaux statiques (fixes)',
  COUNT(*)::text
FROM comic_panels
WHERE is_static = true
UNION ALL
SELECT
  'Items uniques avec BD',
  COUNT(DISTINCT item_id)::text
FROM comic_panels;

\echo ''
\echo 'Items avec bandes dessinées fixes:'
\echo '-----------------------------------------------------'
SELECT
  cp.item_id,
  COUNT(*) as panel_count,
  array_agg(cp.panel_number ORDER BY cp.panel_number) as panels,
  bool_and(cp.is_static) as all_static
FROM comic_panels cp
WHERE cp.is_static = true
GROUP BY cp.item_id
ORDER BY cp.item_id
LIMIT 10;

\echo ''
\echo '====================================================='
\echo '6. PROBLEMES CRITIQUES IDENTIFIES'
\echo '====================================================='
\echo ''

\echo 'PROBLEME 1: Paroles non séparées par Rang'
\echo '-----------------------------------------------------'
\echo 'Les paroles musicales sont stockées dans un seul array'
\echo 'paroles_musicales[] au lieu de:'
\echo '  - paroles_rang_a[]'
\echo '  - paroles_rang_b[]'
\echo '  - paroles_rang_ab[]'
\echo ''

\echo 'PROBLEME 2: Pas de lien direct Item EDN <-> Chanson Suno'
\echo '-----------------------------------------------------'
\echo 'Table med_mng_songs ne contient pas de colonne item_code'
\echo 'pour lier directement aux items EDN'
\echo ''

\echo 'PROBLEME 3: Pas de lien direct Item EDN <-> Comic Panels'
\echo '-----------------------------------------------------'
\echo 'Table comic_panels référence med_mng_items, pas edn_items_complete'
\echo 'Besoin de vérifier si les item_id correspondent'
\echo ''

\echo '====================================================='
\echo '7. MATRICE DE COMPLETUDE PAR ITEM'
\echo '====================================================='
\echo ''

\echo 'Top 20 items les plus complets:'
\echo '-----------------------------------------------------'
SELECT
  item_code,
  title,
  CASE WHEN jsonb_array_length(competences_oic_rang_a) > 0 THEN '✓' ELSE '✗' END as rang_a,
  CASE WHEN jsonb_array_length(competences_oic_rang_b) > 0 THEN '✓' ELSE '✗' END as rang_b,
  CASE WHEN array_length(paroles_musicales, 1) > 0 THEN '✓' ELSE '✗' END as paroles,
  CASE WHEN quiz_questions != '{}'::jsonb THEN '✓' ELSE '✗' END as quiz,
  CASE WHEN tableau_rang_a != '{}'::jsonb THEN '✓' ELSE '✗' END as tab_a,
  CASE WHEN tableau_rang_b != '{}'::jsonb THEN '✓' ELSE '✗' END as tab_b,
  completeness_score as score
FROM edn_items_complete
ORDER BY completeness_score DESC, item_code
LIMIT 20;

\echo ''
\echo 'Top 20 items les moins complets (nécessitant intervention):'
\echo '-----------------------------------------------------'
SELECT
  item_code,
  title,
  CASE WHEN jsonb_array_length(competences_oic_rang_a) > 0 THEN '✓' ELSE '✗' END as rang_a,
  CASE WHEN jsonb_array_length(competences_oic_rang_b) > 0 THEN '✓' ELSE '✗' END as rang_b,
  CASE WHEN array_length(paroles_musicales, 1) > 0 THEN '✓' ELSE '✗' END as paroles,
  CASE WHEN quiz_questions != '{}'::jsonb THEN '✓' ELSE '✗' END as quiz,
  CASE WHEN tableau_rang_a != '{}'::jsonb THEN '✓' ELSE '✗' END as tab_a,
  CASE WHEN tableau_rang_b != '{}'::jsonb THEN '✓' ELSE '✗' END as tab_b,
  completeness_score as score
FROM edn_items_complete
ORDER BY completeness_score ASC, item_code
LIMIT 20;

\echo ''
\echo '====================================================='
\echo '8. RECOMMANDATIONS'
\echo '====================================================='
\echo ''
\echo 'Pour atteindre 100% de complétude, il faut:'
\echo '1. Ajouter colonnes pour paroles séparées par rang:'
\echo '   - ALTER TABLE edn_items_complete ADD COLUMN paroles_rang_a text[];'
\echo '   - ALTER TABLE edn_items_complete ADD COLUMN paroles_rang_b text[];'
\echo '   - ALTER TABLE edn_items_complete ADD COLUMN paroles_rang_ab text[];'
\echo ''
\echo '2. Ajouter lien Item EDN <-> Chanson Suno:'
\echo '   - ALTER TABLE med_mng_songs ADD COLUMN item_code text REFERENCES edn_items_complete(item_code);'
\echo '   - Ajouter colonnes: rang_type (A, B, AB), is_static boolean;'
\echo ''
\echo '3. Créer table liaison Item EDN <-> Comic Panels:'
\echo '   - CREATE TABLE edn_item_comics ('
\echo '       item_code text REFERENCES edn_items_complete(item_code),'
\echo '       comic_panel_id uuid REFERENCES comic_panels(id),'
\echo '       rang_type text CHECK (rang_type IN (A, B, AB)),'
\echo '       is_static boolean DEFAULT true'
\echo '     );'
\echo ''
\echo '4. Générer contenus manquants:'
\echo '   - Paroles musicales pour chaque rang'
\echo '   - Quiz pour items sans quiz'
\echo '   - Bandes dessinées fixes pour chaque item'
\echo ''
\echo '====================================================='
\echo 'FIN DU RAPPORT DE VERIFICATION'
\echo '====================================================='
