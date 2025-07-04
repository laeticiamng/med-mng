-- Correction de la fonction pour migrer et intégrer tous les items EDN
CREATE OR REPLACE FUNCTION migrate_edn_items_to_platform()
RETURNS TABLE (
  processed_count INTEGER,
  success_count INTEGER,
  error_count INTEGER,
  details JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  processed INTEGER := 0;
  success INTEGER := 0;
  errors INTEGER := 0;
  error_details JSONB := '[]'::jsonb;
  item_slug TEXT;
  tableau_rang_a_data JSONB;
  tableau_rang_b_data JSONB;
  quiz_data JSONB;
  scene_data JSONB;
  rang_a_sections JSONB;
  rang_b_sections JSONB;
BEGIN
  -- Parcourir tous les items EDN de la table UNESS
  FOR item_record IN 
    SELECT item_id, intitule, rangs_a, rangs_b, contenu_complet_html 
    FROM edn_items_uness 
    ORDER BY item_id
  LOOP
    BEGIN
      processed := processed + 1;
      
      -- Générer un slug unique
      item_slug := 'ic-' || item_record.item_id;
      
      -- Créer les sections pour Rang A
      IF item_record.rangs_a IS NOT NULL AND array_length(item_record.rangs_a, 1) > 0 THEN
        WITH numbered_rangs AS (
          SELECT row_number() OVER() as rn, rang 
          FROM unnest(item_record.rangs_a) AS rang
        )
        SELECT jsonb_agg(
          jsonb_build_object(
            'title', 'Connaissance ' || rn,
            'content', rang,
            'keywords', string_to_array(lower(regexp_replace(rang, '[^a-zA-Z0-9\s]', '', 'g')), ' ')
          )
        ) INTO rang_a_sections FROM numbered_rangs;
      ELSE
        rang_a_sections := '[{"title": "Connaissances de base", "content": "Connaissances fondamentales à acquérir", "keywords": ["fondamental", "base", "connaissance"]}]'::jsonb;
      END IF;
      
      -- Créer les sections pour Rang B
      IF item_record.rangs_b IS NOT NULL AND array_length(item_record.rangs_b, 1) > 0 THEN
        WITH numbered_rangs AS (
          SELECT row_number() OVER() as rn, rang 
          FROM unnest(item_record.rangs_b) AS rang
        )
        SELECT jsonb_agg(
          jsonb_build_object(
            'title', 'Connaissance approfondie ' || rn,
            'content', rang,
            'keywords', string_to_array(lower(regexp_replace(rang, '[^a-zA-Z0-9\s]', '', 'g')), ' ')
          )
        ) INTO rang_b_sections FROM numbered_rangs;
      ELSE
        rang_b_sections := '[{"title": "Connaissances approfondies", "content": "Connaissances avancées et spécialisées", "keywords": ["approfondi", "avancé", "spécialisé"]}]'::jsonb;
      END IF;
      
      -- Créer les données structurées pour tableau Rang A
      tableau_rang_a_data := jsonb_build_object(
        'title', 'IC-' || item_record.item_id || ' Rang A - ' || COALESCE(item_record.intitule, 'Item ' || item_record.item_id),
        'sections', rang_a_sections
      );
      
      -- Créer les données structurées pour tableau Rang B
      tableau_rang_b_data := jsonb_build_object(
        'title', 'IC-' || item_record.item_id || ' Rang B - Connaissances approfondies',
        'sections', rang_b_sections
      );
      
      -- Créer des données de quiz basiques
      quiz_data := jsonb_build_array(
        jsonb_build_object(
          'id', 1,
          'question', 'Quelle est la principale connaissance à retenir pour ' || COALESCE(item_record.intitule, 'cet item') || ' ?',
          'options', jsonb_build_array('Concept fondamental', 'Application pratique', 'Compréhension théorique', 'Synthèse globale'),
          'correct', 0,
          'explanation', 'Cette question permet d''évaluer la compréhension des concepts fondamentaux.'
        ),
        jsonb_build_object(
          'id', 2,
          'question', 'Comment appliquer les connaissances de ' || COALESCE(item_record.intitule, 'cet item') || ' en pratique ?',
          'options', jsonb_build_array('Par la théorie seule', 'Par l''application clinique', 'Par la mémorisation', 'Par la répétition'),
          'correct', 1,
          'explanation', 'L''application clinique est essentielle pour maîtriser les compétences médicales.'
        )
      );
      
      -- Créer des données de scène immersive
      scene_data := jsonb_build_object(
        'theme', 'medical',
        'ambiance', 'clinical',
        'interactions', jsonb_build_array(
          jsonb_build_object(
            'type', 'dialogue',
            'content', 'Explorez les concepts clés de ' || COALESCE(item_record.intitule, 'cet item EDN'),
            'responses', jsonb_build_array('Commencer l''exploration', 'Voir les détails', 'Accéder aux ressources')
          )
        )
      );
      
      -- Insérer ou mettre à jour l'item dans la plateforme
      INSERT INTO edn_items_immersive (
        item_code,
        title,
        subtitle,
        slug,
        tableau_rang_a,
        tableau_rang_b,
        quiz_questions,
        scene_immersive,
        pitch_intro,
        paroles_musicales,
        created_at,
        updated_at
      ) VALUES (
        'IC-' || item_record.item_id,
        COALESCE(item_record.intitule, 'Item EDN ' || item_record.item_id),
        'Item de connaissance E-LiSA - IC-' || item_record.item_id,
        item_slug,
        tableau_rang_a_data,
        tableau_rang_b_data,
        quiz_data,
        scene_data,
        'Découvrez les connaissances essentielles de ' || COALESCE(item_record.intitule, 'cet item EDN') || ' à travers une approche immersive et interactive.',
        ARRAY['Découvrez les mélodies de la médecine avec ' || COALESCE(item_record.intitule, 'cet item')],
        now(),
        now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        tableau_rang_a = EXCLUDED.tableau_rang_a,
        tableau_rang_b = EXCLUDED.tableau_rang_b,
        quiz_questions = EXCLUDED.quiz_questions,
        scene_immersive = EXCLUDED.scene_immersive,
        pitch_intro = EXCLUDED.pitch_intro,
        paroles_musicales = EXCLUDED.paroles_musicales,
        updated_at = now();
      
      success := success + 1;
      
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      error_details := error_details || jsonb_build_object(
        'item_id', item_record.item_id,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  -- Retourner les résultats
  RETURN QUERY SELECT processed, success, errors, error_details;
END;
$$;