
-- Mise à jour complète de l'item IC-4 avec les Blocs 5 et 6
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "Qualité et sécurité des soins - Rang A Complet",
    "sections": [
      {
        "title": "Fondamentaux qualité-sécurité",
        "concepts": [
          {
            "concept": "Qualité des soins",
            "definition": "Démarche d''amélioration continue des pratiques professionnelles au bénéfice de la sécurité des patients. 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
            "exemple": "Certification HAS, accréditation médecins, cellules qualité",
            "piege": "Ne pas confondre qualité et sécurité - sécurité = 1 des 7 dimensions",
            "mnemo": "SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité",
            "subtilite": "Écrire ce qu''on fait ET faire ce qu''on écrit",
            "application": "Participer démarche qualité, respecter traçabilité",
            "vigilance": "Qualité concerne TOUS les professionnels"
          },
          {
            "concept": "EIAS - Échelle de gravité",
            "definition": "5 niveaux : 1-Mineur (désagrément), 2-Intermédiaire (impact), 3-Majeur (soins), 4-Critique (interruption réversible), 5-Catastrophique (séquelles irréversibles)",
            "exemple": "Niveau 1: erreur rattrapée; Niveau 3: chute avec suture; Niveau 5: ablation mauvais organe",
            "piege": "Ne pas sous-estimer EIAS mineurs - révèlent failles système",
            "mnemo": "1-Désagrément 2-Impact 3-Soins 4-Arrêt 5-Séquelles",
            "subtilite": "40-50% des EIAS évitables - modèle fromage suisse",
            "application": "Classer et déclarer tous EIAS selon gravité",
            "vigilance": "Niveaux 4-5 = signalement externe obligatoire"
          }
        ]
      },
      {
        "title": "Hygiène et prévention",
        "concepts": [
          {
            "concept": "Hygiène des mains - SHA",
            "definition": "Friction hydroalcoolique = technique référence. Protocole 7 temps, 20-30 secondes, avant/après chaque soin. Exceptions : gale et C. difficile",
            "exemple": "SHA systématique avant/après contact patient, même avec gants",
            "piege": "Gants ne dispensent pas de l''hygiène des mains",
            "mnemo": "SHA = 7 temps 20-30 sec, Exceptions Gale + C. difficile",
            "subtilite": "Conditions : manches courtes, ongles courts, sans bijoux",
            "application": "Friction SHA systématique selon protocole",
            "vigilance": "Gale et C. difficile résistent SHA - lavage obligatoire"
          },
          {
            "concept": "Précautions standard",
            "definition": "Mesures systématiques pour TOUT patient : hygiène mains, gants si liquides biologiques, protection projections, masque si infection respiratoire",
            "exemple": "SHA avant/après, gants pour sang, masque si toux patient",
            "piege": "S''appliquent à TOUS - pas seulement patients infectés",
            "mnemo": "TOUT patient : Hygiène Gants Protection Masque AES",
            "subtilite": "Gants uniquement si risque contact liquides biologiques",
            "application": "Appliquer systématiquement quel que soit statut",
            "vigilance": "Changer gants entre patients"
          }
        ]
      },
      {
        "title": "Évaluation et amélioration",
        "concepts": [
          {
            "concept": "Certification établissements",
            "definition": "Mission HAS : évaluation qualité-sécurité par experts-visiteurs. 15 objectifs, 141 critères (15 impératifs + 111 standards + 5 avancés)",
            "exemple": "Visite experts sur 3 chapitres : patient, équipes, établissement",
            "piege": "Critères impératifs peuvent valoir refus certification",
            "mnemo": "HAS = 15 objectifs, 141 critères, 3 chapitres",
            "subtilite": "Critères avancés = futurs standards",
            "application": "Participer préparation certification",
            "vigilance": "15 critères impératifs = enjeu majeur"
          },
          {
            "concept": "DPC - Développement Professionnel Continu",
            "definition": "Obligation légale triennale depuis 2013. 3 types actions : cognitives, analyse pratiques, gestion risques. Minimum 2 actions/3 ans",
            "exemple": "Formation + groupe pairs + audit pratiques",
            "piege": "Obligation légale - pas simple formation volontaire",
            "mnemo": "DPC = 3 ans, 3 types, 2 minimum : Cognitif Analyse Risques",
            "subtilite": "Parcours défini par collège national professionnel",
            "application": "Respecter obligation, formations validées ANDPC",
            "vigilance": "Contrôle ordres (libéraux) ou employeurs (salariés)"
          }
        ]
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "Qualité et sécurité des soins - Rang B Expert Complet",
    "sections": [
      {
        "title": "Expertise économique et épidémiologique",
        "concepts": [
          {
            "concept": "Impact économique des EIAS",
            "analyse": "Coût global IAS : 760M€/an Europe. Coût/infection : 610-1370€ Europe, 1500-27340€ selon germe. Surcoût séjour : 900-25000€ (2/3 total). SARM vs SASM : +11k€",
            "cas": "Infection SARM : 30225€ vs SASM 19281€ vs témoin 11888€. Prolongation +6 à +20 jours selon germe",
            "ecueil": "Ne pas confondre coût antibiotiques (10-15%) et coût global IAS",
            "technique": "Évaluation médico-économique : coût direct + coût indirect (perte chance)",
            "distinction": "Coût évitable vs non évitable : 40-50% IAS évitables = économies potentielles majeures",
            "maitrise": "Calcul impact économique programmes prévention, ROI démontré",
            "excellence": "Argumentaire médico-économique pour financements prévention institutionnels"
          },
          {
            "concept": "Mécanismes avancés BMR/BHR",
            "analyse": "BMR multi-résistantes (BLSE, SARM) vs BHR hautement résistantes (EPC, ERV). Réservoirs : cutané (SARM), digestif (BLSE, ERV, EPC). Transmission : manuportée ++",
            "cas": "Épidémie EPC réanimation : transmission croisée mains soignants, environnement, défaut hygiène → cohorting + renforcement",
            "ecueil": "Ne pas confondre BMR et BHR - BHR = résistance supérieure, précautions renforcées",
            "technique": "Typage moléculaire confirmation transmission, enquête épidémiologique structurée",
            "distinction": "Résistance chromosomique (rare, stable) vs plasmidique (fréquente, transférable, instable)",
            "maitrise": "Investigation épidémiologique complète, mesures contrôle adaptées",
            "excellence": "Anticipation émergence résistances, stratégies préventives innovantes"
          }
        ]
      },
      {
        "title": "Leadership organisationnel",
        "concepts": [
          {
            "concept": "Analyse systémique EIAS",
            "analyse": "Méthode analyse approfondie modèle Reason (fromage suisse) : facteurs contributifs latents, défaillances organisationnelles au-delà erreur individuelle",
            "cas": "EIAS catastrophique (ablation mauvais organe) : défaillance check-list + formation + surcharge + communication équipe",
            "ecueil": "Éviter recherche bouc émissaire - erreur systémique multifactorielle",
            "technique": "Méthode ALARM : facteurs individuels, équipe, tâche, patient, environnement, organisation",
            "distinction": "Approche punitive (blâme individuel) vs systémique (amélioration collective)",
            "maitrise": "Analyse causale approfondie, actions correctives systémiques",
            "excellence": "Leadership culture juste et apprenante, transformation organisationnelle"
          },
          {
            "concept": "Structures prévention EIAS",
            "analyse": "Organisation 3 niveaux : Local (EOHH+CLIN/CME), Régional (CPIAS), National (PROPIAS+SPF). Coordination gestionnaire risques obligatoire depuis 2011",
            "cas": "Coordination EOHH-gestionnaire risques épidémie : investigation + mesures + communication + REX",
            "ecueil": "Ne pas confondre CLIN (obligatoire privé) et CME (remplace CLIN public)",
            "technique": "Surveillance active/passive/ciblée, indicateurs processus et résultats",
            "distinction": "Surveillance (ponctuelle, descriptive) vs monitoring (continue, analytique)",
            "maitrise": "Pilotage programme prévention IAS multidisciplinaire complet",
            "excellence": "Leadership systèmes surveillance innovants, transformation digitale qualité"
          }
        ]
      }
    ]
  }',
  scene_immersive = '{
    "title": "Scène immersive - Réunion certification HAS",
    "setting": "Salle de réunion direction, 9h00, préparation visite certification HAS dans 3 mois",
    "characters": [
      {
        "name": "Dr Martineau",
        "role": "Directeur médical",
        "personality": "Stratégique, rigoureux"
      },
      {
        "name": "Mme Legrand",
        "role": "Directrice qualité",
        "personality": "Experte, méthodique"
      },
      {
        "name": "Dr Rousseau",
        "role": "Référent EIAS",
        "personality": "Terrain, pragmatique"
      }
    ],
    "dialogue": [
      {
        "speaker": "Dr Martineau",
        "text": "La certification HAS approche. Mme Legrand, où en sommes-nous sur les 15 objectifs et leurs 141 critères ?",
        "emotion": "concentré"
      },
      {
        "speaker": "Mme Legrand", 
        "text": "Nous avons identifié 3 critères impératifs à risque. Le plus critique : notre taux IQSS SHA encore insuffisant à 68% vs objectif 75%.",
        "emotion": "préoccupé"
      },
      {
        "speaker": "Dr Rousseau",
        "text": "Nos EIAS niveau 4-5 sont bien signalés, mais l''analyse causale reste trop superficielle. Il faut creuser le modèle de Reason.",
        "emotion": "analytique"
      },
      {
        "speaker": "Mme Legrand",
        "text": "Exactement. Les experts-visiteurs vont chercher la culture sécurité, pas juste les chiffres. Notre démarche qualité doit être vécue.",
        "emotion": "pédagogique"
      },
      {
        "speaker": "Dr Martineau",
        "text": "Plan d''action : formation SHA renforcée, RMM systématique sur EIAS, et surtout : que chaque professionnel comprenne son rôle qualité.",
        "emotion": "décisionnel"
      }
    ],
    "learning_points": [
      "Certification HAS : 15 objectifs, 141 critères dont 15 impératifs",
      "IQSS publics et impact financement",
      "Analyse systémique EIAS vs approche superficielle",
      "Culture qualité-sécurité comme enjeu majeur certification"
    ]
  }',
  quiz_questions = '{
    "questions": [
      {
        "id": 1,
        "question": "Combien de critères impératifs peuvent valoir un refus de certification HAS ?",
        "options": [
          "5 critères impératifs",
          "15 critères impératifs",
          "25 critères impératifs",
          "50 critères impératifs"
        ],
        "correct": 1,
        "explanation": "Il y a 15 critères impératifs dont la non-validation peut valoir un refus de certification HAS, sur un total de 141 critères."
      },
      {
        "id": 2,
        "question": "Quelle est la durée d''une friction SHA correctement réalisée ?",
        "options": [
          "10-15 secondes",
          "20-30 secondes",
          "45-60 secondes",
          "1-2 minutes"
        ],
        "correct": 1,
        "explanation": "La friction SHA se réalise selon le protocole en 7 temps pour une durée minimale de 20 à 30 secondes."
      },
      {
        "id": 3,
        "question": "Quel est le coût annuel des IAS en Europe ?",
        "options": [
          "150 millions d''euros",
          "760 millions d''euros",
          "1,2 milliard d''euros",
          "2,5 milliards d''euros"
        ],
        "correct": 1,
        "explanation": "Le coût global des infections associées aux soins est estimé à 760 millions d''euros par an en Europe."
      },
      {
        "id": 4,
        "question": "Combien d''actions minimum doit justifier un professionnel pour son DPC sur 3 ans ?",
        "options": [
          "1 action",
          "2 actions",
          "3 actions",
          "4 actions"
        ],
        "correct": 1,
        "explanation": "Le professionnel doit justifier de 2 actions minimum sur 3 ans parmi les 3 types : cognitives, analyse des pratiques, gestion des risques."
      }
    ]
  }'
WHERE slug = 'ic4-qualite-securite-soins';
