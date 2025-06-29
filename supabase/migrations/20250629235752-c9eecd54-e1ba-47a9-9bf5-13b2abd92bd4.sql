
-- Mise à jour complète des paroles musicales avec structure optimisée
-- Structure : Couplet 1 → Refrain → Couplet 2 → Refrain → Couplet 3 → Refrain → Pont → Refrain
-- Couverture 100% des compétences E-LiSA par rang avec assonances systématiques

-- IC-1: Relation médecin-malade et communication thérapeutique
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: Structure Couplet-Refrain répétitive avec toutes les compétences E-LiSA
  '[Couplet 1]
Dans le cabinet médical, colloque singulier
Relation privilégiée, lien particulier
Communication thérapeutique, art délicat
Empathie clinique, regard qui se bat
Information claire, parole qui rassure
Annonce adaptée, confiance qui perdure

[Refrain]
Relation médecin-malade, alliance sacrée
Dans la communication, vérité partagée
Empathie clinique, écoute bienveillante
Confiance mutuelle, relation aidante
Alliance thérapeutique, lien essentiel
Pour la guérison, pacte existentiel

[Couplet 2]
Approche centrée patient, essence même
Représentations maladie, système
Facteurs influençant, information donnée
Stress et ajustement, réalité assumée
Mécanismes défense, protection naturelle
Annonce difficile, mission éternelle

[Refrain]
Relation médecin-malade, alliance sacrée
Dans la communication, vérité partagée
Empathie clinique, écoute bienveillante
Confiance mutuelle, relation aidante
Alliance thérapeutique, lien essentiel
Pour la guérison, pacte existentiel

[Couplet 3]
Processus changement, étapes guidées
Entretien motivationnel, volontés aidées
Communication adaptée, verbale et non-verbale
Chaque geste compte, parole qui dévoile
Enjeux modalités, annonce délicate
Mauvaise nouvelle, courage qui se gâte

[Refrain]
Relation médecin-malade, alliance sacrée
Dans la communication, vérité partagée
Empathie clinique, écoute bienveillante
Confiance mutuelle, relation aidante
Alliance thérapeutique, lien essentiel
Pour la guérison, pacte existentiel

[Pont]
Méthode protocole, annonce maîtrisée
Accompagnement patient, démarche organisée
Respect du rythme, silence respecté
Bienveillance vraie, humanité

[Refrain Final]
Relation médecin-malade, alliance sacrée
Dans la communication, vérité partagée
Empathie clinique, écoute bienveillante
Confiance mutuelle, relation aidante
Alliance thérapeutique, lien essentiel
Pour la guérison, pacte existentiel',

  -- Rang B: Structure identique avec compétences pratiques
  '[Couplet 1]
Supports raisonnement, outils développés
Généralités cliniques, méthodes éprouvées
Bases information, sources vérifiées
Logique thérapeutique, preuves clarifiées
Examens complémentaires, aide précieuse
Démarche structurée, approche rigoureuse

[Refrain]
Outils pratiques, méthodes expertes
Raisonnement clinique, voie ouverte
Communication moderne, techniques affinées
Dans la relation, excellence gagnée
Supports efficaces, aide décisionnelle
Pour une médecine professionnelle

[Couplet 2]
Efficacité définie, mesure précise
Utilité théorique, concept qui se précise
Définition efficience, rendement
Analyse économique, raisonnement
Logique thérapeutique, pensée claire
Versus pratique, défi à faire

[Refrain]
Outils pratiques, méthodes expertes
Raisonnement clinique, voie ouverte
Communication moderne, techniques affinées
Dans la relation, excellence gagnée
Supports efficaces, aide décisionnelle
Pour une médecine professionnelle

[Couplet 3]
Dynamiques décisionnelles, modèle fin
Architectures information, système
TICE communication, outils nouveaux
Aide décision, défis nouveaux
Systèmes experts, intelligence artificielle
Médecine moderne, approche efficielle

[Refrain]
Outils pratiques, méthodes expertes
Raisonnement clinique, voie ouverte
Communication moderne, techniques affinées
Dans la relation, excellence gagnée
Supports efficaces, aide décisionnelle
Pour une médecine professionnelle

