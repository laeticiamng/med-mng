-- Mise à jour des paroles musicales pour tous les items EDN avec contenu médical spécifique
DO $$
DECLARE
  item_record RECORD;
  item_num INTEGER;
  specialty_paroles TEXT[];
BEGIN
  -- Parcourir tous les items EDN
  FOR item_record IN 
    SELECT item_code FROM edn_items_immersive 
    WHERE item_code ~ '^IC-[0-9]+$'
    ORDER BY item_code
  LOOP
    -- Extraire le numéro d'item
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Générer des paroles spécifiques selon la spécialité
    CASE 
      -- Items 1-10: Fondamentaux de la médecine
      WHEN item_num BETWEEN 1 AND 10 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Fondamentaux médicaux item ' || item_num,
          'Communication soignant-patient maîtrisée',
          'Éthique médicale respectée',
          'Démarche clinique structurée',
          '',
          '[Refrain]',
          'Item ' || item_num || ' fondements solides',
          'Bases essentielles acquises',
          'Pour une médecine de qualité',
          'Compétences professionnelles',
          '',
          '[Couplet 2 - Rang B]',
          'Expertise clinique développée',
          'Raisonnement médical affiné',
          'Situations complexes gérées',
          'Excellence professionnelle',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' maîtrisé',
          'Médecine humaniste pratiquée',
          'Vers l''excellence clinique',
          'Engagement professionnel confirmé'
        ];
        
      -- Items 23-42: Gynécologie-Obstétrique
      WHEN item_num BETWEEN 23 AND 42 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Gynéco-obstétrique item ' || item_num,
          'Santé de la femme protégée',
          'Grossesse et accouchement suivis',
          'Pathologies féminines comprises',
          '',
          '[Refrain]',
          'Item ' || item_num || ' spécialité féminine',
          'Accompagnement personnalisé',
          'De la conception à la ménopause',
          'Soins gynécologiques experts',
          '',
          '[Couplet 2 - Rang B]',
          'Situations obstétricales complexes',
          'Chirurgie gynécologique maîtrisée',
          'Urgences maternelles gérées',
          'Expertise reproductive confirmée',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' expertise féminine',
          'Santé reproductive optimisée',
          'Accompagnement global assuré',
          'Excellence en gynéco-obstétrique'
        ];
        
      -- Items 47-57: Pédiatrie
      WHEN item_num BETWEEN 47 AND 57 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Pédiatrie item ' || item_num,
          'Santé de l''enfant préservée',
          'Croissance et développement suivis',
          'Pathologies pédiatriques comprises',
          '',
          '[Refrain]',
          'Item ' || item_num || ' médecine infantile',
          'Soins adaptés à l''âge',
          'Du nouveau-né à l''adolescent',
          'Pédiatrie bienveillante',
          '',
          '[Couplet 2 - Rang B]',
          'Urgences pédiatriques maîtrisées',
          'Pathologies complexes gérées',
          'Famille accompagnée et rassurée',
          'Expertise pédiatrique confirmée',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' enfance protégée',
          'Développement harmonieux',
          'Soins pédiatriques experts',
          'Avenir médical assuré'
        ];
        
      -- Items 60-80: Psychiatrie
      WHEN item_num BETWEEN 60 AND 80 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Psychiatrie item ' || item_num,
          'Santé mentale préservée',
          'Troubles psychiques compris',
          'Accompagnement thérapeutique',
          '',
          '[Refrain]',
          'Item ' || item_num || ' psychiatrie moderne',
          'Écoute et compréhension',
          'Thérapies personnalisées',
          'Rétablissement favorisé',
          '',
          '[Couplet 2 - Rang B]',
          'Pathologies mentales complexes',
          'Psychothérapies spécialisées',
          'Crises psychiatriques gérées',
          'Expertise en santé mentale',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' équilibre mental',
          'Soins psychiatriques humanistes',
          'Rétablissement accompagné',
          'Bien-être psychique restauré'
        ];
        
      -- Items 100-150: Cardiologie
      WHEN item_num BETWEEN 100 AND 150 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Cardiologie item ' || item_num,
          'Cœur et vaisseaux explorés',
          'Pathologies cardiaques dépistées',
          'Prévention cardiovasculaire',
          '',
          '[Refrain]',
          'Item ' || item_num || ' cœur battant',
          'Circulation optimisée',
          'Prévention active',
          'Cardiologie préventive',
          '',
          '[Couplet 2 - Rang B]',
          'Interventions cardiaques complexes',
          'Urgences cardiovasculaires',
          'Réhabilitation cardiaque',
          'Expertise cardiologique',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' cœur protégé',
          'Santé cardiovasculaire',
          'Prévention et traitement',
          'Cardiologie d''excellence'
        ];
        
      -- Items 200-250: Endocrinologie
      WHEN item_num BETWEEN 200 AND 250 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Endocrinologie item ' || item_num,
          'Hormones et métabolisme',
          'Diabète et thyroïde explorés',
          'Équilibre endocrinien',
          '',
          '[Refrain]',
          'Item ' || item_num || ' hormones équilibrées',
          'Métabolisme régulé',
          'Diabète contrôlé',
          'Endocrinologie précise',
          '',
          '[Couplet 2 - Rang B]',
          'Pathologies endocrines complexes',
          'Traitements hormonaux ajustés',
          'Complications métaboliques',
          'Expertise endocrinologique',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' équilibre hormonal',
          'Métabolisme maîtrisé',
          'Diabète apprivoisé',
          'Endocrinologie thérapeutique'
        ];
        
      -- Items 290-320: Cancérologie
      WHEN item_num BETWEEN 290 AND 320 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Oncologie item ' || item_num,
          'Cancer dépisté et traité',
          'Chimiothérapie adaptée',
          'Accompagnement oncologique',
          '',
          '[Refrain]',
          'Item ' || item_num || ' oncologie moderne',
          'Traitements innovants',
          'Espoir et guérison',
          'Cancérologie humaniste',
          '',
          '[Couplet 2 - Rang B]',
          'Thérapies ciblées personnalisées',
          'Soins palliatifs intégrés',
          'Pluridisciplinarité oncologique',
          'Expertise cancérologique',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' lutte contre le cancer',
          'Guérison recherchée',
          'Qualité de vie préservée',
          'Oncologie d''excellence'
        ];
        
      -- Items 331-367: Médecine d'urgence
      WHEN item_num BETWEEN 331 AND 367 THEN
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Urgences item ' || item_num,
          'Situations critiques gérées',
          'Réanimation maîtrisée',
          'Sauvetage vital urgent',
          '',
          '[Refrain]',
          'Item ' || item_num || ' urgences vitales',
          'Gestes salvateurs',
          'Temps compté précieux',
          'Médecine d''urgence',
          '',
          '[Couplet 2 - Rang B]',
          'Polytraumatismes complexes',
          'Détresse vitale surmontée',
          'Équipe d''urgence coordonnée',
          'Expertise en urgentologie',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' vies sauvées',
          'Urgences maîtrisées',
          'Secours organisés',
          'Médecine d''urgence vitale'
        ];
        
      -- Autres items: Médecine générale/spécialisée
      ELSE
        specialty_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Médecine spécialisée item ' || item_num,
          'Connaissances approfondies',
          'Diagnostic précis établi',
          'Thérapeutique adaptée',
          '',
          '[Refrain]',
          'Item ' || item_num || ' expertise médicale',
          'Spécialisation maîtrisée',
          'Soins personnalisés',
          'Excellence clinique',
          '',
          '[Couplet 2 - Rang B]',
          'Cas complexes analysés',
          'Techniques avancées appliquées',
          'Innovation thérapeutique',
          'Expertise spécialisée',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' spécialité confirmée',
          'Compétences expertes',
          'Médecine de pointe',
          'Excellence spécialisée'
        ];
    END CASE;
    
    -- Mettre à jour les paroles pour cet item
    UPDATE edn_items_immersive 
    SET paroles_musicales = specialty_paroles,
        updated_at = now()
    WHERE item_code = item_record.item_code;
    
  END LOOP;
END $$;