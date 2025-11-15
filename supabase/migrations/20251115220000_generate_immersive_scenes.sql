-- =====================================================
-- GENERATE IMMERSIVE SCENES FOR EDN ITEMS
-- =====================================================
-- Generates quality immersive scene descriptions
-- for EDN items based on title, specialty, and OIC data
--
-- Addresses audit finding: 86% missing immersive scenes (317 items)
-- Impact: Generate 317 immersive scene descriptions
--
-- Created: 2025-11-15
-- =====================================================

-- Function to generate immersive scene from item data
CREATE OR REPLACE FUNCTION generate_immersive_scene(p_item_code TEXT)
RETURNS JSONB AS $$
DECLARE
  item_data RECORD;
  scene JSONB;
  visual_desc TEXT;
  audio_desc TEXT;
  context_desc TEXT;
  oic_first_a TEXT;
  oic_first_b TEXT;
BEGIN
  -- Fetch EDN item data
  SELECT code_item, title, description, speciality, oic_rang_a, oic_rang_b
  INTO item_data
  FROM edn_items_complete
  WHERE code_item = p_item_code;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Extract first OIC competencies for context
  IF item_data.oic_rang_a IS NOT NULL AND jsonb_array_length(item_data.oic_rang_a) > 0 THEN
    oic_first_a := item_data.oic_rang_a->0->>'libelle';
  END IF;

  IF item_data.oic_rang_b IS NOT NULL AND jsonb_array_length(item_data.oic_rang_b) > 0 THEN
    oic_first_b := item_data.oic_rang_b->0->>'libelle';
  END IF;

  -- Generate specialty-specific context
  context_desc := CASE item_data.speciality
    WHEN 'Cardiologie' THEN 'Vous êtes en consultation de cardiologie. Un patient consulte pour '
    WHEN 'Pneumologie' THEN 'Aux urgences respiratoires. Un patient se présente avec '
    WHEN 'Gastroentérologie' THEN 'En consultation de gastroentérologie. Le patient rapporte '
    WHEN 'Neurologie' THEN 'En consultation de neurologie. Le patient présente '
    WHEN 'Psychiatrie' THEN 'En consultation de psychiatrie. Vous rencontrez un patient avec '
    WHEN 'Pédiatrie' THEN 'En consultation de pédiatrie. Les parents consultent pour leur enfant présentant '
    WHEN 'Gynécologie' THEN 'En consultation de gynécologie. Une patiente consulte pour '
    WHEN 'Endocrinologie' THEN 'En consultation d''endocrinologie. Le patient est suivi pour '
    WHEN 'Rhumatologie' THEN 'En consultation de rhumatologie. Le patient se plaint de '
    WHEN 'Dermatologie' THEN 'En consultation de dermatologie. Le patient présente '
    WHEN 'ORL' THEN 'En consultation ORL. Le patient consulte pour '
    WHEN 'Ophtalmologie' THEN 'En consultation d''ophtalmologie. Le patient rapporte '
    WHEN 'Urologie' THEN 'En consultation d''urologie. Le patient consulte pour '
    WHEN 'Néphrologie' THEN 'En consultation de néphrologie. Le patient est adressé pour '
    WHEN 'Hématologie' THEN 'En consultation d''hématologie. Les examens biologiques montrent '
    WHEN 'Oncologie' THEN 'En consultation d''oncologie. Le patient est suivi pour '
    WHEN 'Médecine générale' THEN 'En cabinet de médecine générale. Un patient consulte pour '
    ELSE 'En consultation médicale. Un patient se présente avec '
  END || lower(item_data.title) || '.';

  -- Generate visual description
  visual_desc := format(
    'Scène clinique: %s. Vous êtes dans un environnement professionnel %s. ' ||
    'Le patient est installé confortablement. Vous disposez de votre matériel d''examen. ' ||
    'Sur votre bureau, le dossier médical du patient et vos notes. ' ||
    '%s',
    item_data.title,
    CASE item_data.speciality
      WHEN 'Urgences' THEN 'aux urgences avec monitoring continu'
      WHEN 'Réanimation' THEN 'en soins intensifs avec équipement de surveillance'
      ELSE 'de consultation médicale bien équipé'
    END,
    CASE WHEN oic_first_a IS NOT NULL
      THEN 'Vous devez évaluer: ' || oic_first_a || '.'
      ELSE ''
    END
  );

  -- Generate audio description
  audio_desc := format(
    'Ambiance sonore: %s. ' ||
    'Vous entendez le patient décrire ses symptômes. ' ||
    '%s ' ||
    'Votre voix professionnelle et rassurante guide l''entretien clinique.',
    CASE item_data.speciality
      WHEN 'Urgences' THEN 'Bruits de monitoring, annonces du service, léger fond sonore d''activité hospitalière'
      WHEN 'Réanimation' THEN 'Bips réguliers des moniteurs, ventilation mécanique en arrière-plan'
      WHEN 'Cardiologie' THEN 'Bruit subtil de monitoring cardiaque'
      ELSE 'Calme d''un cabinet médical, léger fond musical apaisant'
    END,
    CASE WHEN oic_first_b IS NOT NULL
      THEN 'Vous expliquez au patient: ' || oic_first_b || '.'
      ELSE 'Vous expliquez la démarche diagnostique.'
    END
  );

  -- Build complete scene object
  scene := jsonb_build_object(
    'context', context_desc,
    'visual', visual_desc,
    'audio', audio_desc,
    'specialty', item_data.speciality,
    'clinical_setting', CASE item_data.speciality
      WHEN 'Urgences' THEN 'emergency'
      WHEN 'Réanimation' THEN 'intensive_care'
      WHEN 'Médecine générale' THEN 'primary_care'
      ELSE 'specialty_consultation'
    END,
    'interaction_type', 'consultation',
    'patient_presentation', CASE
      WHEN item_data.description IS NOT NULL THEN item_data.description
      ELSE 'Présentation clinique de ' || item_data.title
    END,
    'generated_from', 'oic_and_specialty',
    'generation_date', to_char(NOW(), 'YYYY-MM-DD')
  );

  RETURN scene;
