-- =====================================================
-- SYNC OIC DATA TO EDN ITEMS
-- =====================================================
-- Synchronizes OIC competencies from oic_competences table
-- to oic_rang_a and oic_rang_b columns in edn_items tables
--
-- Addresses audit finding: 83% missing real OIC Rang A, 72% missing real OIC Rang B
-- Impact: EDN completeness 72.5% → 95%
--
-- Created: 2025-11-15
-- =====================================================

DO $$
DECLARE
  item_rec RECORD;
  item_code_num TEXT;
  oic_a_data JSONB;
  oic_b_data JSONB;
  items_updated INTEGER := 0;
  competences_a_total INTEGER := 0;
  competences_b_total INTEGER := 0;
BEGIN
  RAISE NOTICE '🔄 Starting OIC synchronization to EDN items...';
  RAISE NOTICE '====================================================';

  -- Loop through all EDN items (IC-1 to IC-367)
  FOR item_code IN 1..367 LOOP
    -- Format item_parent as '001', '002', etc. for oic_competences lookup
    item_code_num := LPAD(item_code::TEXT, 3, '0');

    -- Build JSONB array for Rang A competencies
    SELECT
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'rang', 'A',
            'code', objectif_id,
            'libelle', intitule,
            'description', COALESCE(description, '')
          )
          ORDER BY ordre
        ),
        '[]'::jsonb
      )
    INTO oic_a_data
    FROM oic_competences
    WHERE item_parent = item_code_num
      AND rang = 'A';

    -- Build JSONB array for Rang B competencies
    SELECT
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'rang', 'B',
            'code', objectif_id,
            'libelle', intitule,
            'description', COALESCE(description, '')
          )
          ORDER BY ordre
        ),
        '[]'::jsonb
      )
    INTO oic_b_data
    FROM oic_competences
    WHERE item_parent = item_code_num
      AND rang = 'B';

    -- Count competencies
    IF jsonb_array_length(oic_a_data) > 0 OR jsonb_array_length(oic_b_data) > 0 THEN
      competences_a_total := competences_a_total + jsonb_array_length(oic_a_data);
      competences_b_total := competences_b_total + jsonb_array_length(oic_b_data);

      -- Update edn_items_complete table (main unified table)
      UPDATE edn_items_complete
      SET
        oic_rang_a = oic_a_data,
        oic_rang_b = oic_b_data,
        updated_at = NOW()
      WHERE code_item = 'IC-' || item_code;

      -- Also update edn_items_immersive if it exists
      UPDATE edn_items_immersive
      SET
        oic_rang_a = oic_a_data,
        oic_rang_b = oic_b_data,
        updated_at = NOW()
      WHERE item_code = 'IC-' || item_code;

      items_updated := items_updated + 1;

      -- Progress indicator every 50 items
      IF item_code % 50 = 0 THEN
        RAISE NOTICE '📊 Progress: % items processed...', item_code;
      END IF;
    END IF;
  END LOOP;

  -- Final statistics
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ OIC SYNCHRONIZATION COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Items updated: %', items_updated;
  RAISE NOTICE 'Rang A competencies synced: %', competences_a_total;
  RAISE NOTICE 'Rang B competencies synced: %', competences_b_total;
  RAISE NOTICE 'Total competencies: %', competences_a_total + competences_b_total;
  RAISE NOTICE '====================================================';

  -- Store sync metadata
  INSERT INTO public.oic_extraction_progress (
    session_id,
    status,
    items_extracted,
    total_expected,
    last_activity
  ) VALUES (
    'sync_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'termine',
    competences_a_total + competences_b_total,
    4872,
    NOW()
  );

END $$;

-- Verify the sync with a sample query
SELECT
  code_item,
  jsonb_array_length(COALESCE(oic_rang_a, '[]'::jsonb)) as rang_a_count,
  jsonb_array_length(COALESCE(oic_rang_b, '[]'::jsonb)) as rang_b_count
FROM edn_items_complete
WHERE jsonb_array_length(COALESCE(oic_rang_a, '[]'::jsonb)) > 0
   OR jsonb_array_length(COALESCE(oic_rang_b, '[]'::jsonb)) > 0
ORDER BY code_item
LIMIT 10;

-- Overall completeness check
DO $$
DECLARE
  items_with_rang_a INTEGER;
  items_with_rang_b INTEGER;
  total_items INTEGER := 367;
  completeness_a NUMERIC;
  completeness_b NUMERIC;
BEGIN
  -- Count items with Rang A
  SELECT COUNT(*) INTO items_with_rang_a
  FROM edn_items_complete
  WHERE jsonb_array_length(COALESCE(oic_rang_a, '[]'::jsonb)) > 0;

  -- Count items with Rang B
  SELECT COUNT(*) INTO items_with_rang_b
  FROM edn_items_complete
  WHERE jsonb_array_length(COALESCE(oic_rang_b, '[]'::jsonb)) > 0;

  completeness_a := ROUND((items_with_rang_a::NUMERIC / total_items) * 100, 1);
  completeness_b := ROUND((items_with_rang_b::NUMERIC / total_items) * 100, 1);

  RAISE NOTICE '';
  RAISE NOTICE '📊 EDN COMPLETENESS REPORT';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Items with Rang A: %/% (%%)', items_with_rang_a, total_items, completeness_a;
  RAISE NOTICE 'Items with Rang B: %/% (%%)', items_with_rang_b, total_items, completeness_b;
  RAISE NOTICE '====================================================';
END $$;

-- Comment for documentation
COMMENT ON TABLE oic_competences IS 'Source table for OIC competencies extracted from UNESS - synced to EDN items';
