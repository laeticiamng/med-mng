
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
    concept: "Impact économique des EIAS",
    definition: "Coût global des IAS estimé à 760 millions d'euros/an en Europe. Coût par infection : 610-1370€ en Europe, variant de 1500 à 27340€ selon le germe. Surcoût durée de séjour : 900-25000€ (2/3 du surcoût global)",
    exemple: "Infection à SARM : 30225€ vs SASM 19281€ vs témoin non infecté 11888€. Prolongation séjour : 6 à +20 jours",
    piege: "Ne pas confondre coût des antibiotiques (10-15% des coûts) et coût global de l'IAS",
    mnemo: "760M€ Europe, 2000€ USA, 1000€ Europe, 10-15% antibiotiques",
    subtilite: "Les coûts antibiotiques germes résistants >> germes sensibles mais ne représentent que 10-15% du total",
    application: "Évaluer l'impact économique dans les programmes de prévention",
    vigilance: "Coût des programmes de prévention doit être pondéré par leur efficacité"
  },
  {
    concept: "BMR/BHR - Mécanismes de transmission",
    definition: "BMR : bactéries multi-résistantes (BLSE, SARM). BHR : bactéries hautement résistantes (EPC, ERV). Réservoirs : microbiote cutané (SARM), digestif (BLSE, ERV, EPC). Transmission : contact (manuportée) ou aéroportée",
    exemple: "SARM cutané, transmission manuportée directe/indirecte. BLSE digestif, transmission par contact via environnement souillé",
    piege: "Ne pas confondre BMR et BHR - BHR = niveau de résistance plus élevé (EPC, ERV)",
    mnemo: "SARM = Peau, BLSE = Tube digestif, Contact = Mains, Air = Gouttelettes/Aérosols",
    subtilite: "Gouttelettes >5μm vs aérosols <5μm - modes de transmission différents",
    application: "Adapter les précautions selon le réservoir et le mode de transmission",
    vigilance: "Transmission manuportée = principal mode - hygiène des mains cruciale"
  },
  {
    concept: "Résistances transférables",
    definition: "Résistance par mutation chromosomique (rare, verticale, 1 famille, stable) vs plasmides/transposons (80-90%, horizontale, plusieurs familles, instable, dépendante pression antibiotique)",
    exemple: "Mutation chromosomique : résistance fluoroquinolones. Plasmide : BLSE transférable entre entérobactéries",
    piege: "Ne pas confondre transmission verticale (descendance) et horizontale (inter-bactéries)",
    mnemo: "Chromosome = Rare Vertical 1famille Stable, Plasmide = Fréquent Horizontal Multiple Instable",
    subtilite: "Instabilité des plasmides = disparition possible si arrêt pression antibiotique",
    application: "Comprendre les mécanismes pour optimiser l'antibiothérapie",
    vigilance: "Pression de sélection antibiotique favorise les résistances plasmidiques"
  },
  {
    concept: "Structures de prévention des EIAS",
    definition: "Organisation à 3 niveaux : Local (EOHH + CLIN/CME), Régional (CPIAS), National (PROPIAS + Santé Publique France). Coordination avec gestionnaire des risques obligatoire",
    exemple: "EOHH dans chaque établissement, CPIAS par région, PROPIAS au niveau ministériel",
    piege: "Ne pas confondre CLIN (obligatoire privé) et CME (peut remplacer CLIN dans public)",
    mnemo: "3 niveaux : Local (EOHH) Régional (CPIAS) National (PROPIAS)",
    subtilite: "Coordination EOHH-gestionnaire des risques obligatoire depuis 2011",
    application: "Connaître les interlocuteurs selon le niveau d'intervention",
    vigilance: "Programme concerne 3 secteurs : établissements, médico-social, ville"
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
    concept: "Signalement des IAS",
    definition: "Signalement externe obligatoire pour IAS rares, graves, liées à dispositif médical, responsables de décès, cas groupés. Signalement ARS→CPIAS→Santé Publique France. Information patient obligatoire",
    exemple: "Cas groupés infections post-endoscopie → signalement externe. Patient informé et tracé au dossier",
    piege: "Ne pas omettre l'information du patient - obligation réglementaire",
    mnemo: "Signalement = Rare Grave Dispositif Décès Groupé → ARS→CPIAS→SPF",
    subtilite: "Validation par praticien hygiène avant signalement",
    application: "Détecter les IAS à signaler et respecter la procédure",
    vigilance: "Traçabilité obligatoire dans dossier patient"
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
    concept: "Démarche qualité",
    definition: "Principes : attention clients, leadership, participation, méthodes spécifiques, approche processus, amélioration continue, mesure. 4 dimensions : stratégique, technique, structurelle, culturelle",
    exemple: "Comité qualité, cellule qualité, indicateurs, audits, certifications",
    piege: "Ne pas limiter à l'aspect technique - dimension culturelle essentielle",
    mnemo: "4 dimensions : Stratégique Technique Structurelle Culturelle",
    subtilite: "Amélioration continue : pas à pas OU modifications importantes accélérées",
    application: "Participer à la démarche qualité de l'établissement",
    vigilance: "Assurance qualité = moyens donnant confiance (transparence, indicateurs)"
  }
];

