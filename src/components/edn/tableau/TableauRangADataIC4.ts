
// Concepts Rang A IC-4 selon LiSA officielle : 13 connaissances fondamentales
export const conceptsRangAIC4 = [
  {
    concept: "Définir la Qualité",
    definition: "Démarche d'amélioration continue des pratiques professionnelles au bénéfice de la sécurité des patients. 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
    exemple: "Certification HAS avec 7 dimensions SPEC-AEC",
    piege: "Ne pas confondre qualité et sécurité - la sécurité n'est qu'une dimension",
    mnemo: "SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité",
    subtilite: "La qualité englobe 7 dimensions dont la sécurité",
    application: "Participer à la démarche qualité institutionnelle",
    vigilance: "Traçabilité obligatoire de toutes les actions"
  },
  {
    concept: "Définir la Sécurité",
    definition: "Absence pour un patient d'atteinte inutile ou potentielle associée aux soins de santé (OMS 2009). Maximisation des bénéfices ET minimalisation des risques",
    exemple: "Prévention chutes, erreurs médicamenteuses, infections nosocomiales",
    piege: "Oublier que sécurité = maximisation bénéfices ET minimalisation risques",
    mnemo: "SÉCURITÉ = Sans Erreur Contre Utilisateur Risque Inutile",
    subtilite: "La sécurité parfaite n'existe pas - équilibrer bénéfice/risque",
    application: "Évaluer systématiquement rapport bénéfice/risque",
    vigilance: "Tout acte médical comporte des risques"
  },
  {
    concept: "Définir EIAS et gravité",
    definition: "Événements Indésirables Associés aux Soins : événement ayant entraîné ou aurait pu entraîner un préjudice patient. 5 niveaux gravité. Notion évitabilité (40-50%), événement porteur risque, aléa thérapeutique",
    exemple: "Niveau 1: erreur rattrapée. Niveau 5: séquelles irréversibles",
    piege: "Sous-estimer EIAS mineurs révélateurs failles système",
    mnemo: "EIAS = 5 niveaux : Mineur Intermédiaire Majeur Critique catastrophiQue",
    subtilite: "40-50% EIAS évitables par amélioration système",
    application: "Classer et signaler selon niveau gravité",
    vigilance: "EIAS 4-5 nécessitent signalement externe obligatoire"
  },
  {
    concept: "Définition antisepsie",
    definition: "Opération au résultat momentané permettant d'éliminer ou tuer microorganismes et/ou inactiver virus sur tissus vivants par application topique antiseptique",
    exemple: "Bétadine, Dakin, Biseptine sur peau avant injection",
    piege: "Confondre antisepsie (tissus vivants) et désinfection (surfaces inertes)",
    mnemo: "ANTISEPSIE = Anti-Septique Peau Tissus Vivants",
    subtilite: "Action momentané nécessitant renouvellement",
    application: "Choisir antiseptique selon site anatomique",
    vigilance: "Respecter temps contact et concentrations"
  },
  {
    concept: "Modalités antisepsie peau saine/lésée/muqueuses",
    definition: "Peau saine: alcool 70°, bétadine alcoolique. Peau lésée: bétadine dermique, Dakin. Muqueuses: bétadine gynécologique, chlorhexidine aqueuse",
    exemple: "Injection IM: alcool 70°. Plaie: Dakin. Sondage: bétadine gynécologique",
    piege: "Utiliser antiseptique alcoolique sur peau lésée (brûlure)",
    mnemo: "SAINE-alcool, LÉSÉE-aqueux, MUQUEUSE-spécifique",
    subtilite: "Alcool contre-indiqué sur peau lésée et muqueuses",
    application: "Adapter antiseptique selon intégrité tissulaire",
    vigilance: "Vérifier allergies avant application"
  },
  {
    concept: "Définition et règles asepsie",
    definition: "Ensemble moyens mis en œuvre pour empêcher tout apport exogène microorganismes ou virus au niveau site opératoire, dispositifs invasifs. Asepsie chirurgicale stricte",
    exemple: "Bloc opératoire: champs stériles, instruments stérilisés, habillage stérile",
    piege: "Confondre asepsie (prévention contamination) et antisepsie (élimination)",
    mnemo: "ASEPSIE = Absence Septique Prévention Contamination",
    subtilite: "Asepsie = méthode préventive, antisepsie = méthode curative",
    application: "Respecter protocoles asepsie selon actes",
    vigilance: "Rupture asepsie = recommencer procédure"
  },
  {
    concept: "Définition et règles détersion",
    definition: "Élimination par lavage d'éléments indésirables (matières organiques, souillures, salissures) d'un matériel ou d'une surface par action mécanique et/ou physico-chimique",
    exemple: "Lavage plaie avant désinfection, nettoyage instruments avant stérilisation",
    piege: "Omettre détersion avant désinfection (baisse efficacité)",
    mnemo: "DÉTERSION = DÉTergent Élimination Souillures",
    subtilite: "Étape préalable obligatoire à toute désinfection",
    application: "Systématique avant tout acte de désinfection",
    vigilance: "Détersion insuffisante = échec désinfection"
  },
  {
    concept: "Définition et règles désinfection",
    definition: "Opération au résultat momentané permettant d'éliminer ou tuer microorganismes et/ou inactiver virus portés par milieux inertes contaminés",
    exemple: "Alcool 70° sur thermomètre, Javel sur surfaces",
    piege: "Confondre désinfection (surfaces inertes) et antisepsie (tissus vivants)",
    mnemo: "DÉSINFECTION = Surfaces Inertes Matériel",
    subtilite: "Nécessite détersion préalable pour efficacité optimale",
    application: "Désinfecter matériel médical entre patients",
    vigilance: "Respecter concentrations et temps de contact"
  },
  {
    concept: "Règles utilisation antiseptiques",
    definition: "Choix selon site anatomique, respect temps contact, concentration appropriée, pas d'association, conditionnement stérile pour actes invasifs",
    exemple: "Alcool 70° injection, Bétadine dermique plaie, pas mélange produits",
    piege: "Mélanger antiseptiques (neutralisation mutuelle)",
    mnemo: "RÈGLES = Site Temps Concentration Sans Association",
    subtilite: "Chaque antiseptique a ses indications spécifiques",
    application: "Protocol précis selon acte et localisation",
    vigilance: "Jamais mélange antiseptiques différents"
  },
  {
    concept: "Hygiène mains et SHA",
    definition: "Friction hydro-alcoolique (SHA) technique référence 20-30s en 7 temps. Remplace lavage sauf 2 exceptions: C. difficile et Gale (SHA + savon doux)",
    exemple: "SHA systématique avant/après contact patient, 7 temps protocole",
    piege: "Oublier exceptions C. difficile et Gale résistant SHA",
    mnemo: "SHA = 7 temps 20-30s, Exceptions Gale + C. difficile",
    subtilite: "SHA plus efficace que lavage sauf exceptions spécifiques",
    application: "Systématiquement avant/après tout contact patient",
    vigilance: "Gale et C. difficile nécessitent lavage obligatoire"
  },
  {
    concept: "Définition IAS",
    definition: "Infections Associées aux Soins: infection au cours ou décours prise en charge diagnostique, thérapeutique, palliative, préventive, éducative. Critère temporel > 48h admission",
    exemple: "Infection nosocomiale établissement > 48h, infection ambulatoire domicile",
    piege: "Confondre IAS et infections communautaires",
    mnemo: "IAS = Infections Associées Soins > 48h",
    subtilite: "Inclut établissements ET soins ambulatoires",
    application: "Surveillance active selon critères temporels",
    vigilance: "Déclaration obligatoire selon gravité"
  },
  {
    concept: "Ministère Affaires Sociales et Santé",
    definition: "Politique nationale santé, réglementation, veille sanitaire, gestion crises, tutelle ARS et agences sanitaires. Organisation territoriale déconcentrée",
    exemple: "Gestion COVID-19, réglementation médicaments, tutelle HAS/ANSM",
    piege: "Confondre rôles ministère (politique) et agences (technique)",
    mnemo: "MINISTÈRE = Politique Réglementation Tutelle Crises",
    subtilite: "Échelon politique de décision, agences d'expertise technique",
    application: "Comprendre organisation sanitaire française",
    vigilance: "Distinction claire politique/technique"
  },
  {
    concept: "HAS missions qualité sécurité",
    definition: "Haute Autorité Santé: certification établissements, accréditation médecins, recommandations bonnes pratiques, évaluation technologies santé, indicateurs qualité IQSS",
    exemple: "Certification V2020, recommandations HAS, indicateurs IQSS",
    piege: "Confondre certification (établissements) et accréditation (professionnels)",
    mnemo: "HAS = Certification Accréditation Recommandations Évaluation",
    subtilite: "Autorité indépendante d'expertise et d'évaluation",
    application: "Respecter recommandations HAS dans pratique",
    vigilance: "Mise à jour régulière recommandations"
  }
];

