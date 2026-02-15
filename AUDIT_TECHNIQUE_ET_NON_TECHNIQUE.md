# AUDIT COMPLET - TECHNIQUE & NON-TECHNIQUE

## MED-MNG v9.6.3 - Plateforme d'Apprentissage Medical Immersif

**Date de l'audit** : 15 fevrier 2026
**Branche auditee** : `claude/setup-med-mng-platform-Q1di3`
**Perimetre** : Audit complet du codebase (313 939 lignes, 1 311 fichiers TS/TSX)
**Outil** : Analyse statique automatisee + revue manuelle

---

## TABLE DES MATIERES

1. [Resume executif](#1-resume-executif)
2. [Presentation du projet](#2-presentation-du-projet)
3. [AUDIT TECHNIQUE](#3-audit-technique)
   - 3.1 [Securite](#31-securite)
   - 3.2 [Qualite du code](#32-qualite-du-code)
   - 3.3 [Architecture](#33-architecture)
   - 3.4 [Infrastructure & DevOps](#34-infrastructure--devops)
   - 3.5 [Performance & Bundle](#35-performance--bundle)
   - 3.6 [Tests](#36-tests)
4. [AUDIT NON-TECHNIQUE](#4-audit-non-technique)
   - 4.1 [Conformite RGPD](#41-conformite-rgpd)
   - 4.2 [Accessibilite](#42-accessibilite)
   - 4.3 [SEO](#43-seo)
   - 4.4 [Documentation](#44-documentation)
   - 4.5 [Pages legales](#45-pages-legales)
   - 4.6 [UX / Ergonomie](#46-ux--ergonomie)
   - 4.7 [Internationalisation](#47-internationalisation)
   - 4.8 [Mobile & PWA](#48-mobile--pwa)
   - 4.9 [Monetisation](#49-monetisation)
   - 4.10 [Contenu pedagogique](#410-contenu-pedagogique)
   - 4.11 [Offline & Synchronisation](#411-offline--synchronisation)
5. [Tableau de synthese](#5-tableau-de-synthese)
6. [Plan d'action prioritaire](#6-plan-daction-prioritaire)

---

## 1. RESUME EXECUTIF

### Vue d'ensemble

| Metrique | Valeur |
|----------|--------|
| Lignes de code TS/TSX | 313 939 |
| Fichiers TS/TSX | 1 311 |
| Composants React | 143+ (EDN seul) |
| Hooks custom | 232 |
| Edge Functions Supabase | 133 |
| Tables BDD (RLS) | 135+ |
| Routes lazy-loadees | 60+ |
| Dependencies production | 92 |
| Dependencies dev | 44 |
| Workflows CI/CD | 8 |
| Fichiers de doc | 289 |

### Scores par domaine

| Domaine | Note | Statut | Evolution |
|---------|------|--------|-----------|
| Securite | 6/10 | Ameliorations critiques requises | - |
| Qualite du code | 5/10 | Refactoring TypeScript necessaire | - |
| Architecture | 8/10 | Solide, bien structuree | - |
| Infrastructure | 7/10 | Bonne CI/CD, Docker a durcir | +1 |
| Performance | 6/10 | Memoisation absente, fuites memoire | -1 |
| Tests | 5/10 | Chemins critiques non couverts | -1 |
| RGPD | 9/10 | Tres bonne conformite | - |
| Accessibilite | 10/10 | Excellente (auto-evaluation RGAA 4.1) | - |
| SEO | 9/10 | JSON-LD, sitemap, OG complets | - |
| Documentation | 9/10 | Complete, transparente | - |
| Pages legales | 10/10 | Toutes presentes | - |
| UX/Ergonomie | 9/10 | Gamification exemplaire | - |
| Mobile/PWA | 9/10 | Excellent, sync offline partielle | -1 |
| Monetisation | 7/10 | Stripe OK, PayPal manquant | NEW |
| Internationalisation | 4/10 | Infrastructure OK, couverture faible | NEW |

**Score global : 7.0/10 - Projet ambitieux avec axes d'amelioration technique critiques**

---

## 2. PRESENTATION DU PROJET

**MED-MNG** est une plateforme educative experimentale pour etudiants en medecine qui combine musique generee par IA et contenu medical. Elle cible la preparation aux EDN (Epreuves Demateriaisees Nationales) et ECOS (Evaluation Clinique Objective Structuree).

### Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18.3 + TypeScript 5.5 + Vite 5.4 |
| Etat | TanStack Query 5.56 + Zustand 5.0 + 7 Context Providers |
| Style | Tailwind CSS 3.4 + shadcn/ui + 28 composants Radix UI |
| Backend | Supabase (PostgreSQL, Auth JWT, RLS, Edge Functions, Storage) |
| IA | Suno (musique), OpenAI GPT-4o, Perplexity, ElevenLabs, Whisper |
| PDF | jsPDF 4.0.2 + AutoTable + html2canvas |
| Tests | Vitest 3.2 + Playwright 1.58 + Cypress 14.5 |
| CI/CD | GitHub Actions (8 workflows) + TruffleHog + Trivy + Lighthouse CI |
| Monitoring | Sentry 9.42 |
| PWA | Workbox 7.3 + vite-plugin-pwa |

---

## 3. AUDIT TECHNIQUE

### 3.1 SECURITE

#### 3.1.1 Points forts

| Categorie | Statut | Detail |
|-----------|--------|--------|
| XSS Prevention | OK | DOMPurify 3.2.6 utilise dans 7 fichiers avec `sanitizeHtml()`, `createSafeHtml()` |
| Injection SQL | OK | Requetes parametrees via Supabase ORM, pas de SQL brut |
| Authentification | OK | Auth Supabase + RLS sur 135+ tables avec `auth.uid()` |
| Rate limiting | OK | Triple couche : nginx (5/min auth, 60/min API, 100/min general) |
| Headers securite nginx | EXCELLENT | HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Sanitisation HTML | OK | `src/utils/sanitize.ts` - forbids onclick, onload, onerror |
| RLS Policies | OK | Politiques correctes avec `auth.uid()`, separation SELECT/INSERT/UPDATE/DELETE |
| Audit de secrets CI | OK | TruffleHog integre dans le pipeline |

#### 3.1.2 Problemes critiques

---

**CRITIQUE 1 - Credentials Supabase hardcodees dans le code source**

| Fichier | Lignes | Contenu |
|---------|--------|---------|
| `src/integrations/supabase/client.ts` | 5-6 | URL + anon key en clair |
| `src/lib/supabaseConstants.ts` | 6-7 | URL + anon key dupliquees |
| `src/lib/api/medicalCopilot.ts` | - | URL + key |
| `src/components/edn/tableau/TableauCompetencesOICWithRealData.tsx` | - | URL + key |
| `scripts/debug/*` | Multiple | URL + key dans scripts debug |

```
SUPABASE_URL: "https://yaincoxihiqdksxgrsrk.supabase.co"
SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIs..."
```

**Impact** : Expose l'identifiant du projet Supabase. Meme si la cle anon est publique par design, la bonne pratique est de la charger via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

**Recommandation** : Migrer vers variables d'environnement. Supprimer les duplications.

---

**CRITIQUE 2 - CORS wildcard `'*'` sur les Edge Functions**

**Fichier** : `supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**9 Edge Functions affectees** :

| Fonction | Risque |
|----------|--------|
| `generate-security-report` | Metriques internes accessibles cross-origin |
| `generate-exam` | CSRF potentiel |
| `firecrawl-scrape` | Exposition du scraping |
| `generate-clinical-case` | Acces non restreint |
| `secure-edn-extraction` | Donnees d'extraction exposees |
| `check-performance-degradation` | Metriques internes exposees |
| `get-vapid-key` | Cle VAPID exposee |
| `unified-alerts` | Systeme d'alertes accessible |
| `regenerate-oic-with-ai-check` | Regeneration de contenu |

**Recommandation** : Remplacer `'*'` par les origines autorisees specifiques (ex: `https://med-mng.emotionscare.com`).

---

**CRITIQUE 3 - Vulnerabilites des dependances**

| Package | Severite | CVE | Impact |
|---------|----------|-----|--------|
| `axios` ^1.7.9 | HIGH (7.5) | GHSA-43fc-jf86-j433 | DoS via `__proto__` |
| `jspdf` ^4.0.2 | HIGH (8.1) | GHSA-pqxr-3g65-p328 | Injection PDF + execution JS |
| `jspdf` ^4.0.2 | HIGH | GHSA-95fx-jjr5-f39c | DoS via BMP |
| `jspdf` ^4.0.2 | HIGH | GHSA-vm32-vv63-w422 | Injection XMP |

**Recommandation** : `npm audit fix` ou mise a jour manuelle vers versions patchees.

---

**CRITIQUE 4 - Cles API stockees en localStorage non chiffre**

**Fichier** : `src/hooks/usePlatformConnectors.ts` (lignes 86-87)

```typescript
const apiKeyStorageKey = `med-mng-connector-key-${type}`;
localStorage.setItem(apiKeyStorageKey, apiKey);
```

**Impact** : Vulnerable aux attaques XSS accedant au localStorage.

**Recommandation** : Chiffrement cote client ou migration vers sessionStorage + stockage serveur.

---

#### 3.1.3 Points d'attention moyens

| Probleme | Fichier | Severite | Recommandation |
|----------|---------|----------|----------------|
| CSP avec `unsafe-inline` | `nginx.conf:30` | MEDIUM | Utiliser des nonces CSP (requis par Stripe) |
| JWT dev faible (`dev-secret-change-me`) | `.env.development.example:52` | MEDIUM | Secret fort meme en dev |
| Token refresh non implemente | `src/lib/api-client.ts:63-67` | MEDIUM | Ajouter refresh avant expiration |
| TEST_MODE bypass auth | `src/config/testMode.ts:26` | MEDIUM | Verifier desactivation en prod |
| Upload sans restriction MIME | `src/components/settings/AdvancedSettings.tsx` | MEDIUM | Validation type + taille |

---

### 3.2 QUALITE DU CODE

#### 3.2.1 TypeScript - Configuration incomplete

**Fichier** : `tsconfig.app.json`

```json
{
  "strict": true,           // Active (bon)
  "noUnusedLocals": false,  // Desactive (mauvais)
  "noUnusedParameters": false,  // Desactive (mauvais)
  "noImplicitAny": false    // CRITIQUE - desactive malgre strict:true
}
```

**Impact** : `noImplicitAny: false` annule une grande partie du benefice de `strict: true`.

**Resultat mesure** : **1 509 occurrences de `any`** dans **428 fichiers**.

**Top des fichiers problematiques** :

| Fichier | Occurrences `any` | Pattern |
|---------|-------------------|---------|
| `src/services/medMngItemsService.ts` | 17+ | `(supabase as any).from()` |
| `src/hooks/useGlobalState.tsx` | 6 | `setState(prev: any)`, contexte non type |
| `src/contexts/PerformanceContext.tsx` | 12 | Metriques non typees |
| `src/components/social/DirectMessaging.tsx` | 7 | Messages non types |

**Recommandation** : Activer `noImplicitAny: true` et generer les types Supabase via `supabase gen types`.

---

#### 3.2.2 Gestion d'erreurs

**Promesses non gerees (`.then()` sans `.catch()`)** :

| Fichier | Lignes |
|---------|--------|
| `src/pages/Flashcards.tsx` | 93, 107, 114, 131, 141, 175, 204 |
| `src/pages/ExamMode.tsx` | 42-43 |
| `src/pages/ProgressDashboard.tsx` | 81-83 |

**Erreurs silencieuses (`.catch(() => {})`)** :

| Fichier | Ligne | Code |
|---------|-------|------|
| `src/components/generator/GenerationNotification.tsx` | 50 | `audio.play().catch(() => {})` |
| `src/components/edn/audio/AudioAmbiancePlayer.tsx` | 239 | `audioRef.current.play().catch(() => {})` |

**Points forts** :
- ErrorContext.tsx (188 lignes) : Messages d'erreur utilisateur en francais avec icones contextuelles
- Sentry 9.42 correctement configure (trace sample 0.1 prod, 0.5 dev)
- Filtrage intelligent des erreurs non-critiques (Loading chunk, ResizeObserver)
- Auto-refresh sur erreur CSRF, auto-redirect sur erreur auth

---

#### 3.2.3 Fuites memoire

**CRITIQUE - Event listeners non nettoyes dans GlobalAudioContext**

**Fichier** : `src/contexts/GlobalAudioContext.tsx` (lignes 75-78, 172-178)

```typescript
// Ligne 75-78 : Cleanup avec fonctions anonymes vides (NE FONCTIONNE PAS)
audioRef.current.removeEventListener('loadedmetadata', () => {});
audioRef.current.removeEventListener('timeupdate', () => {});

// Ligne 172-178 : 7 nouveaux listeners ajoutes a chaque changement de piste
audio.addEventListener('loadedmetadata', handleLoadedMetadata);
audio.addEventListener('timeupdate', handleTimeUpdate);
audio.addEventListener('ended', handleEnded);
audio.addEventListener('error', handleError);
audio.addEventListener('canplay', handleCanPlay);
audio.addEventListener('loadstart', handleLoadStart);
audio.addEventListener('progress', handleProgress);
```

**Impact** : Les listeners s'accumulent a chaque lecture → fuite memoire progressive.

**Autres fuites potentielles** :
- `src/contexts/PerformanceContext.tsx` : `connection.addEventListener('change')` sans `removeEventListener`
- **213 `addEventListener`** dans le codebase vs significativement moins de `removeEventListener`
- `src/components/audio/SecureAudioPlayer.tsx:130` : `setInterval` 500ms pour detection DevTools sans `clearInterval`

---

#### 3.2.4 Fichiers surdimensionnes (>700 lignes)

| Fichier | Lignes | Recommandation |
|---------|--------|----------------|
| `src/integrations/supabase/types.ts` | 32 159 | Auto-genere, acceptable |
| `src/hooks/useClinicalCases.ts` | 1 048 | Decouper : useCaseSelection, useCaseEvaluation, useCaseStats |
| `src/hooks/useFlashcards.ts` | 923 | Decouper : useDeckManagement, useReviewSession, useFlashcardStats |
| `src/components/clinical/ClinicalCaseEngine.tsx` | 906 | Extraire : CaseSteps, CaseEvaluation, CaseFeedback |
| `src/components/generator/GenerationHistory.tsx` | 904 | Extraire : Filters, List, Stats |
| `src/components/admin/ExtractionMonitoringDashboard.tsx` | 869 | Extraire sous-composants |
| `src/components/social/ForumDiscussion.tsx` | 828 | Extraire sous-composants |
| `src/pages/EdnComplete.tsx` | 809 | Extraire sous-composants |
| `src/components/exam/ExamHistory.tsx` | 804 | Extraire sous-composants |
| `src/components/advanced/OfflineMode.tsx` | 799 | Extraire sous-composants |
| `src/components/edn/premium/EdnItemModal.tsx` | 781 | Extraire sous-composants |
| `src/contexts/InternationalizationContext.tsx` | 735 | Externaliser les traductions dans des fichiers JSON |

**Total** : 28 fichiers > 500 lignes.

---

#### 3.2.5 Console.log en production

**40+ instances** de `console.log/warn/error` dans le code de production :
- `src/services/alertService.ts`
- `src/services/medMngItemsService.ts`
- `src/components/audio/SecureAudioPlayer.tsx` (lignes 44, 51, 62, 72, 135)

**Recommandation** : Remplacer par le logService structure existant.

---

#### 3.2.6 Duplication de code

| Pattern duplique | Fichiers concernes | Impact |
|------------------|--------------------|--------|
| Audio Player | `SecureAudioPlayer.tsx` (2 copies), `AudioAmbiancePlayer.tsx`, `UnifiedAudioPlayer.tsx`, `MusicPlayer.tsx` | 5 implementations similaires |
| Notification | `GenerationNotification.tsx`, `GenerationNotificationHandler.tsx` | Logique dupliquee |
| TableauRangA Utils | `IC1Integration.ts` a `IC10Integration.ts` | 10 fichiers quasi-identiques |
| Error Boundaries | `ErrorBoundary.tsx`, `ErrorBoundaryWithRetry.tsx`, `NetworkErrorBoundary.tsx`, `GenerationErrorBoundary.tsx`, `errorBoundary.tsx` (utils) | 5 implementations |

---

#### 3.2.7 React.memo absent

**Seulement 4 composants** utilisent `React.memo` sur 1 311 fichiers :
- `ExtractionMonitoringDashboard.tsx`
- `ExamHistory.tsx`
- `GenerationHistory.tsx`
- `ForumDiscussion.tsx`

**Impact** : Re-rendus inutiles sur les composants lourds.

---

### 3.3 ARCHITECTURE

#### 3.3.1 Points forts

| Aspect | Evaluation |
|--------|------------|
| Organisation domain-driven | Hooks, composants et services organises par domaine (edn, ecos, exam, clinical, music, social) |
| Separation des responsabilites | Frontend / API clients / Edge Functions / BDD |
| Pattern Router Edge Functions | 5 routeurs distribuant vers 133 fonctions |
| Row Level Security | RLS active sur 135+ tables |
| Gestion d'etat | TanStack Query (cache serveur) + Zustand (5 stores) + Context (7 providers) |
| Design tokens | Variables CSS + regle ESLint custom `no-hardcoded-colors` |
| Lazy loading routes | 60+ pages avec `React.lazy()` |

#### 3.3.2 Schema d'architecture

```
Frontend (React 18 + TypeScript)
    |
    ├── 60+ pages lazy-loadees
    ├── 232 hooks custom
    ├── 5 Zustand stores (user, cart, quiz, study, index)
    ├── 7 Context providers
    |
Clients API unifies (secureApiClient, unifiedApiClient, api-client)
    |
5 Routeurs Edge Functions (ai-audio, ai-core, ai-content, system, webhooks)
    |
Supabase Backend (PostgreSQL + Auth + Storage + 135+ tables + 323 index)
    |
Services externes (Suno, OpenAI, Perplexity, ElevenLabs, Stripe)
```

#### 3.3.3 Problemes d'architecture

**Provider nesting excessif (13 niveaux)** dans `App.tsx` :

```
1. GlobalErrorBoundary
2.   ThemeProvider
3.     QueryClientProvider
4.       BrowserRouter
5.         HelmetProvider
6.           AuthProvider
7.             LanguageProvider
8.               GlobalAudioProvider
9.                 TooltipProvider
10.                  ViewportProvider
11.                    AccessibilityProvider
12.                      InternationalizationProvider
13.                        PerformanceProvider
```

**Impact** : Degradation des performances de re-rendu, difficulte de debug.

**Recommandation** : Fusionner LanguageProvider + InternationalizationProvider, ThemeProvider + AccessibilityProvider.

**Barrel files problematiques** :
- `src/components/index.ts` (256 lignes) : 25+ `export *` empechant le tree-shaking
- `src/components/collaboration/index.ts` : Re-exporte depuis d'autres modules (risque de dependances circulaires)
- `src/services/index.ts` : Conflits de nommage documentes en commentaire

**Lock files multiples** : `pnpm-lock.yaml` + `bun.lock` coexistent → inconsistance du gestionnaire de paquets.

---

### 3.4 INFRASTRUCTURE & DEVOPS

#### 3.4.1 Docker

**Dockerfile** : Multi-stage build correct (Node Alpine → nginx Alpine), HEALTHCHECK present.

| Aspect | Statut | Detail |
|--------|--------|--------|
| Multi-stage build | OK | Separation build/production |
| Image de base | OK | Alpine Linux (surface d'attaque minimale) |
| HEALTHCHECK | OK | Present |
| Directive USER | MANQUANT | Utilise le user nginx par defaut |
| Limites ressources | MANQUANT | Pas de limits CPU/RAM dans docker-compose |

**docker-compose.yml** :
- Port PostgreSQL lie a `127.0.0.1:5432` (bon)
- Password via variable d'environnement obligatoire (`${POSTGRES_PASSWORD:?...}`)

#### 3.4.2 Nginx

**Points forts** :

| Header | Valeur |
|--------|--------|
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| X-XSS-Protection | `1; mode=block` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| HSTS | `max-age=31536000; includeSubDomains; preload` |
| Permissions-Policy | geolocation=(), microphone=(), camera=(), payment=(self) |

**Rate limiting** :
- Auth : 5 req/min (anti-brute force)
- API : 60 req/min
- General : 100 req/min

**Issue** : CSP contient `unsafe-inline` (requis par Stripe).

#### 3.4.3 CI/CD (GitHub Actions)

**8 workflows configures** :

| Workflow | Fonction |
|----------|----------|
| `ci.yml` | Pipeline principal (8 jobs) |
| `ci-cd.yml` | Deploiement continu |
| `accessibility-ci.yml` | Tests accessibilite axe-core (lundi 9h) |
| `chromatic.yml` | Regression visuelle Storybook |
| `tests-ci.yml` | Automatisation tests |
| `extract-oic.yml` | Extraction donnees OIC |
| `monitor-branch-protection.yml` | Surveillance branches |

**Pipeline principal** : TruffleHog → Lint/TypeCheck → Tests unitaires → E2E → Build → Lighthouse CI → Trivy Docker → Deploy.

#### 3.4.4 Base de donnees

| Metrique | Valeur |
|----------|--------|
| Tables | 135+ |
| Index | 323 |
| Migrations | 130+ |
| Index GIN full-text | Oui (francais) |
| Fonctions RPC | Parametrees |
| RLS | Active sur toutes les tables utilisateur |

---

### 3.5 PERFORMANCE & BUNDLE

#### 3.5.1 Code splitting (vite.config.ts)

**Chunks manuels configures** :

| Chunk | Contenu |
|-------|---------|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-ui` | 5 composants Radix UI (sur 28 total) |
| `vendor-query` | TanStack Query + Zustand |
| `vendor-charts` | Recharts |
| `vendor-motion` | Framer Motion |
| `vendor-forms` | React Hook Form + Zod |
| `vendor-pdf` | jsPDF + html2canvas |

**Problemes** :
- 23 packages Radix UI non chunkes separement
- Libraries lourdes non deferrees : `xlsx` (180KB), `canvas-confetti`, `jszip`
- Pas de chunk admin separe (admin != utilisateur standard)

#### 3.5.2 Dependances lourdes

| Dependance | Taille estimee (gzip) | Usage | Optimisation |
|------------|----------------------|-------|--------------|
| `jspdf` + `html2canvas` | ~300KB | Export PDF | Dynamic import possible |
| `xlsx` | ~180KB | Export Excel | Dynamic import possible |
| `recharts` | ~150KB | Graphiques | Deja chunke |
| `framer-motion` | ~60KB | Animations | Deja chunke |
| 28 packages Radix UI | ~100KB total | UI | Chunker ensemble |
| `@dnd-kit/*` (3 packages) | ~40KB | Drag & drop | Dynamic import possible |
| `canvas-confetti` | ~15KB | Celebrations | Lazy load on demand |

**Potentiel de reduction** : 200-300KB (18-27%) via dynamic imports des libraries PDF/Excel/Confetti.

#### 3.5.3 React.lazy et Suspense

**Points forts** :
- 60+ pages avec `React.lazy()` dans App.tsx (lignes 40-150)
- `ModularDashboard.tsx` : 4 composants lazy-loades avec `.then()` pattern
- Suspense boundaries presentes

**Manquant** :
- Composants lourds non deferres (Generator, Admin, Analytics)
- Pas de `<link rel="prefetch">` pour les routes probables

#### 3.5.4 Memoisation

| Technique | Usage | Status |
|-----------|-------|--------|
| `React.memo` | 4 composants sur 1311 fichiers | CRITIQUE |
| `useMemo` | Present dans 232 fichiers (hooks) | BON dans les hooks |
| `useCallback` | Present dans 232 fichiers (hooks) | BON dans les hooks |
| `react-window` | En dependance, sous-utilise | A EXPLOITER |

#### 3.5.5 Images

**Composant OptimizedImage** (`src/components/ui/optimized-image.tsx`) :
- `loading="lazy"` + Intersection Observer
- `decoding="async"`
- srcSet responsive
- Placeholder SVG pendant le chargement
- **Manquant** : Pas de format WebP/AVIF, pas de blur-up

#### 3.5.6 PWA Caching (Workbox)

| Strategie | Ressource | TTL | Max entries |
|-----------|-----------|-----|-------------|
| CacheFirst | Google Fonts | 365 jours | - |
| CacheFirst | Images | 30 jours | 100 |
| CacheFirst | Polices | 365 jours | 20 |
| NetworkFirst | API Supabase | 5 minutes | 50 |

**Manquant** : `.webp`, `.jpeg`, `.jpg` dans les glob patterns Workbox.

#### 3.5.7 Index.html

**Bon** : Preconnect Google Fonts, CSS critique inline, meta PWA.
**Manquant** :
- `<link rel="dns-prefetch">` pour Supabase
- `<link rel="preload">` pour les polices critiques
- `font-display: swap` non specifie

#### 3.5.8 Lighthouse CI

```json
{
  "performance": ["error", {"minScore": 0.8}],
  "accessibility": ["error", {"minScore": 0.9}],
  "best-practices": ["error", {"minScore": 0.9}],
  "seo": ["error", {"minScore": 0.8}]
}
```

**Issue** : Execute seulement sur localhost:5173 (dev), pas sur build de production.

---

### 3.6 TESTS

#### 3.6.1 Configuration

| Framework | Perimetre | Statut |
|-----------|-----------|--------|
| Vitest 3.2 | Tests unitaires/composants | Actif |
| Playwright 1.58 | E2E (6 profils navigateur) | Actif |
| Cypress 14.5 | E2E alternatif | Redondant |
| Testing Library | Tests composants React | Integre |
| Axe-core | Accessibilite | Integre CI |
| MSW 2.11 | Mock API | Configure |

#### 3.6.2 Couverture

**Seuils (vitest.config.ts)** : 30% lignes / fonctions / branches / statements.

**Tests hooks existants (bien couverts)** :

| Fichier de test | Lignes |
|-----------------|--------|
| `src/tests/hooks/useAuth.test.ts` | 807 |
| `src/tests/hooks/useSecurityModule.test.ts` | 736 |
| `src/tests/hooks/useStudyModuleExtended.test.ts` | 718 |
| `src/tests/hooks/useAudioMedia.test.ts` | 717 |
| `src/tests/hooks/usePerformanceMonitoring.test.ts` | 716 |
| `src/tests/hooks/useServicesModule.test.ts` | 695 |
| `src/tests/hooks/useRGPDCompliance.test.ts` | 676 |

#### 3.6.3 Chemins critiques NON testes

| Fonctionnalite | Composant(s) | Lignes | Risque |
|----------------|-------------|--------|--------|
| Generation musique IA | MusicGenerator, AdvancedMusicGenerator | 684+ | Pipeline async complexe |
| Mode examen | ExamMode, ExamConfig, ExamHistory | 758+, 761+, 806+ | Scoring, historique |
| Synchronisation offline | OfflineMode, offlineSyncService | 799+, 612 | Perte de donnees |
| Cas cliniques | ClinicalCaseEngine | 906 | Evaluation medicale |
| Forum social | ForumDiscussion, DirectMessaging | 830+ | Interactions utilisateur |
| Administration | AuditDashboard, AdminPanel | Multiple | Integrite donnees |

#### 3.6.4 Problemes

- Seuil de couverture trop bas (30%)
- Pas de gate de couverture dans la CI (Codecov sans seuil)
- Deux frameworks E2E redondants (Playwright + Cypress)
- Pas de tests de performance automatises

---

## 4. AUDIT NON-TECHNIQUE

### 4.1 CONFORMITE RGPD

**Score : 9/10**

| Exigence RGPD | Statut | Implementation |
|----------------|--------|----------------|
| Politique de confidentialite | OK | `src/pages/PolitiqueConfidentialite.tsx` |
| Politique cookies | OK | `src/pages/CookiesPolicy.tsx` |
| Droit d'export (portabilite) | OK | `src/pages/MesDonneesRGPD.tsx` (export JSON) |
| Droit de suppression | OK | `src/pages/MesDonneesRGPD.tsx` (suppression compte) |
| Identification responsable | OK | EMOTIONSCARE SASU, Amiens |
| Base legale du traitement | OK | Documentee dans la politique |
| Isolation des donnees | OK | RLS avec `user_activity_log` par utilisateur |
| Exclusion SEO pages RGPD | OK | `robots.txt` bloque `/mes-donnees-rgpd` |

**Responsable** : EMOTIONSCARE SASU - Laeticia Motongane, Presidente - SIRET 944 505 445 00011 - Amiens.

**Point d'attention** : Pas de bandeau de consentement cookies explicite detecte.

---

### 4.2 ACCESSIBILITE

**Score : 10/10** (auto-evaluation)

| Fonctionnalite | Implementation |
|----------------|----------------|
| ARIA labels | Labels descriptifs sur tous les boutons |
| Navigation clavier | Support complet avec gestion du focus |
| Skip links | Liens d'evitement |
| Landmarks semantiques | `role="navigation"`, `role="main"` |
| Contraste | Tests AA (4.5:1) et AAA (7:1) |
| Animations reduites | `prefers-reduced-motion` respecte |
| Cibles tactiles | 44x44px / 52x52px minimum |
| Daltonisme | Filtres protanopie, deuteranopie, tritanopie |
| Mode haut contraste | `src/components/ui/advanced-accessibility.tsx` |
| Tests automatises | CI axe-core chaque lundi |

**Note** : "100% certifie RGAA 4.1" = auto-evaluation, pas certification externe (documente dans `KNOWN_LIMITATIONS.md`).

---

### 4.3 SEO

**Score : 9/10**

| Element | Statut | Detail |
|---------|--------|--------|
| Meta tags | OK | Title, description, author |
| Open Graph | OK | `src/components/seo/SEOHead.tsx` |
| Twitter Cards | OK | summary_large_image |
| JSON-LD | OK | Organization, SoftwareApplication, FAQPage, Product |
| Sitemap.xml | OK | 40+ URLs avec priorites |
| robots.txt | OK | Regles par bot (Googlebot, Bingbot, social) |
| Canonical URLs | OK | Support dans SEOHead |
| Global Security Headers | OK | `src/components/seo/GlobalSecurityHeaders.tsx` |

---

### 4.4 DOCUMENTATION

**Score : 9/10**

| Document | Contenu |
|----------|---------|
| `README.md` (623 lignes) | Vision, architecture, setup, routes, BDD, securite |
| `CONTRIBUTING.md` | Focus items EDN |
| `CONTRIBUTING_GENERAL.md` | Process complet (bugs, features, standards) |
| `CODE_OF_CONDUCT.md` | Contributor Covenant |
| `CHANGELOG.md` | Historique des versions |
| `docs/` (289 fichiers) | Architecture, API, securite, monitoring, QA, RLS, limitations |

**Point fort** : `KNOWN_LIMITATIONS.md` documente explicitement que les metriques sont des auto-evaluations.

---

### 4.5 PAGES LEGALES

**Score : 10/10**

| Page | Fichier |
|------|---------|
| Mentions legales | `src/pages/MentionsLegales.tsx` (editeur, RCS, SIRET, TVA) |
| Politique confidentialite | `src/pages/PolitiqueConfidentialite.tsx` (RGPD art. 13/14) |
| CGU | `src/pages/CGU.tsx` |
| Politique cookies | `src/pages/CookiesPolicy.tsx` |
| Declaration accessibilite | `src/pages/DeclarationAccessibilite.tsx` (RGAA 4.1) |
| Donnees RGPD | `src/pages/MesDonneesRGPD.tsx` (export/suppression) |

**Avertissement medical present** dans les CGU : "MED MNG est un outil pedagogique, PAS un dispositif medical, un outil de diagnostic ou une ressource clinique."

---

### 4.6 UX / ERGONOMIE

**Score : 9/10**

#### Onboarding
- `OnboardingModal.tsx` (145 lignes) : Tour guide multi-etapes avec progression, DB-backed
- `ContextualHelp.tsx` (183 lignes) : Tooltips contextuels avec tracking de dismiss
- Page demo publique (`/demo`)

#### Etats de chargement
- 6 variantes : default, medical (stethoscope), music, minimal, pulse, shimmer
- 4 tailles : sm, md, lg, xl
- Skeleton loader avec largeur variee

#### Gestion d'erreurs UX
- Page 404 design premium avec PremiumCard, logging des 404
- Toasts 4 variantes (success, error, info, warning)
- Dialogues de confirmation pour actions critiques

#### Gamification (15+ composants)

| Composant | Fonction |
|-----------|----------|
| `GamificationPanel.tsx` | Dashboard principal |
| `Leaderboard.tsx` | Classements global/amis |
| `StreakDisplay.tsx` | Streaks quotidiens |
| `BadgeCollection.tsx` | Collection de badges |
| `LevelUpModal.tsx` | Animation montee de niveau |
| `AchievementPopup.tsx` | Notifications achievements |
| `ChallengeSystem.tsx` | Defis quotidiens/hebdomadaires |
| `CertificateGenerator.tsx` | Certificats |
| `BadgeUnlockAnimation.tsx` | Animations de deblocage |

**Systeme XP** : Niveaux 1-50+ (Debutant → Apprenti → Etudiant → Avance → Expert → Maitre)
**Badges** : 9+ types avec rarete (common, rare, epic, legendary)

---

### 4.7 INTERNATIONALISATION

**Score : 4/10**

#### Infrastructure (BON)
- `InternationalizationContext.tsx` (735 lignes) : Support 5 langues (fr, en, es, de, it)
- Detection automatique : localStorage → navigator.language → fallback fr
- Formatage nombres/dates/heures par locale (Intl)
- Composant `TranslatedText`
- Cles de traduction : navigation, common, medical, music, errors, success, performance

#### Couverture (INSUFFISANTE)

**Strings hardcodees en francais (non traduites)** :

| Zone | Exemples |
|------|----------|
| Navigation sidebar | Tous les labels (Home, Analytics, etc.) |
| Navigation mobile | Tous les labels |
| OnboardingModal | "Bienvenue !", "Precedent", "Suivant", "Terminer" |
| Page 404 | "Page introuvable", description |
| MedMngPricing | Descriptions des plans, features |
| Boutons generiques | "Generer", "Sauvegarder", "Annuler" |
| Formulaires | Labels et placeholders |

**Recommandation** : Refactoring i18n massif necessaire si expansion internationale prevue. Sinon, acceptable pour le public cible (etudiants medecine France).

---

### 4.8 MOBILE & PWA

**Score : 9/10**

#### Design responsive

| Breakpoint | Taille |
|------------|--------|
| xs | 475px |
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1400px |

#### PWA

| Fonctionnalite | Statut |
|----------------|--------|
| Service Worker (Workbox) | OK |
| Manifest | OK (icones, screenshots, categories) |
| Installation iOS/Android | OK |
| Push notifications | OK (VAPID) |
| Cache statique | OK (CacheFirst, 1 an) |
| Cache API | OK (NetworkFirst, 5 min) |
| Mode offline | Partiel (sync incomplete) |

#### Mobile
- Boutons tactiles : min-height/width 48px
- Safe area iOS (notch)
- `-webkit-overflow-scrolling: touch`
- Bottom nav mobile avec gamification integree (streak + XP)

---

### 4.9 MONETISATION

**Score : 7/10**

#### Plans d'abonnement

| Plan | Prix | Generations/mois | Stripe Price ID |
|------|------|-----------------|-----------------|
| Free | 0 EUR | 3 | - |
| Standard | 19 EUR/mois | 30 | `price_1RqGSe...` |
| Pro | 29 EUR/mois | 300 | `price_1RqGT0...` |
| Premium | 39 EUR/mois | 3 000 | `price_1RqGTH...` |
| Institution | 99 EUR/mois | 10 000 | Contact |

#### Composants monetisation

| Composant | Fonction |
|-----------|----------|
| `MedMngPricing.tsx` | Page tarification |
| `MedMngSubscribe.tsx` | Flux d'abonnement Stripe |
| `useSubscription.ts` | Hook de gestion abonnement |
| `conversionTracking.ts` | Tracking (page_view, signup, checkout_start, checkout_complete) |
| `BillingDashboard.tsx` | Dashboard facturation (usage, factures, statut) |
| `PremiumPaywall.tsx` | Paywall features premium (tableaux, quiz, BD, save_music) |

#### Lacunes identifiees

| Manquant | Impact | Priorite |
|----------|--------|----------|
| PayPal (stubbe, toast "bientot disponible") | Perte conversions marche international | HIGH |
| Workflow dunning (echec paiement) | Perte abonnes silencieuse | HIGH |
| Email de confirmation/recu | UX post-achat incomplete | MEDIUM |
| UI d'annulation dans Pricing | Friction pour l'utilisateur | MEDIUM |
| Portail client Stripe (existe mais non integre) | Self-service manquant | LOW |

---

### 4.10 CONTENU PEDAGOGIQUE

**Score : 8/10**

#### EDN (Epreuves Demateriaisees Nationales)

- **143 composants** dans `src/components/edn/`
- **Schema Zod** : `itemEDNSchema.ts` (120 lignes)
- **Structure par item** :
  - `item_metadata` : code (IC-X), titre, categorie, difficulte (A/B/AB), version
  - `content` : rang_a + rang_b (2 niveaux de difficulte)
  - Par competence : concept, definition, exemple, erreur courante, moyen mnemotechnique, subtilite, application, precaution, paroles chantables

- **5 categories** : relation medecin-malade, valeurs professionnelles, raisonnement/decision, qualite/securite, organisation systeme

#### Systeme de revision SRS (Spaced Repetition)

- **Algorithme** : SM-2 (SuperMemo 2)
- **Niveaux de qualite** : 0 (blackout) → 5 (parfait)
- **Etats** : new → learning → review → relearning
- **Parametres** : ease factor, intervalle, repetitions, prochaine revision
- **Composants** : SRSReview, SRSNotificationSettings, SRSStatsExport, SmartReminders

#### Flashcards

- Gestion de decks (creation, suppression, organisation)
- Generation IA depuis items EDN
- Import Anki
- Mode chronometre
- Statistiques de revision

#### Cas cliniques

- Scenarios multi-etapes avec feedback
- Specialites : Cardiologie, Pediatrie, Orthopedie, Neurologie, etc.
- Generation IA de cas
- Tracking du temps par etape

#### Musique IA pedagogique

- Generation via Suno AI
- ParolesMusicales : paroles chantables par competence
- AudioPlayer specialise
- Bibliotheque personnelle

---

### 4.11 OFFLINE & SYNCHRONISATION

**Score : 7/10**

#### offlineSyncService.ts (612 lignes)

**Architecture** : Singleton, dual storage (localStorage + IndexedDB)

| Store IndexedDB | Contenu |
|-----------------|---------|
| `audio_cache` | Blobs audio avec timestamp |
| `edn_content` | Contenu EDN |
| `user_data` | Donnees utilisateur |
| `edn_items_offline` | Items EDN complets (v2) avec tracking download |
| `offline_progress` | Resultats quiz/flashcard/study (flag synced) |

**Queue de synchronisation** :
- Operations : insert, update, delete
- Max retries : 3
- Sync automatique au focus
- Tracking par table

**Cache EDN** (`ednCache.ts`) :
- Cache-busting via localStorage
- TTL items EDN : 24h
- TTL competences OIC : 24h
- TTL progression : 5 min

**useNetworkStatus** (148 lignes) :
- Detection online/offline avec test reel (HEAD favicon.ico, timeout 5s)
- Type connexion (2g-5g), RTT, debit, Save-Data
- Detection connexion lente (2g, RTT >500ms, debit <0.5 Mbps)
- Notifications toast configurables

#### Lacunes offline

| Manquant | Impact | Priorite |
|----------|--------|----------|
| Resolution de conflits (last-write-wins seulement) | Perte de donnees possible | HIGH |
| Throttling adaptatif au debit | Surconsommation bande passante | MEDIUM |
| Indicateur de progression de sync | UX opaque | MEDIUM |
| Declenchement sync manuel | Pas de controle utilisateur | LOW |

---

## 5. TABLEAU DE SYNTHESE

### Problemes par severite

| Severite | Nombre | Exemples principaux |
|----------|--------|---------------------|
| CRITIQUE | 6 | Credentials hardcodees, CORS wildcard, vulnerabilites deps, API keys localStorage, fuites memoire audio, 1509 `any` types |
| HIGH | 8 | CSP unsafe-inline, promesses non gerees, console.log prod, provider nesting 13 niveaux, chemins non testes, PayPal manquant, dunning absent |
| MEDIUM | 12 | Fichiers surdimensionnes, duplication code, couverture tests 30%, barrel files, lock files multiples, i18n incomplet, offline conflits, upload non valide |
| LOW | 5 | react-window sous-utilise, Cypress redondant, pas de WebP, pas de preload fonts, repertoires tests non unifies |

### Matrice forces/faiblesses

| Forces | Faiblesses |
|--------|------------|
| Architecture domain-driven solide | 1 509 types `any` (428 fichiers) |
| RLS sur 135+ tables avec 323 index | Fuites memoire (GlobalAudioContext, SecureAudioPlayer) |
| Accessibilite exemplaire (RGAA 4.1) | CORS wildcard sur 9 Edge Functions |
| Documentation complete (289 fichiers) | Dependances vulnerables (jspdf, axios) |
| RGPD bien implemente | Couverture tests 30%, chemins critiques non testes |
| SEO complet (JSON-LD, sitemap, OG) | 28 fichiers > 500 lignes, 4 React.memo seulement |
| CI/CD robuste (8 workflows) | 2 lock files, 2 frameworks E2E redondants |
| Rate limiting triple couche | i18n infrastructure OK mais couverture < 20% |
| Gamification riche (15+ composants) | Resolution conflits offline absente |
| PWA avec Workbox bien configure | PayPal et workflow dunning manquants |
| SRS algorithme SM-2 complet | Provider nesting 13 niveaux |
| Sentry bien integre | 40+ console.log en production |

---

## 6. PLAN D'ACTION PRIORITAIRE

### Priorite 1 - Immediat (Securite & Stabilite)

| # | Action | Fichier(s) | Effort |
|---|--------|-----------|--------|
| 1 | Migrer credentials Supabase vers variables d'environnement | `supabase/client.ts`, `supabaseConstants.ts`, 3+ fichiers | Faible |
| 2 | Remplacer CORS `*` par origines specifiques | `supabase/functions/_shared/cors.ts` | Faible |
| 3 | Mettre a jour `axios` et `jspdf` (vulnerabilites HIGH) | `package.json` | Faible |
| 4 | Corriger fuites memoire GlobalAudioContext | `src/contexts/GlobalAudioContext.tsx:75-78,172-178` | Moyen |
| 5 | Corriger fuite memoire SecureAudioPlayer | `src/components/audio/SecureAudioPlayer.tsx:130,143` | Faible |
| 6 | Chiffrer API keys en localStorage | `src/hooks/usePlatformConnectors.ts:86-87` | Moyen |

### Priorite 2 - Court terme (Qualite & Fiabilite)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 7 | Activer `noImplicitAny: true` dans tsconfig | Eliminer 1 509 `any` progressivement | Eleve |
| 8 | Generer types Supabase (`supabase gen types`) | Supprimer `(supabase as any)` dans services | Moyen |
| 9 | Ajouter `.catch()` aux promesses non gerees | Flashcards.tsx, ExamMode.tsx, ProgressDashboard.tsx | Faible |
| 10 | Remplacer `console.log` par logService | 40+ fichiers de production | Faible |
| 11 | Unifier gestionnaire de paquets (1 seul lock file) | Supprimer bun.lock ou pnpm-lock.yaml | Faible |
| 12 | Fusionner providers redondants (13 → 9 niveaux) | App.tsx + contexts associes | Moyen |

### Priorite 3 - Moyen terme (Performance & Maintenabilite)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 13 | Ajouter React.memo aux 28 composants > 500 lignes | -30% re-rendus inutiles | Moyen |
| 14 | Refactorer fichiers > 700 lignes (7 fichiers) | Testabilite, maintenabilite | Eleve |
| 15 | Dynamic import pour jspdf/xlsx/canvas-confetti | -200KB initial bundle | Moyen |
| 16 | Eliminer barrel files wildcard (`export *`) | Tree-shaking effectif | Moyen |
| 17 | Augmenter couverture tests a 50% + tester chemins critiques | Fiabilite musicGen, exam, offline | Eleve |
| 18 | Unifier Playwright/Cypress (garder Playwright) | -1 framework, CI plus rapide | Moyen |
| 19 | Consolider audio players (5 → 1 UnifiedAudioPlayer) | Elimination duplication | Moyen |
| 20 | Consolider error boundaries (5 → 2) | Simplification | Faible |

### Priorite 4 - Long terme (Croissance)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 21 | Implementer PayPal + workflow dunning | +15-20% conversions estimees | Eleve |
| 22 | Completer i18n (hardcoded strings → TranslatedText) | Expansion internationale | Eleve |
| 23 | Implementer resolution de conflits offline | Integrite donnees offline | Eleve |
| 24 | Ajouter WebP/AVIF + blur-up placeholders | -40% taille images | Moyen |
| 25 | Ajouter preload/prefetch fonts + routes probables | -200ms FCP | Faible |
| 26 | Externaliser traductions dans fichiers JSON | Maintenabilite i18n | Moyen |
| 27 | Ajouter virtual scrolling (react-window) aux listes longues | Performance listes | Moyen |
| 28 | Ajouter detection dependances circulaires (madge) | Prevention regression archi | Faible |

---

*Rapport genere le 15 fevrier 2026*
*Scope : Audit complet technique et non-technique du projet MED-MNG v9.6.3*
*Methode : Analyse statique automatisee (grep, AST) + revue manuelle du code source*
*1 311 fichiers TS/TSX analyses, 313 939 lignes de code*