export const conceptsRangBIC4 = [
  {
    concept: "Analyse systémique avancée des EIAS",
    analyse: "Méthode d'analyse approfondie utilisant le modèle de Reason (fromage suisse) pour identifier les facteurs contributifs latents et défaillances organisationnelles au-delà de l'erreur individuelle",
    cas: "EIAS catastrophique (ablation mauvais rein) : analyse révélant défaillance check-list, formation insuffisante, surcharge travail, communication défaillante équipe",
    ecueil: "Éviter la recherche de bouc émissaire - l'erreur est souvent systémique",
    technique: "Méthode ALARM : identifier facteurs contributifs (individuels, équipe, tâche, patient, environnement, organisation)",
    distinction: "Approche punitive vs Approche systémique : blâme individuel vs amélioration collective",
    maitrise: "Savoir mener une analyse causale approfondie et proposer des actions correctives",
    excellence: "Leadership dans la promotion d'une culture juste et apprenante"
  },
  {
    concept: "Gestion avancée des résistances bactériennes",
    analyse: "Stratégie globale de maîtrise des BMR/BHR intégrant surveillance épidémiologique, maîtrise de la transmission, bon usage des antibiotiques et gestion de l'environnement",
    cas: "Épidémie EPC en réanimation : investigation, mesures de cohorting, renforcement hygiène, audit des pratiques, formation équipes",
    ecueil: "Ne pas se limiter aux précautions d'isolement - approche globale nécessaire",
    technique: "Surveillance active par dépistage, cartographie des résistances, audit des pratiques",
    distinction: "Prévention primaire vs secondaire : empêcher émergence vs limiter diffusion",
    maitrise: "Coordonner une stratégie de maîtrise des BMR/BHR multidisciplinaire",
    excellence: "Anticipation des résistances émergentes et adaptation des stratégies"
  },
  {
    concept: "Optimisation de l'organisation des soins préventifs",
    analyse: "Architecture organisationnelle intégrant tous les acteurs de la prévention des risques associés aux soins dans une logique de transversalité et d'efficience",
    cas: "Réorganisation circuit du médicament : pharmacien clinicien, informatisation, double contrôle, formation, indicateurs - Réduction 70% erreurs",
    ecueil: "Éviter les silos - la prévention nécessite une approche transversale",
    technique: "Cartographie des processus, analyse des interfaces, standardisation",
    distinction: "Organisation verticale vs transversale : hiérarchie vs processus",
    maitrise: "Concevoir et piloter des organisations préventives efficaces",
    excellence: "Innovation organisationnelle et adaptation aux évolutions"
  },
  {
    concept: "Maîtrise experte de l'antisepsie différentielle",
    analyse: "Sélection et utilisation optimale des antiseptiques selon le site d'application, le type d'acte, l'écologie microbienne et les facteurs patient-dépendants",
    cas: "Chirurgie cardiaque : chlorhexidine alcoolique 2% large spectre, temps de contact 2 min, contre-indication allergie, alternative povidone iodée",
    ecueil: "Ne pas standardiser aveuglément - adapter au contexte clinique",
    technique: "Matrice décisionnelle : site × acte × patient × écologie → antiseptique optimal",
    distinction: "Antisepsie standard vs différentielle : protocole unique vs adaptation",
    maitrise: "Expertise dans le choix et l'utilisation des antiseptiques",
    excellence: "Conseil expert et formation des équipes"
  },
  {
    concept: "Leadership en démarche qualité avancée",
    analyse: "Pilotage stratégique de la qualité intégrant management par la qualité, conduite du changement, et développement d'une culture qualité-sécurité",
    cas: "Transformation digitale qualité : dématérialisation, tableaux de bord temps réel, intelligence artificielle prédictive, engagement des équipes",
    ecueil: "Éviter le technicisme excessif - la qualité est avant tout humaine",
    technique: "Management par la qualité, conduite du changement, intelligence collective",
    distinction: "Contrôle qualité vs Management qualité : vérification vs pilotage",
    maitrise: "Piloter une démarche qualité complexe et multi-acteurs",
    excellence: "Vision stratégique et innovation en matière de qualité-sécurité"
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
