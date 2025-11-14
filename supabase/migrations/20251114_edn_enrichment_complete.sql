-- =============================================
-- ENRICHISSEMENT COMPLET DES ITEMS EDN
-- Date: 2025-11-14
-- Description: Migration complète pour enrichir, analyser et compléter
--              tous les aspects du système EDN
-- =============================================

-- =============================================
-- SECTION 1: VUES MATÉRIALISÉES POUR PERFORMANCE
-- =============================================

-- Vue matérialisée pour les statistiques globales EDN
CREATE MATERIALIZED VIEW IF NOT EXISTS edn_global_stats AS
SELECT
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE completeness_score >= 80) as complete_items,
  COUNT(*) FILTER (WHERE completeness_score < 80) as incomplete_items,
  COUNT(*) FILTER (WHERE is_validated = true) as validated_items,
  AVG(completeness_score)::numeric(5,2) as avg_completeness,
  AVG(competences_count_total)::numeric(5,2) as avg_competences_per_item,
  SUM(competences_count_rang_a) as total_competences_rang_a,
  SUM(competences_count_rang_b) as total_competences_rang_b,
  COUNT(*) FILTER (WHERE tableau_rang_a IS NOT NULL) as items_with_tableau_a,
  COUNT(*) FILTER (WHERE tableau_rang_b IS NOT NULL) as items_with_tableau_b,
  COUNT(*) FILTER (WHERE paroles_musicales IS NOT NULL AND array_length(paroles_musicales, 1) > 0) as items_with_music,
  COUNT(*) FILTER (WHERE scene_immersive IS NOT NULL) as items_with_immersive,
  COUNT(*) FILTER (WHERE quiz_questions IS NOT NULL) as items_with_quiz,
  MAX(updated_at) as last_update
FROM edn_items_complete;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS idx_edn_global_stats_singleton ON edn_global_stats ((true));

COMMENT ON MATERIALIZED VIEW edn_global_stats IS 'Statistiques globales en temps réel sur tous les items EDN - rafraîchir avec REFRESH MATERIALIZED VIEW';

-- Vue matérialisée pour l'analyse par spécialité
CREATE MATERIALIZED VIEW IF NOT EXISTS edn_stats_by_specialite AS
SELECT
  specialite,
  domaine_medical,
  COUNT(*) as item_count,
  AVG(completeness_score)::numeric(5,2) as avg_completeness,
  AVG(competences_count_total)::numeric(5,2) as avg_competences,
  COUNT(*) FILTER (WHERE is_validated = true) as validated_count,
  array_agg(DISTINCT item_code ORDER BY item_code) as item_codes
FROM edn_items_complete
WHERE specialite IS NOT NULL
GROUP BY specialite, domaine_medical
ORDER BY item_count DESC;

CREATE INDEX IF NOT EXISTS idx_edn_stats_specialite ON edn_stats_by_specialite(specialite);

COMMENT ON MATERIALIZED VIEW edn_stats_by_specialite IS 'Statistiques détaillées par spécialité médicale';

-- Vue unifiée légère pour les listes (optimisée)
CREATE OR REPLACE VIEW edn_items_unified_view AS
SELECT
  id,
  item_code,
  slug,
  title,
  subtitle,
  created_at,
  updated_at,
  specialite,
  domaine_medical,
  niveau_complexite,
  mots_cles,
  tags_medicaux,
  status,
  completeness_score,
  is_validated,
  validation_date,
  competences_count_rang_a,
  competences_count_rang_b,
  competences_count_total,
  -- Flags de disponibilité (boolean pour performance)
  (tableau_rang_a IS NOT NULL AND tableau_rang_a != '{}'::jsonb) as has_tableau_rang_a,
  (tableau_rang_b IS NOT NULL AND tableau_rang_b != '{}'::jsonb) as has_tableau_rang_b,
  (paroles_musicales IS NOT NULL AND array_length(paroles_musicales, 1) > 0) as has_paroles_musicales,
  (scene_immersive IS NOT NULL AND scene_immersive != '{}'::jsonb) as has_scene_immersive,
  (quiz_questions IS NOT NULL AND quiz_questions != '{}'::jsonb) as has_quiz_questions,
  (audio_ambiance IS NOT NULL AND audio_ambiance != '{}'::jsonb) as has_audio_ambiance,
  (visual_ambiance IS NOT NULL AND visual_ambiance != '{}'::jsonb) as has_visual_ambiance,
  (competences_oic_rang_a IS NOT NULL AND jsonb_array_length(competences_oic_rang_a) > 0) as has_competences_oic_rang_a,
  (competences_oic_rang_b IS NOT NULL AND jsonb_array_length(competences_oic_rang_b) > 0) as has_competences_oic_rang_b
