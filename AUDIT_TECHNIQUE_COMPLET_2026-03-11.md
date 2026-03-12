# AUDIT TECHNIQUE COMPLET — MED-MNG
## Date : 11 mars 2026
## Auditeur : Claude (Audit automatisé full-stack)

---

# 1. RÉSUMÉ EXÉCUTIF

## État global de la plateforme
MED-MNG est une plateforme SaaS d'apprentissage médical (EDN/ECOS) construite sur **React 18 + Vite + Supabase + Stripe**, avec une architecture Lovable. La plateforme est **ambitieuse** (90+ pages, 100+ edge functions, 381 migrations SQL) mais présente des **failles de sécurité critiques** et des **fonctionnalités fantômes** qui interdisent un go-live en l'état.

## Niveau de préparation réel
**40/100** — L'infrastructure de base est solide (auth, routing, lazy loading, PWA, SEO), mais les failles de sécurité sur les edge functions, les données mockées déguisées en fonctionnalités réelles, et l'absence de monitoring actif rendent la plateforme **non prête pour la production avec des utilisateurs payants**.

## Verdict go-live : **NON EN L'ÉTAT**

### 5 P0 principaux (bloquants critiques)
1. **14 edge functions sans authentification** — Accès libre aux API IA payantes (OpenAI, Suno, ElevenLabs, Perplexity). Risque d'exploitation financière massive.
2. **`verify_jwt = false` sur TOUTES les edge functions** dans `supabase/config.toml` — La couche Supabase Gateway ne protège aucune fonction.
3. **Sitemap contient 6 URLs fantômes** (`/pomodoro`, `/karaoke`, `/store`, `/shared-music`, `/community`, `/chat`) qui renvoient vers des pages inexistantes ou protégées. *(Corrigé dans cet audit)*
4. **Stripe Price IDs hardcodés** (`price_1RqG...`) dans le client ET les edge functions — Impossible de distinguer mode test/live sans intervention manuelle.
5. **Sentry DSN non configuré** (`VITE_SENTRY_DSN` absent) — Zéro error tracking en production.

### 5 P1 principaux (très importants)
1. **MigrationDashboard utilise des données 100% mockées** présentées comme réelles.
2. **50+ console.log restants** dans le code de production (20 fichiers).
3. **7 vulnérabilités npm** (2 moderate, 5 high) dans les dépendances.
4. **Pas de rate limiting** côté edge functions — DoS facile.
5. **Bundle `index.js` = 664 KB** (gzippé 193 KB) + `vendor-pdf` = 592 KB — Chargement initial excessif.

---

# 2. TABLEAU D'AUDIT COMPLET

