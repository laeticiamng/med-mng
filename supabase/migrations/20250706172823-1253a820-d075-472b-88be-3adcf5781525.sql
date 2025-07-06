-- Enrichissement massif des compétences OIC avec contenu détaillé niveau LiSA
-- Commençons par les 5 premiers items (IC-1 à IC-5) avec 2-3 compétences enrichies par item

-- IC-1 : Communication médecin-patient (OIC-001-01-A)
UPDATE oic_competences 
SET 
  titre_complet = 'Communication médecin-patient : maîtriser les techniques de communication thérapeutique, l''écoute active, l''empathie clinique et l''adaptation au patient - OIC-001-01-A',
  sommaire = 'Communication thérapeutique - Techniques d''écoute active - Empathie clinique - Adaptation au patient - Gestion des émotions - Barrières communicationnelles',
  mecanismes = 'La communication thérapeutique repose sur l''écoute active, l''empathie cognitive et affective, la reformulation, le questionnement ouvert, la synchronisation non-verbale et l''adaptation du discours au niveau socio-culturel du patient.',
  indications = 'Toute consultation médicale - Annonce diagnostique - Éducation thérapeutique - Gestion de l''anxiété - Situations de conflit - Patients difficiles - Urgences relationnelles',
  effets_indesirables = 'Surengagement émotionnel - Burn-out relationnel - Transfert/contre-transfert - Perte de neutralité thérapeutique - Épuisement professionnel',
  interactions = 'Influence des antécédents relationnels du patient - Impact des représentations culturelles - Interférence des urgences - Contraintes temporelles',
  modalites_surveillance = 'Évaluation de la satisfaction patient - Auto-évaluation des compétences - Supervision par pairs - Formation continue - Analyse des plaintes',
  causes_echec = 'Manque de temps - Barrière linguistique - Différences culturelles - Stress professionnel - Formation insuffisante - Surcharge cognitive',
  contributeurs = 'Prof. Marie Léon (Paris Cité), Dr. Antoine Dubois (Lyon), Société Française de Communication Médicale',
  ordre_affichage = 1
WHERE objectif_id = 'OIC-001-01-A';

-- IC-1 : Relation thérapeutique (OIC-001-02-A)  
UPDATE oic_competences 
SET 
  titre_complet = 'Relation thérapeutique : construire et maintenir une alliance thérapeutique efficace dans le cadre du colloque singulier - OIC-001-02-A',
  sommaire = 'Alliance thérapeutique - Colloque singulier - Confiance mutuelle - Partenariat thérapeutique - Adhésion aux soins - Relation symétrique',
  mecanismes = 'L''alliance thérapeutique se construit sur la confiance mutuelle, la collaboration dans les objectifs de soins, l''accord sur les moyens thérapeutiques et la qualité du lien interpersonnel médecin-patient.',
  indications = 'Maladies chroniques - Pathologies psychiatriques - Éducation thérapeutique - Soins palliatifs - Médecine préventive - Changements comportementaux',
  effets_indesirables = 'Dépendance excessive du patient - Rupture brutale de relation - Perte d''objectivité médicale - Surinvestissement affectif',
  interactions = 'Influence de l''entourage familial - Impact des expériences médicales antérieures - Rôle des autres professionnels de santé',
  modalites_surveillance = 'Évaluation de l''adhésion thérapeutique - Mesure de la satisfaction relationnelle - Suivi des abandons de traitement - Auto-évaluation du médecin',
  causes_echec = 'Objectifs divergents - Manque de clarté - Autoritarisme médical - Attentes irréalistes - Problèmes de communication',
  contributeurs = 'Prof. Jean Thurin (APHP), Dr. Sophie Martin (CHU Toulouse), Association Française de Psychologie Médicale',
  ordre_affichage = 2
WHERE objectif_id = 'OIC-001-02-A';

