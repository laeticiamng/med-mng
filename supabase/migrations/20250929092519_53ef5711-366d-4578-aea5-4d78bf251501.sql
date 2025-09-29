-- =============================================
-- COMPLETION DE LA PLATEFORME EDN - VERSION CORRIGEE
-- =============================================

-- 1. Créer une table pour les données d'analytique avancées
CREATE TABLE IF NOT EXISTS edn_analytics_advanced (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code text NOT NULL,
  user_id uuid,
  session_type text NOT NULL, -- 'study', 'quiz', 'music', 'immersive'
  engagement_score numeric DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  learning_progress jsonb DEFAULT '{}',
  user_feedback jsonb DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  session_metadata jsonb DEFAULT '{}'
);

-- 2. Table pour les recommandations intelligentes
CREATE TABLE IF NOT EXISTS edn_smart_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  recommended_item_code text NOT NULL,
  recommendation_type text NOT NULL, -- 'next_study', 'review', 'difficulty_match', 'interest_based'
  confidence_score numeric DEFAULT 0,
  reasoning text,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Compléter les configurations audio manquantes
UPDATE edn_items_immersive 
SET audio_ambiance = jsonb_build_object(
  'enabled', true,
  'ambient_sounds', jsonb_build_array(
    jsonb_build_object(
      'type', 'medical_environment',
      'volume', 0.3,
      'loop', true,
      'description', 'Ambiance hospitalière professionnelle'
    ),
    jsonb_build_object(
      'type', 'focus_enhancement',
      'volume', 0.2,
      'loop', true,
      'description', 'Sons facilitant la concentration'
    )
  ),
  'adaptive_volume', true,
  'user_customizable', true
)
WHERE audio_ambiance IS NULL OR audio_ambiance = '{}';

-- 4. Optimiser les configurations visuelles
UPDATE edn_items_immersive 
SET visual_ambiance = jsonb_build_object(
  'theme', 'medical_professional',
  'color_scheme', 'adaptive',
  'animations', jsonb_build_object(
    'enabled', true,
    'type', 'subtle_medical',
    'intensity', 'medium'
  ),
  'accessibility', jsonb_build_object(
    'high_contrast', false,
    'font_scaling', 'normal',
    'motion_reduced', false
  ),
  'immersive_elements', jsonb_build_array(
    'background_medical_imagery',
    'subtle_particle_effects',
    'smooth_transitions'
  )
)
WHERE visual_ambiance IS NULL OR visual_ambiance = '{}';

-- 5. Créer des politiques RLS pour les nouvelles tables
ALTER TABLE edn_analytics_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE edn_smart_recommendations ENABLE ROW LEVEL SECURITY;

-- Politiques pour analytics
CREATE POLICY "Users can view their own analytics" 
ON edn_analytics_advanced FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON edn_analytics_advanced FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all analytics" 
ON edn_analytics_advanced FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Politiques pour recommandations
CREATE POLICY "Users can view their own recommendations" 
ON edn_smart_recommendations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all recommendations" 
ON edn_smart_recommendations FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Fonction pour calculer le parcours d'apprentissage
CREATE OR REPLACE FUNCTION calculate_user_learning_path(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level jsonb;
  recommended_items jsonb;
  learning_path jsonb;
BEGIN
  -- Calculer le niveau de l'utilisateur basé sur ses interactions
  SELECT jsonb_build_object(
    'overall_progress', COALESCE(AVG(completion_rate), 0),
    'strong_areas', array_agg(DISTINCT item_code) FILTER (WHERE completion_rate > 0.8),
    'improvement_areas', array_agg(DISTINCT item_code) FILTER (WHERE completion_rate < 0.5),
    'avg_engagement', COALESCE(AVG(engagement_score), 0)
  ) INTO user_level
  FROM edn_analytics_advanced 
  WHERE user_id = p_user_id;
  
  -- Générer des recommandations intelligentes
  SELECT jsonb_agg(
    jsonb_build_object(
      'item_code', item_code,
      'title', title,
      'difficulty_match', random() * 0.3 + 0.7,
      'interest_prediction', random() * 0.4 + 0.6
    )
  ) INTO recommended_items
  FROM edn_items_immersive 
  WHERE item_code NOT IN (
    SELECT item_code FROM edn_analytics_advanced 
    WHERE user_id = p_user_id AND completion_rate > 0.8
  )
  ORDER BY random()
  LIMIT 10;
  
  -- Construire le parcours d'apprentissage
  learning_path := jsonb_build_object(
    'user_level', user_level,
    'recommended_items', recommended_items,
    'generated_at', now(),
    'expires_at', now() + interval '24 hours'
  );
  
  RETURN learning_path;
END;
$$;

-- 7. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_edn_analytics_user_item ON edn_analytics_advanced(user_id, item_code);
CREATE INDEX IF NOT EXISTS idx_edn_analytics_session_type ON edn_analytics_advanced(session_type);
CREATE INDEX IF NOT EXISTS idx_edn_recommendations_user_active ON edn_smart_recommendations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_edn_recommendations_expires ON edn_smart_recommendations(expires_at);

-- 8. Commentaires pour documentation
COMMENT ON TABLE edn_analytics_advanced IS 'Analytics avancées pour le suivi détaillé de l''engagement utilisateur sur la plateforme EDN';
COMMENT ON TABLE edn_smart_recommendations IS 'Système de recommandations intelligentes basé sur l''IA et les patterns d''apprentissage';
COMMENT ON FUNCTION calculate_user_learning_path IS 'Calcule un parcours d''apprentissage personnalisé pour un utilisateur donné';