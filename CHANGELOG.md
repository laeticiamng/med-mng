# Changelog

All notable changes to this project will be documented in this file.

## [2026-10-04] — Finalisation (audit et revue critique)
### Sécurité
- La génération audio n'est plus accessible sans abonnement : `ai-audio` (generate_music, extend) et `music-generation` (POST /generate) sont retirés ; `music-generation-secure` est retirée.
- 30 fonctions Edge payantes refusent les appels anonymes (`_shared/mm-garde.ts`).
- Quota audio non contournable : registre serveur `mm_generations_audio`, et âge des générations lu dans ce registre.
- Fonctions d'abonnement non appelables avec la seule clé publique (migration `20261004130000`).
### Corrigé
- Le clic « Générer la chanson » faisait planter la page (variables CSS passées au canvas).
- Les chansons sont conservées au-delà des 14 jours de Suno (compartiment `mm-chansons`).
- ECOS : le dossier du patient s'affiche pendant la station ; l'étape « Je fais » est complète.
- « Progression » ne finit plus en erreur ; la navigation ne compte plus comme de l'étude ; les objectifs d'EmotionsCare n'apparaissent plus.
- Une seule en-tête sur `/med-mng/*` ; titre de l'item visible sur mobile ; boutons de la bibliothèque nommés ; chansons de l'item visibles sur l'onglet Musique.
- Allégations corrigées : situations ECOS « d'entraînement » (et non « du référentiel ») ; génération audio réservée à Premium ; aucune chanson pour les ECOS.

## [0.1.0] - 2025-07-11
### Added
- Basic Express server with health endpoint
- Jest tests with coverage
- CI workflow
- Dockerfile and .dockerignore
