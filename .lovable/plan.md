

# Audit Technique Senior #3 - MED-MNG

**Date**: 6 Fevrier 2026
**Focus**: Problemes restants apres les 2 audits precedents

---

## Constat

Les 2 audits precedents ont corrige la majorite des problemes (dead code, route dupliquee, Suspense centralise). Cependant, **le probleme #1 (dependances production)** n'a PAS ete applique dans `package.json` -- les packages serveur sont toujours dans `dependencies`.

---

## 1. Dependances Serveur Toujours en Production (NON CORRIGE)

Les packages suivants sont dans `dependencies` mais ne sont **jamais importes dans `src/`** (confirme par recherche) :

| Package | Importe dans src/ ? | Action |
|---------|---------------------|--------|
| `@sentry/node` | Non | Supprimer (doublon Node.js de `@sentry/react`) |
| `express` | Non | Supprimer |
| `express-rate-limit` | Non | Supprimer |
| `helmet` | Non | Supprimer |
| `sharp` | Non | Supprimer (binaire natif, casse le build) |
| `dotenv` | Non (uniquement `src/scripts/`) | Deja en devDeps, supprimer de deps |
| `glob` | Non | Supprimer |
| `@storybook/*` (6 packages) | Non | Deja dupliques dans devDeps, supprimer de deps |

**Correction** : Retirer ces 12 packages de `dependencies` dans `package.json`. Ils sont deja dans `devDependencies` ou inutiles.

---

## 2. Route Karaoke en Dur (Priorite MOYENNE)

Dans `App.tsx` ligne 234, la route karaoke utilise un path en dur au lieu du systeme de routes centralise :

```tsx
<Route path="/karaoke/:songId?" element={<S><KaraokePage /></S>} />
```

Alors que toutes les autres routes utilisent `ROUTE_PATHS.xxx`.

**Correction** : Ajouter `karaoke: '/karaoke/:songId?'` dans `ROUTE_PATHS` et utiliser la constante dans `App.tsx`.

---

## 3. `DesignSystemDevTools` Charge en Production (Priorite MOYENNE)

Le composant `DesignSystemDevTools` (304 lignes, avec mouse tracking, overlay DOM) est monte inconditionnellement dans `App.tsx` ligne 348, y compris en production. C'est un outil de dev qui ne devrait jamais etre dans le bundle de production.

**Correction** : Conditionner le rendu au mode development uniquement :

```tsx
{import.meta.env.DEV && <DesignSystemDevTools />}
```

---

## 4. `workbox-window` Non Utilise (Priorite BASSE)

Le package `workbox-window` est dans `dependencies` mais n'est importe nulle part dans `src/`. La PWA utilise `vite-plugin-pwa` qui gere Workbox en interne.

**Correction** : Retirer `workbox-window` de `dependencies`.

---

## 5. `medMngLibrary` vs `medMngMusicLibrary` Confusion de Nommage (Priorite BASSE)

Apres le login/signup, l'app redirige vers `ROUTE_PATHS.medMngLibrary` (`/med-mng/library`), mais la route montee dans App.tsx utilise `ROUTE_PATHS.medMngMusicLibrary` (`/med-mng/music-library`) pour le composant `MedMngLibrary`. La route `/med-mng/library` n'est pas montee.

Cela signifie qu'apres login, l'utilisateur atterrit sur une page 404.

**Correction** : Ajouter une route pour `medMngLibrary` ou rediriger `medMngLibrary` vers `medMngMusicLibrary`.

---

## Plan d'Implementation

| Ordre | Action | Fichier(s) | Risque |
|-------|--------|------------|--------|
| 1 | Retirer 13 packages serveur/inutiles de dependencies | package.json | Bas |
| 2 | Ajouter route medMngLibrary (fix redirection post-login 404) | App.tsx | Critique |
| 3 | Ajouter karaoke dans ROUTE_PATHS + utiliser la constante | routes.ts, App.tsx | Nul |
| 4 | Conditionner DesignSystemDevTools au mode DEV | App.tsx | Nul |
| 5 | Retirer workbox-window des dependencies | package.json | Nul |