// Concepts Rang B IC-4 selon LiSA officielle : 22 connaissances expertes
export const conceptsRangBIC4 = [
  {
    concept: "Impact économique EIAS",
    definition: "Coût direct: prolongation séjour +7j, +5000€. Coût indirect: perte productivité, image. 760M€/an France. ROI prévention > coût EIAS",
    exemple: "Infection nosocomiale: +7j hospitalisation, +5000€ coût direct",
    piege: "Sous-estimer impact économique global dépassant coûts médicaux",
    mnemo: "IMPACT = 760M€ France + Prolongation + Productivité",
    subtilite: "Coûts indirects souvent > coûts directs",
    application: "Calculer coût-bénéfice programmes prévention",
    vigilance: "Intégrer dimension économique dans décisions"
  },
  {
    concept: "Mécanismes transmissibilité BMR",
    definition: "Bactéries Multi-Résistantes: transmission horizontale plasmides (80-90%), verticale chromosomique (rare). Réservoirs cutané (SARM), digestif (BLSE)",
    exemple: "SARM transmission manuportée, BLSE digestives résistance plasmidique",
    piege: "Négliger transmission horizontale plasmidique majoritaire",
    mnemo: "BMR = 80% Plasmides horizontaux vs 20% Chromosomes verticaux",
    subtilite: "Pression sélection antibiotique favorise résistances",
    application: "Bon usage antibiotiques, hygiène mains++",
    vigilance: "Précautions contact selon réservoirs"
  },
  {
    concept: "Mécanismes résistances transférables",
    definition: "Plasmides et transposons: transfert horizontal inter-espèces, multi-résistance, instabilité selon pression sélection. Mécanismes enzymatiques béta-lactamases",
    exemple: "BLSE transférable entérobactéries, résistance multi-familles",
    piege: "Sous-estimer capacité transfert inter-espèces",
    mnemo: "TRANSFERT = Plasmides Inter-espèces Multi-résistance",
    subtilite: "Instabilité résistances en absence pression",
    application: "Stratégies limitation pression sélection",
    vigilance: "Surveillance émergence nouvelles résistances"
  },
  {
    concept: "Structures EIAS France",
    definition: "ANSM (médicaments/DM), ARS (territorial), CPP (recherche), OMEDIT (bon usage), centres antipoison, réseaux surveillance (REA-RAISIN)",
    exemple: "Signalement ANSM effets indésirables, ARS investigation épidémies",
    piege: "Confondre rôles structures nationales/territoriales",
    mnemo: "ANSM-national, ARS-territorial, CPP-recherche",
    subtilite: "Complémentarité structures surveillance",
    application: "Orienter signalements vers bonnes structures",
    vigilance: "Respecter circuits déclaration obligatoire"
  }
];

