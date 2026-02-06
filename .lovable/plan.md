
# Audit Technique Senior - MED-MNG

**Date**: 6 Fevrier 2026
**Profil**: Dev Senior / Lead technique
**Scope**: Architecture, dependencies, code quality, dead code, performance, securite

---

## 1. Dependances Production Incorrectes (Priorite HAUTE)

**Probleme**: 10+ packages serveur/dev sont dans `dependencies` au lieu de `devDependencies`, gonflant le bundle de production.

Packages a deplacer vers `devDependencies`:
- `@sentry/node` (package Node.js, seul `@sentry/react` est utilise cote client)
- `express`, `express-rate-limit`, `helmet` (framework serveur - non importe nulle part dans `src/`)
- `sharp` (traitement d'image Node natif - non importe)
- `dotenv` (utilise uniquement dans `src/scripts/`, pas dans l'app React)
- `glob` (utilitaire Node.js FS - non importe)
- `@storybook/*` (6 packages) - deja dupliques dans `devDependencies`

**Impact**: Bundle potentiellement plus lourd, confusion sur l'architecture, erreurs de build possibles avec `sharp` (binaire natif).

**Correction**: Deplacer ces packages dans `devDependencies` dans `package.json`.

---

## 2. Dead Code et Fichiers Orphelins (Priorite MOYENNE)

### 2a. `CombinedProviders.tsx` - Module entierement inutilise

Ce fichier exporte `CombinedProviders`, `checkProvidersHealth`, et `queryClient`, mais **aucun n'est importe dans l'application**. L'app utilise sa propre pyramide de providers dans `App.tsx`. De plus:
- Il monkey-patch `console.time`/`console.timeEnd` globalement, ce qui peut casser des outils tiers
- Il cree un `QueryClient` concurrent avec une config differente de celui d'`App.tsx`
- La fonction `checkProvidersHealth` n'est jamais appelee

**Correction**: Supprimer `src/components/providers/CombinedProviders.tsx` et son barrel `src/components/providers/index.ts`.

### 2b. `App.minimal.tsx` - Fichier de debug oublie

Fichier de debugging avec `console.log('App rendering...')` - jamais reference.

**Correction**: Supprimer `src/App.minimal.tsx`.

### 2c. `_setIsHelpCenterOpen` - State jamais utilise

Dans `App.tsx` ligne 170, `isHelpCenterOpen` est initialise a `false` et `_setIsHelpCenterOpen` n'est jamais appele. Le composant `HelpCenter` ne peut donc jamais s'afficher (ligne 323: `{isHelpCenterOpen && <HelpCenter />}` est toujours `false`).

**Correction**: Soit connecter le setter a un bouton/event, soit supprimer le state et le composant conditionnel.

---

## 3. Route Dupliquee (Priorite MOYENNE)

Dans `src/config/routes.ts`:
```
medMngLibrary: '/med-mng/library',      // ligne 37
medMngItemsLibrary: '/med-mng/library',  // ligne 38
```

Deux cles de route differentes pointent vers le meme chemin `/med-mng/library`, ce qui peut poser des problemes de maintenance et de navigation. L'app les monte sur deux `<Route>` distincts (lignes 260-261 d'App.tsx) ce qui signifie que seul le premier match.

**Correction**: Differencier les paths ou fusionner en une seule route.

---

## 4. Architecture du Provider Tree (Priorite BASSE)

`App.tsx` empile 10+ providers sans groupement:

```
GlobalErrorBoundary > ThemeProvider > QueryClientProvider > BrowserRouter > HelmetProvider > AuthProvider > LanguageProvider > GlobalAudioProvider > TooltipProvider > ViewportProvider > AccessibilityProvider > InternationalizationProvider > PerformanceProvider
```

**Probleme**: `HelmetProvider` est DANS `BrowserRouter`, ce qui est correct, mais l'indentation du JSX est irreguliere (mix tabs/espaces, indentation inconsistante entre les lignes 179-190). Cela rend la maintenance risquee.

**Correction**: Reformater le JSX du provider tree avec une indentation coherente. Pas de changement fonctionnel requis.

---

## 5. Fallback Suspense Duplique (Priorite BASSE)

Le meme spinner inline est copie-colle 60+ fois dans App.tsx:

```tsx
<div className="flex items-center justify-center p-8">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
</div>
```

**Correction**: Extraire un composant `PageLoader` reutilisable et une HOC `withSuspense()` pour reduire la repetition.

---

## 6. Configuration TypeScript Trop Permissive (Priorite BASSE)

`tsconfig.app.json` desactive plusieurs gardes de type:
- `strict: false` - pas de null checks, pas de strict bindings
- `noImplicitAny: false` - autorise les `any` implicites
- `noUnusedLocals: false` - ne detecte pas les variables mortes
- `noUnusedParameters: false` - ne detecte pas les params inutiles

Pour une app en production avec 295+ composants, c'est risque.

**Correction**: Pas de changement immediat (trop impactant), mais documenter comme dette technique a traiter incrementalement.

---

## 7. QueryClient Configs Divergentes (Priorite BASSE)

Trois `QueryClient` distincts avec des configs differentes:
- `App.tsx`: `retry: false`, `staleTime: 10min`, `refetchOnMount: false`
- `CombinedProviders.tsx`: retry conditionnel, `staleTime: 5min`, `refetchOnMount: 'always'`
- `App.minimal.tsx`: `retry: 1`, `staleTime: 5min`

Seul celui d'`App.tsx` est actif. Les deux autres sont du dead code.

**Correction**: Couverte par la suppression des fichiers en points 2a et 2b.

---

## Plan d'Implementation

| Ordre | Action | Fichier(s) | Risque |
|-------|--------|------------|--------|
| 1 | Deplacer deps serveur vers devDependencies | package.json | Bas |
| 2 | Supprimer CombinedProviders (dead code) | src/components/providers/CombinedProviders.tsx, index.ts | Bas |
| 3 | Supprimer App.minimal.tsx (dead code) | src/App.minimal.tsx | Nul |
| 4 | Corriger ou supprimer HelpCenter dead state | src/App.tsx | Bas |
| 5 | Extraire composant PageLoader + helper withSuspense | src/components/common/PageLoader.tsx, src/App.tsx | Bas |
| 6 | Corriger route dupliquee medMngItemsLibrary | src/config/routes.ts | Bas |
| 7 | Reformater le provider tree (indentation) | src/App.tsx | Nul |
