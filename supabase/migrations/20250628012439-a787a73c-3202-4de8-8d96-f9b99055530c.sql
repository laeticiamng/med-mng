
-- Refactoring complet des paroles musicales avec audit de conformité
-- Structure : 3 couplets + 1 pont + 1 refrain par rang
-- Contenu : 100% aligné sur les compétences E-LiSA spécifiques

-- IC-1: Relation médecin-malade et communication thérapeutique
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 15 compétences fondamentales (OIC-001-01-A à OIC-001-15-A)
  '[Couplet 1]
Relation médecin-malade dans le cadre singulier
Colloque privilégié où deux mondes vont se lier
Communication thérapeutique, approche centrée patient
Représentation de la maladie, vécu différent
Information du patient, facteurs influençant
Stress et ajustement, processus changeant

[Refrain]
Dans le colloque singulier résonne
L''écho de deux âmes qui s''abandonnent
Communication vraie, lien thérapeutique
Où l''humain guérit, c''est authentique
Relation de soin, alliance sacrée
Dans la confiance mutuelle partagée

[Couplet 2]
Empathie clinique définie avec justesse
Alliance thérapeutique, force et finesse
Mécanismes de défense observés chez l''autre
Processus de changement, être l''apôtre
Entretien motivationnel, techniques maîtrisées
Communication adaptée, barrières levées

[Pont]
Verbale et non-verbale, double langage
Enjeux de l''annonce, courage et partage
Mauvaise nouvelle, protocole respecté
Modalités d''annonce, humanité préservée
Dans le respect du rythme et du silence
S''épanouit la vraie bienveillance

[Couplet 3]
Personne de confiance, soutien précieux
Représentations du patient, enjeux sérieux
Attentes légitimes, espoirs à comprendre
Décision médicale partagée, ensemble prendre
Communication adaptée, chaque situation
Pour une relation de vraie guérison',

  -- Rang B: 8 compétences pratiques spécialisées (OIC-001-05-B à OIC-001-08-B + 4 autres)
  '[Couplet 1]
Supports au raisonnement clinique organisé
Généralités sur la démarche, méthode posée
Examens complémentaires, aide à la décision
Bases d''information clinique, précision
Logique de raisonnement thérapeutique
Efficacité théorique, approche systémique

[Refrain]
Outils concrets, méthodes éprouvées
Raisonnement clinique, étapes maîtrisées
Technologies TICE, aide moderne
Communication experte, pratique sûre
Systèmes d''aide à la décision médicale
Pour une approche toujours plus optimale

[Couplet 2]
Définition de l''efficacité clinique mesurée
Utilité thérapeutique, résultats prouvés
Définition de l''efficience, rapport coût-bénéfice
Dynamiques décisionnelles, analyse qui édifie
Modèles de prise de décision structurés
Architectures informationnelles, données organisées

[Pont]
TICE et communication, évolution digitale
Aide à la décision, intelligence artificielle
Systèmes experts, algorithmes guidants
Résolution de problème, outils aidants
Dans la modernité, tradition préservée
Humain au centre, technologie maîtrisée

[Couplet 3]
Résolution de problèmes avec méthodologie
Systèmes d''aide, nouvelle technologie  
Particularités de la controverse en santé
Débats scientifiques, vérité partagée
Evidence-based medicine, preuves solides
Pour des décisions toujours plus valides'
]
WHERE item_code = 'IC-1';

-- IC-2: Valeurs professionnelles du médecin
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 9 compétences de base (OIC-002-01-A à OIC-002-09-A)
  '[Couplet 1]
Professionnels de santé, compétences définies
Organisations de santé, structures unifiées
Pratique médicale définie, cadre précis
Normes professionnelles, standards requis
Valeurs de la profession, éthique incarnée
Médecine fondée sur preuves, science confirmée

[Refrain]
Valeurs professionnelles, piliers sacrés
Déontologie vivante, devoirs acceptés
Éthique médicale, conscience morale
Dans l''exercice quotidien, grandeur idéale
Profession organisée, mission partagée
Au service de l''humain, dignité préservée

[Couplet 2]
Déontologie médicale, codes respectés
Conflits de valeurs parfois rencontrés
Exercice professionnel en France organisé
Cadre légal précis, droits définis
Rôle des ordres professionnels établi
Régulation éthique, mission accomplie

[Pont]
Organisation sociale de la santé publique
Politique sanitaire, approche systémique
Profession médicale, statut particulier
Responsabilités lourdes à assumer
Dans la société, rôle reconnu
Service d''autrui, devoir tenu

[Couplet 3]
Différents acteurs de santé coordonnés
Interactions multiples, rôles définis
Système de santé, organisation complexe
Complémentarité, travail en synergie
Chacun sa place, mission respectée
Pour le bien commun, tous engagés',

  -- Rang B: 7 compétences approfondies (OIC-002-07-B à OIC-002-13-B)
  '[Couplet 1]
