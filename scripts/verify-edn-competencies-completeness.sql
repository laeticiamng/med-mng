-- =====================================================
-- EDN ITEMS - COMPETENCIES COMPLETENESS VERIFICATION
-- =====================================================
-- Comprehensive audit of EDN items and their competency linkages
-- Date: 2025-11-16
-- =====================================================

-- =====================================================
-- 0. SCHEMA VERIFICATION (CRITICAL)
-- =====================================================

DO $$
DECLARE
  has_competences_oic_rang_a BOOLEAN;
  has_competences_oic_rang_b BOOLEAN;
  has_oic_rang_a BOOLEAN;
  has_oic_rang_b BOOLEAN;
  comp_a_type TEXT;
  comp_b_type TEXT;
  oic_a_type TEXT;
  oic_b_type TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'EDN ITEMS - COMPETENCIES COMPLETENESS AUDIT';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '0. SCHEMA VERIFICATION';
  RAISE NOTICE '----------------------------------------';

  -- Check which columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
      AND column_name = 'competences_oic_rang_a'
  ) INTO has_competences_oic_rang_a;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
      AND column_name = 'competences_oic_rang_b'
  ) INTO has_competences_oic_rang_b;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
      AND column_name = 'oic_rang_a'
  ) INTO has_oic_rang_a;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
      AND column_name = 'oic_rang_b'
  ) INTO has_oic_rang_b;

  -- Get data types
  SELECT data_type INTO comp_a_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
    AND column_name = 'competences_oic_rang_a';

  SELECT data_type INTO comp_b_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
    AND column_name = 'competences_oic_rang_b';

  SELECT data_type INTO oic_a_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
    AND column_name = 'oic_rang_a';

  SELECT data_type INTO oic_b_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'edn_items_complete'
    AND column_name = 'oic_rang_b';

  RAISE NOTICE 'Column existence check:';
  RAISE NOTICE '  competences_oic_rang_a: % (type: %)', has_competences_oic_rang_a, COALESCE(comp_a_type, 'N/A');
  RAISE NOTICE '  competences_oic_rang_b: % (type: %)', has_competences_oic_rang_b, COALESCE(comp_b_type, 'N/A');
  RAISE NOTICE '  oic_rang_a: % (type: %)', has_oic_rang_a, COALESCE(oic_a_type, 'N/A');
  RAISE NOTICE '  oic_rang_b: % (type: %)', has_oic_rang_b, COALESCE(oic_b_type, 'N/A');
  RAISE NOTICE '';

  IF NOT has_competences_oic_rang_a AND NOT has_oic_rang_a THEN
    RAISE WARNING '⚠️  CRITICAL: NO OIC Rang A columns found!';
    RAISE WARNING '⚠️  Run migration: 20251116070000_fix_edn_oic_columns_schema.sql';
  END IF;

  IF NOT has_competences_oic_rang_b AND NOT has_oic_rang_b THEN
    RAISE WARNING '⚠️  CRITICAL: NO OIC Rang B columns found!';
    RAISE WARNING '⚠️  Run migration: 20251116070000_fix_edn_oic_columns_schema.sql';
  END IF;

  IF has_competences_oic_rang_a AND has_oic_rang_a THEN
    RAISE NOTICE '✅ Both column naming conventions exist - will use competences_oic_rang_* as primary';
  ELSIF has_competences_oic_rang_a THEN
    RAISE NOTICE '✅ Using competences_oic_rang_* columns (standard naming)';
  ELSIF has_oic_rang_a THEN
    RAISE NOTICE '⚠️  Using oic_rang_* columns (legacy naming) - consider running schema fix';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- 1. GLOBAL STATISTICS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '1. GLOBAL STATISTICS';
  RAISE NOTICE '----------------------------------------';
END $$;