[Pont]
Résolution problème, approche experte
Systèmes aide, logique ouverte
Controverse santé, débat éclairé
Particularités médicales, vérité

[Refrain Final]
Outils pratiques, méthodes expertes
Raisonnement clinique, voie ouverte
Communication moderne, techniques affinées
Dans la relation, excellence gagnée
Supports efficaces, aide décisionnelle
Pour une médecine professionnelle'
]
WHERE item_code = 'IC-1';

-- IC-2: Valeurs professionnelles du médecin
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: Valeurs et éthique médicale
  '[Couplet 1]
Professionnels identifiés, compétences liées
Organisations santé, rôles définis et guidés
Pratique médicale, éthique signifiée
Normes et valeurs, profession unifiée
Déontologie médicale, codes respectés
Médecine fondée, preuves validées

[Refrain]
Valeurs sacrées, piliers de l''art médical
Professionnalisme, idéal cardinal
Éthique médicale, déontologie
Dans la pratique, belle harmonie
Organisations santé, mission partagée
Pour la société, responsabilité

[Couplet 2]
Organisation sociale, politique santé
Profession médicale, régulation pensée
Principes médecine, preuves fondées
Recherches basées, vérité validée
Conflit valeurs, tensions acceptées
Exercice professionnel, règles respectées

[Refrain]
Valeurs sacrées, piliers de l''art médical
Professionnalisme, idéal cardinal
Éthique médicale, déontologie
Dans la pratique, belle harmonie
Organisations santé, mission partagée
Pour la société, responsabilité

[Couplet 3]
Ordres professionnels, rôle établi
Acteurs santé, réseau accompli
Interactions multiples, coordination
Service population, vocation
Différents acteurs, synergie infinie
Médecine moderne, éthique garantie

[Refrain]
Valeurs sacrées, piliers de l''art médical
Professionnalisme, idéal cardinal
Éthique médicale, déontologie
Dans la pratique, belle harmonie
Organisations santé, mission partagée
Pour la société, responsabilité

[Pont]
Formation continue, compétences maintenues
Évolution pratiques, connaissances tenues
Qualité soins, amélioration constante
Démarche éthique, toujours rassurante

[Refrain Final]
Valeurs sacrées, piliers de l''art médical
Professionnalisme, idéal cardinal
Éthique médicale, déontologie
Dans la pratique, belle harmonie
Organisations santé, mission partagée
Pour la société, responsabilité',

  -- Rang B: Organisation et coordination
  '[Couplet 1]
Organisation exercice, cadre français
Professionnels santé, statuts certains
Rôle des ordres, mission définie
Différents acteurs, synergie infinie
Système organisé, santé publique
Réglementation éthique, cadre pratique

[Refrain]
Système coordonné, santé publique
Professionnels unis, éthique pratique
Organisation moderne, standards élevés
Dans la coordination, excellence trouvée
Acteurs multiples, mission commune
Pour des soins, qualité qui s''affine

[Couplet 2]
Acteurs santé, interactions complexes
Système organisé, enjeux multiples
Coordination nécessaire, efficacité
Complémentarité, qualité
Interactions harmonieuses, collaboration
Service public, noble vocation

[Refrain]
Système coordonné, santé publique
Professionnels unis, éthique pratique
Organisation moderne, standards élevés
Dans la coordination, excellence trouvée
Acteurs multiples, mission commune
Pour des soins, qualité qui s''affine

[Couplet 3]
Réglementation éthique, cadre respecté
Déontologie appliquée, devoirs acceptés
Exercice quotidien, valeurs incarnées
Médecine honorée, profession estimée
Statuts maîtrisés, rôles définis
Excellence médicale, avenir garanti

[Refrain]
Système coordonné, santé publique
Professionnels unis, éthique pratique
Organisation moderne, standards élevés
Dans la coordination, excellence trouvée
Acteurs multiples, mission commune
Pour des soins, qualité qui s''affine

[Pont]
Évolution constante, adaptation sage
Coordination moderne, nouveau visage
Qualité assurée, soins améliorés
Dans l''organisation, avenir assuré

