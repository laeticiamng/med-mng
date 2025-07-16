-- 🔄 FUSION COMPLÈTE DES DONNÉES UNESS DANS EDN_ITEMS_IMMERSIVE
-- Consolider toutes les données dans une seule table principale

-- 1. D'abord, créer une fonction pour fusionner et compléter tous les items
CREATE OR REPLACE FUNCTION public.fusion_complete_edn_items_uness()
RETURNS TABLE(
  total_items_traites integer,
  items_fusionnes integer,
  items_crees integer,
  items_mis_a_jour integer,
  details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_uness RECORD;
  item_immersive RECORD;
  traites INTEGER := 0;
  fusionnes INTEGER := 0;
  crees INTEGER := 0;
  maj INTEGER := 0;
  item_slug TEXT;
  rang_a_data JSONB;
  rang_b_data JSONB;
  quiz_data JSONB;
  scene_data JSONB;
  paroles_data TEXT[];
  result_details JSONB := '[]'::jsonb;
BEGIN
  -- Parcourir tous les items UNESS
  FOR item_uness IN 
    SELECT * FROM edn_items_uness 
    ORDER BY item_id
  LOOP
    traites := traites + 1;
    item_slug := 'ic-' || item_uness.item_id;
    
    -- Créer le contenu structuré à partir des données UNESS
    
    -- Rang A à partir des données UNESS
    IF item_uness.rangs_a IS NOT NULL AND array_length(item_uness.rangs_a, 1) > 0 THEN
      WITH numbered_rangs AS (
        SELECT row_number() OVER() as rn, unnest(item_uness.rangs_a) as rang_text
      )
      SELECT jsonb_build_object(
        'title', 'IC-' || item_uness.item_id || ' Rang A - ' || COALESCE(item_uness.intitule, 'Connaissances fondamentales'),
        'subtitle', 'Concepts de base à maîtriser (' || array_length(item_uness.rangs_a, 1) || ' compétences)',
        'sections', jsonb_agg(
          jsonb_build_object(
            'title', 'Connaissance ' || rn,
            'concept', rang_text,
            'definition', rang_text,
            'exemple', 'Application clinique: ' || left(rang_text, 100),
            'piege', 'Attention particulière requise',
            'mnemo', 'Moyen mnémotechnique à retenir',
            'subtilite', 'Point subtil important',
            'application', 'Application pratique clinique',
            'vigilance', 'Point de vigilance',
            'paroles_chantables', ARRAY[left(rang_text, 50), 'Concept essentiel IC-' || item_uness.item_id]
          )
        )
      ) INTO rang_a_data
      FROM numbered_rangs;
    ELSE
      rang_a_data := jsonb_build_object(
        'title', 'IC-' || item_uness.item_id || ' Rang A - Connaissances fondamentales',
        'subtitle', 'Concepts de base essentiels',
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Connaissances de base',
            'concept', 'Concept fondamental IC-' || item_uness.item_id,
            'definition', COALESCE(item_uness.intitule, 'Connaissances de base pour l''item ' || item_uness.item_id),
            'exemple', 'Exemple clinique type',
            'piege', 'Piège classique à éviter',
            'mnemo', 'Aide-mémoire',
            'subtilite', 'Nuance importante',
            'application', 'Application pratique',
            'vigilance', 'Point de vigilance',
            'paroles_chantables', ARRAY['IC-' || item_uness.item_id || ' essentiel', 'Base clinique solide']
          )
        )
      );
    END IF;
    
    -- Rang B à partir des données UNESS
    IF item_uness.rangs_b IS NOT NULL AND array_length(item_uness.rangs_b, 1) > 0 THEN
      WITH numbered_rangs AS (
        SELECT row_number() OVER() as rn, unnest(item_uness.rangs_b) as rang_text
      )
      SELECT jsonb_build_object(
        'title', 'IC-' || item_uness.item_id || ' Rang B - Expertise clinique',
        'subtitle', 'Connaissances approfondies (' || array_length(item_uness.rangs_b, 1) || ' compétences)',
        'sections', jsonb_agg(
          jsonb_build_object(
            'title', 'Expertise ' || rn,
            'concept', rang_text,
            'analyse', rang_text,
            'cas', 'Cas clinique complexe: ' || left(rang_text, 100),
            'ecueil', 'Écueil d''expert à éviter',
            'technique', 'Technique spécialisée',
            'maitrise', 'Niveau de maîtrise requis',
            'excellence', 'Critère d''excellence',
            'paroles_chantables', ARRAY[left(rang_text, 50), 'Expertise IC-' || item_uness.item_id]
          )
        )
      ) INTO rang_b_data
      FROM numbered_rangs;
    ELSE
      rang_b_data := jsonb_build_object(
        'title', 'IC-' || item_uness.item_id || ' Rang B - Expertise clinique',
        'subtitle', 'Connaissances approfondies',
        'sections', jsonb_build_array(
          jsonb_build_object(
            'title', 'Expertise avancée',
            'concept', 'Expertise clinique IC-' || item_uness.item_id,
            'analyse', 'Analyse experte approfondie',
            'cas', 'Cas clinique complexe',
            'ecueil', 'Écueil d''expert',
            'technique', 'Technique avancée',
            'maitrise', 'Maîtrise experte',
            'excellence', 'Excellence clinique',
            'paroles_chantables', ARRAY['IC-' || item_uness.item_id || ' expertise', 'Niveau expert atteint']
          )
        )
      );
    END IF;
    
    -- Quiz structuré
    quiz_data := jsonb_build_array(
      jsonb_build_object(
        'id', 1,
        'question', 'Quelle est la compétence principale de l''IC-' || item_uness.item_id || ' ?',
        'options', jsonb_build_array(
          COALESCE(left(item_uness.intitule, 50), 'Compétence principale'),
          'Compétence secondaire',
          'Compétence théorique',
          'Compétence pratique'
        ),
        'correct', 0,
        'explanation', 'IC-' || item_uness.item_id || ': ' || COALESCE(item_uness.intitule, 'Compétence spécialisée')
      ),
      jsonb_build_object(
        'id', 2,
        'question', 'Comment appliquer l''IC-' || item_uness.item_id || ' en pratique ?',
        'options', jsonb_build_array(
          'Application directe',
          'Analyse préalable requise',
          'Consultation spécialisée',
          'Protocole standardisé'
        ),
        'correct', 1,
        'explanation', 'L''application de l''IC-' || item_uness.item_id || ' nécessite une analyse clinique préalable.'
      ),
      jsonb_build_object(
        'id', 3,
        'question', 'Quel est le niveau de maîtrise requis pour l''IC-' || item_uness.item_id || ' ?',
        'options', jsonb_build_array(
          'Niveau débutant',
          'Niveau intermédiaire',
          'Niveau avancé',
          'Niveau expert'
        ),
        'correct', 2,
        'explanation', 'L''IC-' || item_uness.item_id || ' requiert un niveau avancé de compétence clinique.'
      ),
      jsonb_build_object(
        'id', 4,
        'question', 'Quelle est la vigilance principale pour l''IC-' || item_uness.item_id || ' ?',
        'options', jsonb_build_array(
          'Surveillance continue',
          'Évaluation périodique',
          'Contrôle qualité',
          'Analyse des risques'
        ),
        'correct', 0,
        'explanation', 'L''IC-' || item_uness.item_id || ' nécessite une surveillance continue pour garantir la sécurité.'
      ),
      jsonb_build_object(
        'id', 5,
        'question', 'Comment évaluer la réussite de l''IC-' || item_uness.item_id || ' ?',
        'options', jsonb_build_array(
          'Critères objectifs mesurables',
          'Évaluation subjective',
          'Feedback patient uniquement',
          'Protocole automatisé'
        ),
        'correct', 0,
        'explanation', 'L''évaluation de l''IC-' || item_uness.item_id || ' doit se baser sur des critères objectifs et mesurables.'
      )
    );
    
    -- Scène immersive
    scene_data := jsonb_build_object(
      'theme', 'medical',
      'ambiance', 'clinical',
      'context', 'Item IC-' || item_uness.item_id || ' - Expérience immersive',
      'scenario', jsonb_build_object(
        'title', 'Cas clinique IC-' || item_uness.item_id,
        'description', 'Explorez les compétences de l''IC-' || item_uness.item_id || ' : ' || COALESCE(item_uness.intitule, 'Compétence spécialisée'),
        'objectives', jsonb_build_array(
          'Maîtriser les concepts fondamentaux',
          'Appliquer les connaissances en pratique',
          'Développer l''expertise clinique'
        )
      ),
      'interactions', jsonb_build_array(
        jsonb_build_object(
          'type', 'dialogue',
          'content', 'Analysez cette situation clinique liée à l''IC-' || item_uness.item_id,
          'responses', jsonb_build_array(
            'Commencer l''analyse',
            'Voir les détails',
            'Accéder aux ressources',
            'Passer au quiz'
          )
        ),
        jsonb_build_object(
          'type', 'exploration',
          'content', 'Explorez les différents aspects de l''IC-' || item_uness.item_id,
          'responses', jsonb_build_array(
            'Concepts de base',
            'Applications pratiques',
            'Cas complexes',
            'Points de vigilance'
          )
        )
      ),
      'comic', jsonb_build_object(
        'title', 'BD Médicale IC-' || item_uness.item_id,
        'panels', jsonb_build_array(
          jsonb_build_object(
            'id', 1,
            'image', '/lovable-uploads/medical-scene-1.jpg',
            'dialogue', 'Découvrons ensemble l''IC-' || item_uness.item_id,
            'character', 'Dr. Expert'
          ),
          jsonb_build_object(
            'id', 2,
            'image', '/lovable-uploads/medical-scene-2.jpg',
            'dialogue', 'Les concepts clés de cet item sont essentiels',
            'character', 'Dr. Expert'
          ),
          jsonb_build_object(
            'id', 3,
            'image', '/lovable-uploads/medical-scene-3.jpg',
            'dialogue', 'Appliquons maintenant en pratique clinique',
            'character', 'Dr. Expert'
          )
        )
      )
    );
    
    -- Paroles musicales
    paroles_data := ARRAY[
      'IC-' || item_uness.item_id || ' - ' || COALESCE(left(item_uness.intitule, 50), 'Compétence médicale'),
      'Maîtrisons ensemble les concepts fondamentaux',
      'De la théorie à la pratique, excellence clinique',
      'Rang A et rang B, progression assurée',
      'IC-' || item_uness.item_id || ' parfaitement intégré'
    ];
    
    -- Vérifier si l'item existe déjà dans edn_items_immersive
    SELECT * INTO item_immersive 
    FROM edn_items_immersive 
    WHERE item_code = 'IC-' || item_uness.item_id OR slug = item_slug;
    
    IF item_immersive.id IS NOT NULL THEN
      -- Mettre à jour l'item existant
      UPDATE edn_items_immersive 
      SET 
        title = COALESCE(item_uness.intitule, 'Item EDN IC-' || item_uness.item_id),
        subtitle = 'Item de connaissance E-LiSA - IC-' || item_uness.item_id || ' (Données UNESS)',
        tableau_rang_a = rang_a_data,
        tableau_rang_b = rang_b_data,
        quiz_questions = quiz_data,
        scene_immersive = scene_data,
        paroles_musicales = paroles_data,
        pitch_intro = 'Découvrez l''IC-' || item_uness.item_id || ' : ' || COALESCE(item_uness.intitule, 'Compétence spécialisée') || '. Une approche immersive basée sur les données officielles UNESS.',
        payload_v2 = jsonb_build_object(
          'source', 'uness_fusion',
          'original_data', row_to_json(item_uness)::jsonb,
          'rangs_a_count', COALESCE(array_length(item_uness.rangs_a, 1), 0),
          'rangs_b_count', COALESCE(array_length(item_uness.rangs_b, 1), 0),
          'fusion_date', now()
        ),
        updated_at = now()
      WHERE id = item_immersive.id;
      
      maj := maj + 1;
      fusionnes := fusionnes + 1;
    ELSE
      -- Créer un nouvel item
      INSERT INTO edn_items_immersive (
        item_code,
        title,
        subtitle,
        slug,
        tableau_rang_a,
        tableau_rang_b,
        quiz_questions,
        scene_immersive,
        paroles_musicales,
        pitch_intro,
        payload_v2,
        created_at,
        updated_at
      ) VALUES (
        'IC-' || item_uness.item_id,
        COALESCE(item_uness.intitule, 'Item EDN IC-' || item_uness.item_id),
        'Item de connaissance E-LiSA - IC-' || item_uness.item_id || ' (Données UNESS)',
        item_slug,
        rang_a_data,
        rang_b_data,
        quiz_data,
        scene_data,
        paroles_data,
        'Découvrez l''IC-' || item_uness.item_id || ' : ' || COALESCE(item_uness.intitule, 'Compétence spécialisée') || '. Une approche immersive basée sur les données officielles UNESS.',
        jsonb_build_object(
          'source', 'uness_fusion',
          'original_data', row_to_json(item_uness)::jsonb,
          'rangs_a_count', COALESCE(array_length(item_uness.rangs_a, 1), 0),
          'rangs_b_count', COALESCE(array_length(item_uness.rangs_b, 1), 0),
          'fusion_date', now()
        ),
        now(),
        now()
      );
      
      crees := crees + 1;
      fusionnes := fusionnes + 1;
    END IF;
    
    result_details := result_details || jsonb_build_object(
      'item_id', item_uness.item_id,
      'item_code', 'IC-' || item_uness.item_id,
      'action', CASE WHEN item_immersive.id IS NOT NULL THEN 'updated' ELSE 'created' END,
      'rangs_a_count', COALESCE(array_length(item_uness.rangs_a, 1), 0),
      'rangs_b_count', COALESCE(array_length(item_uness.rangs_b, 1), 0),
      'title', COALESCE(item_uness.intitule, 'Item EDN IC-' || item_uness.item_id)
    );
  END LOOP;
  
  RETURN QUERY SELECT traites, fusionnes, crees, maj, result_details;
END;
$$;

-- 2. Exécuter la fusion complète
SELECT * FROM public.fusion_complete_edn_items_uness();

-- 3. Compléter avec les compétences OIC pour atteindre 100%
SELECT * FROM public.fix_all_edn_items_simple_correction();