
// Données spécifiques pour l'item IC-3 : Le raisonnement et la décision en médecine
// Basé sur la fiche E-LiSA officielle - 23 connaissances (12 Rang A + 11 Rang B)

// RANG A : 12 connaissances attendues selon E-LiSA
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
    concept: "Connaître les bases de l'épidémiologie",
    definition: "Science étudiant la répartition et les déterminants des phénomènes de santé dans les populations",
    exemple: "Incidence, prévalence, facteurs de risque, causalité en épidémiologie",
    piege: "Confondre incidence et prévalence, ou corrélation et causalité",
    mnemo: "ÉPIDÉMIO = Étude + Population + Incidence + Distribution + Étiologie + Mesures + Investigation + Observation",
    subtilite: "L'épidémiologie guide les décisions de santé publique et cliniques",
    application: "Interpréter les données épidémiologiques pour la pratique clinique",
    vigilance: "Attention aux biais dans les études épidémiologiques"
  },
  {
    concept: "Connaître les bases de la biostatistique",
    definition: "Application des méthodes statistiques aux données biologiques et médicales",
    exemple: "Tests d'hypothèses, intervalles de confiance, p-value, risque relatif",
    piege: "Mauvaise interprétation de la p-value ou confusion entre significativité statistique et clinique",
    mnemo: "BIOSTAT = Biologie + Interprétation + Objectifs + Statistiques + Tests + Analyse + Théories",
    subtilite: "La significativité statistique n'implique pas forcément une pertinence clinique",
    application: "Analyser et interpréter correctement les résultats d'études médicales",
    vigilance: "Ne pas se limiter à la p-value pour juger de la pertinence d'un résultat"
  },
  {
    concept: "Connaître la lecture critique d'un article médical",
    definition: "Méthode d'analyse systématique de la qualité méthodologique et de la validité des conclusions d'une publication scientifique",
    exemple: "Grilles de lecture critique, analyse des biais, évaluation de la validité interne et externe",
    piege: "Accepter les conclusions sans analyser la méthodologie ou négliger les conflits d'intérêts",
    mnemo: "CRITIQUE = Cohérence + Rigueur + Investigation + Théorie + Interprétation + Qualité + Utilité + Évaluation",
    subtilite: "La lecture critique permet de distinguer les preuves fiables des données douteuses",
    application: "Évaluer systématiquement la qualité des publications avant d'appliquer leurs résultats",
    vigilance: "Vérifier la méthodologie, les conflits d'intérêts et la transposabilité"
  },
  {
    concept: "Connaître les règles de décision clinique",
    definition: "Outils structurés combinant plusieurs variables cliniques pour orienter les décisions diagnostiques ou thérapeutiques",
    exemple: "Score de Wells, critères d'Ottawa, règles de prédiction clinique",
    piege: "Appliquer une règle hors de sa population de validation ou sans tenir compte du contexte",
    mnemo: "RÈGLES = Raisonnement + Évaluation + Guidage + Logique + Evidence + Standardisation",
    subtilite: "Les règles de décision sont des aides, pas des substituts au jugement clinique",
    application: "Utiliser les règles validées pour standardiser et améliorer les décisions",
    vigilance: "Vérifier l'applicabilité de la règle à votre patient et contexte"
  },
  {
    concept: "Connaître les outils d'aide à la décision",
    definition: "Systèmes informatisés ou supports structurés facilitant le processus décisionnel médical",
    exemple: "Algorithmes décisionnels, arbres de décision, systèmes experts, IA médicale",
    piege: "Se reposer entièrement sur l'outil sans exercer son jugement clinique",
    mnemo: "OUTILS = Objectifs + Utilisation + Thérapeutique + Informatisation + Logique + Standardisation",
    subtilite: "Les outils d'aide complètent mais ne remplacent pas le raisonnement médical",
    application: "Intégrer les outils d'aide dans la démarche clinique de façon critique",
    vigilance: "Maintenir l'esprit critique et adapter à chaque situation particulière"
  },
  {
    concept: "Connaître les bases de la recherche clinique",
    definition: "Méthodologie de recherche appliquée à l'étude des pathologies humaines et de leurs traitements",
    exemple: "Essais contrôlés randomisés, études observationnelles, méta-analyses",
    piege: "Confondre les différents types d'études ou mal interpréter leur niveau de preuve",
    mnemo: "RECHERCHE = Randomisation + Éthique + Contrôle + Hypothèses + Évaluation + Rigueur + Critères + Homogénéité + Efficacité",
    subtilite: "La qualité de la recherche conditionne la fiabilité des recommandations",
    application: "Comprendre les principes pour mieux évaluer la littérature médicale",
    vigilance: "Analyser la méthodologie avant d'accepter les conclusions"
  },
  {
    concept: "Connaître les recommandations pour la pratique clinique (RPC)",
    definition: "Propositions développées méthodiquement pour aider le praticien et le patient à rechercher les soins les plus appropriés",
    exemple: "Recommandations HAS, sociétés savantes, consensus d'experts",
    piege: "Appliquer les recommandations sans les adapter au contexte individuel du patient",
    mnemo: "RPC = Recommandations + Pratique + Clinique (Evidence + Expertise + Préférences)",
    subtilite: "Les RPC guident mais ne dictent pas la pratique médicale",
    application: "Utiliser les RPC comme référence tout en personnalisant les soins",
    vigilance: "Vérifier la date, la méthodologie et l'applicabilité des recommandations"
  },
  {
    concept: "Connaître les principes de l'évaluation des technologies de santé",
    definition: "Processus multidisciplinaire d'évaluation des technologies médicales sur leurs aspects cliniques, économiques, éthiques et sociaux",
    exemple: "HTA (Health Technology Assessment), évaluation coût-efficacité, QALY",
    piege: "Négliger les aspects éthiques et sociaux pour se concentrer uniquement sur l'efficacité",
    mnemo: "ÉVALUATION = Efficacité + Valeur + Analyse + Logique + Utilité + Applications + Technologies + Impact + Optimisation + Nécessité",
    subtilite: "L'évaluation doit être multidimensionnelle et contextualisée",
    application: "Intégrer l'évaluation technologique dans les décisions de santé",
    vigilance: "Considérer tous les aspects : cliniques, économiques, éthiques, sociaux"
  },
  {
    concept: "Connaître les bases de l'analyse décisionnelle",
    definition: "Méthode structurée d'analyse des décisions complexes en situation d'incertitude",
    exemple: "Arbres de décision, analyse coût-bénéfice, modélisation de Markov",
    piege: "Surestimer la précision des modèles ou négliger les préférences du patient",
    mnemo: "ANALYSE = Alternatives + Nécessité + Arbre + Logique + Yeux + Structure + Évaluation",
    subtilite: "L'analyse décisionnelle aide à structurer la réflexion plus qu'à donner des réponses définitives",
    application: "Utiliser l'analyse décisionnelle pour les choix thérapeutiques complexes",
    vigilance: "Inclure les préférences du patient et rester critique sur les modèles"
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
  }
];