| Priorité | Domaine | Page / Route / Fonction | Problème observé | Symptôme / preuve | Risque | Recommandation | Faisable Lovable ? |
|----------|---------|------------------------|-------------------|-------------------|--------|----------------|-------------------|
| **P0** | Security | 14 edge functions | Aucune auth JWT/utilisateur | `medical-chat-ai`, `openai-chat`, `chat-with-ai`, `generate-content`, `generate-qcm`, `generate-clinical-case`, `generate-comic-images`, `generate-image`, `generate-voice`, `whisper-transcribe`, `firecrawl-scrape`, `firecrawl-search`, `perplexity-search`, `study-planner` | Exploitation API payantes, coûts illimités | Ajouter `getAuthenticatedUser()` à chaque fonction | Oui |
| **P0** | Security | `supabase/config.toml` | `verify_jwt = false` sur toutes les fonctions | 15 entrées `[functions.*]` avec `verify_jwt = false` | Gateway Supabase ne protège rien | Passer à `verify_jwt = true` pour les fonctions authentifiées | Oui (config) |
| **P0** | Security | `generate-national-exam` | Accepte un `userId` arbitraire sans vérification | Pas de validation que l'utilisateur est bien celui du token | IDOR — génération d'examen pour n'importe quel compte | Valider userId = utilisateur authentifié | Oui |
| **P0** | Security | `generate-image`, `generate-voice`, `perplexity-search` | Utilisent `SUPABASE_SERVICE_ROLE_KEY` sans auth utilisateur | Bypass complet de RLS | Accès/modification de n'importe quelles données | Ajouter auth avant d'utiliser service role | Oui |
| **P0** | SEO | `sitemap.xml` | 6 URLs pointant vers des routes inexistantes | `/pomodoro`, `/karaoke`, `/store`, `/shared-music`, `/community` | Pages 404 indexées par Google | **CORRIGÉ** dans cet audit | ✅ Fait |
| **P0** | Billing | `useSubscription.ts` + `create-checkout` | Stripe Price IDs hardcodés | `price_1RqGSe...`, `price_1RqGT0...`, `price_1RqGTH...` | Impossible de distinguer test/live, risque de double facturation | Déplacer vers variables d'environnement | Non (nécessite secrets) |
| **P0** | Observability | `src/lib/sentry.ts` | `VITE_SENTRY_DSN` non configuré | `console.debug('Sentry DSN not configured')` | Zéro error tracking en production | Configurer un DSN Sentry | Non (secret externe) |
| **P1** | Frontend | `/migration-dashboard` | Données 100% mockées | `const mockMigrations: MigrationRecord[] = [...]` ligne 73 | Fonctionnalité trompeuse pour les admins | Brancher sur vraies données ou marquer "Démo" | Oui |
| **P1** | Performance | Build output | `index.js` = 664 KB, `vendor-pdf` = 592 KB | Warnings Vite sur chunks > 500 KB | Temps de chargement initial élevé | Code-splitting plus agressif, lazy load PDF | Oui |
| **P1** | Security | CORS config | `corsHeaders` (legacy) hardcode un seul domaine | `'Access-Control-Allow-Origin': 'https://med-mng.lovable.app'` | Fonctions utilisant le legacy ne marchent pas depuis d'autres domaines | **CORRIGÉ** : ajout `Allow-Methods` + `Max-Age` | ✅ Fait |
| **P1** | Frontend | Console pollution | 50+ occurrences `console.log` dans 20 fichiers de production | `src/pages/AdminExtractEcos.tsx`, `src/utils/generateAllAdvancedLyrics.ts`, etc. | Fuite d'info, performances, bruit console | Remplacer par logger conditionnel | Oui |
| **P1** | Security | npm audit | 7 vulnérabilités (2 moderate, 5 high) | `npm audit` output | CVEs non corrigées | `npm audit fix` ou mise à jour ciblée | Oui |
| **P1** | Auth | `withAuth.tsx` | Test mode bypass total de l'auth | `TEST_MODE_ENABLED` bypasse `ProtectedRoute` | Si activé par erreur en prod, accès libre | Triple protection déjà en place (OK mais fragile) | Oui |
| **P2** | SEO | `SEOHead.tsx` | Pas de `hreflang` | Absent du composant SEO | Google ne sait pas que le contenu est FR | **CORRIGÉ** : ajout `hreflang="fr"` | ✅ Fait |
| **P2** | Observability | `GlobalErrorBoundary.tsx` | Sentry non branché, log console uniquement | `console.error('[ERROR_LOG]', JSON.stringify(errorLog))` | Erreurs perdues en production | **CORRIGÉ** : intégration dynamique Sentry | ✅ Fait |
| **P2** | SEO | `sitemap.xml` | Pages protégées (login requis) dans sitemap | `/srs-review`, `/exam-mode`, `/flashcards`, `/leaderboard`, etc. | Google indexe des pages inaccessibles (redirect login) | **CORRIGÉ** : supprimé du sitemap | ✅ Fait |
| **P2** | Frontend | Peer deps | `react-day-picker` conflit de peer deps | `npm install` échoue sans `--legacy-peer-deps` | Instabilité CI/CD | Mettre à jour react-day-picker v9 | Oui |
| **P2** | Performance | Google Fonts | Chargement bloquant dans `index.html` | `<link href="https://fonts.googleapis.com/css2?...">` sans `media` | Render-blocking | Ajouter `media="print" onload="this.media='all'"` | Oui |
| **P2** | i18n | Plateforme FR uniquement | Pas de système i18n (pas de i18next, react-intl) | Tous les textes sont hardcodés en français | Limitation d'audience | Implémenter i18next si expansion prévue | Non prioritaire |
| **P3** | Accessibility | Skip Links | Présents mais pas de `role="banner"` sur header | `<SkipLinks />` existe, bon signe | A11y partielle | Ajouter landmarks ARIA | Oui |
| **P3** | Performance | PWA | Screenshots référencées mais fichiers potentiellement absents | `/screenshot-wide.png`, `/screenshot-narrow.png` | Échec installation PWA | Vérifier présence des fichiers | Oui |
| **P3** | SEO | Schema.org | `SearchAction` référence `/search` (route inexistante) | `createWebsiteSchema()` dans `SEOHead.tsx` | Structured data invalide | Corriger ou supprimer | Oui |

