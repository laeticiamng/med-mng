
-- Mise à jour complète de l'item IC-4 avec le contenu complet
UPDATE edn_items_immersive 
SET 
  tableau_rang_a = '{
    "theme": "IC-4 Rang A - Qualité et sécurité des soins (13 concepts)",
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
            "concept": "Sécurité des soins",
            "definition": "Absence de dommage évitable associé aux soins de santé (OMS 2009). Prévention des risques et gestion des événements indésirables",
            "exemple": "Checklists chirurgicales, protocoles sécurisés, culture non punitive",
            "piege": "Sécurité ≠ absence totale de risque mais réduction des risques évitables",
            "mnemo": "OMS 2009 : Absence Dommage Évitable Associé Soins",
            "subtilite": "Approche systémique vs individuelle des erreurs",
            "application": "Signalement EIAS, participation RMM, respect protocoles",
            "vigilance": "Culture juste vs culture punitive"
          },
          {
            "concept": "EIAS - Définition et évitabilité",
            "definition": "Événement Indésirable Associé aux Soins : événement défavorable survenant lors de soins. 40-50% évitables selon littérature",
            "exemple": "Infection nosocomiale, chute, erreur médicamenteuse, escarre",
            "piege": "Tout événement défavorable ≠ EIAS (distinction avec complication)",
            "mnemo": "EIAS = Événements + Indésirable + Associé + Soins",
            "subtilite": "Distinction EIAS évitable/non évitable cruciale pour analyse",
            "application": "Déclaration systématique, analyse causale, actions correctives",
            "vigilance": "Ne pas confondre avec les complications attendues"
          },
          {
            "concept": "EIAS - Échelle de gravité",
            "definition": "5 niveaux : 1-Mineur (désagrément), 2-Intermédiaire (impact), 3-Majeur (soins), 4-Critique (interruption réversible), 5-Catastrophique (séquelles irréversibles)",
            "exemple": "Niveau 1: erreur rattrapée; Niveau 3: chute avec suture; Niveau 5: ablation mauvais organe",
            "piege": "Ne pas sous-estimer EIAS mineurs - révèlent failles système",
            "mnemo": "1-Désagrément 2-Impact 3-Soins 4-Arrêt 5-Séquelles",
            "subtilite": "Niveaux 4-5 nécessitent signalement externe obligatoire",
            "application": "Classer selon gravité, adapter réponse et signalement",
            "vigilance": "Évaluation gravité doit être objective et documentée"
          },
          {
            "concept": "Antisepsie - Définition",
            "definition": "Méthode chimique ou physique destinée à éliminer ou tuer les micro-organismes et/ou inactiver les virus sur les tissus vivants",
            "exemple": "Désinfection peau avant injection, préparation champ opératoire",
            "piege": "Antisepsie = tissus vivants ≠ désinfection (surfaces inertes)",
            "mnemo": "Anti-Septique = CONTRE micro-organismes sur tissus VIVANTS",
            "subtilite": "Spectre d''action variable selon antiseptique utilisé",
            "application": "Préparation peau, muqueuses, plaies selon protocole",
            "vigilance": "Respecter temps de contact et contre-indications"
          },
          {
            "concept": "Antisepsie - Modalités",
            "definition": "Règles d''application : peau saine (détersion + rinçage + séchage + antisepsie), muqueuses (antisepsie directe), plaies (irrigation + antisepsie)",
            "exemple": "Injection : savon + rinçage + SHA ou antiseptique alcoolique",
            "piege": "Ordre des étapes crucial : détersion AVANT antisepsie",
            "mnemo": "D.R.S.A : Détersion Rinçage Séchage Antisepsie",
            "subtilite": "Adaptation selon type de peau et acte à réaliser",
            "application": "Respecter protocole selon site et type d''intervention",
            "vigilance": "Temps de contact minimum requis pour efficacité"
          },
          {
            "concept": "Asepsie - Définition et règles",
            "definition": "Ensemble des méthodes préventives pour éviter toute contamination microbienne d''un site initialement stérile",
            "exemple": "Bloc opératoire, pose cathéter central, préparation injectable",
            "piege": "Asepsie = prévention contamination ≠ antisepsie (élimination)",
            "mnemo": "A-Septique = SANS micro-organismes (prévention)",
            "subtilite": "Concept de gradient de stérilité selon les zones",
            "application": "Techniques stériles, champs opératoires, gestes codifiés",
            "vigilance": "Rupture d''asepsie = recommencer procédure"
          },
          {
            "concept": "Détersion - Définition et règles",
            "definition": "Élimination par action mécanique et chimique des salissures, souillures et micro-organismes présents en surface",
            "exemple": "Lavage chirurgical des mains, nettoyage plaie, préparation peau",
            "piege": "Détersion ≠ désinfection (élimination mécanique vs chimique)",
            "mnemo": "Détersion = Décoller + Éliminer mécaniquement",
            "subtilite": "Efficacité dépend de la friction et du temps d''action",
            "application": "Préalable obligatoire à toute antisepsie/désinfection",
            "vigilance": "Eau + tensioactif + action mécanique indispensables"
          },
          {
            "concept": "Désinfection - Définition et règles",
            "definition": "Opération au résultat momentané permettant d''éliminer ou tuer les micro-organismes et/ou inactiver les virus portés par des milieux inertes",
            "exemple": "Désinfection surfaces, matériel, dispositifs médicaux",
            "piege": "Désinfection = milieux inertes ≠ antisepsie (tissus vivants)",
            "mnemo": "Désinfection = Destruction sur milieux INERTES",
            "subtilite": "Spectre d''action et temps de contact variables",
            "application": "Protocoles selon type de surface et niveau de risque",
            "vigilance": "Détersion préalable obligatoire pour efficacité"
          },
          {
            "concept": "Règles utilisation antiseptiques",
            "definition": "Ne pas mélanger, respecter péremption, éviter contamination, appliquer sur peau saine de préférence, respecter temps de contact",
            "exemple": "1 antiseptique = 1 indication, stockage approprié, application uniforme",
            "piege": "Mélange antiseptiques peut créer interactions dangereuses",
            "mnemo": "1 antiseptique, 1 usage, 1 fois, temps respecté",
            "subtilite": "Certains antiseptiques inactivés par matières organiques",
            "application": "Choix selon spectre, site, tolérance, efficacité",
            "vigilance": "Vérifier compatibilité et absence d''allergie"
          },
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
            "concept": "IAS - Définition",
            "definition": "Infection Associée aux Soins : infection survenant au cours ou décours d''une prise en charge et absente à l''admission (sauf si liée à soins antérieurs)",
            "exemple": "Infection urinaire sur sonde, pneumonie sous ventilation, ISO",
            "piege": "IAS ≠ infection communautaire (délai et lien avec soins)",
            "mnemo": "IAS = Infection + Associée + Soins (absente à l''admission)",
            "subtilite": "Distinction IAS endogène/exogène selon origine",
            "application": "Surveillance, prévention, investigation si épidémie",
            "vigilance": "Délai d''apparition variable selon type d''infection"
          },
          {
            "concept": "Ministère Affaires Sociales et Santé",
            "definition": "Ministère chargé de la politique de santé publique, organisation du système de santé, réglementation sanitaire et sociale",
            "exemple": "Directions : DGS, DGOS, DSS, DREES pour pilotage politique santé",
            "piege": "Distinguer ministère (politique) et agences techniques (HAS, ANSM)",
            "mnemo": "Ministère = Politique + Réglementation + Organisation",
            "subtilite": "Articulation avec ARS pour mise en œuvre territoriale",
            "application": "Réglementations, circulaires, plans nationaux de santé",
            "vigilance": "Évolutions réglementaires régulières à suivre"
          }
        ]
      }
    ]
  }',
  tableau_rang_b = '{
    "theme": "IC-4 Rang B - Expertise qualité et sécurité (22 concepts)",
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
            "concept": "Mécanismes transmissibilité BMR/BHR",
            "analyse": "Transmission manuportée ++, aérienne (tuberculose), digestive (C. difficile). Réservoirs : patients, personnel, environnement",
            "cas": "Épidémie SARM : transmission croisée mains soignants → isolement contact + renforcement hygiène",
            "ecueil": "Sous-estimer transmission environnementale et portage asymptomatique",
            "technique": "Précautions standard + spécifiques selon mode transmission",
            "distinction": "Transmission directe vs indirecte, endogène vs exogène",
            "maitrise": "Stratégies de maîtrise adaptées au mode de transmission",
            "excellence": "Anticipation émergence et adaptation stratégies préventives"
          },
          {
            "concept": "Résistances transférables plasmidiques",
            "analyse": "Plasmides = ADN extrachromosomique transférable. BLSE, carbapénémases, résistances multiples. Instabilité mais diffusion rapide",
            "cas": "Épidémie EPC (Entérobactéries productrices de carbapénémases) : diffusion plasmidique internationale",
            "ecueil": "Confondre résistance chromosomique (stable) et plasmidique (instable mais transférable)",
            "technique": "Détection moléculaire, typage plasmidique, surveillance épidémiologique",
            "distinction": "Résistance intrinsèque vs acquise, chromosomique vs extrachromosomique",
            "maitrise": "Stratégies de confinement et prévention diffusion",
            "excellence": "Compréhension mécanismes moléculaires pour stratégies ciblées"
          },
          {
            "concept": "Structures françaises EIAS",
            "analyse": "3 niveaux : Local (EOHH+CLIN/CME), Régional (CPIAS), National (PROPIAS+SPF). Coordination gestionnaire risques depuis 2011",
            "cas": "Investigation épidémie nosocomiale : coordination CPIAS-EOHH-ARS-SPF selon ampleur",
            "ecueil": "Confondre CLIN (obligatoire privé) et CME (public), rôles CPIAS vs ARS",
            "technique": "Réseau surveillance, investigation, formation, expertise",
            "distinction": "Pilotage national vs mise en œuvre régionale vs application locale",
            "maitrise": "Coordination multi-niveaux pour efficacité maximale",
            "excellence": "Leadership transformation culture sécurité institutionnelle"
          },
          {
            "concept": "3 grandes causes risques soins",
            "analyse": "Facteurs humains (fatigue, stress, formation), organisationnels (charge, procédures), techniques (matériel, environnement). Modèle systémique Reason",
            "cas": "EIAS grave = combinaison facteurs : surcharge + fatigue + défaut procédure + matériel défaillant",
            "ecueil": "Recherche bouc émissaire vs analyse systémique multicausale",
            "technique": "Grille analyse ALARM, méthode ORION, cartographie risques",
            "distinction": "Causes immédiates vs causes profondes, individuelles vs systémiques",
            "maitrise": "Analyse causale approfondie pour actions correctives efficaces",
            "excellence": "Transformation organisationnelle préventive des risques systémiques"
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
  }',
  paroles_musicales = ARRAY[
    'Qualité des soins, sept dimensions à retenir
Sécurité, pertinence, pour mieux soigner
Acceptabilité, accessibilité sans faillir  
Continuité, efficacité, efficience à maîtriser

EIAS, événements à surveiller
Cinq niveaux de gravité pour classifier
Mineur, intermédiaire, majeur à noter
Critique, catastrophique, il faut signaler

Antisepsie sur tissus vivants
Détersion, rinçage, séchage avant
Asepsie pour éviter contamination
Désinfection sur surfaces, attention

SHA, sept temps, vingt secondes compter
Gale et C. difficile, il faut laver
IAS, infections des soins à prévenir
Ministère et HAS, la qualité guider',

    'Impact économique, sept cent soixante millions
Coût des IAS, calcul par millions
SARM versus SASM, onze mille d''écart
Prolongation séjour, surcoût à l''art

Transmission manuportée, premier vecteur
Plasmides résistants, nouveau secteur
BLSE, carbapénémases se propagent
Surveillance moléculaire qui s''engage

Trois niveaux, structures organisées
Local, régional, national, coordonnées
EOHH, CPIAS, PROPIAS en réseau
Gestionnaire risques, rôle nouveau

Facteurs humains, organisationnels
Techniques aussi, risques réels
Modèle de Reason, fromage suisse
Analyse causale, expertise qui vise'
  ]
WHERE slug = 'ic4-qualite-securite-soins';
