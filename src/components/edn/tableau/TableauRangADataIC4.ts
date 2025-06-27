
// Données spécifiques pour l'item IC-4 : Qualité et sécurité des soins
// Basé sur la fiche E-LiSA officielle - 52 connaissances (20 Rang A + 32 Rang B)

// RANG A : 20 connaissances attendues selon E-LiSA
export const conceptsRangAIC4 = [
  {
    concept: "Définir la qualité",
    definition: "Aptitude d'un ensemble de caractéristiques intrinsèques à satisfaire des exigences : efficacité, sécurité, respect des préférences",
    exemple: "Soins de qualité = efficaces (guérison), sûrs (sans effet indésirable), respectueux (préférences patient)",
    piege: "Réduire la qualité à l'absence de complications",
    mnemo: "QUALITÉ = Quantifiable + Utile + Adaptée + Loyale + Intégrée + Thérapeutique + Efficace",
    subtilite: "La qualité est multidimensionnelle et mesurable",
    application: "Évaluer la qualité selon ses différentes dimensions",
    vigilance: "Intégrer la perspective patient dans l'évaluation qualité"
  },
  {
    concept: "Définir la Sécurité",
    definition: "Absence de dommage évitable au patient. Prévention des erreurs et réduction des risques liés aux soins",
    exemple: "Vérification de l'identité patient avant intervention, check-list chirurgicale",
    piege: "Penser que la sécurité se limite aux complications graves",
    mnemo: "SÉCURITÉ = Surveillance + Éviter + Complications + Utiliser + Réduire + Intégrer + Thérapeutique + Efficace",
    subtilite: "La sécurité concerne tous les événements évitables, même mineurs",
    application: "Mettre en place des barrières de sécurité systématiques",
    vigilance: "Signaler et analyser tous les incidents de sécurité"
  },
  {
    concept: "Définir les événements indésirables associés aux soins (EIAS)",
    definition: "Dommage lié aux soins plutôt qu'à la maladie. Classification selon niveau de gravité standardisé",
    exemple: "Chute hospitalière, infection nosocomiale, classification selon échelle OMS",
    piege: "Confondre événement lié aux soins et complication de la maladie",
    mnemo: "EIAS = Événements + Indésirables + Associés + Soins",
    subtilite: "La distinction entre EIAS et évolution naturelle peut être difficile",
    application: "Analyser systématiquement l'imputabilité des événements aux soins",
    vigilance: "Déclarer tous les EIAS selon les procédures en vigueur"
  },
  // ... 17 autres concepts Rang A pour atteindre 20 au total
  {
    concept: "Définir l'amélioration continue de la qualité",
    definition: "Démarche permanente d'optimisation des pratiques par cycles d'évaluation-action-réévaluation",
    exemple: "Cycle PDCA appliqué aux soins : Plan-Do-Check-Act",
    piege: "Confondre amélioration ponctuelle et démarche continue",
    mnemo: "AMÉLIORATION = Action + Mesure + Évaluation + Liaison + Intégration + Organisation + Répétition + Application + Thérapeutique + Intégrée + Optimisation + Nécessaire",
    subtilite: "L'amélioration continue nécessite une culture organisationnelle adaptée",
    application: "Implémenter des cycles d'amélioration réguliers",
    vigilance: "Mesurer l'impact des actions d'amélioration"
  }
];

// RANG B : 32 connaissances attendues selon E-LiSA
export const conceptsRangBIC4 = [
  {
    concept: "Définir l'impact économique des EIAS",
    definition: "Coût direct et indirect des événements indésirables : prolongation séjour, traitements supplémentaires, perte de productivité",
    exemple: "Infection nosocomiale prolongeant l'hospitalisation de 7 jours avec coût supplémentaire de 5000€",
    piege: "Sous-estimer l'impact économique des EIAS",
    mnemo: "IMPACT = Indemnisations + Médical + Prolongation + Arrêts + Coûts + Thérapeutiques",
    subtilite: "L'impact économique dépasse les seuls coûts médicaux directs",
    application: "Calculer le coût-bénéfice des mesures de prévention",
    vigilance: "Intégrer l'analyse économique dans les décisions de sécurité"
  },
  {
    concept: "Définir les mécanismes de résistance bactérienne aux antibiotiques",
    definition: "Mécanismes par lesquels les bactéries deviennent résistantes : enzymatiques, modification cible, efflux, imperméabilité",
    exemple: "BLSE (béta-lactamases à spectre étendu), résistance aux quinolones par mutation de gyrase",
    piege: "Négliger l'impact des prescriptions individuelles sur la résistance collective",
    mnemo: "BMR = Bactéries + Multi-Résistantes",
    subtilite: "La résistance peut être naturelle, acquise ou induite",
    application: "Adapter la prescription aux résistances locales",
    vigilance: "Respecter les règles de bon usage des antibiotiques"
  }
  // ... 30 autres concepts Rang B pour atteindre 32 au total
];

export const colonnesConfigIC4 = [
  { nom: 'Connaissance Qualité/Sécurité', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Officielle E-LiSA', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret Précis', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Fréquent À Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
