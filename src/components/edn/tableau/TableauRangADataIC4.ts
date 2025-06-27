export const conceptsRangAIC4 = [
  {
    concept: "Qualité des soins",
    definition: "Démarche d'amélioration continue des pratiques professionnelles au bénéfice de la sécurité des patients, par gestion optimisée des risques. 7 dimensions : sécurité, pertinence, acceptabilité, accessibilité, continuité, efficacité, efficience",
    exemple: "Certification des établissements de santé et accréditation des médecins - Cellule qualité avec qualiticiennes/qualiticiens",
    piege: "Ne pas confondre qualité et sécurité - la sécurité n'est qu'une des 7 dimensions de la qualité",
    mnemo: "SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité",
    subtilite: "Principe majeur : écrire ce qu'on fait (traçabilité) ET faire ce qu'on écrit (respect procédures)",
    application: "Participer activement à la démarche qualité de l'établissement, respecter la traçabilité",
    vigilance: "La qualité concerne TOUS les professionnels, pas seulement les qualiticiennes/qualiticiens"
  },
  {
    concept: "Sécurité des patients",
    definition: "Absence pour un patient d'atteinte inutile ou potentielle associée aux soins de santé (OMS 2009). Maximisation des bénéfices ET minimalisation des risques",
    exemple: "Prévention des chutes, des erreurs médicamenteuses, des infections nosocomiales",
    piege: "Ne pas oublier que sécurité = maximisation bénéfices ET minimalisation risques (double objectif)",
    mnemo: "SÉCURITÉ = Sans Erreur Contre Utilisateur Risque Inutile Thérapeutique Évitable",
    subtilite: "La sécurité parfaite n'existe pas - il faut équilibrer bénéfice/risque",
    application: "Évaluer systématiquement le rapport bénéfice/risque de chaque intervention",
    vigilance: "Tout acte médical comporte des risques - informer le patient"
  },
  {
    concept: "EIAS (Événement Indésirable Associé aux Soins)",
    definition: "Événement ayant entraîné ou aurait pu entraîner un préjudice à un patient, survenu lors de prévention, investigation ou traitement. Concerne 1 patient/2 jours en médecine générale, 10% des hospitalisations",
    exemple: "Erreur d'identification rattrapée (niveau 1), chute avec plaie nécessitant suture (niveau 3), ablation du mauvais rein (niveau 5)",
    piege: "Ne pas confondre EIAS et EIG - EIG = sous-catégorie d'EIAS avec critères de gravité spécifiques",
    mnemo: "EIAS = 5 niveaux : Mineur Intermédiaire Majeur Critique catastrophiQue",
    subtilite: "Modèle du fromage suisse de Reason - conjonction de plusieurs facteurs, échec des verrous",
    application: "Déclarer tout EIAS selon le niveau de gravité, analyser les causes",
    vigilance: "40-50% des EIAS sont évitables - focus sur la prévention"
  },
  {
    concept: "Échelle de gravité EIAS",
    definition: "5 niveaux : 1-Mineur (désagrément simple), 2-Intermédiaire (impact sans danger), 3-Majeur (soins spécifiques), 4-Critique (interruption traitement, réversible), 5-Catastrophique (séquelles irréversibles)",
    exemple: "Niveau 1: erreur identité rattrapée; Niveau 3: chute avec suture; Niveau 5: amputation mauvais membre",
    piege: "Ne pas sous-estimer les EIAS mineurs - ils révèlent les failles du système",
    mnemo: "1-Désagrément 2-Impact 3-Soins 4-Arrêt 5-Séquelles",
    subtilite: "La différence entre niveau 4 et 5 est la réversibilité des conséquences",
    application: "Classer systématiquement chaque EIAS selon cette échelle",
    vigilance: "EIAS niveau 4-5 nécessitent signalement externe obligatoire"
  },
  {
    concept: "Hygiène des mains - SHA",
    definition: "Friction hydroalcoolique = technique de référence remplaçant lavage (sauf gale et C. difficile). Protocole 7 temps, 20-30 secondes, avant/après chaque soin. Port de gants ne dispense pas de l'hygiène",
    exemple: "SHA systématique avant/après contact patient. Gale/C. difficile : lavage + SHA",
    piege: "Ne pas croire que gants dispensent de l'hygiène des mains",
    mnemo: "SHA = 7 temps 20-30 secondes, Exceptions = Gale + C. difficile",
    subtilite: "Conditions : manches courtes, ongles courts, sans bijoux/vernis",
    application: "Friction SHA systématique selon protocole 7 temps",
    vigilance: "Gale et C. difficile résistent aux SHA - lavage obligatoire"
  },
  {
    concept: "Infections associées aux soins (IAS)",
    definition: "Infection survenant au cours/décours d'une prise en charge, absente à l'admission. Nosocomiale si >48h hospitalisation. Types : urinaire, pulmonaire, site opératoire, bactériémie",
    exemple: "Infection urinaire sur sonde, pneumopathie acquise sous ventilation, infection site opératoire",
    piege: "Ne pas confondre IAS (tous soins) et infection nosocomiale (hospitalisation uniquement)",
    mnemo: "IAS = tous soins, IN = hôpital >48h, 4 types : Urinaire Pulmonaire Site Bactériémie",
    subtilite: "Délai 48h sous réserve durée incubation habituelle du microorganisme",
    application: "Identifier et classer les IAS selon leur origine et délai",
    vigilance: "Tous sites anatomiques peuvent être concernés"
  },
  {
    concept: "Précautions standard",
    definition: "Mesures systématiques pour tout patient (connu infecté ou non) : hygiène mains, gants si contact liquides biologiques, protection projections, masque si infection respiratoire. Prévention AES",
    exemple: "SHA avant/après contact, gants pour prélèvement sanguin, masque si patient tousse",
    piege: "Ne pas réserver aux patients infectés - s'appliquent à TOUS les patients",
    mnemo: "TOUT patient : Hygiène Gants Protection Masque AES",
    subtilite: "Gants uniquement si risque contact liquides biologiques ou peau lésée",
    application: "Appliquer systématiquement quel que soit le statut infectieux",
    vigilance: "Changer de gants entre deux patients"
  },
  {
    concept: "Précautions complémentaires",
    definition: "Mesures additionnelles selon microorganisme : Contact (BMR, GEA), Gouttelettes (grippe, coqueluche), Air (tuberculose, rougeole). Prescription médicale tracée, information patient/famille",
    exemple: "SARM → Contact (tablier, matériel dédié). Grippe → Gouttelettes (masque chirurgical). Tuberculose → Air (FFP2, chambre fermée)",
    piege: "Ne pas confondre les 3 types - certains microorganismes ont plusieurs modes",
    mnemo: "Contact = BMR, Gouttelettes = Virus respiratoires, Air = Tuberculose",
    subtilite: "Cohorting possible si plusieurs cas dans même unité",
    application: "Adapter les précautions au microorganisme et mode de transmission",
    vigilance: "Prescription médicale obligatoire pour mise en place et levée"
  },
  {
    concept: "Antisepsie",
    definition: "Application d'antiseptique sur tissus vivants pour détruire microorganismes. Antiseptiques majeurs : biguanides (chlorhexidine), iodés (povidone), chlorés (hypochlorite), alcools. Solutions alcooliques privilégiées pour actes invasifs",
    exemple: "Chlorhexidine alcoolique pour chirurgie, povidone iodée aqueuse pour peau lésée",
    piege: "Ne pas confondre antiseptique (tissus vivants) et désinfectant (surfaces inertes)",
    mnemo: "4 majeurs : Biguanides Iodés Chlorés Alcools - Alcoolique = Invasif",
    subtilite: "Antiseptiques plaies = médicaments avec AMM, autres = dispositifs médicaux",
    application: "Choisir antiseptique selon site et type d'acte",
    vigilance: "Respecter délai d'action et vérifier compatibilité produits"
  },
  {
    concept: "Certification des établissements",
    definition: "Mission HAS évaluant qualité et sécurité des soins par experts-visiteurs. 15 objectifs, 141 critères (15 impératifs + 111 standards + 5 avancés). Renouvelé périodiquement",
    exemple: "Visite d'experts-visiteurs, évaluation sur 3 chapitres : patient, équipes, établissement",
    piege: "Ne pas confondre critères impératifs (15) et standards (111) - les impératifs peuvent valoir refus",
    mnemo: "HAS = 15 objectifs, 141 critères, 3 chapitres : Patient Équipes Établissement",
    subtilite: "Critères avancés = futurs standards, non encore exigibles",
    application: "Participer à la préparation de la certification, connaître les critères",
    vigilance: "Non-validation des critères impératifs = risque de refus de certification"
  },
  {
    concept: "IQSS (Indicateurs Qualité Sécurité Soins)",
    definition: "Indicateurs publics permettant de juger performances des établissements. Évolutifs : consommation SHA, infections site opératoire, vaccination antigrippale personnels, durée antibiothérapie",
    exemple: "Résultats publiés sur site HAS, peuvent moduler financement établissements",
    piege: "Ne pas négliger ces indicateurs - ils sont publics et impactent le financement",
    mnemo: "IQSS = SHA Infections Vaccination Antibiothérapie - Public + Financement",
    subtilite: "Indicateurs évolutifs avec le temps selon priorités de santé publique",
    application: "Connaître les IQSS de son établissement, contribuer à leur amélioration",
    vigilance: "Transparence publique obligatoire - communication vers les patients"
  },
  {
    concept: "Évaluation des Pratiques Professionnelles (EPP)",
    definition: "Analyse de l'activité clinique par rapport aux recommandations récentes. 4 phases : mesure écart, actions correction, mise en œuvre, suivi. Objectif : amélioration qualité soins",
    exemple: "Audit de prescription antibiotique, plan d'actions, formation, réévaluation",
    piege: "Éviter la recherche d'exhaustivité - se concentrer sur recommandations principales",
    mnemo: "EPP = 4 phases : Mesure Actions Œuvre Suivi - Focus recommandations principales",
    subtilite: "Critères précis, concis, observables, en nombre limité",
    application: "Participer aux EPP de son service, appliquer les plans d'amélioration",
    vigilance: "Population patients homogène nécessaire pour analyse pertinente"
  },
  {
    concept: "Développement Professionnel Continu (DPC)",
    definition: "Obligation légale triennale depuis 2013. 3 types d'actions : cognitives, analyse pratiques, gestion risques. Financé, contrôlé par ordres/employeurs",
    exemple: "Formation, groupe de pairs, audit pratiques - 2 actions/3 ans minimum",
    piege: "Ne pas confondre DPC et simple formation - c'est une obligation légale structurée",
    mnemo: "DPC = 3 ans, 3 types : Cognitif Analyse Risques - 2 minimum",
    subtilite: "Parcours défini par collège national professionnel de la spécialité",
    application: "Respecter son obligation DPC, s'inscrire aux formations validées",
    vigilance: "Contrôle par ordres (libéraux) ou employeurs (salariés)"
  },
  {
    concept: "Démarche qualité",
    definition: "Principes : attention clients, leadership, participation, méthodes spécifiques, approche processus, amélioration continue, mesure. 4 dimensions : stratégique, technique, structurelle, culturelle",
    exemple: "Comité qualité, cellule qualité, indicateurs, audits, certifications",
    piege: "Ne pas limiter à l'aspect technique - dimension culturelle essentielle",
    mnemo: "4 dimensions : Stratégique Technique Structurelle Culturelle",
    subtilite: "Amélioration continue : pas à pas OU modifications importantes accélérées",
    application: "Participer à la démarche qualité de l'établissement",
    vigilance: "Assurance qualité = moyens donnant confiance (transparence, indicateurs)"
  },
  {
    concept: "3 grandes causes de risque liés aux soins",
    definition: "1) Actes invasifs (4,3/6,2 EIG liés aux procédures) 2) Infections nosocomiales (1/20 médecine/chirurgie, 1/5 réanimation) 3) Effets indésirables médicamenteux (5% consultations, 5-10% hospitalisations)",
    exemple: "Chirurgie → infection site opératoire, médicament → hypoglycémie sous insuline",
    piege: "Ne pas oublier les 3 causes - souvent interconnectées (ex: infection post-chirurgicale)",
    mnemo: "3 causes : Invasif Infectieux Médicamenteux - Fréquences : 4,3/6,2 - 1/20 - 5-10%",
    subtilite: "Effets médicamenteux : prévisibles (dose-dépendants) vs imprévisibles (allergie)",
    application: "Prévenir les 3 causes par protocoles adaptés",
    vigilance: "Déclaration obligatoire : EIAS, pharmacovigilance, signalement infections"
  }
];

