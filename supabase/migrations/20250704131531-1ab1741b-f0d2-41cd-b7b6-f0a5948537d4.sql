-- Audit et correction massive du contenu EDN générique/problématique
CREATE OR REPLACE FUNCTION fix_problematic_edn_content()
RETURNS TABLE(updated_count integer, fixed_items jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  fixed_list JSONB := '[]'::jsonb;
  item_num INTEGER;
  correct_rang_a JSONB;
  correct_rang_b JSONB;
BEGIN
  -- Corriger les items avec du contenu générique problématique
  FOR item_record IN 
    SELECT id, item_code, title 
    FROM edn_items_immersive 
    WHERE tableau_rang_a->>'title' LIKE '%Approches transversales%' 
       OR tableau_rang_a->'sections'->0->>'content' LIKE '%Maîtriser les principes fondamentaux de%'
       OR tableau_rang_a->'sections'->0->>'content' LIKE '%Examen neurologique et localisation. Diagnostic de%'
    ORDER BY item_code
  LOOP
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Corrections spécifiques par item
    CASE item_record.item_code
      WHEN 'IC-10' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-10 Rang A - Violences et santé',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Dépistage et prise en charge des violences',
            'content', 'Repérer les signes de violence (physique, psychologique, sexuelle). Conduite à tenir : protection de la victime, certificat médical, signalement. Violences conjugales, maltraitance enfants/personnes âgées',
            'keywords', ARRAY['violence', 'maltraitance', 'certificat', 'signalement', 'protection']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-10 Rang B - Approche médico-légale des violences',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Expertise médico-légale et réseaux',
            'content', 'Rédaction de certificats médico-légaux. Coordination avec services sociaux, justice. Traumatologie médico-légale. Suivi psychologique des victimes',
            'keywords', ARRAY['médico-légal', 'expertise', 'réseaux', 'traumatologie', 'suivi']
          ))
        );
        
      WHEN 'IC-101' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-101 Rang A - Paralysie faciale',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Diagnostic et étiologie',
            'content', 'Paralysie faciale périphérique (PFP) vs centrale. Étiologies : idiopathique (Bell), zona, trauma, tumeur. Examen clinique : testing facial, réflexes. Urgence si zona auriculaire',
            'keywords', ARRAY['paralysie faciale', 'Bell', 'zona', 'périphérique', 'centrale']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-101 Rang B - Traitements spécialisés PF',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Chirurgie et rééducation',
            'content', 'Décompression chirurgicale si trauma. Greffes nerveuses, anastomoses. Toxine botulique pour spasmes. Rééducation orthophonique et kinésithérapie faciale',
            'keywords', ARRAY['chirurgie', 'décompression', 'greffe', 'botulique', 'rééducation']
          ))
        );
        
      WHEN 'IC-102' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-102 Rang A - Diplopie',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Diagnostic différentiel',
            'content', 'Diplopie monoculaire vs binoculaire. Paralysies oculomotrices (III, IV, VI). Myasthénie, Basedow, trauma orbitaire. Test occlusion, Lancaster. Urgence si mydriase',
            'keywords', ARRAY['diplopie', 'oculomoteur', 'myasthénie', 'Basedow', 'Lancaster']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-102 Rang B - Chirurgie oculomotrice',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Traitement chirurgical diplopie',
            'content', 'Chirurgie des muscles oculomoteurs. Corrections prismatiques. Injections botulique. Traitement étiologique (immunosuppresseurs myasthénie)',
            'keywords', ARRAY['chirurgie', 'oculomoteur', 'prisme', 'botulique', 'immunosuppresseurs']
          ))
        );
        
      WHEN 'IC-103' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-103 Rang A - Vertige',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Vertiges périphériques et centraux',
            'content', 'VPPB (manœuvre Dix-Hallpike), névrite vestibulaire, Menière. Vertiges centraux : AVC, SEP. Nystagmus, test calorique. Manœuvres libératoires',
            'keywords', ARRAY['VPPB', 'Dix-Hallpike', 'névrite', 'Menière', 'nystagmus']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-103 Rang B - Rééducation vestibulaire',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Traitements avancés vertige',
            'content', 'Rééducation vestibulaire spécialisée. Vidéonystagmographie. Injections transtympaniques. Chirurgie labyrinthique (labyrinthectomie, neurectomie)',
            'keywords', ARRAY['rééducation', 'vidéonystagmographie', 'transtympanique', 'labyrinthectomie']
          ))
        );
        
      WHEN 'IC-104' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-104 Rang A - Sclérose en plaques',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Diagnostic et formes cliniques',
            'content', 'Critères McDonald. IRM cérébrale/médullaire (hypersignaux T2). Ponction lombaire (bandes oligoclonales). Formes : rémittente, progressive. Poussées vs progression',
            'keywords', ARRAY['McDonald', 'IRM', 'oligoclonales', 'rémittente', 'progressive']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-104 Rang B - Traitements immunomodulateurs',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Thérapies de fond SEP',
            'content', 'Immunomodulateurs : interférons, acétate de glatiramère. Immunosuppresseurs : natalizumab, fingolimod, alemtuzumab. Surveillance effets secondaires',
            'keywords', ARRAY['interférons', 'glatiramère', 'natalizumab', 'fingolimod', 'alemtuzumab']
          ))
        );
        
      WHEN 'IC-105' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-105 Rang A - Épilepsie',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Crises et syndromes épileptiques',
            'content', 'Classification ILAE : focales/généralisées. État de mal épileptique. EEG critique et intercritique. Antiépileptiques de première ligne : valproate, carbamazépine, lamotrigine',
            'keywords', ARRAY['ILAE', 'focales', 'généralisées', 'EEG', 'antiépileptiques']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-105 Rang B - Chirurgie de l\'épilepsie',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Traitements résistants',
            'content', 'Vidéo-EEG stéréotaxique. Chirurgie résectrice (lobectomie temporale). Stimulation vagale. Régime cétogène. Épilepsies pharmacorésistantes',
            'keywords', ARRAY['vidéo-EEG', 'lobectomie', 'stimulation', 'cétogène', 'pharmacorésistante']
          ))
        );
        
      WHEN 'IC-106' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-106 Rang A - Maladie de Parkinson',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Diagnostic et symptômes',
            'content', 'Triade : akinésie, rigidité, tremblement de repos. Test à la L-DOPA. Diagnostic différentiel : AMS, PSP. DaT-scan si doute. Critères UKPDS',
            'keywords', ARRAY['akinésie', 'rigidité', 'tremblement', 'L-DOPA', 'DaT-scan']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-106 Rang B - Stimulation cérébrale profonde',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Traitements avancés Parkinson',
            'content', 'Stimulation cérébrale profonde (SCP) du noyau sous-thalamique. Pompe à apomorphine. Duodopa intrajéjunale. Complications : dyskinésies, fluctuations',
            'keywords', ARRAY['SCP', 'sous-thalamique', 'apomorphine', 'duodopa', 'dyskinésies']
          ))
        );
        
      WHEN 'IC-107' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-107 Rang A - Mouvements anormaux',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Classification et diagnostic',
            'content', 'Dystonies, chorée, ballisme, tics, myoclonies. Dystonie focale vs généralisée. Chorée de Huntington. Syndrome Gilles de la Tourette. Tremblements',
            'keywords', ARRAY['dystonie', 'chorée', 'ballisme', 'tics', 'myoclonies']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-107 Rang B - Toxine botulique thérapeutique',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Traitements spécialisés',
            'content', 'Injections toxine botulique guidées EMG. Chirurgie stéréotaxique. Thalamotomie pour tremblements. Baclofène intrathécal pour dystonie',
            'keywords', ARRAY['botulique', 'EMG', 'stéréotaxique', 'thalamotomie', 'baclofène']
          ))
        );
        
      WHEN 'IC-108' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-108 Rang A - Confusion et démences',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Diagnostic différentiel',
            'content', 'Confusion vs démence vs delirium. Alzheimer, démence vasculaire, Lewy, frontotemporale. MMSE, MoCA. Imagerie : atrophie, hypoperfusion. Biomarqueurs LCR',
            'keywords', ARRAY['confusion', 'démence', 'Alzheimer', 'MMSE', 'biomarqueurs']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-108 Rang B - Thérapies cognitives',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Prise en charge spécialisée',
            'content', 'Inhibiteurs cholinestérase (donépézil, rivastigmine). Mémantine. Stimulation cognitive. Thérapies non-médicamenteuses. Prise en charge comportementale',
            'keywords', ARRAY['cholinestérase', 'donépézil', 'mémantine', 'stimulation', 'comportementale']
          ))
        );
        
      WHEN 'IC-109' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-109 Rang A - Troubles marche et équilibre',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Évaluation et causes',
            'content', 'Marche parkinsonienne, cérébelleuse, spastique, steppage. Chutes : causes multifactorielles. Évaluation gérontologique. Tests : Tinetti, get up and go',
            'keywords', ARRAY['marche', 'chutes', 'Tinetti', 'gérontologie', 'équilibre']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-109 Rang B - Rééducation locomotrice',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Programmes de rééducation',
            'content', 'Rééducation à la marche assistée. Stimulation électrique fonctionnelle. Robotique de rééducation. Plateforme de force. Réalité virtuelle',
            'keywords', ARRAY['rééducation', 'assistée', 'électrique', 'robotique', 'virtuelle']
          ))
        );
        
      WHEN 'IC-110' THEN
        correct_rang_a := jsonb_build_object(
          'title', 'IC-110 Rang A - Troubles du sommeil',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Insomnies et hypersomnies',
            'content', 'Insomnie chronique, apnées du sommeil (SAOS), narcolepsie, syndrome jambes sans repos. Agenda du sommeil. Polysomnographie. Index apnées-hypopnées',
            'keywords', ARRAY['insomnie', 'apnées', 'narcolepsie', 'polysomnographie', 'SAOS']
          ))
        );
        correct_rang_b := jsonb_build_object(
          'title', 'IC-110 Rang B - Centres du sommeil',
          'sections', jsonb_build_array(jsonb_build_object(
            'title', 'Explorations et traitements',
            'content', 'Polysomnographie complète. CPAP, orthèses mandibulaires. Chirurgie ORL (UPPP). Tests itératifs de latence (TILE). Modafinil, xyrem',
            'keywords', ARRAY['polysomnographie', 'CPAP', 'orthèses', 'UPPP', 'modafinil']
          ))
        );
        
      ELSE
        -- Pour les autres items, garder le contenu si non problématique
        CONTINUE;
    END CASE;
    
    -- Mettre à jour l'item
    UPDATE edn_items_immersive 
    SET 
      tableau_rang_a = correct_rang_a,
      tableau_rang_b = correct_rang_b,
      updated_at = now()
    WHERE id = item_record.id;
    
    updated := updated + 1;
    
    fixed_list := fixed_list || jsonb_build_object(
      'item_code', item_record.item_code,
      'title', item_record.title,
      'status', 'fixed_with_medical_content'
    );
  END LOOP;
  
  RETURN QUERY SELECT updated, fixed_list;
END;
$$;

-- Exécuter la correction
SELECT * FROM fix_problematic_edn_content();