---

# 3. DÉTAIL PAR CATÉGORIE

## A. Frontend & Rendu

### Ce qui fonctionne
- **Architecture solide** : 90+ pages avec lazy loading systématique via `React.lazy()` + `Suspense`
- **Code splitting** : `manualChunks` dans Vite pour vendor-react, vendor-ui, vendor-query, vendor-charts, vendor-motion, vendor-forms, vendor-pdf
- **PageLoader** comme fallback Suspense global
- **Toutes les pages compilent sans erreur** (TypeScript `--noEmit` passe)
- **Build réussit** en 22 secondes
- **NotFound page** fonctionnelle avec tracking d'activité
- **Redirections legacy** bien gérées (17 routes de redirection)
- **PWA configurée** avec Workbox, runtime caching, manifest complet
- **ThemeProvider** pour dark/light mode
- **GlobalErrorBoundary** en place

### Ce qui est problématique
- **Bundle trop lourd** : `index.js` = 664 KB (gzip 193 KB), `vendor-pdf` = 592 KB. Total precache PWA = 6.4 MB
- **`vendor-charts` = 433 KB** (recharts complet) — devrait être lazy loaded
- **EdnComplete = 305 KB** — page la plus lourde, probablement trop de contenu inline
- **Google Fonts chargées de façon bloquante** dans `index.html`
- **257 fichiers en precache PWA** — excessif, ralentit le premier chargement

### Ce qui n'a pas pu être confirmé
- Rendu réel des pages (nécessite un navigateur)
- État des animations framer-motion en production
- Responsive réel sur mobile

## B. QA Fonctionnelle

### Ce qui fonctionne
- **Flux auth complet** : login email/password, signup avec nom, reset password, Google OAuth
- **Session management** : getSession + onAuthStateChange + refresh token handling
- **Profile upsert automatique** au login
- **Welcome email** envoyé aux nouveaux utilisateurs (< 60s après création)
- **Subscription flow** : pricing → checkout Stripe → success page → portail client
- **Quota management** : vérification, incrémentation, affichage usage
- **Forms** : react-hook-form + zod validation pattern consistant
- **Toast notifications** : Sonner + Toaster (double system, potentiellement redondant)

### Ce qui est cassé ou douteux
- **MigrationDashboard** : données 100% hardcodées (`mockMigrations`), présentées sans indication de mock
- **Routes fantômes** dans la config :
  - `/pomodoro` — route définie dans `routes.ts` mais aucune page correspondante
  - `/karaoke` — route définie mais pas de page
  - `/store` — commenté dans App.tsx ("désactivé"), mais route définie
  - `/shared-music` — route définie, pas de page
  - `/community` — route définie, pas de page
- **Double système de toast** (Sonner + Toaster de Radix) — potentiellement confus pour l'utilisateur

### Non confirmé
- Persistance réelle des données après refresh (nécessite runtime)
- Flux de paiement Stripe end-to-end (dépend de la configuration Stripe live)
- Envoi réel d'emails (dépend de la configuration Resend)

## C. Auth & Autorisations

### Ce qui fonctionne
- **AuthProvider** robuste avec gestion des erreurs de refresh token
- **ProtectedRoute** : redirige vers login avec `location.state.from` pour retour
- **AdminRoute** : vérification server-side via table `user_roles` avec RLS
- **Google OAuth** configuré
- **Logout** avec fallback local si l'API échoue
- **Test mode** avec triple protection (false + !isProduction + !import.meta.env.PROD)

