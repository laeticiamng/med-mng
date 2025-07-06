-- Enrichissement des compétences OIC rang B avec contenu détaillé niveau LiSA

-- IC-2 Rang B : Valeurs professionnelles avancées (OIC-002-01-B)
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en éthique médicale : résoudre les dilemmes éthiques complexes et les conflits de valeurs en pratique clinique - OIC-002-01-B',
  sommaire = 'Dilemmes éthiques complexes - Conflits de valeurs - Comités d''éthique - Consultation éthique - Éthique narrative - Éthique du care',
  mecanismes = 'La résolution des dilemmes éthiques complexes nécessite une analyse multidimensionnelle intégrant principes déontologiques, contexte clinique, valeurs culturelles, ressources disponibles et délibération collégiale.',
  indications = 'Acharnement thérapeutique - Euthanasie/suicide assisté - Refus de soins - Patients mineurs - Troubles psychiatriques - Fin de vie',
  effets_indesirables = 'Paralysie décisionnelle - Stress moral - Épuisement éthique - Conflits interprofessionnels - Détresse familiale',
  interactions = 'Cadre légal - Contraintes économiques - Pressions familiales - Médias - Opinion publique - Cultures religieuses',
  modalites_surveillance = 'Comités d''éthique hospitaliers - Supervision éthique - Groupes de parole - Formation continue spécialisée',
  causes_echec = 'Formation éthique insuffisante - Pression temporelle - Isolement décisionnel - Rigidité cognitive - Évitement du conflit',
  contributeurs = 'Espace Éthique Ile-de-France, Prof. Didier Sicard, Dr. Marie de Hennezel, CCNE',
  ordre_affichage = 1
WHERE objectif_id = 'OIC-002-01-B';

-- IC-3 Rang B : Décision médicale partagée avancée (OIC-003-01-B)
UPDATE oic_competences 
SET 
  titre_complet = 'Maîtrise de la décision médicale partagée : intégrer complexité scientifique, incertitude clinique et préférences individuelles - OIC-003-01-B',
  sommaire = 'Incertitude diagnostique - Décision partagée complexe - Préférences patients - Risques/bénéfices - Communication probabiliste - Outils d''aide à la décision',
  mecanismes = 'La décision partagée avancée implique la communication transparente des incertitudes, l''utilisation d''outils visuels de probabilité, l''exploration des valeurs profondes du patient et la co-construction de la décision.',
  indications = 'Maladies rares - Pronostic incertain - Options thérapeutiques multiples - Traitements expérimentaux - Dépistage controversé',
  effets_indesirables = 'Paralysie par excès d''information - Anxiété décisionnelle - Transfert excessif de responsabilité - Perte de confiance médicale',
  interactions = 'Niveau d''éducation patient - Facteurs culturels - Entourage familial - Stress émotionnel - Contraintes temporelles',
  modalites_surveillance = 'Évaluation satisfaction décisionnelle - Mesure du regret décisionnel - Suivi adhésion thérapeutique - Auto-évaluation compétences',
  causes_echec = 'Communication inadéquate - Manque d''outils - Formation insuffisante - Asymétrie informationnelle - Paternalisme résiduel',
  contributeurs = 'International Patient Decision Aid Standards, Prof. France Légaré (Université Laval), HAS',
  ordre_affichage = 1
WHERE objectif_id = 'OIC-003-01-B';

-- IC-4 Rang B : Analyse systémique des erreurs (OIC-004-05-B)
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en analyse systémique des erreurs : maîtriser les méthodologies d''analyse des causes profondes et facteurs organisationnels - OIC-004-05-B',
  sommaire = 'Analyse causes profondes - Facteurs organisationnels - Swiss Cheese Model - ALARM - Cartographie risques - Facteurs humains',
  mecanismes = 'L''analyse systémique utilise des modèles théoriques (Reason, Vincent) pour identifier les défaillances latentes, analyser les interactions homme-système et proposer des barrières préventives multi-niveaux.',
  indications = 'Événements indésirables graves - Événements sentinelles - Analyse proactive des risques - Retours d''expérience - Amélioration continue',
  effets_indesirables = 'Complexification excessive - Paralysie analytique - Déresponsabilisation individuelle - Coût organisationnel élevé',
  interactions = 'Culture organisationnelle - Leadership - Ressources disponibles - Contraintes temporelles - Résistances au changement',
  modalites_surveillance = 'Indicateurs sécurité - Suivi actions correctives - Évaluation culture sécurité - Benchmark inter-établissements',
  causes_echec = 'Formation méthodologique insuffisante - Manque de temps - Résistances hiérarchiques - Culture punitive persistante',
  contributeurs = 'AHRQ, Prof. Charles Vincent (Oxford), Institut pour la Sécurité des Patients, ENSP',
  ordre_affichage = 5
WHERE objectif_id = 'OIC-004-05-B';

-- IC-5 Rang B : Facteurs humains et organisationnels (OIC-005-01-B)
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en facteurs humains : analyser l''impact des facteurs cognitifs, émotionnels et organisationnels sur la sécurité - OIC-005-01-B',
  sommaire = 'Facteurs humains - Charge cognitive - Fatigue - Stress - Interruptions - Communication - Travail d''équipe - Facteurs organisationnels',
  mecanismes = 'Les facteurs humains influencent les performances par la charge cognitive, la mémoire de travail, l''attention, les biais cognitifs, le stress physiologique et les dynamiques d''équipe dans un environnement organisationnel donné.',
  indications = 'Analyse post-erreur - Amélioration ergonomie - Gestion charge travail - Formation équipes - Prévention burn-out - Design systèmes',
  effets_indesirables = 'Sur-analyse comportementale - Stigmatisation individuelle - Complexité excessive - Résistances professionnelles',
  interactions = 'Architecture des lieux - Technologies - Rythmes de travail - Hiérarchie - Culture professionnelle - Contraintes économiques',
  modalites_surveillance = 'Questionnaires charge cognitive - Mesure fatigue - Évaluation stress - Observation ergonomique - Indicateurs RH',
  causes_echec = 'Déni facteurs humains - Formation inadéquate - Sous-estimation importance - Approche trop technique - Manque leadership',
  contributeurs = 'SELF (Société d''Ergonomie), Prof. Pascal Béquin (CNAM), Institut National Sécurité Patients',
  ordre_affichage = 1
WHERE objectif_id = 'OIC-005-01-B';