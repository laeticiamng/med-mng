
// Données spécifiques pour l'item IC-3 : Le raisonnement et la décision en médecine
// Basé sur la fiche E-LiSA officielle - 23 connaissances (18 Rang A + 5 Rang B)

// RANG A : 18 connaissances attendues selon E-LiSA
export const conceptsRangAIC3 = [
  {
    concept: "Connaître la définition de la médecine basée sur les preuves (EBM). Notion de niveaux de preuve",
    definition: "Approche médicale intégrant les meilleures preuves scientifiques disponibles, l'expertise clinique et les préférences du patient. Hiérarchisation des preuves selon leur qualité méthodologique",
    exemple: "Décision thérapeutique basée sur méta-analyse (niveau 1) plutôt que sur opinion d'expert (niveau 5)",
    piege: "Croire que l'EBM remplace l'expertise clinique ou ignore les préférences du patient",
    mnemo: "EBM = Evidence + Basée + Médecine (3 piliers : Preuves + Expertise + Préférences)",
    subtilite: "L'EBM intègre science, art médical et humanisme",
    application: "Systématiquement rechercher les preuves avant toute décision thérapeutique",
    vigilance: "Ne pas appliquer aveuglément les recommandations sans adaptation au patient"
  },
  {
    concept: "Savoir définir les notions de savoirs, de connaissances et d'incertitude",
    definition: "Savoirs = informations objectives. Connaissances = savoirs intégrés et contextualisés. Incertitude = limites de nos connaissances dans une situation donnée",
    exemple: "Savoir : HTA = tension >140/90. Connaissance : adapter le seuil selon l'âge et comorbidités. Incertitude : pronostic individuel",
    piege: "Confondre information et connaissance, ou nier l'incertitude médicale",
    mnemo: "SAVOIRS = Simples + Acquis + Vérifiés + Objectifs + Informatifs + Rigoureux + Structurés",
    subtilite: "L'incertitude fait partie intégrante de la médecine",
    application: "Distinguer ce qui est su, connu et incertain dans chaque situation clinique",
    vigilance: "Communiquer l'incertitude au patient de manière appropriée"
  },
  {
    concept: "Connaître les recommandations",
    definition: "Guides de bonnes pratiques élaborés par des experts, basés sur les preuves scientifiques et le consensus professionnel",
    exemple: "Recommandations HAS pour la prise en charge du diabète de type 2",
    piege: "Appliquer les recommandations sans les adapter au contexte individuel",
    mnemo: "RECOMMANDATIONS = Références + Expertise + Consensus + Officielles + Meilleures + Médecine + Adaptées + Nécessaires + Directives + Appliquées + Thérapeutiques + Indispensables + Officielles + Nationales + Standardisées",
    subtilite: "Les recommandations sont des guides, pas des règles absolues",
    application: "Consulter et appliquer les recommandations en les adaptant au patient",
    vigilance: "Vérifier la date et la source des recommandations utilisées"
  },
  {
    concept: "Connaître les styles de raisonnement",
    definition: "Différentes approches du raisonnement médical : hypothético-déductif, reconnaissance de formes, raisonnement analytique",
    exemple: "Raisonnement hypothético-déductif : symptômes → hypothèses → tests → diagnostic",
    piege: "Utiliser un seul style de raisonnement ou mal adapter le style à la situation",
    mnemo: "RAISONNEMENT = Réfléchir + Analyser + Induire + Supposer + Objectiver + Nuancer + Nécessiter + Élaborer + Médical + Évaluer + Nuancer + Théoriser",
    subtilite: "Le choix du style dépend de l'expertise et de la complexité du cas",
    application: "Adapter le style de raisonnement à la situation clinique",
    vigilance: "Éviter les biais cognitifs inhérents à chaque style"
  },
  {
    concept: "Connaître les généralités sur la démarche clinique et l'examen clinique",
    definition: "Processus structuré d'investigation médicale : anamnèse, examen physique, hypothèses diagnostiques, investigations complémentaires",
    exemple: "Démarche systématique : interrogatoire → examen physique → hypothèses → examens complémentaires → diagnostic",
    piege: "Omettre des étapes ou mal hiérarchiser les informations cliniques",
    mnemo: "DÉMARCHE = Dialogue + Écoute + Méthodique + Analyse + Réflexion + Cohérente + Hypothèses + Examens",
    subtilite: "La démarche clinique reste fondamentale malgré les outils technologiques",
    application: "Appliquer systématiquement une démarche clinique structurée",
    vigilance: "Ne pas se laisser distraire par les examens complémentaires au détriment de la clinique"
  },
  {
    concept: "Connaître les examens complémentaires",
    definition: "Investigations paracliniques venant compléter l'examen clinique : biologie, imagerie, explorations fonctionnelles",
    exemple: "Prescription d'ECG pour douleur thoracique après examen clinique orientant vers pathologie cardiaque",
    piege: "Prescrire des examens non pertinents ou les utiliser comme substitut à l'examen clinique",
    mnemo: "EXAMENS = Évaluation + X-rays + Analyses + Méthodiques + Expertise + Nécessaires + Spécialisés",
    subtilite: "Les examens complémentaires confirment ou infirment les hypothèses cliniques",
    application: "Prescrire les examens complémentaires de manière ciblée et justifiée",
    vigilance: "Interpréter les résultats en fonction de la probabilité pré-test"
  },
  {
    concept: "Connaître la définition de la décision médicale",
    definition: "Processus de choix entre plusieurs alternatives thérapeutiques ou diagnostiques, intégrant preuves, expertise et préférences",
    exemple: "Choix entre chirurgie et traitement médical pour une pathologie donnée",
    piege: "Prendre des décisions sans intégrer toutes les dimensions pertinentes",
    mnemo: "DÉCISION = Délibération + Évaluation + Choix + Information + Synthèse + Intégration + Options + Nécessaire",
    subtilite: "La décision médicale est un processus complexe et multifactoriel",
    application: "Structurer le processus décisionnel pour chaque situation clinique",
    vigilance: "Documenter et justifier les décisions prises"
  },
  {
    concept: "Connaître la définition de la décision partagée, de la décision paternaliste",
    definition: "Décision partagée : processus collaboratif patient-médecin. Décision paternaliste : médecin décide seul pour le patient",
    exemple: "Décision partagée : choix thérapeutique en oncologie. Décision paternaliste : réanimation d'urgence",
    piege: "Utiliser systématiquement l'un ou l'autre modèle sans adaptation contextuelle",
    mnemo: "PARTAGÉE = Participation + Autonomie + Respect + Thérapeutique + Adaptée + Gestion + Échanges + Équilibrée",
    subtilite: "Le choix du modèle décisionnel dépend du contexte et des capacités du patient",
    application: "Adapter le style décisionnel à la situation et aux souhaits du patient",
    vigilance: "Respecter l'autonomie du patient tout en assumant la responsabilité médicale"
  },
  {
    concept: "Connaître la définition de la personne de confiance",
    definition: "Personne désignée par le patient pour l'accompagner dans ses décisions médicales et être consultée si le patient ne peut exprimer sa volonté",
    exemple: "Conjoint désigné comme personne de confiance pour un patient hospitalisé",
    piege: "Confondre personne de confiance et proche le plus présent ou le plus vocal",
    mnemo: "CONFIANCE = Choisie + Officielle + Nécessaire + Fiable + Information + Accompagne + Nécessaire + Capable + Éthique",
    subtilite: "La personne de confiance a un rôle défini légalement",
    application: "Identifier et impliquer la personne de confiance dans les décisions importantes",
    vigilance: "Respecter la confidentialité tout en impliquant la personne de confiance"
  },
  {
    concept: "Connaître les représentations, les attentes, les préférences et les demandes des patients",
    definition: "Exploration des perceptions du patient sur sa maladie, ses espoirs, ses priorités et ses demandes explicites",
    exemple: "Patient diabétique privilégiant la qualité de vie aux objectifs glycémiques stricts",
    piege: "Imposer ses propres priorités médicales sans explorer celles du patient",
    mnemo: "PRÉFÉRENCES = Priorités + Représentations + Espoirs + Faits + Émotions + Réalité + Explications + Nuances + Choix + Expressions + Souhaits",
    subtilite: "Les préférences du patient évoluent avec le temps et l'expérience",
    application: "Explorer systématiquement les représentations et préférences du patient",
    vigilance: "Distinguer les demandes explicites des besoins réels"
  },
  {
    concept: "Connaître la décision collégiale",
    definition: "Processus décisionnel impliquant plusieurs professionnels de santé pour les situations complexes ou éthiquement difficiles",
    exemple: "Décision collégiale en réanimation pour limitation des thérapeutiques actives",
    piege: "Utiliser la collégialité pour diluer la responsabilité individuelle",
    mnemo: "COLLÉGIALE = Collaboration + Objectivité + Loyauté + Légitimité + Expertise + Groupe + Intégrée + Adaptée + Loyale + Éthique",
    subtilite: "La collégialité enrichit la décision sans diluer la responsabilité",
    application: "Organiser des décisions collégiales pour les situations complexes",
    vigilance: "Maintenir la cohérence et la traçabilité des décisions collégiales"
  },
  {
    concept: "Connaître les technologies de l'information et de la communication (TICE) et l'aide à la décision clinique",
    definition: "Outils informatiques d'aide au diagnostic et à la décision : systèmes d'aide à la décision, intelligence artificielle, dossiers électroniques",
    exemple: "Système d'alerte pour interactions médicamenteuses dans le dossier électronique",
    piege: "Substituer l'outil à la réflexion clinique ou s'y fier aveuglément",
    mnemo: "TICE = Technologies + Information + Communication + Électroniques (aide mais ne remplace pas)",
    subtilite: "Les TICE assistent le médecin mais ne le remplacent pas",
    application: "Utiliser les TICE comme aide à la décision en gardant l'esprit critique",
    vigilance: "Valider les recommandations des systèmes automatisés par le jugement clinique"
  }
];