### Ce qui est problématique
- **Test mode bypasse ProtectedRoute mais PAS AdminRoute** — incohérence intentionnelle mais le test user a `role: 'test'` et non admin
- **AdminRoute fait un appel DB à chaque navigation** — pas de cache, appel `user_roles` à chaque page admin
- **Pas de protection CSRF explicite** (dépend entièrement de Supabase)
- **Pas de limitation du nombre de tentatives de login** côté frontend

### Risques
- Si quelqu'un obtient un token JWT valide, il a accès à TOUTES les edge functions sans `verify_jwt`
- La vérification admin est client-side (table `user_roles`) — un attaquant pourrait insérer dans cette table si RLS est mal configuré

## D. APIs & Edge Functions

### Ce qui fonctionne
- **100+ edge functions déployées** — architecture extensive
- **Fonctions correctement authentifiées** : `generate-music`, `contextual-ai-chat`, `enhanced-contextual-chat`, `content-ai-generator`, `ai-tutor`, `ai-recommendations`, `playlist-manager`
- **Stripe webhook** : signature vérifiée via `stripe.webhooks.constructEvent()`
- **CORS dynamique** avec liste blanche d'origines
- **Health endpoint** avec checks DB + Storage

### CE QUI EST CRITIQUE
**14 edge functions sans AUCUNE authentification utilisateur :**

| Fonction | API payante exposée | Service Role Key |
|----------|:-------------------:|:----------------:|
| `medical-chat-ai` | Lovable AI | Non |
| `openai-chat` | OpenAI | Non |
| `chat-with-ai` | OpenAI | Non |
| `generate-content` | OpenAI | Non |
| `generate-qcm` | Lovable AI | Non |
| `generate-clinical-case` | Lovable AI | Non |
| `generate-comic-images` | OpenAI | Non |
| `generate-image` | OpenAI | **OUI** |
| `generate-voice` | ElevenLabs | **OUI** |
| `whisper-transcribe` | OpenAI Whisper | **OUI** |
| `firecrawl-scrape` | Firecrawl | Non |
| `firecrawl-search` | Firecrawl | Non |
| `perplexity-search` | Perplexity | **OUI** |
| `study-planner` | Lovable AI | Non |

**Risque financier** : un attaquant peut appeler ces fonctions en boucle et générer des coûts API illimités.

**Risque données** : 4 fonctions utilisent `SUPABASE_SERVICE_ROLE_KEY` sans auth → bypass RLS total.

### Architecture
- **verify_jwt = false** pour TOUTES les 15 fonctions déclarées dans `config.toml`
- Le commentaire dit "auth interne" mais 14/15 ne font PAS d'auth interne
- Les fonctions "authentifiées" le font manuellement (extraction du Bearer token + `auth.getUser()`)

## E. Database & RLS

### Ce qui est observable
- **381 migrations SQL** — base de données très mature
- **Tables identifiées** : `edn_items_complete`, `profiles`, `user_roles`, `user_subscriptions`, `subscription_invoices`, `user_activity_log`, `user_quotas`
- **Schema OIC** : `schema-oic.sql` (11 KB) — schéma complet pour les items OIC
- **RLS mentionné** : le code AdminRoute fait référence à "RLS policies" pour `user_roles`
- **RPC functions** : `get_user_subscription`, `get_music_quota`, `increment_music_usage`

### Non confirmé depuis l'interface
- Présence effective des RLS policies sur chaque table
- Isolation des données entre utilisateurs
- search_path fixé dans les fonctions SQL
- Policies d'INSERT/UPDATE/DELETE sur tables sensibles
- Exposition de vues ou fonctions `SECURITY DEFINER` dangereuses

## F. Sécurité Applicative

### Ce qui fonctionne
- **DOMPurify** installé et utilisé dans 25 fichiers (sanitization XSS)
- **CORS restrictif** avec whitelist de domaines
- **Supabase anon key** (pas de service_role) dans le client frontend — correct
- **robots.txt** bien configuré avec blocage des routes admin
- **Service role key** uniquement côté edge functions (jamais côté client)
- **CookieBanner** présent
- **Pages légales complètes** : mentions légales, politique de confidentialité, CGU, CGV, cookies, RGPD, accessibilité

