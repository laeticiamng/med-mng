# Med MNG — réviser les 367 items EDN en musique

**Production : https://medmng.com** · éditeur : EmotionsCare SASU · état au 4 octobre 2026

Application web (PWA) de révision pour les étudiants de 2e cycle (DFASM1–DFASM2, EDN 2028 et 2029). Pour chaque item : la fiche des compétences officielles (référentiel LiSA 2026, UNESS) et un contenu « immersif » (paroles de chanson, récit, planches, quiz), mis en musique à la demande.

## Offre

| Formule | Contenu |
|---|---|
| **Gratuit** | Fiches officielles des 367 items (rang A et rang B, table `oic_competences`) ; contenu immersif complet de 10 items d'essai, IC-1 à IC-10 (`ITEMS_GRATUITS` dans `src/config/offre.ts` et fonction SQL `mm_item_gratuit`) ; 12 situations ECOS d'entraînement rédigées pour Med MNG |
| **Premium — 69 €/an ou 9,90 €/mois** | Contenu immersif des 367 items ; 30 générations audio de chansons par mois ; bibliothèque personnelle |

Hors offre (retirés de l'interface le 04.10.2026, décision DC7) : chat et copilote IA, tuteur IA, cas cliniques, examens blancs, QCM et planning générés par IA. Leurs anciennes adresses redirigent vers `/edn-complete` (ou `/ecos`) et leurs fonctions serveur sont réservées aux administrateurs. Retirées aussi le même jour : la démo `/demo` (anciens numéros d'items) et les parcours par spécialité `/parcours` (9 sur 10 vides), redirigés vers `/edn-complete`.

## Fonctionnalités (ce qui est réellement proposé)

- **Items EDN** (`/edn-complete`, `/edn-complete/:item/{apercu,rang-a,rang-b,quiz,musique,planches,recit,stats}`) : fiche rang A / rang B, export PDF, recherche par numéro, titre, discipline ou intitulé de compétence (liste et ⌘K).
- **Contenu immersif** : lu par la RPC `mm_contenu_immersif_item` (verrou Premium **côté serveur** ; les colonnes Premium sont illisibles en lecture directe, erreur 42501).
- **Quiz par item** : une question par compétence officielle, quatre énoncés officiels, réponse correcte à une position stable mais non cyclique.
- **Génération audio** (Premium) : `/med-mng/create` et onglet Musique de la fiche.
- **ECOS** (`/ecos`, `/ecos/:id`) : 12 stations guidées (dossier du patient, « Je dis / Je fais / Je conclus », chronomètre, grille d'auto-évaluation générique).
- **Espace personnel** : bibliothèque (`/med-mng/music-library`), progression (`/med-mng/progress`), favoris, profil (abonnement, portail Stripe, export et suppression du compte).

## Architecture

- **Front** : React 18, TypeScript, Vite, Tailwind/shadcn, TanStack Query. Projet Lovable ; hébergement Lovable (réseau Cloudflare).
- **Back** : Supabase `yaincoxihiqdksxgrsrk` (région eu-central-1, Francfort) — **partagé avec EmotionsCare** : ne modifier aucune table, politique ou fonction commune sans vérifier l'impact sur EmotionsCare (exemple : `whisper-transcribe` est appelée par EmotionsCare).
- **Génération audio** : `mm-generate-music` (abonnement, quota mensuel, registre `mm_generations_audio`) → sunoapi.org → `mm-suno-callback` (ou rattrapage `mm-music-status`) ; le fichier est copié dans le compartiment `mm-chansons` (l'URL fournie par Suno expire au bout de 14 jours). Si les paroles enregistrées d'un item ne sont pas rédigées, `generer-paroles-item` les réécrit depuis les compétences officielles (passerelle IA de Lovable, Google Gemini) et les enregistre ; des paroles déjà rédigées sont rendues telles quelles (seul le jeton d'administration de `scripts/regenerer.mjs` peut les remplacer).
- **Planches** : `illustrer-case` dessine une seule fois chaque case (OpenAI), conservée dans `bd-illustrations`.
- **Paiement** : `mm-create-checkout` → Stripe Checkout ; `mm-stripe-webhook` → `user_subscriptions` ; `mm-customer-portal` (résiliation).
- **Prestataires réellement appelés** : liste à jour dans la politique de confidentialité (`src/pages/PolitiqueConfidentialite.tsx`).

### Sécurité des fonctions Edge

La clé publique (anon) est un JWT valide : `verify_jwt` ne suffit pas. Toute fonction qui dépense des crédits payants contrôle l'appelant dans son code avec `supabase/functions/_shared/mm-garde.ts` (`exigerConnexion`, `exigerPremium`, `exigerAdministrateur`, `fonctionRetiree`). Côté front, un `fetch` direct envoie le jeton de session (`src/lib/enTetesFonction.ts`), jamais la clé publique.

## Déploiement

1. **Front** : pousser sur `main` (GitHub `laeticiamng/med-mng`), puis « Publish » dans Lovable.
2. **Fonctions Edge** : `supabase functions deploy <fonction>` (le `supabase/config.toml` du dépôt contient des clés refusées par la CLI : déployer depuis un dossier de déploiement dédié).
3. **Migrations** : `supabase/migrations/*.sql`, appliquées une par une après relecture (base partagée).

Secrets (Supabase, jamais dans le dépôt) : `SUNO_API_KEY`, `LOVABLE_API_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, etc.

## Développement et tests

```bash
npm install
npm run dev                               # http://localhost:5173
npx tsc --noEmit -p tsconfig.app.json     # types
npm test                                  # Vitest (src/** et test/**)
npx vite build                            # build de production
deno check supabase/functions/<fonction>/index.ts
```

`npm test` : les tests d'intégration réseau de `test/**` échouent hors ligne (68 échecs connus au 04.10.2026, identiques sur `origin/main`).

### E2E de production

Suite Playwright non destructive dans [`e2e-prod/`](./e2e-prod/README.md) (comptes de test par variables d'environnement, jamais dans le dépôt) :

```bash
E2E_FREE_EMAIL=… E2E_FREE_PASSWORD=… E2E_PREMIUM_EMAIL=… E2E_PREMIUM_PASSWORD=… \
  npx playwright test -c e2e-prod/playwright.config.ts
```

Elle couvre les pages publiques, les fiches, le quiz, la recherche, l'ECOS, le verrou Premium (API et interface), les sondes de sécurité des fonctions Edge, Stripe Checkout et le portail (atteints sans payer), la connexion et la déconnexion. La génération audio réelle (`@couteux`) ne part qu'avec `E2E_GENERATION=1`. Les anciens dossiers `tests/`, `test/e2e/` et `cypress/` visent un serveur local et des modules hérités.

## Suivi

Le rapport de finalisation (défauts ouverts, décisions CEO, vérifications de production) est tenu hors dépôt. Historique des versions : [CHANGELOG.md](./CHANGELOG.md).