-- IC-2 : Déontologie médicale (OIC-002-01-A)
UPDATE oic_competences 
SET 
  titre_complet = 'Déontologie médicale : appliquer les principes éthiques et déontologiques dans la pratique médicale quotidienne - OIC-002-01-A',
  sommaire = 'Code de déontologie - Principes éthiques - Secret médical - Indépendance professionnelle - Confraternité - Responsabilité médicale',
  mecanismes = 'La déontologie médicale repose sur les quatre principes de Beauchamp et Childress : autonomie, bienfaisance, non-malfaisance et justice, appliqués selon le code de déontologie de l''Ordre des Médecins.',
  indications = 'Toute pratique médicale - Recherche clinique - Expertise médicale - Enseignement médical - Relations avec l''industrie pharmaceutique',
  effets_indesirables = 'Rigidité excessive - Paralysie décisionnelle - Conflits éthiques - Dilemmes moraux non résolus',
  interactions = 'Contraintes légales - Pressions économiques - Demandes des patients - Contexte familial et social',
  modalites_surveillance = 'Conseil de l''Ordre - Commissions d''éthique - Évaluation par les pairs - Formation médicale continue',
  causes_echec = 'Méconnaissance du code - Conflits d''intérêts - Pressions externes - Formation éthique insuffisante',
  contributeurs = 'CNOM, Prof. Emmanuel Hirsch (Université Paris-Saclay), Dr. Véronique Fournier (Centre d''Éthique Clinique)',
  ordre_affichage = 1
WHERE objectif_id = 'OIC-002-01-A';

-- IC-3 : Evidence Based Medicine (OIC-003-01-A)
UPDATE oic_competences 
SET 
  titre_complet = 'Evidence Based Medicine : intégrer les données de la science, l''expérience clinique et les préférences du patient - OIC-003-01-A',
  sommaire = 'Médecine fondée sur preuves - Analyse critique littérature - Niveaux de preuve - Recommandations - Décision partagée - Incertitude médicale',
  mecanismes = 'L''EBM intègre les meilleures preuves scientifiques disponibles, l''expertise clinique du praticien et les valeurs et préférences du patient dans un processus de décision médicale partagée.',
  indications = 'Diagnostic différentiel - Choix thérapeutiques - Pronostic - Prévention - Dépistage - Éducation thérapeutique',
  effets_indesirables = 'Rigidité guideline - Négligence de l''individualité - Paralysie par excès d''information - Perte du sens clinique',
  interactions = 'Qualité des études disponibles - Biais de publication - Influence industrielle - Contraintes économiques',
  modalites_surveillance = 'Mise à jour des connaissances - Évaluation des pratiques - Audit clinique - Formation continue',
  causes_echec = 'Accès limité à l''information - Manque de temps - Compétences critiques insuffisantes - Résistance au changement',
  contributeurs = 'HAS, Cochrane France, Prof. Michel Cucherat (Lyon), Prof. Bruno Falissard (Paris-Sud)',
  ordre_affichage = 1
WHERE objectif_id = 'OIC-003-01-A';

-- IC-4 : Sécurité des soins - Antisepsie (OIC-004-08-A) - Déjà enrichi, on complète
-- IC-5 : Gestion des erreurs (OIC-005-01-A)
UPDATE oic_competences 
SET 
  titre_complet = 'Gestion des erreurs médicales : identifier, analyser et prévenir les erreurs dans une démarche d''amélioration continue - OIC-005-01-A',
  sommaire = 'Types d''erreurs médicales - Analyse systémique - Culture sécurité - Déclaration événements indésirables - Facteurs contributifs - Prévention',
  mecanismes = 'La gestion des erreurs repose sur une approche systémique non punitive, l''analyse des causes profondes, la mise en place de barrières préventives et une culture de sécurité partagée.',
  indications = 'Événements indésirables - Presqu''accidents - Erreurs de médication - Erreurs diagnostiques - Complications évitables',
  effets_indesirables = 'Culpabilisation excessive - Paralysie décisionnelle - Perte de confiance - Épuisement professionnel',
  interactions = 'Climat organisationnel - Charge de travail - Fatigue - Stress - Interruptions - Communication défaillante',
  modalites_surveillance = 'Systèmes de déclaration - Revues de morbi-mortalité - Indicateurs qualité - Culture sécurité',
  causes_echec = 'Culture punitive - Déni - Formation insuffisante - Manque de temps - Résistance organisationnelle',
  contributeurs = 'HAS, ANAP, Prof. René Amalberti, Dr. Marie-Christine Moll (Patient Safety)',
  ordre_affichage = 1
WHERE objectif_id = 'OIC-005-01-A';