### Ce qui est critique
1. **14 edge functions publiques** sans auth (détaillé ci-dessus)
2. **Pas de rate limiting** sur aucune edge function
3. **Pas de honeypot/captcha** sur les formulaires d'inscription
4. **Erreurs détaillées renvoyées en production** dans les edge functions (`error.message` directement dans la réponse)
5. **generate-image/generate-voice acceptent un userId paramètre** sans vérification → IDOR

### Pas de risque observé
- Pas de secrets dans le code client (clés Supabase = anon key, acceptable)
- Pas d'open redirects visibles
- Pas de XSS probable grâce à DOMPurify

## G. Paiement & Billing

### Ce qui fonctionne
- **3 plans** : Standard (19€), Pro (29€), Premium (39€) + Gratuit
- **Stripe Checkout** avec essai 7 jours
- **Webhook Stripe** vérifie la signature
- **Événements gérés** : checkout.completed, subscription.updated, subscription.deleted, invoice.payment_succeeded, invoice.payment_failed
- **Portail client** Stripe pour gestion autonome
- **Quota musique** avec vérification avant génération
- **Facturation** : stockage des invoices dans `subscription_invoices`

### Ce qui est problématique
- **Price IDs hardcodés** en double (client + edge function) — pas de variable d'env
- **Pas de distinction test/live** visible — les price IDs commencent par `price_1Rq` (format live Stripe)
- **Upsert subscription sur `onConflict: 'stripe_subscription_id'`** — que se passe-t-il si un user a déjà un abonnement actif et resouscrit ?
- **Trial always = 7 jours** — hardcodé, pas configurable

### Non confirmé
- État réel des produits/prix dans le dashboard Stripe
- Webhooks configurés dans Stripe pour pointer vers la bonne URL
- Gestion des upgrades/downgrades entre plans

## H. Performance

### Points positifs
- **Lazy loading systématique** de toutes les pages (sauf Index et NotFound)
- **Code splitting** avec manualChunks Vite
- **PWA avec runtime caching** (Workbox) pour fonts, API, images
- **React Query** avec `staleTime: 10min`, `gcTime: 15min`, `refetchOnWindowFocus: false`
- **react-window** installé pour virtualisation de listes
- **web-vitals** installé pour monitoring des Core Web Vitals

### Points négatifs
- **Bundle initial trop lourd** : 664 KB index.js
- **vendor-pdf = 592 KB** : jspdf + html2canvas chargés même si non utilisés
- **vendor-charts = 433 KB** : recharts complet dans le vendor bundle
- **Google Fonts render-blocking** dans `<head>`
- **257 fichiers precachés** par le service worker = 6.4 MB au premier chargement
- **Pas de `<link rel="preload">` ou `<link rel="prefetch">`** pour les ressources critiques

## I. SEO Technique

### Ce qui fonctionne
- **AutoSEO** : composant automatique par route avec `react-helmet-async`
- **SEOHead** : title, description, canonical, og:*, twitter:* sur chaque page
- **GlobalJsonLd** : structured data JSON-LD global
- **seoConfig.ts** : configuration SEO dédiée par route
- **10 pages SEO pillar** : contenu long-form pour acquisition organique
- **robots.txt** bien structuré avec blocage admin
- **sitemap.xml** présent (corrigé dans cet audit)
- **og-image.png** présent dans /public

### Ce qui manque
- ~~**hreflang** absent~~ → **CORRIGÉ**
- **Schema.org SearchAction** pointe vers `/search` (route inexistante)
- **Sitemap statique** (pas de génération dynamique des items EDN/ECOS)
- **Pas de sitemap index** pour séparer les 50+ pages
- **lastmod = 2026-03-01** fixe — pas de mise à jour automatique
- **Pages protégées dans le sitemap** (corrigé dans cet audit)

## J. Accessibilité

### Ce qui fonctionne
- **SkipLinks** en place
- **`<main id="main-content" tabIndex={-1}>`** — landmark principal
- **AccessibilityCenter** composant dédié
- **Tap targets mobile** : min-height 48px dans CSS global
- **Contraste** : probablement OK via Tailwind theme (non confirmé visuellement)
- **DeclarationAccessibilite** page dédiée

