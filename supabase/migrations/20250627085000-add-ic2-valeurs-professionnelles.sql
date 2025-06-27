
-- Ajout de l'item IC-2 : Les valeurs professionnelles du médecin
INSERT INTO edn_items_immersive (
  slug,
  title, 
  subtitle,
  item_code,
  pitch_intro,
  tableau_rang_a,
  tableau_rang_b,
  scene_immersive,
  paroles_musicales,
  interaction_config,
  quiz_questions,
  reward_messages,
  created_at,
  updated_at
) VALUES (
  'valeurs-professionnelles-medecin',
  'Les valeurs professionnelles du médecin et des autres professions de santé',
  'IC-2 - Fiche LiSA',
  'IC-2',
  'La médecine moderne repose sur un écosystème complexe de professionnels aux compétences complémentaires. Les valeurs professionnelles guident chaque acteur de santé dans sa pratique quotidienne, créant un réseau de confiance et d''excellence au service du patient.',
  
  '{
    "theme": "Fondamentaux des valeurs professionnelles - Rang A",
    "colonnes": [
      "Professionnels et collaborations",
      "Définition pratique médicale",
      "Éthique médicale",
      "Normes et valeurs",
      "Régulation étatique",
      "Médecine fondée preuves",
      "Déontologie médicale",
      "Acteurs de santé"
    ],
    "lignes": [
      [
        "Collaboration multi-acteurs",
        "Activité technique relationnelle",
        "Réflexion action éthique",
        "Valeurs = digne estime",
        "Régulation dépenses santé",
        "EBM = Evidence Based",
        "Code déontologie ONM",
        "Professions médicales"
      ],
      [
        "Qualité soins sécurité",
        "Besoins santé individuels",
        "Comment agir au mieux",
        "Souhaitable recommandé",
        "Remise question autonomie",
        "Preuves scientifiques actuelles",
        "Normes profession appliquées",
        "Médecins chirurgiens-dentistes"
      ],
      [
        "Organisation des soins",
        "Besoins santé population",
        "Éthique indissociable technique",
        "Normes = principes règles",
        "Qualité soins évaluation",
        "Expérience personnelle",
        "Principes valeurs professionnelles",
        "Sages-femmes"
      ],
      [
        "Capacité travailler ensemble",
        "Connaissances compétences spécifiques",
        "Question situation spécifique",
        "Devoirs obligations référence",
        "Efficience soins",
        "Préférences valeurs patient",
        "Conseil État Parlement",
        "Pharmaciens préparateurs"
      ],
      [
        "Expérimentations coopérations",
        "Réponse aux besoins",
        "Agir en situation",
        "Valeurs cardinales profession",
        "Équilibre individuel/public",
        "Médecine responsabilité",
        "Journal Officiel CSP",
        "Physiciens médicaux"
      ],
      [
        "Transferts compétences",
        "Individus et population",
        "Pratique éthique",
        "Responsabilité dévouement",
        "Autonomie liberté médecin",
        "Expérience quotidienne maladie",
        "Conflit valeurs intérêts",
        "Auxiliaires médicaux"
      ],
      [
        "Délégation actes médicaux",
        "Activité professionnelle",
        "Médecine technique éthique",
        "Compassion respect autonomie",
        "Cout risques traitements",
        "Compétences pratiques patient",
        "Protection vie vs autonomie",
        "Infirmiers kinésithérapeutes"
      ],
      [
        "Optimiser prises charge",
        "Technique et relationnel",
        "Réflexion action médicale",
        "Indépendance probité discrétion",
        "Justification régulation",
        "Intervention décisions prise charge",
        "Avantage financier jugement",
        "Autres acteurs indispensables"
      ]
    ]
  }',
  
  '{
    "theme": "Approfondissements organisation et régulation - Rang B", 
    "colonnes": [
      "Organisation exercice professionnel",
      "Statuts professionnels",
      "Autorisations exercice",
      "Diplômes qualifiants",
      "Collaboration organisée",
      "Ordres professionnels régulation",
      "Instances régulation",
      "Principes ordres professionnels"
    ],
    "lignes": [
      [
        "Activité codifiée régulée",
        "Chaque profession santé",
        "Autorisation découlant diplôme",
        "Diplôme qualifiant",
        "Hôpitaux maisons santé",
        "Instances régulation professions",
        "Médecins pharmaciens",
        "Maintien principes moralité"
      ],
      [
        "Plus en plus organisée",
        "Exercice plus codifié",
        "Obtention diplôme",
        "Contrôle de État",
        "Collaboration plus organisée",
        "Professions règlementées",
        "Sages-femmes chirurgiens-dentistes",
        "Probité compétence"
      ],
      [
        "Régulation étatique",
        "Activité régulée",
        "Autorisation exercice",
        "Diplôme sous contrôle",
        "Au sein établissements",
        "Veillent maintien principes",
        "Infirmiers masseurs-kinés",
        "Indispensables exercice"
      ],
      [
        "Contrôle État",
        "Statuts professionnels",
        "Droits et responsabilités",
        "Confère droits responsabilités",
        "Maisons santé notamment",
        "Moralité probité compétence",
        "Pédicures-podologues",
        "Respect droits devoirs"
      ],
      [
        "Diplôme qualifiant",
        "De plus en plus",
        "Découlant obtention",
        "Professionnels santé",
        "Professionnels collaboration",
        "Indispensables exercice",
        "Ordres professionnels",
        "Obligations professionnels"
      ],
      [
        "Droits responsabilités",
        "Codifiée et régulée",
        "Obtention diplôme",
        "Droits mais aussi",
        "Organisée au sein",
        "Respect droits devoirs",
        "Instances régulation",
        "Relations confraternelles"
      ],
      [
        "Collaboration organisée",
        "Autorisation exercice",
        "Confère des droits",
        "Aussi des responsabilités",
        "Hôpitaux ou maisons",
        "Obligations professionnels",
        "Professions règlementées",
        "Entre professionnels"
      ],
      [
        "Optimisation organisation",
        "Exercice professionnel",
        "Diplôme sous contrôle",
        "Responsabilités professionnelles",
        "Santé notamment",
        "Relations confraternelles",
        "Régulation instances",
        "Professionnels santé"
      ]
    ]
  }',
  
  '{
    "description": "Dans l''univers de la santé, une symphonie silencieuse se joue chaque jour. Médecins, infirmiers, pharmaciens, chaque professionnel apporte sa partition unique à cette œuvre collective dédiée au bien-être des patients.",
    "mots_cles": [
      "Collaboration",
      "Éthique", 
      "Responsabilité",
      "Compétence",
      "Déontologie",
      "Valeurs",
      "Professionnels",
      "Excellence"
    ],
    "effet": "Cette coordination harmonieuse des valeurs professionnelles garantit la qualité et la sécurité des soins pour tous."
  }',
  
  ARRAY[
    'Verse 1:\nDans les couloirs blancs résonne un serment\nChaque professionnel porte ses valeurs\nDu médecin à l''aide-soignant\nTous unis par le même honneur',
    
    'Refrain:\nÉthique et déontologie\nGuident nos pas chaque jour\nLa probité, la confraternité\nSont les piliers de notre amour',
    
    'Verse 2:\nOrdres professionnels veillent\nSur nos pratiques et nos cœurs\nLa collaboration s''éveille\nPour le bien de nos douleurs',
    
    'Pont:\nDiplômes et responsabilités\nDroits et devoirs entremêlés\nDans cette noble vérité\nQue soigner c''est s''engager'
  ],
  
  '{
    "type": "association",
    "description": "Associez chaque situation professionnelle avec la valeur ou le principe correspondant.",
    "exemples": [
      {
        "phrase": "Un médecin refuse un avantage financier d''un laboratoire",
        "concept": "Indépendance et évitement conflit intérêts"
      },
      {
        "phrase": "Une infirmière respecte le secret professionnel",
        "concept": "Discrétion et confidentialité"
      },
      {
        "phrase": "Un pharmacien vérifie une ordonnance douteuse",
        "concept": "Responsabilité et sécurité patient"
      },
      {
        "phrase": "Un chirurgien explique les risques d''une intervention",
        "concept": "Respect autonomie et information"
      },
      {
        "phrase": "Une équipe pluridisciplinaire se concerte",
        "concept": "Collaboration et travail en équipe"
      },
      {
        "phrase": "Un médecin se forme aux nouvelles pratiques",
        "concept": "Compétence et formation continue"
      }
    ],
    "feedback": "Parfait ! Vous maîtrisez les valeurs fondamentales qui régissent l''exercice des professions de santé."
  }',
  
  '{
    "qcm": [
      {
        "question": "Quelles sont les professions de santé disposant d''un Ordre professionnel ?",
        "options": [
          "Médecins, pharmaciens, infirmiers seulement",
          "Médecins, pharmaciens, sages-femmes, chirurgiens-dentistes, infirmiers, masseurs-kinésithérapeutes, pédicures-podologues",
          "Toutes les professions de santé",
          "Seulement les professions médicales"
        ],
        "correct": 1
      },
      {
        "question": "Que signifie EBM (Evidence Based Medicine) ?",
        "options": [
          "Médecine d''urgence basée sur l''expérience",
          "Médecine fondée sur les preuves scientifiques actuelles",
          "Médecine basée sur l''économie",
          "Médecine européenne de base"
        ],
        "correct": 1
      }
    ],
    "qru": [
      {
        "question": "Définissez la différence entre valeurs et normes professionnelles.",
        "reponse": "Les valeurs décrivent ce qui est digne d''estime et recommandé, les normes traduisent ces valeurs en principes concrets et règles spécifiques"
      }
    ],
    "qroc": [
      {
        "question": "Citez 3 valeurs cardinales de la profession médicale.",
        "points_cles": ["Responsabilité", "Dévouement", "Compassion", "Respect autonomie", "Indépendance", "Probité", "Discrétion", "Confraternité"]
      }
    ],
    "zap": [
      {
        "affirmation": "Le code de déontologie est rédigé uniquement par l''Ordre National des Médecins.",
        "correct": false,
        "justification": "Il est rédigé par l''ONM mais soumis au Conseil d''État, voté par le Parlement et publié au Journal Officiel."
      },
      {
        "affirmation": "Les psychologues sont listés parmi les professionnels de santé dans le Code de Santé Publique.",
        "correct": false,
        "justification": "Les psychologues sont des acteurs de santé indispensables mais ne sont pas listés parmi les professionnels de santé dans le CSP."
      }
    ]
  }',
  
  '{
    "10": "🏆 EXCELLENCE ! Maîtrise parfaite des valeurs professionnelles. Vous incarnez l''éthique médicale !",
    "8-9": "🌟 TRÈS BIEN ! Solide compréhension de l''écosystème professionnel. Quelques nuances à approfondir !",
    "< 8": "📚 À APPROFONDIR. Les bases sont présentes, continuez à explorer ces valeurs fondamentales."
  }',
  
  now(),
  now()
);