-- Overall counts
SELECT
  '1. GLOBAL STATISTICS' as section,
  COUNT(*) as total_edn_items,
  COUNT(*) FILTER (WHERE status = 'published') as published_items,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_items,
  COUNT(*) FILTER (WHERE completeness_score >= 90) as highly_complete_items,
  COUNT(*) FILTER (WHERE completeness_score BETWEEN 70 AND 89) as moderately_complete_items,
  COUNT(*) FILTER (WHERE completeness_score < 70) as low_complete_items,
  ROUND(AVG(completeness_score), 2) as avg_completeness_score
FROM edn_items_complete;

-- =====================================================
-- 2. COMPETENCIES COVERAGE ANALYSIS
-- =====================================================

SELECT
  '2. COMPETENCIES COVERAGE' as section,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE competences_oic_rang_a IS NOT NULL AND array_length(competences_oic_rang_a, 1) > 0) as items_with_rang_a,
  COUNT(*) FILTER (WHERE competences_oic_rang_b IS NOT NULL AND array_length(competences_oic_rang_b, 1) > 0) as items_with_rang_b,
  COUNT(*) FILTER (
    WHERE (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
      AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
  ) as items_without_competencies,
  ROUND(
    COUNT(*) FILTER (WHERE competences_oic_rang_a IS NOT NULL AND array_length(competences_oic_rang_a, 1) > 0) * 100.0 / COUNT(*),
    2
  ) as pct_with_rang_a,
  ROUND(
    COUNT(*) FILTER (WHERE competences_oic_rang_b IS NOT NULL AND array_length(competences_oic_rang_b, 1) > 0) * 100.0 / COUNT(*),
    2
  ) as pct_with_rang_b
FROM edn_items_complete;

-- =====================================================
-- 3. ITEMS WITHOUT ANY COMPETENCIES
-- =====================================================

SELECT
  '3. ITEMS WITHOUT COMPETENCIES' as section,
  item_code,
  title,
  specialite,
  status,
  completeness_score,
  CASE
    WHEN tableau_rang_a IS NOT NULL THEN 'Has Tableau A'
    WHEN tableau_rang_b IS NOT NULL THEN 'Has Tableau B'
    WHEN quiz_questions IS NOT NULL THEN 'Has Quiz'
    ELSE 'No Content'
  END as content_status
FROM edn_items_complete
WHERE (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
  AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
ORDER BY completeness_score DESC, item_code;

-- =====================================================
-- 4. COMPETENCY COUNT DISTRIBUTION
-- =====================================================

WITH competency_counts AS (
  SELECT
    item_code,
    title,
    COALESCE(array_length(competences_oic_rang_a, 1), 0) as count_rang_a,
    COALESCE(array_length(competences_oic_rang_b, 1), 0) as count_rang_b,
    COALESCE(array_length(competences_oic_rang_a, 1), 0) +
    COALESCE(array_length(competences_oic_rang_b, 1), 0) as total_competencies
  FROM edn_items_complete
)
SELECT
  '4. COMPETENCY COUNT DISTRIBUTION' as section,
  CASE
    WHEN total_competencies = 0 THEN '0 competencies'
    WHEN total_competencies BETWEEN 1 AND 5 THEN '1-5 competencies'
    WHEN total_competencies BETWEEN 6 AND 10 THEN '6-10 competencies'
    WHEN total_competencies BETWEEN 11 AND 15 THEN '11-15 competencies'
    WHEN total_competencies BETWEEN 16 AND 20 THEN '16-20 competencies'
    ELSE '20+ competencies'
  END as competency_range,
  COUNT(*) as item_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM competency_counts
GROUP BY competency_range
ORDER BY MIN(total_competencies);

-- =====================================================
-- 5. AVERAGE COMPETENCIES BY SPECIALTY
-- =====================================================

SELECT
  '5. COMPETENCIES BY SPECIALTY' as section,
  specialite,
  COUNT(*) as item_count,
  ROUND(AVG(COALESCE(array_length(competences_oic_rang_a, 1), 0)), 2) as avg_rang_a,
  ROUND(AVG(COALESCE(array_length(competences_oic_rang_b, 1), 0)), 2) as avg_rang_b,
  ROUND(AVG(
    COALESCE(array_length(competences_oic_rang_a, 1), 0) +
    COALESCE(array_length(competences_oic_rang_b, 1), 0)
  ), 2) as avg_total_competencies,
  ROUND(AVG(completeness_score), 2) as avg_completeness
FROM edn_items_complete
WHERE specialite IS NOT NULL
GROUP BY specialite
ORDER BY avg_total_competencies DESC;

-- =====================================================
-- 6. ITEMS WITH IMBALANCED COMPETENCIES
-- =====================================================
-- Items that have many of one rank but few of another

SELECT
  '6. IMBALANCED COMPETENCIES' as section,
  item_code,
  title,
  COALESCE(array_length(competences_oic_rang_a, 1), 0) as count_rang_a,
  COALESCE(array_length(competences_oic_rang_b, 1), 0) as count_rang_b,
  CASE
    WHEN COALESCE(array_length(competences_oic_rang_a, 1), 0) > 10
         AND COALESCE(array_length(competences_oic_rang_b, 1), 0) = 0
    THEN 'High Rang A, No Rang B'
    WHEN COALESCE(array_length(competences_oic_rang_b, 1), 0) > 10
         AND COALESCE(array_length(competences_oic_rang_a, 1), 0) = 0
    THEN 'High Rang B, No Rang A'
    WHEN ABS(
      COALESCE(array_length(competences_oic_rang_a, 1), 0) -
      COALESCE(array_length(competences_oic_rang_b, 1), 0)
    ) > 15
    THEN 'Large Imbalance'
    ELSE 'Normal'
  END as imbalance_type
FROM edn_items_complete
WHERE COALESCE(array_length(competences_oic_rang_a, 1), 0) +
      COALESCE(array_length(competences_oic_rang_b, 1), 0) > 0
  AND (
    -- One rank missing entirely
    (COALESCE(array_length(competences_oic_rang_a, 1), 0) > 10 AND COALESCE(array_length(competences_oic_rang_b, 1), 0) = 0)
    OR (COALESCE(array_length(competences_oic_rang_b, 1), 0) > 10 AND COALESCE(array_length(competences_oic_rang_a, 1), 0) = 0)
    -- Or large imbalance
    OR ABS(COALESCE(array_length(competences_oic_rang_a, 1), 0) - COALESCE(array_length(competences_oic_rang_b, 1), 0)) > 15
  )
ORDER BY count_rang_a + count_rang_b DESC;

-- =====================================================
-- 7. COMPLETENESS SCORE vs COMPETENCY COUNT CORRELATION
-- =====================================================

WITH competency_completeness AS (
  SELECT
    CASE
      WHEN completeness_score >= 90 THEN '90-100% Complete'
      WHEN completeness_score >= 70 THEN '70-89% Complete'
      WHEN completeness_score >= 50 THEN '50-69% Complete'
      ELSE 'Below 50% Complete'
    END as completeness_bracket,
    COALESCE(array_length(competences_oic_rang_a, 1), 0) +
    COALESCE(array_length(competences_oic_rang_b, 1), 0) as total_competencies
  FROM edn_items_complete
)
SELECT
  '7. COMPLETENESS vs COMPETENCIES' as section,
  completeness_bracket,
  COUNT(*) as item_count,
  ROUND(AVG(total_competencies), 2) as avg_competencies,
  MIN(total_competencies) as min_competencies,
  MAX(total_competencies) as max_competencies
FROM competency_completeness
GROUP BY completeness_bracket
ORDER BY MIN(CASE
  WHEN completeness_bracket = '90-100% Complete' THEN 4
  WHEN completeness_bracket = '70-89% Complete' THEN 3
  WHEN completeness_bracket = '50-69% Complete' THEN 2
  ELSE 1
END) DESC;

-- =====================================================
-- 8. ITEMS WITH CONTENT BUT NO COMPETENCIES
-- =====================================================
-- These are potentially problematic - they have content but no linkage

SELECT
  '8. CONTENT WITHOUT COMPETENCIES' as section,
  item_code,
  title,
  CASE
    WHEN tableau_rang_a IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_tableau_a,
  CASE
    WHEN tableau_rang_b IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_tableau_b,
  CASE
    WHEN quiz_questions IS NOT NULL AND jsonb_array_length(quiz_questions) > 0 THEN jsonb_array_length(quiz_questions)::text || ' questions'
    ELSE 'No'
  END as has_quiz,
  CASE
    WHEN scene_immersive IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_scene,
  completeness_score
FROM edn_items_complete
WHERE (
  tableau_rang_a IS NOT NULL
  OR tableau_rang_b IS NOT NULL
  OR (quiz_questions IS NOT NULL AND jsonb_array_length(quiz_questions) > 0)
  OR scene_immersive IS NOT NULL
)
AND (
  (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
  AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
)
ORDER BY completeness_score DESC;

-- =====================================================
-- 9. TOP ITEMS BY COMPETENCY COVERAGE
-- =====================================================

SELECT
  '9. TOP 20 ITEMS BY COMPETENCIES' as section,
  item_code,
  title,
  COALESCE(array_length(competences_oic_rang_a, 1), 0) as rang_a_count,
  COALESCE(array_length(competences_oic_rang_b, 1), 0) as rang_b_count,
  COALESCE(array_length(competences_oic_rang_a, 1), 0) +
  COALESCE(array_length(competences_oic_rang_b, 1), 0) as total_competencies,
  completeness_score,
  specialite
FROM edn_items_complete
ORDER BY
  (COALESCE(array_length(competences_oic_rang_a, 1), 0) +
   COALESCE(array_length(competences_oic_rang_b, 1), 0)) DESC,
  completeness_score DESC
LIMIT 20;

-- =====================================================
-- 10. ITEMS NEEDING ATTENTION (PRIORITY LIST)
-- =====================================================
-- Published items with low competency coverage

SELECT
  '10. PRIORITY FIX LIST' as section,
  item_code,
  title,
  status,
  COALESCE(array_length(competences_oic_rang_a, 1), 0) as rang_a_count,
  COALESCE(array_length(competences_oic_rang_b, 1), 0) as rang_b_count,
  completeness_score,
  CASE
    WHEN (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
         AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
    THEN 'CRITICAL: No competencies'
    WHEN COALESCE(array_length(competences_oic_rang_a, 1), 0) +
         COALESCE(array_length(competences_oic_rang_b, 1), 0) < 5
    THEN 'HIGH: Very few competencies'
    WHEN completeness_score < 70
    THEN 'MEDIUM: Low completeness'
    ELSE 'LOW'
  END as priority
FROM edn_items_complete
WHERE status = 'published'
  AND (
    completeness_score < 70
    OR COALESCE(array_length(competences_oic_rang_a, 1), 0) +
       COALESCE(array_length(competences_oic_rang_b, 1), 0) < 5
  )
ORDER BY
  CASE
    WHEN (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
         AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
    THEN 1
    WHEN COALESCE(array_length(competences_oic_rang_a, 1), 0) +
         COALESCE(array_length(competences_oic_rang_b, 1), 0) < 5
    THEN 2
    ELSE 3
  END,
  completeness_score ASC;

-- =====================================================
-- 11. COMPETENCY REUSE ANALYSIS
-- =====================================================
-- Which competencies are most commonly used across items

WITH competency_usage AS (
  SELECT
    unnest(competences_oic_rang_a) as competency_code,
    'Rang A' as competency_rank
  FROM edn_items_complete
  WHERE competences_oic_rang_a IS NOT NULL

  UNION ALL

  SELECT
    unnest(competences_oic_rang_b) as competency_code,
    'Rang B' as competency_rank
  FROM edn_items_complete
  WHERE competences_oic_rang_b IS NOT NULL
)
SELECT
  '11. MOST USED COMPETENCIES' as section,
  cu.competency_code,
  cu.competency_rank,
  oc.intitule as competency_title,
  COUNT(*) as usage_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM edn_items_complete), 2) as pct_of_items
FROM competency_usage cu
LEFT JOIN oic_competences oc ON cu.competency_code = oc.code_oic
GROUP BY cu.competency_code, cu.competency_rank, oc.intitule
ORDER BY usage_count DESC
LIMIT 30;

-- =====================================================
-- 12. UNUSED COMPETENCIES
-- =====================================================
-- Competencies that exist but are never used

SELECT
  '12. UNUSED COMPETENCIES (SAMPLE)' as section,
  oc.code_oic,
  oc.intitule,
  oc.rang,
  oc.item_parent
FROM oic_competences oc
WHERE NOT EXISTS (
  SELECT 1 FROM edn_items_complete e
  WHERE oc.code_oic = ANY(e.competences_oic_rang_a)
     OR oc.code_oic = ANY(e.competences_oic_rang_b)
)
ORDER BY oc.code_oic
LIMIT 50;

-- =====================================================
-- SUMMARY RECOMMENDATIONS
-- =====================================================

DO $$
DECLARE
  v_total_items INTEGER;
  v_items_without_comp INTEGER;
  v_avg_completeness NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_items FROM edn_items_complete;

  SELECT COUNT(*) INTO v_items_without_comp
  FROM edn_items_complete
  WHERE (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
    AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0);

  SELECT ROUND(AVG(completeness_score), 2) INTO v_avg_completeness FROM edn_items_complete;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'AUDIT SUMMARY & RECOMMENDATIONS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total EDN Items: %', v_total_items;
  RAISE NOTICE 'Items without competencies: % (%.1f%%)',
    v_items_without_comp,
    (v_items_without_comp * 100.0 / v_total_items);
  RAISE NOTICE 'Average completeness score: %', v_avg_completeness;
  RAISE NOTICE '';
  RAISE NOTICE 'RECOMMENDATIONS:';

  IF v_items_without_comp > 0 THEN
    RAISE NOTICE '1. ⚠️  % items have NO competencies - these should be prioritized', v_items_without_comp;
  END IF;

  IF v_avg_completeness < 80 THEN
    RAISE NOTICE '2. ⚠️  Average completeness is below 80%% - consider enrichment';
  ELSE
    RAISE NOTICE '2. ✅ Average completeness is good (%.1f%%)', v_avg_completeness;
  END IF;

  RAISE NOTICE '3. 📊 Review the "PRIORITY FIX LIST" section for items needing immediate attention';
  RAISE NOTICE '4. 🔍 Check "IMBALANCED COMPETENCIES" for items that may need rebalancing';
  RAISE NOTICE '5. 💡 Use the enrichment function: SELECT enrich_edn_item_metadata(item_code)';
  RAISE NOTICE '';
  RAISE NOTICE 'Audit completed: %', now();
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- EXPORT RESULTS TO JSON (OPTIONAL)
-- =====================================================
-- Uncomment to export to a JSON file

/*
COPY (
  SELECT jsonb_build_object(
    'audit_date', now(),
    'total_items', COUNT(*),
    'items_without_competencies', COUNT(*) FILTER (
      WHERE (competences_oic_rang_a IS NULL OR array_length(competences_oic_rang_a, 1) = 0)
        AND (competences_oic_rang_b IS NULL OR array_length(competences_oic_rang_b, 1) = 0)
    ),
    'avg_competencies', AVG(
      COALESCE(array_length(competences_oic_rang_a, 1), 0) +
      COALESCE(array_length(competences_oic_rang_b, 1), 0)
    ),
    'avg_completeness', AVG(completeness_score),
    'items_needing_attention', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'item_code', item_code,
          'title', title,
          'competencies', COALESCE(array_length(competences_oic_rang_a, 1), 0) +
                         COALESCE(array_length(competences_oic_rang_b, 1), 0),
          'completeness_score', completeness_score
        )
      )
      FROM edn_items_complete
      WHERE status = 'published'
        AND (
          completeness_score < 70
          OR COALESCE(array_length(competences_oic_rang_a, 1), 0) +
             COALESCE(array_length(competences_oic_rang_b, 1), 0) < 5
        )
      LIMIT 50
    )
  )
  FROM edn_items_complete
) TO '/tmp/edn_competencies_audit.json';
*/
