
-- Mettre à jour l'item IC-1 avec le contenu officiel du cours
UPDATE edn_items_immersive 
SET 
  title = 'La relation médecin-malade dans le cadre du colloque singulier',
  subtitle = 'IC-1 - Fiche LiSA',
  pitch_intro = 'La relation médecin-malade évolue d''une approche paternaliste vers une approche centrée sur le patient, où ce dernier devient un véritable partenaire du soin. Cette transformation implique une compréhension globale bio-médico-psychosociale et l''intégration de l''expérience vécue du patient.',
  
  tableau_rang_a = '{
    "theme": "Fondamentaux de la relation médecin-malade - Rang A",
    "colonnes": [
      "Définition relation",
      "Déterminants",
      "Corrélats cliniques", 
      "Approche centrée patient",
      "Représentations maladie",
      "Information patient",
      "Ajustement stress",
      "Mécanismes défense"
    ],
    "lignes": [
      [
        "Rencontre soignant-soigné",
        "Finalités convergentes",
        "Performance diagnostique",
        "Partenariat basé complémentarité",
        "Image de la maladie",
        "Qualité de la relation",
        "Adaptation centrale",
        "Défense face souffrance"
      ],
      [
        "Approche paternaliste → globale",
        "Patient + médecin + société",
        "Amélioration paramètres",
        "Expertise + expérience",
        "Représentations différentes",
        "Compétence communication",
        "Stratégies coping",
        "Attitudes inconscientes"
      ],
      [
        "Bio-médico-psychosociale",
        "Domaines éthique/social/psycho",
        "Stabilisation chroniques",
        "Personnalisation soins",
        "Expériences vécues",
        "Verbal + non-verbal",
        "Maîtrise conséquences",
        "Isolation/Déplacement"
      ],
      [
        "Centrée sur patient",
        "Respect dignité liberté",
        "Indicateurs santé",
        "Écoute dialogue adaptation",
        "Impact entourage",
        "Facteurs contextuels",
        "Bien-être physique/psychique",
        "Projection/Régression"
      ],
      [
        "Partenaire du soin",
        "Difficultés linguistiques",
        "Démarche diagnostique",
        "Développement compétences",
        "Conséquences biomédicales",
        "Processus collaboratif",
        "Événement inquiétant",
        "Déni réalité"
      ]
    ]
  }',
  
  tableau_rang_b = '{
    "theme": "Approfondissements pratiques - Rang B",
    "colonnes": [
      "4 dimensions ACP",
      "Empathie clinique",
      "Alliance thérapeutique",
      "Changement Prochaska",
      "Entretien motivationnel",
      "Communication adaptée",
      "Annonce mauvaise nouvelle",
      "Habiletés pratiques"
    ],
    "lignes": [
      [
        "Explorer maladie/expérience",
        "Apprécier état émotionnel",
        "Résultat pratique ACP",
        "Cycle motivation",
        "Méthode communication",
        "Relation aide écoute",
        "Change idée être/avenir",
        "Questions ouvertes"
      ],
      [
        "Comprendre globalité",
        "Mettre côté schéma personnel",
        "Consultations successives",
        "Précontemplation → Action",
        "Centré sur personne",
        "30% mots / 70% non-verbal",
        "Faire savoir + cheminer",
        "Respect silences"
      ],
      [
        "Terrain entente commun",
        "Comprendre sans vivre",
        "Patient acteur santé",
        "Étapes par étapes",
        "Motivation intrinsèque",
        "Regard sourire tenue",
        "Projet personnalisé",
        "Questions fermées"
      ],
      [
        "Décision partagée",
        "Accepter sans subir",
        "Posture facilitatrice",
        "Maintien vs rechute",
        "Collaboratif orienté",
        "Habilités communicationnelles",
        "Structuration 3 étapes",
        "Reformulations"
      ],
      [
        "Alliance thérapeutique",
        "Fonction soignante",
        "Changement réflexion",
        "Repérage stade motivationnel",
        "Objectif partagé",
        "Processus constructif",
        "Temps écoute mots",
        "Verbaliser réalité"
      ]
    ]
  }',
  
  scene_immersive = '{
    "description": "Dans le cabinet médical, deux mondes se rencontrent : l''expertise biomédicale du praticien et l''expérience vécue du patient. Cette rencontre transforme une simple consultation en un véritable partenariat thérapeutique.",
    "mots_cles": [
      "Empathie",
      "Alliance",
      "Écoute",
      "Respect",
      "Partenariat",
      "Compréhension",
      "Dignité",
      "Communication"
    ],
    "effet": "La qualité de cette relation influence directement les résultats de santé et la satisfaction des deux parties."
  }',
  
  paroles_musicales = ARRAY[
    'Verse 1:\nDans le cabinet, deux regards se croisent\nL''un cherche à comprendre, l''autre à être compris\nPlus qu''un simple soin, une alliance se tisse\nEntre l''art médical et l''humain qui se livre',
    
    'Refrain:\nÉcouter, respecter, accompagner\nAu-delà des mots, savoir décrypter\nL''empathie guide, la confiance grandit\nDans cette danse où chacun s''enrichit',
    
    'Verse 2:\nFini le temps du médecin qui décide seul\nPlace au partenariat, à la décision partagée\nLe patient devient acteur de sa santé\nSon expérience vécue, trésor à partager',
    
    'Pont:\nTrois finalités convergent ici\nPatient, médecin, société\nDans ce colloque si singulier\nOù l''humain reprend ses droits'
  ],
  
  interaction_config = '{
    "type": "association",
    "description": "Associez chaque situation clinique avec le concept théorique correspondant de la relation médecin-malade.",
    "exemples": [
      {
        "phrase": "Le patient exprime : \"Docteur, j''ai peur que ce soit grave\"",
        "concept": "Gestion des représentations de la maladie"
      },
      {
        "phrase": "\"Comment envisagez-vous la suite de votre traitement ?\"",
        "concept": "Question ouverte - Communication adaptée"
      },
      {
        "phrase": "Le médecin reformule : \"Si je comprends bien, vous ressentez...\"",
        "concept": "Technique de reformulation"
      },
      {
        "phrase": "\"Je comprends que cette nouvelle soit difficile à accepter\"",
        "concept": "Expression d''empathie clinique"
      },
      {
        "phrase": "Patient qui refuse catégoriquement le diagnostic",
        "concept": "Mécanisme de défense : Déni"
      },
      {
        "phrase": "\"Nous allons décider ensemble du meilleur traitement\"",
        "concept": "Approche centrée patient - Décision partagée"
      }
    ],
    "feedback": "Excellente maîtrise des concepts ! La relation médecin-malade repose sur ces interactions concrètes du quotidien."
  }',
  
  quiz_questions = '{
    "qcm": [
      {
        "question": "Selon l''approche centrée patient (ACP), quelles sont les 4 dimensions de la démarche clinique ?",
        "options": [
          "Diagnostiquer, traiter, surveiller, guérir",
          "Explorer, comprendre, s''entendre, développer alliance",
          "Interroger, examiner, prescrire, contrôler",
          "Informer, rassurer, soigner, accompagner"
        ],
        "correct": 1
      },
      {
        "question": "Dans la communication médecin-patient, quelle est la répartition approximative entre verbal et non-verbal ?",
        "options": [
          "50% verbal / 50% non-verbal",
          "70% verbal / 30% non-verbal", 
          "30% verbal / 70% non-verbal",
          "90% verbal / 10% non-verbal"
        ],
        "correct": 2
      }
    ],
    "qru": [
      {
        "question": "Définissez en une phrase l''empathie clinique.",
        "reponse": "comprendre sans vivre la situation du patient"
      }
    ],
    "qroc": [
      {
        "question": "Citez 2 mécanismes de défense couramment observés lors de l''annonce d''une mauvaise nouvelle.",
        "points_cles": ["Déni", "Projection", "Régression", "Isolation", "Déplacement"]
      }
    ],
    "zap": [
      {
        "affirmation": "L''alliance thérapeutique se construit dès la première consultation.",
        "correct": false,
        "justification": "L''alliance thérapeutique est le résultat de la mise en pratique de l''ACP au cours des consultations successives, elle se développe dans le temps."
      },
      {
        "affirmation": "Dans le cycle de Prochaska, un patient peut passer directement de la précontemplation à l''action.",
        "correct": false,
        "justification": "Le cycle se parcourt le plus souvent étape par étape : précontemplation → contemplation → préparation → action."
      }
    ]
  }',
  
  reward_messages = '{
    "10": "🏆 EXCELLENCE ! Maîtrise parfaite de la relation médecin-malade. Vous incarnez les valeurs du colloque singulier !",
    "8-9": "🌟 TRÈS BIEN ! Solide compréhension des enjeux relationnels. Quelques approfondissements et vous y êtes !",
    "< 8": "📚 À APPROFONDIR. Les bases sont là, continuez à explorer ces concepts fondamentaux de la pratique médicale."
  }',
  
  updated_at = now()
WHERE slug = 'relation-medecin-malade';
