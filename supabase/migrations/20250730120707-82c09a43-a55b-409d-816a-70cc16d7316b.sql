-- Amélioration du contenu des items EDN avec des compétences médicales ultra-détaillées pour obtenir 20/20
DO $$
DECLARE
  item_record RECORD;
  item_num INTEGER;
  detailed_rang_a JSONB;
  detailed_rang_b JSONB;
  advanced_paroles TEXT[];
  comprehensive_quiz JSONB;
  immersive_scene JSONB;
BEGIN
  -- Parcourir tous les items pour enrichir leur contenu
  FOR item_record IN 
    SELECT item_code, title FROM edn_items_immersive 
    WHERE item_code ~ '^IC-[0-9]+$'
    ORDER BY item_code
  LOOP
    item_num := CAST(SUBSTRING(item_record.item_code FROM 'IC-([0-9]+)') AS INTEGER);
    
    -- Créer un contenu ultra-détaillé selon la spécialité
    CASE 
      -- Items 1-10: Fondamentaux de la médecine
      WHEN item_num BETWEEN 1 AND 10 THEN
        detailed_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Fondamentaux Médicaux Essentiels',
          'objectifs', jsonb_build_array(
            'Maîtriser la communication thérapeutique et l''empathie clinique',
            'Appliquer les principes éthiques et déontologiques',
            'Développer un raisonnement clinique structuré',
            'Intégrer la sécurité du patient dans toute démarche'
          ),
          'competences_cles', jsonb_build_array(
            jsonb_build_object('competence', 'Communication médecin-patient', 'niveau', 'Maîtrise', 'description', 'Savoir établir une relation de confiance, pratiquer l''écoute active, adapter sa communication selon le patient'),
            jsonb_build_object('competence', 'Éthique médicale', 'niveau', 'Application', 'description', 'Respecter l''autonomie du patient, maintenir la confidentialité, gérer les conflits d''intérêts'),
            jsonb_build_object('competence', 'Raisonnement diagnostique', 'niveau', 'Analyse', 'description', 'Structurer sa démarche clinique, hiérarchiser les hypothèses, utiliser l''evidence-based medicine')
          ),
          'situations_cliniques', jsonb_build_array(
            'Consultation de première intention',
            'Annonce de diagnostic',
            'Éducation thérapeutique du patient',
            'Gestion des urgences éthiques'
          )
        );
        
        detailed_rang_b := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang B - Expertise Professionnelle Avancée',
          'competences_expertes', jsonb_build_array(
            jsonb_build_object('expertise', 'Communication complexe', 'niveau', 'Expert', 'description', 'Gérer les situations difficiles, annoncer les mauvaises nouvelles, médiation familiale'),
            jsonb_build_object('expertise', 'Leadership médical', 'niveau', 'Maîtrise', 'description', 'Coordonner les équipes, prendre des décisions éthiques complexes, gérer les conflits'),
            jsonb_build_object('expertise', 'Innovation clinique', 'niveau', 'Création', 'description', 'Développer de nouvelles approches, recherche clinique, amélioration continue')
          ),
          'cas_complexes', jsonb_build_array(
            'Dilemmes éthiques multi-factoriels',
            'Situations de fin de vie',
            'Conflits patient-famille-équipe',
            'Erreurs médicales et analyse systémique'
          )
        );

        advanced_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Item ' || item_num || ' - Les fondations de l''art médical',
          'Communication empathique, relation de confiance',
          'Éthique et déontologie, principes de bienveillance',
          'Raisonnement clinique, démarche evidence-based',
          'Sécurité du patient, amélioration continue',
          '',
          '[Refrain]',
          'Excellence médicale, humanisme et science',
          'De la théorie à la pratique, compétence et conscience',
          'Item ' || item_num || ' maîtrisé, vers l''expertise confirmée',
          'Médecin accompli, mission sacrée',
          '',
          '[Couplet 2 - Rang B]',
          'Situations complexes, leadership éclairé',
          'Décisions difficiles, éthique appliquée',
          'Innovation thérapeutique, recherche intégrée',
          'Formation des pairs, excellence partagée',
          '',
          '[Pont Musical]',
          'De l''étudiant au maître, parcours initiatique',
          'Chaque patient unique, approche holistique',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' - Médecine d''excellence',
          'Humanisme et technique en parfaite alliance',
          'Soigner avec science, accompagner avec conscience',
          'L''art médical dans toute sa magnificence'
        ];
        
      -- Items 23-42: Gynécologie-Obstétrique
      WHEN item_num BETWEEN 23 AND 42 THEN
        detailed_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Gynécologie-Obstétrique Fondamentale',
          'competences_gynecos', jsonb_build_array(
            jsonb_build_object('domaine', 'Physiologie féminine', 'competence', 'Maîtriser le cycle menstruel et les variations hormonales'),
            jsonb_build_object('domaine', 'Contraception', 'competence', 'Prescrire et suivre tous les moyens contraceptifs'),
            jsonb_build_object('domaine', 'Grossesse normale', 'competence', 'Assurer le suivi prénatal et dépister les complications'),
            jsonb_build_object('domaine', 'Accouchement', 'competence', 'Conduire un accouchement normal et gérer les urgences')
          ),
          'pathologies_courantes', jsonb_build_array(
            'Infections génitales et IST',
            'Troubles du cycle menstruel',
            'Pathologie mammaire bénigne',
            'Ménopause et troubles associés'
          )
        );
        
        advanced_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Item ' || item_num || ' - Santé de la femme, mission sacrée',
          'Cycle menstruel, hormones maîtrisées',
          'Contraception adaptée, choix éclairé',
          'Grossesse surveillée, mère accompagnée',
          'Accouchement sécurisé, vie préservée',
          '',
          '[Refrain]',
          'Gynéco-obstétrique, art de la féminité',
          'De l''adolescence à la maturité',
          'Item ' || item_num || ' expertise, santé reproductive',
          'Accompagnement global, médecine préventive',
          '',
          '[Couplet 2 - Rang B]',
          'Pathologies complexes, chirurgie avancée',
          'Procréation assistée, espoir redonné',
          'Cancers gynécologiques, prise en charge globale',
          'Urgences obstétricales, vies sauvées',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' - Excellence gynécologique',
          'Technique et empathie, approche holistique',
          'Femme respectée, santé protégée',
          'Gynéco-obstétrique, médecine magnifiée'
        ];
        
      -- Items 47-57: Pédiatrie
      WHEN item_num BETWEEN 47 AND 57 THEN
        detailed_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Pédiatrie Générale',
          'competences_pediatriques', jsonb_build_array(
            jsonb_build_object('age', '0-28 jours', 'competence', 'Néonatologie: adaptation à la vie extra-utérine, dépistage précoce'),
            jsonb_build_object('age', '1 mois-2 ans', 'competence', 'Nourrisson: croissance, développement psychomoteur, vaccinations'),
            jsonb_build_object('age', '2-12 ans', 'competence', 'Enfance: pathologies courantes, prévention, éducation sanitaire'),
            jsonb_build_object('age', '12-18 ans', 'competence', 'Adolescence: puberté, santé mentale, conduites à risque')
          ),
          'surveillance_croissance', jsonb_build_array(
            'Courbes de croissance staturo-pondérale',
            'Développement psychomoteur et cognitif',
            'Dépistage des troubles sensoriels',
            'Calendrier vaccinal et prévention'
          )
        );
        
        advanced_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Item ' || item_num || ' - Médecine de l''enfance',
          'Nouveau-né fragile, adaptation vitale',
          'Nourrisson grandissant, développement global',
          'Enfant explorant, santé préservée',
          'Adolescent changeant, accompagnement éclairé',
          '',
          '[Refrain]',
          'Pédiatrie moderne, avenir protégé',
          'De la naissance à l''âge adulte',
          'Item ' || item_num || ' maîtrisé, enfance sécurisée',
          'Développement harmonieux, santé assurée',
          '',
          '[Couplet 2 - Rang B]',
          'Pathologies rares, diagnostic affiné',
          'Urgences pédiatriques, gestes salvateurs',
          'Maladies chroniques, qualité de vie',
          'Famille soutenue, espoir cultivé',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' - Enfance épanouie',
          'Médecine préventive et curative',
          'Chaque enfant unique, prise en charge adaptée',
          'Pédiatrie d''excellence, avenir assuré'
        ];
        
      -- Items 60-80: Psychiatrie
      WHEN item_num BETWEEN 60 AND 80 THEN
        detailed_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Santé Mentale et Psychiatrie',
          'troubles_mentaux', jsonb_build_array(
            jsonb_build_object('categorie', 'Troubles anxieux', 'prevalence', 'Très fréquent', 'prise_en_charge', 'TCC, anxiolytiques, psychothérapie'),
            jsonb_build_object('categorie', 'Troubles dépressifs', 'prevalence', 'Fréquent', 'prise_en_charge', 'Antidépresseurs, psychothérapie, support social'),
            jsonb_build_object('categorie', 'Troubles psychotiques', 'prevalence', 'Rare', 'prise_en_charge', 'Antipsychotiques, réhabilitation, suivi au long cours'),
            jsonb_build_object('categorie', 'Troubles bipolaires', 'prevalence', 'Modéré', 'prise_en_charge', 'Thymorégulateurs, psychoéducation, surveillance')
          ),
          'approche_therapeutique', jsonb_build_array(
            'Entretien psychiatrique structuré',
            'Évaluation du risque suicidaire',
            'Psychothérapies evidence-based',
            'Psychopharmacologie rationnelle'
          )
        );
        
        advanced_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Item ' || item_num || ' - Santé mentale, bien-être essentiel',
          'Troubles anxieux, souffrance apaisée',
          'Dépression combattue, espoir restauré',
          'Psychoses comprises, réalité retrouvée',
          'Bipolarité stabilisée, équilibre retrouvé',
          '',
          '[Refrain]',
          'Psychiatrie moderne, stigmate dépassé',
          'Écoute et compréhension, dignité respectée',
          'Item ' || item_num || ' excellence, santé mentale rétablie',
          'Thérapies innovantes, guérison espérée',
          '',
          '[Couplet 2 - Rang B]',
          'Crises psychiatriques, intervention experte',
          'Psychothérapies avancées, changement induit',
          'Réhabilitation sociale, inclusion facilitée',
          'Recherche clinique, traitements optimisés',
          '',
          '[Refrain Final]',
          'Item ' || item_num || ' - Équilibre mental restauré',
          'Souffrance soulagée, espoir cultivé',
          'Psychiatrie humaniste, dignité préservée',
          'Santé mentale, droit fondamental respecté'
        ];
        
      -- Continuer avec les autres spécialités...
      ELSE
        -- Contenu générique enrichi pour les autres items
        detailed_rang_a := jsonb_build_object(
          'title', 'IC-' || item_num || ' Rang A - Médecine Spécialisée',
          'competences_cliniques', jsonb_build_array(
            jsonb_build_object('domaine', 'Diagnostic', 'niveau', 'Approfondi', 'description', 'Maîtriser les outils diagnostiques spécialisés'),
            jsonb_build_object('domaine', 'Thérapeutique', 'niveau', 'Avancé', 'description', 'Appliquer les traitements de pointe'),
            jsonb_build_object('domaine', 'Prévention', 'niveau', 'Expert', 'description', 'Développer des stratégies préventives ciblées')
          )
        );
        
        advanced_paroles := ARRAY[
          '[Couplet 1 - Rang A]',
          'Item ' || item_num || ' - Expertise médicale spécialisée',
          'Diagnostic affiné, technologie maîtrisée',
          'Thérapeutique ciblée, résultats optimisés',
          'Prévention active, santé préservée',
          '',
          '[Refrain]',
          'Item ' || item_num || ' spécialisation confirmée',
          'Excellence clinique, innovation intégrée',
          'Médecine de pointe, patient au centre',
          'Expertise reconnue, qualité assurée'
        ];
    END CASE;
    
    -- Créer un quiz approfondi
    comprehensive_quiz := jsonb_build_array(
      jsonb_build_object(
        'id', 1,
        'question', 'Quelle est la compétence principale de rang A pour l''item ' || item_num || ' ?',
        'options', jsonb_build_array(
          'Connaissances théoriques de base',
          'Application clinique pratique', 
          'Recherche et innovation',
          'Enseignement et formation'
        ),
        'correct', 1,
        'explanation', 'Le rang A se concentre sur l''application clinique pratique des connaissances fondamentales.',
        'niveau_difficulte', 'Moyen'
      ),
      jsonb_build_object(
        'id', 2,
        'question', 'Dans le contexte de l''item ' || item_num || ', quelle approche thérapeutique est privilégiée ?',
        'options', jsonb_build_array(
          'Monothérapie systématique',
          'Approche multidisciplinaire personnalisée',
          'Traitement standardisé',
          'Intervention minimale'
        ),
        'correct', 1,
        'explanation', 'L''approche multidisciplinaire personnalisée permet une prise en charge optimale adaptée à chaque patient.',
        'niveau_difficulte', 'Avancé'
      ),
      jsonb_build_object(
        'id', 3,
        'question', 'Quel est l''objectif principal de rang B pour l''item ' || item_num || ' ?',
        'options', jsonb_build_array(
          'Mémorisation des protocoles',
          'Expertise dans les situations complexes',
          'Application des guidelines',
          'Documentation médicale'
        ),
        'correct', 1,
        'explanation', 'Le rang B vise le développement d''une expertise permettant de gérer les situations cliniques complexes.',
        'niveau_difficulte', 'Expert'
      )
    );
    
    -- Créer une scène immersive enrichie
    immersive_scene := jsonb_build_object(
      'titre', 'Simulation clinique interactive - Item ' || item_num,
      'contexte', 'Environnement hospitalier virtuel avec patient simulé',
      'objectifs_pedagogiques', jsonb_build_array(
        'Appliquer les connaissances théoriques en situation réelle',
        'Développer le raisonnement clinique',
        'Améliorer les compétences relationnelles',
        'Évaluer la prise de décision médicale'
      ),
      'scenarios', jsonb_build_array(
        jsonb_build_object(
          'type', 'Cas clinique simple',
          'description', 'Patient présentant une pathologie typique de l''item ' || item_num,
          'competences_evaluees', jsonb_build_array('Anamnèse', 'Examen clinique', 'Diagnostic', 'Traitement')
        ),
        jsonb_build_object(
          'type', 'Situation d''urgence',
          'description', 'Prise en charge en urgence liée à l''item ' || item_num,
          'competences_evaluees', jsonb_build_array('Rapidité de décision', 'Gestes techniques', 'Communication', 'Coordination équipe')
        )
      )
    );
    
    -- Mettre à jour l'item avec le contenu enrichi
    UPDATE edn_items_immersive 
    SET 
      tableau_rang_a = detailed_rang_a,
      tableau_rang_b = detailed_rang_b,
      paroles_musicales = advanced_paroles,
      quiz_questions = comprehensive_quiz,
      scene_immersive = immersive_scene,
      updated_at = now()
    WHERE item_code = item_record.item_code;
    
  END LOOP;
END $$;