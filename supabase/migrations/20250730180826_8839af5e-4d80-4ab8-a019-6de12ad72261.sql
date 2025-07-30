-- 1. Fusionner le contenu de edn_items_immersive vers edn_items_complete (version corrigée)
UPDATE edn_items_complete 
SET 
  tableau_rang_a = COALESCE(immersive.tableau_rang_a, edn_items_complete.tableau_rang_a),
  tableau_rang_b = COALESCE(immersive.tableau_rang_b, edn_items_complete.tableau_rang_b),
  paroles_musicales = COALESCE(immersive.paroles_musicales, edn_items_complete.paroles_musicales),
  scene_immersive = COALESCE(immersive.scene_immersive, edn_items_complete.scene_immersive),
  quiz_questions = COALESCE(immersive.quiz_questions, edn_items_complete.quiz_questions),
  visual_ambiance = COALESCE(immersive.visual_ambiance, edn_items_complete.visual_ambiance),
  audio_ambiance = COALESCE(immersive.audio_ambiance, edn_items_complete.audio_ambiance),
  interaction_config = COALESCE(immersive.interaction_config, edn_items_complete.interaction_config),
  reward_messages = COALESCE(immersive.reward_messages, edn_items_complete.reward_messages),
  payload_v2 = COALESCE(immersive.payload_v2, edn_items_complete.payload_v2),
  updated_at = now()
FROM edn_items_immersive immersive
WHERE edn_items_complete.item_code = immersive.item_code;

-- 2. Créer une sauvegarde complète avant suppression
CREATE TABLE IF NOT EXISTS backup_edn_items_immersive_final AS 
SELECT * FROM edn_items_immersive;

-- 3. Supprimer définitivement la table edn_items_immersive
DROP TABLE IF EXISTS edn_items_immersive CASCADE;

-- 4. Nettoyer les doublons dans edn_items_complete
DELETE FROM edn_items_complete a 
USING edn_items_complete b 
WHERE a.id > b.id 
AND a.item_code = b.item_code;

-- 5. Mettre à jour les compétences OIC pour tous les items
UPDATE edn_items_complete 
SET 
  competences_oic_rang_a = (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique
      ) ORDER BY objectif_id
    ), '[]'::jsonb)
    FROM oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(edn_items_complete.item_code FROM 'IC-([0-9]+)')::text, 3, '0')
    AND rang = 'A'
  ),
  competences_oic_rang_b = (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'objectif_id', objectif_id,
        'intitule', intitule,
        'description', description,
        'rubrique', rubrique
      ) ORDER BY objectif_id
    ), '[]'::jsonb)
    FROM oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(edn_items_complete.item_code FROM 'IC-([0-9]+)')::text, 3, '0')
    AND rang = 'B'
  ),
  competences_count_rang_a = (
    SELECT COUNT(*) 
    FROM oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(edn_items_complete.item_code FROM 'IC-([0-9]+)')::text, 3, '0')
    AND rang = 'A'
  ),
  competences_count_rang_b = (
    SELECT COUNT(*) 
    FROM oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(edn_items_complete.item_code FROM 'IC-([0-9]+)')::text, 3, '0')
    AND rang = 'B'
  ),
  competences_count_total = (
    SELECT COUNT(*) 
    FROM oic_competences 
    WHERE item_parent = LPAD(SUBSTRING(edn_items_complete.item_code FROM 'IC-([0-9]+)')::text, 3, '0')
  ),
  updated_at = now()
WHERE item_code LIKE 'IC-%';