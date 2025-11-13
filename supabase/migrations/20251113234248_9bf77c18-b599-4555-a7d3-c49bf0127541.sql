-- ============================================
-- Vue matérialisée unifiée pour les items EDN
-- ============================================
-- Cette vue fusionne edn_items_immersive et edn_items_complete
-- pour éviter les doubles requêtes et améliorer les performances

CREATE MATERIALIZED VIEW IF NOT EXISTS edn_items_unified AS
SELECT 
  -- Identifiants et métadonnées de base (immersive)
  i.id,
  i.item_code,
  i.slug,
  i.title,
  i.subtitle,
  i.created_at,
  i.updated_at,
  
  -- Métadonnées enrichies (complete)
  c.specialite,
  c.domaine_medical,
  c.niveau_complexite,
  c.mots_cles,
  c.tags_medicaux,
  c.status,
  
  -- Scores et validation (complete)
  c.completeness_score,
  c.is_validated,
  c.validation_date,
  
  -- Compteurs de compétences (immersive + complete)
  COALESCE(i.competences_count_rang_a, c.competences_count_rang_a, 0) as competences_count_rang_a,
  COALESCE(i.competences_count_rang_b, c.competences_count_rang_b, 0) as competences_count_rang_b,
  COALESCE(i.competences_count_total, c.competences_count_total, 0) as competences_count_total,
  
  -- Flags de disponibilité des contenus (pour éviter de charger les gros JSON)
  (i.tableau_rang_a IS NOT NULL AND i.tableau_rang_a != 'null'::jsonb) as has_tableau_rang_a,
  (i.tableau_rang_b IS NOT NULL AND i.tableau_rang_b != 'null'::jsonb) as has_tableau_rang_b,
  (i.paroles_musicales IS NOT NULL AND array_length(i.paroles_musicales, 1) > 0) as has_paroles_musicales,
  (i.paroles_rang_a IS NOT NULL AND array_length(i.paroles_rang_a, 1) > 0) as has_paroles_rang_a,
  (i.paroles_rang_b IS NOT NULL AND array_length(i.paroles_rang_b, 1) > 0) as has_paroles_rang_b,
  (i.paroles_rang_ab IS NOT NULL AND array_length(i.paroles_rang_ab, 1) > 0) as has_paroles_rang_ab,
  (i.scene_immersive IS NOT NULL AND i.scene_immersive != 'null'::jsonb) as has_scene_immersive,
  (i.quiz_questions IS NOT NULL AND i.quiz_questions != 'null'::jsonb) as has_quiz_questions,
  (i.audio_ambiance IS NOT NULL AND i.audio_ambiance != 'null'::jsonb) as has_audio_ambiance,
  (i.visual_ambiance IS NOT NULL AND i.visual_ambiance != 'null'::jsonb) as has_visual_ambiance,
  
  -- Compétences OIC (pour affichage rapide)
  c.competences_oic_rang_a,
  c.competences_oic_rang_b
  
FROM edn_items_immersive i
LEFT JOIN edn_items_complete c ON i.item_code = c.item_code
ORDER BY i.item_code;

-- Index pour optimiser les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_edn_items_unified_item_code ON edn_items_immersive(item_code);
CREATE INDEX IF NOT EXISTS idx_edn_items_unified_slug ON edn_items_immersive(slug);
CREATE INDEX IF NOT EXISTS idx_edn_items_unified_completeness ON edn_items_immersive(item_code);

-- Fonction pour rafraîchir la vue matérialisée
CREATE OR REPLACE FUNCTION refresh_edn_items_unified()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW edn_items_unified;
END;
$$;

-- Commentaire explicatif
COMMENT ON MATERIALIZED VIEW edn_items_unified IS 
  'Vue unifiée des items EDN pour optimiser les performances. 
   Rafraîchir avec: SELECT refresh_edn_items_unified();';

-- Rafraîchir immédiatement la vue
REFRESH MATERIALIZED VIEW edn_items_unified;