
// Données spécifiques pour l'item IC-3 : Le raisonnement et la décision en médecine
// Basé sur la fiche E-LiSA officielle - 23 connaissances (15 Rang A + 8 Rang B)

// RANG A : 15 connaissances attendues selon E-LiSA
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
    definition: "Propositions développées méthodiquement pour aider le praticien et le patient à rechercher les soins les plus appropriés dans des circonstances cliniques données",
    exemple: "Recommandations HAS pour la prise en charge de l'HTA, guidelines ESC en cardiologie",
    piege: "Appliquer les recommandations sans les adapter au contexte individuel du patient",
    mnemo: "RECOMMANDATIONS = Références + Evidence + Consensus + Objectifs + Méthodiques + Médicales + Appropriées + Nécessaires + Développées + Applicables + Thérapeutiques + Individualisées + Optimisées + Nécessaires + Standardisées",
    subtilite: "Les recommandations guident mais ne dictent pas la pratique médicale",
    application: "Utiliser les recommandations comme référence tout en personnalisant les soins",
    vigilance: "Vérifier la date, la méthodologie et l'applicabilité des recommandations"
  },
  {
    concept: "Connaître les styles de raisonnement",
    definition: "Différentes approches cognitives utilisées par les médecins pour résoudre les problèmes cliniques : analytique, intuitif, hypothético-déductif",
    exemple: "Raisonnement analytique pour cas complexe, pattern recognition pour pathologies courantes",
    piege: "S'enfermer dans un seul style de raisonnement ou ne pas reconnaître ses limites",
    mnemo: "STYLES = Systématique + Théorique + Yeux + Logique + Evidence + Structuré",
    subtilite: "Le choix du style dépend du contexte, de l'expérience et de la complexité du cas",
    application: "Adapter son style de raisonnement selon la situation clinique",
    vigilance: "Éviter les biais cognitifs liés à chaque style de raisonnement"
  },
  {
    concept: "Connaître les généralités sur la démarche clinique et l'examen clinique",
    definition: "Processus structuré d'investigation médicale comprenant anamnèse, examen physique, hypothèses diagnostiques et plan thérapeutique",
    exemple: "Interrogatoire → Examen physique → Hypothèses → Examens complémentaires → Diagnostic → Traitement",
    piege: "Négliger l'anamnèse et l'examen physique au profit des examens complémentaires",
    mnemo: "DÉMARCHE = Données + Évaluation + Méthodique + Approche + Raisonnement + Clinique + Hypothèses + Evidence",
    subtilite: "La démarche clinique reste la base de la médecine malgré les avancées technologiques",
    application: "Suivre systématiquement les étapes de la démarche clinique",
    vigilance: "Ne pas court-circuiter les étapes fondamentales"
  },
  {
    concept: "Connaître les examens complémentaires",
    definition: "Tests et investigations médicales utilisés pour confirmer ou infirmer des hypothèses diagnostiques, évaluer la gravité ou surveiller l'évolution",
    exemple: "Biologie, imagerie, explorations fonctionnelles, biopsies selon l'orientation clinique",
    piege: "Prescrire des examens sans justification clinique ou par routine",
    mnemo: "EXAMENS = Evidence + X-ray + Analyses + Mesures + Évaluation + Nécessaires + Structurés",
    subtilite: "L'examen complémentaire ne remplace jamais la clinique mais la complète",
    application: "Prescrire les examens de façon ciblée selon l'hypothèse diagnostique",
    vigilance: "Interpréter les résultats en tenant compte du contexte clinique"
  },
  {
    concept: "Connaître la définition de la décision médicale",
    definition: "Processus de choix entre plusieurs options thérapeutiques ou diagnostiques, basé sur les preuves, l'expertise et les préférences du patient",
    exemple: "Choix entre chirurgie et traitement médical dans l'angor stable selon le profil du patient",
    piege: "Prendre des décisions sans impliquer le patient ou sans tenir compte de ses préférences",
    mnemo: "DÉCISION = Données + Évaluation + Choix + Intégration + Structuré + Individualisé + Optimisé + Nécessaire",
    subtilite: "La décision médicale optimal combine science et humanisme",
    application: "Intégrer systématiquement preuves, expertise et préférences dans chaque décision",
    vigilance: "S'assurer de la compréhension et de l'adhésion du patient"
  },
  {
    concept: "Connaître la définition de la décision partagée, de la décision paternaliste",
    definition: "Décision partagée : processus collaboratif médecin-patient. Décision paternaliste : médecin décide seul 'pour le bien' du patient",
    exemple: "Décision partagée : choix contraception. Décision paternaliste : urgence vitale sans temps d'explication",
    piege: "Confondre autonomie du patient et abandon de la responsabilité médicale",
    mnemo: "PARTAGÉE = Patient + Autonomie + Respect + Thérapeutique + Accord + Génération + Échange + Evidence",
    subtilite: "Le degré de partage varie selon l'urgence, la complexité et les capacités du patient",
    application: "Privilégier la décision partagée chaque fois que possible",
    vigilance: "Évaluer la capacité de décision du patient et le contexte"
  },
  {
    concept: "Connaître la définition de la personne de confiance",
    definition: "Personne désignée par le patient pour l'accompagner dans ses démarches et être consultée si le patient ne peut exprimer sa volonté",
    exemple: "Conjoint désigné comme personne de confiance pour patient sous ventilation artificielle",
    piege: "Confondre personne de confiance et représentant légal, ou négliger sa désignation",
    mnemo: "CONFIANCE = Choisie + Officielle + Nécessaire + Fidèle + Intégration + Accompagnement + Nécessaire + Consensus + Evidence",
    subtilite: "La personne de confiance a un rôle consultatif, pas décisionnel",
    application: "Systématiquement proposer la désignation d'une personne de confiance",
    vigilance: "Respecter le choix du patient et les limites du rôle"
  },
  {
    concept: "Connaître les représentations, les attentes, les préférences et les demandes des patients",
    definition: "Ensemble des croyances, souhaits, valeurs et demandes exprimées par le patient concernant sa santé et ses soins",
    exemple: "Patient préférant qualité de vie à survie, ou craignant les effets secondaires plus que la maladie",
    piege: "Ignorer les représentations du patient ou les juger irrationnelles",
    mnemo: "ATTENTES = Autonomie + Thérapeutique + Théories + Evidence + Nécessaires + Thérapeutique + Evidence + Structurées",
    subtilite: "Les représentations influencent fortement l'adhésion thérapeutique",
    application: "Explorer systématiquement les représentations et attentes du patient",
    vigilance: "Distinguer demandes exprimées et besoins réels"
  },
  {
    concept: "Connaître la décision collégiale",
    definition: "Processus de décision impliquant plusieurs professionnels de santé pour des situations complexes ou éthiquement difficiles",
    exemple: "Réunion de concertation pluridisciplinaire en oncologie, décision d'arrêt thérapeutique en réanimation",
    piege: "Utiliser la collégialité pour diluer les responsabilités individuelles",
    mnemo: "COLLÉGIALE = Consensus + Objectifs + Logique + Légitimité + Évaluation + Groupe + Intégration + Approche + Logique + Evidence",
    subtilite: "La décision collégiale enrichit mais ne remplace pas la responsabilité médicale",
    application: "Recourir à la collégialité pour les décisions complexes ou éthiques",
    vigilance: "S'assurer que tous les avis sont entendus et documentés"
  },
  {
    concept: "Connaître les technologies de l'information et de la communication (TICE) et l'aide à la décision clinique",
    definition: "Outils informatiques d'aide au diagnostic et à la décision : systèmes d'aide à la décision, intelligence artificielle, dossiers électroniques",
    exemple: "Système d'alerte pour interactions médicamenteuses dans le dossier électronique",
    piege: "Substituer l'outil à la réflexion clinique ou s'y fier aveuglément",
    mnemo: "TICE = Technologies + Information + Communication + Électroniques",
    subtilite: "Les TICE assistent le médecin mais ne le remplacent pas",
    application: "Utiliser les TICE comme aide à la décision en gardant l'esprit critique",
    vigilance: "Valider les recommandations des systèmes automatisés par le jugement clinique"
  },
  {
    concept: "Connaître les modalités de la résolution de problème avec les TICE",
    definition: "Méthodologie d'utilisation des outils informatiques pour résoudre les problèmes cliniques de façon structurée et efficace",
    exemple: "Utilisation d'algorithmes décisionnels informatisés pour le diagnostic différentiel",
    piege: "Suivre aveuglément les propositions informatiques sans validation clinique",
    mnemo: "RÉSOLUTION = Rigueur + Évaluation + Structuration + Objectifs + Logique + Utilisation + Technologies + Intégration + Optimisation + Nécessaire",
    subtilite: "Les TICE doivent s'intégrer dans la démarche clinique traditionnelle",
    application: "Utiliser les TICE pour structurer et optimiser le raisonnement",
    vigilance: "Maintenir l'esprit critique face aux propositions informatiques"
  },
  {
    concept: "Connaître les systèmes d'aide à la décision",
    definition: "Outils informatiques qui analysent les données patients pour proposer des recommandations diagnostiques ou thérapeutiques",
    exemple: "Systèmes d'aide au diagnostic, calculateurs de risque cardiovasculaire, alertes médicamenteuses",
    piege: "Accepter les recommandations sans validation ou comprendre les limites du système",
    mnemo: "SYSTÈMES = Structurés + Yeux + Standardisés + Technologies + Évaluation + Mesures + Evidence + Structurés",
    subtilite: "Ces systèmes sont des outils d'aide, pas de remplacement du jugement médical",
    application: "Intégrer les systèmes d'aide dans la pratique quotidienne de façon critique",
    vigilance: "Connaître les limites et biais potentiels de chaque système"
  },
  {
    concept: "Connaître les particularités de la controverse en santé",
    definition: "Débats et désaccords dans la communauté médicale sur des questions diagnostiques, thérapeutiques ou organisationnelles",
    exemple: "Controverse sur l'âge de début du dépistage mammographique, débats sur les statines en prévention primaire",
    piege: "Ignorer les controverses ou prendre parti sans analyse critique des arguments",
    mnemo: "CONTROVERSE = Confrontation + Objectifs + Nécessaire + Thérapeutique + Rigueur + Opinions + Variées + Evidence + Rigueur + Structurée + Evidence",
    subtilite: "Les controverses reflètent souvent l'évolution des connaissances médicales",
    application: "Rester informé des controverses et analyser les arguments de chaque partie",
    vigilance: "Expliquer au patient l'existence d'incertitudes ou de débats"
  }
];