### Ce qui manque ou est douteux
- **Pas de `role="banner"`, `role="navigation"`, `role="contentinfo"`** explicites (dépend du HTML sémantique)
- **Pas d'aria-live** visible pour les zones dynamiques
- **Double toast system** pourrait ne pas être accessible (annonces screen reader)

## K. i18n / Localisation

- **Pas de système i18n** installé (pas de i18next, react-intl, etc.)
- **Tous les textes sont en français hardcodé**
- **LanguageSelector** composant présent mais sans backend i18n
- **Pas bloquant** si le marché cible est uniquement francophone

## L. Observabilité / Go-live

### Ce qui fonctionne
- **Sentry SDK** installé et configuré (`@sentry/react`)
- **Health endpoint** edge function avec checks DB + Storage
- **Activity tracking** (useActivityTracking hook)
- **PWA metrics** (usePWAMetrics hook)
- **Web Vitals** monitoring configuré
- **Cookie consent** (CookieBanner)
- **Pages légales complètes** (mentions, confidentialité, CGU, CGV, cookies, RGPD, accessibilité)
- **Offline indicator** pour PWA

### Ce qui manque
- **Sentry DSN non configuré** — toute la chaîne d'error tracking est morte
- **Pas de Google Analytics configuré** (`initGoogleAnalytics` appelé mais probablement sans GA_ID)
- **Pas de status page** publique
- **Pas d'alerting** (monitoring-alerts function existe mais déconnecté)
- **Données de démonstration** encore présentes (MigrationDashboard avec mock data)
- **Pas de backup/recovery** documenté
- **Pas de runbook** opérationnel

---

# 4. PLAN D'ACTION PRIORISÉ

## P0 — Correctifs immédiats (BLOQUANTS)

1. **Ajouter l'authentification à 14 edge functions** — Ajouter `getAuthenticatedUser()` ou validation manuelle du Bearer token dans chaque fonction. Estim: 2-4h.

2. **Passer `verify_jwt = true`** dans `config.toml` pour toutes les fonctions authentifiées (garder `false` uniquement pour `stripe-webhook`, `auth-webhook`, `resend-webhook`, `health`). Estim: 30min.

3. **Déplacer les Stripe Price IDs** vers des variables d'environnement Supabase. Estim: 1h.

4. **Configurer Sentry DSN** comme variable d'env `VITE_SENTRY_DSN`. Estim: 15min.

5. **Supprimer les routes fantômes** (`/pomodoro`, `/karaoke`, `/store`, `/shared-music`, `/community`) de `config/routes.ts` ou créer les pages correspondantes.

## P1 — Correctifs rapides (haute priorité)

