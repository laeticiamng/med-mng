
// Données spécifiques pour l'item IC-5 : Organisation du système de santé
// Basé sur la fiche E-LiSA officielle - 30 connaissances (20 Rang A + 10 Rang B)

// RANG A : 20 connaissances attendues selon E-LiSA
export const conceptsRangAIC5 = [
  {
    concept: "Connaître l'organisation générale du système de santé français",
    definition: "Structure et fonctionnement du système de santé : acteurs, institutions, financement, régulation",
    exemple: "Ministère de la Santé, ARS, Assurance Maladie, établissements de santé publics et privés",
    piege: "Confondre les rôles des différents acteurs ou ignorer les évolutions récentes",
    mnemo: "SYSTÈME = Structure + Yeux + Santé + Thérapeutique + Évaluation + Mesures + Évolution",
    subtilite: "Le système français combine éléments publics et privés avec une régulation publique forte",
    application: "Comprendre le système pour mieux orienter les patients et s'y positionner",
    vigilance: "Rester informé des réformes et évolutions du système"
  },
  {
    concept: "Connaître l'organisation hospitalière",
    definition: "Structure et fonctionnement des établissements hospitaliers : gouvernance, organisation médicale, services",
    exemple: "CME, directoire, pôles d'activité, services cliniques, plateau technique",
    piege: "Méconnaître les circuits décisionnels ou les organes de gouvernance",
    mnemo: "HÔPITAL = Hiérarchie + Objectifs + Pratiques + Intégration + Thérapeutique + Amélioration + Logique",
    subtilite: "L'hôpital moderne combine logique médicale et contraintes de gestion",
    application: "Comprendre l'organisation pour être efficace dans son exercice hospitalier",
    vigilance: "Participer constructivement à la vie institutionnelle"
  },
  {
    concept: "Connaître les modes d'exercice médical",
    definition: "Différentes modalités d'exercice professionnel : libéral, salarié, mixte, regroupement",
    exemple: "Cabinet individuel, SCM, MSP, centres de santé, exercice hospitalier",
    piege: "Ignorer les implications juridiques et économiques des modes d'exercice",
    mnemo: "EXERCICE = Évaluation + X-professionnel + Évolution + Ressources + Coopération + Intégration + Coordination + Efficacité",
    subtilite: "Le choix du mode d'exercice influence la pratique et les responsabilités",
    application: "Choisir le mode d'exercice adapté à ses objectifs professionnels",
    vigilance: "Connaître les obligations liées à chaque mode d'exercice"
  },
  {
    concept: "Connaître l'organisation des soins primaires",
    definition: "Premier niveau de contact avec le système de santé : médecin traitant, coordination, prévention",
    exemple: "Médecin traitant, parcours de soins, MSP, CPTS, prévention et dépistage",
    piege: "Sous-estimer le rôle central des soins primaires dans le système",
    mnemo: "PRIMAIRES = Premier + Ressources + Intégration + Mesures + Amélioration + Intégration + Ressources + Efficacité + Standardisation",
    subtilite: "Les soins primaires sont la clé de voûte d'un système de santé efficace",
    application: "Développer une approche globale et coordonnée en soins primaires",
    vigilance: "Assurer la continuité et la coordination des soins"
  },
  {
    concept: "Connaître les réseaux de soins",
    definition: "Organisation coordonnée d'acteurs de santé autour de pathologies ou populations spécifiques",
    exemple: "Réseaux gérontologiques, oncologiques, addictologie, soins palliatifs",
    piege: "Méconnaître les réseaux existants ou ne pas y faire appel",
    mnemo: "RÉSEAUX = Ressources + Évaluation + Santé + Efficacité + Amélioration + Utilisation + X-secteur",
    subtilite: "Les réseaux améliorent la coordination et la qualité des soins",
    application: "Identifier et utiliser les réseaux pertinents pour ses patients",
    vigilance: "Participer activement aux réseaux de son territoire"
  },
  {
    concept: "Connaître l'organisation des urgences",
    definition: "Structure et fonctionnement des services d'urgence : SAMU, SMUR, services d'urgence",
    exemple: "Régulation médicale 15, SMUR, urgences hospitalières, maisons médicales de garde",
    piege: "Méconnaître les circuits d'urgence ou mal orienter les patients",
    mnemo: "URGENCES = Utilisation + Ressources + Gestion + Efficacité + Nécessaire + Coordination + Évaluation + Standardisation",
    subtilite: "L'organisation des urgences vise à optimiser la prise en charge selon la gravité",
    application: "Connaître les circuits pour orienter efficacement les patients urgents",
    vigilance: "Utiliser les urgences à bon escient pour éviter l'engorgement"
  },
  {
    concept: "Connaître les agences régionales de santé (ARS)",
    definition: "Institutions déconcentrées pilotant la politique de santé en région",
    exemple: "Autorisation d'établissements, contrôle qualité, schémas d'organisation des soins",
    piege: "Ignorer le rôle central des ARS dans l'organisation territoriale",
    mnemo: "ARS = Autorité + Régionale + Santé (Pilotage + Contrôle + Organisation)",
    subtilite: "Les ARS coordonnent l'ensemble des politiques de santé sur leur territoire",
    application: "Connaître son ARS pour les démarches professionnelles",
    vigilance: "Respecter les orientations et règlements de l'ARS"
  },
  {
    concept: "Connaître le financement du système de santé",
    definition: "Sources de financement et mécanismes de paiement des soins : Sécurité sociale, complémentaires, reste à charge",
    exemple: "ONDAM, T2A, dotations, LFSS, complémentaires santé",
    piege: "Méconnaître les mécanismes de financement et leurs implications",
    mnemo: "FINANCEMENT = Fonds + Intégration + Nécessaire + Amélioration + Nécessaire + Coordination + Efficacité + Mesures + Évaluation + Nécessaire + Thérapeutique",
    subtilite: "Le financement influence fortement l'organisation et la pratique des soins",
    application: "Comprendre le financement pour optimiser sa pratique",
    vigilance: "Intégrer les contraintes financières dans les décisions médicales"
  },
  {
    concept: "Connaître la tarification à l'activité (T2A)",
    definition: "Mode de financement des établissements de santé basé sur leur activité médicale",
    exemple: "GHM, GHS, suppléments, coefficients géographiques",
    piege: "Laisser la tarification influencer outre mesure les décisions médicales",
    mnemo: "T2A = Tarification + Activité (Groupes + Homogènes + Séjours)",
    subtilite: "La T2A vise l'efficience mais doit préserver la qualité des soins",
    application: "Connaître la T2A pour comprendre les contraintes hospitalières",
    vigilance: "Maintenir la primauté de l'indication médicale sur les considérations tarifaires"
  },
  {
    concept: "Connaître l'organisation de la permanence des soins",
    definition: "Dispositif assurant la continuité des soins en dehors des heures habituelles",
    exemple: "Garde, astreinte, SOS Médecins, maisons médicales de garde",
    piege: "Méconnaître ses obligations de permanence ou les dispositifs existants",
    mnemo: "PERMANENCE = Présence + Efficacité + Ressources + Mesures + Amélioration + Nécessaire + Efficacité + Nécessaire + Coordination + Évaluation",
    subtilite: "La permanence concilie obligation professionnelle et qualité de vie",
    application: "Participer à la permanence selon ses obligations professionnelles",
    vigilance: "Assurer un niveau de soins adapté en permanence"
  },
  {
    concept: "Connaître les établissements médico-sociaux",
    definition: "Structures prenant en charge des personnes en perte d'autonomie ou en situation de handicap",
    exemple: "EHPAD, FAM, MAS, SESSAD, centres de rééducation",
    piege: "Méconnaître l'offre médico-sociale et mal orienter les patients",
    mnemo: "MÉDICO-SOCIAL = Médical + Évaluation + Dépendance + Intégration + Coordination + Objectifs + Social + Optimisation + Coordination + Intégration + Amélioration + Logique",
    subtilite: "Le secteur médico-social complète l'offre sanitaire pour les publics vulnérables",
    application: "Connaître l'offre médico-sociale pour orienter ses patients",
    vigilance: "Assurer la continuité médicale en établissement médico-social"
  },
  {
    concept: "Connaître l'hospitalisation à domicile (HAD)",
    definition: "Alternative à l'hospitalisation permettant des soins complexes au domicile du patient",
    exemple: "Soins palliatifs, chimiothérapie, rééducation, surveillance post-opératoire",
    piege: "Méconnaître les indications et possibilités de l'HAD",
    mnemo: "HAD = Hospitalisation + À + Domicile (Soins + Complexes + Domicile)",
    subtilite: "L'HAD combine qualité hospitalière et confort du domicile",
    application: "Proposer l'HAD quand elle est adaptée et possible",
    vigilance: "S'assurer des conditions de sécurité et de qualité en HAD"
  },
  {
    concept: "Connaître l'organisation de la médecine du travail",
    definition: "Système de surveillance et de protection de la santé des travailleurs",
    exemple: "Services de santé au travail, médecin du travail, surveillance médicale",
    piege: "Ignorer les liens entre pathologies et exposition professionnelle",
    mnemo: "TRAVAIL = Thérapeutique + Ressources + Amélioration + Vigilance + Amélioration + Intégration + Logique",
    subtilite: "La médecine du travail participe à la prévention et au diagnostic",
    application: "Collaborer avec la médecine du travail pour ses patients actifs",
    vigilance: "Rechercher les expositions professionnelles dans les pathologies"
  },
  {
    concept: "Connaître l'organisation de la médecine scolaire",
    definition: "Système de surveillance et de protection de la santé des élèves",
    exemple: "Médecin scolaire, infirmière scolaire, bilans de santé, vaccinations",
    piege: "Ignorer le rôle de la médecine scolaire dans le suivi de l'enfant",
    mnemo: "SCOLAIRE = Surveillance + Coordination + Objectifs + Logique + Amélioration + Intégration + Ressources + Évaluation",
    subtilite: "La médecine scolaire assure un suivi spécifique complémentaire",
    application: "Coordonner avec la médecine scolaire pour le suivi des enfants",
    vigilance: "Intégrer les données de la médecine scolaire dans le suivi médical"
  },
  {
    concept: "Connaître l'organisation de la protection maternelle et infantile (PMI)",
    definition: "Service départemental de protection de la santé de la mère et de l'enfant",
    exemple: "Consultations prénatales, suivi des enfants, planification familiale, crèches",
    piege: "Méconnaître les missions de la PMI et ses interactions avec la médecine libérale",
    mnemo: "PMI = Protection + Maternelle + Infantile (Prévention + Suivi + Social)",
    subtilite: "La PMI assure une mission de santé publique et de protection sociale",
    application: "Coordonner avec la PMI pour le suivi des femmes enceintes et enfants",
    vigilance: "Connaître les obligations de signalement à la PMI"
  },
  {
    concept: "Connaître les centres de santé",
    definition: "Structures de soins primaires portées par des collectivités ou associations",
    exemple: "CMS municipaux, centres de santé associatifs, centres mutualistes",
    piege: "Confondre centres de santé et autres structures de soins",
    mnemo: "CENTRES = Coordination + Efficacité + Nécessaire + Thérapeutique + Ressources + Évaluation + Standardisation",
    subtilite: "Les centres de santé développent une approche de santé communautaire",
    application: "Connaître l'offre des centres de santé sur son territoire",
    vigilance: "Respecter les spécificités des centres de santé"
  },
  {
    concept: "Connaître les maisons de santé pluriprofessionnelles (MSP)",
    definition: "Regroupement de professionnels de santé en exercice coordonné",
    exemple: "Médecins, paramédicaux, projet de santé, protocoles de coopération",
    piege: "Confondre MSP et simple regroupement de professionnels",
    mnemo: "MSP = Maison + Santé + Pluriprofessionnelle (Projet + Coordination + Coopération)",
    subtilite: "Les MSP développent une approche coordonnée et protocolisée",
    application: "Envisager l'exercice en MSP pour développer la coordination",
    vigilance: "Respecter les engagements du projet de santé en MSP"
  },
  {
    concept: "Connaître les communautés professionnelles territoriales de santé (CPTS)",
    definition: "Regroupement de professionnels de santé d'un territoire pour améliorer l'organisation des soins",
    exemple: "Médecins, pharmaciens, paramédicaux, projet territorial de santé",
    piege: "Confondre CPTS et autres formes de regroupement professionnel",
    mnemo: "CPTS = Communauté + Professionnelle + Territoriale + Santé (Coordination + Territoire)",
    subtilite: "Les CPTS visent à améliorer l'accès et la coordination des soins sur un territoire",
    application: "Participer aux CPTS de son territoire",
    vigilance: "Contribuer aux objectifs de la CPTS"
  },
  {
    concept: "Connaître les groupements hospitaliers de territoire (GHT)",
    definition: "Coopération entre établissements publics de santé d'un même territoire",
    exemple: "Projet médical partagé, systèmes d'information communs, fonctions support",
    piege: "Confondre GHT et fusion d'établissements",
    mnemo: "GHT = Groupement + Hospitalier + Territoire (Coopération + Projet + Médical)",
    subtilite: "Les GHT maintiennent l'autonomie juridique tout en mutualisant",
    application: "Comprendre le GHT de son établissement de rattachement",
    vigilance: "Participer aux projets du GHT"
  },
  {
    concept: "Connaître la régulation médicale",
    definition: "Processus de décision médicale pour orienter et prioriser les demandes de soins urgents",
    exemple: "SAMU 15, médecin régulateur, algorithmes de décision, orientation",
    piege: "Méconnaître les principes et contraintes de la régulation médicale",
    mnemo: "RÉGULATION = Ressources + Évaluation + Gestion + Urgence + Logique + Amélioration + Thérapeutique + Intégration + Optimisation + Nécessaire",
    subtilite: "La régulation optimise l'utilisation des ressources d'urgence",
    application: "Comprendre la régulation pour mieux utiliser les services d'urgence",
    vigilance: "Fournir les informations nécessaires à la régulation"
  }
];

