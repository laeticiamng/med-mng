
-- Ajout des 3 nouveaux items EDN basés sur les images fournies
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
) VALUES 
(
  gen_random_uuid(),
  'IC-6',
  'Organisation de l''exercice clinique et méthodes qui permettent de sécuriser le parcours du patient',
  'Coordination des soins et sécurisation du parcours patient',
  'ic-6-organisation-exercice-clinique',
  '{
    "theme": "IC-6 Rang A - Organisation de l''exercice clinique",
    "sections": [{
      "concepts": [
        {
          "concept": "Coordination des soins",
          "definition": "Organisation et synchronisation des différents intervenants dans le parcours de soins",
          "exemple": "Réunion de concertation pluridisciplinaire en oncologie",
          "piege": "Confondre coordination et simple transmission d''informations",
          "mnemo": "COORD : Communication, Organisation, Responsabilité, Délais",
          "subtilite": "La coordination implique une responsabilité partagée",
          "application": "Mise en place de protocoles de liaison ville-hôpital",
          "vigilance": "Éviter les ruptures de communication entre professionnels"
        },
        {
          "concept": "Parcours de soins",
          "definition": "Trajectoire organisée du patient à travers le système de santé",
          "exemple": "Parcours de soins en cardiologie post-infarctus",
          "piege": "Confondre parcours et simple succession de consultations",
          "mnemo": "PARCOURS : Planification, Accompagnement, Référentiels, Coordination",
          "subtilite": "Le parcours doit être personnalisé selon le patient",
          "application": "Élaboration de protocoles de parcours standardisés",
          "vigilance": "Adapter le parcours aux spécificités du patient"
        }
      ]
    }]
  }',
  '{
    "theme": "IC-6 Rang B - Méthodes avancées de sécurisation",
    "sections": [{
      "concepts": [
        {
          "concept": "Gestion des risques",
          "definition": "Identification, évaluation et maîtrise des risques dans l''organisation des soins",
          "exemple": "Mise en place d''une check-list chirurgicale",
          "piege": "Se limiter aux risques évidents sans analyse systémique",
          "mnemo": "RISQUE : Reconnaissance, Identification, Surveillance, Qualification",
          "subtilite": "La gestion des risques doit être proactive",
          "application": "Implémentation d''un système de déclaration d''événements indésirables",
          "vigilance": "Former l''équipe à la culture sécurité"
        }
      ]
    }]
  }',
  ARRAY[
    'Organisation des soins, coordination parfaite, pour la sécurité du patient on avance',
    'Parcours de soins bien tracé, équipe coordonnée, c''est la qualité assurée'
  ],
  '{
    "type": "hospital_coordination",
    "scenario": "Coordination d''une prise en charge pluridisciplinaire",
    "characters": ["Médecin coordonnateur", "Infirmière", "Pharmacien", "Patient"],
    "interactions": ["Planification", "Communication", "Suivi"]
  }',
  '{
    "questions": [
      {
        "question": "Quel est l''élément clé de la coordination des soins ?",
        "options": ["Communication", "Hiérarchie", "Rapidité", "Économie"],
        "correct": 0,
        "explanation": "La communication est la base de toute coordination efficace"
      }
    ]
  }',
  now(),
  now()
),
(
  gen_random_uuid(),
  'IC-7',
  'Les discriminations IC-B',
  'Gestion des discriminations et égalité des soins',
  'ic-7-discriminations',
  '{
    "theme": "IC-7 Rang A - Les discriminations",
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
  '{
    "theme": "IC-7 Rang B - Approches avancées anti-discrimination",
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
  ARRAY[
    'Égalité des soins pour tous, sans discrimination, c''est notre mission',
    'Respect de chacun, dignité humaine, soigner sans barrière'
  ],
  '{
    "type": "discrimination_awareness",
    "scenario": "Situation de discrimination potentielle aux urgences",
    "characters": ["Médecin urgentiste", "Patient discriminé", "Témoin"],
    "interactions": ["Prise de conscience", "Intervention", "Prévention"]
  }',
  '{
    "questions": [
      {
        "question": "Quelle est la différence entre discrimination directe et indirecte ?",
        "options": ["L''intention", "La gravité", "La fréquence", "Le résultat"],
        "correct": 0,
        "explanation": "La discrimination directe implique une intention, l''indirecte peut être non intentionnelle"
      }
    ]
  }',
  now(),
  now()
),
(
  gen_random_uuid(),
  'IC-8',
  'Certificats médicaux dans le cadre des violences',
  'Rédaction et implications légales des certificats médicaux',
  'ic-8-certificats-violences',
  '{
    "theme": "IC-8 Rang A - Certificats médicaux et violences",
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
    "theme": "IC-8 Rang B - Aspects médico-légaux avancés",
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
