-- Correction et enrichissement des compétences rang B manquantes

-- IC-2 Rang B : Trouver une compétence existante et l'enrichir
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en organisation professionnelle : maîtriser l''organisation de l''exercice médical et les statuts professionnels - OIC-002-02-B',
  sommaire = 'Organisation exercice médical - Statuts professionnels - Ordres professionnels - Régulation étatique - Exercice libéral - Exercice salarié',
  mecanismes = 'L''organisation de l''exercice médical repose sur la régulation par les ordres professionnels, la définition des statuts d''exercice (libéral, salarié, mixte) et l''encadrement par les pouvoirs publics.',
  indications = 'Installation professionnelle - Changement statut - Conflits déontologiques - Exercice pluriprofessionnel - Télémédecine',
  effets_indesirables = 'Rigidité statutaire - Conflits de compétence - Lourdeur administrative - Inégalités territoriales',
  interactions = 'Législation santé - Politiques publiques - Conventions collectives - Assurance maladie - Territoires de santé',
  modalites_surveillance = 'Conseil de l''Ordre - ARS - Caisses d''assurance maladie - Évaluation des pratiques',
  causes_echec = 'Méconnaissance réglementaire - Inadaptation territoriale - Évolutions législatives - Complexité administrative',
  contributeurs = 'CNOM, CSMF, FMF, SML, Dr. Jacques Lucas (CNOM)',
  ordre_affichage = 2
WHERE item_parent = '002' AND rang = 'B' AND objectif_id LIKE 'OIC-002-%';

-- IC-3 Rang B : Enrichir une compétence existante
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en gestion de l''incertitude : maîtriser la prise de décision dans l''incertitude et les situations complexes - OIC-003-02-B',
  sommaire = 'Incertitude diagnostique - Complexité clinique - Tests diagnostiques - Probabilités - Raisonnement bayésien - Gestion ambiguïté',
  mecanismes = 'La gestion de l''incertitude utilise le raisonnement probabiliste, l''analyse bayésienne, l''évaluation des tests diagnostiques et la tolérance à l''ambiguïté pour optimiser les décisions complexes.',
  indications = 'Diagnostics difficiles - Maladies rares - Symptômes atypiques - Tests ambigus - Pronostic incertain - Thérapeutiques expérimentales',
  effets_indesirables = 'Anxiété décisionnelle - Sur-investigation - Paralysie analytique - Perte confiance patient - Coûts excessifs',
  interactions = 'Niveau preuve scientifique - Ressources disponibles - Contraintes temporelles - Préférences patient - Expertise disponible',
  modalites_surveillance = 'Revues de cas complexes - Consultation pluridisciplinaire - Second avis - Suivi long terme',
  causes_echec = 'Intolérance incertitude - Formation statistique insuffisante - Pression performance - Évitement diagnostic',
  contributeurs = 'Prof. Gerd Gigerenzer (Max Planck), Prof. Jerome Groopman (Harvard), Society for Medical Decision Making',
  ordre_affichage = 2
WHERE item_parent = '003' AND rang = 'B' AND objectif_id LIKE 'OIC-003-0%-B' LIMIT 1;

-- IC-5 Rang B : Enrichir une compétence existante  
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en communication de crise : maîtriser la communication avec les patients et familles après un événement indésirable - OIC-005-02-B',
  sommaire = 'Communication post-erreur - Excuse et explication - Transparency - Disclosure - Gestion émotionnelle - Aspect médico-légal',
  mecanismes = 'La communication post-erreur nécessite transparence, empathie, explication factuelle, présentation d''excuses appropriées, gestion des émotions et accompagnement dans les démarches.',
  indications = 'Erreurs médicales - Complications évitables - Événements indésirables - Dysfonctionnements - Réclamations patients',
  effets_indesirables = 'Stress post-traumatique - Culpabilité excessive - Perte confiance - Conflits médico-légaux - Épuisement émotionnel',
  interactions = 'Cadre légal - Assurances professionnelles - Direction établissement - Médiateurs - Avocats - Familles',
  modalites_surveillance = 'Formation communication crise - Soutien psychologique - Débriefing - Supervision - Groupes de parole',
  causes_echec = 'Déni - Évitement - Formation insuffisante - Peur poursuites - Culture non-transparente - Isolement professionnel',
  contributeurs = 'AHRQ Disclosure Toolkit, Prof. Thomas Gallagher (Washington), Institut Sécurité Patients',
  ordre_affichage = 2
WHERE item_parent = '005' AND rang = 'B' AND objectif_id LIKE 'OIC-005-0%-B' LIMIT 1;