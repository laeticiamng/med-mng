
-- Mise à jour complète des paroles musicales basées sur les fiches E-LiSA officielles
-- Structure : 3 couplets + 1 pont + 1 refrain pour 4 minutes de chanson
-- Contenu 100% aligné sur les compétences par rang

-- IC-1: Relation médecin-malade et communication thérapeutique
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 15 compétences de définition (OIC-001-01-A à OIC-001-15-A)
  '[Couplet 1]
Relation médecin-malade dans le cadre singulier
Colloque privilégié, lien particulier
Communication thérapeutique, art délicat
Empathie clinique, regard qui se bat
Information délivrée avec tact et mesure
Annonce adaptée, parole qui rassure

[Refrain]
Dans le colloque singulier résonne
L''écho de deux âmes qui s''abandonnent
Communication vraie, lien thérapeutique
Où l''humain guérit, c''est authentique
Relation de soin, alliance sacrée
Dans la confiance partagée

[Couplet 2]
Approche centrée sur le patient, essence
Représentation de la maladie, conscience
Facteurs influençant l''information donnée
Stress et ajustement, réalité assumée
Mécanismes de défense observés chez l''autre
Dans l''annonce difficile, être l''apôtre

[Pont]
Empathie clinique, savoir-être essentiel
Alliance thérapeutique, lien existentiel
Processus de changement, étapes guidées
Entretien motivationnel, volontés aidées
Communication adaptée, verbale et non-verbale
Pour que chaque patient se sente capable

[Couplet 3]
Enjeux et modalités de l''annonce grave
Mauvaise nouvelle, courage qui s''entrave
Mais avec méthode, protocole maîtrisé
L''accompagnement permet d''apprivoiser
Dans le respect du rythme et du silence
S''épanouit la vraie bienveillance',

  -- Rang B: 8 compétences de prise en charge pratique (OIC-001-05-B à OIC-001-08-B)
  '[Couplet 1]
Supports au raisonnement clinique organisé
Généralités sur la démarche structurée
Examens complémentaires, aide précieuse
Bases d''information, démarche rigoureuse

[Refrain]
Outils pratiques, méthodes éprouvées
Raisonnement clinique, étapes maîtrisées
Dans l''arsenal du soignant formé
Communication experte, lien confirmé
Techniques concrètes, savoir-faire précis
Pour des relations toujours réussies

[Couplet 2]
Logique thérapeutique, pensée claire
Efficacité théorique versus pratique à faire
Définition de l''efficience, rendement
Utilité mesurée, progrès évident

[Pont]
Dynamiques décisionnelles en médecine
Modèles d''analyse, méthode fine
Architectures des systèmes d''information
Communication moderne, évolution
Technologies TICE, aide à la décision
Pour une pratique de précision

[Couplet 3]
Résolution de problème avec les outils
Systèmes d''aide, supports qui brillent
Particularités de la controverse en santé
Débats éclairés, vérité respectée'
]
WHERE item_code = 'IC-1';

-- IC-2: Valeurs professionnelles du médecin
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 9 compétences de définition (OIC-002-01-A à OIC-002-09-A)
  '[Couplet 1]
Professionnels identifiés, compétences liées
Organisations de santé, rôles définis et guidés
Pratique médicale définie, éthique signifiée
Normes et valeurs professionnelles unifiées

[Refrain]
Valeurs sacrées, piliers de l''art médical
Professionnalisme, idéal cardinal
Organisation sociale, profession réglée
Dans l''éthique médicale ancrée
Médecine fondée sur les preuves solides
Déontologie, règles valides

[Couplet 2]
Organisation sociale, politique de santé
Profession médicale, régulation pensée
Principes de médecine fondée sur preuves
Médecine basée sur recherches et épreuves

[Pont]
Déontologie médicale, codes respectés
Conflit de valeurs, tensions acceptées
Exercice professionnel en France organisé
Ordres professionnels, statuts maîtrisés
Différents acteurs, interactions harmonieuses
Pour des pratiques vertueuses

[Couplet 3]
Rôle des ordres professionnels établi
Acteurs de santé, réseau accompli
Interactions multiples, coordination
Au service de la population',

  -- Rang B: 7 compétences approfondies (OIC-002-07-B à OIC-002-13-B) 
  '[Couplet 1]
