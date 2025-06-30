
-- Correction de la numérotation des items EDN selon la classification officielle
UPDATE public.edn_items_immersive 
SET 
  item_code = 'IC-5',
  title = 'Responsabilités médicale pénale, civile, administrative et disciplinaire. La gestion des erreurs et des plaintes ; l''aléa thérapeutique',
  subtitle = 'Responsabilités du médecin et gestion des risques',
  slug = 'ic-5-responsabilites-medicales'
WHERE item_code = 'IC-6';

UPDATE public.edn_items_immersive 
SET 
  item_code = 'IC-6',
  title = 'L''organisation de l''exercice clinique et les méthodes qui permettent de sécuriser le parcours du patient',
  subtitle = 'Organisation de l''exercice clinique et sécurisation du parcours patient',
  slug = 'ic-6-organisation-exercice-clinique'
WHERE item_code = 'IC-7';

UPDATE public.edn_items_immersive 
SET 
  item_code = 'IC-7',
  title = 'Les droits individuels et collectifs du patient',
  subtitle = 'Droits des patients et protection juridique',
  slug = 'ic-7-droits-patients'
WHERE item_code = 'IC-8';

UPDATE public.edn_items_immersive 
SET 
  item_code = 'IC-8',
  title = 'Les discriminations',
  subtitle = 'Gestion des discriminations et égalité des soins',
  slug = 'ic-8-discriminations'
WHERE title = 'Certificats médicaux dans le cadre des violences';

-- Mise à jour du contenu pour IC-8 (Les discriminations)
UPDATE public.edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-8 Rang A - Les discriminations",
    "sections": [{
      "concepts": [
        {
          "concept": "Discrimination directe",
          "definition": "Traitement défavorable fondé sur un critère prohibé",
          "exemple": "Refus de soins basé sur l''origine ethnique",
          "piege": "Minimiser l''impact des discriminations subtiles",
          "mnemo": "DIRECT : Différence, Intention, Reconnaissance, Évident, Critère, Traitement",
          "subtilite": "Peut être consciente ou inconsciente",
          "application": "Formation à la non-discrimination du personnel soignant",
          "vigilance": "Surveiller ses propres biais inconscients"
        },
        {
          "concept": "Discrimination indirecte",
          "definition": "Pratique apparemment neutre mais ayant un effet discriminatoire",
          "exemple": "Horaires de consultation incompatibles avec certaines pratiques religieuses",
          "piege": "Ne pas identifier les discriminations systémiques",
          "mnemo": "INDIRECT : Impact, Neutre, Différentiel, Inégalité, Résultat, Effet, Conséquence",
          "subtilite": "Plus difficile à identifier mais tout aussi problématique",
          "application": "Adaptation des services aux diversités culturelles",
          "vigilance": "Analyser l''impact réel des procédures sur tous les patients"
        }
      ]
    }]
  }',
  tableau_rang_b = '{
    "theme": "IC-8 Rang B - Approches avancées anti-discrimination",
    "sections": [{
      "concepts": [
        {
          "concept": "Approche intersectionnelle",
          "definition": "Prise en compte des multiples discriminations qui peuvent se cumuler",
          "exemple": "Femme âgée en situation de précarité",
          "piege": "Traiter les discriminations de manière isolée",
          "mnemo": "INTERSECT : Interaction, Cumul, Complexité, Multiple",
          "subtilite": "Les discriminations peuvent se renforcer mutuellement",
          "application": "Évaluation globale des vulnérabilités du patient",
          "vigilance": "Ne pas hiérarchiser les discriminations"
        }
      ]
    }]
  }',
  paroles_musicales = ARRAY[
    'Égalité des soins pour tous, sans discrimination, c''est notre mission',
    'Respect de chacun, dignité humaine, soigner sans barrière'
  ]
WHERE item_code = 'IC-8';

-- Ajout de l'item IC-9 pour les certificats médicaux dans le cadre des violences
INSERT INTO public.edn_items_immersive (
  id,
  item_code,
  title,
  subtitle,
  slug,
  tableau_rang_a,
  tableau_rang_b,
  paroles_musicales,
  scene_immersive,
  quiz_questions,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'IC-9',
  'Certificats médicaux dans le cadre des violences',
  'Rédaction et implications légales des certificats médicaux',
  'ic-9-certificats-violences',
  '{
    "theme": "IC-9 Rang A - Certificats médicaux et violences",
    "sections": [{
      "concepts": [
        {
          "concept": "Certificat médical initial",
          "definition": "Document médico-légal décrivant les lésions constatées lors du premier examen",
          "exemple": "Certificat après agression physique avec description précise des lésions",
          "piege": "Interpréter les lésions plutôt que les décrire objectivement",
          "mnemo": "INITIAL : Immédiat, Neutre, Investigation, Technique, Impact, Anatomique, Lésions",
          "subtilite": "Doit rester purement descriptif sans interprétation",
          "application": "Examen systématique et documentation photographique si possible",
          "vigilance": "Ne jamais mentionner la cause supposée des lésions"
        },
        {
          "concept": "ITT (Incapacité Totale de Travail)",
          "definition": "Durée pendant laquelle la victime ne peut exercer ses activités habituelles",
          "exemple": "ITT de 8 jours pour fracture du nez",
          "piege": "Confondre ITT et arrêt de travail",
          "mnemo": "ITT : Incapacité, Totale, Temporaire",
          "subtilite": "Évalue la gêne fonctionnelle globale, pas seulement professionnelle",
          "application": "Évaluation basée sur l''ensemble des activités de la vie quotidienne",
          "vigilance": "L''ITT peut être accordée même aux personnes non actives"
        }
      ]
    }]
  }',
  '{
    "theme": "IC-9 Rang B - Aspects médico-légaux avancés",
    "sections": [{
      "concepts": [
        {
          "concept": "Expertise judiciaire",
          "definition": "Mission confiée par un magistrat pour éclairer la justice sur des aspects médicaux",
          "exemple": "Expertise dans le cadre d''une procédure pénale pour coups et blessures",
          "piege": "Dépasser son rôle d''expert médical",
          "mnemo": "EXPERT : Évaluation, eXamen, Précision, Expertise, Rapport, Technique",
          "subtilite": "L''expert n''a pas à déterminer la culpabilité",
          "application": "Rédaction de rapports d''expertise circonstanciés",
          "vigilance": "Rester dans le domaine médical strict"
        }
      ]
    }]
  }',
  ARRAY[
    'Certificat médical, témoin des violences, pour la justice on témoigne avec science',
    'ITT bien évaluée, victime protégée, le médecin certifie en vérité'
  ],
  '{
    "type": "medical_legal",
    "scenario": "Rédaction d''un certificat médical après violences conjugales",
    "characters": ["Médecin légiste", "Victime", "Forces de l''ordre"],
    "interactions": ["Examen médical", "Rédaction", "Transmission"]
  }',
  '{
    "questions": [
      {
        "question": "Que doit contenir un certificat médical initial ?",
        "options": ["Description objective des lésions", "Interprétation de la cause", "Témoignage de la victime", "Conseil juridique"],
        "correct": 0,
        "explanation": "Le certificat doit rester purement descriptif et objectif"
      }
    ]
  }',
  now(),
  now()
);
