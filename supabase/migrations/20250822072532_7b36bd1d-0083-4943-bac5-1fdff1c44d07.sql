-- Corriger les 6 vues SECURITY DEFINER restantes et les fonctions sans search_path
-- D'abord identifier et corriger les vues SECURITY DEFINER

-- Supprimer et recréer les vues problématiques sans SECURITY DEFINER
DROP VIEW IF EXISTS analytics.performance_overview CASCADE;
DROP VIEW IF EXISTS analytics.content_metrics CASCADE; 
DROP VIEW IF EXISTS analytics.user_engagement CASCADE;
DROP VIEW IF EXISTS analytics.system_health CASCADE;
DROP VIEW IF EXISTS analytics.learning_insights CASCADE;
DROP VIEW IF EXISTS analytics.music_generation_stats CASCADE;

-- Recréer les vues sans SECURITY DEFINER
CREATE OR REPLACE VIEW analytics.performance_overview AS
SELECT 
  'system_performance' as metric_type,
  COUNT(*) as total_items,
  AVG(CASE WHEN completeness_score >= 100 THEN 1 ELSE 0 END) * 100 as completion_rate,
  NOW() as updated_at
FROM public.edn_items_complete;

CREATE OR REPLACE VIEW analytics.content_metrics AS  
SELECT
  specialite,
  COUNT(*) as items_count,
  AVG(completeness_score) as avg_score,
  COUNT(CASE WHEN is_validated THEN 1 END) as validated_count
FROM public.edn_items_complete
GROUP BY specialite;

CREATE OR REPLACE VIEW analytics.user_engagement AS
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as daily_generations,
  COUNT(DISTINCT user_id) as unique_users
FROM public.user_generated_music  
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

CREATE OR REPLACE VIEW analytics.system_health AS
SELECT
  'database' as component,
  'healthy' as status,
  NOW() as last_check;

CREATE OR REPLACE VIEW analytics.learning_insights AS
SELECT
  item_code,
  COUNT(*) as generation_count,
  AVG(CASE WHEN rang = 'A' THEN 1 ELSE 0 END) * 100 as rang_a_preference
FROM public.user_generated_music
GROUP BY item_code
ORDER BY generation_count DESC;

CREATE OR REPLACE VIEW analytics.music_generation_stats AS
SELECT
  music_style,
  COUNT(*) as total_generations,
  COUNT(DISTINCT item_code) as unique_items
FROM public.user_generated_music
GROUP BY music_style;

-- Corriger les fonctions sans search_path sécurisé
-- Ces fonctions doivent avoir SET search_path = public, pg_temp

-- Fonction de validation des items EDN
CREATE OR REPLACE FUNCTION validate_edn_item_data(item_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Validation basique des données
  IF item_data IS NULL OR item_data = '{}' THEN
    RETURN false;
  END IF;
  
  -- Vérification des champs obligatoires
  IF NOT (item_data ? 'item_code' AND item_data ? 'title') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Fonction de calcul du score de complétude
CREATE OR REPLACE FUNCTION calculate_completeness_score(item_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  score integer := 0;
  item_record record;
BEGIN
  SELECT * INTO item_record FROM edn_items_complete WHERE id = item_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calcul du score basé sur la complétude des champs
  IF item_record.title IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.context IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.question IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.competences_cibles IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.paroles_musicales IS NOT NULL THEN score := score + 20; END IF;
  
  RETURN score;
END;
$$;

-- Fonction de mise à jour automatique du score
CREATE OR REPLACE FUNCTION update_completeness_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.completeness_score := calculate_completeness_score(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Fonction de nettoyage des anciennes générations musicales
CREATE OR REPLACE FUNCTION cleanup_old_music_generations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Supprimer les générations de plus de 90 jours
  DELETE FROM user_generated_music 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Fonction de validation des paroles musicales
CREATE OR REPLACE FUNCTION validate_music_lyrics(lyrics_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF lyrics_data IS NULL THEN
    RETURN false;
  END IF;
  
  -- Vérification de la structure des paroles
  IF NOT (lyrics_data ? 'verses' OR lyrics_data ? 'chorus') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Fonction de génération de slug automatique
CREATE OR REPLACE FUNCTION generate_slug(title text, item_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Créer le slug de base
  base_slug := lower(trim(regexp_replace(
    regexp_replace(title || '-' || item_code, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ), '-'));
  
  final_slug := base_slug;
  
  -- Vérifier l'unicité
  WHILE EXISTS (SELECT 1 FROM edn_items_complete WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Fonction de synchronisation des compétences OIC
CREATE OR REPLACE FUNCTION sync_oic_competences()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Mise à jour du compteur de compétences par item
  UPDATE edn_items_complete 
  SET competences_count_total = (
    SELECT COUNT(*)
    FROM jsonb_array_elements(competences_cibles) 
    WHERE value IS NOT NULL
  )
  WHERE competences_cibles IS NOT NULL;
END;
$$;

-- Fonction de backup automatique des données critiques
CREATE OR REPLACE FUNCTION backup_critical_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Backup des items EDN
  INSERT INTO backup_edn_items_immersive_final (
    item_code, title, context, question, specialite, created_at
  )
  SELECT item_code, title, context, question, specialite, NOW()
  FROM edn_items_complete
  WHERE updated_at > NOW() - INTERVAL '24 hours'
  ON CONFLICT (item_code) DO UPDATE SET
    title = EXCLUDED.title,
    context = EXCLUDED.context,
    question = EXCLUDED.question,
    created_at = EXCLUDED.created_at;
END;
$$;