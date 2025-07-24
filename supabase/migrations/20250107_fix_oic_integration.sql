-- Fonction pour nettoyer le texte des compétences
CREATE OR REPLACE FUNCTION clean_oic_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN TRIM(
    -- Décoder les entités HTML
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                -- Supprimer les préfixes de liste
                REGEXP_REPLACE(
                  -- Supprimer les balises HTML
                  REGEXP_REPLACE(
                    input_text,
                    '<[^>]+>', '', 'g'
                  ),
                  '^[-*\u2022]\s*', ''
                ),
                '&lt;', '<'
              ),
              '&gt;', '>'
            ),
            '&quot;', '"'
          ),
          '&apos;', '\''
        ),
        '&amp;', '&'
      ),
      '&nbsp;', ' '
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les liens MediaWiki
CREATE OR REPLACE FUNCTION clean_mediawiki_links(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- [[Lien|Texte]] → Texte
  input_text := REGEXP_REPLACE(input_text, '\[\[([^\|\]]+)\|([^\]]+)\]\]', '\\2', 'g');
  -- [[Lien]] → Lien
  input_text := REGEXP_REPLACE(input_text, '\[\[([^\]]+)\]\]', '\\1', 'g');
  
  RETURN TRIM(input_text);
END;
$$ LANGUAGE plpgsql;

-- Étape 1: Nettoyer les données OIC existantes
UPDATE oic_competences
SET 
  intitule = clean_mediawiki_links(clean_oic_text(intitule)),
  description = clean_oic_text(description),
  extraction_status = CASE
    WHEN description IS NULL OR LENGTH(TRIM(description)) < 20 THEN 'incomplete'
    WHEN description LIKE '%&lt;%' OR description LIKE '%[[%' THEN 'cleaned'
    ELSE 'complete'
  END
WHERE extraction_status IS NULL OR extraction_status != 'complete';

-- Étape 2: Gérer les descriptions vides ou trop courtes
UPDATE oic_competences
SET 
  description = COALESCE(
    NULLIF(TRIM(description), ''),
    'Compétence en ' || COALESCE(rubrique, 'médecine') || ': ' || intitule
  ),
  extraction_status = 'generated'
WHERE description IS NULL 
   OR LENGTH(TRIM(description)) < 20;

-- Étape 3: Reconstruire les tableaux rang A et B pour tous les items
DO $$
DECLARE
  item_rec RECORD;
  tableau_a JSONB;
  tableau_b JSONB;
  sections_a JSONB;
  sections_b JSONB;
BEGIN
  FOR item_rec IN 
    SELECT item_code, title 
    FROM edn_items_immersive 
    ORDER BY item_code
  LOOP
    -- Construire le tableau rang A
    WITH competences_groupees AS (
      SELECT 
        COALESCE(rubrique, 'Général') as rubrique,
        json_agg(
          json_build_object(
            'id', objectif_id,
            'text', intitule || CASE 
              WHEN description IS NOT NULL AND description != '' 
              THEN ': ' || description 
              ELSE '' 
            END
          ) ORDER BY ordre
        ) as competences
      FROM oic_competences
      WHERE item_parent = LPAD(REPLACE(item_rec.item_code, 'IC-', ''), 3, '0')
        AND rang = 'A'
      GROUP BY rubrique
      ORDER BY rubrique
    )
    SELECT 
      json_build_object(
        'title', item_rec.title || ' - Rang A',
        'sections', json_agg(
          json_build_object(
            'title', rubrique,
            'content', (
              SELECT string_agg(comp->>'text', E'\n')
              FROM json_array_elements(competences) AS comp
            ),
            'keywords', ARRAY(
              SELECT DISTINCT LOWER(word)
              FROM (
                SELECT regexp_split_to_table(comp->>'text', '\s+') as word
                FROM json_array_elements(competences) AS comp
              ) words
              WHERE LENGTH(word) > 3
              LIMIT 10
            )
          )
        )
      ) INTO tableau_a
    FROM competences_groupees;

    -- Construire le tableau rang B
    WITH competences_groupees AS (
      SELECT 
        COALESCE(rubrique, 'Général') as rubrique,
        json_agg(
          json_build_object(
            'id', objectif_id,
            'text', intitule || CASE 
              WHEN description IS NOT NULL AND description != '' 
              THEN ': ' || description 
              ELSE '' 
            END
          ) ORDER BY ordre
        ) as competences
      FROM oic_competences
      WHERE item_parent = LPAD(REPLACE(item_rec.item_code, 'IC-', ''), 3, '0')
        AND rang = 'B'
      GROUP BY rubrique
      ORDER BY rubrique
    )
    SELECT 
      json_build_object(
        'title', item_rec.title || ' - Rang B',
        'sections', json_agg(
          json_build_object(
            'title', rubrique,
            'content', (
              SELECT string_agg(comp->>'text', E'\n')
              FROM json_array_elements(competences) AS comp
            ),
            'keywords', ARRAY(
              SELECT DISTINCT LOWER(word)
              FROM (
                SELECT regexp_split_to_table(comp->>'text', '\s+') as word
                FROM json_array_elements(competences) AS comp
              ) words
              WHERE LENGTH(word) > 3
              LIMIT 10
            )
          )
        )
      ) INTO tableau_b
    FROM competences_groupees;

    -- Mettre à jour l'item
    UPDATE edn_items_immersive
    SET 
      tableau_rang_a = COALESCE(tableau_a, json_build_object('title', item_rec.title || ' - Rang A', 'sections', '[]'::json)),
      tableau_rang_b = COALESCE(tableau_b, json_build_object('title', item_rec.title || ' - Rang B', 'sections', '[]'::json)),
      updated_at = NOW()
    WHERE item_code = item_rec.item_code;

    -- Log de progression
    RAISE NOTICE 'Item % traité', item_rec.item_code;
  END LOOP;
END $$;

-- Étape 4: Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_oic_extraction_status 
ON oic_competences(extraction_status);

CREATE INDEX IF NOT EXISTS idx_oic_text_search 
ON oic_competences USING gin(to_tsvector('french', intitule || ' ' || COALESCE(description, '')));

-- Étape 5: Créer une vue pour faciliter l'accès aux données propres
CREATE OR REPLACE VIEW v_oic_competences_clean AS
SELECT 
  objectif_id,
  intitule,
  item_parent,
  rang,
  rubrique,
  description,
  ordre,
  url_source,
  extraction_status,
  date_import,
  -- Compteurs de qualité
  LENGTH(COALESCE(description, '')) as description_length,
  CASE 
    WHEN description IS NULL THEN 'vide'
    WHEN LENGTH(description) < 50 THEN 'courte'
    WHEN LENGTH(description) < 200 THEN 'moyenne'
    ELSE 'complete'
  END as description_quality
FROM oic_competences
WHERE extraction_status IN ('complete', 'cleaned', 'generated');

-- Étape 6: Statistiques de vérification
DO $$
DECLARE
  stats RECORD;
BEGIN
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN extraction_status = 'complete' THEN 1 END) as complete,
    COUNT(CASE WHEN extraction_status = 'cleaned' THEN 1 END) as cleaned,
    COUNT(CASE WHEN extraction_status = 'generated' THEN 1 END) as generated,
    COUNT(CASE WHEN extraction_status = 'incomplete' THEN 1 END) as incomplete
  INTO stats
  FROM oic_competences;
  
  RAISE NOTICE 'Statistiques OIC après nettoyage:';
  RAISE NOTICE '  Total: %', stats.total;
  RAISE NOTICE '  Complètes: %', stats.complete;
  RAISE NOTICE '  Nettoyées: %', stats.cleaned;
  RAISE NOTICE '  Générées: %', stats.generated;
  RAISE NOTICE '  Incomplètes: %', stats.incomplete;
  
  -- Vérifier les items EDN
  SELECT COUNT(*) INTO stats.total
  FROM edn_items_immersive
  WHERE tableau_rang_a IS NOT NULL 
    AND jsonb_array_length(tableau_rang_a->'sections') > 0;
    
  RAISE NOTICE '';
  RAISE NOTICE 'Items EDN avec données intégrées: %/367', stats.total;
