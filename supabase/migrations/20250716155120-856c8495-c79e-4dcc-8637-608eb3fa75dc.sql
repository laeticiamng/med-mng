CREATE OR REPLACE FUNCTION public.complete_missing_edn_fields()
RETURNS TABLE(updated_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  item_num INTEGER;
  result_details JSONB := '[]'::jsonb;
BEGIN
  FOR item_record IN SELECT id, item_code, title FROM edn_items_immersive ORDER BY CAST(SUBSTRING(item_code FROM 'IC-([0-9]+)') AS INTEGER) LOOP
    BEGIN
      item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
      
      -- Compléter les champs manquants
      UPDATE edn_items_immersive 
      SET 
        -- Ajouter interaction_config si manquant
        interaction_config = CASE 
          WHEN interaction_config IS NULL THEN jsonb_build_object(
            'type', 'simulation',
            'scenario', 'Cas clinique interactif pour ' || item_record.title,
            'questions', jsonb_build_array(
              jsonb_build_object(
                'id', 1,
                'type', 'choice',
                'question', 'Quelle est votre première hypothèse diagnostique pour ce cas de ' || item_record.title || ' ?',
                'options', jsonb_build_array(
                  'Diagnostic différentiel A',
                  'Diagnostic différentiel B', 
                  'Diagnostic différentiel C',
                  'Diagnostic spécifique attendu'
                ),
                'correct', 3,
                'feedback', 'Analyse du raisonnement diagnostique pour ' || item_record.title
              ),
              jsonb_build_object(
                'id', 2,
                'type', 'choice',
                'question', 'Quelle conduite à tenir adoptez-vous ?',
                'options', jsonb_build_array(
                  'Prise en charge immédiate',
                  'Examens complémentaires',
                  'Surveillance',
                  'Orientation spécialisée'
                ),
                'correct', 0,
                'feedback', 'Stratégie thérapeutique adaptée à ' || item_record.title
              )
            )
          )
          ELSE interaction_config
        END,
        
        -- Améliorer quiz_questions si structure incomplète
        quiz_questions = CASE 
          WHEN quiz_questions->'questions' IS NULL THEN jsonb_build_object(
            'title', 'Quiz ' || item_record.item_code || ' - ' || item_record.title,
            'description', 'Évaluation des connaissances sur ' || item_record.title,
            'questions', jsonb_build_array(
              jsonb_build_object(
                'id', 1,
                'question', 'Concernant ' || item_record.title || ', quelle affirmation est exacte ?',
                'options', jsonb_build_array(
                  'Affirmation A sur ' || SUBSTRING(item_record.title FROM 1 FOR 30),
                  'Affirmation B sur ' || SUBSTRING(item_record.title FROM 1 FOR 30),
                  'Affirmation C correcte sur ' || SUBSTRING(item_record.title FROM 1 FOR 30),
                  'Affirmation D sur ' || SUBSTRING(item_record.title FROM 1 FOR 30)
                ),
                'correct', 2,
                'explanation', 'Explication détaillée des connaissances clés pour ' || item_record.title,
                'rang', CASE WHEN item_num <= 100 THEN 'A' ELSE 'B' END
              ),
              jsonb_build_object(
                'id', 2,
                'question', 'Dans la prise en charge de ' || item_record.title || ', l''élément prioritaire est :',
                'options', jsonb_build_array(
                  'Diagnostic précoce',
                  'Traitement symptomatique',
                  'Prévention des complications',
                  'Prise en charge spécialisée'
                ),
                'correct', 0,
                'explanation', 'Le diagnostic précoce est essentiel pour ' || item_record.title,
                'rang', CASE WHEN item_num <= 150 THEN 'A' ELSE 'B' END
              ),
              jsonb_build_object(
                'id', 3,
                'question', 'Les complications possibles de ' || item_record.title || ' incluent :',
                'options', jsonb_build_array(
                  'Complication A',
                  'Complication B sévère',
                  'Complication C',
                  'Évolution favorable'
                ),
                'correct', 1,
                'explanation', 'Les complications sévères nécessitent une surveillance attentive',
                'rang', 'B'
              )
            )
          )
          ELSE quiz_questions
        END,
        
        -- Améliorer scene_immersive si trop basique
        scene_immersive = CASE 
          WHEN scene_immersive IS NULL OR scene_immersive = '{}' THEN jsonb_build_object(
            'title', 'Scène clinique - ' || item_record.title,
            'setting', 'Service hospitalier ou consultation spécialisée',
            'context', 'Patient présentant des signes évocateurs de ' || item_record.title,
            'characters', jsonb_build_array(
              jsonb_build_object(
                'role', 'Médecin',
                'name', 'Dr. Martin',
                'description', 'Praticien expérimenté spécialisé'
              ),
              jsonb_build_object(
                'role', 'Patient',
                'name', 'Patient X',
                'description', 'Présente les symptômes caractéristiques'
              )
            ),
            'scenario', 'Cas clinique immersif permettant d''explorer le diagnostic et la prise en charge de ' || item_record.title || '. L''étudiant doit analyser les signes cliniques, proposer une démarche diagnostique appropriée et élaborer un plan thérapeutique adapté.',
            'learning_objectives', jsonb_build_array(
              'Reconnaître les signes cliniques',
              'Établir un diagnostic différentiel',
              'Proposer une prise en charge adaptée',
              'Identifier les complications potentielles'
            )
          )
          ELSE scene_immersive
        END,
        
        updated_at = now()
      WHERE id = item_record.id;
      
      updated := updated + 1;
      
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'completed_fields', jsonb_build_array('interaction_config', 'quiz_structure', 'scene_immersive')
      );
      
    EXCEPTION WHEN OTHERS THEN
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT updated, result_details;
END;
$$;