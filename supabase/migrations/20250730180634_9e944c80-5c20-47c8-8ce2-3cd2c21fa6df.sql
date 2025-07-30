-- 1. D'abord, fusionner le contenu de edn_items_immersive vers edn_items_complete
-- Mettre à jour edn_items_complete avec le contenu de edn_items_immersive quand c'est plus riche

UPDATE edn_items_complete 
SET 
  tableau_rang_a = COALESCE(
    CASE 
      WHEN immersive.tableau_rang_a IS NOT NULL 
      AND jsonb_array_length(COALESCE(immersive.tableau_rang_a->'sections', '[]'::jsonb)) > 
          jsonb_array_length(COALESCE(edn_items_complete.tableau_rang_a->'sections', '[]'::jsonb))
      THEN immersive.tableau_rang_a
      ELSE edn_items_complete.tableau_rang_a
    END,
    immersive.tableau_rang_a,
    edn_items_complete.tableau_rang_a
  ),
  tableau_rang_b = COALESCE(
    CASE 
      WHEN immersive.tableau_rang_b IS NOT NULL 
      AND jsonb_array_length(COALESCE(immersive.tableau_rang_b->'sections', '[]'::jsonb)) > 
          jsonb_array_length(COALESCE(edn_items_complete.tableau_rang_b->'sections', '[]'::jsonb))
      THEN immersive.tableau_rang_b
      ELSE edn_items_complete.tableau_rang_b
    END,
    immersive.tableau_rang_b,
    edn_items_complete.tableau_rang_b
  ),
  paroles_musicales = COALESCE(
    CASE 
      WHEN immersive.paroles_musicales IS NOT NULL 
      AND array_length(immersive.paroles_musicales, 1) > array_length(edn_items_complete.paroles_musicales, 1)
      THEN immersive.paroles_musicales
      ELSE edn_items_complete.paroles_musicales
    END,
    immersive.paroles_musicales,
    edn_items_complete.paroles_musicales
  ),
  scene_immersive = COALESCE(
    immersive.scene_immersive,
    edn_items_complete.scene_immersive
  ),
  quiz_questions = COALESCE(
    CASE 
      WHEN immersive.quiz_questions IS NOT NULL 
      AND jsonb_array_length(immersive.quiz_questions) > jsonb_array_length(COALESCE(edn_items_complete.quiz_questions, '[]'::jsonb))
      THEN immersive.quiz_questions
      ELSE edn_items_complete.quiz_questions
    END,
    immersive.quiz_questions,
    edn_items_complete.quiz_questions
  ),
  visual_ambiance = COALESCE(
    immersive.visual_ambiance,
    edn_items_complete.visual_ambiance
  ),
  audio_ambiance = COALESCE(
    immersive.audio_ambiance,
    edn_items_complete.audio_ambiance
  ),
  interaction_config = COALESCE(
    immersive.interaction_config,
    edn_items_complete.interaction_config
  ),
  reward_messages = COALESCE(
    immersive.reward_messages,
    edn_items_complete.reward_messages
  ),
  payload_v2 = COALESCE(
    immersive.payload_v2,
    edn_items_complete.payload_v2
  ),
  updated_at = now()
FROM edn_items_immersive immersive
WHERE edn_items_complete.item_code = immersive.item_code;

-- 2. Insérer les items qui existent uniquement dans edn_items_immersive
INSERT INTO edn_items_complete (
  item_code, title, subtitle, slug, pitch_intro,
  tableau_rang_a, tableau_rang_b, scene_immersive, 
  quiz_questions, paroles_musicales, 
  visual_ambiance, audio_ambiance, interaction_config, 
  reward_messages, payload_v2,
  created_at, updated_at
)
SELECT 
  immersive.item_code,
  immersive.title,
  immersive.subtitle,
  immersive.slug,
  immersive.pitch_intro,
  immersive.tableau_rang_a,
  immersive.tableau_rang_b,
  immersive.scene_immersive,
  immersive.quiz_questions,
  immersive.paroles_musicales,
  immersive.visual_ambiance,
  immersive.audio_ambiance,
  immersive.interaction_config,
  immersive.reward_messages,
  immersive.payload_v2,
  immersive.created_at,
  now()
FROM edn_items_immersive immersive
WHERE NOT EXISTS (
  SELECT 1 FROM edn_items_complete complete 
  WHERE complete.item_code = immersive.item_code
);

-- 3. Créer une sauvegarde de la table immersive avant suppression
CREATE TABLE IF NOT EXISTS backup_edn_items_immersive_final AS 
SELECT * FROM edn_items_immersive;

-- 4. Supprimer définitivement la table edn_items_immersive
DROP TABLE IF EXISTS edn_items_immersive CASCADE;

-- 5. Nettoyer les doublons dans edn_items_complete (garder le plus récent)
WITH duplicates AS (
  SELECT item_code, MIN(id) as keep_id
  FROM edn_items_complete
  GROUP BY item_code
  HAVING COUNT(*) > 1
)
DELETE FROM edn_items_complete 
WHERE id NOT IN (SELECT keep_id FROM duplicates)
AND item_code IN (SELECT item_code FROM duplicates);

-- 6. Mettre à jour les compétences pour s'assurer qu'elles sont complètes
UPDATE edn_items_complete 
SET 
  competences_oic_rang_a = COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique
      ) ORDER BY objectif_id
    )
    FROM oic_competences 
    WHERE item_parent = SUBSTRING(edn_items_complete.item_code FROM 'IC-(.+)')
    AND rang = 'A'),
    competences_oic_rang_a,
    '[]'::jsonb
  ),
  competences_oic_rang_b = COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique
      ) ORDER BY objectif_id
    )
    FROM oic_competences 
    WHERE item_parent = SUBSTRING(edn_items_complete.item_code FROM 'IC-(.+)')
    AND rang = 'B'),
    competences_oic_rang_b,
    '[]'::jsonb
  ),
  competences_count_rang_a = COALESCE(
    (SELECT COUNT(*) 
     FROM oic_competences 
     WHERE item_parent = SUBSTRING(edn_items_complete.item_code FROM 'IC-(.+)')
     AND rang = 'A'),
    0
  ),
  competences_count_rang_b = COALESCE(
    (SELECT COUNT(*) 
     FROM oic_competences 
     WHERE item_parent = SUBSTRING(edn_items_complete.item_code FROM 'IC-(.+)')
     AND rang = 'B'),
    0
  ),
  competences_count_total = COALESCE(
    (SELECT COUNT(*) 
     FROM oic_competences 
     WHERE item_parent = SUBSTRING(edn_items_complete.item_code FROM 'IC-(.+)')),
    0
  ),
  updated_at = now()
WHERE item_code LIKE 'IC-%';