export const conceptsRangBIC4 = [
  {
    concept: "Impact économique des EIAS",
    analyse: "Coût global des IAS : 760 millions €/an en Europe. Coût par infection : 610-1370€ Europe, 1500-27340€ selon germe. Surcoût durée séjour : 900-25000€ (2/3 du surcoût global)",
    cas: "Infection SARM : 30225€ vs SASM 19281€ vs témoin 11888€. Prolongation séjour : 6 à +20 jours selon germe",
    ecueil: "Ne pas confondre coût antibiotiques (10-15% des coûts) et coût global IAS",
    technique: "Évaluation médico-économique : coût direct (séjour, traitements) + indirect (perte chance)",
    distinction: "Coût évitable vs non évitable : 40-50% des IAS évitables = économies potentielles",
    maitrise: "Savoir calculer et présenter l'impact économique des programmes de prévention",
    excellence: "Argumentaire médico-économique pour obtenir financements prévention"
  },
  {
    concept: "Mécanismes de transmissibilité BMR",
    analyse: "BMR : multi-résistantes (BLSE, SARM). BHR : hautement résistantes (EPC, ERV). Réservoirs : cutané (SARM), digestif (BLSE, ERV, EPC). Transmission : contact manuportée ou aéroportée",
    cas: "Épidémie EPC en réanimation : transmission croisée par mains soignants, environnement souillé, défaut d'hygiène",
    ecueil: "Ne pas confondre BMR et BHR - BHR = résistance plus élevée nécessitant précautions renforcées",
    technique: "Typage moléculaire pour confirmer transmission croisée, enquête épidémiologique",
    distinction: "Transmission verticale (descendance) vs horizontale (inter-bactéries par plasmides)",
    maitrise: "Maîtriser investigation épidémiologique et mesures de contrôle",
    excellence: "Anticipation émergence résistances et stratégies préventives"
  },
  {
    concept: "Mécanismes de résistances transférables",
    analyse: "Résistance chromosomique (rare, verticale, stable) vs plasmides/transposons (80-90%, horizontale, instable, dépendante pression antibiotique). Support de la diffusion des résistances",
    cas: "Plasmide BLSE transférable entre entérobactéries → diffusion rapide résistance aux C3G",
    ecueil: "Ne pas sous-estimer instabilité plasmides - disparition possible si arrêt pression antibiotique",
    technique: "Analyse moléculaire : séquençage, PCR, électrophorèse pour identifier mécanismes",
    distinction: "Résistance intrinsèque vs acquise : naturelle vs sélectionnée par antibiotiques",
    maitrise: "Comprendre mécanismes pour optimiser stratégies antibiotiques",
    excellence: "Conseil expert en antibiothérapie et politique antibiotique institutionnelle"
  },
  {
    concept: "Structures de prévention des EIAS",
    analyse: "Organisation 3 niveaux : Local (EOHH + CLIN/CME), Régional (CPIAS), National (PROPIAS + SPF). Coordination gestionnaire risques obligatoire. Mission de surveillance, prévention, formation",
    cas: "Coordination EOHH-gestionnaire risques lors épidémie nosocomiale : investigation, mesures, communication",
    ecueil: "Ne pas confondre CLIN (obligatoire privé) et CME (peut remplacer CLIN public)",
    technique: "Méthodes de surveillance : active, passive, ciblée. Indicateurs de processus et résultats",
    distinction: "Surveillance vs monitoring : ponctuelle vs continue, descriptive vs analytique",
    maitrise: "Piloter programme de prévention des IAS multidisciplinaire",
    excellence: "Leadership dans mise en place de systèmes de surveillance innovants"
  },
  {
    concept: "Analyse systémique avancée des EIAS",
    analyse: "Méthode d'analyse approfondie utilisant modèle de Reason (fromage suisse) pour identifier facteurs contributifs latents et défaillances organisationnelles au-delà de l'erreur individuelle",
    cas: "EIAS catastrophique (ablation mauvais rein) : défaillance check-list, formation, surcharge, communication équipe",
    ecueil: "Éviter recherche bouc émissaire - erreur souvent systémique, multifactorielle",
    technique: "Méthode ALARM : facteurs individuels, équipe, tâche, patient, environnement, organisation",
    distinction: "Approche punitive vs systémique : blâme individuel vs amélioration collective",
    maitrise: "Mener analyse causale approfondie et proposer actions correctives systémiques",
    excellence: "Leadership promotion culture juste et apprenante, transformation organisationnelle"
  }
];

