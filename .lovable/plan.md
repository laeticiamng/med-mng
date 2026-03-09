

# AUDIT TECHNIQUE COMPLET - MED-MNG Platform

## 1. RESUME EXECUTIF

**Etat global:** Plateforme fonctionnellement riche (90+ pages, 115+ Edge Functions, 722 tables) avec une architecture mature mais une dette technique significative liee a l'accumulation de fonctionnalites.

**Niveau de preparation:** 80% - Le coeur fonctionne, mais des problemes de securite residuels, de logs en production, et de fonctionnalites non connectees empechent un go-live serein.

**Verdict go-live:** **NON EN L'ETAT** - 3-5 jours de correctifs critiques necessaires.

### 5 P0 principaux

1. **1481 console.log dans 99 fichiers** - dont ~50 non proteges par `import.meta.env.DEV` (ex: `src/scripts/auditItems.ts` lignes 13-28, fuite d'info en prod)
2. **2 RLS policies `USING(true)` sur INSERT/UPDATE/DELETE** - tables non identifiees depuis le linter, potentiellement exploitables
3. **Pricing page affiche "Gratuit, Pro 19EUR, Premium 39EUR"** mais `create-checkout` a 3 plans (standard 19EUR, pro 29EUR, premium 39EUR) - **incoherence prix/plan visible par l'utilisateur**
4. **`verify_jwt = false` sur toutes les Edge Functions** sans exception dans `config.toml` - le JWT est valide en code mais un oubli dans une seule fonction expose l'endpoint
5. **`useSubscription` reference un plan `institution` avec `price_id: 'price_institution_contact'`** - faux price ID Stripe qui provoquera un crash checkout

### 5 P1 principaux

1. **~50 fichiers avec `console.log` non conditionne** - fuite d'information et degradation perf en production
2. **`src/scripts/auditItems.ts`** - 8 `console.log` bruts sans garde DEV, expose les rapports d'audit en production
3. **Supabase linter: `function_search_path_mutable`** - marque comme ignore mais le warning persiste, risque d'injection SQL sur fonctions sans `search_path`
4. **`dangerouslySetInnerHTML` dans 14 fichiers** - tous sanitises via DOMPurify (bon), mais `src/components/common/AlertBanner.tsx` injecte du CSS brut sans sanitisation
5. **Pas de test E2E fonctionnel du flux Stripe** - `create-checkout` et `check-subscription` non verifies live

---

## 2. TABLEAU D'AUDIT

| Priorite | Domaine | Localisation | Probleme | Preuve | Risque | Recommandation | Faisable Lovable? |
|----------|---------|-------------|----------|--------|--------|---------------|-------------------|
| P0 | Security | `src/scripts/auditItems.ts` | 8 `console.log` non proteges DEV | Lignes 13-28 | Fuite donnees audit en prod | Wrapper avec `import.meta.env.DEV` | Oui |
| P0 | Billing | `create-checkout` vs Pricing page | Plans incoherents (Pricing dit "Pro 19EUR", backend dit "Standard 19EUR") | Comparaison `MedMngPricing.tsx` L33 vs `create-checkout` L7-26 | Utilisateur paie un montant inattendu | Aligner nommage et prix | Oui |
| P0 | Billing | `useSubscription.ts` L12 | `price_institution_contact` = faux ID Stripe | Code source | Crash si selection | Retirer ou marquer comme "contact us" | Oui |
| P0 | RLS | Supabase linter | 2 policies `USING(true)` INSERT/UPDATE/DELETE | Security scan | Modification non autorisee de donnees | Identifier et restreindre les tables | Requires SQL migration |
| P0 | Security | `config.toml` | Toutes les fonctions `verify_jwt=false` | 72 occurrences | Si une fonction oublie la validation JWT en code = endpoint ouvert | Auditer chaque fonction pour validation JWT interne | Partiellement |
| P1 | Performance | 99 fichiers src/ | 1481 `console.log` total | search_files | Perf + fuite info | Audit fichier par fichier, garder uniquement DEV | Oui (progressif) |
| P1 | Security | `AlertBanner.tsx` L206 | CSS injecte via `dangerouslySetInnerHTML` sans sanitisation | Code source | XSS via keyframe injection | Utiliser une classe CSS Tailwind | Oui |
| P1 | Auth | `AuthProvider.tsx` L100 | `console.warn('Could not log sign in activity')` non conditionne | Code source | Fuite en prod | Conditionner DEV | Oui |
| P1 | Frontend | `testMode.ts` | `TEST_MODE_ENABLED = false && !isProduction` - logique correcte mais fragile | Code source | Un changement accidentel bypass toute l'auth | Ajouter un check `import.meta.env.PROD` | Oui |
| P2 | SEO | Pages SEO pillar | JSON-LD via `dangerouslySetInnerHTML` - correct mais pas de validation schema | 4 fichiers seo/ | Schema invalide non detecte | Ajouter validation Zod pour JSON-LD | Oui |
| P2 | i18n | Pricing page | Textes hardcodes en francais ("Un seul objectif : reussir l'EDN") | `MedMngPricing.tsx` L56 | UX cassee EN/DE | Wrapper avec `TranslatedText` | Oui |
| P2 | Observability | Sentry | `@sentry/react` installe mais config non confirmee | `package.json` | Erreurs prod non tracees | Verifier DSN et initialisation | Requires secret |
| P3 | Performance | `App.tsx` | 7 niveaux de providers (ameliore de 10+) | Architecture v10 | Re-renders en cascade | Acceptable pour l'instant | Non prioritaire |

---

## 3. DETAIL PAR CATEGORIE

### Frontend & Rendu
- **Fonctionne:** Lazy loading sur 60+ pages, `PageLoader` fallback, `GlobalErrorBoundary`, 404 page correcte, responsive via CSS media queries
- **Casse:** Rien de bloquant detecte dans le routing
- **Douteux:** 90+ pages = maintenance lourde, certaines probablement orphelines

### Auth & Autorisations
- **Fonctionne:** `AdminRoute` verifie `user_roles` via RLS (correct), `ProtectedRoute` redirige vers login, refresh token gere, Google OAuth configure
- **Casse:** Rien de bloquant
- **Douteux:** `TEST_MODE_ENABLED` - bien que `false`, la logique `false && !isProduction` est fragile

### APIs & Edge Functions
- **Fonctionne:** CORS dynamique via `getCorsHeaders()`, Stripe webhook avec signature validation, `create-checkout` avec plans multiples
- **Casse:** ~30+ Edge Functions utilisent encore le static `corsHeaders` (deprecated)
- **Douteux:** 115+ fonctions dont beaucoup potentiellement orphelines

### Database & RLS
- **Fonctionne:** 722 tables, RLS activee partout, `user_roles` table separee (bonne pratique)
- **Casse:** 2 policies `USING(true)` non SELECT (identifiees par linter)
- **Non confirme:** Tables exactes affectees par les policies permissives

### Securite
- **Fonctionne:** DOMPurify pour HTML, CORS restreint, secrets via Supabase, Stripe webhook signature, pas de secrets client-side
- **Casse:** `AlertBanner.tsx` injecte du CSS brut, logs non gardes en prod
- **Non confirme:** Rate limiting sur Edge Functions

### Paiement & Billing
- **Fonctionne:** `create-checkout` bien structure, 7j trial, webhook complet (created/updated/deleted/invoice)
- **Casse:** Incoherence nommage plans (Pricing page vs backend), plan `institution` avec faux price ID
- **Non confirme:** Stripe en mode live vs test

### Performance
- **Fonctionne:** React Query avec `staleTime` 10min, lazy loading, `react-window` pour listes
- **Douteux:** 1481 `console.log` impact perf, bundle probablement lourd (60+ lazy chunks)

### SEO
- **Fonctionne:** `SEOHead` component, `AutoSEO`, `GlobalJsonLd`, 10 pillar pages, structured data FAQ
- **Douteux:** Canonical URLs pointent vers paths relatifs (devrait etre absolu avec domaine)

### i18n
- **Fonctionne:** FR/EN/DE via `TranslatedText` + dictionnaire statique, `LanguageSelector` global
- **Casse:** Nombreux textes hardcodes FR dans Pricing, About, legal pages non couverts par le dictionnaire

### Observabilite
- **Fonctionne:** Sentry installe, health endpoint, `analytics-tracker`, `monitoring-alerts`, web vitals tracking
- **Non confirme:** Sentry DSN configure, alertes monitoring actives

---

## 4. PLAN D'ACTION PRIORISE

### P0 - Correctifs immediats (a implementer maintenant)
1. Wrapper les `console.log` de `src/scripts/auditItems.ts` avec `import.meta.env.DEV`
2. Aligner les noms de plans entre `MedMngPricing`, `PricingPlans`, `useSubscription` et `create-checkout`
3. Retirer le plan `institution` du code frontend ou le marquer explicitement "Contactez-nous"
4. Corriger `AlertBanner.tsx` pour utiliser du CSS Tailwind au lieu de `dangerouslySetInnerHTML`

### P1 - Correctifs rapides (dans la semaine)
5. Audit systematique des ~50 fichiers avec `console.log` non protege
6. Conditionner tous les `console.warn` restants dans `AuthProvider.tsx`
7. Renforcer `testMode.ts` avec check `import.meta.env.PROD`
8. Migrer les Edge Functions restantes vers `getCorsHeaders(req)`

### P2 - Ameliorations
9. Wrapper les textes hardcodes FR restants dans `TranslatedText`
10. Valider la configuration Sentry
11. Ajouter des tests E2E pour le flux Stripe

### P3 - Polish
12. Canonicals absolus avec domaine
13. Audit des pages orphelines
14. Optimiser le bundle (analyser les chunks)

---

## 5. IMPLEMENTATION IMMEDIATE

Le plan d'implementation couvrira les correctifs P0 suivants:

1. **`src/scripts/auditItems.ts`** - Wrapper 8 `console.log` avec `import.meta.env.DEV`
2. **`src/hooks/useSubscription.ts`** - Retirer le tier `institution` ou le marquer non-selectionnable
3. **`src/components/common/AlertBanner.tsx`** - Remplacer l'injection CSS par une approche Tailwind/style tag securisee
4. **`src/components/med-mng/AuthProvider.tsx`** - Conditionner les `console.warn` restants
5. **Coherence plans Stripe** - Aligner le nommage dans le frontend avec les IDs backend
6. **`src/config/testMode.ts`** - Renforcer la protection production