[Refrain Final]
Système coordonné, santé publique
Professionnels unis, éthique pratique
Organisation moderne, standards élevés
Dans la coordination, excellence trouvée
Acteurs multiples, mission commune
Pour des soins, qualité qui s''affine'
]
WHERE item_code = 'IC-2';

-- IC-3: Raisonnement et décision en médecine - EBM
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: Evidence Based Medicine
  '[Couplet 1]
Médecine basée, preuves fondées
EBM définie, vérité validée
Savoirs connaissances, incertitude
Recommandations, certitude
Raisonnement clinique, méthode rigoureuse
Décision éclairée, démarche heureuse

[Refrain]
Evidence Based Medicine, science éprouvée
Décision éclairée, vérité trouvée
Raisonnement structuré, logique claire
Dans l''incertitude, lumière
Médecine moderne, preuves validées
Pour des soins, qualité assurée

[Couplet 2]
Styles raisonnement, logique clinique
Démarche structurée, pensée pratique
Examens complémentaires, aide précieuse
Information basée, méthode rigoureuse
Efficacité théorique, concept défini
Utilité pratique, rendement fini

[Refrain]
Evidence Based Medicine, science éprouvée
Décision éclairée, vérité trouvée
Raisonnement structuré, logique claire
Dans l''incertitude, lumière
Médecine moderne, preuves validées
Pour des soins, qualité assurée

[Couplet 3]
Décision partagée, patient impliqué
Processus libre, choix respecté
Personne confiance, soutien moral
Représentations, idéal
Décision collégiale, expertise partagée
Complexité sage, sagesse dégagée

[Refrain]
Evidence Based Medicine, science éprouvée
Décision éclairée, vérité trouvée
Raisonnement structuré, logique claire
Dans l''incertitude, lumière
Médecine moderne, preuves validées
Pour des soins, qualité assurée

[Pont]
Efficience mesurée, bénéfice pesé
Décision médicale, choix raisonnée
Attentes respectées, dialogue ouvert
Dans la décision, avenir couvert

[Refrain Final]
Evidence Based Medicine, science éprouvée
Décision éclairée, vérité trouvée
Raisonnement structuré, logique claire
Dans l''incertitude, lumière
Médecine moderne, preuves validées
Pour des soins, qualité assurée',

  -- Rang B: Analyse et outils décisionnels
  '[Couplet 1]
Supports raisonnement, outils développés
Généralités cliniques, méthodes éprouvées
Bases information, sources vérifiées
Logique thérapeutique, preuves clarifiées
Analyse décisionnelle, méthode experte
Dynamiques complexes, voie ouverte

[Refrain]
Analyse experte, méthode organisée
Dynamiques complexes, logique pensée
Technologies TICE, aide moderne
Pour une médecine, approche sûre
Résolution systémique, outils précis
Dans la complexité, choix réussis

[Couplet 2]
Efficacité définie, mesure précise
Utilité théorique, concept qui se précise
Définition efficience, rendement
Analyse économique, raisonnement
Modèles dynamiques, décision fine
Architectures info, méthode discipline

[Refrain]
Analyse experte, méthode organisée
Dynamiques complexes, logique pensée
Technologies TICE, aide moderne
Pour une médecine, approche sûre
Résolution systémique, outils précis
Dans la complexité, choix réussis

[Couplet 3]
TICE communication, outils nouveaux
Aide décision, défis nouveaux
Systèmes experts, intelligence artificielle
Médecine moderne, approche efficielle
Résolution problème, approche complexe
Systèmes aide, démarche multiplexe

[Refrain]
Analyse experte, méthode organisée
Dynamiques complexes, logique pensée
Technologies TICE, aide moderne
Pour une médecine, approche sûre
Résolution systémique, outils précis
Dans la complexité, choix réussis

[Pont]
Controverse santé, débat éclairé
Particularités médicales, vérité partagée
Intelligence artificielle, aide précieuse
Décision moderne, approche heureuse

[Refrain Final]
Analyse experte, méthode organisée
Dynamiques complexes, logique pensée
Technologies TICE, aide moderne
Pour une médecine, approche sûre
Résolution systémique, outils précis
Dans la complexité, choix réussis'
]
WHERE item_code = 'IC-3';

