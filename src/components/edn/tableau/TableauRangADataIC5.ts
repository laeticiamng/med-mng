
// Données spécifiques pour l'item IC-5 : Responsabilités médicales
// Basé sur la fiche E-LiSA officielle - 15 connaissances (12 Rang A + 3 Rang B)

// RANG A : 12 connaissances attendues selon E-LiSA
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
  // ... 9 autres concepts Rang A pour atteindre 12 au total
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

// RANG B : 3 connaissances attendues selon E-LiSA
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
  },
  {
    concept: "Connaître les mécanismes de gestion des risques en établissement de santé",
    definition: "Système organisé d'identification, d'évaluation et de maîtrise des risques liés aux soins dans les établissements",
    exemple: "Programme de gestion des risques avec signalement des événements indésirables et plan d'actions correctives",
    piege: "Limiter la gestion des risques aux seuls aspects techniques",
    mnemo: "GESTION-RISQUES = Gestion + Évaluation + Signalement + Thérapeutique + Intégrée + Organisation + Nécessaire + Risques + Identification + Surveillance + Qualité + Uniformisée + Efficace + Sécurisée",
    subtilite: "La gestion des risques implique tous les acteurs de l'établissement",
    application: "Participer activement au système de gestion des risques de son établissement",
    vigilance: "Intégrer la dimension humaine dans la gestion des risques"
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
