-- Fonction pour compléter les paroles musicales manquantes pour tous les items EDN
CREATE OR REPLACE FUNCTION complete_paroles_musicales_all_items()
RETURNS TABLE(updated_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  item_record RECORD;
  updated INTEGER := 0;
  item_num INTEGER;
  result_details JSONB := '[]'::jsonb;
  paroles_completes TEXT[];
BEGIN
  -- Parcourir tous les items EDN
  FOR item_record IN 
    SELECT id, item_code, title, paroles_musicales
    FROM edn_items_immersive 
    ORDER BY item_code
  LOOP
    -- Extraire le numéro d'item
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Vérifier si les paroles sont incomplètes (moins de 8 phrases)
    IF item_record.paroles_musicales IS NULL OR array_length(item_record.paroles_musicales, 1) < 8 THEN
      
      -- Créer des paroles complètes spécifiques à chaque item
      CASE 
        WHEN item_num BETWEEN 1 AND 10 THEN
          -- Items fondamentaux
          paroles_completes := ARRAY[
            'Item ' || item_num || ' - Communication et éthique',
            'Relations humaines en médecine',
            'Respect du patient avant tout',
            'Dialogue thérapeutique essentiel',
            '[Refrain] EDN rang A - Connaissances de base',
            'Formation médicale avec excellence',
            'Compétences fondamentales acquises',
            'Réussite assurée étape par étape',
            'Item ' || item_num || ' - Expertise avancée',
            'Maîtrise clinique approfondie',
            'Situations complexes gérées',
            'Excellence en communication',
            '[Refrain] EDN rang B - Niveau expert',
            'Analyse fine des situations',
            'Décisions éclairées et justes',
            'Formation médicale de haut niveau'
          ];
          
        WHEN item_num BETWEEN 23 AND 42 THEN
          -- Gynécologie-Obstétrique
          paroles_complètes := ARRAY[
            'Item ' || item_num || ' - Santé de la femme',
            'Gynécologie obstétrique spécialisée',
            'Suivi grossesse et accouchement',
            'Soins adaptés à chaque patiente',
            '[Refrain] EDN rang A - Gynéco de base',
            'Connaissances essentielles acquises',
            'Physiologie féminine maîtrisée',
            'Prise en charge de qualité',
            'Item ' || item_num || ' - Expertise gynéco',
            'Complications et urgences gérées',
            'Interventions spécialisées maîtrisées',
            'Excellence en santé féminine',
            '[Refrain] EDN rang B - Gynéco expert',
            'Pathologies complexes comprises',
            'Techniques avancées appliquées',
            'Formation spécialisée réussie'
          ];
          
        WHEN item_num BETWEEN 47 AND 57 THEN
          -- Pédiatrie
          paroles_complètes := ARRAY[
            'Item ' || item_num || ' - Santé de l''enfant',
            'Pédiatrie et développement',
            'Croissance et bien-être',
            'Soins adaptés aux plus jeunes',
            '[Refrain] EDN rang A - Pédiatrie base',
            'Enfance et adolescence comprises',
            'Pathologies pédiatriques connues',
            'Formation enfant réussie',
            'Item ' || item_num || ' - Pédiatrie experte',
            'Urgences pédiatriques maîtrisées',
            'Développement complexe analysé',
            'Excellence en soins enfants',
            '[Refrain] EDN rang B - Pédiatrie expert',
            'Situations critiques gérées',
            'Croissance optimisée',
            'Spécialisation pédiatrique aboutie'
          ];
          
        WHEN item_num BETWEEN 60 AND 80 THEN
          -- Psychiatrie
          paroles_complètes := ARRAY[
            'Item ' || item_num || ' - Santé mentale',
            'Psychiatrie et psychologie',
            'Écoute et compréhension',
            'Thérapie et accompagnement',
            '[Refrain] EDN rang A - Psychiatrie base',
            'Troubles mentaux identifiés',
            'Approche empathique développée',
            'Santé psychique préservée',
            'Item ' || item_num || ' - Psychiatrie experte',
            'Pathologies complexes analysées',
            'Thérapies avancées appliquées',
            'Expertise en santé mentale',
            '[Refrain] EDN rang B - Psychiatrie expert',
            'Diagnostics différentiels maîtrisés',
            'Traitements personnalisés',
            'Formation psychiatrique accomplie'
          ];
          
        WHEN item_num BETWEEN 221 AND 239 THEN
          -- Cardiologie
          paroles_complètes := ARRAY[
            'Item ' || item_num || ' - Cœur et circulation',
            'Cardiologie et système vasculaire',
            'Rythme cardiaque surveillé',
            'Circulation sanguine optimisée',
            '[Refrain] EDN rang A - Cardio base',
            'Pathologies cardiaques connues',
            'ECG et examens maîtrisés',
            'Prévention cardiovasculaire',
            'Item ' || item_num || ' - Cardiologie experte',
            'Interventions cardiaques complexes',
            'Urgences cardio gérées',
            'Excellence cardiovasculaire',
            '[Refrain] EDN rang B - Cardio expert',
            'Techniques invasives maîtrisées',
            'Réanimation cardiaque experte',
            'Spécialisation cardiologique aboutie'
          ];
          
        WHEN item_num BETWEEN 290 AND 320 THEN
          -- Cancérologie
          paroles_complètes := ARRAY[
            'Item ' || item_num || ' - Oncologie médicale',
            'Cancer et traitements innovants',
            'Chimiothérapie et radiothérapie',
            'Accompagnement patient et famille',
            '[Refrain] EDN rang A - Oncologie base',
            'Dépistage et diagnostic précoce',
            'Traitements standards appliqués',
            'Soins de support développés',
            'Item ' || item_num || ' - Oncologie experte',
            'Thérapies ciblées innovantes',
            'Immunothérapie personnalisée',
            'Excellence en cancérologie',
            '[Refrain] EDN rang B - Oncologie expert',
            'Recherche clinique avancée',
            'Protocoles complexes maîtrisés',
            'Formation oncologique spécialisée'
          ];
          
        WHEN item_num BETWEEN 331 AND 367 THEN
          -- Médecine d'urgence
          paroles_complètes := ARRAY[
            'Item ' || item_num || ' - Urgences vitales',
            'Médecine d''urgence et réanimation',
            'Gestes salvateurs rapides',
            'Triage et priorités établies',
            '[Refrain] EDN rang A - Urgences base',
            'Situations critiques identifiées',
            'Protocoles d''urgence appliqués',
            'Sauvetage et stabilisation',
            'Item ' || item_num || ' - Urgences expertes',
            'Réanimation avancée maîtrisée',
            'Polytraumatismes gérés',
            'Excellence en médecine d''urgence',
            '[Refrain] EDN rang B - Urgences expert',
            'Techniques invasives urgentes',
            'Décisions critiques rapides',
            'Formation urgentiste aboutie'
          ];
          
        ELSE
          -- Items généraux
          paroles_complètes := ARRAY[
            'Item ' || item_num || ' - Médecine générale',
            'Connaissances médicales essentielles',
            'Diagnostic et thérapeutique',
            'Soins de qualité pour tous',
            '[Refrain] EDN rang A - Formation base',
            'Compétences médicales acquises',
            'Pratique clinique maîtrisée',
            'Excellence en formation',
            'Item ' || item_num || ' - Expertise médicale',
            'Analyses approfondies réalisées',
            'Prises en charge complexes',
            'Excellence clinique atteinte',
            '[Refrain] EDN rang B - Formation expert',
            'Spécialisation médicale aboutie',
            'Compétences avancées maîtrisées',
            'Formation médicale excellente'
          ];
      END CASE;
      
      -- Mettre à jour les paroles de l'item
      UPDATE edn_items_immersive 
      SET 
        paroles_musicales = paroles_complètes,
        updated_at = now()
      WHERE id = item_record.id;
      
      updated := updated + 1;
      result_details := result_details || jsonb_build_object(
        'item_code', item_record.item_code,
        'paroles_count', array_length(paroles_complètes, 1),
        'specialty', 
          CASE 
            WHEN item_num BETWEEN 1 AND 10 THEN 'Fondamentaux'
            WHEN item_num BETWEEN 23 AND 42 THEN 'Gynéco-obstétrique'
            WHEN item_num BETWEEN 47 AND 57 THEN 'Pédiatrie'
            WHEN item_num BETWEEN 60 AND 80 THEN 'Psychiatrie'
            WHEN item_num BETWEEN 221 AND 239 THEN 'Cardiologie'
            WHEN item_num BETWEEN 290 AND 320 THEN 'Cancérologie'
            WHEN item_num BETWEEN 331 AND 367 THEN 'Urgences'
            ELSE 'Médecine générale'
          END,
        'status', 'completed'
      );
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT updated, result_details;
END;
$function$;