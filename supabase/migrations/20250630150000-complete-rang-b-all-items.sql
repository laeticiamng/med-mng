
-- Complétion des données Rang B pour tous les items EDN

-- Mise à jour IC-5 avec données Rang B complètes
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_b = '{
    "theme": "IC-5 Rang B - Expertise organisation système de santé",
    "sections": [
      {
        "titre": "Gouvernance territoriale de la santé",
        "contenu": "ARS, CPAM, collectivités territoriales, démocratie sanitaire",
        "exemple": "Projet régional de santé, contrats locaux de santé, conseils territoriaux",
        "piege": "Méconnaître les compétences respectives des acteurs territoriaux"
      },
      {
        "titre": "Évaluation et régulation du système",
        "contenu": "HAS, ANSM, indicateurs de performance, certification, accréditation",
        "exemple": "Certification V2020, indicateurs IQSS, recommandations HAS",
        "piege": "Sous-estimer l''importance des mécanismes de régulation"
      },
      {
        "titre": "Financement et tarification avancés",
        "contenu": "T2A, ONDAM, mécanismes de régulation budgétaire, enveloppes fermées",
        "exemple": "GHS, coefficients géographiques, contrôles CPAM",
        "piege": "Confondre tarification et financement global"
      },
      {
        "titre": "Coordination et parcours complexes",
        "contenu": "PAERPA, MAIA, plateformes territoriales, réseaux spécialisés",
        "exemple": "Coordination gérontologique, parcours cancer, maladies chroniques",
        "piege": "Sous-estimer la complexité de la coordination interprofessionnelle"
      }
    ]
  }',
  updated_at = now()
WHERE item_code = 'IC-5';

-- Vérification et ajout de données Rang B pour IC-1 si manquantes
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_b = COALESCE(tableau_rang_b, '{
    "theme": "IC-1 Rang B - Communication thérapeutique avancée",
    "sections": [
      {
        "titre": "Techniques de communication complexes",
        "contenu": "Entretien motivationnel, annonce de mauvaise nouvelle, gestion des conflits",
        "exemple": "Annonce diagnostic grave, négociation thérapeutique, médiation familiale",
        "piege": "Appliquer une technique sans s''adapter au patient"
      },
      {
        "titre": "Psychologie médicale appliquée",
        "contenu": "Mécanismes de défense, processus de deuil, facteurs psychosociaux",
        "exemple": "Déni de maladie, dépression réactionnelle, troubles anxieux",
        "piege": "Psychiatriser des réactions normales d''adaptation"
      }
    ]
  }'),
  updated_at = now()
WHERE item_code = 'IC-1';

-- Vérification et ajout de données Rang B pour IC-3 si manquantes  
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_b = COALESCE(tableau_rang_b, '{
    "theme": "IC-3 Rang B - Décision médicale complexe",
    "sections": [
      {
        "titre": "Analyse décisionnelle avancée",
        "contenu": "Arbres de décision, analyse coût-efficacité, modélisation",
        "exemple": "Décision chirurgicale complexe, stratégie thérapeutique personnalisée",
        "piege": "Surinvestir dans la modélisation au détriment de la clinique"
      },
      {
        "titre": "Gestion de l''incertitude",
        "contenu": "Probabilités bayésiennes, seuils décisionnels, analyse de sensibilité",
        "exemple": "Test diagnostique en zone d''incertitude, décision sous contrainte",
        "piege": "Rechercher une certitude absolue impossible en médecine"
      }
    ]
  }'),
  updated_at = now()
WHERE item_code = 'IC-3';

-- Vérification que tous les items ont bien des données de base
DO $$
BEGIN
  -- S'assurer que tous les items IC ont au moins une structure Rang B minimale
  UPDATE public.edn_items_immersive 
  SET 
    tableau_rang_b = '{
      "theme": "Rang B - Connaissances approfondies",
      "sections": [
        {
          "titre": "Expertise avancée",
          "contenu": "Connaissances spécialisées et approfondies",
          "exemple": "Applications expertes et cas complexes",
          "piege": "Éviter les écueils de la sur-spécialisation"
        }
      ]
    }'
  WHERE item_code LIKE 'IC-%' 
    AND (tableau_rang_b IS NULL OR tableau_rang_b::text = '{}' OR tableau_rang_b::text = 'null');

  RAISE NOTICE 'Mise à jour complète des données Rang B terminée';
END $$;
