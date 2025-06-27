
-- Mettre à jour l'item IC-5 avec le contenu Rang B complet (caractères échappés)
UPDATE edn_items_immersive 
SET 
  tableau_rang_b = '{
    "theme": "Responsabilités médicales - Approfondissements experts",
    "colonnes": ["Concept", "Analyse Experte", "Cas Complexe", "Écueil Expert", "Technique Avancée", "Distinction Fine", "Maîtrise Technique", "Excellence Requise"],
    "lignes": [
      ["Facteurs contentieux accident médical", "Facteurs multifactoriels liés au patient, tâches, équipe, environnement, organisation, management et contexte institutionnel", "Patient âgé polymorbide avec difficultés communication, équipe surchargée, matériel défaillant simultanément", "Ne pas se limiter au facteur apparent - analyse systémique nécessaire", "Grille ALARM pour analyse exhaustive des facteurs contributifs", "Facteur déclenchant ≠ cause racine : distinguer les niveaux de causalité", "Cartographie des risques par processus, analyse multifactorielle structurée", "Leadership dans la prévention proactive des situations à risque"],
      ["Erreur humaine - Facteurs individuels", "Manque connaissances/compétences/expérience, stress, fatigue, facteurs linguistiques/culturels influençant performance", "Interne de garde fatigué, barrière linguistique avec patient, stress temporel en urgence", "Éviter l''auto-suffisance - savoir reconnaître ses limites et demander aide", "Techniques de gestion stress, pauses structurées, check-lists cognitives", "Incompétence ≠ erreur de performance : causes et réponses différentes", "Auto-évaluation continue, formation régulière, réseau de soutien professionnel", "Culture d''apprentissage continu et d''humilité professionnelle"],
      ["Erreur humaine - Facteurs collectifs", "Travail d''équipe nécessitant organisation, communication, leadership identifié, rôles définis, briefings/débriefings", "Équipe chirurgicale sans briefing pré-opératoire, communication défaillante, leadership flou", "Ne pas confondre groupe de travail et équipe - vraie coopération nécessaire", "Structured briefings, techniques CRM (Crew Resource Management)", "Équipe hiérarchique ≠ équipe collaborative : modes de fonctionnement distincts", "Animation d''équipe, gestion des conflits, communication assertive", "Leadership transformationnel pour culture sécurité partagée"],
      ["Barrières de sécurité - Prévention", "Défenses empêchant survenue erreur : check-lists, alertes informatiques, protocoles", "Check-list chirurgicale HAS 3 temps, prescription informatisée avec alertes", "Ne pas multiplier les barrières au point de créer fatigue procédurale", "Design des barrières adapté au contexte, formation utilisation", "Barrière procédurale ≠ barrière technique : complémentarité nécessaire", "Conception ergonomique, test d''efficacité, mise à jour régulière", "Innovation dans les systèmes de sécurité, amélioration continue"],
      ["Barrières de sécurité - Récupération", "Erreur commise mais récupérée avant conséquences : double contrôle, vérifications croisées", "Allergie pénicilline détectée par IDE avant administration antibioprophylaxie prescrite", "Ne pas compter uniquement sur vigilance individuelle - systématiser", "Systèmes de double contrôle, alertes contextuelles automatisées", "Récupération ≠ prévention : intervient après erreur initiale", "Protocoles de vérification, culture du questionnement constructif", "Systèmes de détection précoce performants et réactifs"],
      ["Barrières de sécurité - Atténuation", "Limitation conséquences erreur non récupérée : équipes d''urgence, protocoles de crise", "Erreur voie administration → arrêt cardiaque → réanimation immédiate → récupération", "Ne pas négliger cette barrière - souvent décisive pour issue patient", "Équipes SOS, protocoles d''urgence, matériel de réanimation disponible", "Atténuation ≠ traitement : vise à limiter aggravation, pas guérir", "Gestion de crise, coordination des équipes d''urgence, débriefing post-crise", "Excellence dans la gestion des situations critiques"],
      ["Analyse causes racines", "Méthodes structurées ALARM/Orion : collecte données, chronologie, écarts, facteurs, actions, rapport", "Analyse RMM chirurgie : entretiens équipe, reconstitution chronologique, identification défaillances organisationnelles", "Ne pas s''arrêter aux causes apparentes - creuser causes latentes", "Méthode des 5 pourquoi, diagramme Ishikawa, arbre des causes", "Cause immédiate ≠ cause racine : niveaux d''analyse différents", "Conduite entretiens semi-directifs, animation analyse collective", "Transformation des analyses en véritables leviers d''amélioration"],
      ["Culture positive erreur", "Non-culpabilisation, signalement favorisé, analyse constructive, prévention répétition", "Signalement événement indésirable sans sanction, analyse neutre, actions préventives", "Éviter laxisme - culture juste distinguant erreur et faute caractérisée", "Charte de signalement, protection du déclarant, analyse systémique", "Culture punitive ≠ culture d''apprentissage : philosophies opposées", "Communication non-violente, gestion des secondes victimes", "Leadership éthique pour transformation culturelle durable"],
      ["Gestion risques institutionnelle", "Cellule gestion risques, coordinateur obligatoire, systèmes signalement actifs/passifs", "Coordinateur risques analysant signalements, RMM, fouille informatique dossiers", "Ne pas créer usine à gaz - simplicité et efficacité du système", "Systèmes d''information dédiés, indicateurs de performance sécurité", "Contrôle ≠ amélioration : finalités et méthodes différentes", "Pilotage par indicateurs, communication sur résultats", "Vision stratégique intégrée de la sécurité patient"],
      ["Secondes victimes", "Soignant traumatisé par événement, sentiment responsabilité personnelle, remise en question compétences", "Chirurgien après décès patient suite complication, isolement, questionnement, risque dépression", "Ne pas minimiser impact psychologique - accompagnement nécessaire", "Cellules de soutien psychologique, débriefing structuré post-incident", "Victime primaire ≠ seconde victime : souffrances différentes mais réelles", "Détection précoce détresse, accompagnement personnalisé", "Prévention proactive des traumatismes professionnels liés aux erreurs"]
    ]
  }'::jsonb,
  scene_immersive = '{
    "title": "Analyse d''un événement indésirable grave",
    "setting": "Salle de réunion - Revue de Morbidité Mortalité (RMM)",
    "characters": [
      {
        "name": "Dr. Martin",
        "role": "Chef de service, coordinateur RMM",
        "traits": ["Leadership bienveillant", "Culture sécurité"]
      },
      {
        "name": "Dr. Dubois", 
        "role": "Chirurgien impliqué dans l''événement",
        "traits": ["Expérimenté", "Questionnement"]
      },
      {
        "name": "Sophie",
        "role": "Infirmière de bloc",
        "traits": ["Professionnelle", "Témoignage factuel"]
      },
      {
        "name": "Dr. Chen",
        "role": "Coordinateur gestion des risques",
        "traits": ["Analyse systémique", "Non-culpabilisation"]
      }
    ],
    "dialogue": [
      {
        "speaker": "Dr. Martin",
        "text": "Nous nous réunissons aujourd''hui pour analyser l''événement indésirable survenu mardi dernier. Cette RMM vise à comprendre, non à juger. Dr. Dubois, pouvez-vous nous retracer les faits ?",
        "emotion": "Cadrage bienveillant"
      },
      {
        "speaker": "Dr. Dubois", 
        "text": "Patient de 65 ans, intervention programmée. Tout semblait normal mais une hémorragie inattendue est survenue. Malgré nos efforts, le patient a dû être transfusé massivement.",
        "emotion": "Questionnement professionnel"
      },
      {
        "speaker": "Sophie",
        "text": "J''ai remarqué que les données biologiques récentes n''étaient pas dans le dossier. Le dernier bilan datait de 15 jours. Fallait-il signaler ?",
        "emotion": "Interrogation constructive"
      },
      {
        "speaker": "Dr. Chen",
        "text": "C''est exactement ce type d''observation qui nous intéresse. Analysons les facteurs contributifs : patient, équipe, organisation. Que s''est-il passé avec ce bilan ?",
        "emotion": "Analyse systémique"
      },
      {
        "speaker": "Dr. Martin",
        "text": "Le système de prescription électronique ne génère pas d''alerte automatique pour les bilans anciens. C''est une faille organisationnelle, pas une erreur individuelle.",
        "emotion": "Objectivation non-culpabilisante"
      },
      {
        "speaker": "Dr. Dubois",
        "text": "Je me sens responsable de ne pas avoir vérifié. Comment éviter que cela se reproduise ?",
        "emotion": "Auto-questionnement constructif"
      },
      {
        "speaker": "Dr. Chen",
        "text": "Votre sentiment est compréhensible mais l''analyse montre des causes multiples. Proposons des barrières de sécurité : alerte automatique + check-list pré-opératoire renforcée.",
        "emotion": "Soutien et amélioration"
      },
      {
        "speaker": "Sophie",
        "text": "Cette approche me rassure. Je n''osais pas signaler de peur des conséquences. Maintenant je comprends l''intérêt.",
        "emotion": "Confiance retrouvée"
      }
    ],
    "learning_points": [
      "Culture positive de l''erreur favorise signalement",
      "Analyse systémique vs culpabilisation individuelle", 
      "Facteurs contributifs multiples dans événements",
      "Barrières de sécurité comme réponse organisationnelle",
      "RMM = outil d''apprentissage collectif"
    ]
  }'::jsonb,
  paroles_musicales = ARRAY[
    '[Couplet 1]
Dans l''hôpital résonne l''écho des erreurs passées
Mais aujourd''hui on apprend, on analyse sans juger
La culture positive, c''est notre nouveau chemin
Pour que chaque faute devienne un pas vers demain

[Refrain]
Responsabilité, c''est plus qu''un mot
C''est civile, pénale, disciplinaire aussi
Administrative quand c''est l''hôpital qui répond
De nos actes, de nos choix, ensemble on grandit

[Couplet 2]
L''aléa thérapeutique, parfois c''est inévitable
Mais l''erreur humaine, elle, reste évitable
Barrières de sécurité, elles nous protègent tous
Prévention, récupération, atténuation partout',

    '[Couplet 1]
Quand l''accident survient, ne cherche pas coupable
Regarde le système, sois équitable
Facteurs humains, organisation défaillante
L''analyse des causes, c''est notre arme puissante

[Refrain]
RMM, revue de nos échecs
Pour que l''erreur d''hier serve à protéger
Seconde victime, soignant traumatisé
Dans la culture sécurité, il faut l''accompagner

[Pont]
De Reason à ALARM, méthodes structurées
Pour que jamais plus, on ne répète les erreurs passées
Gestion des risques, coordinateur dédié
Culture positive, pour mieux soigner'
  ],
  quiz_questions = '{
    "questions": [
      {
        "id": 1,
        "question": "Un médecin salarié d''hôpital public peut-il voir sa responsabilité civile personnelle engagée ?",
        "options": [
          "Non, jamais - seul l''hôpital est responsable",
          "Oui, uniquement en cas de faute détachable du service",
          "Oui, pour toute faute commise dans l''exercice",
          "Seulement s''il n''a pas d''assurance RCP"
        ],
        "correct": 1,
        "explanation": "La responsabilité civile personnelle du médecin salarié n''est engagée qu''en cas de faute détachable du service (intention de nuire ou gravité exceptionnelle)."
      },
      {
        "id": 2,
        "question": "Quelle est la différence entre erreur médicale et aléa thérapeutique ?",
        "options": [
          "L''erreur est évitable, l''aléa est inévitable",
          "L''erreur concerne le diagnostic, l''aléa le traitement", 
          "L''erreur engage la responsabilité, pas l''aléa",
          "Il n''y a pas de différence fondamentale"
        ],
        "correct": 0,
        "explanation": "L''erreur médicale est évitable et involontaire, tandis que l''aléa thérapeutique est un risque inhérent inévitable malgré des soins conformes."
      },
      {
        "id": 3,
        "question": "Dans le modèle de Reason, que représentent les ''barrières de sécurité'' ?",
        "options": [
          "Uniquement les protocoles écrits",
          "Les défenses en profondeur contre les erreurs",
          "Seulement les équipements de sécurité",
          "Les sanctions disciplinaires"
        ],
        "correct": 1,
        "explanation": "Les barrières de sécurité sont des défenses en profondeur : prévention, récupération et atténuation, matérielles ou immatérielles."
      },
      {
        "id": 4,
        "question": "Qu''est-ce qu''une ''seconde victime'' en contexte médical ?",
        "options": [
          "Un patient victime d''une erreur répétée",
          "Un soignant traumatisé par un événement indésirable",
          "La famille du patient victime",
          "Un autre patient affecté par l''erreur"
        ],
        "correct": 1,
        "explanation": "La seconde victime est le soignant traumatisé et se sentant responsable d''un événement défavorable, nécessitant accompagnement."
      },
      {
        "id": 5,
        "question": "Quelle est la finalité principale d''une culture positive de l''erreur ?",
        "options": [
          "Éviter toute sanction disciplinaire",
          "Favoriser le signalement et l''apprentissage",
          "Protéger les médecins des plaintes",
          "Réduire les coûts d''assurance"
        ],
        "correct": 1,
        "explanation": "La culture positive vise à favoriser le signalement sans culpabilisation pour permettre l''analyse et la prévention des erreurs futures."
      }
    ]
  }'::jsonb,
  reward_messages = '{
    "excellent": [
      "🏆 Maîtrise experte des responsabilités médicales ! Vous distinguez parfaitement les différents types de responsabilité et comprenez les enjeux de la gestion des erreurs.",
      "⭐ Excellence en analyse systémique ! Votre approche des facteurs contributifs et de la culture sécurité est remarquable.",
      "🎯 Expert en prévention des risques ! Vous maîtrisez les barrières de sécurité et l''approche non-culpabilisante."
    ],
    "good": [
      "👍 Bonne compréhension des responsabilités ! Continuez à approfondir l''analyse des causes racines.",
      "💡 Solides bases acquises ! Travaillez encore la distinction entre les différents types de responsabilité.",
      "📈 Progression notable ! Consolidez vos connaissances sur la culture positive de l''erreur."
    ],
    "needs_improvement": [
      "📚 Révisez les définitions fondamentales des responsabilités médicales et leurs spécificités.",
      "🔍 Approfondissez la différence entre erreur, faute et aléa thérapeutique.",
      "⚡ Travaillez l''analyse systémique des événements indésirables et les facteurs contributifs."
    ]
  }'::jsonb,
  interaction_config = '{
    "title": "Classification des Responsabilités Médicales",
    "description": "Classez chaque situation dans le bon type de responsabilité",
    "items": [
      {
        "id": "homicide_involontaire",
        "text": "Décès patient suite erreur de prescription - Procureur saisit tribunal correctionnel",
        "category": "draggable"
      },
      {
        "id": "radiation_ordre",
        "text": "Médecin radié par chambre disciplinaire pour manquements déontologiques graves",
        "category": "draggable"  
      },
      {
        "id": "indemnisation_tgi",
        "text": "Patient libéral obtient dommages-intérêts devant Tribunal de Grande Instance",
        "category": "draggable"
      },
      {
        "id": "hopital_public_ta",
        "text": "Erreur service chirurgie hôpital public - Action devant Tribunal Administratif",
        "category": "draggable"
      },
      {
        "id": "infection_nosocomiale",
        "text": "Infection contractée à l''hôpital sans faute prouvée - Indemnisation automatique",
        "category": "draggable"
      }
    ],
    "categories": [
      {
        "id": "penale",
        "title": "Responsabilité Pénale",
        "description": "Sanctions pour infractions",
        "accepts": ["homicide_involontaire"]
      },
      {
        "id": "disciplinaire", 
        "title": "Responsabilité Disciplinaire",
        "description": "Ordre des médecins",
        "accepts": ["radiation_ordre"]
      },
      {
        "id": "civile",
        "title": "Responsabilité Civile", 
        "description": "Indemnisation privé",
        "accepts": ["indemnisation_tgi"]
      },
      {
        "id": "administrative",
        "title": "Responsabilité Administrative",
        "description": "Service public hospitalier", 
        "accepts": ["hopital_public_ta"]
      },
      {
        "id": "sans_faute",
        "title": "Responsabilité Sans Faute",
        "description": "Indemnisation sans preuve faute",
        "accepts": ["infection_nosocomiale"]
      }
    ]
  }'::jsonb,
  updated_at = now()
WHERE item_code = 'IC-5';
