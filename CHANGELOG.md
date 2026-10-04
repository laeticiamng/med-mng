# Changelog

All notable changes to this project will be documented in this file.

## [2026-10-04] — Finalisation, vague 2 (contre-vérification)
### Sécurité
- `generer-paroles-item` : un abonné ne peut plus réécrire les paroles publiées d'un item (paroles rédigées rendues telles quelles ; réécriture réservée au jeton d'administration).
- `send-security-alert`, `send-scheduled-reports`, `send-accessibility-report` et l'ancien `music-status` réservés aux administrateurs.
### Retiré
- `/demo` (anciens numéros d'items, cas clinique et « mode examen » rédigés à la main) et `/parcours` (9 spécialités sur 10 vides, intitulés d'étapes faux) : redirigés vers `/edn-complete`, retirés du sitemap.
### Tests
- E2E : `mm-generate-music` doit répondre 402 `PREMIUM_REQUIS` à un compte gratuit (un 400 ne prouvait pas le verrou) ; sondes des fonctions ci-dessus ; pages retirées.

## [2026-10-04] — Finalisation, vague 2
### Retiré (décision DC7 : contenu médical généré non vérifié, hors offre)
- Chat et copilote IA, tuteur IA (flottant et sur la fiche), cas cliniques, examens blancs, QCM et planning générés par IA, « Générer depuis un item » des flashcards. Les anciennes adresses redirigent vers `/edn-complete` (ou `/ecos`) ; les fonctions serveur correspondantes sont réservées aux administrateurs.
### Sécurité
- Fonctions payantes sans appelant dans l'application réservées aux administrateurs (generate-content, generate-image, generate-comic-images, generate-medical-lyrics, generate-voice, translate, ai-core, ai-content, synchronized-lyrics ; actions generate_lyrics, process_audio, generate_voice d'`ai-audio`).
- `send-welcome-email` et `send-emails` ne sont plus des relais d'e-mails ouverts.
### Corrigé
- Politique de confidentialité et mentions légales : prestataires réellement appelés (DC8). « Référentiel LiSA 2026 (UNESS) » au lieu de « source publique » (DC4).
- Titres des 12 stations ECOS par motif de consultation, sans le diagnostic (DC9, migration `20261004140000`).
- Quiz : « Terminer » inactif tant que la dernière question est sans réponse.
- Profil › Paramètres : réglages factices et export factice retirés.
### Tests
- Suite E2E de production `e2e-prod/` (Playwright, non destructive).

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
