

# Audit Complet 3 Phases - MED-MNG (v2)
**Date**: 6 Fevrier 2026
**Contexte**: Audit post-corrections des audits precedents. Focus sur les problemes restants.

---

## Phase 1 : Audit Technique (Dev Senior)

### 1.1 Remaining `medMngLibrary` redirections (IMPORTANT)

Trois fichiers utilisent encore `ROUTE_PATHS.medMngLibrary` (qui est une redirection vers `medMngMusicLibrary`), causant un double-redirect inutile :

- **`MainNavigation.tsx` ligne 244** : "Ma Bibliotheque" dans le dropdown utilisateur pointe vers `medMngLibrary`
- **`MedMngSubscribe.tsx` ligne 64** : Apres souscription reussie, `navigate(medMngLibrary)` + ligne 69 un URL en dur `/med-mng/library`
- **`QuickActions.tsx` ligne 199** : Bouton "Ma bibliotheque" pointe vers `medMngLibrary`
- **`navigation.ts` ligne 66** : `USER_NAV_ITEMS` liste `medMngLibrary`

**Correction** : Remplacer par `medMngMusicLibrary` dans ces 4 fichiers (5 occurrences).

### 1.2 URL en dur dans MedMngSubscribe (IMPORTANT)

`MedMngSubscribe.tsx` ligne 69 contient une URL en dur : `successUrl: '${window.location.origin}/med-mng/library'`. Cela devrait utiliser `ROUTE_PATHS.medMngMusicLibrary` pour rester coherent si les routes changent.

**Correction** : Remplacer l'URL en dur par `${window.location.origin}${ROUTE_PATHS.medMngMusicLibrary}`.

### 1.3 `_musicStyle` naming convention (BAS)

Dans `AntiAnxietyOnboarding.tsx` ligne 37, la variable d'etat est nommee `_musicStyle` avec un underscore prefixe (convention pour "inutilise"), mais elle est effectivement utilisee (ligne 60). Le renommage en `musicStyle` serait plus correct.

**Correction** : Renommer `_musicStyle` en `musicStyle` et ajuster toutes les references.

### 1.4 `AppleFinalCTA.tsx` importe `Headphones` et `Play` mais n'utilise plus `Play` dans les boutons principaux apres le dernier audit (BAS)

Apres les corrections precedentes, le bouton principal utilise `Play` donc c'est correct. Cependant, le bouton secondaire "Ou ecoute d'abord un extrait" (ligne 100-107) pointe toujours vers `/generator` qui n'a pas de contenu audio pre-genere.

**Correction** : Changer le lien secondaire vers `ROUTE_PATHS.ednComplete` et le texte en "Ou explore les items EDN d'abord".

---

## Phase 2 : Audit UX (Designer Senior)

### 2.1 Footer masque par la MobileBottomNav (MOYEN)

Le composant `MobileBottomNav.tsx` ajoute un spacer `<div className="h-20 md:hidden" />` (ligne 63) mais ce spacer est rendu AVANT le footer dans le DOM puisqu'il fait partie du composant bottom nav, pas du contenu principal. Le footer (`AppFooter`) n'a pas de `padding-bottom` supplementaire, donc ses derniers liens sont coupes par la bottom nav sur mobile.

**Correction** : Ajouter `pb-24 md:pb-0` au footer dans `AppFooter.tsx` pour garantir que tout le contenu est visible au-dessus de la bottom nav mobile.

### 2.2 Page Login trop longue verticalement sur mobile (BAS)

La page de login affiche 3 boutons OAuth (Google, Facebook, Apple) + formulaire + "Mot de passe oublie" + "Creer un compte". Sur un petit ecran, le contenu depasse la viewport sans indication de scroll.

**Correction** : Ajouter `overflow-y-auto` et `max-h-[90vh]` a la Card du login pour garantir l'accessibilite scroll.

### 2.3 Onboarding action step navigue vers home (BAS)

Dans `AntiAnxietyOnboarding.tsx` ligne 80, apres "Generer ma premiere musique", l'utilisateur est redirige vers `ROUTE_PATHS.home` -- la page d'accueil. Le CTA promet une generation musicale mais ne mene pas a la page de generation.

**Correction** : Changer la navigation vers `ROUTE_PATHS.generator` pour tenir la promesse du bouton.

---

## Phase 3 : Audit Utilisateur Final (Beta Testeur)

### 3.1 "Ou ecoute d'abord un extrait" dans le CTA final est trompeur (MOYEN)

Le lien secondaire du CTA final (`AppleFinalCTA.tsx` ligne 100-107) dit "Ou ecoute d'abord un extrait" et mene a `/generator`. Le generateur ne contient aucun extrait pre-cree. L'utilisateur arrive sur une page de configuration sans rien a ecouter.

**Resolution** : Renommer en "Ou explore les items EDN" et pointer vers `/edn-complete`.

### 3.2 Dropdown "Ma Bibliotheque" fait un double-redirect (BAS)

En tant qu'utilisateur connecte, je clique "Ma Bibliotheque" dans le menu profil. Je vois un flash de chargement car la page passe par `/med-mng/library` puis redirige vers `/med-mng/music-library`.

**Resolution** : Corriger le lien dans MainNavigation (deja couvert par le point 1.1 technique).

---

## Plan d'Implementation

| Ordre | Phase | Correction | Fichier(s) | Impact |
|-------|-------|-----------|------------|--------|
| 1 | P1 | Remplacer medMngLibrary par medMngMusicLibrary dans 4 fichiers | MainNavigation.tsx, MedMngSubscribe.tsx, QuickActions.tsx, navigation.ts | Important |
| 2 | P1 | URL en dur dans MedMngSubscribe successUrl | MedMngSubscribe.tsx | Important |
| 3 | P2 | Footer pb-24 pour mobile bottom nav | AppFooter.tsx | Moyen |
| 4 | P2+P3 | CTA Final lien secondaire vers ednComplete | AppleFinalCTA.tsx | Moyen |
| 5 | P2 | Onboarding action step vers generator au lieu de home | AntiAnxietyOnboarding.tsx | Bas |
| 6 | P1 | Renommer _musicStyle en musicStyle | AntiAnxietyOnboarding.tsx | Bas |