FROM edn_items_complete;

COMMENT ON VIEW edn_items_unified_view IS 'Vue unifiée optimisée pour affichage de liste avec flags de disponibilité';

-- =============================================
-- SECTION 2: INDEX SUPPLÉMENTAIRES
-- =============================================

-- Index GIN pour recherche full-text dans les JSONB
CREATE INDEX IF NOT EXISTS idx_edn_complete_tableau_rang_a_gin
ON edn_items_complete USING GIN (tableau_rang_a);

CREATE INDEX IF NOT EXISTS idx_edn_complete_tableau_rang_b_gin
ON edn_items_complete USING GIN (tableau_rang_b);

CREATE INDEX IF NOT EXISTS idx_edn_complete_competences_rang_a_gin
ON edn_items_complete USING GIN (competences_oic_rang_a);

CREATE INDEX IF NOT EXISTS idx_edn_complete_competences_rang_b_gin
ON edn_items_complete USING GIN (competences_oic_rang_b);

CREATE INDEX IF NOT EXISTS idx_edn_complete_quiz_gin
ON edn_items_complete USING GIN (quiz_questions);

-- Index composites pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_edn_complete_specialite_score
ON edn_items_complete(specialite, completeness_score DESC);

CREATE INDEX IF NOT EXISTS idx_edn_complete_status_validated
ON edn_items_complete(status, is_validated);

CREATE INDEX IF NOT EXISTS idx_edn_complete_updated_desc
ON edn_items_complete(updated_at DESC);