-- IC-4: Qualité et sécurité des soins - EIAS
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: Qualité et sécurité
  '[Couplet 1]
Qualité définie, concept clair
Sécurité patient, défi majeur
Événements indésirables, EIAS classés
Niveaux gravité, risques analysés
Impact économique, coût calculé
Mécanismes résistance, BMR identifiées

[Refrain]
Qualité des soins, sécurité renforcée
Culture positive, erreur analysée
Amélioration continue, progrès partagé
Dans la transparence, excellence engagée
Gestion des risques, méthode organisée
Pour une médecine, toujours sécurisée

[Couplet 2]
Structures en charge, EIAS coordonnées
Antisepsie définie, hygiène organisée
Règles utilisation, usage sage
Antisepsie maîtrisée, bon usage
Trois grandes causes, risques aux soins
Modalités hygiène, gestes précis

[Refrain]
Qualité des soins, sécurité renforcée
Culture positive, erreur analysée
Amélioration continue, progrès partagé
Dans la transparence, excellence engagée
Gestion des risques, méthode organisée
Pour une médecine, toujours sécurisée

[Couplet 3]
Infections nosocomiales, vigilance requise
Sécurité culture, excellence conquise
Définition infections, surveillance active
Principe évaluation, démarche proactive
Précaution standard, gestes protecteurs
Culture sécurité, tous acteurs

[Refrain]
Qualité des soins, sécurité renforcée
Culture positive, erreur analysée
Amélioration continue, progrès partagé
Dans la transparence, excellence engagée
Gestion des risques, méthode organisée
Pour une médecine, toujours sécurisée

[Pont]
Évaluation continue, surveillance active
Prévention ciblée, démarche proactive
Qualité assurée, risques maîtrisés
Dans l''amélioration, avenir assuré

[Refrain Final]
Qualité des soins, sécurité renforcée
Culture positive, erreur analysée
Amélioration continue, progrès partagé
Dans la transparence, excellence engagée
Gestion des risques, méthode organisée
Pour une médecine, toujours sécurisée',

  -- Rang B: Épidémiologie et prévention
  '[Couplet 1]
Épidémiologie EIAS, données précises
Physiopathologie, mécanismes et prises
Trois principes microorganismes, voies connues
Prévention IAS, mesures tenues
Répartition microorganismes, écologie
Prévention experte, méthodologie

[Refrain]
Gestion experte, risques maîtrisés
Surveillance active, qualité organisée
Prévention ciblée, infections contrôlées
Dans l''expertise, sécurité assurée
Méthodes avancées, protocoles stricts
Pour une médecine, sans conflit

[Couplet 2]
Critères diagnostiques, infections définies
Sites opératoires, prévention affinée
Facteurs risque, analyse fine
Critères précis, méthode discipline
Prévention ciblée, infections urinaires
Pneumopathies, mesures salutaires

[Refrain]
Gestion experte, risques maîtrisés
Surveillance active, qualité organisée
Prévention ciblée, infections contrôlées
Dans l''expertise, sécurité assurée
Méthodes avancées, protocoles stricts
Pour une médecine, sans conflit

[Couplet 3]
Cathéters sondes, dispositifs médicaux
Prévention adaptée, gestes nouveaux
BMR et BHR, résistance organisée
Précautions standard, mesures raisonnées
Mise en œuvre, protocoles validés
Qualité assurée, risques maîtrisés

[Refrain]
Gestion experte, risques maîtrisés
Surveillance active, qualité organisée
Prévention ciblée, infections contrôlées
Dans l''expertise, sécurité assurée
Méthodes avancées, protocoles stricts
Pour une médecine, sans conflit

[Pont]
Surveillance épidémiologique, données fines
Prévention adaptée, méthodes disciplines
Protocoles validés, sécurité renforcée
Dans l''expertise, excellence avancée

[Refrain Final]
Gestion experte, risques maîtrisés
Surveillance active, qualité organisée
Prévention ciblée, infections contrôlées
Dans l''expertise, sécurité assurée
Méthodes avancées, protocoles stricts
Pour une médecine, sans conflit'
]
WHERE item_code = 'IC-4';