6. **Ajouter du rate limiting** au moins côté frontend (`ClientRateLimiter` existe déjà, vérifier qu'il est branché).

7. **Nettoyer les 50+ console.log** de production — remplacer par `import.meta.env.DEV && console.log(...)`.

8. **Résoudre les 7 vulnérabilités npm** — `npm audit fix --force` ou mise à jour ciblée.

9. **Marquer le MigrationDashboard** comme "Données de démonstration" ou brancher sur des vraies données.

10. **Lazy loader vendor-pdf** — ne charger jspdf/html2canvas que quand un export PDF est demandé.

## P2 — Améliorations significatives

11. **Optimiser le bundle** : code-split recharts, lazy load les composants lourds (EdnComplete = 305 KB).

12. **Charger Google Fonts de façon non-bloquante** : `media="print" onload="this.media='all'"`.

13. **Générer un sitemap dynamique** incluant les items EDN et scénarios ECOS.

14. **Cacher la vérification admin** — éviter un appel DB par navigation admin.

15. **Unifier le système de toast** — garder Sonner OU Toaster, pas les deux.

## P3 — Polish

16. Ajouter des landmarks ARIA explicites.
17. Ajouter un `<link rel="preload">` pour la police Inter.
18. Réduire le nombre de fichiers precachés par le service worker.
19. Ajouter un captcha/honeypot sur le formulaire d'inscription.
20. Corriger le Schema.org SearchAction (supprimer ou pointer vers une vraie route).

---

# 5. CORRECTIONS IMPLÉMENTÉES DANS CET AUDIT

## Liste exacte des modifications effectuées

### 1. `public/sitemap.xml` — URLs fantômes supprimées
- **Supprimé** : `/pomodoro`, `/karaoke`, `/store`, `/shared-music`, `/community`, `/chat` (pages inexistantes ou protégées)
- **Supprimé** : `/srs-review`, `/exam-mode`, `/clinical-cases`, `/flashcards`, `/leaderboard`, `/daily-challenges`, `/smart-study-planner` (pages protégées, redirect login au crawl)
- **Ajouté** : `/revision-rapide`, `/parcours`, `/faq`, `/about` (pages publiques existantes manquantes)
- **Ajouté** : `/legal/cgv`, `/legal/cookies` (pages légales manquantes)

### 2. `supabase/functions/_shared/cors.ts` — Headers CORS améliorés
- **Ajouté** `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- **Ajouté** `Access-Control-Max-Age: 86400` (cache preflight 24h)
- Appliqué aux deux exports (`getCorsHeaders` + `corsHeaders` legacy)

### 3. `src/components/error/GlobalErrorBoundary.tsx` — Intégration Sentry
- **Remplacé** le simple `console.error` par un import dynamique de Sentry `captureError()`
- Les erreurs sont maintenant envoyées à Sentry quand le DSN est configuré
- Fallback vers console.error si Sentry non disponible

### 4. `src/components/seo/SEOHead.tsx` — hreflang ajouté
- **Ajouté** `<html lang="fr" />` via Helmet
- **Ajouté** `<link rel="alternate" hrefLang="fr" href={canonical} />` pour le SEO international

---

# 6. ÉLÉMENTS RESTANTS À TRAITER

## Dépendances externes manquantes (nécessite action humaine)
1. **Sentry DSN** — Créer un projet Sentry et configurer `VITE_SENTRY_DSN`
2. **Google Analytics ID** — Configurer `VITE_GA_MEASUREMENT_ID`
3. **Stripe configuration** — Confirmer que les Price IDs sont bien en mode live, configurer les webhooks pour l'URL de production
4. **Vérification des RLS policies** dans le dashboard Supabase — Non vérifiable depuis le code seul
5. **Configuration des providers OAuth** (Google) dans le dashboard Supabase Auth
6. **Variables d'environnement edge functions** — Vérifier que toutes les API keys (OpenAI, Suno, ElevenLabs, Perplexity, Firecrawl, Lovable AI) sont configurées

## Prochaines étapes recommandées avant go-live
1. **IMMÉDIAT** : Sécuriser les 14 edge functions (P0 #1)
2. **IMMÉDIAT** : Configurer `verify_jwt = true` (P0 #2)
3. **CETTE SEMAINE** : Configurer Sentry + Analytics (P0 #4)
4. **CETTE SEMAINE** : Résoudre les vulnérabilités npm (P1 #8)
5. **AVANT LAUNCH** : Audit RLS complet dans le dashboard Supabase
6. **AVANT LAUNCH** : Test end-to-end du flux de paiement Stripe en mode live
7. **AVANT LAUNCH** : Tester avec Lighthouse (score PWA, performance, a11y)
8. **APRÈS LAUNCH** : Monitoring Sentry + mise en place d'alerting

---

# 7. CONCLUSION

MED-MNG est un projet **techniquement ambitieux et bien structuré** en termes d'architecture frontend (lazy loading, code splitting, PWA, SEO, accessibilité). La base de données est mature avec 381 migrations et le système d'authentification est solide.

Cependant, **la plateforme n'est PAS prête pour un go-live avec des utilisateurs payants** en raison de :

1. **Failles de sécurité critiques** sur les edge functions (14 sans auth, coûts API non protégés)
2. **Absence de monitoring** en production (Sentry non configuré)
3. **Fonctionnalités fantômes** (routes sans pages, mocks déguisés)
4. **Stripe non sécurisé** (Price IDs hardcodés, pas de distinction test/live claire)

La correction des P0 est estimée à **1-2 jours de travail** et devrait être la priorité absolue avant tout déploiement public.
