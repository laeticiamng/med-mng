
// Données spécifiques pour l'item IC-5 : Responsabilités médicales
// Basé sur la fiche E-LiSA officielle - 15 connaissances (13 Rang A + 2 Rang B)

// RANG A : 13 connaissances attendues selon E-LiSA
export const conceptsRangAIC5 = [
  {
    concept: "Connaître la définition de la responsabilité sanction/indemnisation",
    definition: "Obligation de répondre de ses actes et d'en assumer les conséquences juridiques et financières",
    exemple: "Médecin sanctionné par l'ordre pour manquement déontologique et condamné à indemniser le préjudice",
    piege: "Confondre responsabilité morale et responsabilité juridique",
    mnemo: "RESPONSABILITÉ = Répondre + Être + Sanctionné + Payer + Obligations + Nécessaires + Supporter + Assumer + Bilan + Indemniser + Loyauté + Intégrité + Thérapeutique + Éthique",
    subtilite: "La responsabilité peut être engagée même sans faute intentionnelle",
    application: "Exercer avec conscience des responsabilités encourues",
    vigilance: "Souscrire une assurance responsabilité civile professionnelle"
  },
  {
    concept: "Connaître la définition de la responsabilité pénale",
    definition: "Obligation de répondre des infractions pénales commises dans l'exercice médical devant les juridictions répressives",
    exemple: "Homicide involontaire par négligence, non-assistance à personne en danger",
    piege: "Penser que la responsabilité pénale ne concerne que les fautes intentionnelles",
    mnemo: "PÉNALE = Punition + Évaluation + Nécessaire + Après + Liens + Enquête",
    subtilite: "La responsabilité pénale est personnelle et ne peut être assurée",
    application: "Respecter scrupuleusement les obligations légales",
    vigilance: "La responsabilité pénale engage la liberté individuelle"
  },
  {
    concept: "Connaître la définition de la responsabilité civile",
    definition: "Obligation de réparer le dommage causé à autrui par sa faute, ses biens ou les personnes dont on répond",
    exemple: "Indemnisation d'un patient pour préjudice lié à une erreur diagnostique",
    piege: "Confondre responsabilité civile contractuelle et délictuelle",
    mnemo: "CIVILE = Compensation + Indemnisation + Victime + Intégrale + Loyale + Équitable",
    subtilite: "La responsabilité civile vise la réparation, pas la sanction",
    application: "Souscrire une assurance responsabilité civile professionnelle",
    vigilance: "Déclarer rapidement tout sinistre à son assureur"
  },
  {
    concept: "Connaître la définition de la responsabilité administrative",
    definition: "Responsabilité de l'administration publique pour les dommages causés par ses agents dans l'exercice de leurs fonctions",
    exemple: "Hôpital public responsable des actes de ses praticiens hospitaliers",
    piege: "Penser que la responsabilité administrative exonère la responsabilité individuelle",
    mnemo: "ADMINISTRATIVE = Administration + Dommages + Médecin + Institutions + Nécessaire + Indemnisation + Service + Thérapeutique + Responsabilité + Assurance + Thérapeutique + Intégrale + Victime + Équitable",
    subtilite: "Coexistence possible des responsabilités administrative et individuelle",
    application: "Connaître le régime de responsabilité de son établissement",
    vigilance: "La responsabilité administrative n'est pas automatique"
  },
  {
    concept: "Connaître la définition de la responsabilité disciplinaire",
    definition: "Responsabilité devant les instances ordinales pour manquement aux devoirs professionnels",
    exemple: "Sanction ordinale pour défaut de formation médicale continue",
    piege: "Confondre sanctions disciplinaires et sanctions pénales",
    mnemo: "DISCIPLINAIRE = Devoirs + Instances + Sanction + Conseil + Intégration + Professionnelle + Loyauté + Intégrité + Nécessaire + Adaptée + Instituée + Règles + Éthique",
    subtilite: "La responsabilité disciplinaire est indépendante des autres responsabilités",
    application: "Respecter le code de déontologie médicale",
    vigilance: "Les sanctions disciplinaires sont publiques et inscrites au dossier"
  },
  {
    concept: "Connaître la définition de la responsabilité sans faute",
    definition: "Responsabilité engagée sans que soit établie une faute, basée sur le risque ou l'équité",
    exemple: "Indemnisation d'un aléa thérapeutique par l'ONIAM sans faute du médecin",
    piege: "Penser qu'absence de faute signifie absence de responsabilité",
    mnemo: "SANS-FAUTE = Solidarité + Aléa + Nécessaire + Société + Fonds + Assurance + Utilité + Thérapeutique + Équitable",
    subtilite: "La responsabilité sans faute vise l'indemnisation des victimes",
    application: "Informer les patients sur les dispositifs d'indemnisation sans faute",
    vigilance: "Déclarer les événements graves aux autorités compétentes"
  },
  {
    concept: "Connaître la définition de la faute",
    definition: "Manquement à une obligation légale, contractuelle ou déontologique : négligence, imprudence, inobservation des règles",
    exemple: "Défaut de surveillance post-opératoire, erreur de prescription manifeste",
    piege: "Confondre faute et complication ou aléa thérapeutique",
    mnemo: "FAUTE = Fail + Abandon + Utilisation + Thérapeutique + Erreur",
    subtilite: "La faute s'apprécie selon les données acquises de la science au moment des faits",
    application: "Respecter les bonnes pratiques pour éviter la faute",
    vigilance: "Documenter soigneusement les décisions et leur justification"
  },
  {
    concept: "Connaître la définition de l'erreur médicale",
    definition: "Défaillance dans le processus de soins pouvant conduire ou ayant conduit à un événement indésirable",
    exemple: "Erreur de diagnostic, erreur de prescription, erreur de dosage",
    piege: "Confondre erreur et faute, ou erreur et complication",
    mnemo: "ERREUR = Événement + Réellement + Regrettable + Évitable + Utilisation + Réparable",
    subtilite: "Toute erreur n'est pas une faute et toute faute n'est pas une erreur",
    application: "Mettre en place des systèmes de prévention des erreurs",
    vigilance: "Signaler les erreurs pour améliorer la sécurité collective"
  },
  {
    concept: "Connaître la définition de l'accident médical et de l'affection iatrogène",
    definition: "Accident médical = dommage lié aux soins. Affection iatrogène = pathologie causée par un traitement médical",
    exemple: "Perforation colique lors d'une coloscopie (accident), hépatite médicamenteuse (iatrogène)",
    piege: "Confondre accident, erreur et faute",
    mnemo: "ACCIDENT = Acte + Conséquence + Complication + Indésirable + Dommage + Événement + Nécessaire + Thérapeutique",
    subtilite: "L'accident médical peut survenir sans faute du praticien",
    application: "Informer le patient sur les risques d'accidents médicaux",
    vigilance: "Déclarer les accidents selon les procédures en vigueur"
  },
  {
    concept: "Connaître la définition de l'infection nosocomiale",
    definition: "Infection acquise dans un établissement de santé, absente lors de l'admission et se déclarant après 48h d'hospitalisation",
    exemple: "Infection urinaire sur sonde, pneumonie sous ventilation mécanique",
    piege: "Confondre infection nosocomiale et infection communautaire révélée à l'hôpital",
    mnemo: "NOSOCOMIALE = Nécessaire + Observée + Surveillance + Origine + Complications + Ordre + Médical + Intrahospitalière + Acquisition + Loyauté + Évitable",
    subtilite: "Délai de 48h pour distinguer nosocomial et communautaire",
    application: "Respecter les mesures de prévention des infections nosocomiales",
    vigilance: "Surveiller et déclarer les infections nosocomiales"
  },
  {
    concept: "Connaître la définition de l'aléa thérapeutique",
    definition: "Dommage lié aux soins sans faute du praticien, résultant d'un risque inhérent à l'acte médical",
    exemple: "Paralysie faciale après chirurgie de l'oreille malgré technique parfaite",
    piege: "Confondre aléa thérapeutique et faute du praticien",
    mnemo: "ALÉA = Accident + Loyauté + Éviter + Assurance",
    subtilite: "L'aléa thérapeutique ouvre droit à indemnisation sans faute",
    application: "Informer le patient sur les aléas possibles",
    vigilance: "Distinguer aléa thérapeutique et complication évitable"
  }
];