// RANG B : 8 connaissances attendues selon E-LiSA
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
    definition: "Raisonnement structuré pour choisir la stratégie thérapeutique optimale en fonction du diagnostic, du patient et du contexte",
    exemple: "Choix antibiotique selon germe, terrain, gravité et résistances locales",
    piege: "Appliquer des schémas thérapeutiques sans adaptation au contexte",
    mnemo: "LOGIQUE = Logique + Objectifs + Guidage + Individualisé + Qualité + Utilité + Evidence",
    subtilite: "La logique thérapeutique intègre efficacité, sécurité et acceptabilité",
    application: "Systématiser le raisonnement thérapeutique selon une démarche structurée",
    vigilance: "Adapter la thérapeutique aux spécificités de chaque patient"
  },
  {
    concept: "Connaître la définition de l'efficacité théorique, de l'effectivité, de l'efficience et de l'utilité",
    definition: "Efficacité théorique : effet en conditions idéales. Effectivité : effet en conditions réelles. Efficience : rapport coût/efficacité. Utilité : bénéfice perçu",
    exemple: "Vaccin efficace à 95% en essai, effectif à 70% en population, efficient si coût acceptable",
    piege: "Confondre ces différents concepts ou négliger certains aspects",
    mnemo: "EFFICACITÉ = Evidence + Fiabilité + Intégration + Contrôle + Applications + Clinique + Intégration + Thérapeutique + Évaluation",
    subtilite: "Ces quatre dimensions sont complémentaires pour évaluer une intervention",
    application: "Considérer ces quatre aspects dans l'évaluation thérapeutique",
    vigilance: "Ne pas se limiter à l'efficacité théorique pour prendre des décisions"
  },
  {
    concept: "Connaître la définition de l'analyse décisionnelle",
    definition: "Méthode structurée d'analyse des décisions complexes en situation d'incertitude, utilisant arbres de décision et modélisation",
    exemple: "Arbre de décision pour choix chirurgical vs médical, analyse coût-bénéfice",
    piege: "Surestimer la précision des modèles ou négliger les préférences du patient",
    mnemo: "ANALYSE = Alternatives + Nécessité + Arbre + Logique + Yeux + Structure + Évaluation",
    subtilite: "L'analyse décisionnelle aide à structurer la réflexion plus qu'à donner des réponses définitives",
    application: "Utiliser l'analyse décisionnelle pour les choix thérapeutiques complexes",
    vigilance: "Inclure les préférences du patient et rester critique sur les modèles"
  },
  {
    concept: "Connaître le modèle des dynamiques décisionnelles",
    definition: "Cadre conceptuel décrivant les processus et interactions dans la prise de décision médicale complexe",
    exemple: "Modélisation des interactions entre facteurs médicaux, psychosociaux et organisationnels",
    piege: "Simplifier excessivement les processus décisionnels complexes",
    mnemo: "DYNAMIQUES = Données + Yeux + Nécessaires + Approche + Mesures + Intégration + Qualité + Utilité + Evidence + Structurées",
    subtilite: "Les dynamiques décisionnelles sont multifactorielles et évolutives",
    application: "Identifier les différents facteurs influençant la décision",
    vigilance: "Prendre en compte la complexité et l'évolution des situations"
  },
  {
    concept: "Connaître les architectures des systèmes d'information",
    definition: "Organisation et structure des systèmes informatiques de santé, incluant dossiers patients, bases de données et réseaux",
    exemple: "Architecture du DMP, interopérabilité des systèmes hospitaliers",
    piege: "Négliger les aspects de sécurité et de confidentialité",
    mnemo: "ARCHITECTURES = Applications + Réseaux + Conception + Hiérarchie + Intégration + Technologies + Evidence + Contrôle + Technologies + Utilisation + Rigueur + Evidence + Structurées",
    subtilite: "L'architecture conditionne les fonctionnalités et performances du système",
    application: "Comprendre l'organisation des systèmes pour optimiser leur utilisation",
    vigilance: "Respecter les règles de sécurité et confidentialité"
  },
  {
    concept: "Connaître la définition et les caractéristiques principales d'une controverse",
    definition: "Débat scientifique caractérisé par des opinions divergentes sur des questions médicales, avec arguments rationnels de chaque côté",
    exemple: "Controverse sur bénéfices/risques des THS, débats sur l'homéopathie",
    piege: "Prendre parti sans analyse critique ou ignorer la controverse",
    mnemo: "CONTROVERSE = Confrontation + Objectifs + Nécessaire + Thérapeutique + Rigueur + Opinions + Variées + Evidence + Rigueur + Structurée + Evidence",
    subtilite: "Les controverses peuvent révéler les limites des connaissances actuelles",
    application: "Analyser objectivement les arguments de chaque partie",
    vigilance: "Informer le patient de l'existence de débats quand pertinent"
  }
];