Organisation de l''exercice, cadre français
Professionnels de santé, statuts certains
Rôle des ordres, mission définie
Différents acteurs, synergie infinie

[Refrain]
Système organisé, santé publique
Réglementation, cadre éthique
Professionnels coordonnés, mission partagée
Dans l''intérêt général engagée
Exercice moderne, standards élevés
Pour des soins toujours améliorés

[Couplet 2]
Acteurs de santé, interactions complexes
Système organisé, enjeux multiples
Coordination nécessaire, efficacité
Dans la complémentarité

[Pont]
Formation continue, compétences maintenues
Évolution des pratiques, connaissances tenues
Qualité des soins, amélioration constante
Démarche professionnelle rassurante
Éthique appliquée, décisions éclairées
Dans la complexité, valeurs préservées

[Couplet 3]
Réglementation éthique, cadre respecté
Déontologie appliquée, devoirs acceptés
Dans l''exercice quotidien, valeurs incarnées
Pour une médecine toujours honorée'
]
WHERE item_code = 'IC-2';

-- IC-3: Raisonnement et décision en médecine - EBM
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 15 compétences fondamentales (OIC-003-01-A à OIC-003-15-A)
  '[Couplet 1]
Médecine basée sur les preuves, fondement
EBM définie, raisonnement
Savoirs, connaissances, incertitude
Recommandations, certitude

[Refrain]
Evidence Based Medicine, science éprouvée
Décision éclairée, vérité trouvée
Raisonnement clinique, méthode rigoureuse
Dans l''incertitude, démarche heureuse
Médecine moderne, preuves validées
Pour des soins toujours améliorés

[Couplet 2]
Styles de raisonnement, logique clinique
Démarche structurée, pensée pratique
Examens complémentaires, aide précieuse
Bases d''information, méthode rigoureuse

[Pont]
Efficacité théorique, concept défini
Efficience pratique, rendement fini
Utilité mesurée, bénéfice pesé
Décision médicale, choix raisonnée
Décision partagée, patient impliqué
Dans le processus, liberté respectée

[Couplet 3]
Personne de confiance, soutien moral
Représentations, attentes, idéal
Décision collégiale, expertise partagée
Dans la complexité, sagesse dégagée',

  -- Rang B: 23 compétences approfondies (OIC-003-05-B à OIC-003-23-B)
  '[Couplet 1]
Supports au raisonnement, outils développés
Généralités cliniques, méthodes éprouvées
Bases d''information, sources vérifiées
Logique thérapeutique, preuves clarifiées

[Refrain]
Analyse décisionnelle, méthode experte
Dynamiques complexes, voie ouverte
Technologies TICE, aide moderne
Pour une médecine plus sûre
Résolution de problème, approche systémique
Dans la complexité, logique

[Couplet 2]
Efficacité définie, mesure précise
Utilité théorique, concept qui se précise
Définition de l''efficience, rendement
Analyse économique, raisonnement

[Pont]
Modèles de dynamiques décisionnelles
Architectures informationnelles
TICE et communication, outils nouveaux
Aide à la décision, défis nouveaux
Systèmes experts, intelligence artificielle
Pour une médecine plus efficielle

[Couplet 3]
Résolution experte, problème complexe
Systèmes d''aide, approche multiplexe
Controverse en santé, débat éclairé
Particularités médicales, vérité partagée'
]
WHERE item_code = 'IC-3';

-- IC-4: Qualité et sécurité des soins - EIAS
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 14 compétences fondamentales (OIC-004-01-A à OIC-004-14-A) 
  '[Couplet 1]
Qualité définie, concept clair
Sécurité du patient, défi majeur
Événements indésirables, EIAS classés
Niveaux de gravité, risques analysés

[Refrain]
Qualité des soins, sécurité renforcée
Culture positive, erreur analysée
Amélioration continue, progrès partagé
Dans la transparence, excellence engagée
Gestion des risques, méthode organisée
Pour une médecine sécurisée

