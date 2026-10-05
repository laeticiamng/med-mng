# Changelog

All notable changes to this project will be documented in this file.

## [2026-10-05] — Critique finale indépendante
### Corrigé (fiabilité, données)
- Notes personnelles : ouvrir un item supprimait la note enregistrée puis la recréait 1 s plus tard (la quitter entre-temps la perdait) ; hors connexion, « Sauvegardé » s'affichait sans rien envoyer. Saisie gardée sur l'appareil jusqu'à confirmation, renvoyée au retour du réseau, état réel affiché ; visiteur invité à se connecter.
- Coupure de réseau pendant le chargement d'une page : message « Connexion interrompue » (en-tête et onglets gardés) et rechargement au retour du réseau, au lieu de la page « Oops ! » ; un seul rechargement automatique si les fichiers d'une ancienne version manquent.
- Quiz terminé hors connexion : score non enregistré signalé (il était perdu en silence).
### Corrigé (allégations, contenu, UX)
- Récit et planches : mentions exactes (rédigés et illustrés par IA pour chaque item) au lieu de « formules types communes à tous les items » et « photos génériques » ; FAQ, CGU et page Méthode : plus « en cours de génération ».
- Onglet Musique d'un item sans compétence de rang A (IC-30, IC-142) : plus de chanson « Rang A » ni de mots-clés bruts.
- Quiz : « Classement » (ne pouvait montrer que soi) et « Partager » (score « 100 % » inventé) retirés.
- Recherche (liste et ⌘K) : singulier/pluriel et accents confondus (« accident vasculaire cérébral » trouve l'IC-340) ; ⌘K classe d'abord les titres puis les items aux compétences les plus concernées.
### Tests
- `e2e-prod/critique.spec.ts` : 10 tests de non-régression (`@attend-deploiement`) ; tests unitaires : brouillon de note, motif de recherche, barrière de chargement.

## [2026-10-04] — Finalisation, vague 3
### Retiré
- Sélecteur de langue (drapeau flottant) : il ne traduisait que quelques libellés ; l'interface est en français uniquement, un ancien choix « English » est effacé (D42).
- Page SEO « Exemple de cas clinique » (cas rédigé sans source) → `/ecos` ; `/duel` (questions aux codes d'item faux) → `/edn-complete` (D44, D53).
### Corrigé (allégations, à relire par la CEO)
- Bandeau cookies, politique cookies et politique de confidentialité : statistiques de l'hébergeur Lovable décrites (pages vues, cookie `session-id` de 30 minutes, toujours actives) ; « Plausible Analytics » (jamais chargé) et les cookies fictifs retirés ; inventaire réel des cookies et du stockage.
- La visite de la page Tarifs par un visiteur non connecté n'est plus enregistrée sans son accord (mesure d'audience Med MNG optionnelle, choix « Refuser / Accepter la mesure »).
### Sécurité
- `whisper-transcribe` : 20 transcriptions par compte et par jour, audio de 10 Mo au maximum, `audioUrl` limitée au stockage du projet (plus de téléchargement d'adresse quelconque) (D45).
### Audio
- `mm-music-status` copie dans `mm-chansons` l'audio d'une génération terminée resté sur un fichier Suno temporaire (14 jours) (D40).

## [2026-10-05] — Finalisation, vague 3 (contre-vérification)
### Corrigé
- Libellés anglais restants : « Record streak » (profil), « Streak » (progression, barre mobile, « Mes succès ») → « Meilleure série », « Jours de suite », « série » ; « Répartition par type » du tableau de progression en français, sans identifiants bruts (`srs_review: 0`…) ni zéros.
- « Articles liés » de 4 pages publiques : plus de « Simulation examen EDN » (fonction retirée) ni de « Cas cliniques EDN » (redirection en double).
- Consentement : refuser la mesure ou retirer son accord efface aussi l'identifiant de visite (`conversion_session`) (à relire par la CEO avec les textes cookies).
### Tests
- E2E : aucune page du sitemap ne pointe vers une adresse retirée ; chemin « accord puis retrait » du bandeau (enregistrement intercepté) ; profil, progression et « Mes succès » sans « streak ».

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
