-- =====================================================
-- FIX EDN OIC COMPETENCIES SCHEMA DISCREPANCY
-- =====================================================
-- This migration fixes the column naming mismatch between:
--   - competences_oic_rang_a/b (from table creation)
--   - oic_rang_a/b (from sync migration)
--
-- Strategy: Ensure both column sets exist and are synchronized
-- Priority: CRITICAL - Affects completeness metrics
-- Created: 2025-11-16
-- =====================================================

DO $$
DECLARE
  has_competences_oic_rang_a BOOLEAN;
  has_competences_oic_rang_b BOOLEAN;
  has_oic_rang_a BOOLEAN;
  has_oic_rang_b BOOLEAN;
  rows_updated INTEGER := 0;
BEGIN
  RAISE NOTICE '🔧 Starting OIC columns schema fix...';
  RAISE NOTICE '====================================================';

  -- Check which columns exist
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'edn_items_complete'
      AND column_name = 'competences_oic_rang_a'
  ) INTO has_competences_oic_rang_a;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'edn_items_complete'
      AND column_name = 'competences_oic_rang_b'
  ) INTO has_competences_oic_rang_b;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'edn_items_complete'
      AND column_name = 'oic_rang_a'
  ) INTO has_oic_rang_a;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'edn_items_complete'
      AND column_name = 'oic_rang_b'
  ) INTO has_oic_rang_b;

  -- Report current state
  RAISE NOTICE 'Current schema state:';
  RAISE NOTICE '  competences_oic_rang_a exists: %', has_competences_oic_rang_a;
  RAISE NOTICE '  competences_oic_rang_b exists: %', has_competences_oic_rang_b;
  RAISE NOTICE '  oic_rang_a exists: %', has_oic_rang_a;
  RAISE NOTICE '  oic_rang_b exists: %', has_oic_rang_b;
  RAISE NOTICE '';

  -- Add missing competences_oic_rang_* columns if they don't exist
  IF NOT has_competences_oic_rang_a THEN
    RAISE NOTICE '➕ Adding competences_oic_rang_a column...';
    ALTER TABLE edn_items_complete
    ADD COLUMN competences_oic_rang_a jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT has_competences_oic_rang_b THEN
    RAISE NOTICE '➕ Adding competences_oic_rang_b column...';
    ALTER TABLE edn_items_complete
    ADD COLUMN competences_oic_rang_b jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add missing oic_rang_* columns if they don't exist
  IF NOT has_oic_rang_a THEN
    RAISE NOTICE '➕ Adding oic_rang_a column...';
    ALTER TABLE edn_items_complete
    ADD COLUMN oic_rang_a jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT has_oic_rang_b THEN
    RAISE NOTICE '➕ Adding oic_rang_b column...';
    ALTER TABLE edn_items_complete
    ADD COLUMN oic_rang_b jsonb DEFAULT '[]'::jsonb;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🔄 Synchronizing data between column sets...';

  -- Sync data: If one column set has data and the other doesn't, copy it over
  -- This handles both scenarios regardless of which migration ran

  -- Sync oic_rang_a → competences_oic_rang_a (if competences is empty but oic has data)
  UPDATE edn_items_complete
  SET competences_oic_rang_a = oic_rang_a
  WHERE (competences_oic_rang_a IS NULL OR competences_oic_rang_a = '[]'::jsonb)
    AND oic_rang_a IS NOT NULL
    AND oic_rang_a != '[]'::jsonb;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '  Synced % items: oic_rang_a → competences_oic_rang_a', rows_updated;

  -- Sync competences_oic_rang_a → oic_rang_a (if oic is empty but competences has data)
  UPDATE edn_items_complete
  SET oic_rang_a = competences_oic_rang_a
  WHERE (oic_rang_a IS NULL OR oic_rang_a = '[]'::jsonb)
    AND competences_oic_rang_a IS NOT NULL
    AND competences_oic_rang_a != '[]'::jsonb;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '  Synced % items: competences_oic_rang_a → oic_rang_a', rows_updated;

  -- Sync oic_rang_b → competences_oic_rang_b
  UPDATE edn_items_complete
  SET competences_oic_rang_b = oic_rang_b
  WHERE (competences_oic_rang_b IS NULL OR competences_oic_rang_b = '[]'::jsonb)
    AND oic_rang_b IS NOT NULL
    AND oic_rang_b != '[]'::jsonb;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '  Synced % items: oic_rang_b → competences_oic_rang_b', rows_updated;

  -- Sync competences_oic_rang_b → oic_rang_b
  UPDATE edn_items_complete
  SET oic_rang_b = competences_oic_rang_b
  WHERE (oic_rang_b IS NULL OR oic_rang_b = '[]'::jsonb)
    AND competences_oic_rang_b IS NOT NULL
    AND competences_oic_rang_b != '[]'::jsonb;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE '  Synced % items: competences_oic_rang_b → oic_rang_b', rows_updated;

  RAISE NOTICE '';
  RAISE NOTICE '🔄 Re-syncing from oic_competences source...';

  -- Now re-run the sync from oic_competences to ensure both column sets are populated
  FOR item_code IN 1..367 LOOP
    DECLARE
      item_code_num TEXT;
      oic_a_data JSONB;
      oic_b_data JSONB;
    BEGIN
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

      -- Update BOTH column sets in edn_items_complete
      IF jsonb_array_length(oic_a_data) > 0 OR jsonb_array_length(oic_b_data) > 0 THEN
        UPDATE edn_items_complete
        SET
          competences_oic_rang_a = oic_a_data,
          competences_oic_rang_b = oic_b_data,
          oic_rang_a = oic_a_data,
          oic_rang_b = oic_b_data,
          updated_at = NOW()
        WHERE item_code = 'IC-' || item_code;
      END IF;
    END;
  END LOOP;

  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ SCHEMA FIX COMPLETE';
  RAISE NOTICE '====================================================';

  -- Verify final state
  DECLARE
    items_with_comp_a INTEGER;
    items_with_comp_b INTEGER;
    items_with_oic_a INTEGER;
    items_with_oic_b INTEGER;
    items_total INTEGER := 367;
  BEGIN
    SELECT COUNT(*) INTO items_with_comp_a
    FROM edn_items_complete
    WHERE jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)) > 0;

    SELECT COUNT(*) INTO items_with_comp_b
    FROM edn_items_complete
    WHERE jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb)) > 0;

    SELECT COUNT(*) INTO items_with_oic_a
    FROM edn_items_complete
    WHERE jsonb_array_length(COALESCE(oic_rang_a, '[]'::jsonb)) > 0;

    SELECT COUNT(*) INTO items_with_oic_b
    FROM edn_items_complete
    WHERE jsonb_array_length(COALESCE(oic_rang_b, '[]'::jsonb)) > 0;

    RAISE NOTICE '';
    RAISE NOTICE '📊 FINAL STATE';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Items with competences_oic_rang_a: %/% (%%)', items_with_comp_a, items_total,
      ROUND((items_with_comp_a::NUMERIC / items_total) * 100, 1);
    RAISE NOTICE 'Items with competences_oic_rang_b: %/% (%%)', items_with_comp_b, items_total,
      ROUND((items_with_comp_b::NUMERIC / items_total) * 100, 1);
    RAISE NOTICE 'Items with oic_rang_a: %/% (%%)', items_with_oic_a, items_total,
      ROUND((items_with_oic_a::NUMERIC / items_total) * 100, 1);
    RAISE NOTICE 'Items with oic_rang_b: %/% (%%)', items_with_oic_b, items_total,
      ROUND((items_with_oic_b::NUMERIC / items_total) * 100, 1);
    RAISE NOTICE '====================================================';

    -- Verify synchronization
    IF items_with_comp_a != items_with_oic_a OR items_with_comp_b != items_with_oic_b THEN
      RAISE WARNING '⚠️  Column sets are not synchronized! Manual review required.';
    ELSE
      RAISE NOTICE '✅ Column sets are perfectly synchronized!';
    END IF;
  END;

END $$;

-- Add index for the new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_edn_competences_oic_rang_a
  ON edn_items_complete USING GIN (competences_oic_rang_a);

CREATE INDEX IF NOT EXISTS idx_edn_competences_oic_rang_b
  ON edn_items_complete USING GIN (competences_oic_rang_b);

CREATE INDEX IF NOT EXISTS idx_edn_oic_rang_a
  ON edn_items_complete USING GIN (oic_rang_a);

CREATE INDEX IF NOT EXISTS idx_edn_oic_rang_b
  ON edn_items_complete USING GIN (oic_rang_b);

-- Update table comment
COMMENT ON TABLE edn_items_complete IS 'Unified EDN items with OIC competencies - uses both competences_oic_rang_* and oic_rang_* column sets for compatibility';
