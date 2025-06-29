
// Données complètes et conformes E-LiSA pour l'item IC-4 : Qualité et sécurité des soins
// Basé sur la fiche E-LiSA officielle - 20 connaissances Rang A + 32 connaissances Rang B

// RANG A : 20 connaissances fondamentales attendues selon E-LiSA
export const conceptsRangAIC4 = [
  {
    concept: "Démarche qualité",
    definition: "Améliorer en continu les pratiques professionnelles au bénéfice de la sécurité des patients. Certification des établissements de santé et accréditation des médecins. Gérée par cellule qualité et gestion des risques. Principes majeurs : traçabilité et respect des procédures",
    exemple: "Certification HAS avec 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
    piege: "Confondre qualité (global) et sécurité (une dimension)",
    mnemo: "QUALITÉ = 7 dimensions SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité",
    subtilite: "La qualité englobe 7 dimensions dont la sécurité",
    application: "Participer activement à la démarche qualité institutionnelle",
    vigilance: "Traçabilité obligatoire de toutes les actions"
  },
  {
    concept: "EIAS - Événements Indésirables Associés aux Soins",
    definition: "Événement qui a/aurait pu entraîner un préjudice à un patient lors d'un acte de prévention, investigation ou traitement. Modèle du fromage suisse de Reason : échec de plusieurs verrous de sécurité",
    exemple: "1 patient/2 jours en cabinet de médecine générale, 10% des patients hospitalisés, 40-50% des EIAS seraient évitables",
    piege: "Penser que les EIAS ne concernent que l'hôpital",
    mnemo: "EIAS = Événements Indésirables Associés Soins (fromage suisse de Reason)",
    subtilite: "40-50% évitables par amélioration du système",
    application: "Signaler systématiquement tous les EIAS",
    vigilance: "Analyse systémique plutôt que recherche de coupable"
  },
  {
    concept: "Échelle de gravité des EIAS",
    definition: "5 niveaux : 1-Mineur (désagrément/insatisfaction), 2-Intermédiaire (impact sans mise en jeu sécurité), 3-Majeur (prise en charge spécifique), 4-Critique (interruption prise en charge), 5-Catastrophique (conséquences graves irréversibles)",
    exemple: "Niveau 1: erreur rattrapée. Niveau 3: chute avec suture. Niveau 5: décès ou séquelles majeures",
    piege: "Sous-estimer l'importance des EIAS mineurs",
    mnemo: "1-Désagrément 2-Impact 3-Soins 4-Arrêt 5-Irréversible",
    subtilite: "Même les EIAS mineurs révèlent des failles système",
    application: "Classer systématiquement selon cette échelle",
    vigilance: "EIAS 4-5 nécessitent signalement externe"
  },
  {
    concept: "Aléa thérapeutique",
    definition: "Dommage accidentel lors d'un acte médical, indépendant de toute faute évitable et ne correspondant pas à l'évolution de la maladie sous-jacente. Indemnisation depuis loi 4 mars 2002",
    exemple: "Paralysie faciale après chirurgie de l'oreille malgré technique parfaite",
    piege: "Confondre aléa thérapeutique et faute médicale",
    mnemo: "ALÉA = Accident Lié Évolution Aléatoire (indemnisable)",
    subtilite: "Indemnisation sans faute depuis 2002",
    application: "Distinguer aléa des complications évitables",
    vigilance: "Information préalable sur les aléas possibles"
  },
  {
    concept: "3 grandes causes de risque lié aux soins",
    definition: "1-Actes invasifs (4,3 EIG/1000 jours hospitalisation) 2-EI médicamenteux (doses-dépendants fréquents, souvent évitables) 3-Infections associées aux soins",
    exemple: "Erreurs médicamenteuses évitables, hypoglycémie iatrogène, infections nosocomiales",
    piege: "Négliger l'une des 3 causes principales",
    mnemo: "3 CAUSES = Actes invasifs + EI médicamenteux + Infections",
    subtilite: "Prévention spécifique pour chaque cause",
    application: "Vigilance renforcée sur ces 3 domaines",
    vigilance: "Formation continue sur la prévention"
  },
  {
    concept: "Signalement des EIAS",
    definition: "Obligation de signalement interne systématique, externe pour EIAS graves (niveau 4-5). Circuit : professionnel → cellule qualité → direction → ARS si nécessaire",
    exemple: "Signalement interne chute patient, signalement externe décès évitable",
    piege: "Ne signaler que les EIAS graves",
    mnemo: "SIGNALEMENT = Systématique Interne + Sélectif Externe",
    subtilite: "Signalement ≠ sanction, but amélioration",
    application: "Signaler sans délai selon gravité",
    vigilance: "Traçabilité du signalement obligatoire"
  },
  {
    concept: "Analyse des causes d'EIAS",
    definition: "Méthode ALARM (Association of Litigation And Risk Management) : analyse systémique recherchant facteurs contributifs (individuels, équipe, tâche, patient, environnement, organisation)",
    exemple: "Analyse chute patient : facteurs patient (âge), environnement (sol glissant), organisation (manque personnel)",
    piege: "Se limiter à la recherche de responsabilité individuelle",
    mnemo: "ALARM = Analyse systémique des facteurs",
    subtilite: "Approche systémique non punitive",
    application: "Former les équipes à l'analyse ALARM",
    vigilance: "Distinguer causes immédiates et causes profondes"
  },
  {
    concept: "Culture sécurité",
    definition: "Ensemble des valeurs, attitudes, perceptions et compétences partagées déterminant l'engagement envers la gestion de la sécurité. 5 caractéristiques : information, apprentissage, signalement, juste, flexible",
    exemple: "Staff de morbi-mortalité sans sanction, retour d'expérience partagé",
    piege: "Penser qu'une procédure suffit à créer la culture",
    mnemo: "CULTURE = 5C : Confiance + Communication + Compétence + Collaboration + Continuité",
    subtilite: "La culture précède les procédures",
    application: "Promouvoir signalement non punitif",
    vigilance: "Éviter culture du blâme"
  },
  {
    concept: "Indicateurs qualité sécurité",
    definition: "Mesures quantitatives permettant d'évaluer l'état de la sécurité et qualité des soins. Indicateurs de structure, processus et résultat. Tableau de bord qualité sécurité",
    exemple: "Taux d'infections nosocomiales, délai prise en charge urgences, satisfaction patients",
    piege: "Se limiter aux indicateurs de résultat",
    mnemo: "INDICATEURS = Structure + Processus + Résultat",
    subtilite: "Indicateurs de processus plus précoces",
    application: "Suivre indicateurs régulièrement",
    vigilance: "Interpréter indicateurs avec contexte"
  },
  {
    concept: "Gestion des risques a priori",
    definition: "Identification et évaluation des risques potentiels avant survenue d'EIAS. Méthodes : AMDEC (Analyse des Modes de Défaillance), cartographie des risques, check-lists",
    exemple: "Check-list chirurgicale OMS, AMDEC circuit médicament",
    piege: "Négliger la prévention au profit de la réaction",
    mnemo: "A PRIORI = Anticiper + Prévenir + Risques + Identifier + Organiser + Réduire + Impacts",
    subtilite: "Prévention plus efficace que correction",
    application: "Utiliser check-lists systématiquement",
    vigilance: "Actualiser régulièrement les analyses de risques"
  },
  {
    concept: "Revue de Morbi-Mortalité (RMM)",
    definition: "Analyse collective, rétrospective et systémique de cas marqués par la survenue d'un décès, complication ou dysfonctionnement. But : améliorer pratiques et organisation",
    exemple: "RMM pluridisciplinaire hebdomadaire analysant cas complexes sans recherche de responsabilité",
    piege: "Transformer la RMM en tribunal",
    mnemo: "RMM = Révision + Multidisciplinaire + Morbi-Mortalité",
    subtilite: "Analyse systémique non punitive",
    application: "Participer activement aux RMM",
    vigilance: "Respecter confidentialité et bienveillance"
  },
  {
    concept: "Accréditation des médecins",
    definition: "Démarche volontaire d'amélioration des pratiques pour spécialités à risque. Analyse de pratiques, formation, gestion des risques. Organismes agréés (COFCME, FOREMADEC)",
    exemple: "Accréditation gynéco-obstétrique avec analyse de dossiers et EPP",
    piege: "Confondre accréditation et certification",
    mnemo: "ACCRÉDITATION = Amélioration Continue Ciblée Risques Élevés",
    subtilite: "Démarche volontaire pour spécialités à risque",
    application: "S'engager dans démarche si spécialité concernée",
    vigilance: "Maintenir engagement sur durée"
  },
  {
    concept: "Certification des établissements",
    definition: "Procédure d'évaluation externe réalisée par la HAS. Évalue organisation, fonctionnement et qualité des soins. Visite tous les 4 ans avec certification/sursis/non-certification",
    exemple: "Visite HAS avec évaluation 7 dimensions qualité sur 4 ans",
    piege: "Préparer seulement pour la visite",
    mnemo: "CERTIFICATION = Contrôle Externe Régulier Tous Instituts de Soins",
    subtilite: "Évaluation continue pas seulement visite",
    application: "Préparer certification en continu",
    vigilance: "Impliquer tous les professionnels"
  },
  {
    concept: "Évaluation des Pratiques Professionnelles (EPP)",
    definition: "Analyse critique de la pratique par rapport aux références admises permettant d'identifier les améliorations. Méthodes : audit, chemin clinique, revue de dossiers",
    exemple: "Audit prescription antibiotiques, évaluation délais prise en charge",
    piege: "Limiter l'EPP à obligation réglementaire",
    mnemo: "EPP = Évaluer + Pratiques + Professionnelles",
    subtilite: "Outil d'amélioration pas de sanction",
    application: "Choisir EPP pertinente pour sa pratique",
    vigilance: "Mettre en œuvre les améliorations identifiées"
  },
  {
    concept: "Droits des patients",
    definition: "Ensemble des prérogatives reconnues aux patients : information, consentement, accès au dossier, personne de confiance, directives anticipées, respect dignité",
    exemple: "Information claire avant acte, désignation personne de confiance",
    piege: "Négliger l'information par manque de temps",
    mnemo: "DROITS = Dignité + Respect + Organisation + Information + Transparence + Sécurité",
    subtilite: "Droits renforcés pour patients vulnérables",
    application: "Respecter tous les droits systématiquement",
    vigilance: "Traçabilité de l'information donnée"
  },
  {
    concept: "Déclaration des effets indésirables",
    definition: "Obligation de déclarer effets indésirables médicamenteux graves ou inattendus. Pharmacovigilance (ANSM), matériovigilance, hémovigilance selon produit concerné",
    exemple: "Déclaration effet indésirable médicament via portail ANSM",
    piege: "Ne déclarer que les effets certains",
    mnemo: "DÉCLARATION = Déclarer Effets Suspects Rapidement",
    subtilite: "Déclarer même suspicions d'imputabilité",
    application: "Déclarer via portails dédiés",
    vigilance: "Ne pas attendre certitude pour déclarer"
  },
  {
    concept: "Gestion de crise sanitaire",
    definition: "Organisation et coordination des moyens face à situation sanitaire exceptionnelle. Plan blanc, cellule de crise, communication, continuité activité",
    exemple: "Activation plan blanc COVID-19, réorganisation soins urgents",
    piege: "Improviser en situation de crise",
    mnemo: "CRISE = Coordination + Réactivité + Information + Solidarité + Efficacité",
    subtilite: "Préparation en amont essentielle",
    application: "Connaître procédures d'activation",
    vigilance: "Formation régulière aux procédures"
  },
  {
    concept: "Continuité des soins",
    definition: "Prise en charge du patient sans rupture, coordination entre professionnels et structures. Transmission d'informations, permanence des soins, astreintes",
    exemple: "Transmission ciblée entre équipes, dossier partagé, garde médicale",
    piege: "Négliger qualité des transmissions",
    mnemo: "CONTINUITÉ = Coordination + Organisation + Transmission + Information",
    subtilite: "Qualité transmissions = qualité continuité",
    application: "Structurer transmissions équipes",
    vigilance: "Vérifier compréhension informations transmises"
  },
  {
    concept: "Secret professionnel et confidentialité",
    definition: "Obligation de ne pas divulguer informations concernant patient. Exceptions légales limitées. Protection données personnelles de santé (RGPD)",
    exemple: "Non-divulgation informations sauf urgence vitale ou obligation légale",
    piege: "Partager informations même entre professionnels sans nécessité",
    mnemo: "SECRET = Sécuriser + Éthique + Confidentialité + Respect + Exceptions + Limitées",
    subtilite: "Secret partagé entre professionnels soignants",
    application: "Limiter accès aux informations nécessaires",
    vigilance: "Respecter RGPD pour données numériques"
  },
  {
    concept: "Éthique médicale et déontologie",
    definition: "Ensemble des règles morales et professionnelles guidant l'exercice médical. Code de déontologie, comités d'éthique, principes fondamentaux",
    exemple: "Respect autonomie patient, bienfaisance, non-malfaisance, justice",
    piege: "Appliquer règles sans réflexion éthique",
    mnemo: "ÉTHIQUE = Équité + Transparence + Humanité + Intégrité + Qualité + Utilité + Efficacité",
    subtilite: "Éthique guide déontologie, pas inverse",
    application: "Consulter comité éthique si dilemme",
    vigilance: "Maintenir réflexion éthique continue"
  }
];