// RANG B : 5 connaissances attendues selon E-LiSA
export const conceptsRangBIC3 = [
  {
    concept: "Connaître les supports au raisonnement clinique",
    definition: "Outils et méthodes facilitant le raisonnement : arbres décisionnels, scores pronostiques, algorithmes diagnostiques",
    exemple: "Score de Wells pour embolie pulmonaire, arbre décisionnel pour douleur thoracique",
    piege: "Utiliser les supports comme substituts au raisonnement clinique",
    mnemo: "SUPPORTS = Systèmes + Uniformisés + Pratiques + Pertinents + Outils + Raisonnement + Thérapeutique + Structurés",
    subtilite: "Les supports aident mais ne remplacent pas le raisonnement clinique",
    application: "Intégrer les supports dans la démarche clinique sans s'y limiter",
    vigilance: "Adapter les supports au contexte individuel du patient"
  },
  {
    concept: "Connaître les bases d'information",
    definition: "Sources d'information médicale fiables : bases de données, revues systématiques, recommandations professionnelles",
    exemple: "Cochrane Library, PubMed, recommandations HAS, UpToDate",
    piege: "Utiliser des sources non validées ou obsolètes",
    mnemo: "BASES = Bibliothèques + Actualisées + Sources + Experts + Scientifiques",
    subtilite: "La qualité de l'information conditionne la qualité de la décision",
    application: "Consulter régulièrement des sources d'information validées",
    vigilance: "Vérifier la date et la méthodologie des informations utilisées"
  },
  {
    concept: "Connaître la logique thérapeutique",
    definition: "Raisonnement structuré pour le choix thérapeutique : efficacité, sécurité, acceptabilité, coût-efficacité",
    exemple: "Choix d'antibiotique selon spectre, résistances, tolérance et coût",
    piege: "Négliger une des dimensions de la logique thérapeutique",
    mnemo: "LOGIQUE = Liens + Objectifs + Gestion + Indications + Qualité + Utilité + Efficacité",
    subtilite: "La logique thérapeutique intègre des critères multiples et parfois contradictoires",
    application: "Analyser systématiquement toutes les dimensions du choix thérapeutique",
    vigilance: "Expliciter les compromis nécessaires entre les différents critères"
  },
  {
    concept: "Connaître la résolution de problème avec les TICE",
    definition: "Utilisation structurée des technologies pour résoudre des problèmes cliniques complexes",
    exemple: "Utilisation d'un système expert pour diagnostic différentiel complexe",
    piege: "Déléguer entièrement la résolution de problème aux outils technologiques",
    mnemo: "RÉSOLUTION = Recherche + Évaluation + Solutions + Objectifs + Logique + Utilisation + Thérapeutique + Intégration + Outils + Nécessaires",
    subtilite: "Les TICE amplifient les capacités de résolution sans remplacer le raisonnement",
    application: "Intégrer les TICE dans une démarche de résolution de problème structurée",
    vigilance: "Maintenir une approche critique face aux propositions technologiques"
  },
  {
    concept: "Connaître les systèmes d'aide à la décision",
    definition: "Outils informatiques fournissant des recommandations personnalisées basées sur les données du patient",
    exemple: "Système de calcul de risque cardiovasculaire avec recommandations thérapeutiques adaptées",
    piege: "Appliquer les recommandations sans validation clinique",
    mnemo: "SYSTÈMES = Structurés + Yeux + Surveillance + Thérapeutique + Électroniques + Médecine + Expertises + Spécialisés",
    subtilite: "L'aide à la décision reste une aide, la décision finale appartient au médecin",
    application: "Utiliser les systèmes d'aide comme support à la réflexion clinique",
    vigilance: "Valider toujours les recommandations automatisées par l'expertise clinique"
  }
];

export const colonnesConfigIC3 = [
  { nom: 'Connaissance Raisonnement', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Officielle E-LiSA', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret Précis', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Fréquent À Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
