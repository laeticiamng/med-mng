-- Correction massive du contenu pour avoir du contenu réellement spécifique par item
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = CASE item_code
    WHEN 'IC-1' THEN jsonb_build_object(
      'title', 'IC-1 Rang A - Communication médecin-patient',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Établir la relation thérapeutique',
        'content', 'Maîtriser l''accueil du patient, l''écoute active, la reformulation et l''empathie. Créer un climat de confiance propice au dialogue.',
        'keywords', ARRAY['accueil', 'écoute', 'empathie', 'confiance', 'dialogue']
      ))
    )
    WHEN 'IC-2' THEN jsonb_build_object(
      'title', 'IC-2 Rang A - Valeurs professionnelles',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Principes déontologiques fondamentaux',
        'content', 'Connaître le serment d''Hippocrate, le code de déontologie médicale, les principes de bienfaisance et non-malfaisance.',
        'keywords', ARRAY['serment', 'déontologie', 'bienfaisance', 'non-malfaisance']
      ))
    )
    WHEN 'IC-25' THEN jsonb_build_object(
      'title', 'IC-25 Rang A - Grossesse extra-utérine',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Diagnostic de GEU',
        'content', 'Reconnaître les signes cliniques de GEU : douleurs pelviennes, métrorragies, aménorrhée. Maîtriser l''échographie pelvienne et le dosage βHCG.',
        'keywords', ARRAY['GEU', 'douleur', 'métrorragies', 'échographie', 'βHCG']
      ))
    )
    WHEN 'IC-50' THEN jsonb_build_object(
      'title', 'IC-50 Rang A - Pathologie génito-scrotale',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Examen des organes génitaux masculins',
        'content', 'Maîtriser l''examen clinique du scrotum, des testicules et du pénis. Reconnaître les urgences : torsion testiculaire, paraphimosis.',
        'keywords', ARRAY['scrotum', 'testicules', 'torsion', 'paraphimosis', 'urgence']
      ))
    )
    WHEN 'IC-65' THEN jsonb_build_object(
      'title', 'IC-65 Rang A - Trouble délirant persistant',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Diagnostic du trouble délirant',
        'content', 'Identifier les idées délirantes, évaluer le degré d''adhésion, distinguer délire primaire et secondaire. Connaître les différents thèmes délirants.',
        'keywords', ARRAY['délire', 'idées délirantes', 'adhésion', 'thèmes']
      ))
    )
    WHEN 'IC-74' THEN jsonb_build_object(
      'title', 'IC-74 Rang A - Prescription psychotropes',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Classes thérapeutiques psychotropes',
        'content', 'Connaître les antidépresseurs, anxiolytiques, antipsychotiques, thymorégulateurs. Maîtriser les indications et contre-indications.',
        'keywords', ARRAY['antidépresseurs', 'anxiolytiques', 'antipsychotiques', 'thymorégulateurs']
      ))
    )
    WHEN 'IC-100' THEN jsonb_build_object(
      'title', 'IC-100 Rang A - Céphalées',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Diagnostic différentiel des céphalées',
        'content', 'Distinguer céphalées primaires et secondaires. Reconnaître les signes d''alarme nécessitant une exploration urgente.',
        'keywords', ARRAY['céphalées', 'primaires', 'secondaires', 'signes alarme']
      ))
    )
    WHEN 'IC-200' THEN jsonb_build_object(
      'title', 'IC-200 Rang A - Douleur articulaire',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Examen d''une articulation douloureuse',
        'content', 'Maîtriser l''inspection, la palpation articulaire, l''évaluation de la mobilité. Distinguer douleur mécanique et inflammatoire.',
        'keywords', ARRAY['articulation', 'inspection', 'palpation', 'mobilité', 'inflammatoire']
      ))
    )
    WHEN 'IC-300' THEN jsonb_build_object(
      'title', 'IC-300 Rang A - Tumeurs utérines',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Dépistage cancer du col utérin',
        'content', 'Maîtriser le frottis cervico-utérin, connaître la classification Bethesda, les facteurs de risque HPV.',
        'keywords', ARRAY['frottis', 'col utérin', 'Bethesda', 'HPV', 'dépistage']
      ))
    )
    WHEN 'IC-350' THEN jsonb_build_object(
      'title', 'IC-350 Rang A - Grosse jambe rouge',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Diagnostic d''érysipèle',
        'content', 'Reconnaître l''érysipèle : placard érythémateux chaud, douloureux, à limites nettes. Rechercher la porte d''entrée.',
        'keywords', ARRAY['érysipèle', 'érythème', 'chaud', 'douloureux', 'porte entrée']
      ))
    )
    WHEN 'IC-367' THEN jsonb_build_object(
      'title', 'IC-367 Rang A - Environnement et santé',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Facteurs environnementaux de santé',
        'content', 'Identifier les polluants atmosphériques, la contamination de l''eau, l''exposition aux substances chimiques et leurs impacts sanitaires.',
        'keywords', ARRAY['polluants', 'atmosphérique', 'eau', 'chimiques', 'impacts']
      ))
    )
    ELSE tableau_rang_a
  END,
  tableau_rang_b = CASE item_code
    WHEN 'IC-1' THEN jsonb_build_object(
      'title', 'IC-1 Rang B - Communication complexe',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Annonce de mauvaises nouvelles',
        'content', 'Maîtriser le protocole SPIKES, gérer les réactions émotionnelles, adapter la communication aux différents publics (enfants, familles).',
        'keywords', ARRAY['SPIKES', 'mauvaises nouvelles', 'émotions', 'adaptation', 'familles']
      ))
    )
    WHEN 'IC-2' THEN jsonb_build_object(
      'title', 'IC-2 Rang B - Éthique complexe',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Résolution de conflits éthiques',
        'content', 'Analyser les dilemmes éthiques en soins palliatifs, obstinacy thérapeutique, refus de soins. Utiliser les comités d''éthique.',
        'keywords', ARRAY['dilemmes', 'soins palliatifs', 'obstinacy', 'refus soins', 'comités éthique']
      ))
    )
    WHEN 'IC-25' THEN jsonb_build_object(
      'title', 'IC-25 Rang B - Prise en charge GEU',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Traitement de la GEU',
        'content', 'Maîtriser les indications du traitement médical (méthotrexate) vs chirurgical. Gérer les complications hémorragiques.',
        'keywords', ARRAY['méthotrexate', 'chirurgie', 'hémorragie', 'complications', 'surveillance']
      ))
    )
    WHEN 'IC-50' THEN jsonb_build_object(
      'title', 'IC-50 Rang B - Urgences génitales',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Prise en charge urgente',
        'content', 'Gérer la torsion testiculaire : détorsion manuelle, chirurgie d''urgence. Traiter le paraphimosis, les traumatismes génitaux.',
        'keywords', ARRAY['torsion', 'détorsion', 'chirurgie urgence', 'traumatismes', 'complications']
      ))
    )
    WHEN 'IC-65' THEN jsonb_build_object(
      'title', 'IC-65 Rang B - Traitement du délire',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Prise en charge thérapeutique',
        'content', 'Prescrire les antipsychotiques adaptés, gérer la résistance au traitement, organiser le suivi ambulatoire.',
        'keywords', ARRAY['antipsychotiques', 'résistance', 'suivi', 'ambulatoire', 'observance']
      ))
    )
    WHEN 'IC-74' THEN jsonb_build_object(
      'title', 'IC-74 Rang B - Surveillance psychotropes',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Monitoring et effets indésirables',
        'content', 'Surveiller les effets secondaires, gérer les interactions médicamenteuses, adapter les posologies selon l''âge et comorbidités.',
        'keywords', ARRAY['effets secondaires', 'interactions', 'posologies', 'comorbidités', 'surveillance']
      ))
    )
    WHEN 'IC-100' THEN jsonb_build_object(
      'title', 'IC-100 Rang B - Céphalées secondaires',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Urgences céphalalgiques',
        'content', 'Diagnostiquer l''hypertension intracrânienne, l''hémorragie méningée, la méningite. Prescrire l''imagerie adaptée.',
        'keywords', ARRAY['HTIC', 'hémorragie méningée', 'méningite', 'imagerie', 'urgence']
      ))
    )
    WHEN 'IC-200' THEN jsonb_build_object(
      'title', 'IC-200 Rang B - Arthrites complexes',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Diagnostic étiologique',
        'content', 'Distinguer arthrites infectieuses, microcristallines, inflammatoires. Interpréter l''analyse du liquide synovial.',
        'keywords', ARRAY['infectieuses', 'microcristallines', 'inflammatoires', 'liquide synovial', 'ponction']
      ))
    )
    WHEN 'IC-300' THEN jsonb_build_object(
      'title', 'IC-300 Rang B - Prise en charge oncologique',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Stratégie thérapeutique',
        'content', 'Organiser la concertation pluridisciplinaire, prescrire les traitements adjuvants, gérer les effets secondaires.',
        'keywords', ARRAY['RCP', 'pluridisciplinaire', 'adjuvants', 'effets secondaires', 'suivi']
      ))
    )
    WHEN 'IC-350' THEN jsonb_build_object(
      'title', 'IC-350 Rang B - Complications cutanées',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Urgences dermatologiques',
        'content', 'Diagnostiquer la fasciite nécrosante, gérer l''érysipèle récidivant, traiter les complications systémiques.',
        'keywords', ARRAY['fasciite nécrosante', 'récidivant', 'systémiques', 'antibiotiques', 'chirurgie']
      ))
    )
    WHEN 'IC-367' THEN jsonb_build_object(
      'title', 'IC-367 Rang B - Santé publique environnementale',
      'sections', jsonb_build_array(jsonb_build_object(
        'title', 'Prévention et surveillance',
        'content', 'Organiser la surveillance épidémiologique, mettre en place des mesures de prévention, coordonner les actions intersectorielles.',
        'keywords', ARRAY['surveillance', 'épidémiologique', 'prévention', 'intersectoriel', 'coordination']
      ))
    )
    ELSE tableau_rang_b
  END
WHERE item_code IN ('IC-1', 'IC-2', 'IC-25', 'IC-50', 'IC-65', 'IC-74', 'IC-100', 'IC-200', 'IC-300', 'IC-350', 'IC-367');