-- Créer le schéma analytics manquant et corriger les problèmes de sécurité
-- D'abord créer le schéma analytics
CREATE SCHEMA IF NOT EXISTS analytics;

-- Corriger uniquement les fonctions sans search_path sécurisé
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
  IF item_record.completeness_score IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.competences_count_total > 0 THEN score := score + 20; END IF;
  IF item_record.paroles_musicales IS NOT NULL THEN score := score + 20; END IF;
  IF item_record.is_validated THEN score := score + 20; END IF;
  
  RETURN score;
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
    FROM jsonb_array_elements(competences_oic_rang_a) 
    WHERE value IS NOT NULL
  ) + (
    SELECT COUNT(*)
    FROM jsonb_array_elements(competences_oic_rang_b) 
    WHERE value IS NOT NULL
  )
  WHERE competences_oic_rang_a IS NOT NULL OR competences_oic_rang_b IS NOT NULL;
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
    item_code, title, created_at
  )
  SELECT item_code, title, NOW()
  FROM edn_items_complete
  WHERE updated_at > NOW() - INTERVAL '24 hours'
  ON CONFLICT (item_code) DO UPDATE SET
    title = EXCLUDED.title,
    created_at = EXCLUDED.created_at;
END;
$$;