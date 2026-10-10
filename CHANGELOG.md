# Changelog

All notable changes to this project will be documented in this file.

## [2026-10-10] — Sécurité `ai_generated_content`, défauts du test en production, archives
### Sécurité
- `ai_generated_content` : lecture réservée aux administrateurs (était lisible par tout compte connecté : contenus « premium » et un questionnaire de santé). Migration `20261010022829_mm_ai_generated_content_admin`, test `supabase/tests/securite_ai_generated_content.sql` (#240).
### Corrigé (#241, #237)
- `send-welcome-email` : plus de 502 pour une adresse non livrable (domaine réservé) ni pour un refus définitif de Resend.
- Suppression de compte : état « en cours », confirmation visible et focalisée, message et toast avant la redirection.
- `/edn-complete` : `getUser()` et statistiques de gamification partagés entre composants ; plus d'écriture `user_gamification_stats` après déconnexion.
- Recherche : items dont le titre correspond avant ceux trouvés par une compétence ; réponses périmées ignorées dans ⌘K.
- Bandeau cookies masqué tant que le panneau d'accessibilité est ouvert (#237).
### Documentation
- 210 rapports d'audit, tickets et « certifications » de 2025-2026 déplacés dans `docs/archive/2025-2026/` (index : `docs/archive/2025-2026/INDEX.md`) ; `docs/SOURCE_DE_VERITE.md` : état au 10.10.2026.

## [2026-10-09, soir] — Génération musicale réactivée
### Réactivé (décision explicite de l'utilisatrice, 09.10.2026)
- Génération audio des chansons (Premium, 30 par mois) : drapeau `GENERATION_AUDIO_DISPONIBLE` repassé à `true` ; fournisseur technique inchangé (sunoapi.org), aucune migration prévue. Les textes pilotés par le drapeau (offre, tarifs, FAQ, CGV, CGU, JSON-LD, accueil, Create, profil, bibliothèque, e-mail de bienvenue, description du produit Stripe) retrouvent leur formulation d'avant la suspension ; `public/llms.txt` aussi. Conservé : réservation atomique avant l'appel au fournisseur, refus si les compteurs sont illisibles, paroles chantées fidèles, ambiance libre contrôlée, webhook Stripe qui relit l'abonnement. Le message de suspension (inutilisé tant que le drapeau est ouvert) ne mentionne plus de « licences ».
### Tests
- `src/tests/createAudioDisponible.test.tsx` (remplace `createAudioSuspendu`) : drapeau ouvert, promesses d'avant la suspension, JSON-LD et `llms.txt` sans mention de suspension, ordre des contrôles serveur (interrupteur → droits → réservation → appel sunoapi.org), aucune affirmation de licence Suno.

## [2026-10-09] — Suspension de l'audio, Med MNG Create, cohérence finale
### Suspendu (décision CEO du 09.10.2026)
- Génération audio des chansons : nouvelles générations refusées côté serveur (`mm-generate-music`, `GENERATION_SUSPENDUE`, avant toute réservation ou tout appel au fournisseur) tant que les droits commerciaux du moteur musical ne sont pas établis par écrit. Drapeau unique `_shared/mm-disponibilite.ts` (site et serveur). Paroles, fiches, quiz, récits, planches et chansons déjà créées restent disponibles ; prix et formules inchangés (#232).
### Corrigé
- Accueil : l'aide sous « Mettre un item en chanson » affichait du code (`{GENERATION_AUDIO_DISPONIBLE ? … }`) (#233).
- Promesses d'audio restantes (cohérence finale) : `llms.txt` (« génération audio à la demande », « 30 générations par mois »), données structurées (FAQ « puis vous pouvez générer l'audio », « que vous pouvez mettre en musique », étape HowTo « générer l'audio dans la limite de vos crédits »), FAQ du site, bannière du générateur, message de connexion de l'onglet Musique, présentation de la méthode (« génération à la demande »), fin de quiz (« générez une chanson pour réviser »).
- Données structurées : « cas cliniques, QROC » (fonctions retirées), « 31 spécialités », licence Creative Commons inventée et « le système identifie vos lacunes automatiquement » retirés ; étape « Répétition espacée » décrite telle qu'elle est.
- Webhook Stripe : l'état de l'abonnement est relu chez Stripe sur `customer.subscription.created/updated` et `invoice.payment_failed` (un événement ancien livré en retard pouvait rouvrir Premium après une résiliation, ou couper l'accès d'un abonné à jour).
- Mes données : une ligne d'abonnement de démonstration (`sim_…`, 2025) n'est plus présentée comme un abonnement à résilier (même règle que le serveur `delete-user-account`).
- Mobile (390 px) : le bouton flottant « œil » du centre d'accessibilité recouvrait le texte et les actions ; il n'est plus affiché sous 768 px (entrée « Accessibilité » dans le menu mobile) et tient compte de la zone sûre (`safe-area-inset-bottom`) au-delà.
- E-mail de bienvenue envoyé une seule fois par compte (#230) ; paroles fidèles au texte officiel (#227, #229) ; Med MNG Create reconçu (#231).
### Sécurité
- `mm_paroles_redigees` : `search_path` figé (alerte `function_search_path_mutable` du conseiller Supabase ; résultat identique sur les 367 items, empreinte vérifiée avant et après) — migration `20261009150000`.

### Retiré
- Rapports d'audit de février et mars 2026 à la racine (`AUDIT_TECHNIQUE_*.md`) : leurs constats (fonctions ouvertes, fonctionnalités fictives) ont été traités entre le 04 et le 09.10.2026 (voir ci-dessous) ; leur verdict « non prêt » ne décrivait plus le produit.
- PR obsolètes fermées avec justification : #11, #30, #86, #115, #188, #191, #192, #197, #218.
### Tests
- Vitest : JSON-LD GEO et `llms.txt` sans promesse d'audio ni fonction retirée ; webhook (relecture Stripe avant écriture, signature avant traitement) ; identifiant d'abonnement réel ; centre d'accessibilité (bouton masqué sur mobile, entrée du menu). 124 fichiers, 1 540 tests, 0 échec.

## [2026-10-05] — Note finale vérifiée
### Retiré
- « Révision rapide » (`/revision-rapide`, présente dans le sitemap) : son quiz était fabriqué (rang « A » d'un item, « Rang C – Expertise », distracteurs « Analyse financière », bonne réponse toujours la première) → redirigée vers les fiches officielles, retirée du sitemap.
### Corrigé
- Onglet Musique : après chaque génération, une demande de « paroles horodatées » partait vers `mm-music-status` avec un identifiant fabriqué (« IC-150-A ») et échouait en 404 ; la synchronisation automatique (même rendu) est appliquée directement.
- Fonctions `med-mng-api`, `generate-recommendations`, `playlist-manager`, `secure-edn-extraction` : `getUser()` reçoit le jeton (sans lui, certaines versions d'auth-js répondent « session absente » à tout le monde) ; création de chanson `POST /songs` de `med-mng-api` (TypeError, toujours en 500).
### Tests
- Test statique Deno : aucune fonction n'appelle `getUser()` sans jeton ; vitest `useSynchronizedLyrics` ; E2E « Révision rapide » (`@attend-deploiement`).

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
- `whisper-transcribe` : 20 transcriptions par compte et par jour, audio de 6 Mo au maximum (05.10 : avec 10 Mo, le corps dépassait le plafond de la plateforme et le refus 413 n'était jamais atteint), `audioUrl` limitée au stockage du projet (plus de téléchargement d'adresse quelconque) (D45).
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
