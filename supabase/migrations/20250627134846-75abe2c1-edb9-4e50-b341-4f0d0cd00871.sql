
-- Insérer l'item IC-4 complet dans la base de données
INSERT INTO edn_items_immersive (
  slug,
  item_code,
  title,
  subtitle,
  pitch_intro,
  tableau_rang_a,
  tableau_rang_b,
  scene_immersive,
  paroles_musicales,
  interaction_config,
  quiz_questions,
  reward_messages,
  visual_ambiance,
  audio_ambiance
) VALUES (
  'ic4-qualite-securite-soins',
  'IC-4',
  'Qualité et sécurité des soins',
  'La sécurité du patient • Gestion des risques • EIAS • Démarche qualité',
  'Maîtrisez les fondamentaux de la qualité et sécurité des soins : des EIAS aux précautions d''hygiène, en passant par la démarche qualité. Un item essentiel pour garantir la sécurité de vos patients et optimiser vos pratiques professionnelles.',
  '{
    "theme": "Qualité et sécurité des soins - Rang A",
    "sections": [
      {
        "title": "Définitions fondamentales",
        "concepts": [
          {
            "concept": "Qualité des soins",
            "definition": "Démarche d''amélioration continue des pratiques professionnelles au bénéfice de la sécurité des patients, par gestion optimisée des risques. 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
            "exemple": "Certification des établissements de santé et accréditation des médecins - Cellule qualité avec qualiticiennes/qualiticiens",
            "piege": "Ne pas confondre qualité et sécurité - la sécurité n''est qu''une des 7 dimensions de la qualité",
            "mnemo": "SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité",
            "subtilite": "Principe majeur : écrire ce qu''on fait (traçabilité) ET faire ce qu''on écrit (respect procédures)",
            "application": "Participer activement à la démarche qualité de l''établissement, respecter la traçabilité",
            "vigilance": "La qualité concerne TOUS les professionnels, pas seulement les qualiticiennes/qualiticiens"
          },
          {
            "concept": "Sécurité des patients",
            "definition": "Absence pour un patient d''atteinte inutile ou potentielle associée aux soins de santé (OMS 2009). Maximisation des bénéfices ET minimalisation des risques",
            "exemple": "Prévention des chutes, des erreurs médicamenteuses, des infections nosocomiales",
            "piege": "Ne pas oublier que sécurité = maximisation bénéfices ET minimalisation risques (double objectif)",
            "mnemo": "SÉCURITÉ = Sans Erreur Contre Utilisateur Risque Inutile Thérapeutique Évitable",
            "subtilite": "La sécurité parfaite n''existe pas - il faut équilibrer bénéfice/risque",
            "application": "Évaluer systématiquement le rapport bénéfice/risque de chaque intervention",
            "vigilance": "Tout acte médical comporte des risques - informer le patient"
          }
        ]
      },
      {
        "title": "EIAS - Classification et gravité",
        "concepts": [
          {
            "concept": "EIAS (Événement Indésirable Associé aux Soins)",
            "definition": "Événement ayant entraîné ou aurait pu entraîner un préjudice à un patient, survenu lors de prévention, investigation ou traitement. Concerne 1 patient/2 jours en médecine générale, 10% des hospitalisations",
            "exemple": "Erreur d''identification rattrapée (niveau 1), chute avec plaie nécessitant suture (niveau 3), ablation du mauvais rein (niveau 5)",
            "piege": "Ne pas confondre EIAS et EIG - EIG = sous-catégorie d''EIAS avec critères de gravité spécifiques",
            "mnemo": "EIAS = 5 niveaux : Mineur Intermédiaire Majeur Critique catastrophiQue",
            "subtilite": "Modèle du fromage suisse de Reason - conjonction de plusieurs facteurs, échec des verrous",
            "application": "Déclarer tout EIAS selon le niveau de gravité, analyser les causes",
            "vigilance": "40-50% des EIAS sont évitables - focus sur la prévention"
          },
          {
            "concept": "Échelle de gravité EIAS",
            "definition": "5 niveaux : 1-Mineur (désagrément simple), 2-Intermédiaire (impact sans danger), 3-Majeur (soins spécifiques), 4-Critique (interruption traitement, réversible), 5-Catastrophique (séquelles irréversibles)",
            "exemple": "Niveau 1: erreur identité rattrapée; Niveau 3: chute avec suture; Niveau 5: amputation mauvais membre",
            "piege": "Ne pas sous-estimer les EIAS mineurs - ils révèlent les failles du système",
            "mnemo": "1-Désagrément 2-Impact 3-Soins 4-Arrêt 5-Séquelles",
            "subtilite": "La différence entre niveau 4 et 5 est la réversibilité des conséquences",
            "application": "Classer systématiquement chaque EIAS selon cette échelle",
            "vigilance": "EIAS niveau 4-5 nécessitent signalement externe obligatoire"
          }
        ]
      }
    ]
  }',
  '{
    "theme": "Qualité et sécurité des soins - Rang B Expert",
    "sections": [
      {
        "title": "Analyse décisionnelle avancée des EIAS",
        "concepts": [
          {
            "concept": "Analyse systémique des EIAS",
            "analyse": "Méthode d''analyse approfondie des EIAS utilisant le modèle de Reason (fromage suisse) pour identifier les facteurs contributifs latents et les défaillances organisationnelles au-delà de l''erreur individuelle",
            "cas": "EIAS catastrophique (ablation mauvais rein) : analyse révélant défaillance check-list, formation insuffisante, surcharge travail, communication défaillante équipe",
            "ecueil": "Éviter la recherche de bouc émissaire - l''erreur est souvent systémique",
            "technique": "Méthode ALARM : identifier facteurs contributifs (individuels, équipe, tâche, patient, environnement, organisation)",
            "distinction": "Approche punitive vs Approche systémique : blâme individuel vs amélioration collective",
            "maitrise": "Savoir mener une analyse causale approfondie et proposer des actions correctives",
            "excellence": "Leadership dans la promotion d''une culture juste et apprenante"
          }
        ]
      }
    ]
  }',
  '{
    "title": "Scène immersive - Service de médecine",
    "setting": "Service de médecine interne, 14h30, équipe en staff qualité hebdomadaire",
    "characters": [
      {
        "name": "Dr Martin",
        "role": "Chef de service",
        "personality": "Rigoureux, soucieux de la qualité"
      },
      {
        "name": "Mme Dubois",
        "role": "Qualiticienne",
        "personality": "Méthodique, pédagogue"
      },
      {
        "name": "IDE Sophie",
        "role": "Infirmière référente",
        "personality": "Expérimentée, pragmatique"
      }
    ],
    "dialogue": [
      {
        "speaker": "Dr Martin",
        "text": "Nous avons eu 3 EIAS cette semaine. Sophie, peux-tu nous présenter le cas de Mme Leroux ?",
        "emotion": "sérieux"
      },
      {
        "speaker": "IDE Sophie",
        "text": "Patiente de 78 ans, chute nocturne avec fracture du col du fémur. Niveau 4 sur notre échelle - interruption du traitement initial.",
        "emotion": "préoccupé"
      },
      {
        "speaker": "Mme Dubois",
        "text": "Parfait exemple d''EIAS évitable. L''évaluation du risque de chute était-elle à jour ? Les précautions ont-elles été respectées ?",
        "emotion": "professionnel"
      },
      {
        "speaker": "IDE Sophie",
        "text": "C''est là le problème... L''évaluation n''avait pas été actualisée après l''introduction du nouveau traitement sédatif.",
        "emotion": "embarrassé"
      },
      {
        "speaker": "Dr Martin",
        "text": "Voilà un parfait exemple du modèle de Reason - plusieurs verrous ont failli : évaluation, transmission, surveillance.",
        "emotion": "pédagogique"
      }
    ],
    "learning_points": [
      "Classification EIAS par niveau de gravité",
      "Notion d''évitabilité (40-50% des EIAS)",
      "Modèle du fromage suisse de Reason",
      "Importance de l''évaluation continue des risques"
    ]
  }',
  ARRAY[
    '[Couplet 1]
Dans les couloirs de l''hôpital, la qualité guide nos pas
Chaque geste, chaque protocole, pour que l''erreur ne soit plus là
EIAS, ces événements qu''on veut éviter
Niveau 1 à 5, il faut les classifier

[Refrain]
Qualité, sécurité, notre mission sacrée
Protéger le patient, c''est notre vérité
De l''hygiène des mains aux précautions standard
La démarche qualité, c''est notre engagement

[Couplet 2]
BMR, BHR, ces bactéries résistantes
Transmission par contact, voie aéroportée méfiante
SHA, cette friction qui sauve des vies
Sept temps, vingt secondes, geste anti-infectieux accompli',
    '[Pont]
SARM, BLSE, ces sigles qu''il faut connaître
Précautions complémentaires pour les maîtriser
Contact, gouttelettes ou transmission par l''air
Chaque mode a ses règles, ses mesures à appliquer

[Refrain final]
Démarche qualité, amélioration continue
PDCA, notre méthode, notre habitude
Certification, accréditation, IQSS à surveiller
Pour la sécurité patient, toujours progresser'
  ],
  '{
    "title": "Interaction - Classification des EIAS",
    "type": "drag_drop",
    "instructions": "Classez chaque situation selon le niveau de gravité EIAS (1 à 5)",
    "items": [
      {
        "id": "eias1",
        "content": "Erreur d''identité patient rattrapée avant administration médicament",
        "category": "Niveau 1 - Mineur"
      },
      {
        "id": "eias2", 
        "content": "Oubli prescription jeûne → report intervention chirurgicale",
        "category": "Niveau 2 - Intermédiaire"
      },
      {
        "id": "eias3",
        "content": "Chute patient avec plaie nécessitant points de suture",
        "category": "Niveau 3 - Majeur"
      },
      {
        "id": "eias4",
        "content": "Bêtabloquant chez asthmatique → insuffisance respiratoire réversible",
        "category": "Niveau 4 - Critique"
      },
      {
        "id": "eias5",
        "content": "Erreur de côté → ablation rein fonctionnel au lieu du tumoral",
        "category": "Niveau 5 - Catastrophique"
      }
    ],
    "categories": [
      "Niveau 1 - Mineur",
      "Niveau 2 - Intermédiaire", 
      "Niveau 3 - Majeur",
      "Niveau 4 - Critique",
      "Niveau 5 - Catastrophique"
    ]
  }',
  '{
    "questions": [
      {
        "id": 1,
        "question": "Quel pourcentage des EIAS sont considérés comme évitables ?",
        "options": [
          "20-30%",
          "40-50%", 
          "60-70%",
          "80-90%"
        ],
        "correct": 1,
        "explanation": "40 à 50% des EIAS seraient évitables, c''est-à-dire résultent d''une erreur et/ou d''une faille dans les dispositifs de sécurité."
      },
      {
        "id": 2,
        "question": "Quelle est la technique de référence pour l''hygiène des mains ?",
        "options": [
          "Lavage au savon doux",
          "Friction hydroalcoolique (SHA)",
          "Lavage puis SHA",
          "Désinfection à la Bétadine"
        ],
        "correct": 1,
        "explanation": "La friction hydroalcoolique (SHA) est la technique de référence qui doit remplacer le lavage des mains en toutes circonstances (sauf gale et C. difficile)."
      },
      {
        "id": 3,
        "question": "Combien de temps dure une friction SHA correctement réalisée ?",
        "options": [
          "10-15 secondes",
          "20-30 secondes",
          "45-60 secondes", 
          "1-2 minutes"
        ],
        "correct": 1,
        "explanation": "La friction SHA se réalise selon le protocole en 7 temps pour une durée minimale de 20 à 30 secondes."
      }
    ]
  }',
  '{
    "completion": [
      "🎯 Excellente maîtrise de l''item IC-4 !",
      "🏆 Vous maîtrisez parfaitement la qualité et sécurité des soins",
      "⭐ Expert en EIAS, précautions d''hygiène et démarche qualité !"
    ],
    "encouragement": [
      "💪 La sécurité patient n''a plus de secret pour vous !",
      "🔥 Prêt(e) pour l''excellence en qualité des soins !",
      "🎓 Niveau expert atteint - félicitations !"
    ]
  }',
  '{
    "mood": "professional_medical",
    "colors": ["#2563eb", "#dc2626", "#059669", "#d97706"],
    "atmosphere": "hospital_quality_department"
  }',
  '{
    "type": "ambient_hospital",
    "tracks": ["medical_ambiance", "quality_focus"],
    "volume": 0.3
  }'
);