export const piegesSpecifiquesIC4 = {
  'qualité des soins': 'Ne pas confondre qualité et sécurité - la sécurité n\'est qu\'une des 7 dimensions',
  'eias': 'Ne pas confondre EIAS et EIG - EIG = sous-catégorie d\'EIAS avec critères spécifiques',
  'bmr/bhr': 'Ne pas confondre BMR et BHR - BHR = niveau de résistance plus élevé',
  'antisepsie': 'Ne pas confondre antiseptique (tissus vivants) et désinfectant (surfaces)',
  'hygiène des mains': 'Ne pas croire que gants dispensent de l\'hygiène des mains',
  'precautions standard': 'Ne pas réserver aux patients infectés - s\'appliquent à TOUS'
};

export const mnemosIntelligentsIC4 = {
  'qualité des soins': 'SPEC-AEC : Sécurité Pertinence Efficacité Continuité - Acceptabilité Efficience Continuité',
  'eias': 'EIAS = 5 niveaux : Mineur Intermédiaire Majeur Critique catastrophiQue',
  'bmr/bhr': 'SARM = Peau, BLSE = Tube digestif, Contact = Mains, Air = Gouttelettes',
  'hygiène des mains': 'SHA = 7 temps 20-30 secondes, Exceptions = Gale + C. difficile',
  'précautions': 'Contact = BMR, Gouttelettes = Virus respiratoires, Air = Tuberculose'
};
