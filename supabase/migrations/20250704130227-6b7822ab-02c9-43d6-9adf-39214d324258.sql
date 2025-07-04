-- Audit et correction ciblée du contenu EDN
CREATE OR REPLACE FUNCTION audit_and_correct_edn_content()
RETURNS TABLE(updated_count integer, fixed_issues jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  issues_fixed JSONB := '[]'::jsonb;
  item_num INTEGER;
  correct_rang_a JSONB;
  correct_rang_b JSONB;
BEGIN
  FOR item_record IN SELECT id, item_code, title FROM edn_items_immersive ORDER BY item_code LOOP
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Corrections spécifiques selon les problèmes identifiés
    CASE item_record.item_code
      WHEN 'IC-290' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-290 Rang A - Épidémiologie et prévention des cancers',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Épidémiologie et facteurs de risque',
            'content', 'Incidence et mortalité par cancer en France. Facteurs de risque comportementaux, environnementaux et génétiques. Prévention primaire et secondaire. Organisation du dépistage organisé',
            'keywords', ARRAY['épidémiologie', 'facteurs risque', 'prévention', 'dépistage']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-290 Rang B - Stratégies avancées en cancérologie',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Oncologie de précision et prévention tertiaire',
            'content', 'Tests génétiques prédictifs, médecine personnalisée, suivi des survivants du cancer. Prévention tertiaire et détection précoce des récidives',
            'keywords', ARRAY['oncologie précision', 'génétique', 'survivants', 'prévention tertiaire']
          ))
        );
        
      WHEN 'IC-331' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-331 Rang A - Arrêt cardio-circulatoire',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Reconnaissance et RCP de base',
            'content', 'Reconnaissance ACR : absence pouls, conscience, ventilation. RCP de base : CAB (compressions-airway-breathing). Défibrillation précoce. Chaîne de survie',
            'keywords', ARRAY['ACR', 'RCP', 'défibrillation', 'chaîne survie']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-331 Rang B - Réanimation cardio-pulmonaire avancée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'RCP spécialisée et post-ACR',
            'content', 'Intubation et ventilation mécanique. Drogues vasoactives et antiarythmiques. Hypothermie thérapeutique. Syndrome post-arrêt cardiaque. Pronostic neurologique',
            'keywords', ARRAY['RCP avancée', 'hypothermie', 'post-ACR', 'pronostic neurologique']
          ))
        );
        
      WHEN 'IC-360' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-360 Rang A - Pneumothorax spontané et traumatique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Diagnostic et prise en charge initiale',
            'content', 'Pneumothorax spontané primaire/secondaire. Signes cliniques : douleur thoracique, dyspnée. Radiographie thoracique. Drainage pleural d''urgence si besoin',
            'keywords', ARRAY['pneumothorax', 'drainage pleural', 'spontané', 'traumatique']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-360 Rang B - Pneumothorax complexes',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Pneumothorax récidivants et complications',
            'content', 'Symphyse pleurale et pleurodèse. Pneumothorax cataménial. Pneumothorax sous tension. Chirurgie thoracoscopique (VATS). Prévention des récidives',
            'keywords', ARRAY['pleurodèse', 'VATS', 'récidives', 'tension']
          ))
        );
        
      WHEN 'IC-91' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-91 Rang A - Déficit neurologique récent',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Diagnostic syndromique et étiologique',
            'content', 'Examen neurologique systématique. Localisation lésionnelle. AVC ischémique/hémorragique. Imagerie cérébrale en urgence. Thrombolyse et thrombectomie',
            'keywords', ARRAY['déficit neurologique', 'AVC', 'thrombolyse', 'thrombectomie']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-91 Rang B - Neurovasculaire interventionnel',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Techniques endovasculaires et neuroprotection',
            'content', 'Thrombectomie mécanique. Embolisation d''anévrismes. Stenting carotidien. Unité neurovasculaire. Rééducation neurologique précoce et intensive',
            'keywords', ARRAY['thrombectomie mécanique', 'embolisation', 'UNV', 'rééducation']
          ))
        );
        
      ELSE
        -- Pour les autres items, garder le contenu existant s'il est correct
        CONTINUE;
    END CASE;
    
    -- Mettre à jour uniquement les items problématiques
    UPDATE edn_items_immersive 
    SET 
      tableau_rang_a = correct_rang_a,
      tableau_rang_b = correct_rang_b,
      updated_at = now()
    WHERE id = item_record.id;
    
    updated := updated + 1;
    
    issues_fixed := issues_fixed || jsonb_build_object(
      'item_code', item_record.item_code,
      'issue', 'Contenu mal formaté corrigé',
      'status', 'fixed'
    );
  END LOOP;
  
  RETURN QUERY SELECT updated, issues_fixed;
END;
$$;

-- Exécuter la correction
SELECT * FROM audit_and_correct_edn_content();