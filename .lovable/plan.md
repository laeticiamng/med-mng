

# Audit Technique Senior #4 - MED-MNG

**Date**: 6 Fevrier 2026
**Focus**: Le probleme critique non resolu (dependencies package.json) + nettoyages restants

---

## Constat Principal

Les 3 audits precedents ont identifie et corrige de nombreux problemes (dead code, route dupliquee, Suspense centralise, DevTools conditionne, karaoke centralise, redirection post-login). Cependant, **le probleme #1 des 3 audits -- le nettoyage de `package.json` -- n'a jamais ete effectivement applique**. Les 13 packages serveur/inutiles sont toujours dans `dependencies`.

---

## 1. Nettoyage package.json (CRITIQUE - 3x identifie, 0x corrige)

Les packages suivants dans `dependencies` ne sont **jamais importes dans `src/`** (confirme par recherche grep) :

| Package | Confirme absent de src/ | Action |
|---------|------------------------|--------|
| `@sentry/node` | Oui | Supprimer |
| `express` | Oui | Supprimer |
| `express-rate-limit` | Oui | Supprimer |
| `helmet` | Oui | Supprimer |
| `sharp` | Oui | Supprimer |
| `dotenv` | Uniquement dans `src/scripts/` (pas le bundle) | Supprimer de deps |
| `glob` | Oui | Supprimer |
| `workbox-window` | Oui | Supprimer |
| `@storybook/addon-a11y` | Deja en devDeps | Supprimer de deps |
| `@storybook/addon-essentials` | Deja en devDeps | Supprimer de deps |
| `@storybook/addon-interactions` | Deja en devDeps | Supprimer de deps |
| `@storybook/addon-links` | Deja en devDeps | Supprimer de deps |
| `@storybook/react` | Deja en devDeps | Supprimer de deps |
| `@storybook/react-vite` | Deja en devDeps | Supprimer de deps |
| `@storybook/test` | Deja en devDeps | Supprimer de deps |

De plus, `vite-plugin-pwa` est un plugin Vite (build-time only) et devrait etre dans `devDependencies`.

**Correction** : Supprimer ces 16 lignes de `dependencies` dans `package.json`.

---

## 2. Script `start:server` orphelin (BASSE)

`package.json` contient le script `"start:server": "node --loader ts-node/esm src/index.ts"` mais il n'y a pas de fichier `src/index.ts` correspondant a un serveur Express (l'app est un SPA Vite). C'est un artéfact du moment ou `express` etait dans les deps.

**Correction** : Supprimer le script `start:server` de `package.json`.

---

## 3. Bouton Notification flottant en dur (BASSE)

Dans `App.tsx` lignes 337-345, un bouton "Notifications" est monte en `fixed bottom-4 right-4` directement dans le composant racine. Ce bouton devrait faire partie du composant `NotificationSystem` ou de la navigation, pas du layout global.

Ce n'est pas un bug mais une impurete architecturale. Pas de correction dans cet audit -- documentee pour reference.

---

## Plan d'Implementation

| Ordre | Action | Fichier | Risque |
|-------|--------|---------|--------|
| 1 | Supprimer 16 packages inutiles/dupliques de dependencies | package.json | Bas |
| 2 | Supprimer le script `start:server` orphelin | package.json | Nul |

**Impact** : Bundle plus leger, zero regression fonctionnelle (aucun de ces packages n'est importe dans le code source).

