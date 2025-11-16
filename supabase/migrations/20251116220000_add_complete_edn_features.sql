-- =============================================
-- MIGRATION: Ajout Fonctionnalités Complètes EDN
-- =============================================
-- Date: 2025-11-16
-- Description: Ajoute les colonnes manquantes pour atteindre 100% de complétude
--              - Paroles séparées par rang (A, B, AB)
--              - Lien Item EDN <-> Chanson Suno
--              - Lien Item EDN <-> Bande Dessinée
-- =============================================

\echo '====================================================='
\echo 'MIGRATION: Fonctionnalités Complètes EDN'
\echo '====================================================='
\echo ''

-- =============================================
-- SECTION 1: PAROLES MUSICALES SEPAREES PAR RANG
-- =============================================

\echo 'Section 1: Ajout colonnes paroles séparées par rang...'

ALTER TABLE edn_items_complete
ADD COLUMN IF NOT EXISTS paroles_rang_a text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS paroles_rang_b text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS paroles_rang_ab text[] DEFAULT ARRAY[]::text[];

-- Commentaires de documentation
COMMENT ON COLUMN edn_items_complete.paroles_rang_a IS
'Paroles musicales fixes pour mémoriser UNIQUEMENT le Rang A (compétences fondamentales)';

COMMENT ON COLUMN edn_items_complete.paroles_rang_b IS
'Paroles musicales fixes pour mémoriser UNIQUEMENT le Rang B (compétences avancées)';

COMMENT ON COLUMN edn_items_complete.paroles_rang_ab IS
'Paroles musicales fixes pour mémoriser les Rangs A et B ENSEMBLE (synthèse complète)';

-- Index GIN pour recherche full-text dans les paroles
CREATE INDEX IF NOT EXISTS idx_edn_paroles_rang_a
ON edn_items_complete USING gin(paroles_rang_a);

CREATE INDEX IF NOT EXISTS idx_edn_paroles_rang_b
ON edn_items_complete USING gin(paroles_rang_b);

CREATE INDEX IF NOT EXISTS idx_edn_paroles_rang_ab
ON edn_items_complete USING gin(paroles_rang_ab);

-- Migrer les données existantes si applicable
-- Si paroles_musicales existe et contient des données, les copier vers paroles_rang_ab
UPDATE edn_items_complete
SET paroles_rang_ab = paroles_musicales
WHERE paroles_musicales IS NOT NULL
  AND array_length(paroles_musicales, 1) > 0
  AND (paroles_rang_ab IS NULL OR array_length(paroles_rang_ab, 1) = 0);

\echo '✓ Colonnes paroles séparées ajoutées'
\echo ''

-- =============================================
-- SECTION 2: LIEN ITEM EDN <-> CHANSON SUNO
-- =============================================

\echo 'Section 2: Ajout colonnes liaison Suno...'

ALTER TABLE med_mng_songs
ADD COLUMN IF NOT EXISTS item_code text,
ADD COLUMN IF NOT EXISTS rang_type text,
ADD COLUMN IF NOT EXISTS is_static boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS generation_source text DEFAULT 'suno';

-- Contraintes
ALTER TABLE med_mng_songs
ADD CONSTRAINT fk_med_mng_songs_item_code
  FOREIGN KEY (item_code)
  REFERENCES edn_items_complete(item_code)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE med_mng_songs
ADD CONSTRAINT chk_rang_type
  CHECK (rang_type IN ('A', 'B', 'AB') OR rang_type IS NULL);

ALTER TABLE med_mng_songs
ADD CONSTRAINT chk_generation_source
  CHECK (generation_source IN ('suno', 'manual', 'ai_generated', 'custom'));

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_med_mng_songs_item_code
ON med_mng_songs(item_code);

CREATE INDEX IF NOT EXISTS idx_med_mng_songs_rang_type
ON med_mng_songs(rang_type);

CREATE INDEX IF NOT EXISTS idx_med_mng_songs_static
ON med_mng_songs(is_static);