END $$;

-- Étape 7: Fonction pour vérifier un item spécifique
CREATE OR REPLACE FUNCTION check_edn_item_completeness(p_item_code TEXT)
RETURNS TABLE (
  item_code TEXT,
  title TEXT,
  rang_a_sections INTEGER,
  rang_b_sections INTEGER,
  rang_a_competences INTEGER,
  rang_b_competences INTEGER,
  total_competences INTEGER,
  data_quality TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH item_stats AS (
    SELECT 
      ei.item_code,
      ei.title,
      COALESCE(jsonb_array_length(ei.tableau_rang_a->'sections'), 0) as rang_a_sections,
      COALESCE(jsonb_array_length(ei.tableau_rang_b->'sections'), 0) as rang_b_sections,
      COUNT(CASE WHEN oc.rang = 'A' THEN 1 END) as rang_a_competences,
      COUNT(CASE WHEN oc.rang = 'B' THEN 1 END) as rang_b_competences,
      COUNT(oc.objectif_id) as total_competences
    FROM edn_items_immersive ei
    LEFT JOIN oic_competences oc 
      ON oc.item_parent = LPAD(REPLACE(ei.item_code, 'IC-', ''), 3, '0')
    WHERE ei.item_code = p_item_code
    GROUP BY ei.item_code, ei.title, ei.tableau_rang_a, ei.tableau_rang_b
  )
  SELECT 
    item_code,
    title,
    rang_a_sections,
    rang_b_sections,
    rang_a_competences,
    rang_b_competences,
    total_competences,
    CASE 
      WHEN total_competences = 0 THEN 'Aucune compétence'
      WHEN rang_a_sections = 0 AND rang_b_sections = 0 THEN 'Tableaux vides'
      WHEN rang_a_competences != rang_a_sections THEN 'Désynchronisé'
      ELSE 'OK'
    END as data_quality
  FROM item_stats;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'utilisation:
-- SELECT * FROM check_edn_item_completeness('IC-1');

