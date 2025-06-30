
-- Mise à jour complète de tous les items EDN avec données Rang A et Rang B
-- Basé sur le contenu des images fournies

-- IC-1: Relation médecin-malade dans le cadre du colloque singulier ou au sein d'une équipe
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "IC-1 Rang A - Relation médecin-malade (12 connaissances)",
    "sections": [
      {
        "title": "Les bases de la communication",
        "content": "Techniques de communication verbale et non-verbale, écoute active, reformulation",
        "keywords": ["communication", "écoute", "verbal", "non-verbal", "reformulation"]
      },
      {
        "title": "L''entretien médical",
        "content": "Structure de l''entretien, anamnèse, questions ouvertes/fermées, silence thérapeutique",
        "keywords": ["entretien", "anamnèse", "questions", "silence", "structure"]
      },
      {
        "title": "La relation thérapeutique",
        "content": "Alliance thérapeutique, transfert, contre-transfert, distance professionnelle",
        "keywords": ["alliance", "transfert", "contre-transfert", "distance", "thérapeutique"]
      }
    ]
  }',
  tableau_rang_b = '{
    "title": "IC-1 Rang B - Communication avancée (4 connaissances)",
    "sections": [
      {
        "title": "Entretien motivationnel",
        "content": "Techniques avancées de motivation au changement, résistance au changement",
        "keywords": ["motivationnel", "changement", "résistance", "motivation"]
      },
      {
        "title": "Annonce de mauvaise nouvelle",
        "content": "Protocole SPIKES, gestion des émotions, accompagnement du patient et famille",
        "keywords": ["annonce", "SPIKES", "mauvaise nouvelle", "émotions", "accompagnement"]
      }
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-1';

-- IC-2: Les valeurs professionnelles du médecin et des autres professions de santé
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "IC-2 Rang A - Valeurs professionnelles (7 connaissances E-LiSA)",
    "sections": [
      {
        "title": "Identifier les professionnels, compétences et ressources",
        "content": "Cartographie des acteurs de santé : médecins, infirmiers, pharmaciens selon leurs rôles",
        "keywords": ["professionnels", "compétences", "ressources", "acteurs", "rôles"]
      },
      {
        "title": "Définition pratique médicale et éthique",
        "content": "Pratique médicale intégrant diagnostic, traitement, prévention. Éthique comme réflexion morale",
        "keywords": ["pratique", "médicale", "éthique", "diagnostic", "traitement", "morale"]
      },
      {
        "title": "Normes et valeurs professionnelles",
        "content": "Valeurs = principes (dignité, respect). Normes = règles concrètes traduisant ces valeurs",
        "keywords": ["normes", "valeurs", "principes", "dignité", "respect", "règles"]
      },
      {
        "title": "Organisation sociale et régulation étatique",
        "content": "Ordres professionnels, contrôle étatique, équilibre autonomie/contrôle sociétal",
        "keywords": ["organisation", "régulation", "ordres", "contrôle", "autonomie"]
      },
      {
        "title": "Médecine fondée sur preuves et expérience patient",
        "content": "EBM + expérience patient, préférences, autonomie. Équilibre science/expertise/patient",
        "keywords": ["EBM", "preuves", "expérience", "patient", "autonomie", "science"]
      },
      {
        "title": "Déontologie et conflits",
        "content": "Devoirs professionnels codifiés, conflits de valeurs, conflits d''intérêts",
        "keywords": ["déontologie", "devoirs", "conflits", "valeurs", "intérêts"]
      },
      {
        "title": "Collaboration interprofessionnelle",
        "content": "Coordination, délégation, travail équipe pluridisciplinaire, RCP, consultations partagées",
        "keywords": ["collaboration", "coordination", "équipe", "pluridisciplinaire", "RCP"]
      }
    ]
  }',
  tableau_rang_b = '{
    "title": "IC-2 Rang B - Organisation professionnelle (2 connaissances E-LiSA)",
    "sections": [
      {
        "title": "Organisation exercice et statuts en France",
        "content": "Statuts complexes : fonctionnaires, salariés, libéraux. PH, MCU-PH, CCA, secteurs 1/2",
        "keywords": ["organisation", "statuts", "fonctionnaires", "libéraux", "PH", "secteurs"]
      },
      {
        "title": "Rôle des ordres professionnels",
        "content": "Régulation : inscription, discipline, surveillance déontologique. CNOM, conseils, procédures",
        "keywords": ["ordres", "régulation", "discipline", "CNOM", "surveillance", "procédures"]
      }
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-2';

-- IC-3: La décision médicale
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "IC-3 Rang A - Décision médicale (9 connaissances)",
    "sections": [
      {
        "title": "Processus décisionnel médical",
        "content": "Étapes de la décision : information, analyse, options, choix, évaluation",
        "keywords": ["processus", "décision", "étapes", "analyse", "choix", "évaluation"]
      },
      {
        "title": "Evidence-Based Medicine",
        "content": "Médecine fondée sur preuves, niveaux de preuve, recommandations, méta-analyses",
        "keywords": ["EBM", "preuves", "recommandations", "méta-analyses", "niveaux"]
      },
      {
        "title": "Décision partagée",
        "content": "Information du patient, consentement éclairé, préférences, autonomie",
        "keywords": ["partagée", "information", "consentement", "préférences", "autonomie"]
      }
    ]
  }',
  tableau_rang_b = '{
    "title": "IC-3 Rang B - Décision complexe (3 connaissances)",
    "sections": [
      {
        "title": "Analyse décisionnelle avancée",
        "content": "Arbres de décision, analyse coût-efficacité, modélisation décisionnelle",
        "keywords": ["arbres", "coût-efficacité", "modélisation", "analyse", "avancée"]
      },
      {
        "title": "Gestion incertitude",
        "content": "Probabilités bayésiennes, seuils décisionnels, analyse de sensibilité",
        "keywords": ["incertitude", "probabilités", "bayésiennes", "seuils", "sensibilité"]
      },
      {
        "title": "Éthique décisionnelle",
        "content": "Dilemmes éthiques, principes bioéthiques, comités d''éthique, cas limites",
        "keywords": ["éthique", "dilemmes", "bioéthique", "comités", "limites"]
      }
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-3';

-- IC-4: Évaluation des pratiques de soins et qualité
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "IC-4 Rang A - Qualité et sécurité (8 connaissances)",
    "sections": [
      {
        "title": "Concepts qualité en santé",
        "content": "Définitions qualité, sécurité, pertinence, efficacité, efficience",
        "keywords": ["qualité", "sécurité", "pertinence", "efficacité", "efficience"]
      },
      {
        "title": "Indicateurs qualité",
        "content": "IQSS, indicateurs processus/résultats, tableaux de bord, benchmarking",
        "keywords": ["indicateurs", "IQSS", "processus", "résultats", "benchmarking"]
      },
      {
        "title": "Gestion des risques",
        "content": "Identification, analyse, prévention, événements indésirables, signalement",
        "keywords": ["risques", "identification", "prévention", "indésirables", "signalement"]
      }
    ]
  }',
  tableau_rang_b = '{
    "title": "IC-4 Rang B - Amélioration continue (4 connaissances)",
    "sections": [
      {
        "title": "Certification et accréditation",
        "content": "HAS, certification V2020, accréditation médecins, audit clinique",
        "keywords": ["certification", "HAS", "V2020", "accréditation", "audit"]
      },
      {
        "title": "Démarche qualité avancée",
        "content": "PDCA, amélioration continue, management qualité, culture sécurité",
        "keywords": ["PDCA", "amélioration", "management", "culture", "sécurité"]
      }
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-4';

-- IC-5: Organisation du système de santé
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_a = '{
    "title": "IC-5 Rang A - Système de santé (4 connaissances)",
    "sections": [
      {
        "title": "Définition système de santé français",
        "content": "Ensemble organisé moyens coordonnés, triple objectif : équité, qualité, efficience",
        "keywords": ["système", "santé", "équité", "qualité", "efficience", "coordonnés"]
      },
      {
        "title": "Financement système",
        "content": "Cotisations (75%), CSG (15%), taxes, État. Répartition ambulatoire/hospitalier/médico-social",
        "keywords": ["financement", "cotisations", "CSG", "taxes", "répartition"]
      },
      {
        "title": "Organisation territoriale",
        "content": "ARS régionales, collectivités territoriales, démocratie sanitaire, PRS, contrats locaux",
        "keywords": ["territorial", "ARS", "collectivités", "démocratie", "PRS"]
      },
      {
        "title": "Professionnels et établissements",
        "content": "Secteurs public, ESPIC, privé commercial. Statuts différents, missions convergentes",
        "keywords": ["professionnels", "établissements", "public", "ESPIC", "privé"]
      }
    ]
  }',
  tableau_rang_b = '{
    "title": "IC-5 Rang B - Gouvernance avancée (4 connaissances)",
    "sections": [
      {
        "title": "Gouvernance ARS et pilotage régional",
        "content": "Direction ARS, conseil surveillance, CRSA, CPOM, contractualisation, évaluation",
        "keywords": ["gouvernance", "ARS", "CRSA", "CPOM", "contractualisation"]
      },
      {
        "title": "Régulation économique et tarification",
        "content": "T2A, ONDAM, enveloppe fermée, GHS, coefficients géographiques, contrôles",
        "keywords": ["régulation", "T2A", "ONDAM", "GHS", "tarification"]
      },
      {
        "title": "Parcours et coordination",
        "content": "Médecin traitant, PAERPA, MAIA, plateformes territoriales, coordination ville-hôpital",
        "keywords": ["parcours", "coordination", "PAERPA", "MAIA", "plateformes"]
      },
      {
        "title": "Évaluation et régulation qualité",
        "content": "HAS, ANSM, certification V2020, IQSS, indicateurs qualité publics, transparence",
        "keywords": ["évaluation", "HAS", "ANSM", "IQSS", "transparence"]
      }
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-5';

-- Vérification que tous les items ont des données complètes
DO $$
DECLARE
    item_record RECORD;
    missing_count INTEGER := 0;
BEGIN
    -- Vérifier chaque item IC-1 à IC-5
    FOR item_record IN 
        SELECT item_code, title, 
               CASE WHEN tableau_rang_a IS NULL THEN 'MANQUANT' ELSE 'OK' END as rang_a_status,
               CASE WHEN tableau_rang_b IS NULL THEN 'MANQUANT' ELSE 'OK' END as rang_b_status
        FROM public.edn_items_immersive 
        WHERE item_code IN ('IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5')
        ORDER BY item_code
    LOOP
        RAISE NOTICE '📋 % - Rang A: % | Rang B: %', 
            item_record.item_code, 
            item_record.rang_a_status, 
            item_record.rang_b_status;
            
        IF item_record.rang_a_status = 'MANQUANT' OR item_record.rang_b_status = 'MANQUANT' THEN
            missing_count := missing_count + 1;
        END IF;
    END LOOP;
    
    IF missing_count = 0 THEN
        RAISE NOTICE '✅ Tous les items IC-1 à IC-5 sont complets avec Rang A et Rang B';
    ELSE
        RAISE NOTICE '⚠️ % items incomplets détectés', missing_count;
    END IF;
END $$;