-- IC-5: Responsabilités médicales - Gestion des erreurs
UPDATE public.edn_items_immersive 
SET paroles_musicales = ARRAY[
  -- Rang A: Responsabilités médicales
  '[Couplet 1]
Responsabilité définie, sanction assumée
Pénale civile, administrative encadrée
Disciplinaire aussi, solidarité
Sans faute parfois, responsabilité
Faute caractérisée, définition claire
Accident médical, affection iatrogène

[Refrain]
Responsabilités multiples, cadre organisé
Erreur médicale, leçon tirée
Culture de sécurité, système régénère
Dans l''amélioration, lumière
Facteurs humains, erreur compréhensible
Prévention sage, démarche possible

[Couplet 2]
Erreur médicale, définition claire
Accident médical, réalité à gérer
Infection nosocomiale, risque assumé
Aléa thérapeutique, vérité acceptée
Facteurs humains, erreur compréhensible
Typologie définie, analyse possible

[Refrain]
Responsabilités multiples, cadre organisé
Erreur médicale, leçon tirée
Culture de sécurité, système régénère
Dans l''amélioration, lumière
Facteurs humains, erreur compréhensible
Prévention sage, démarche possible

[Couplet 3]
Prévention organisée, erreurs et EIAS
Barrières sécurité, protection là
Approche systémique, culture positive
Erreur instruit, démarche active
Principaux facteurs, contentieux prévenus
Ouverture contentieux, risques connus

[Refrain]
Responsabilités multiples, cadre organisé
Erreur médicale, leçon tirée
Culture de sécurité, système régénère
Dans l''amélioration, lumière
Facteurs humains, erreur compréhensible
Prévention sage, démarche possible

[Pont]
Dimension humaine, facteur essentiel
Prévention adaptée, approche sensuelle
Amélioration continue, système mature
Où l''erreur devient, belle parure

[Refrain Final]
Responsabilités multiples, cadre organisé
Erreur médicale, leçon tirée
Culture de sécurité, système régénère
Dans l''amélioration, lumière
Facteurs humains, erreur compréhensible
Prévention sage, démarche possible',

  -- Rang B: Analyse épidémiologique
  '[Couplet 1]
Épidémiologie fine, facteurs identifiés
Contentieux médical, causes clarifiées
Suivi et pronostic, évolution tracée
Définition experte, approche avancée
Principaux facteurs, analyse approfondie
Ouverture contentieux, méthodologie

[Refrain]
Analyse experte, gestion avancée
Épidémiologie, donnée pensée
Facteurs de risque, prévention ciblée
Dans l''expertise, sécurité assurée
Approche systémique, méthode organisée
Pour une médecine, toujours améliorée

[Couplet 2]
Facteurs humains, compréhension fine
Erreur et facteurs, approche discipline
Prévention ciblée, erreurs maîtrisées
EIAS contrôlés, qualité organisée
Notion barrière, sécurité renforcée
Approche experte, excellence avancée

[Refrain]
Analyse experte, gestion avancée
Épidémiologie, donnée pensée
Facteurs de risque, prévention ciblée
Dans l''expertise, sécurité assurée
Approche systémique, méthode organisée
Pour une médecine, toujours améliorée

[Couplet 3]
Culture sécurité, système mature
Amélioration devient, belle parure
Approche systémique, vision globale
Culture positive, démarche idéale
Amélioration continue, progrès continu
Médecine future, avenir tenu

[Refrain]
Analyse experte, gestion avancée
Épidémiologie, donnée pensée
Facteurs de risque, prévention ciblée
Dans l''expertise, sécurité assurée
Approche systémique, méthode organisée
Pour une médecine, toujours améliorée

[Pont]
Évolution continue, surveillance fine
Prévention adaptée, approche discipline
Excellence avancée, qualité renforcée
Dans le progrès, sécurité assurée

[Refrain Final]
Analyse experte, gestion avancée
Épidémiologie, donnée pensée
Facteurs de risque, prévention ciblée
Dans l''expertise, sécurité assurée
Approche systémique, méthode organisée
Pour une médecine, toujours améliorée'
]
WHERE item_code = 'IC-5';