-- Contrainte unique: 1 seule chanson statique par (item_code, rang_type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_med_mng_songs_static_unique
ON med_mng_songs(item_code, rang_type)
WHERE is_static = true AND item_code IS NOT NULL AND rang_type IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN med_mng_songs.item_code IS
'Code de l''item EDN associé (ex: IC-001, IC-002, ..., IC-367)';

COMMENT ON COLUMN med_mng_songs.rang_type IS
'Type de rang couvert: A (rang A uniquement), B (rang B uniquement), AB (les deux rangs)';

COMMENT ON COLUMN med_mng_songs.is_static IS
'true = chanson fixe réutilisable pour cet item+rang, false = générée dynamiquement par utilisateur';

COMMENT ON COLUMN med_mng_songs.generation_source IS
'Source de génération: suno (API Suno), manual (créée manuellement), ai_generated (IA autre), custom (personnalisée)';

\echo '✓ Colonnes liaison Suno ajoutées'
\echo ''

-- =============================================
-- SECTION 3: LIEN ITEM EDN <-> BANDE DESSINEE
-- =============================================

\echo 'Section 3: Ajout colonnes liaison BD...'

ALTER TABLE comic_panels
ADD COLUMN IF NOT EXISTS item_code text,
ADD COLUMN IF NOT EXISTS rang_type text;

-- Contraintes
ALTER TABLE comic_panels
ADD CONSTRAINT fk_comic_panels_item_code
  FOREIGN KEY (item_code)
  REFERENCES edn_items_complete(item_code)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE comic_panels
ADD CONSTRAINT chk_comic_rang_type
  CHECK (rang_type IN ('A', 'B', 'AB') OR rang_type IS NULL);

-- Index
CREATE INDEX IF NOT EXISTS idx_comic_panels_item_code
ON comic_panels(item_code);

CREATE INDEX IF NOT EXISTS idx_comic_panels_rang_type
ON comic_panels(rang_type);

CREATE INDEX IF NOT EXISTS idx_comic_panels_static
ON comic_panels(is_static);

-- Contrainte unique: numéro de panneau unique par (item_code, rang_type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_comic_panels_unique
ON comic_panels(item_code, rang_type, panel_number)
WHERE item_code IS NOT NULL AND rang_type IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN comic_panels.item_code IS
'Code de l''item EDN associé (ex: IC-001)';

COMMENT ON COLUMN comic_panels.rang_type IS
'Type de rang illustré: A (rang A uniquement), B (rang B uniquement), AB (les deux rangs)';

\echo '✓ Colonnes liaison BD ajoutées'
\echo ''

-- =============================================
-- SECTION 4: VUES MATERIALISEES MISES A JOUR
-- =============================================

\echo 'Section 4: Mise à jour vues matérialisées...'

-- Rafraîchir vue globale des stats
DROP MATERIALIZED VIEW IF EXISTS edn_global_stats CASCADE;

CREATE MATERIALIZED VIEW edn_global_stats AS
SELECT
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE completeness_score >= 80) as complete_items,
  COUNT(*) FILTER (WHERE completeness_score < 80) as incomplete_items,
  COUNT(*) FILTER (WHERE is_validated = true) as validated_items,
  AVG(completeness_score)::numeric(5,2) as avg_completeness,

  -- Compétences OIC
  AVG(competences_count_total)::numeric(5,2) as avg_competences_per_item,
  SUM(competences_count_rang_a) as total_competences_rang_a,
  SUM(competences_count_rang_b) as total_competences_rang_b,

  -- Tableaux
  COUNT(*) FILTER (WHERE tableau_rang_a IS NOT NULL AND tableau_rang_a != '{}'::jsonb) as items_with_tableau_a,
  COUNT(*) FILTER (WHERE tableau_rang_b IS NOT NULL AND tableau_rang_b != '{}'::jsonb) as items_with_tableau_b,

  -- Paroles (anciennes + nouvelles)
  COUNT(*) FILTER (WHERE paroles_musicales IS NOT NULL AND array_length(paroles_musicales, 1) > 0) as items_with_music_old,
  COUNT(*) FILTER (WHERE paroles_rang_a IS NOT NULL AND array_length(paroles_rang_a, 1) > 0) as items_with_paroles_rang_a,
  COUNT(*) FILTER (WHERE paroles_rang_b IS NOT NULL AND array_length(paroles_rang_b, 1) > 0) as items_with_paroles_rang_b,
  COUNT(*) FILTER (WHERE paroles_rang_ab IS NOT NULL AND array_length(paroles_rang_ab, 1) > 0) as items_with_paroles_rang_ab,

  -- Autres contenus
  COUNT(*) FILTER (WHERE scene_immersive IS NOT NULL) as items_with_immersive,
  COUNT(*) FILTER (WHERE quiz_questions IS NOT NULL AND quiz_questions != '{}'::jsonb) as items_with_quiz,

  MAX(updated_at) as last_update
FROM edn_items_complete;

CREATE UNIQUE INDEX idx_edn_global_stats_singleton ON edn_global_stats ((true));

COMMENT ON MATERIALIZED VIEW edn_global_stats IS
'Statistiques globales avec nouvelles colonnes paroles séparées - rafraîchir avec REFRESH MATERIALIZED VIEW';

\echo '✓ Vues matérialisées mises à jour'
\echo ''

-- =============================================
-- SECTION 5: FONCTION DE VERIFICATION DE COMPLETUDE
-- =============================================

\echo 'Section 5: Création fonction vérification complétude...'

CREATE OR REPLACE FUNCTION check_edn_item_completeness(p_item_code text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  item_record RECORD;
  completeness jsonb := '{}'::jsonb;
  missing_elements text[] := ARRAY[]::text[];
  score integer := 0;
BEGIN
  -- Récupérer l'item
  SELECT * INTO item_record
  FROM edn_items_complete
  WHERE item_code = p_item_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'error', 'Item not found',
      'item_code', p_item_code
    );
  END IF;

  -- Vérifier Rang A
  IF item_record.competences_oic_rang_a IS NOT NULL
    AND jsonb_array_length(item_record.competences_oic_rang_a) > 0 THEN
    completeness := completeness || jsonb_build_object('rang_a_competences', true);
    score := score + 15;
  ELSE
    missing_elements := array_append(missing_elements, 'Compétences Rang A');
  END IF;

  -- Vérifier Rang B
  IF item_record.competences_oic_rang_b IS NOT NULL
    AND jsonb_array_length(item_record.competences_oic_rang_b) > 0 THEN
    completeness := completeness || jsonb_build_object('rang_b_competences', true);
    score := score + 15;
  ELSE
    missing_elements := array_append(missing_elements, 'Compétences Rang B');
  END IF;

  -- Vérifier Paroles Rang A
  IF item_record.paroles_rang_a IS NOT NULL
    AND array_length(item_record.paroles_rang_a, 1) > 0 THEN
    completeness := completeness || jsonb_build_object('paroles_rang_a', true);
    score := score + 10;
  ELSE
    missing_elements := array_append(missing_elements, 'Paroles Rang A');
  END IF;

  -- Vérifier Paroles Rang B
  IF item_record.paroles_rang_b IS NOT NULL
    AND array_length(item_record.paroles_rang_b, 1) > 0 THEN
    completeness := completeness || jsonb_build_object('paroles_rang_b', true);
    score := score + 10;
  ELSE
    missing_elements := array_append(missing_elements, 'Paroles Rang B');
  END IF;

  -- Vérifier Paroles Rang AB
  IF item_record.paroles_rang_ab IS NOT NULL
    AND array_length(item_record.paroles_rang_ab, 1) > 0 THEN
    completeness := completeness || jsonb_build_object('paroles_rang_ab', true);
    score := score + 10;
  ELSE
    missing_elements := array_append(missing_elements, 'Paroles Rang A+B');
  END IF;

  -- Vérifier Quiz
  IF item_record.quiz_questions IS NOT NULL
    AND item_record.quiz_questions != '{}'::jsonb THEN
    completeness := completeness || jsonb_build_object('quiz', true);
    score := score + 15;
  ELSE
    missing_elements := array_append(missing_elements, 'Quiz');
  END IF;

  -- Vérifier Tableaux
  IF item_record.tableau_rang_a IS NOT NULL
    AND item_record.tableau_rang_a != '{}'::jsonb THEN
    completeness := completeness || jsonb_build_object('tableau_rang_a', true);
    score := score + 10;
  ELSE
    missing_elements := array_append(missing_elements, 'Tableau Rang A');
  END IF;

  IF item_record.tableau_rang_b IS NOT NULL
    AND item_record.tableau_rang_b != '{}'::jsonb THEN
    completeness := completeness || jsonb_build_object('tableau_rang_b', true);
    score := score + 10;
  ELSE
    missing_elements := array_append(missing_elements, 'Tableau Rang B');
  END IF;

  -- Vérifier Chansons Suno (nécessite jointure)
  DECLARE
    suno_count_a integer;
    suno_count_b integer;
    suno_count_ab integer;
  BEGIN
    SELECT
      COUNT(*) FILTER (WHERE rang_type = 'A' AND is_static = true),
      COUNT(*) FILTER (WHERE rang_type = 'B' AND is_static = true),
      COUNT(*) FILTER (WHERE rang_type = 'AB' AND is_static = true)
    INTO suno_count_a, suno_count_b, suno_count_ab
    FROM med_mng_songs
    WHERE item_code = p_item_code;

    IF suno_count_a > 0 THEN
      completeness := completeness || jsonb_build_object('suno_rang_a', true);
      score := score + 5;
    ELSE
      missing_elements := array_append(missing_elements, 'Chanson Suno Rang A');
    END IF;

    IF suno_count_b > 0 THEN
      completeness := completeness || jsonb_build_object('suno_rang_b', true);
      score := score + 5;
    ELSE
      missing_elements := array_append(missing_elements, 'Chanson Suno Rang B');
    END IF;

    IF suno_count_ab > 0 THEN
      completeness := completeness || jsonb_build_object('suno_rang_ab', true);
      score := score + 5;
    ELSE
      missing_elements := array_append(missing_elements, 'Chanson Suno Rang A+B');
    END IF;
  END;

  -- Construire résultat final
  RETURN jsonb_build_object(
    'item_code', p_item_code,
    'title', item_record.title,
    'completeness_score', score,
    'max_score', 100,
    'percentage', (score::numeric / 100 * 100)::numeric(5,2),
    'checks', completeness,
    'missing_elements', missing_elements,
    'status', CASE
      WHEN score >= 90 THEN 'excellent'
      WHEN score >= 70 THEN 'good'
      WHEN score >= 50 THEN 'average'
      ELSE 'incomplete'
    END
  );
END;
$$;

COMMENT ON FUNCTION check_edn_item_completeness(text) IS
'Vérifie la complétude d''un item EDN selon tous les critères (compétences, paroles, quiz, Suno, BD)';

\echo '✓ Fonction de vérification créée'
\echo ''

-- =============================================
-- SECTION 6: PERMISSIONS RLS (Row Level Security)
-- =============================================

\echo 'Section 6: Configuration RLS...'

-- Activer RLS si pas déjà fait
ALTER TABLE med_mng_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comic_panels ENABLE ROW LEVEL SECURITY;

-- Politique lecture publique pour les contenus statiques
CREATE POLICY IF NOT EXISTS "Lecture publique chansons statiques"
ON med_mng_songs FOR SELECT
USING (is_static = true OR auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Lecture publique BD statiques"
ON comic_panels FOR SELECT
USING (is_static = true OR auth.uid() IS NOT NULL);

-- Politique écriture admin uniquement (à ajuster selon besoins)
CREATE POLICY IF NOT EXISTS "Ecriture admin chansons"
ON med_mng_songs FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY IF NOT EXISTS "Ecriture admin BD"
ON comic_panels FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

\echo '✓ RLS configuré'
\echo ''

-- =============================================
-- SECTION 7: REFRESH VUES MATERIALISEES
-- =============================================

\echo 'Section 7: Rafraîchissement vues matérialisées...'

REFRESH MATERIALIZED VIEW CONCURRENTLY edn_global_stats;

\echo '✓ Vues matérialisées rafraîchies'
\echo ''

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================

\echo '====================================================='
\echo 'MIGRATION TERMINEE AVEC SUCCES !'
\echo '====================================================='
\echo ''
\echo 'Prochaines étapes:'
\echo '1. Générer les paroles pour Rang A, B, AB (voir docs/EDN_COMPLETE_FEATURES_DIAGNOSTIC.md)'
\echo '2. Générer les chansons Suno pour chaque rang'
\echo '3. Générer les bandes dessinées fixes'
\echo '4. Exécuter script de vérification: scripts/verify-edn-complete-features.sql'
\echo ''
\echo 'Pour vérifier un item spécifique:'
\echo '  SELECT check_edn_item_completeness(''IC-001'');'
\echo ''