END;
$$ LANGUAGE plpgsql;

-- Generate and store immersive scenes for items without them
DO $$
DECLARE
  item_rec RECORD;
  generated_scene JSONB;
  items_processed INTEGER := 0;
BEGIN
  RAISE NOTICE '🎨 Starting immersive scene generation...';
  RAISE NOTICE '====================================================';

  -- Loop through items that don't have scenes yet
  FOR item_rec IN
    SELECT code_item, title
    FROM edn_items_complete
    WHERE scene_immersive IS NULL
       OR scene_immersive::text = '{}'
       OR scene_immersive::text = 'null'
    ORDER BY code_item
  LOOP
    -- Generate scene for this item
    generated_scene := generate_immersive_scene(item_rec.code_item);

    IF generated_scene IS NOT NULL THEN
      -- Update the item with generated scene
      UPDATE edn_items_complete
      SET
        scene_immersive = generated_scene,
        updated_at = NOW()
      WHERE code_item = item_rec.code_item;

      -- Also update immersive table
      UPDATE edn_items_immersive
      SET
        scene_immersive = generated_scene,
        updated_at = NOW()
      WHERE item_code = item_rec.code_item;

      items_processed := items_processed + 1;

      -- Progress indicator every 50 items
      IF items_processed % 50 = 0 THEN
        RAISE NOTICE '📊 Progress: % scenes generated...', items_processed;
      END IF;
    END IF;
  END LOOP;

  -- Final statistics
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ IMMERSIVE SCENE GENERATION COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Scenes generated: %', items_processed;
  RAISE NOTICE '====================================================';
END $$;

-- Verify scene generation
SELECT
  code_item,
  title,
  speciality,
  scene_immersive->>'specialty' as scene_specialty,
  scene_immersive->>'clinical_setting' as setting,
  LENGTH(scene_immersive->>'visual') as visual_length
FROM edn_items_complete
WHERE scene_immersive IS NOT NULL
  AND scene_immersive::text != '{}'
ORDER BY code_item
LIMIT 10;

-- Overall scene completeness report
DO $$
DECLARE
  items_with_scene INTEGER;
  total_items INTEGER := 367;
  completeness NUMERIC;
  avg_visual_length NUMERIC;
  avg_audio_length NUMERIC;
BEGIN
  -- Count items with scenes
  SELECT COUNT(*) INTO items_with_scene
  FROM edn_items_complete
  WHERE scene_immersive IS NOT NULL
    AND scene_immersive::text != '{}'
    AND scene_immersive::text != 'null';

  -- Calculate average lengths
  SELECT
    ROUND(AVG(LENGTH(scene_immersive->>'visual')), 0),
    ROUND(AVG(LENGTH(scene_immersive->>'audio')), 0)
  INTO avg_visual_length, avg_audio_length
  FROM edn_items_complete
  WHERE scene_immersive IS NOT NULL
    AND scene_immersive::text != '{}';

  completeness := ROUND((items_with_scene::NUMERIC / total_items) * 100, 1);

  RAISE NOTICE '';
  RAISE NOTICE '📊 IMMERSIVE SCENE COMPLETENESS REPORT';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Items with scenes: %/% (%%)', items_with_scene, total_items, completeness;
  RAISE NOTICE 'Average visual description length: % chars', avg_visual_length;
  RAISE NOTICE 'Average audio description length: % chars', avg_audio_length;
  RAISE NOTICE '====================================================';
END $$;

-- Add comment
COMMENT ON FUNCTION generate_immersive_scene(TEXT) IS 'Generates immersive clinical scene based on EDN item data, specialty, and OIC competencies';
