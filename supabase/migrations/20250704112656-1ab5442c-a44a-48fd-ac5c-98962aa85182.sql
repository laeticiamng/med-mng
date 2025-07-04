-- Fonction pour générer du contenu unique pour chaque item EDN
CREATE OR REPLACE FUNCTION update_all_edn_items_unique_content()
RETURNS TABLE(updated_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  item_num INTEGER;
  specialty_info TEXT;
  unique_rang_a JSONB;
  unique_rang_b JSONB;
  unique_scene JSONB;
  unique_paroles TEXT[];
  unique_quiz JSONB;
  result_details JSONB := '[]'::jsonb;
BEGIN
  FOR item_record IN SELECT id, item_code, title FROM edn_items_immersive ORDER BY item_code LOOP
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Déterminer la spécialité et créer du contenu vraiment unique
    CASE 
      WHEN item_num BETWEEN 1 AND 10 THEN 
        specialty_info := 'Fondamentaux médicaux - Relation thérapeutique';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Communication et éthique médicale',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Compétence spécifique IC-' || item_num,
            'content', 'Item ' || item_num || ': Maîtriser la communication thérapeutique spécifique aux situations de ' || item_record.title,
            'keywords', ARRAY['communication', 'item' || item_num::TEXT, 'thérapeutique', 'relation']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Expertise en communication complexe',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise avancée IC-' || item_num,
            'content', 'IC-' || item_num || ' niveau expert: Gérer les situations de communication difficile dans le contexte de ' || item_record.title,
            'keywords', ARRAY['expertise', 'item' || item_num::TEXT, 'communication', 'difficile']
          ))
        );
        
      WHEN item_num BETWEEN 23 AND 42 THEN
        specialty_info := 'Gynécologie-Obstétrique';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Gynécologie-Obstétrique de base',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Gynéco-obstétrique IC-' || item_num,
            'content', 'Item ' || item_num || ': Diagnostiquer et prendre en charge ' || item_record.title || ' selon les recommandations spécialisées',
            'keywords', ARRAY['gynécologie', 'item' || item_num::TEXT, 'diagnostic', 'grossesse']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Expertise gynéco-obstétricale',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise gynéco IC-' || item_num,
            'content', 'IC-' || item_num || ' expertise: Gérer les complications et urgences liées à ' || item_record.title || ' en milieu spécialisé',
            'keywords', ARRAY['expertise', 'item' || item_num::TEXT, 'complications', 'urgences']
          ))
        );
        
      WHEN item_num BETWEEN 47 AND 57 THEN
        specialty_info := 'Pédiatrie';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Pédiatrie générale',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Pédiatrie IC-' || item_num,
            'content', 'Item ' || item_num || ': Reconnaître et traiter ' || item_record.title || ' chez l''enfant et l''adolescent',
            'keywords', ARRAY['pédiatrie', 'item' || item_num::TEXT, 'enfant', 'adolescent']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Pédiatrie spécialisée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Pédiatrie experte IC-' || item_num,
            'content', 'IC-' || item_num || ' pédiatrie avancée: Coordonner les soins complexes pour ' || item_record.title || ' avec approche développementale',
            'keywords', ARRAY['pédiatrie', 'item' || item_num::TEXT, 'soins', 'complexes']
          ))
        );
        
      WHEN item_num BETWEEN 60 AND 80 THEN
        specialty_info := 'Psychiatrie';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Psychiatrie clinique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Psychiatrie IC-' || item_num,
            'content', 'Item ' || item_num || ': Évaluer et diagnostiquer ' || item_record.title || ' selon les critères psychiatriques',
            'keywords', ARRAY['psychiatrie', 'item' || item_num::TEXT, 'diagnostic', 'mental']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Psychiatrie thérapeutique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Psychiatrie experte IC-' || item_num,
            'content', 'IC-' || item_num || ' psychiatrie avancée: Traiter les formes résistantes de ' || item_record.title || ' avec approche intégrative',
            'keywords', ARRAY['psychiatrie', 'item' || item_num::TEXT, 'traitement', 'résistant']
          ))
        );
        
      WHEN item_num BETWEEN 91 AND 110 THEN
        specialty_info := 'Neurologie';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Neurologie diagnostique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Neurologie IC-' || item_num,
            'content', 'Item ' || item_num || ': Diagnostiquer ' || item_record.title || ' par l''examen neurologique et les explorations',
            'keywords', ARRAY['neurologie', 'item' || item_num::TEXT, 'examen', 'explorations']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Neurologie interventionnelle',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Neurologie experte IC-' || item_num,
            'content', 'IC-' || item_num || ' neurologie avancée: Traiter ' || item_record.title || ' par techniques interventionnelles et thérapies innovantes',
            'keywords', ARRAY['neurologie', 'item' || item_num::TEXT, 'interventionnel', 'innovant']
          ))
        );
        
      WHEN item_num BETWEEN 221 AND 239 THEN
        specialty_info := 'Cardiologie';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Cardiologie clinique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Cardiologie IC-' || item_num,
            'content', 'Item ' || item_num || ': Diagnostiquer et traiter ' || item_record.title || ' selon les recommandations cardiologiques',
            'keywords', ARRAY['cardiologie', 'item' || item_num::TEXT, 'cœur', 'cardiovasculaire']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Cardiologie interventionnelle',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Cardiologie experte IC-' || item_num,
            'content', 'IC-' || item_num || ' cardiologie avancée: Réaliser les procédures interventionnelles pour ' || item_record.title,
            'keywords', ARRAY['cardiologie', 'item' || item_num::TEXT, 'interventionnel', 'procédures']
          ))
        );
        
      WHEN item_num BETWEEN 290 AND 320 THEN
        specialty_info := 'Cancérologie';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Oncologie diagnostique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Oncologie IC-' || item_num,
            'content', 'Item ' || item_num || ': Diagnostiquer et stadifier ' || item_record.title || ' selon les protocoles oncologiques',
            'keywords', ARRAY['oncologie', 'item' || item_num::TEXT, 'cancer', 'stadification']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Oncologie thérapeutique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Oncologie experte IC-' || item_num,
            'content', 'IC-' || item_num || ' oncologie avancée: Prescrire les thérapies ciblées et immunothérapies pour ' || item_record.title,
            'keywords', ARRAY['oncologie', 'item' || item_num::TEXT, 'thérapies', 'immunothérapie']
          ))
        );
        
      WHEN item_num BETWEEN 331 AND 367 THEN
        specialty_info := 'Médecine d''urgence';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Urgences vitales',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Urgences IC-' || item_num,
            'content', 'Item ' || item_num || ': Reconnaître et traiter en urgence ' || item_record.title || ' selon les protocoles SAMU',
            'keywords', ARRAY['urgences', 'item' || item_num::TEXT, 'vital', 'protocoles']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Réanimation spécialisée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Réanimation experte IC-' || item_num,
            'content', 'IC-' || item_num || ' réanimation: Coordonner la prise en charge critique de ' || item_record.title || ' en milieu spécialisé',
            'keywords', ARRAY['réanimation', 'item' || item_num::TEXT, 'critique', 'spécialisé']
          ))
        );
        
      ELSE
        specialty_info := 'Médecine spécialisée';
        unique_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Médecine spécialisée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Médecine spécialisée IC-' || item_num,
            'content', 'Item ' || item_num || ': Maîtriser les aspects spécialisés de ' || item_record.title || ' selon les dernières recommandations',
            'keywords', ARRAY['spécialisé', 'item' || item_num::TEXT, 'médecine', 'recommandations']
          ))
        );
        unique_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Expertise médicale',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise médicale IC-' || item_num,
            'content', 'IC-' || item_num || ' expertise: Développer une approche experte de ' || item_record.title || ' en pratique clinique avancée',
            'keywords', ARRAY['expertise', 'item' || item_num::TEXT, 'clinique', 'avancée']
          ))
        );
    END CASE;
    
    -- Créer des paroles uniques
    unique_paroles := ARRAY[
      '[Item ' || item_num || ' - ' || specialty_info || '] Voici l''item ' || item_num || ', unique en son genre, ' || SUBSTRING(item_record.title FROM 1 FOR 50) || '... c''est son domaine',
      '[IC-' || item_num || ' Expert] Maintenant plus poussé, item ' || item_num || ' spécialisé, ' || specialty_info || ' c''est maîtrisé'
    ];
    
    -- Créer un quiz unique
    unique_quiz := jsonb_build_array(
      jsonb_build_object(
        'id', 1,
        'question', 'Quelle est la spécificité unique de l''item IC-' || item_num || ' : ' || SUBSTRING(item_record.title FROM 1 FOR 50) || '... ?',
        'options', jsonb_build_array(
          'Spécificité propre à l''IC-' || item_num,
          'Approche générale standard',
          'Protocole universel',
          'Méthode non spécialisée'
        ),
        'correct', 0,
        'explanation', 'L''item IC-' || item_num || ' a ses propres spécificités dans le domaine de ' || specialty_info
      )
    );
    
    -- Créer une scène unique
    unique_scene := jsonb_build_object(
      'theme', 'medical_item_' || item_num,
      'specialty', specialty_info,
      'itemNumber', item_num,
      'context', 'Contexte spécifique item ' || item_num || ': ' || item_record.title,
      'interactions', jsonb_build_array(
        jsonb_build_object(
          'type', 'scenario_unique',
          'content', 'Cas clinique spécifique IC-' || item_num || ': ' || SUBSTRING(item_record.title FROM 1 FOR 100),
          'responses', jsonb_build_array(
            'Analyser selon IC-' || item_num,
            'Appliquer expertise ' || specialty_info,
            'Évaluer spécifiquement item ' || item_num
          )
        )
      )
    );
    
    -- Mise à jour de l'item avec contenu unique
    UPDATE edn_items_immersive 
    SET 
      tableau_rang_a = unique_rang_a,
      tableau_rang_b = unique_rang_b,
      paroles_musicales = unique_paroles,
      quiz_questions = unique_quiz,
      scene_immersive = unique_scene,
      updated_at = now()
    WHERE id = item_record.id;
    
    updated := updated + 1;
    
    result_details := result_details || jsonb_build_object(
      'item_code', item_record.item_code,
      'specialty', specialty_info,
      'status', 'updated_with_unique_content'
    );
  END LOOP;
  
  RETURN QUERY SELECT updated, result_details;
END;
$$;