[Couplet 2]
Impact économique, coût calculé
Mécanismes de résistance, BMR identifiées
Structures en charge, EIAS coordonnées
Antisepsie définie, hygiène organisée

[Pont]
Définition des règles, utilisation sage
Antisepsie maîtrisée, bon usage
Trois grandes causes, risques liés aux soins
Modalités d''hygiène, gestes précis
Infections nosocomiales, vigilance requise
Pour la sécurité, excellence conquise

[Couplet 3]
Définition des infections, surveillance active
Principe d''évaluation, démarche proactive
Précaution standard, gestes protecteurs
Culture de sécurité, tous acteurs'
],

  -- Rang B: 52 compétences approfondies (épidémiologie, physiopathologie, etc.)
  '[Couplet 1]
Épidémiologie des EIAS, données précises
Physiopathologie, mécanismes et prises
Trois principes microorganismes, voies connues
Prévention des IAS, mesures tenues

[Refrain]
Gestion experte, risques maîtrisés
Surveillance active, qualité organisée
Prévention ciblée, infections contrôlées
Dans l''expertise, sécurité assurée
Méthodes avancées, protocoles stricts
Pour une médecine sans conflit

[Couplet 2]
Répartition des microorganismes, écologie
Prévention experte, méthodologie
Critères diagnostiques, infections définies
Sites opératoires, prévention affinée

[Pont]
Facteurs de risque, analyse fine
Critères précis, méthode discipline
Prévention ciblée, infections urinaires
Pneumopathies, mesures salutaires
Cathéters, sondes, dispositifs médicaux
Prévention adaptée, gestes nouveaux

[Couplet 3]
BMR et BHR, résistance organisée
Précautions standard, mesures raisonnées
Mise en œuvre, protocoles validés
Qualité assurée, risques maîtrisés'
]
WHERE item_code = 'IC-4';

-- IC-5: Responsabilités médicales - Gestion des erreurs
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: 13 compétences de base (OIC-005-01-A à OIC-005-13-A)
  '[Couplet 1]
Responsabilité définie, sanction assumée
Pénale, civile, administrative, disciplinaire encadrée
Sans faute aussi, solidarité
Faute caractérisée, responsabilité

[Refrain]
Responsabilités multiples, cadre organisé
Erreur médicale, leçon tirée
Accident défini, affection iatrogène
Culture de sécurité, système qui régénère
Infection nosocomiale, prévention active
Aléa thérapeutique, médecine positive

[Couplet 2]
Erreur médicale, définition claire
Accident médical, affection iatrogène
Infection nosocomiale, risque à gérer
Aléa thérapeutique, réalité à accepter

[Pont]
Facteurs humains, erreur compréhensible
Typologie définie, analyse possible
Prévention organisée, erreurs et EIAS
Barrières de sécurité, protection là
Approche systémique, culture positive
Où l''erreur instruit, démarche active

[Couplet 3]
Principaux facteurs, contentieux prévenus
Ouverture d''un contentieux, risques connus
Facteurs humains, dimension essentielle
Prévention adaptée, approche sensuelle'
],

  -- Rang B: 3 compétences spécialisées (épidémiologie, suivi, définition)
  '[Couplet 1]
Épidémiologie fine, facteurs identifiés
Contentieux médical, causes clarifiées
Suivi et pronostic, évolution tracée
Définition experte, approche avancée

[Refrain]
Analyse experte, gestion avancée
Épidémiologie, donnée pensée
Facteurs de risque, prévention ciblée
Dans l''expertise, sécurité assurée
Approche systémique, méthode organisée
Pour une médecine toujours améliorée

[Couplet 2]
Principaux facteurs, analyse approfondie
Conduisant à l''ouverture, méthodologie
Facteurs humains, compréhension fine
Erreur et facteurs, approche discipline

[Pont]
Prévention ciblée, erreurs maîtrisées
EIAS contrôlés, qualité organisée
Notion de barrière, sécurité renforcée
Approche experte, excellence avancée
Culture de sécurité, système mature
Où l''amélioration devient parure

[Couplet 3]
Approche systémique, vision globale
Culture positive, démarche idéale
Dans l''amélioration, progrès continu
Pour une médecine, avenir tenu'
]
WHERE item_code = 'IC-5';
