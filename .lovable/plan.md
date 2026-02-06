

# Audit UX Senior - MED-MNG
**Date**: 6 Fevrier 2026

---

## Synthese des Problemes Identifies

Apres inspection visuelle de toutes les pages principales (Home, EDN, ECOS, Chat, Pricing, Login, Generator, Items Library) et analyse du code des composants de navigation, layout et onboarding.

---

## 1. Bouton "Notifications" Flottant en Conflit avec le Cookie Banner (CRITIQUE)

**Probleme**: Dans `App.tsx` (lignes 337-345), un bouton "Notifications" est fixe en `fixed bottom-4 right-4 z-40` avec un `my-[36px]` arbitraire. Il chevauche visuellement :
- Le cookie banner (`fixed bottom-4 right-4 z-[100]`)
- La bottom nav mobile (`fixed bottom-0 z-50`)
- Le bouton HelpButton

**Impact UX**: Superposition de 3 elements flottants dans le meme coin, clics accidentels, confusion visuelle.

**Correction**: Supprimer ce bouton flottant orphelin. La navigation desktop a deja une icone Bell dans `MainNavigation.tsx` (ligne 216-223) qui fait exactement la meme chose visuellement mais ne declenche rien. Connecter cette icone Bell au `NotificationSystem` et supprimer le bouton flottant.

**Fichiers**: `App.tsx`, `MainNavigation.tsx`

---

## 2. Cookie Banner Chevauche la Bottom Nav Mobile (IMPORTANT)

**Probleme**: Le cookie banner utilise `fixed bottom-4 left-4 right-4` (ligne 91 de CookieBanner.tsx). Sur mobile, la MobileBottomNav est `fixed bottom-0`. Le banner recouvre partiellement la navigation, bloquant l'acces aux boutons.

**Correction**: Ajouter une classe `md:bottom-4 bottom-20` au cookie banner pour le positionner au-dessus de la bottom nav sur mobile.

**Fichier**: `src/components/common/CookieBanner.tsx`

---

## 3. Double Navigation Bell - Icone Inactive (IMPORTANT)

**Probleme**: Le bouton Bell dans `MainNavigation.tsx` (lignes 216-223) n'a aucun `onClick` handler. C'est un bouton decoratif qui ne fait rien au clic. L'utilisateur voit une icone cloche, clique, et rien ne se passe.

**Correction**: Remonter le state `isNotificationCenterOpen` via props ou context pour connecter le Bell de la nav au `NotificationSystem`.

**Fichier**: `MainNavigation.tsx`, `App.tsx`

---

## 4. MobileBottomNav Pointe vers une Route Redirigee (MOYEN)

**Probleme**: Le lien "Bibliotheque" dans la bottom nav (ligne 23) pointe vers `ROUTE_PATHS.medMngLibrary` (`/med-mng/library`), qui est une redirection vers `/med-mng/music-library`. Cela provoque un flash de navigation (redirection visible) et le lien n'est jamais considere "actif" par le router car le pathname final est different.

**Correction**: Changer `navItems[1].to` pour pointer directement vers `ROUTE_PATHS.medMngMusicLibrary`.

**Fichier**: `src/components/navigation/MobileBottomNav.tsx`

---

## 5. Player Demo Home - Bouton Play Desactive sans Explication Claire (MOYEN)

**Probleme**: Dans `AppleMusicPlayer.tsx`, le bouton Play principal est `disabled={isDemoMode}` avec un simple `title` tooltip. Le titre n'est visible qu'au hover (pas tactile). L'utilisateur mobile ne comprend pas pourquoi le bouton est grise.

**Correction**: Ajouter un texte visible sous les controles : "Creez un compte pour ecouter" avec un lien vers l'inscription, au lieu de s'appuyer uniquement sur un tooltip.

**Fichier**: `src/components/home/AppleMusicPlayer.tsx`

---

## 6. Boutons de Controle (Skip, Repeat, Volume) Non Fonctionnels en Mode Demo (BAS)

**Probleme**: Seul le bouton Play est desactive dans le player demo. Les boutons SkipBack, SkipForward, Repeat et Volume sont cliquables mais ne font rien. Cela cree une fausse affordance.

**Correction**: Desactiver egalement ces boutons ou les griser visuellement en mode demo.

**Fichier**: `src/components/home/AppleMusicPlayer.tsx`

---

## 7. Footer Trop Dense - Liens vers des Pages Auth-Protected sans Indication (BAS)

**Probleme**: Le footer contient des liens vers Flashcards, Revision espacee, Cas cliniques, Mode examen, etc. qui necessitent tous une authentification. Un visiteur non connecte qui clique est redirige vers le login sans comprendre pourquoi.

**Correction**: Ajouter un petit indicateur visuel (icone cadenas ou badge "Pro") a cote des liens qui necessitent un compte.

**Fichier**: `src/components/layout/AppFooter.tsx`

---

## 8. Onboarding Saute l'Etape Action (BAS)

**Probleme**: Dans `AntiAnxietyOnboarding.tsx`, apres la selection du style musical (step 2), `onComplete()` est appele immediatement (ligne 48) sans passer par le step `action`. L'etape `action` (qui offre des boutons d'orientation vers EDN/ECOS/Chat) n'est jamais montree.

**Correction**: Passer par le step `action` avant de fermer, ou supprimer le step inutilise.

**Fichier**: `src/components/onboarding/AntiAnxietyOnboarding.tsx`

---

## Plan d'Implementation

| Ordre | Correction | Fichier(s) | Impact |
|-------|-----------|------------|--------|
| 1 | Supprimer bouton Notifications flottant orphelin | App.tsx | Critique - elimine chevauchement |
| 2 | Connecter Bell de la nav au NotificationSystem | MainNavigation.tsx, App.tsx | Important - repare bouton inactif |
| 3 | Cookie banner au-dessus de la bottom nav mobile | CookieBanner.tsx | Important - debloque navigation mobile |
| 4 | Bottom nav pointe vers la route finale (pas la redirection) | MobileBottomNav.tsx | Moyen - supprime flash de redirection |
| 5 | Player demo : texte visible pour CTA inscription | AppleMusicPlayer.tsx | Moyen - guide l'utilisateur |
| 6 | Desactiver tous les controles du player en mode demo | AppleMusicPlayer.tsx | Bas - coherence UI |
| 7 | Indicateurs visuels sur liens auth-protected du footer | AppFooter.tsx | Bas - transparence |
| 8 | Corriger le flux onboarding (step action manquant) | AntiAnxietyOnboarding.tsx | Bas - parcours complet |