Organisation de l''exercice médical français
Statuts professionnels, cadres certains
Salariat, libéral, modes d''exercice
Contraintes et libertés, équilibre qui se dessine
Rôle des ordres, missions précises
Contrôle déontologique, discipline requise

[Refrain]
Système français, organisation maîtrisée
Professionnels coordonnés, qualité assurée
Réglementation stricte, standards élevés
Formation continue, compétences cultivées
Dans l''excellence médicale, référence mondiale
Santé publique, approche idéale

[Couplet 2]
Différents acteurs, interactions structurées
Médecins, paramédicaux, équipes organisées
Établissements de santé, secteurs divers
Public, privé, ESPIC, univers
Coordination nécessaire, parcours de soins
Continuité assurée, tous témoins

[Pont]
Formation médicale, cursus exigeant
Sélection rigoureuse, niveau constant
Développement professionnel continu
Obligation formative, savoir maintenu
Évaluation des pratiques, amélioration
Qualité des soins, notre ambition

[Couplet 3]
Responsabilité professionnelle, engagement total
Assurance obligatoire, protection légale
Instances disciplinaires, contrôle organisé
Sanctions possibles, fautes jugées
Dans la transparence, justice rendue
Excellence médicale, toujours défendue'
]
WHERE item_code = 'IC-2';

-- IC-3: Raisonnement et décision en médecine - EBM
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 15 compétences EBM (OIC-003-01-A à OIC-003-15-A)
  '[Couplet 1]
Médecine basée sur les preuves définie
Evidence-Based Medicine, science affinée
Différents types de savoirs médicaux
Connaissances multiples, niveaux variés
Incertitude en médecine, réalité assumée
Recommandations professionnelles, guides établies

[Refrain] 
EBM, science et conscience
Preuves solides, décision avec assurance
Raisonnement clinique, méthode rigoureuse
Dans l''incertitude, approche heureuse
Médecine moderne, évidence confirmée
Pour des soins toujours mieux adaptés

[Couplet 2]
Différents styles de raisonnement médical
Démarche clinique, approche rationnelle
Examens complémentaires, aide diagnostique
Bases d''information, méthode systématique
Logique de raisonnement thérapeutique
Choix éclairés, pratique authentique

[Pont]
Efficacité théorique versus pratique
Définitions précises, approche pragmatique
Définition de l''efficience clinique
Utilité mesurée, bénéfice pratique
Décision médicale, processus complexe
Patient impliqué, choix qui réfléchit

[Couplet 3]
Décision médicale partagée, alliance vraie
Patient informé, choix libre et vrai
Personne de confiance, soutien moral
Représentations du malade, vécu vital
Attentes légitimes, espoirs respectés
Décision collégiale, sagesse partagée',

  -- Rang B: 23 compétences expertes (OIC-003-05-B à OIC-003-23-B + autres)
  '[Couplet 1]
Supports au raisonnement, outils développés
Généralités cliniques méthodologiques
Bases d''information, sources validées
Examens complémentaires, logique diagnostique
Raisonnement thérapeutique, choix motivés
Efficacité prouvée, résultats documentés

[Refrain]
Méthodes expertes, analyse poussée
Dynamiques complexes, décision pensée
Technologies TICE, aide sophistiquée
Intelligence artificielle, médecine augmentée
Systèmes d''aide, outils performants
Pour une pratique toujours plus savante

[Couplet 2]
Définition rigoureuse de l''efficacité
Mesures objectives, qualité vérifiée
Utilité thérapeutique, impact mesuré
Efficience économique, coût maîtrisé
Modèles décisionnels, analyse fine
Dynamiques complexes, approche discipline

[Pont]
Architectures des systèmes d''information
Données structurées, organisation
TICE et communication, révolution digitale
Aide à la décision, approche optimale
Algorithmes experts, intelligence partagée
Médecine du futur, déjà commencée

[Couplet 3]
Résolution experte de problèmes médicaux
Systèmes d''aide, outils nouveaux
Particularités de controverse scientifique
Débats éclairés, approche critique
Médecine fondée sur preuves solides
Évolution constante, savoir qui se guide'
]
WHERE item_code = 'IC-3';

-- IC-4: Qualité et sécurité des soins - EIAS
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 14 compétences qualité/sécurité (OIC-004-01-A à OIC-004-14-A)
  '[Couplet 1]
Définir la qualité des soins médicaux
Sécurité du patient, enjeu capital
Événements indésirables, EIAS classifiés
Niveaux de gravité, risques identifiés
Impact économique, coûts calculés
Résistance bactérienne, BMR surveillées

[Refrain]
Qualité totale, sécurité renforcée
Culture positive, amélioration organisée
EIAS prévenus, risques maîtrisés
Dans l''excellence, soins optimisés
Hygiène stricte, infections contrôlées
Pour une médecine sécurisée

[Couplet 2]
Structures en charge des EIAS définies
Organisations qualité, missions unifiées
Antisepsie médicale, règles établies
Utilisation rationnelle, protocoles maîtrisés
Trois grandes causes d''infections liées aux soins
Prévention active, vigilance sans fin