// RANG B : 11 connaissances attendues selon E-LiSA
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
    concept: "Connaître la place des référentiels dans la décision",
    definition: "Utilisation appropriée des recommandations, protocoles et guidelines dans le processus décisionnel",
    exemple: "Adaptation des recommandations ESC en cardiologie au patient individuel",
    piege: "Application rigide des référentiels sans adaptation au contexte",
    mnemo: "RÉFÉRENTIELS = Recommandations + Évaluation + Fiabilité + Expertise + Rigueur + Evidence + Nécessité + Thérapeutique + Indications + Evidence + Logique + Standardisation",
    subtilite: "Les référentiels guident mais ne dictent pas la décision médicale",
    application: "Utiliser les référentiels comme base tout en personnalisant l'approche",
    vigilance: "Évaluer l'applicabilité du référentiel à la situation clinique"
  },
  {
    concept: "Connaître les outils d'évaluation des pratiques",
    definition: "Méthodes et instruments permettant d'évaluer la qualité et l'efficacité des pratiques professionnelles",
    exemple: "Audit clinique, indicateurs qualité, EPP (Évaluation des Pratiques Professionnelles)",
    piege: "Considérer l'évaluation comme punitive plutôt que comme amélioration continue",
    mnemo: "ÉVALUATION = Efficacité + Valeur + Analyse + Logique + Utilité + Applications + Technologies + Impact + Optimisation + Nécessité",
    subtilite: "L'évaluation vise l'amélioration continue de la qualité des soins",
    application: "Participer activement aux démarches d'évaluation professionnelle",
    vigilance: "Utiliser les résultats d'évaluation pour améliorer sa pratique"
  },
  {
    concept: "Connaître les enjeux de santé publique",
    definition: "Problématiques de santé collective nécessitant des approches populationnelles et des politiques de santé",
    exemple: "Prévention des maladies chroniques, vaccination, inégalités de santé",
    piege: "Négliger la dimension collective de la médecine",
    mnemo: "SANTÉ-PUBLIQUE = Société + Approche + Nécessité + Thérapeutique + Éthique + Population + Utilité + Bénéfice + Logique + Intervention + Qualité + Uniformité + Efficacité",
    subtilite: "La pratique individuelle s'inscrit dans une démarche de santé publique",
    application: "Intégrer les enjeux de santé publique dans la pratique clinique",
    vigilance: "Concilier soins individuels et bénéfice collectif"
  },
  {
    concept: "Connaître l'organisation du système de soins",
    definition: "Structure et fonctionnement du système de santé, parcours de soins, coordination",
    exemple: "Parcours de soins coordonnés, filières de soins, réseaux de santé",
    piege: "Méconnaître l'organisation et mal orienter les patients",
    mnemo: "ORGANISATION = Objectifs + Ressources + Gestion + Approche + Nécessaire + Intégration + Stratégie + Amélioration + Thérapeutique + Intégration + Optimisation + Nécessité",
    subtilite: "Une bonne connaissance du système améliore l'efficacité des soins",
    application: "Orienter efficacement les patients dans le système de soins",
    vigilance: "Rester informé des évolutions du système de santé"
  },
  {
    concept: "Connaître les bases de l'économie de la santé",
    definition: "Principes économiques appliqués au secteur de la santé : coûts, efficience, allocation des ressources",
    exemple: "Analyse coût-efficacité, QALY, tarification à l'activité",
    piege: "Ignorer les contraintes économiques ou les laisser primer sur les considérations médicales",
    mnemo: "ÉCONOMIE = Efficience + Coûts + Optimisation + Nécessaire + Objectifs + Mesures + Intégration + Évaluation",
    subtilite: "L'efficience économique doit s'articuler avec l'efficacité clinique",
    application: "Intégrer les considérations économiques dans les décisions médicales",
    vigilance: "Équilibrer efficience économique et qualité des soins"
  },
  {
    concept: "Connaître les aspects sociologiques et anthropologiques",
    definition: "Influence des facteurs sociaux, culturels et anthropologiques sur la santé et les soins",
    exemple: "Inégalités sociales de santé, déterminants sociaux, représentations culturelles",
    piege: "Négliger l'impact des facteurs socioculturels sur la santé",
    mnemo: "SOCIOLOGIE = Société + Objectifs + Culture + Intégration + Objectifs + Logique + Optimisation + Gestion + Intégration + Évaluation",
    subtilite: "Les facteurs socioculturels influencent significativement la santé",
    application: "Prendre en compte la dimension socioculturelle dans l'approche patient",
    vigilance: "Adapter l'approche médicale au contexte socioculturel du patient"
  },
  {
    concept: "Connaître les outils de communication avec le patient",
    definition: "Techniques et supports facilitant la communication et la prise de décision partagée",
    exemple: "Outils d'aide à la décision patient, supports d'information, techniques d'entretien",
    piege: "Sous-estimer l'importance de la communication dans la décision médicale",
    mnemo: "COMMUNICATION = Clarté + Objectifs + Mesures + Moyens + Utilisation + Nécessaire + Intégration + Compréhension + Amélioration + Thérapeutique + Intégration + Optimisation + Nécessité",
    subtilite: "Une bonne communication améliore l'adhésion et les résultats",
    application: "Utiliser des outils adaptés pour faciliter la communication",
    vigilance: "S'assurer de la compréhension et de l'adhésion du patient"
  },
  {
    concept: "Connaître l'épidémiologie clinique",
    definition: "Application des méthodes épidémiologiques à la pratique clinique pour améliorer les décisions diagnostiques et thérapeutiques",
    exemple: "Valeurs prédictives, rapports de vraisemblance, théorème de Bayes en pratique",
    piege: "Mal interpréter les performances des tests diagnostiques",
    mnemo: "ÉPIDÉMIO-CLINIQUE = Épidémiologie + Pratique + Intégration + Diagnostic + Évaluation + Mesures + Intégration + Optimisation + Clinique + Logique + Intégration + Nécessaire + Intégration + Qualité + Utilité + Évaluation",
    subtilite: "L'épidémiologie clinique guide l'interprétation des examens",
    application: "Utiliser l'épidémiologie clinique pour interpréter les tests",
    vigilance: "Tenir compte de la prévalence et des performances des tests"
  },
  {
    concept: "Connaître les biais en médecine",
    definition: "Erreurs systématiques pouvant affecter la validité des observations, études ou décisions médicales",
    exemple: "Biais de confirmation, biais d'ancrage, biais de disponibilité",
    piege: "Ne pas reconnaître ses propres biais cognitifs",
    mnemo: "BIAIS = Bases + Intégration + Analyse + Interprétation + Standardisation",
    subtilite: "La reconnaissance des biais améliore la qualité des décisions",
    application: "Développer une approche critique pour limiter l'impact des biais",
    vigilance: "Rester vigilant face à ses propres biais cognitifs"
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
