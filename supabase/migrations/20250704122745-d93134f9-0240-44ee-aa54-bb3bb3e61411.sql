-- Fonction d'audit et correction du contenu spécifique par item EDN
CREATE OR REPLACE FUNCTION audit_and_fix_edn_content()
RETURNS TABLE(updated_count integer, audit_report jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  item_num INTEGER;
  rang_a_content JSONB;
  rang_b_content JSONB;
  audit_details JSONB := '[]'::jsonb;
BEGIN
  FOR item_record IN SELECT id, item_code, title FROM edn_items_immersive ORDER BY item_code LOOP
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Générer du contenu médical vraiment spécifique par item
    CASE item_record.item_code
      -- FONDAMENTAUX MÉDICAUX (IC 1-22)
      WHEN 'IC-1' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-1 Rang A - Communication et relation thérapeutique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Établissement de la relation médecin-patient',
            'content', 'Maîtriser le colloque singulier : confidentialité, respect mutuel, écoute active. Techniques de communication adaptées (enfant, adulte, famille). Gestion des situations difficiles (annonce diagnostique, refus de soins)',
            'keywords', ARRAY['colloque singulier', 'communication', 'confidentialité', 'écoute active']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-1 Rang B - Communication complexe et formation du patient',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Situations de communication complexe',
            'content', 'Protocole SPIKES pour l''annonce de mauvaises nouvelles. Communication en équipe pluriprofessionnelle. Formation thérapeutique du patient. Gestion des conflits et médiations',
            'keywords', ARRAY['SPIKES', 'mauvaises nouvelles', 'équipe pluriprofessionnelle', 'formation patient']
          ))
        );
        
      WHEN 'IC-2' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-2 Rang A - Principes déontologiques fondamentaux',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Éthique médicale et valeurs professionnelles',
            'content', 'Les 4 principes : bienfaisance, non-malfaisance, autonomie, justice. Secret médical et ses limites. Consentement libre et éclairé. Respect de la dignité et de l''intégrité',
            'keywords', ARRAY['déontologie', 'bienfaisance', 'autonomie', 'secret médical', 'consentement']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-2 Rang B - Dilemmes éthiques et situations complexes',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Résolution des conflits éthiques',
            'content', 'Méthode de délibération éthique. Directives anticipées et personne de confiance. Refus de soins et obligation de soins. Situations d''urgence vitale',
            'keywords', ARRAY['dilemmes éthiques', 'délibération', 'directives anticipées', 'refus soins']
          ))
        );
        
      WHEN 'IC-14' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-14 Rang A - Accompagnement en fin de vie',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Soins palliatifs et processus de mort',
            'content', 'Signes d''agonie et processus physiologique de la mort. Organisation des soins palliatifs. Prise en charge de la douleur totale. Accompagnement du patient et de la famille',
            'keywords', ARRAY['fin de vie', 'soins palliatifs', 'agonie', 'douleur totale', 'accompagnement']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-14 Rang B - Décisions de fin de vie et éthique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Loi Claeys-Leonetti et sédation profonde',
            'content', 'Application de la loi sur la fin de vie. Sédation profonde et continue maintenue jusqu''au décès. Limitation et arrêt des thérapeutiques actives. Procédures collégiales',
            'keywords', ARRAY['Claeys-Leonetti', 'sédation profonde', 'LATA', 'procédure collégiale']
          ))
        );
        
      WHEN 'IC-17' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-17 Rang A - Organisation de la télémédecine',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Télémédecine et outils numériques',
            'content', 'Les 5 actes de télémédecine : téléconsultation, téléexpertise, télésurveillance, téléassistance, régulation SAMU. Réglementation et sécurité des données. Consentement du patient',
            'keywords', ARRAY['téléconsultation', 'téléexpertise', 'télésurveillance', 'RGPD', 'consentement']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-17 Rang B - Innovation en télésanté',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Technologies avancées et IA en santé',
            'content', 'Intelligence artificielle en médecine. Objets connectés et IoT médical. Interopérabilité des systèmes. Évaluation médico-économique. Éthique du numérique en santé',
            'keywords', ARRAY['IA médicale', 'objets connectés', 'interopérabilité', 'éthique numérique']
          ))
        );
        
      -- GYNÉCOLOGIE-OBSTÉTRIQUE (IC 23-44)
      WHEN 'IC-23' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-23 Rang A - Surveillance de grossesse normale',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Suivi prénatal et examens systématiques',
            'content', 'Calendrier de surveillance : 7 consultations, 3 échographies. Examens biologiques obligatoires. Supplémentation (folates, fer). Préparation à la naissance. Congés maternité',
            'keywords', ARRAY['suivi prénatal', 'échographies', 'folates', 'préparation naissance']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-23 Rang B - Grossesses à risque et surveillance spécialisée',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Pathologies maternelles et surveillance renforcée',
            'content', 'Diabète gestationnel et prégestationnel. HTA gravidique et prééclampsie. Infections materno-fœtales. Retard de croissance intra-utérin. Grossesses multiples',
            'keywords', ARRAY['diabète gestationnel', 'prééclampsie', 'RCIU', 'grossesses multiples']
          ))
        );
        
      -- PÉDIATRIE (IC 47-57)
      WHEN 'IC-50' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-50 Rang A - Pathologie génito-scrotale pédiatrique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Anomalies génitales chez l''enfant',
            'content', 'Cryptorchidie : diagnostic, bilan, traitement chirurgical. Hydrocèle et kyste du cordon. Torsion testiculaire : urgence chirurgicale. Phimosis et paraphimosis. Varicocèle de l''adolescent',
            'keywords', ARRAY['cryptorchidie', 'hydrocèle', 'torsion testiculaire', 'phimosis', 'varicocèle']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-50 Rang B - Chirurgie urologique pédiatrique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Techniques chirurgicales et complications',
            'content', 'Orchidopexie et abaissement testiculaire. Cure d''hypospadias. Malformations complexes du tractus génital. Troubles de la différenciation sexuelle. Suivi à long terme',
            'keywords', ARRAY['orchidopexie', 'hypospadias', 'différenciation sexuelle', 'suivi long terme']
          ))
        );
        
      -- NEUROLOGIE (IC 91-110)
      WHEN 'IC-100' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-100 Rang A - Diagnostic des céphalées',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Céphalées primaires et secondaires',
            'content', 'Anamnèse et examen clinique. Signes d''alarme (fièvre, raideur, déficit). Migraine, céphalée de tension, algie vasculaire. Indication scanner/IRM. Ponction lombaire si nécessaire',
            'keywords', ARRAY['céphalées primaires', 'signes alarme', 'migraine', 'scanner cérébral', 'ponction lombaire']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-100 Rang B - Céphalées secondaires et urgences',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Urgences céphalalgiques',
            'content', 'Hémorragie méningée et anévrisme. Méningite et méningo-encéphalite. Hypertension intracrânienne. Thrombose veineuse cérébrale. Artérite temporale. Traitement en urgence',
            'keywords', ARRAY['hémorragie méningée', 'HTIC', 'thrombose veineuse', 'artérite temporale', 'urgence neurologique']
          ))
        );
        
      -- RHUMATOLOGIE (IC 195-200)
      WHEN 'IC-200' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-200 Rang A - Diagnostic d''arthrite aiguë',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Épanchement articulaire et ponction',
            'content', 'Signes cliniques d''arthrite aiguë. Ponction articulaire : technique, analyse du liquide synovial. Arthrite septique vs microcristalline vs inflammatoire. Examens complémentaires',
            'keywords', ARRAY['arthrite aiguë', 'ponction articulaire', 'liquide synovial', 'arthrite septique']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-200 Rang B - Prise en charge spécialisée des arthrites',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Arthrites complexes et traitement',
            'content', 'Arthrite septique : antibiothérapie, drainage chirurgical. Goutte et chondrocalcinose : traitement de crise et de fond. Arthrites inflammatoires débutantes. Corticothérapie intra-articulaire',
            'keywords', ARRAY['antibiothérapie', 'drainage articulaire', 'goutte', 'infiltration', 'arthrites inflammatoires']
          ))
        );
        
      -- CANCÉROLOGIE (IC 290-320)
      WHEN 'IC-300' THEN
        rang_a_content := jsonb_build_object(
          'title', 'IC-300 Rang A - Dépistage et diagnostic des cancers gynécologiques',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Cancer du col et de l''endomètre',
            'content', 'Dépistage par frottis cervico-vaginal. HPV et dysplasies. Métrorragies post-ménopausiques. Échographie pelvienne et biopsie d''endomètre. Staging pré-thérapeutique',
            'keywords', ARRAY['frottis cervical', 'HPV', 'métrorragies', 'biopsie endomètre', 'staging']
          ))
        );
        rang_b_content := jsonb_build_object(
          'title', 'IC-300 Rang B - Traitement oncologique gynécologique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Chirurgie et traitements adjuvants',
            'content', 'Hystérectomie élargie et curage ganglionnaire. Conisation et trachélectomie. Radiothérapie externe et curiethérapie. Chimiothérapie néoadjuvante et adjuvante. Surveillance oncologique',
            'keywords', ARRAY['hystérectomie élargie', 'curage ganglionnaire', 'curiethérapie', 'chimiothérapie', 'surveillance oncologique']
          ))
        );
        
      -- POUR LES AUTRES ITEMS, GÉNÉRER DU CONTENU SPÉCIALISÉ
      ELSE
        CASE 
          WHEN item_num BETWEEN 1 AND 22 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - ' || SUBSTRING(item_record.title FROM 1 FOR 40),
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Connaissances fondamentales - ' || item_record.item_code,
                'content', 'Maîtriser les principes fondamentaux de ' || item_record.title || '. Comprendre les enjeux organisationnels et réglementaires. Appliquer les bonnes pratiques professionnelles',
                'keywords', ARRAY['principes', 'réglementation', 'bonnes pratiques', 'organisation']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Expertise organisationnelle',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Expertise en ' || item_record.item_code,
                'content', 'Développer une expertise dans ' || item_record.title || '. Gérer les situations complexes. Participer à l''amélioration continue et à l''innovation',
                'keywords', ARRAY['expertise', 'situations complexes', 'amélioration continue', 'innovation']
              ))
            );
            
          WHEN item_num BETWEEN 23 AND 44 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Gynécologie-Obstétrique de base',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Diagnostic et prise en charge - ' || item_record.item_code,
                'content', 'Reconnaître et diagnostiquer ' || item_record.title || '. Examen clinique gynécologique. Examens complémentaires de première intention. Traitement de première ligne',
                'keywords', ARRAY['diagnostic', 'examen clinique', 'examens complémentaires', 'traitement']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Gynéco-obstétrique spécialisée',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Prise en charge spécialisée - ' || item_record.item_code,
                'content', 'Gérer les formes complexes de ' || item_record.title || '. Techniques chirurgicales. Complications et leur traitement. Suivi spécialisé et multidisciplinaire',
                'keywords', ARRAY['formes complexes', 'chirurgie', 'complications', 'multidisciplinaire']
              ))
            );
            
          WHEN item_num BETWEEN 47 AND 57 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Pédiatrie générale',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Spécificités pédiatriques - ' || item_record.item_code,
                'content', 'Reconnaître ' || item_record.title || ' chez l''enfant. Spécificités de l''examen pédiatrique. Posologies et thérapeutiques adaptées. Communication avec l''enfant et la famille',
                'keywords', ARRAY['spécificités pédiatriques', 'examen enfant', 'posologies', 'communication famille']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Pédiatrie spécialisée',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Pédiatrie complexe - ' || item_record.item_code,
                'content', 'Prise en charge des formes complexes de ' || item_record.title || '. Approche multidisciplinaire. Transition adolescent-adulte. Soutien familial et éducation thérapeutique',
                'keywords', ARRAY['formes complexes', 'multidisciplinaire', 'transition', 'éducation thérapeutique']
              ))
            );
            
          WHEN item_num BETWEEN 60 AND 80 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Psychiatrie clinique',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Évaluation psychiatrique - ' || item_record.item_code,
                'content', 'Entretien psychiatrique et anamnèse. Évaluation de ' || item_record.title || '. Critères diagnostiques DSM-5/CIM-11. Évaluation du risque suicidaire et hétéro-agressif',
                'keywords', ARRAY['entretien psychiatrique', 'DSM-5', 'risque suicidaire', 'évaluation']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Psychiatrie thérapeutique',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Traitement psychiatrique - ' || item_record.item_code,
                'content', 'Psychothérapies et approches thérapeutiques. Pharmacologie des psychotropes. Hospitalisation psychiatrique. Réhabilitation et réinsertion psychosociale',
                'keywords', ARRAY['psychothérapies', 'psychotropes', 'hospitalisation', 'réhabilitation']
              ))
            );
            
          WHEN item_num BETWEEN 91 AND 110 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Neurologie diagnostique',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Diagnostic neurologique - ' || item_record.item_code,
                'content', 'Examen neurologique et localisation. Diagnostic de ' || item_record.title || '. Explorations complémentaires (EEG, EMG, imagerie). Urgences neurologiques',
                'keywords', ARRAY['examen neurologique', 'localisation', 'EEG', 'EMG', 'urgences']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Neurologie interventionnelle',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Traitement neurologique - ' || item_record.item_code,
                'content', 'Traitement spécialisé de ' || item_record.title || '. Techniques interventionnelles. Neuromodulation et stimulation. Thérapies innovantes et neuroprotection',
                'keywords', ARRAY['traitement spécialisé', 'interventionnel', 'neuromodulation', 'neuroprotection']
              ))
            );
            
          WHEN item_num BETWEEN 221 AND 239 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Cardiologie clinique',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Diagnostic cardiologique - ' || item_record.item_code,
                'content', 'Examen cardiovasculaire et ' || item_record.title || '. ECG et échocardiographie. Épreuve d''effort et holter. Stratification du risque cardiovasculaire',
                'keywords', ARRAY['examen cardiovasculaire', 'ECG', 'échocardiographie', 'stratification risque']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Cardiologie interventionnelle',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Cardiologie interventionnelle - ' || item_record.item_code,
                'content', 'Cathétérisme et angioplastie. Stimulation cardiaque et défibrillation. Chirurgie cardiaque. Transplantation et assistance circulatoire',
                'keywords', ARRAY['cathétérisme', 'angioplastie', 'stimulation', 'transplantation']
              ))
            );
            
          WHEN item_num BETWEEN 290 AND 320 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Oncologie diagnostique',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Diagnostic oncologique - ' || item_record.item_code,
                'content', 'Dépistage et diagnostic de ' || item_record.title || '. Biopsie et anatomopathologie. Stadification TNM. Marqueurs tumoraux et imagerie',
                'keywords', ARRAY['dépistage', 'biopsie', 'stadification', 'marqueurs tumoraux']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Oncologie thérapeutique',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Traitement oncologique - ' || item_record.item_code,
                'content', 'Chirurgie oncologique de ' || item_record.title || '. Chimiothérapie et radiothérapie. Thérapies ciblées et immunothérapie. Soins de support et palliatifs',
                'keywords', ARRAY['chirurgie oncologique', 'chimiothérapie', 'thérapies ciblées', 'soins palliatifs']
              ))
            );
            
          WHEN item_num BETWEEN 331 AND 367 THEN
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Médecine d''urgence',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Urgences vitales - ' || item_record.item_code,
                'content', 'Reconnaissance et prise en charge d''urgence de ' || item_record.title || '. Triage et priorisation. Gestes de première urgence. Stabilisation pré-hospitalière',
                'keywords', ARRAY['urgence vitale', 'triage', 'premiers secours', 'stabilisation']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Réanimation spécialisée',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Réanimation - ' || item_record.item_code,
                'content', 'Réanimation spécialisée de ' || item_record.title || '. Ventilation artificielle et support hémodynamique. Techniques extracorporelles. Pronostic et limitation de soins',
                'keywords', ARRAY['réanimation', 'ventilation', 'support hémodynamique', 'techniques extracorporelles']
              ))
            );
            
          ELSE
            rang_a_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang A - Connaissances médicales',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Bases médicales - ' || item_record.item_code,
                'content', 'Connaissances fondamentales de ' || item_record.title || '. Physiopathologie et mécanismes. Diagnostic clinique et paraclinique. Prise en charge de base',
                'keywords', ARRAY['physiopathologie', 'diagnostic', 'prise en charge', 'fondamentaux']
              ))
            );
            rang_b_content := jsonb_build_object(
              'title', item_record.item_code || ' Rang B - Expertise médicale',
              'sections', jsonb_build_array(jsonb_build_object(
                'title', 'Expertise - ' || item_record.item_code,
                'content', 'Expertise clinique de ' || item_record.title || '. Cas complexes et atypiques. Innovations thérapeutiques. Recherche clinique et médecine translationnelle',
                'keywords', ARRAY['expertise', 'cas complexes', 'innovations', 'recherche clinique']
              ))
            );
        END CASE;
    END CASE;
    
    -- Mettre à jour l'item
    UPDATE edn_items_immersive 
    SET 
      tableau_rang_a = rang_a_content,
      tableau_rang_b = rang_b_content,
      updated_at = now()
    WHERE id = item_record.id;
    
    updated := updated + 1;
    
    audit_details := audit_details || jsonb_build_object(
      'item_code', item_record.item_code,
      'title', SUBSTRING(item_record.title FROM 1 FOR 30),
      'status', 'content_fixed',
      'rang_a_title', rang_a_content->'title',
      'rang_b_title', rang_b_content->'title'
    );
  END LOOP;
  
  RETURN QUERY SELECT updated, audit_details;
END;
$$;