
-- Mise à jour des tableaux pour qu'ils soient exhaustifs et ergonomiques
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "Fondamentaux de la relation médecin-malade - Rang A",
    "colonnes": [
      "Définition relation médecin-malade",
      "Déterminants principaux",
      "Corrélats cliniques",
      "Approche centrée patient",
      "Représentations maladie",
      "Information patient",
      "Ajustement au stress",
      "Mécanismes défense",
      "Empathie clinique"
    ],
    "lignes": [
      [
        "Rencontre soignant-soigné",
        "Convergence 3 finalités",
        "Performance diagnostique",
        "Partenariat expertise-expérience",
        "Image personnelle maladie",
        "Qualité relation",
        "Adaptation au stress",
        "Défense face souffrance",
        "Apprécier état émotionnel"
      ],
      [
        "Paternaliste → globale",
        "Patient-médecin-société",
        "Amélioration paramètres",
        "Personnalisation soins",
        "Expériences différentes",
        "Compétence communication",
        "Stratégies coping",
        "Attitudes + ou - conscientes",
        "Mettre côté schéma personnel"
      ],
      [
        "Bio-médico-psychosociale",
        "Éthique-social-psycho",
        "Stabilisation chroniques",
        "Écoute-dialogue-adaptation",
        "Conséquences biomédicales",
        "Verbal + non-verbal",
        "Maîtrise conséquences",
        "Isolation des cognitions",
        "Comprendre sans vivre"
      ],
      [
        "Centrée sur patient",
        "Respect dignité liberté",
        "Indicateurs santé",
        "Développement compétences",
        "Impact entourage",
        "Facteurs contextuels",
        "Bien-être physique-psychique",
        "Déplacement souffrance",
        "Accepter sans subir"
      ],
      [
        "Patient partenaire soin",
        "Difficultés linguistiques",
        "Démarche diagnostique",
        "Continuité des soins",
        "Vécu expérience",
        "Processus collaboratif",
        "Événement inquiétant",
        "Projection inconsciente",
        "Fonction soignante"
      ],
      [
        "Intégration expérience vécue",
        "Éléments culturels-religieux",
        "Relation thérapeutique",
        "4 dimensions ACP",
        "Représentations médecin-patient",
        "Rétroactions qualité",
        "Procédures adaptation",
        "Régression stade antérieur",
        "Engagement verbal-non verbal"
      ],
      [
        "Approche globale",
        "Niveau éducatif",
        "Amélioration suivi",
        "Explorer-comprendre-entendre",
        "Positives ou négatives",
        "Mise en forme information",
        "Processus individuels",
        "Déni réalité traumatisante",
        "Conviction souffrance patient"
      ]
    ]
  }',
  
  tableau_rang_b = '{
    "theme": "Approfondissements et outils pratiques - Rang B",
    "colonnes": [
      "4 dimensions ACP détaillées",
      "Alliance thérapeutique",
      "Cycle Prochaska-DiClemente",
      "Entretien motivationnel",
      "Communication adaptée",
      "Annonce mauvaise nouvelle",
      "Habiletés communicationnelles",
      "Mécanismes défense détaillés",
      "Posture empathique"
    ],
    "lignes": [
      [
        "Explorer maladie/expérience",
        "Résultat pratique ACP",
        "Précontemplation",
        "Méthode communication",
        "30% verbal 70% non-verbal",
        "Change idée être/avenir",
        "Questions ouvertes",
        "Isolation cognitions",
        "Se sentir écouté compris"
      ],
      [
        "Comprendre globalité",
        "Consultations successives",
        "Contemplation/intention",
        "Centrée sur personne",
        "Regard sourire tenue",
        "Faire savoir + cheminer",
        "Respect des silences",
        "Déplacement symptômes",
        "Attitude professionnelle"
      ],
      [
        "Terrain entente commun",
        "Patient acteur santé",
        "Préparation changement",
        "Motivation intrinsèque",
        "Relation aide écoute",
        "Projet personnalisé",
        "Questions fermées",
        "Projection sentiments",
        "Protection sympathie/antipathie"
      ],
      [
        "Décision partagée",
        "Posture facilitatrice",
        "Action comportement",
        "Collaboratif orienté",
        "Habiletés communicationnelles",
        "3 étapes structuration",
        "Reformulations",
        "Régression développement",
        "Renforcement alliance"
      ],
      [
        "Développer alliance",
        "Changement réflexion",
        "Maintien vs rechute",
        "Objectif partagé",
        "Processus constructif",
        "Avant-pendant-après",
        "Verbaliser réalité",
        "Déni inconscient",
        "Comprendre expression"
      ],
      [
        "Perspective médecin-patient",
        "Véritable acteur santé",
        "Étapes par étapes",
        "Éducation du patient",
        "Collaboration rétroactions",
        "Représentation diagnostic",
        "Prise conscience",
        "Forme adaptation angoisses",
        "Minimum engagement"
      ],
      [
        "Démarche biomédicale",
        "Faciliter apprentissages",
        "Repérage stade motivationnel",
        "Logique apprentissage",
        "Temporalité lieu",
        "Information adaptée",
        "Se sentir écouté",
        "Vivre moins douloureusement",
        "Conviction souffrance"
      ]
    ]
  }',
  
  updated_at = now()
WHERE slug = 'relation-medecin-malade';