[Pont]
Modalités d''hygiène, gestes protecteurs
Infections nosocomiales, facteurs vecteurs
Définition précise, surveillance active
Principe d''évaluation, démarche proactive
Précautions standard, barrières efficaces
Culture sécurité, équipes tenaces

[Couplet 3]
Évaluation continue, amélioration constante
Indicateurs qualité, démarche parlante
Signalement organisé, transparence assumée
Analyse des causes, leçons tirées
Dans la bienveillance, erreur apprivoisée
Pour une médecine toujours plus sûre',

  -- Rang B: 52 compétences expertes (épidémiologie, physiopathologie détaillée)
  '[Couplet 1]
Épidémiologie des EIAS, données maîtrisées
Physiopathologie fine, mécanismes analysés
Trois principes microorganismes, voies connues
Prévention des IAS, stratégies tenues
Répartition écologique, environnement
Prévention ciblée, protocole efficient

[Refrain]
Expertise poussée, connaissances affinées
Prévention ciblée, infections maîtrisées
Critères diagnostiques, définitions précises
Surveillance experte, méthodes conquises
Facteurs de risque, analyse multifactorielle
Pour une sécurité toujours plus réelle

[Couplet 2]
Critères diagnostiques infections du site opératoire
Prévention spécialisée, protocoles notoires
Facteurs de risque, analyse épidémiologique
Infections urinaires, prévention logique
Pneumopathies nosocomiales, surveillance active
Cathéters intraveineux, prévention proactive

[Pont]
BMR et BHR, résistances organisées
Écologie bactérienne, données analysées
Précautions standard, mise en œuvre
Précautions complémentaires, mesures qui œuvrent
Contact, gouttelettes, air, transmission
Barrières adaptées, protection dimension

[Couplet 3]
Bon usage des antibiotiques, prescription raisonnée
Antibiothérapie, stratégie déterminée
Surveillance microbiologique, laboratoire impliqué  
Épidémiologie locale, résistances identifiées
Excellence en infectiologie, expertise reconnue
Sécurité maximale, toujours maintenue'
]
WHERE item_code = 'IC-4';

-- IC-5: Gestion des erreurs et responsabilités médicales
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 13 compétences responsabilité (OIC-005-01-A à OIC-005-13-A)
  '[Couplet 1]
Définir la responsabilité, sanction assumée
Pénale, civile, administrative, disciplinaire organisée
Responsabilité sans faute, solidarité nationale
Faute caractérisée, conséquence rationnelle
Définir l''erreur médicale, faute professionnelle
Accident médical, affection iatrogène réelle

[Refrain]
Responsabilités multiples, cadre organisé
Erreur analysée, apprentissage partagé
Culture de sécurité, amélioration continue
Facteurs humains, approche qui s''affine
Dans la transparence, progrès recherché
Pour une médecine toujours améliorée

[Couplet 2]
Infection nosocomiale, définition précise
Aléa thérapeutique, réalité comprise
Principaux facteurs humains dans l''erreur
Typologie définie, analyse en profondeur
Prévention des erreurs et des EIAS
Barrières de sécurité, protection là

[Pont]
Approche systémique de l''erreur médicale
Culture de sécurité, démarche idéale
Où l''erreur instruit sans punir
Amélioration continue, avenir à bâtir
Signalement encouragé, analyse partagée
Leçons collectées, sécurité renforcée

[Couplet 3]
Principaux facteurs conduisant au contentieux
Ouverture procédure, risques sérieux
Facteurs humains, dimension essentielle
Erreur et facteurs, analyse sensuelle
Prévention adaptée, formation continue
Excellence médicale, démarche qui s''affine',

  -- Rang B: 3 compétences spécialisées (épidémiologie, facteurs, suivi)
  '[Couplet 1]
Épidémiologie du contentieux médical
Facteurs identifiés, analyse locale
Suivi et pronostic, évolution tracée
Données objectives, réalité embrassée
Définition experte du contentieux
Procédures juridiques, enjeux sérieux

[Refrain]
Analyse experte, gestion spécialisée
Contentieux médical, donnée maîtrisée
Facteurs de risque, prévention ciblée
Formation juridique, compétence organisée
Dans l''expertise fine, médecine défendue
Excellence légale, toujours maintenue

[Couplet 2]
Principaux facteurs menant à l''ouverture
Contentieux médical, procédure
Analyse juridique, droit médical
Expertise judiciaire, cadre légal
Responsabilité médicale, enjeux complexes  
Assurance professionnelle, protection reflexe

[Pont]
Facteurs humains, analyse comportementale
Erreur médicale, dimension sociale
Prévention juridique, formation spécialisée
Contentieux évité, relation apaisée
Médiation médicale, dialogue restauré
Conflit résolu, confiance retrouvée

[Couplet 3]
Gestion experte du risque juridique
Prévention active, approche pratique
Formation continue, droit médical
Évolution jurisprudentielle, cadre légal
Dans la maîtrise, sérénité retrouvée
Médecine exercée, responsabilité assumée'
]
WHERE item_code = 'IC-5';
