-- Correction et enrichissement des compétences rang B avec objectif_id spécifiques

-- IC-3 Rang B : Analyse décisionnelle (OIC-003-16-B)
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en analyse décisionnelle : maîtriser les outils d''aide à la décision et l''analyse des controverses médicales - OIC-003-16-B',
  sommaire = 'Analyse décisionnelle - Outils aide décision - Controverses médicales - Arbres décision - Modélisation - Evidence conflicting',
  mecanismes = 'L''analyse décisionnelle structure la prise de décision par la modélisation des options, l''évaluation probabiliste des outcomes, l''analyse coût-efficacité et la gestion des controverses scientifiques.',
  indications = 'Décisions complexes - Options multiples - Preuves contradictoires - Controverses scientifiques - Analyses économiques - Recommandations',
  effets_indesirables = 'Complexification excessive - Paralysie par sur-analyse - Réduction simpliste - Perte intuition clinique',
  interactions = 'Qualité données - Expertise méthodologique - Ressources temps - Acceptabilité cliniciens - Contexte organisationnel',
  modalites_surveillance = 'Validation modèles - Suivi implémentation - Évaluation impact - Retours utilisateurs - Mise à jour données',
  causes_echec = 'Modèles inadaptés - Données insuffisantes - Résistance utilisateurs - Complexité excessive - Formation manquante',
  contributeurs = 'Society for Medical Decision Making, Prof. Milton Weinstein (Harvard), ISPOR France',
  ordre_affichage = 16
WHERE objectif_id = 'OIC-003-16-B';

-- IC-5 Rang B : Récupérer l'objectif_id correct pour IC-5 rang B
UPDATE oic_competences 
SET 
  titre_complet = 'Expertise en facteurs systémiques des erreurs : analyser les défaillances organisationnelles et concevoir les systèmes sûrs - OIC-005-02-B',
  sommaire = 'Défaillances organisationnelles - Systèmes sûrs - Barrières sécurité - Design systèmes - Human factors - Résilience',
  mecanismes = 'L''analyse des facteurs systémiques identifie les défaillances latentes, conçoit des systèmes résilients avec barrières multiples et intègre les facteurs humains dans le design organisationnel.',
  indications = 'Conception systèmes - Évaluation risques - Amélioration processus - Formation équipes - Changements organisationnels',
  effets_indesirables = 'Sur-ingénierie - Coûts élevés - Résistances changement - Complexité système - Perte flexibilité',
  interactions = 'Culture organisation - Leadership - Ressources - Technologies - Contraintes réglementaires - Facteurs économiques',
  modalites_surveillance = 'Indicateurs performance - Mesure culture sécurité - Audit systèmes - Feedback utilisateurs',
  causes_echec = 'Sous-estimation complexité - Résistance changement - Ressources insuffisantes - Formation inadéquate',
  contributeurs = 'Institute for Healthcare Improvement, Prof. Don Berwick, Joint Commission International',
  ordre_affichage = 2
WHERE item_parent = '005' AND rang = 'B' AND objectif_id LIKE 'OIC-005-0%-B';