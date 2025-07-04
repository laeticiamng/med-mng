-- Fonction pour créer du contenu complètement spécifique pour TOUS les items
CREATE OR REPLACE FUNCTION generate_specific_content_all_items()
RETURNS TABLE(updated_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  item_num INTEGER;
  specialty_info TEXT;
  rang_a_content JSONB;
  rang_b_content JSONB;
BEGIN
  FOR item_record IN SELECT id, item_code, title FROM edn_items_immersive ORDER BY item_code LOOP
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Déterminer la spécialité et le contenu spécifique selon le numéro d'item
    CASE 
      -- Items 1-10: Fondamentaux
      WHEN item_num BETWEEN 1 AND 10 THEN 
        specialty_info := 'Fondamentaux médicaux';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Compétences de base item ' || item_num,
            'content', 'Compétences fondamentales spécifiques à l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'fondamental', 'base']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' avancés',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise avancée item ' || item_num,
            'content', 'Compétences approfondies spécifiques à l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'avancé', 'expertise']
          ))
        );
        
      -- Items 23-42: Gynéco-obstétrique  
      WHEN item_num BETWEEN 23 AND 42 THEN
        specialty_info := 'Gynécologie-Obstétrique';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Bases gynéco-obstétricales item ' || item_num,
            'content', 'Connaissances de base en gynécologie-obstétrique pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'gynécologie', 'obstétrique']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' spécialisée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise gynéco-obstétricale item ' || item_num,
            'content', 'Prise en charge spécialisée en gynécologie-obstétrique pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'spécialisée', 'prise en charge']
          ))
        );
        
      -- Items 47-57: Pédiatrie
      WHEN item_num BETWEEN 47 AND 57 THEN
        specialty_info := 'Pédiatrie';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Bases pédiatriques item ' || item_num,
            'content', 'Connaissances de base en pédiatrie pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'pédiatrie', 'enfant']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' spécialisée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise pédiatrique item ' || item_num,
            'content', 'Prise en charge pédiatrique spécialisée pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'pédiatrique', 'spécialisée']
          ))
        );
        
      -- Items 60-80: Psychiatrie
      WHEN item_num BETWEEN 60 AND 80 THEN
        specialty_info := 'Psychiatrie';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Bases psychiatriques item ' || item_num,
            'content', 'Connaissances de base en psychiatrie pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'psychiatrie', 'mental']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' avancée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise psychiatrique item ' || item_num,
            'content', 'Prise en charge psychiatrique complexe pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'psychiatrique', 'complexe']
          ))
        );
        
      -- Items 91-110: Neurologie
      WHEN item_num BETWEEN 91 AND 110 THEN
        specialty_info := 'Neurologie';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Bases neurologiques item ' || item_num,
            'content', 'Connaissances de base en neurologie pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'neurologie', 'nerveux']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' spécialisée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise neurologique item ' || item_num,
            'content', 'Prise en charge neurologique spécialisée pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'neurologique', 'spécialisée']
          ))
        );
        
      -- Items 221-239: Cardiologie
      WHEN item_num BETWEEN 221 AND 239 THEN
        specialty_info := 'Cardiologie';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Bases cardiologiques item ' || item_num,
            'content', 'Connaissances de base en cardiologie pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'cardiologie', 'coeur']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' interventionnelle',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise cardiologique item ' || item_num,
            'content', 'Prise en charge cardiologique avancée pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'cardiologique', 'interventionnelle']
          ))
        );
        
      -- Items 290-320: Cancérologie
      WHEN item_num BETWEEN 290 AND 320 THEN
        specialty_info := 'Cancérologie';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Bases oncologiques item ' || item_num,
            'content', 'Connaissances de base en cancérologie pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'cancer', 'oncologie']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' avancée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise oncologique item ' || item_num,
            'content', 'Prise en charge oncologique complexe pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'oncologique', 'chimiothérapie']
          ))
        );
        
      -- Items 331-367: Médecine d'urgence
      WHEN item_num BETWEEN 331 AND 367 THEN
        specialty_info := 'Médecine d''urgence';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Bases urgentistes item ' || item_num,
            'content', 'Connaissances de base en médecine d''urgence pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'urgence', 'réanimation']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' critique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise urgentiste item ' || item_num,
            'content', 'Prise en charge d''urgence critique pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'critique', 'réanimation']
          ))
        );
        
      -- Autres items: Médecine générale/spécialisée
      ELSE
        specialty_info := 'Médecine spécialisée';
        rang_a_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang A - ' || specialty_info,
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Connaissances spécialisées item ' || item_num,
            'content', 'Connaissances spécialisées pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'spécialisé', 'médecine']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', item_record.item_code || ' Rang B - ' || specialty_info || ' avancée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise spécialisée item ' || item_num,
            'content', 'Expertise clinique avancée pour l''item ' || item_num || ': ' || item_record.title,
            'keywords', ARRAY['item' || item_num::TEXT, 'expertise', 'avancée']
          ))
        );
    END CASE;
    
    -- Mise à jour de l'item
    UPDATE edn_items_immersive 
    SET 
      tableau_rang_a = rang_a_content,
      tableau_rang_b = rang_b_content,
      paroles_musicales = ARRAY[
        'Item ' || item_num || ' spécifique à maîtriser, ' || item_record.title || ' pour réussir',
        'Compétences de l''item ' || item_num || ', uniques et essentielles pour l''EDN'
      ],
      updated_at = now()
    WHERE id = item_record.id;
    
    updated := updated + 1;
  END LOOP;
  
  RETURN QUERY SELECT updated;
END;
$$;

-- Exécuter la fonction pour tous les items
SELECT * FROM generate_specific_content_all_items();