// RANG B : 2 connaissances attendues selon E-LiSA
export const conceptsRangBIC5 = [
  {
    concept: "Identifier les principaux facteurs conduisant à l'ouverture d'un contentieux à la suite d'un accident médical",
    definition: "Facteurs déclenchant une action en justice : défaut d'information, relation dégradée, gravité du dommage, suspicion de faute",
    exemple: "Patient non informé des risques, mauvaise communication post-incident, dommage grave",
    piege: "Penser que seule la faute médicale déclenche un contentieux",
    mnemo: "CONTENTIEUX = Communication + Objectifs + Nécessaire + Thérapeutique + Explications + Nuances + Transparence + Information + Empathie + Utilisé + X-factor",
    subtilite: "La qualité de la relation médecin-patient influence le risque contentieux",
    application: "Maintenir une communication de qualité même en cas de complications",
    vigilance: "Informer complètement le patient et maintenir la relation de confiance"
  },
  {
    concept: "Approche systémique : connaître la démarche de culture positive de l'erreur",
    definition: "Approche non punitive de l'erreur visant l'amélioration continue par l'analyse des causes systémiques",
    exemple: "Analyse des causes profondes d'un événement indésirable, mise en place de barrières de sécurité",
    piege: "Chercher un responsable individuel plutôt qu'analyser les causes systémiques",
    mnemo: "CULTURE-POSITIVE = Collaboration + Utilisation + Loyauté + Thérapeutique + Utilisable + Responsabilité + Explications + Positive + Optimisation + Systémique + Intégrée + Thérapeutique + Intégrative + Victime + Équitable",
    subtilite: "La culture positive de l'erreur améliore la sécurité sans déresponsabiliser",
    application: "Signaler les erreurs pour améliorer le système",
    vigilance: "Distinguer responsabilité individuelle et amélioration collective"
  }
];

export const colonnesConfigIC5 = [
  { nom: 'Responsabilité Médicale', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Officielle E-LiSA', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret Précis', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Fréquent À Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
