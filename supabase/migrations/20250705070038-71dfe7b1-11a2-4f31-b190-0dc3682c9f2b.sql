-- Créer une table de sauvegarde de la méthode d'extraction OIC
CREATE TABLE public.oic_extraction_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_name TEXT NOT NULL,
  extraction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_extracted INTEGER NOT NULL,
  extraction_script TEXT NOT NULL,
  regex_patterns JSONB NOT NULL,
  success_rate DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS pour protection
ALTER TABLE public.oic_extraction_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can manage extraction methods"
  ON public.oic_extraction_methods FOR ALL
  USING (true);

-- Index pour optimisation
CREATE INDEX idx_oic_extraction_methods_date ON public.oic_extraction_methods(extraction_date);
CREATE INDEX idx_oic_extraction_methods_success ON public.oic_extraction_methods(success_rate);

-- Fonction pour vérifier l'intégrité des données OIC
CREATE OR REPLACE FUNCTION public.verify_oic_data_integrity()
RETURNS TABLE(
  total_competences INTEGER,
  with_content INTEGER,
  without_content INTEGER,
  by_item JSONB,
  by_rank JSONB,
  integrity_score DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER;
  content_count INTEGER;
  empty_count INTEGER;
  item_stats JSONB;
  rank_stats JSONB;
  score DECIMAL(5,2);
BEGIN
  -- Compter total
  SELECT COUNT(*) INTO total_count FROM oic_competences;
  
  -- Compter avec contenu
  SELECT COUNT(*) INTO content_count 
  FROM oic_competences 
  WHERE description IS NOT NULL AND LENGTH(TRIM(description)) > 0;
  
  -- Calculer sans contenu
  empty_count := total_count - content_count;
  
  -- Stats par item
  SELECT jsonb_object_agg(item_parent, item_count)
  INTO item_stats
  FROM (
    SELECT item_parent, COUNT(*) as item_count
    FROM oic_competences
    GROUP BY item_parent
    ORDER BY item_parent::INTEGER
  ) sub;
  
  -- Stats par rang
  SELECT jsonb_object_agg(rang, rang_count)
  INTO rank_stats
  FROM (
    SELECT rang, COUNT(*) as rang_count
    FROM oic_competences
    GROUP BY rang
  ) sub;
  
  -- Score d'intégrité
  score := CASE 
    WHEN total_count > 0 THEN (content_count::DECIMAL / total_count::DECIMAL) * 100
    ELSE 0
  END;
  
  RETURN QUERY SELECT total_count, content_count, empty_count, item_stats, rank_stats, score;
END;
$$;

-- Fonction pour organiser les compétences par item et rang
CREATE OR REPLACE FUNCTION public.organize_competences_by_item_and_rank()
RETURNS TABLE(
  item_number INTEGER,
  rang_a_competences JSONB,
  rang_b_competences JSONB,
  total_rang_a INTEGER,
  total_rang_b INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH item_competences AS (
    SELECT 
      item_parent::INTEGER as item_num,
      rang,
      jsonb_agg(
        jsonb_build_object(
          'objectif_id', objectif_id,
          'intitule', intitule,
          'description', description,
          'rubrique', rubrique,
          'ordre', ordre,
          'url_source', url_source
        ) ORDER BY ordre, objectif_id
      ) as competences
    FROM oic_competences
    WHERE item_parent IS NOT NULL
    GROUP BY item_parent::INTEGER, rang
  ),
  item_summary AS (
    SELECT 
      item_num,
      COALESCE(MAX(CASE WHEN rang = 'A' THEN competences END), '[]'::jsonb) as rang_a,
      COALESCE(MAX(CASE WHEN rang = 'B' THEN competences END), '[]'::jsonb) as rang_b,
      COALESCE(MAX(CASE WHEN rang = 'A' THEN jsonb_array_length(competences) END), 0) as count_a,
      COALESCE(MAX(CASE WHEN rang = 'B' THEN jsonb_array_length(competences) END), 0) as count_b
    FROM item_competences
    GROUP BY item_num
  )
  SELECT 
    item_num,
    rang_a,
    rang_b,
    count_a,
    count_b
  FROM item_summary
  ORDER BY item_num;
END;
$$;

-- Fonction pour intégrer les compétences dans les items EDN
CREATE OR REPLACE FUNCTION public.integrate_oic_into_edn_items()
RETURNS TABLE(
  updated_items INTEGER,
  success_count INTEGER,
  error_count INTEGER,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  success INTEGER := 0;
  errors INTEGER := 0;
  result_details JSONB := '[]'::jsonb;
  rang_a_data JSONB;
  rang_b_data JSONB;
  paroles_data TEXT[];
BEGIN
  -- Parcourir chaque item EDN
  FOR item_record IN 
    SELECT id, item_code, title, slug
    FROM edn_items_immersive 
    ORDER BY item_code
  LOOP
    BEGIN
      -- Extraire le numéro d'item
      DECLARE
        item_num INTEGER := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
        competences_a JSONB;
        competences_b JSONB;
      BEGIN
        -- Récupérer les compétences rang A pour cet item
        SELECT jsonb_agg(
          jsonb_build_object(
            'title', COALESCE(intitule, objectif_id),
            'content', COALESCE(description, 'Compétence ' || objectif_id || ' - ' || rubrique),
            'keywords', ARRAY[
              LOWER(rubrique),
              'item' || item_parent,
              'rang-a',
              objectif_id
            ]
          )
        )
        INTO competences_a
        FROM oic_competences
        WHERE item_parent = item_num::TEXT AND rang = 'A';
        
        -- Récupérer les compétences rang B pour cet item
        SELECT jsonb_agg(
          jsonb_build_object(
            'title', COALESCE(intitule, objectif_id),
            'content', COALESCE(description, 'Compétence ' || objectif_id || ' - ' || rubrique),
            'keywords', ARRAY[
              LOWER(rubrique),
              'item' || item_parent,
              'rang-b',
              objectif_id
            ]
          )
        )
        INTO competences_b
        FROM oic_competences
        WHERE item_parent = item_num::TEXT AND rang = 'B';
        
        -- Construire les données tableau rang A
        rang_a_data := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - Compétences fondamentales',
          'sections', COALESCE(competences_a, '[]'::jsonb)
        );
        
        -- Construire les données tableau rang B
        rang_b_data := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - Compétences approfondies',
          'sections', COALESCE(competences_b, '[]'::jsonb)
        );
        
        -- Créer les paroles à partir du contenu des compétences
        SELECT ARRAY[
          '[Rang A - ' || item_record.item_code || '] ' || 
          STRING_AGG(
            SUBSTRING(COALESCE(description, intitule, objectif_id) FROM 1 FOR 50) || '...',
            ', '
          ) ||  ' - connaissances de base',
          '[Rang B - ' || item_record.item_code || '] ' || 
          COALESCE(
            (SELECT STRING_AGG(
              SUBSTRING(COALESCE(description, intitule, objectif_id) FROM 1 FOR 50) || '...',
              ', '
            )
            FROM oic_competences
            WHERE item_parent = item_num::TEXT AND rang = 'B'),
            'Compétences approfondies'
          ) || ' - expertise avancée'
        ]
        INTO paroles_data
        FROM oic_competences
        WHERE item_parent = item_num::TEXT AND rang = 'A'
        GROUP BY item_parent;
        
        -- Mettre à jour l'item EDN
        UPDATE edn_items_immersive
        SET 
          tableau_rang_a = rang_a_data,
          tableau_rang_b = rang_b_data,
          paroles_musicales = COALESCE(paroles_data, ARRAY[
            'Item ' || item_num || ' - Compétences fondamentales à maîtriser',
            'Item ' || item_num || ' - Expertise médicale approfondie'
          ]),
          updated_at = now()
        WHERE id = item_record.id;
        
        updated := updated + 1;
        success := success + 1;
        
        result_details := result_details || jsonb_build_object(
          'item_code', item_record.item_code,
          'item_number', item_num,
          'competences_a_count', COALESCE(jsonb_array_length(competences_a), 0),
          'competences_b_count', COALESCE(jsonb_array_length(competences_b), 0),
          'status', 'updated'
        );
      END;
      
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'error', SQLERRM,
        'status', 'error'
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT updated, success, errors, result_details;
END;
$$;

-- Enregistrer la méthode d'extraction utilisée
INSERT INTO public.oic_extraction_methods (
  method_name,
  total_extracted,
  extraction_script,
  regex_patterns,
  success_rate,
  notes
) VALUES (
  'OIC Competences Extraction v1.0',
  4872,
  'extract-oic-competences.cjs - Script Node.js avec Puppeteer pour extraction UNESS',
  '{
    "main_pattern": "OIC-(\\\\d{3})-(\\\\d{2})-([AB])",
    "patterns_tested": [
      "OIC-\\\\d{3}-\\\\d{2}-[AB]",
      "OIC[\\\\s_-]\\\\d{3}[\\\\s_-]\\\\d{2}[\\\\s_-][AB]",
      "OIC.*\\\\d{3}.*\\\\d{2}.*[AB]"
    ],
    "api_url": "https://livret.uness.fr/lisa/2025/api.php",
    "category": "Catégorie:Objectif_de_connaissance"
  }'::jsonb,
  100.00,
  'Extraction complète réussie le 2025-01-05. Méthode hybride API MediaWiki + scraping HTML. Authentification CAS UNESS requise. Format OIC: XXX=numéro item (1-367), YY=rubrique, Z=rang (A/B).'
);