# Med MNG — réviser les 367 items EDN en musique

**Production : https://medmng.com** (inscription libre, paiement Stripe Checkout) · éditeur : EmotionsCare SASU · état au 9 octobre 2026

Application web (PWA) de révision pour les étudiants de 2e cycle (DFASM1–DFASM2, EDN 2028 et 2029). Pour chaque item : la fiche des compétences officielles (référentiel LiSA 2026, UNESS) et un contenu « immersif » (paroles de chanson, récit, planches, quiz), mis en musique à la demande.

## Offre

| Formule | Contenu |
|---|---|
| **Gratuit** | Fiches officielles des 367 items (rang A et rang B, table `oic_competences`) ; contenu immersif complet de 10 items d'essai : IC-1, IC-161, IC-154, IC-27, IC-247, IC-359, IC-224, IC-340, IC-356, IC-66 (décision DC5 du 06.10.2026 ; `ITEMS_GRATUITS` dans `src/config/offre.ts`, identique à la fonction SQL `public.mm_items_gratuits()`, qui fait foi — vérifié en production le 07.10.2026) ; 12 situations ECOS d'entraînement rédigées pour Med MNG |
| **Premium — 69 €/an ou 9,90 €/mois** | Contenu immersif des 367 items ; bibliothèque personnelle ; génération audio des chansons (30 par mois ; **réactivée le 09.10.2026** sur décision de l'utilisatrice, voir ci-dessous). Prix Stripe retrouvés par `lookup_key` (`medmng_premium_annual`, `medmng_premium_monthly`, `supabase/functions/_shared/mm-stripe-catalog.ts`) |

Hors offre (retirés de l'interface le 04.10.2026, décision DC7) : chat et copilote IA, tuteur IA, cas cliniques, examens blancs, QCM et planning générés par IA. Leurs anciennes adresses redirigent vers `/edn-complete` (ou `/ecos`) et leurs fonctions serveur sont réservées aux administrateurs. Retirées aussi le même jour : la démo `/demo` (anciens numéros d'items) et les parcours par spécialité `/parcours` (9 sur 10 vides), redirigés vers `/edn-complete`. Le 07.10.2026 : classement (`/leaderboard` → `/achievements`, badges atteignables seulement), cloche de notifications (toujours vide), page `/settings` factice (→ onglet Paramètres du profil) ; une seule page de progression.

## Fonctionnalités (ce qui est réellement proposé)

- **Items EDN** (`/edn-complete`, `/edn-complete/:item/{apercu,rang-a,rang-b,quiz,musique,planches,recit,stats}`) : fiche rang A / rang B, export PDF, recherche par numéro, titre, discipline ou intitulé de compétence (liste et ⌘K).
- **Contenu immersif** : lu par la RPC `mm_contenu_immersif_item` (verrou Premium **côté serveur** ; les colonnes Premium sont illisibles en lecture directe, erreur 42501).
- **Quiz par item** : une question par compétence officielle, quatre énoncés officiels, réponse correcte à une position stable mais non cyclique.
- **Génération audio** (Premium, 30 par mois) : `/med-mng/create` et onglet Musique de la fiche. Suspendue le matin du 09.10.2026, **réactivée le soir du 09.10.2026 sur décision explicite de l'utilisatrice** ; fournisseur technique inchangé (sunoapi.org), **aucune migration prévue**. Drapeau unique `GENERATION_AUDIO_DISPONIBLE = true` dans `supabase/functions/_shared/mm-disponibilite.ts`, lu par le site (`src/config/offre.ts`) et par `mm-generate-music` (à `false`, refus `GENERATION_SUSPENDUE` avant toute réservation ou appel au fournisseur). Garde-fous conservés : abonnement vérifié côté serveur, réservation au registre `mm_generations_audio` avant l'appel au fournisseur, refus si les compteurs sont illisibles, paroles chantées fidèles (nombres et unités en toutes lettres). Changer le drapeau impose de redéployer `mm-generate-music`, `mm-create-checkout`, `mm-stripe-webhook`, `mm-customer-portal` et `send-welcome-email` (description du produit Stripe et e-mail de bienvenue), de mettre à jour `public/llms.txt` et de republier le site. Aucune mention de licence ou de partenariat avec Suno n'est faite (droits non établis par écrit : voir `docs/SOURCE_DE_VERITE.md`).
- **Répétition espacée** (`/srs-review`, compte connecté) : révisions planifiées (algorithme SM-2, tables `user_item_progress`, `item_reviews`, `review_sessions`).
- **ECOS** (`/ecos`, `/ecos/:id`) : 12 stations guidées (dossier du patient, « Je dis / Je fais / Je conclus », chronomètre, grille d'auto-évaluation générique).
- **Espace personnel** : bibliothèque (`/med-mng/music-library`), progression (`/progress-dashboard` ; `/med-mng/progress` y redirige), favoris (`/med-mng/favorites`), succès (`/achievements`), profil (abonnement, portail Stripe). **Mes données** (`/mes-donnees-rgpd`) : export JSON généré dans le navigateur ; suppression du compte par le service commun `delete-user-account` (dépôt EmotionsCare), refusée (409, message affiché avec accès au portail) tant qu'un abonnement Stripe peut être prélevé (`active`, `trialing`, `past_due`, `unpaid`).

## Architecture

- **Front** : React 18, TypeScript, Vite, Tailwind/shadcn, TanStack Query. Projet Lovable ; hébergement Lovable (réseau Cloudflare).
- **Back** : Supabase `yaincoxihiqdksxgrsrk` (région eu-central-1, Francfort) — **partagé avec EmotionsCare** : ne modifier aucune table, politique ou fonction commune sans vérifier l'impact sur EmotionsCare (exemple : `whisper-transcribe` est appelée par EmotionsCare).
- **Génération audio** : `mm-generate-music` (abonnement, quota mensuel, registre `mm_generations_audio`) → sunoapi.org → `mm-suno-callback` (ou rattrapage `mm-music-status`) ; le fichier est copié dans le compartiment `mm-chansons` (l'URL fournie par Suno expire au bout de 14 jours). Si les paroles enregistrées d'un item ne sont pas rédigées, `generer-paroles-item` les réécrit depuis les compétences officielles (passerelle IA de Lovable, Google Gemini) et les enregistre ; des paroles déjà rédigées sont rendues telles quelles (seul le jeton d'administration de `scripts/regenerer.mjs` peut les remplacer).
- **Planches** : `illustrer-case` dessine une seule fois chaque case (OpenAI), conservée dans `bd-illustrations`.
- **Paiement** : `mm-create-checkout` → Stripe Checkout ; `mm-stripe-webhook` → `user_subscriptions` (signature vérifiée ; écriture idempotente par `stripe_subscription_id` ; l'état de l'abonnement est relu chez Stripe à chaque `customer.subscription.*` et `invoice.payment_failed`, car l'ordre de livraison n'est pas garanti) ; `mm-customer-portal` (résiliation, factures). Compte Stripe partagé avec EmotionsCare (`metadata.app = "medmng"`). L'archivage des factures dans `subscription_invoices` est non bloquant : la table n'existe pas en production (migration `20260210130000` non appliquée, volontairement : elle crée aussi une vue de classement qui contournerait la RLS) ; Stripe fait foi.
- **E-mails** : Resend, via `supabase/functions/_shared/mm-email.ts` (bienvenue, envois d'administration, rapports). Expéditeur lu dans `RESEND_FROM` (adresse d'un domaine vérifié dans Resend) ; à défaut, repli sur l'adresse de test `onboarding@resend.dev`, que Resend refuse (403) pour les autres destinataires — l'échec est alors journalisé et renvoyé, jamais présenté comme un envoi.
- **Prestataires réellement appelés** : liste à jour dans la politique de confidentialité (`src/pages/PolitiqueConfidentialite.tsx`).
- **Langue** : interface en français uniquement (pas de sélecteur de langue).
- **Mesure d'audience** : les statistiques de l'hébergeur (« Visitor analytics » de Lovable, `/~flock.js`, cookie `session-id`) sont **coupées depuis le 07.10.2026** ; un E2E de production (`e2e-prod/public.spec.ts`) échoue si elles sont réactivées. La seule mesure restante, propre à Med MNG avant connexion (`src/lib/conversionTracking.ts`), n'a lieu qu'avec l'accord du bandeau (`src/lib/consentementCookies.ts`). Tout changement doit être reporté dans le bandeau, la politique cookies et la politique de confidentialité.

### Sécurité des fonctions Edge

La clé publique (anon) est un JWT valide : `verify_jwt` ne suffit pas. Toute fonction qui dépense des crédits payants contrôle l'appelant dans son code avec `supabase/functions/_shared/mm-garde.ts` (`exigerConnexion`, `exigerPremium`, `exigerAdministrateur`, `fonctionRetiree`). Côté front, un `fetch` direct envoie le jeton de session (`src/lib/enTetesFonction.ts`), jamais la clé publique. Une fonction payante ouverte à tout compte connecté reçoit en plus une limite journalière par compte (`_shared/mm-limite-usage.ts`, table `rate_limit_counters`) : `whisper-transcribe` (utilisée par EmotionsCare) est limitée à 20 transcriptions par jour, 10 Mo d'audio, et n'accepte une `audioUrl` que du stockage du projet.

## Déploiement

1. **Front (Lovable)** : pousser sur `main` (GitHub `laeticiamng/med-mng`) ; Lovable synchronise le dépôt, puis **« Publish »** dans l'éditeur Lovable met https://medmng.com à jour. Recharger le site publié pour vérifier.
2. **Fonctions Edge** : `supabase functions deploy <fonction> --project-ref yaincoxihiqdksxgrsrk` (le `supabase/config.toml` du dépôt contient des clés refusées par la CLI : déployer depuis un dossier de déploiement dédié). Un module de `_shared/` modifié impose de redéployer chaque fonction qui l'importe.
3. **Migrations** : `supabase/migrations/*.sql`, appliquées une par une après relecture (base partagée avec EmotionsCare).

### Variables d'environnement (noms seulement, valeurs jamais dans le dépôt)

- **Front** : aucune obligatoire (adresse et clé publique Supabase dans `src/integrations/supabase/client.ts`, généré par Lovable). Optionnelles : `VITE_SENTRY_DSN`, `VITE_APP_VERSION`, `VITE_R2_PUBLIC_URL`.
- **Secrets des fonctions Edge** (tableau de bord Supabase → Edge Functions → Secrets) : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (fournis par Supabase) ; `STRIPE_SECRET_KEY`, `MM_STRIPE_WEBHOOK_SECRET` (repli : `STRIPE_WEBHOOK_SECRET`) ; `SUNO_API_KEY` (option `SUNO_MODEL`) ; `LOVABLE_API_KEY` ; `OPENAI_API_KEY` ; `RESEND_API_KEY`, `RESEND_FROM` ; `ALERT_EMAIL`, `SLACK_WEBHOOK_URL` (alertes d'administration) ; `ALLOWED_ORIGIN`.
- Modèles sans valeurs : `.env.example` (et variantes `.env.*.example`).

## Développement et tests

```bash
npm install
npm run dev                               # http://localhost:5173
npx tsc --noEmit -p tsconfig.app.json     # types
TZ=UTC npx vitest run                     # Vitest (src/** et test/**)
npx vite build                            # build de production
deno check supabase/functions/<fonction>/index.ts
```

Au 09.10.2026 : 124 fichiers, 1 540 tests, **0 échec** (lancés avec `TZ=UTC`, fuseau du serveur, pour des résultats reproductibles). Les fonctions Edge sont aussi couvertes par des tests Vitest qui importent leurs modules `_shared/` (`src/tests/mm*.test.ts`) et par des tests Deno (`supabase/functions/_shared/*.test.ts`, `deno test --no-lock`).

### E2E de production

Suite Playwright non destructive dans [`e2e-prod/`](./e2e-prod/README.md) (comptes de test par variables d'environnement, jamais dans le dépôt) :

```bash
E2E_FREE_EMAIL=… E2E_FREE_PASSWORD=… E2E_PREMIUM_EMAIL=… E2E_PREMIUM_PASSWORD=… \
  npx playwright test -c e2e-prod/playwright.config.ts
```

Elle couvre les pages publiques, les fiches, le quiz, la recherche, l'ECOS, le verrou Premium (API et interface), les sondes de sécurité des fonctions Edge, Stripe Checkout et le portail (atteints sans payer), la connexion et la déconnexion. La génération audio réelle (`@couteux`) ne part qu'avec `E2E_GENERATION=1`. Les anciens dossiers `tests/`, `test/e2e/` et `cypress/` visent un serveur local et des modules hérités.

## Suivi

Le rapport de finalisation (défauts ouverts, décisions CEO, vérifications de production) est tenu hors dépôt. Historique des versions : [CHANGELOG.md](./CHANGELOG.md).