// RANG B : 10 connaissances attendues selon E-LiSA
export const conceptsRangBIC5 = [
  {
    concept: "Connaître les enjeux de la démographie médicale",
    definition: "Problématiques liées à la répartition géographique et par spécialité des professionnels de santé",
    exemple: "Déserts médicaux, numerus clausus, attractivité territoriale, télémédecine",
    piege: "Sous-estimer l'impact de la démographie sur l'organisation des soins",
    mnemo: "DÉMOGRAPHIE = Densité + Évaluation + Mesures + Objectifs + Gestion + Ressources + Amélioration + Pratiques + Hôpital + Intégration + Efficacité",
    subtilite: "La démographie médicale conditionne l'accès aux soins et l'organisation territoriale",
    application: "Intégrer les enjeux démographiques dans ses choix d'installation",
    vigilance: "Participer aux solutions pour améliorer l'offre de soins"
  },
  {
    concept: "Connaître les enjeux de l'innovation en santé",
    definition: "Impact des innovations technologiques et organisationnelles sur le système de santé",
    exemple: "Intelligence artificielle, télémédecine, objets connectés, thérapies géniques",
    piege: "Résister au changement ou adopter sans discernement les innovations",
    mnemo: "INNOVATION = Intégration + Nécessaire + Nécessaire + Objectifs + Valeur + Amélioration + Thérapeutique + Intégration + Optimisation + Nécessaire",
    subtilite: "L'innovation doit améliorer les soins tout en maîtrisant les coûts",
    application: "Évaluer et intégrer les innovations pertinentes dans sa pratique",
    vigilance: "Maintenir l'éthique et la qualité dans l'adoption d'innovations"
  },
  {
    concept: "Connaître les enjeux de la coordination des soins",
    definition: "Nécessité d'organiser la continuité et la cohérence des soins entre les différents acteurs",
    exemple: "Dossier médical partagé, protocoles de sortie, liaison ville-hôpital",
    piege: "Négliger la coordination ou la déléguer entièrement aux autres",
    mnemo: "COORDINATION = Continuité + Objectifs + Optimisation + Ressources + Dossier + Intégration + Nécessaire + Amélioration + Thérapeutique + Intégration + Optimisation + Nécessaire",
    subtilite: "La coordination améliore la qualité et l'efficience des soins",
    application: "Développer des outils et pratiques de coordination",
    vigilance: "Assurer sa part de responsabilité dans la coordination"
  },
  {
    concept: "Connaître les enjeux de la prévention et de l'éducation thérapeutique",
    definition: "Importance des approches préventives et éducatives dans le système de santé",
    exemple: "Programmes de dépistage, éducation thérapeutique, promotion de la santé",
    piege: "Limiter son rôle aux soins curatifs",
    mnemo: "PRÉVENTION = Promotion + Ressources + Évaluation + Vigilance + Efficacité + Nécessaire + Thérapeutique + Intégration + Optimisation + Nécessaire",
    subtilite: "La prévention et l'ETP sont plus efficaces et moins coûteuses que les soins curatifs",
    application: "Intégrer prévention et ETP dans sa pratique quotidienne",
    vigilance: "Former et actualiser ses compétences en prévention et ETP"
  },
  {
    concept: "Connaître les enjeux de la qualité et de la sécurité des soins",
    definition: "Nécessité d'organiser et de mesurer la qualité et la sécurité dans les soins",
    exemple: "Certification, indicateurs qualité, gestion des risques, culture sécurité",
    piege: "Considérer la qualité comme une contrainte plutôt qu'un objectif",
    mnemo: "QUALITÉ = Quantification + Utilisation + Amélioration + Logique + Intégration + Thérapeutique + Évaluation",
    subtilite: "La qualité et la sécurité nécessitent une approche systémique",
    application: "Participer activement aux démarches qualité de son établissement",
    vigilance: "Maintenir une vigilance constante sur la qualité et la sécurité"
  },
  {
    concept: "Connaître les enjeux éthiques de l'organisation des soins",
    definition: "Questionnements éthiques soulevés par les choix d'organisation et d'allocation des ressources",
    exemple: "Équité d'accès, rationnement, priorisation, justice distributive",
    piege: "Ignorer les dimensions éthiques des choix organisationnels",
    mnemo: "ÉTHIQUE = Équité + Thérapeutique + Honnêteté + Intégration + Qualité + Uniformité + Évaluation",
    subtilite: "L'organisation des soins soulève des questions éthiques majeures",
    application: "Intégrer la réflexion éthique dans les décisions organisationnelles",
    vigilance: "Défendre l'équité et la justice dans l'accès aux soins"
  },
  {
    concept: "Connaître les systèmes d'information en santé",
    definition: "Outils informatiques et bases de données nécessaires au fonctionnement du système de santé",
    exemple: "DMP, PMSI, CPAM, bases médico-administratives, interopérabilité",
    piege: "Méconnaître les systèmes d'information ou négliger la qualité des données",
    mnemo: "INFORMATION = Intégration + Nécessaire + Fonctionnement + Optimisation + Ressources + Mesures + Amélioration + Thérapeutique + Intégration + Optimisation + Nécessaire",
    subtilite: "Les systèmes d'information sont essentiels au pilotage du système de santé",
    application: "Utiliser correctement les systèmes d'information de sa pratique",
    vigilance: "Assurer la qualité et la confidentialité des données"
  },
  {
    concept: "Connaître les enjeux de la coopération internationale en santé",
    definition: "Dimension internationale des problématiques de santé et des réponses à y apporter",
    exemple: "OMS, épidémies transfrontalières, coopération européenne, aide au développement",
    piege: "Ignorer la dimension internationale des enjeux de santé",
    mnemo: "INTERNATIONAL = Intégration + Nécessaire + Thérapeutique + Efficacité + Ressources + Nécessaire + Amélioration + Thérapeutique + Intégration + Optimisation + Nécessaire + Amélioration + Logique",
    subtilite: "Les enjeux de santé dépassent les frontières nationales",
    application: "S'informer sur les enjeux internationaux de santé",
    vigilance: "Participer à la veille sanitaire internationale"
  },
  {
    concept: "Connaître les enjeux de la recherche en services de santé",
    definition: "Recherche visant à améliorer l'organisation, la qualité et l'efficience des soins",
    exemple: "Recherche interventionnelle, évaluation des politiques de santé, recherche qualitative",
    piege: "Limiter la recherche aux aspects fondamentaux ou cliniques",
    mnemo: "RECHERCHE-SERVICES = Recherche + Évaluation + Coopération + Hôpital + Efficacité + Ressources + Coordination + Hôpital + Efficacité + Services + Évaluation + Ressources + Vigilance + Intégration + Coordination + Efficacité + Standardisation",
    subtilite: "La recherche en services de santé guide les réformes du système",
    application: "Participer aux recherches sur l'organisation des soins",
    vigilance: "Utiliser les résultats de recherche pour améliorer l'organisation"
  },
  {
    concept: "Connaître les enjeux de la gouvernance du système de santé",
    definition: "Modalités de pilotage et de régulation du système de santé aux différents niveaux",
    exemple: "Gouvernance nationale, régionale, locale, démocratie sanitaire, représentation usagers",
    piege: "Se désintéresser de la gouvernance ou la critiquer sans y participer",
    mnemo: "GOUVERNANCE = Gestion + Objectifs + Uniformité + Vigilance + Efficacité + Ressources + Nécessaire + Amélioration + Nécessaire + Coordination + Évaluation",
    subtilite: "La gouvernance doit concilier efficacité, équité et démocratie",
    application: "Participer aux instances de gouvernance de son niveau d'exercice",
    vigilance: "Défendre l'intérêt général dans les instances de gouvernance"
  }
];

export const colonnesConfigIC5 = [
  { nom: 'Organisation Système Santé', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Officielle E-LiSA', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret Précis', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Fréquent À Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