// Configuration colonnes optimisée IC-4
export const colonnesConfigIC4 = [
  {
    nom: 'Concept',
    icone: '🎯',
    couleur: 'bg-blue-600',
    couleurCellule: 'bg-blue-50 border-blue-300',
    couleurTexte: 'text-blue-800 font-bold',
    obligatoire: true
  },
  {
    nom: 'Définition',
    icone: '📖',
    couleur: 'bg-green-600',
    couleurCellule: 'bg-green-50 border-green-300',
    couleurTexte: 'text-green-800',
    obligatoire: true
  },
  {
    nom: 'Exemple',
    icone: '💡',
    couleur: 'bg-amber-600',
    couleurCellule: 'bg-amber-50 border-amber-300',
    couleurTexte: 'text-amber-800',
    obligatoire: false
  },
  {
    nom: 'Piège',
    icone: '⚠️',
    couleur: 'bg-red-600',
    couleurCellule: 'bg-red-50 border-red-300',
    couleurTexte: 'text-red-800 font-semibold',
    obligatoire: false
  },
  {
    nom: 'Mnémotechnique',
    icone: '🧠',
    couleur: 'bg-purple-600',
    couleurCellule: 'bg-purple-50 border-purple-300',
    couleurTexte: 'text-purple-800 font-medium italic',
    obligatoire: false
  },
  {
    nom: 'Subtilité',
    icone: '🔍',
    couleur: 'bg-indigo-600',
    couleurCellule: 'bg-indigo-50 border-indigo-300',
    couleurTexte: 'text-indigo-800',
    obligatoire: false
  },
  {
    nom: 'Application',
    icone: '🎯',
    couleur: 'bg-teal-600',
    couleurCellule: 'bg-teal-50 border-teal-300',
    couleurTexte: 'text-teal-800 font-medium',
    obligatoire: false
  },
  {
    nom: 'Vigilance',
    icone: '🛡️',
    couleur: 'bg-orange-600',
    couleurCellule: 'bg-orange-50 border-orange-300',
    couleurTexte: 'text-orange-800 font-semibold',
    obligatoire: false
  }
];