-- Index pour tri et filtrage
CREATE INDEX IF NOT EXISTS idx_edn_complete_item_code_trgm
ON edn_items_complete USING gin (item_code gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_edn_complete_title_trgm
ON edn_items_complete USING gin (title gin_trgm_ops);

COMMENT ON INDEX idx_edn_complete_title_trgm IS 'Index trigram pour recherche floue sur les titres';

-- =============================================
-- SECTION 3: FONCTIONS D'ENRICHISSEMENT AUTOMATIQUE
-- =============================================

-- Fonction pour enrichir automatiquement les métadonnées d'un item
CREATE OR REPLACE FUNCTION enrich_edn_item_metadata(p_item_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record RECORD;
  enrichment_result jsonb;
  extracted_keywords text[];
  inferred_complexity text;
  medical_tags text[];
BEGIN
  -- Récupérer l'item
  SELECT * INTO item_record
  FROM edn_items_complete
  WHERE item_code = p_item_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Item not found', 'item_code', p_item_code);
  END IF;

  -- Extraire les mots-clés du titre et subtitle
  extracted_keywords := string_to_array(
    lower(regexp_replace(
      COALESCE(item_record.title, '') || ' ' || COALESCE(item_record.subtitle, ''),
      '[^a-zA-ZÀ-ÿ\s]', '', 'g'
    )),
    ' '
  );

  -- Filtrer les mots vides et courts
  extracted_keywords := array(
    SELECT DISTINCT word
    FROM unnest(extracted_keywords) as word
    WHERE length(word) > 3
      AND word NOT IN ('dans', 'avec', 'pour', 'cette', 'sont', 'être', 'avoir')
    LIMIT 20
  );

  -- Inférer le niveau de complexité
  inferred_complexity := CASE
    WHEN item_record.competences_count_total > 20 THEN 'expert'
    WHEN item_record.competences_count_total > 10 THEN 'avance'
    WHEN item_record.competences_count_total > 5 THEN 'intermediaire'
    ELSE 'debutant'
  END;

  -- Générer des tags médicaux basés sur la spécialité
  medical_tags := ARRAY[
    COALESCE(item_record.specialite, 'Médecine générale'),
    COALESCE(item_record.domaine_medical, 'Non spécifié'),
    item_record.item_code
  ];

  -- Ajouter des tags spécifiques selon le contenu disponible
  IF item_record.scene_immersive IS NOT NULL THEN
    medical_tags := array_append(medical_tags, 'Apprentissage immersif');
  END IF;

  IF item_record.paroles_musicales IS NOT NULL AND array_length(item_record.paroles_musicales, 1) > 0 THEN
    medical_tags := array_append(medical_tags, 'Mémorisation musicale');
  END IF;

  IF item_record.quiz_questions IS NOT NULL THEN
    medical_tags := array_append(medical_tags, 'Évaluation interactive');
  END IF;

  -- Mettre à jour l'item
  UPDATE edn_items_complete
  SET
    mots_cles = COALESCE(mots_cles, '{}') || extracted_keywords,
    niveau_complexite = COALESCE(niveau_complexite, inferred_complexity),
    tags_medicaux = COALESCE(tags_medicaux, '{}') || medical_tags,
    updated_at = now()
  WHERE item_code = p_item_code;

  -- Construire le résultat
  enrichment_result := jsonb_build_object(
    'item_code', p_item_code,
    'enriched', true,
    'extracted_keywords_count', array_length(extracted_keywords, 1),
    'inferred_complexity', inferred_complexity,
    'medical_tags_count', array_length(medical_tags, 1),
    'timestamp', now()
  );

  RETURN enrichment_result;
END;
$$;

COMMENT ON FUNCTION enrich_edn_item_metadata IS 'Enrichit automatiquement les métadonnées d''un item EDN (mots-clés, complexité, tags)';

-- Fonction pour enrichir tous les items en masse
CREATE OR REPLACE FUNCTION enrich_all_edn_items()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_code_var text;
  total_processed integer := 0;
  total_enriched integer := 0;
  enrichment_report jsonb;
BEGIN
  -- Parcourir tous les items
  FOR item_code_var IN
    SELECT item_code FROM edn_items_complete ORDER BY item_code
  LOOP
    BEGIN
      -- Enrichir chaque item
      PERFORM enrich_edn_item_metadata(item_code_var);
      total_enriched := total_enriched + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Logger l'erreur mais continuer
      RAISE NOTICE 'Erreur lors de l''enrichissement de %: %', item_code_var, SQLERRM;
    END;

    total_processed := total_processed + 1;
  END LOOP;

  -- Rafraîchir les vues matérialisées
  REFRESH MATERIALIZED VIEW edn_global_stats;
  REFRESH MATERIALIZED VIEW edn_stats_by_specialite;

  enrichment_report := jsonb_build_object(
    'total_processed', total_processed,
    'total_enriched', total_enriched,
    'success_rate', round((total_enriched::numeric / NULLIF(total_processed, 0)::numeric) * 100, 2),
    'timestamp', now()
  );

  RETURN enrichment_report;
END;
$$;

COMMENT ON FUNCTION enrich_all_edn_items IS 'Enrichit en masse tous les items EDN et rafraîchit les vues matérialisées';

-- =============================================
-- SECTION 4: FONCTIONS D'ANALYSE DE QUALITÉ
-- =============================================

-- Fonction pour analyser la qualité d'un item EDN
CREATE OR REPLACE FUNCTION analyze_edn_item_quality(p_item_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record RECORD;
  quality_report jsonb;
  quality_score integer := 0;
  quality_details jsonb := '[]'::jsonb;
  missing_elements text[] := '{}';
  suggestions text[] := '{}';
BEGIN
  -- Récupérer l'item
  SELECT * INTO item_record
  FROM edn_items_complete
  WHERE item_code = p_item_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Item not found', 'item_code', p_item_code);
  END IF;

  -- Analyse du tableau rang A (20 points)
  IF item_record.tableau_rang_a IS NOT NULL AND item_record.tableau_rang_a != '{}'::jsonb THEN
    quality_score := quality_score + 20;
    quality_details := quality_details || jsonb_build_object('component', 'tableau_rang_a', 'score', 20, 'status', 'present')::jsonb;
  ELSE
    missing_elements := array_append(missing_elements, 'Tableau Rang A');
    suggestions := array_append(suggestions, 'Ajouter un tableau structuré pour les compétences de Rang A');
    quality_details := quality_details || jsonb_build_object('component', 'tableau_rang_a', 'score', 0, 'status', 'missing')::jsonb;
  END IF;

  -- Analyse du tableau rang B (20 points)
  IF item_record.tableau_rang_b IS NOT NULL AND item_record.tableau_rang_b != '{}'::jsonb THEN
    quality_score := quality_score + 20;
    quality_details := quality_details || jsonb_build_object('component', 'tableau_rang_b', 'score', 20, 'status', 'present')::jsonb;
  ELSE
    missing_elements := array_append(missing_elements, 'Tableau Rang B');
    suggestions := array_append(suggestions, 'Ajouter un tableau structuré pour les compétences de Rang B');
    quality_details := quality_details || jsonb_build_object('component', 'tableau_rang_b', 'score', 0, 'status', 'missing')::jsonb;
  END IF;

  -- Analyse des compétences OIC Rang A (15 points)
  IF item_record.competences_oic_rang_a IS NOT NULL AND jsonb_array_length(item_record.competences_oic_rang_a) > 0 THEN
    quality_score := quality_score + 15;
    quality_details := quality_details || jsonb_build_object('component', 'competences_oic_rang_a', 'score', 15, 'status', 'present', 'count', jsonb_array_length(item_record.competences_oic_rang_a))::jsonb;
  ELSE
    missing_elements := array_append(missing_elements, 'Compétences OIC Rang A');
    suggestions := array_append(suggestions, 'Extraire et intégrer les objectifs de connaissance de Rang A depuis UNESS');
    quality_details := quality_details || jsonb_build_object('component', 'competences_oic_rang_a', 'score', 0, 'status', 'missing')::jsonb;
  END IF;

  -- Analyse des compétences OIC Rang B (15 points)
  IF item_record.competences_oic_rang_b IS NOT NULL AND jsonb_array_length(item_record.competences_oic_rang_b) > 0 THEN
    quality_score := quality_score + 15;
    quality_details := quality_details || jsonb_build_object('component', 'competences_oic_rang_b', 'score', 15, 'status', 'present', 'count', jsonb_array_length(item_record.competences_oic_rang_b))::jsonb;
  ELSE
    missing_elements := array_append(missing_elements, 'Compétences OIC Rang B');
    suggestions := array_append(suggestions, 'Extraire et intégrer les objectifs de connaissance de Rang B depuis UNESS');
    quality_details := quality_details || jsonb_build_object('component', 'competences_oic_rang_b', 'score', 0, 'status', 'missing')::jsonb;
  END IF;

  -- Analyse du quiz (10 points)
  IF item_record.quiz_questions IS NOT NULL AND item_record.quiz_questions != '{}'::jsonb THEN
    quality_score := quality_score + 10;
    quality_details := quality_details || jsonb_build_object('component', 'quiz_questions', 'score', 10, 'status', 'present')::jsonb;
  ELSE
    missing_elements := array_append(missing_elements, 'Quiz interactif');
    suggestions := array_append(suggestions, 'Créer des questions QCM/QRU/QROC pour évaluer les connaissances');
    quality_details := quality_details || jsonb_build_object('component', 'quiz_questions', 'score', 0, 'status', 'missing')::jsonb;
  END IF;

  -- Analyse de la scène immersive (10 points)
  IF item_record.scene_immersive IS NOT NULL AND item_record.scene_immersive != '{}'::jsonb THEN
    quality_score := quality_score + 10;
    quality_details := quality_details || jsonb_build_object('component', 'scene_immersive', 'score', 10, 'status', 'present')::jsonb;
  ELSE
    missing_elements := array_append(missing_elements, 'Scène immersive');
    suggestions := array_append(suggestions, 'Créer un scénario clinique immersif avec dialogues');
    quality_details := quality_details || jsonb_build_object('component', 'scene_immersive', 'score', 0, 'status', 'missing')::jsonb;
  END IF;

  -- Analyse des paroles musicales (10 points)
  IF item_record.paroles_musicales IS NOT NULL AND array_length(item_record.paroles_musicales, 1) > 0 THEN
    quality_score := quality_score + 10;
    quality_details := quality_details || jsonb_build_object('component', 'paroles_musicales', 'score', 10, 'status', 'present', 'verses', array_length(item_record.paroles_musicales, 1))::jsonb;
  ELSE
    missing_elements := array_append(missing_elements, 'Paroles musicales');
    suggestions := array_append(suggestions, 'Générer des paroles mnémotechniques pour faciliter la mémorisation');
    quality_details := quality_details || jsonb_build_object('component', 'paroles_musicales', 'score', 0, 'status', 'missing')::jsonb;
  END IF;

  -- Construire le rapport de qualité
  quality_report := jsonb_build_object(
    'item_code', p_item_code,
    'title', item_record.title,
    'quality_score', quality_score,
    'quality_grade', CASE
      WHEN quality_score >= 90 THEN 'Excellent'
      WHEN quality_score >= 80 THEN 'Très bon'
      WHEN quality_score >= 70 THEN 'Bon'
      WHEN quality_score >= 60 THEN 'Satisfaisant'
      WHEN quality_score >= 50 THEN 'Moyen'
      ELSE 'Insuffisant'
    END,
    'completeness_percentage', quality_score,
    'quality_details', quality_details,
    'missing_elements', missing_elements,
    'suggestions', suggestions,
    'competences_count', jsonb_build_object(
      'rang_a', item_record.competences_count_rang_a,
      'rang_b', item_record.competences_count_rang_b,
      'total', item_record.competences_count_total
    ),
    'is_validated', item_record.is_validated,
    'analyzed_at', now()
  );

  -- Mettre à jour le completeness_score dans la table
  UPDATE edn_items_complete
  SET completeness_score = quality_score,
      updated_at = now()
  WHERE item_code = p_item_code;

  RETURN quality_report;
END;
$$;

COMMENT ON FUNCTION analyze_edn_item_quality IS 'Analyse en profondeur la qualité et la complétude d''un item EDN avec suggestions d''amélioration';

-- Fonction pour obtenir un rapport global de qualité
CREATE OR REPLACE FUNCTION get_edn_quality_global_report()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_items integer;
  quality_distribution jsonb;
  avg_score numeric;
  global_report jsonb;
BEGIN
  -- Compter le total d'items
  SELECT COUNT(*) INTO total_items FROM edn_items_complete;

  -- Distribution par qualité
  SELECT jsonb_build_object(
    'excellent', COUNT(*) FILTER (WHERE completeness_score >= 90),
    'tres_bon', COUNT(*) FILTER (WHERE completeness_score >= 80 AND completeness_score < 90),
    'bon', COUNT(*) FILTER (WHERE completeness_score >= 70 AND completeness_score < 80),
    'satisfaisant', COUNT(*) FILTER (WHERE completeness_score >= 60 AND completeness_score < 70),
    'moyen', COUNT(*) FILTER (WHERE completeness_score >= 50 AND completeness_score < 60),
    'insuffisant', COUNT(*) FILTER (WHERE completeness_score < 50)
  ) INTO quality_distribution
  FROM edn_items_complete;

  -- Score moyen
  SELECT AVG(completeness_score)::numeric(5,2) INTO avg_score FROM edn_items_complete;

  global_report := jsonb_build_object(
    'total_items', total_items,
    'average_quality_score', avg_score,
    'quality_distribution', quality_distribution,
    'items_with_all_components', (
      SELECT COUNT(*)
      FROM edn_items_complete
      WHERE tableau_rang_a IS NOT NULL
        AND tableau_rang_b IS NOT NULL
        AND competences_oic_rang_a IS NOT NULL
        AND competences_oic_rang_b IS NOT NULL
        AND quiz_questions IS NOT NULL
        AND scene_immersive IS NOT NULL
        AND paroles_musicales IS NOT NULL
    ),
    'items_validated', (SELECT COUNT(*) FROM edn_items_complete WHERE is_validated = true),
    'last_refresh', now()
  );

  RETURN global_report;
END;
$$;

COMMENT ON FUNCTION get_edn_quality_global_report IS 'Retourne un rapport global de qualité sur tous les items EDN';

-- =============================================
-- SECTION 5: CONTRAINTES DE VALIDATION
-- =============================================

-- Ajouter des contraintes CHECK pour validation
ALTER TABLE edn_items_complete
  DROP CONSTRAINT IF EXISTS check_completeness_score_range,
  ADD CONSTRAINT check_completeness_score_range
    CHECK (completeness_score >= 0 AND completeness_score <= 100);

ALTER TABLE edn_items_complete
  DROP CONSTRAINT IF EXISTS check_competences_counts_positive,
  ADD CONSTRAINT check_competences_counts_positive
    CHECK (
      competences_count_rang_a >= 0 AND
      competences_count_rang_b >= 0 AND
      competences_count_total >= 0
    );

ALTER TABLE edn_items_complete
  DROP CONSTRAINT IF EXISTS check_status_valid,
  ADD CONSTRAINT check_status_valid
    CHECK (status IN ('active', 'draft', 'archived', 'restored_from_backup', 'deprecated'));

ALTER TABLE edn_items_complete
  DROP CONSTRAINT IF EXISTS check_niveau_complexite_valid,
  ADD CONSTRAINT check_niveau_complexite_valid
    CHECK (niveau_complexite IN ('debutant', 'intermediaire', 'avance', 'expert'));

-- Contrainte pour s'assurer que le slug est en minuscules et sans espaces
ALTER TABLE edn_items_complete
  DROP CONSTRAINT IF EXISTS check_slug_format,
  ADD CONSTRAINT check_slug_format
    CHECK (slug ~ '^[a-z0-9\-]+$');

COMMENT ON CONSTRAINT check_completeness_score_range ON edn_items_complete IS 'Le score de complétude doit être entre 0 et 100';
COMMENT ON CONSTRAINT check_slug_format ON edn_items_complete IS 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';

-- =============================================
-- SECTION 6: TRIGGERS POUR MAINTENANCE AUTOMATIQUE
-- =============================================

-- Trigger pour recalculer automatiquement le completeness_score
CREATE OR REPLACE FUNCTION auto_calculate_completeness_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completeness_score := (
    CASE WHEN NEW.tableau_rang_a IS NOT NULL AND NEW.tableau_rang_a != '{}'::jsonb THEN 20 ELSE 0 END +
    CASE WHEN NEW.tableau_rang_b IS NOT NULL AND NEW.tableau_rang_b != '{}'::jsonb THEN 20 ELSE 0 END +
    CASE WHEN NEW.competences_oic_rang_a IS NOT NULL AND jsonb_array_length(NEW.competences_oic_rang_a) > 0 THEN 15 ELSE 0 END +
    CASE WHEN NEW.competences_oic_rang_b IS NOT NULL AND jsonb_array_length(NEW.competences_oic_rang_b) > 0 THEN 15 ELSE 0 END +
    CASE WHEN NEW.quiz_questions IS NOT NULL AND NEW.quiz_questions != '{}'::jsonb THEN 10 ELSE 0 END +
    CASE WHEN NEW.scene_immersive IS NOT NULL AND NEW.scene_immersive != '{}'::jsonb THEN 10 ELSE 0 END +
    CASE WHEN NEW.paroles_musicales IS NOT NULL AND array_length(NEW.paroles_musicales, 1) > 0 THEN 10 ELSE 0 END
  );

  -- Valider automatiquement si score >= 80
  IF NEW.completeness_score >= 80 AND NEW.is_validated = false THEN
    NEW.is_validated := true;
    NEW.validation_date := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_calculate_completeness ON edn_items_complete;
CREATE TRIGGER trigger_auto_calculate_completeness
  BEFORE INSERT OR UPDATE ON edn_items_complete
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_completeness_score();

COMMENT ON FUNCTION auto_calculate_completeness_score IS 'Recalcule automatiquement le score de complétude à chaque modification';

-- Trigger pour recalculer les compteurs de compétences
CREATE OR REPLACE FUNCTION auto_update_competences_counts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.competences_count_rang_a := COALESCE(jsonb_array_length(NEW.competences_oic_rang_a), 0);
  NEW.competences_count_rang_b := COALESCE(jsonb_array_length(NEW.competences_oic_rang_b), 0);
  NEW.competences_count_total := NEW.competences_count_rang_a + NEW.competences_count_rang_b;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_update_competences_counts ON edn_items_complete;
CREATE TRIGGER trigger_auto_update_competences_counts
  BEFORE INSERT OR UPDATE ON edn_items_complete
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_competences_counts();

COMMENT ON FUNCTION auto_update_competences_counts IS 'Recalcule automatiquement les compteurs de compétences';

-- =============================================
-- SECTION 7: FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour rechercher des items EDN (full-text search)
CREATE OR REPLACE FUNCTION search_edn_items(
  p_search_term text,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  item_code text,
  title text,
  subtitle text,
  specialite text,
  completeness_score integer,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.item_code,
    e.title,
    e.subtitle,
    e.specialite,
    e.completeness_score,
    similarity(e.title || ' ' || COALESCE(e.subtitle, ''), p_search_term) as rank
  FROM edn_items_complete e
  WHERE
    e.title ILIKE '%' || p_search_term || '%'
    OR e.subtitle ILIKE '%' || p_search_term || '%'
    OR e.item_code ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(e.mots_cles)
    OR p_search_term = ANY(e.tags_medicaux)
  ORDER BY rank DESC, e.completeness_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION search_edn_items IS 'Recherche full-text dans les items EDN avec ranking par pertinence';

-- Fonction pour obtenir les items similaires
CREATE OR REPLACE FUNCTION get_similar_edn_items(
  p_item_code text,
  p_limit integer DEFAULT 5
)
RETURNS TABLE(
  item_code text,
  title text,
  similarity_score real,
  shared_tags integer
) AS $$
DECLARE
  source_specialite text;
  source_tags text[];
BEGIN
  -- Récupérer les métadonnées de l'item source
  SELECT specialite, tags_medicaux
  INTO source_specialite, source_tags
  FROM edn_items_complete
  WHERE item_code = p_item_code;

  RETURN QUERY
  SELECT
    e.item_code,
    e.title,
    (
      CASE WHEN e.specialite = source_specialite THEN 0.5 ELSE 0 END +
      (array_length(e.tags_medicaux & source_tags, 1)::real / NULLIF(array_length(source_tags, 1), 0)::real * 0.5)
    ) as similarity_score,
    array_length(e.tags_medicaux & source_tags, 1) as shared_tags
  FROM edn_items_complete e
  WHERE e.item_code != p_item_code
  ORDER BY similarity_score DESC, e.completeness_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION get_similar_edn_items IS 'Retourne les items EDN similaires basés sur la spécialité et les tags';

-- =============================================
-- SECTION 8: GRANTS ET PERMISSIONS
-- =============================================

-- Accorder les permissions aux fonctions
GRANT EXECUTE ON FUNCTION enrich_edn_item_metadata(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION enrich_all_edn_items() TO service_role;
GRANT EXECUTE ON FUNCTION analyze_edn_item_quality(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_edn_quality_global_report() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_edn_items(text, integer, integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_similar_edn_items(text, integer) TO authenticated, anon;

-- =============================================
-- SECTION 9: RAFRAÎCHISSEMENT INITIAL
-- =============================================

-- Rafraîchir les vues matérialisées
REFRESH MATERIALIZED VIEW edn_global_stats;
REFRESH MATERIALIZED VIEW edn_stats_by_specialite;

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================

-- Créer un enregistrement de cette migration
INSERT INTO public.migration_log (migration_name, executed_at, description)
VALUES (
  '20251114_edn_enrichment_complete',
  now(),
  'Enrichissement complet du système EDN : vues matérialisées, index, fonctions d''enrichissement, validation et analyse de qualité'
)
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Migration EDN Enrichment Complete terminée avec succès';
  RAISE NOTICE '📊 Vues matérialisées créées: edn_global_stats, edn_stats_by_specialite';
  RAISE NOTICE '🔍 Index supplémentaires créés pour optimiser les performances';
  RAISE NOTICE '⚙️ Fonctions d''enrichissement et d''analyse disponibles';
  RAISE NOTICE '✔️ Contraintes de validation ajoutées';
  RAISE NOTICE '🔄 Triggers automatiques activés';
END $$;