// RANG B : 32 connaissances expertes attendues selon E-LiSA
export const conceptsRangBIC4 = [
  {
    concept: "Infections associées aux soins - Définitions",
    definition: "IAS : infection au cours ou décours prise en charge. Ni présente ni en incubation au début. Infection nosocomiale si établissement santé > 48h après admission",
    exemple: "Infection urinaire sur sonde > 48h hospitalisation = infection nosocomiale",
    piege: "Confondre IAS et infections communautaires",
    mnemo: "IAS = Infections Associées Soins (> 48h)",
    subtilite: "Critère temporel : > 48h après admission",
    application: "Surveillance active des IAS",
    vigilance: "Déclaration obligatoire selon gravité"
  },
  {
    concept: "Épidémiologie des IAS",
    definition: "Coût global : 760 millions €/an. 1/20 patients médecine (infections urinaires +++), chirurgie (ISO +++). Réanimation 1% : infections respiratoires > bactériémies",
    exemple: "15 pneumopathies/1000 jours ventilation, ISO 2-5% interventions",
    piege: "Sous-estimer l'impact économique",
    mnemo: "IAS = 760M€/an, 1/20 médecine, 1% réanimation",
    subtilite: "Coût élevé justifiant la prévention",
    application: "Programmes de prévention ciblés",
    vigilance: "Surveillance épidémiologique continue"
  },
  {
    concept: "BMR et BHR - Définitions",
    definition: "BMR = bactéries multi-résistantes (BLSE, SARM). BHR = bactéries hautement résistantes (EPC, ERV). Réservoirs : cutané (SARM), digestif (BLSE, ERV, EPC)",
    exemple: "SARM cutané, BLSE digestives, transmission manuportée ++",
    piege: "Confondre BMR et BHR",
    mnemo: "BMR = Multi-résistantes, BHR = Hautement résistantes",
    subtilite: "Réservoirs et voies transmission spécifiques",
    application: "Précautions adaptées selon type",
    vigilance: "Hygiène mains cruciale"
  },
  {
    concept: "Mécanismes résistance antibiotiques",
    definition: "Mutation chromosomique (rare, vertical, stable) vs Plasmides (80-90%, horizontal, instable, dépendant pression sélection, multi-familles)",
    exemple: "Résistance plasmidique fréquente et transférable",
    piege: "Négliger aspect horizontal résistances",
    mnemo: "RÉSISTANCE = Rare chromosomique vs Fréquente plasmidique",
    subtilite: "Pression sélection favorise résistances",
    application: "Bon usage antibiotiques",
    vigilance: "Limiter pression sélection"
  },
  {
    concept: "Précautions hygiène standard",
    definition: "Systématiques : SHA +++ (20-30s, 7 temps) > lavage sauf C. difficile + Gale. Masque si infection respiratoire. Gants si contact liquides biologiques",
    exemple: "SHA systématique, exceptions Gale + C. difficile résistent SHA",
    piege: "Oublier exceptions SHA",
    mnemo: "SHA = 7 temps 20-30s, Exceptions Gale + C. difficile",
    subtilite: "SHA plus efficace que lavage sauf exceptions",
    application: "Application systématique tous patients",
    vigilance: "Gale et C. difficile nécessitent lavage"
  },
  {
    concept: "Précautions hygiène complémentaires",
    definition: "3 types sur prescription médicale : Air (< 5μm), Gouttelettes (> 5μm), Contact (manuporté). Tuberculose/Rougeole/Varicelle (Air), Grippe/Coqueluche (Gouttelettes), BMR/SARM (Contact)",
    exemple: "FFP2 (Air), masque chirurgical (Gouttelettes), gants+surblouse (Contact)",
    piege: "Mauvaise catégorisation précautions",
    mnemo: "3 TYPES = Air + Gouttelettes + Contact",
    subtilite: "Prescription médicale obligatoire",
    application: "Respect strict indications",
    vigilance: "Formation personnel 3 types"
  },
  {
    concept: "Surveillance microbiologique",
    definition: "Prélèvements ciblés : hémocultures (bactériémies), ECBU (infections urinaires), prélèvements respiratoires (pneumopathies). Dépistage BMR/BHR",
    exemple: "Hémocultures avant antibiotiques, ECBU si signes",
    piege: "Prélèvements systématiques non justifiés",
    mnemo: "SURVEILLANCE = Ciblée + Justifiée + Interprétée",
    subtilite: "Qualité prélèvement = qualité résultat",
    application: "Prélèvements selon recommandations",
    vigilance: "Éviter contaminations prélèvements"
  },
  {
    concept: "Antibiothérapie et résistances",
    definition: "Règles prescription : spectre étroit si documentation, durée courte, réévaluation 48-72h. Éviter associations non justifiées. Politique antibiotique locale",
    exemple: "Amoxicilline vs amoxicilline-clavulanique selon antibiogramme",
    piege: "Prescription large spectre systématique",
    mnemo: "ANTIBIOTIQUES = Adaptés + Nécessaires + Ciblés + Limités",
    subtilite: "Chaque prescription impact écologie",
    application: "Respecter politique locale",
    vigilance: "Réévaluation systématique 72h"
  },
  {
    concept: "Prévention infections site opératoire",
    definition: "Antibioprophylaxie selon intervention : choix molécule, timing (30min-1h avant incision), durée (< 24h). Préparation cutanée, asepsie chirurgicale",
    exemple: "Céfazoline 30min avant incision, durée 24h maximum",
    piege: "Prolonger antibioprophylaxie au-delà 24h",
    mnemo: "ANTIBIOPROPHYLAXIE = Adaptée + Brève + Ciblée",
    subtilite: "Efficacité liée au timing",
    application: "Respecter protocoles service",
    vigilance: "Pas d'extension durée"
  },
  {
    concept: "Gestion environnement hospitalier",
    definition: "Entretien locaux : détergent-désinfectant, surfaces hautes puis basses. Bio-nettoyage quotidien + terminal. Gestion déchets selon filières (DASRI, DAOM)",
    exemple: "Bio-nettoyage avec produit détergent-désinfectant, tri déchets",
    piege: "Négliger qualité entretien environnement",
    mnemo: "ENVIRONNEMENT = Entretien + Nettoyage + Désinfection",
    subtilite: "Environnement = réservoir potentiel",
    application: "Contrôler qualité entretien",
    vigilance: "Formation équipes entretien"
  },
  {
    concept: "Impact économique EIAS",
    definition: "Coût direct : prolongation séjour, traitements supplémentaires. Coût indirect : perte productivité, image établissement. ROI prévention > coût EIAS",
    exemple: "Infection nosocomiale : +7 jours séjour, +5000€ coût",
    piege: "Sous-estimer impact économique",
    mnemo: "IMPACT = Indemnisations + Médical + Prolongation + Arrêts + Coûts + Thérapeutiques",
    subtilite: "Impact dépasse coûts médicaux directs",
    application: "Calculer coût-bénéfice prévention",
    vigilance: "Intégrer analyse économique décisions"
  },
  {
    concept: "Analyse risque a posteriori",
    definition: "Méthodes : RCA (Root Cause Analysis), arbre des causes, méthode ALARM. Identification facteurs contributifs, mesures correctives, évaluation efficacité",
    exemple: "RCA après erreur médicamenteuse : facteurs prescription, dispensation, administration",
    piege: "Se limiter à causes immédiates",
    mnemo: "RCA = Root Cause Analysis (causes profondes)",
    subtilite: "Rechercher causes système",
    application: "Former équipes méthodes analyse",
    vigilance: "Mesures correctives sur causes profondes"
  },
  {
    concept: "Simulation en santé",
    definition: "Outil pédagogique reproduisant situations cliniques sans risque patient. Simulation haute-fidélité, jeux de rôles, patients simulés. Débriefing structuré essentiel",
    exemple: "Simulation arrêt cardiaque, débriefing analyse pratiques",
    piege: "Négliger importance débriefing",
    mnemo: "SIMULATION = Sécurisée + Immersive + Apprenante",
    subtilite: "Apprentissage dans débriefing",
    application: "Participer sessions simulation",
    vigilance: "Environnement bienveillant nécessaire"
  },
  {
    concept: "Never events",
    definition: "Événements graves évitables ne devant jamais arriver : chirurgie mauvais site, corps étranger oublié, mauvais patient, incompatibilité ABO. Signalement obligatoire",
    exemple: "Chirurgie côté controlatéral, compresse oubliée",
    piege: "Penser que never events sont rares",
    mnemo: "NEVER = Jamais d'Événements Vraiment Évitables",
    subtilite: "Prévention par barrières multiples",
    application: "Check-lists systématiques",
    vigilance: "Signalement immédiat obligatoire"
  },
  {
    concept: "Facteurs humains et sécurité",
    definition: "Science étudiant interactions homme-système-environnement. Charge mentale, fatigue, stress, communication, travail équipe influencent sécurité",
    exemple: "Erreur plus fréquente si fatigue, stress, surcharge",
    piege: "Négliger facteurs humains dans analyse",
    mnemo: "FACTEURS HUMAINS = Fatigue + Attention + Communication + Travail équipe + Environnement",
    subtilite: "Erreur humaine souvent défaillance système",
    application: "Intégrer facteurs humains analyse risques",
    vigilance: "Conditions travail impactent sécurité"
  },
  {
    concept: "Qualité perçue par patients",
    definition: "Évaluation subjective qualité par patients : satisfaction, expérience patient, recommandation. Questionnaires validés (I-SATIS), certification patients traceurs",
    exemple: "Enquête satisfaction, patient traceur HAS",
    piege: "Négliger dimension relationnelle qualité",
    mnemo: "QUALITÉ PATIENT = Satisfaction + Expérience + Recommandation",
    subtilite: "Qualité technique ≠ qualité perçue",
    application: "Recueillir systématiquement avis patients",
    vigilance: "Prendre en compte retours patients"
  },
  {
    concept: "Certification des compétences",
    definition: "Validation formelle compétences par organisme tiers. DPC (Développement Professionnel Continu), recertification périodique, portfolios compétences",
    exemple: "DPC obligatoire, recertification tous les 6 ans",
    piege: "Limiter formation aux obligations",
    mnemo: "DPC = Développement Professionnel Continu",
    subtilite: "Formation continue = obligation professionnelle",
    application: "Planifier DPC selon besoins",
    vigilance: "Maintenir compétences à jour"
  },
  {
    concept: "Intelligence artificielle et qualité",
    definition: "IA appliquée santé : aide décision clinique, détection précoce complications, optimisation parcours. Enjeux : validation clinique, explicabilité, éthique",
    exemple: "IA détection rétinopathie diabétique, aide prescription",
    piege: "Déléguer décision à IA sans contrôle",
    mnemo: "IA SANTÉ = Intelligence + Application + Sécurisée + Validée",
    subtilite: "IA = aide décision, pas remplacement",
    application: "Valider cliniquement propositions IA",
    vigilance: "Maintenir réflexion clinique critique"
  },
  {
    concept: "Télémédecine et sécurité",
    definition: "Pratique médicale à distance : téléconsultation, téléexpertise, télésurveillance. Sécurité données, identification patient, continuité soins",
    exemple: "Téléconsultation sécurisée, partage dossier crypté",
    piege: "Négliger sécurité données télémédecine",
    mnemo: "TÉLÉMÉDECINE = Technique + Éthique + Légale + Sécurisée",
    subtilite: "Même exigences qualité qu'en présentiel",
    application: "Respecter règles télémédecine",
    vigilance: "Sécuriser échanges données"
  },
  {
    concept: "Parcours patient et coordination",
    definition: "Organisation fluide prise en charge multi-professionnelle. Coordination ville-hôpital, case management, planification sortie, éducation thérapeutique",
    exemple: "Coordinateur parcours, liaison ville-hôpital, éducation patient",
    piege: "Organiser soins en silos",
    mnemo: "PARCOURS = Planifié + Adapté + Coordonné + Sécurisé",
    subtilite: "Coordination améliore qualité et sécurité",
    application: "Participer coordination pluriprofessionnelle",
    vigilance: "Éviter ruptures parcours"
  },
  {
    concept: "Évaluation coût-efficacité",
    definition: "Analyse économique comparant coûts et résultats interventions santé. QALY (Quality Adjusted Life Years), analyses médico-économiques, tarification activité",
    exemple: "Évaluation QALY nouveau traitement vs coût",
    piege: "Négliger dimension économique décisions",
    mnemo: "COÛT-EFFICACITÉ = Comparaison + Optimisation + Ressources",
    subtilite: "Efficience ≠ efficacité",
    application: "Intégrer dimension économique décisions",
    vigilance: "Optimiser rapport coût-efficacité"
  },
  {
    concept: "Recherche clinique et qualité",
    definition: "Études cliniques contribuant amélioration qualité soins. Méthodologie rigoureuse, éthique recherche, transfert résultats pratique clinique",
    exemple: "Essai clinique nouveau protocole, transfert recommandations",
    piege: "Dissocier recherche et pratique",
    mnemo: "RECHERCHE = Rigoureuse + Éthique + Applicable",
    subtilite: "Recherche clinique améliore pratiques",
    application: "Participer recherche clinique si possible",
    vigilance: "Appliquer résultats validés"
  },
  {
    concept: "Gestion changement organisationnel",
    definition: "Conduite transformation organisations santé. Accompagnement équipes, formation, communication, évaluation impact. Résistances changement normales",
    exemple: "Déploiement nouveau système information, accompagnement utilisateurs",
    piege: "Imposer changement sans accompagnement",
    mnemo: "CHANGEMENT = Communication + Accompagnement + Formation + Évaluation",
    subtilite: "Résistance = signal à analyser",
    application: "Participer activement projets changement",
    vigilance: "Anticiper résistances et besoins formation"
  },
  {
    concept: "Responsabilité sociétale établissements",
    definition: "Engagement établissements santé : développement durable, achats responsables, lutte inégalités santé, formation professionnels. RSE secteur santé",
    exemple: "Réduction déchets, achats équitables, accès soins populations vulnérables",
    piege: "Limiter responsabilité aux soins",
    mnemo: "RSE SANTÉ = Responsabilité + Sociétale + Élargie",
    subtilite: "Santé = bien commun, responsabilité collective",
    application: "Participer actions RSE établissement",
    vigilance: "Intégrer dimension sociétale pratiques"
  },
  {
    concept: "Résilience système santé",
    definition: "Capacité système santé maintenir fonctions essentielles face perturbations. Anticipation, absorption chocs, adaptation, apprentissage organisationnel",
    exemple: "Adaptation COVID-19, maintien soins essentiels",
    piege: "Préparer seulement aux crises connues",
    mnemo: "RÉSILIENCE = Résistance + Adaptation + Apprentissage",
    subtilite: "Résilience se construit en continu",
    application: "Développer capacités adaptation",
    vigilance: "Apprendre de chaque crise"
  },
  {
    concept: "Éthique et intelligence collective",
    definition: "Processus décisionnel collectif intégrant expertise, expérience, valeurs. Comités éthique, consultations pluridisciplinaires, décision partagée",
    exemple: "Consultation éthique cas complexe, décision collégiale",
    piege: "Décider seul situations complexes",
    mnemo: "ÉTHIQUE COLLECTIVE = Expertise + Expérience + Valeurs partagées",
    subtilite: "Intelligence collective > somme intelligences individuelles",
    application: "Solliciter avis pairs situations complexes",
    vigilance: "Respecter temps réflexion collective"
  },
  {
    concept: "Innovation et amélioration continue",
    definition: "Intégration innovations technologiques et organisationnelles. Cycle innovation : idéation, expérimentation, évaluation, déploiement. Culture innovation",
    exemple: "Living lab santé, expérimentation innovations, déploiement validé",
    piege: "Innover sans évaluation bénéfice-risque",
    mnemo: "INNOVATION = Idée + Expérimentation + Évaluation + Déploiement",
    subtilite: "Innovation ≠ technologie, peut être organisationnelle",
    application: "Proposer améliorations pratiques",
    vigilance: "Évaluer impact innovations"
  },
  {
    concept: "Leadership transformationnel qualité",
    definition: "Style leadership inspirant transformation durable organisations. Vision partagée, autonomisation équipes, exemplarité, reconnaissance contributions",
    exemple: "Manager inspirant équipe vers excellence, reconnaissance initiatives",
    piege: "Confondre autorité et leadership",
    mnemo: "LEADERSHIP = Vision + Inspiration + Autonomisation + Reconnaissance",
    subtilite: "Leadership = influence positive, pas autorité",
    application: "Développer compétences leadership",
    vigilance: "Exemplarité dans comportements"
  },
  {
    concept: "Mesure impact qualité de vie",
    definition: "Évaluation impact interventions santé sur qualité vie patients. Échelles validées (SF-36, EQ-5D), PRO (Patient Reported Outcomes), PROM (Patient Reported Outcome Measures)",
    exemple: "Questionnaire qualité vie avant/après traitement",
    piege: "Se limiter aux critères biomédicaux",
    mnemo: "QUALITÉ VIE = Subjective + Multidimensionnelle + Évolutive",
    subtilite: "Qualité vie ≠ état santé objectif",
    application: "Intégrer évaluation qualité vie",
    vigilance: "Respecter perspective patient"
  },
  {
    concept: "Gouvernance données santé",
    definition: "Organisation gestion données santé : collecte, stockage, partage, sécurité. RGPD, hébergement données santé (HDS), interopérabilité systèmes",
    exemple: "Hébergement HDS, consentement RGPD, interopérabilité DMP",
    piege: "Négliger sécurité données numériques",
    mnemo: "GOUVERNANCE DONNÉES = Sécurité + Interopérabilité + Conformité",
    subtilite: "Données santé = données sensibles",
    application: "Respecter règles gouvernance données",
    vigilance: "Sécuriser accès données patients"
  },
  {
    concept: "Amélioration expérience patient",
    definition: "Démarche centrée patient améliorant son vécu : accueil, information, participation décisions, confort, suivi. Design thinking appliqué santé",
    exemple: "Parcours patient optimisé, signalétique claire, délais réduits",
    piege: "Confondre satisfaction et expérience",
    mnemo: "EXPÉRIENCE = Émotions + Perceptions + Interactions + Parcours",
    subtilite: "Expérience = ressenti global du parcours",
    application: "Co-concevoir parcours avec patients",
    vigilance: "Évaluer expérience à chaque étape"
  },
  {
    concept: "Prévention burnout professionnel",
    definition: "Syndrome épuisement professionnel : épuisement émotionnel, dépersonnalisation, perte accomplissement. Facteurs organisationnels, prévention collective et individuelle",
    exemple: "Charge travail équilibrée, soutien équipe, reconnaissance",
    piege: "Traiter burnout individuellement seulement",
    mnemo: "BURNOUT = Épuisement + Dépersonnalisation + Perte accomplissement",
    subtilite: "Prévention = responsabilité collective",
    application: "Identifier signaux précoces équipes",
    vigilance: "Agir sur facteurs organisationnels"
  }
];

export const colonnesConfigIC4 = [
  { nom: 'Concept Qualité/Sécurité', icone: '🎯', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition E-LiSA', icone: '📖', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret', icone: '💡', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège À Éviter', icone: '⚠️', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Mnémotechnique', icone: '🧠', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', icone: '🔍', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', icone: '🎯', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', icone: '🛡️', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
