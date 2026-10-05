# E2E de production — Med MNG

Suite Playwright **non destructive et idempotente**, exécutée contre le site en ligne (défaut `https://medmng.com`). Aucun compte n'est créé, rien n'est payé (les pages Stripe sont interceptées dès que leur adresse est demandée), aucun quiz n'est terminé. Les sondes de sécurité envoient un corps invalide : aucune génération ne peut partir, même si un contrôle d'accès venait à manquer.

```bash
E2E_FREE_EMAIL=… E2E_FREE_PASSWORD=… E2E_PREMIUM_EMAIL=… E2E_PREMIUM_PASSWORD=… \
  npx playwright test -c e2e-prod/playwright.config.ts                 # tout, sauf la génération audio
npx playwright test -c e2e-prod/playwright.config.ts --grep-invert @attend-deploiement   # seulement ce qui est déjà en production
E2E_GENERATION=1 npx playwright test -c e2e-prod/playwright.config.ts generation.spec.ts  # 1 génération réelle (payante)
```

Chromium hors réseau standard : `PW_EXECUTABLE=/chemin/vers/chrome`. Captures d'échec dans `$TMPDIR/medmng-e2e-prod` (ou `$E2E_OUTPUT_DIR`), sans trace (elle contiendrait les jetons). Les sessions des comptes de test sont écrites dans un dossier temporaire et supprimées à la fin.

## Variables (jamais dans le dépôt)

| Variable | Rôle |
|---|---|
| `E2E_BASE_URL` | cible (défaut : production) |
| `E2E_FREE_EMAIL` / `E2E_FREE_PASSWORD` | compte **gratuit** confirmé : verrous, Stripe Checkout, espace personnel, connexion/déconnexion |
| `E2E_PREMIUM_EMAIL` / `E2E_PREMIUM_PASSWORD` | compte **Premium** (abonnement actif ou en essai) : contenu ouvert, bibliothèque, portail Stripe |
| `E2E_SUPABASE_URL` / `E2E_SUPABASE_ANON_KEY` | facultatif : sinon lues dans le JavaScript public du site (clé publique) |
| `E2E_GENERATION=1` | autorise le test de génération audio réelle |
| `E2E_PAROLES=1` | autorise le test « paroles rédigées rendues telles quelles » de `generer-paroles-item` — **seulement après son redéploiement** (l'ancienne version ferait 1 à 3 appels à l'IA, sans rien enregistrer) |
| `E2E_RETRIES` | relances (défaut 0) |

Sans compte fourni, les tests qui en ont besoin sont ignorés. La déconnexion Supabase ferme toutes les sessions du compte gratuit : le projet `deconnexion` s'exécute en dernier ; ne pas lancer la suite pendant qu'une autre session utilise ce compte.

## Ce qui est couvert

- **public.spec.ts** — accueil (promesse exacte), tarifs (0 €, 69 €/an, 9,90 €/mois), CGV, mentions, confidentialité, robots/sitemap/llms.txt, mobile 390 px sans débordement, 0 erreur console / 4xx / 5xx ; allégations corrigées (DC4, DC7, DC8) ; pages retirées (`/demo`, `/parcours`, `/exemple-cas-clinique`, `/duel`) redirigées et absentes du sitemap ; interface en français uniquement, même avec un navigateur anglais et un ancien choix « English » (D42) ; mesure d'audience : **réalité** des statistiques de l'hébergeur (`/~flock.js` : envoi `page_hit` avant tout choix, cookie `session-id` de 30 min — échoue si Lovable change ce comportement, mettre alors les textes à jour), bandeau et politiques qui les décrivent, aucune mesure Med MNG sans accord.
- **contenu.spec.ts** — fiches IC-1 (rang A seul, mention neutre) et IC-150 (rang A/B officiels), compteurs du référentiel, recherche « otoscopie » → IC-150 (⌘K et liste), quiz IC-1 (« Suivant » après un choix, bonnes réponses non cycliques, « Terminer »), ECOS /ecos/1 (dossier du patient, « Je fais » complet), titres des stations (DC9).
- **verrou.spec.ts** — verrou Premium côté serveur : colonnes Premium illisibles (42501), RPC `mm_contenu_immersif_item` verrouillée pour IC-150 (anonyme, gratuit) et ouverte en Premium ; RPC d'abonnement fermées à la clé publique ; verrou visible dans l'interface.
- **fonctions.spec.ts** — fonctions Edge : 401 sans en-tête, 403 pour un compte gratuit sur les fonctions d'administration, les fonctions IA hors offre, les alertes et rapports par e-mail et l'ancien suivi Suno, `ai-audio generate_music` 410, `music-generation` 410, `mm-generate-music` 402 `PREMIUM_REQUIS` pour un compte gratuit, e-mail de bienvenue sans relais ouvert ; paroles rédigées jamais réécrites par un abonné (`E2E_PAROLES=1`) ; `whisper-transcribe` : adresse externe refusée (400) et corps de 14 Mo refusé (413), sondes sans appel à OpenAI ; Premium : générations récentes restées sur un fichier Suno temporaire copiées dans `mm-chansons` par `mm-music-status` (usage normal, aucun crédit).
- **compte.spec.ts** — gratuit : progression, objectifs (aucun objectif EmotionsCare), tableau de progression, profil (en français, sans sélecteur de langue), case de renonciation puis **Stripe Checkout atteint** (`checkout.stripe.com/c/pay/cs_…`) ; Premium : paroles d'IC-150 et « Mes chansons de cet item », bibliothèque (aucun bouton sans nom, durées en minutes), mobile, **portail Stripe atteint** (`billing.stripe.com`).
- **critique.spec.ts** — non-régression de la critique finale (05.10.2026) : récit et planches décrits tels qu'ils sont (IC-1, image dessinée pour l'item), FAQ/CGU/méthode sans « en cours de génération » ; IC-30 sans chanson « Rang A » ; notes personnelles (visiteur invité à se connecter ; saisie hors ligne gardée puis envoyée, même onglet fermé ; ouverture puis départ rapide sans écriture ni perte — la note du compte gratuit est remise en état dans tous les cas) ; onglet ouvert hors connexion (message dédié, rechargement au retour du réseau, sans service worker) ; quiz sans classement ni « 100 % » inventé ; recherche singulier/pluriel et accents (liste, ⌘K) ; quiz terminé hors connexion (score non enregistré signalé, rien d'écrit).
- **deconnexion.teardown.ts** (en dernier) — inscription bloquée sans CGU (aucune requête), mauvais mot de passe, connexion vers la page demandée, `next` externe ignoré, déconnexion.
- **generation.spec.ts** — génération audio réelle (voir ci-dessous).

## Étiquettes

- `@attend-deploiement` — vérifie une correction pas encore en production (échoue tant qu'elle n'est pas publiée / déployée / appliquée).
- `@couteux` `@long` — génération audio réelle : **1 génération** du quota mensuel du compte Premium (30) et 1 crédit Suno par exécution ; jusqu'à 6 minutes. Ignorée sans `E2E_GENERATION=1`. Aucun autre test ne consomme de crédit d'IA.
