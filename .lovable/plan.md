

# Audit Complet 3 Phases - MED-MNG
**Date**: 6 Fevrier 2026

---

## Phase 1 : Audit Technique (Dev Senior)

### 1.1 Redirections OAuth/Signup vers route obsolete (CRITIQUE)

**Probleme** : Dans `AuthProvider.tsx`, les 4 redirections post-authentification (signUp emailRedirectTo, signInWithGoogle, signInWithFacebook, signInWithApple) pointent vers `/med-mng/library` (lignes 153, 180, 194, 208). Or dans `App.tsx` ligne 279, cette route est un `<Navigate>` vers `/med-mng/music-library`. L'utilisateur subit un double redirect apres login OAuth.

De plus, dans `MedMngLogin.tsx` ligne 49 et `MedMngSignup.tsx` ligne 32, la redirection post-login pointe aussi vers `medMngLibrary` (qui redirige).

**Correction** : Remplacer toutes les occurrences de `/med-mng/library` par `/med-mng/music-library` dans AuthProvider, MedMngLogin et MedMngSignup.

**Fichiers** : `AuthProvider.tsx` (4 endroits), `MedMngLogin.tsx`, `MedMngSignup.tsx`

### 1.2 HelpButton ouvre des routes inexistantes (IMPORTANT)

**Probleme** : `HelpButton.tsx` appelle `window.open('/help', '_blank')` et `window.open('/tutorials', '_blank')`. Ces routes n'existent pas dans `routes.ts` ni dans `App.tsx`. L'utilisateur tombe sur une page 404 dans un nouvel onglet.

**Correction** : Remplacer par des routes existantes ou des liens vers la documentation, ou desactiver les boutons avec un toast "Bientot disponible".

**Fichier** : `src/components/onboarding/HelpButton.tsx`

### 1.3 QueryClient `retry: false` en production (MOYEN)

**Probleme** : Le QueryClient dans `App.tsx` (ligne 157) a `retry: false`. En production, une requete reseau qui echoue a cause d'un timeout momentane ne sera jamais retentee. Cela cause des pages vides inutiles.

**Correction** : Mettre `retry: 1` (ou `retry: (count, error) => count < 2 && error?.status >= 500`) pour retenter une fois sur erreur serveur.

**Fichier** : `App.tsx`

### 1.4 `refetchOnMount: false` empeche les donnees fraiches (MOYEN)

**Probleme** : `refetchOnMount: false` dans le QueryClient (ligne 163) signifie que naviguer vers une page deja visitee ne rafraichit jamais les donnees. Si un utilisateur cree du contenu puis revient a une liste, la liste reste obsolete.

**Correction** : Changer en `refetchOnMount: 'always'` ou supprimer cette option (le `staleTime` de 10 min protege deja contre les refetch excessifs).

**Fichier** : `App.tsx`

### 1.5 Onboarding fait un upsert sur une table potentiellement inexistante (BAS)

**Probleme** : Dans `AntiAnxietyOnboarding.tsx` ligne 68 et `Index.tsx` ligne 54, le code fait un upsert/select sur `user_onboarding` avec un cast `(supabase as any)` dans le onboarding. Ce `as any` masque les erreurs TypeScript et pourrait indiquer que la table n'est pas dans les types generes.

**Correction** : Verifier que `user_onboarding` est dans les types Supabase generes. Si oui, retirer le `as any`. Si non, ajouter la table aux types.

**Fichiers** : `AntiAnxietyOnboarding.tsx`, `Index.tsx`

### 1.6 Pas de route `/med-mng/reset-password` (BAS)

**Probleme** : `AuthProvider.tsx` ligne 221 definit `redirectTo` vers `/med-mng/reset-password` pour le reset de mot de passe, mais cette route n'existe pas dans `routes.ts` ni `App.tsx`. L'utilisateur qui clique le lien de reset dans son email arrive sur une 404.

**Correction** : Ajouter une page/route `/med-mng/reset-password` ou rediriger vers le login avec un parametre.

**Fichiers** : `routes.ts`, `App.tsx`, nouveau fichier page potentiel

---

## Phase 2 : Audit UX (Designer Senior)

### 2.1 CTA Hero "Commencer gratuitement" mene vers une page protegee (CRITIQUE)

**Probleme** : Le bouton principal du Hero (`AppleHero.tsx` ligne 113) navigue vers `medMngItemsLibrary`, qui est une route `<ProtectedRoute>` (ligne 281 de App.tsx). Un visiteur non connecte clique sur "Commencer gratuitement" et se retrouve redirige vers la page de login sans explication. C'est la premiere interaction du visiteur avec le produit : elle doit etre fluide.

**Correction** : Changer le CTA pour pointer vers la page EDN publique (`ednComplete`) ou la page de signup. Ou rendre `medMngItemsLibrary` partiellement accessible aux visiteurs.

**Fichier** : `src/components/home/AppleHero.tsx`

### 2.2 Second CTA Hero "Ecouter un extrait" mene a une page vide sans contenu audio (IMPORTANT)

**Probleme** : Le bouton "Ecouter un extrait" navigue vers `/generator` qui est la page de generation de musique IA. Il n'y a rien a "ecouter" directement -- l'utilisateur doit generer du contenu d'abord. La promesse du bouton est en decalage avec la realite.

**Correction** : Renommer le bouton "Generer une musique" ou pointer vers une page avec du contenu audio de demonstration pre-genere.

**Fichier** : `src/components/home/AppleHero.tsx`

### 2.3 CTA Final "Commencer maintenant" mene aussi vers une page protegee (IMPORTANT)

**Probleme** : Le bouton final (`AppleFinalCTA.tsx` ligne 85) pointe egalement vers `medMngItemsLibrary` (protege). Meme probleme que le Hero.

**Correction** : Pointer vers la page signup ou ednComplete.

**Fichier** : `src/components/home/AppleFinalCTA.tsx`

### 2.4 HelpButton chevauche la bottom nav mobile (MOYEN)

**Probleme** : Le `HelpButton` est positionne `fixed bottom-6 right-6 z-50`. La `MobileBottomNav` est `fixed bottom-0 z-50`. Sur mobile, le bouton d'aide flotte au-dessus de la bottom nav, mais son z-index egal et sa proximite creent un risque de chevauchement visuel, surtout avec la barre de gamification.

**Correction** : Masquer le HelpButton sur mobile (`hidden md:flex`) puisque le menu mobile a deja des options d'aide, ou le remonter au-dessus de la bottom nav.

**Fichier** : `src/components/onboarding/HelpButton.tsx`

### 2.5 Page EDN sticky header avec z-40 conflicte avec le header principal (BAS)

**Probleme** : La page `EdnComplete.tsx` (ligne 332) a un header sticky avec `z-40` et `sticky top-0`. Or le header principal `MainNavigation` est aussi `sticky top-0 z-50`. Le header EDN passe SOUS le header principal quand on scroll, ce qui est correct, mais le `top-0` fait qu'il se cache derriere la nav au lieu d'etre visible en dessous.

**Correction** : Changer le `top-0` du header EDN en `top-16` (hauteur de la nav principale) pour qu'il colle juste sous la navbar.

**Fichier** : `src/pages/EdnComplete.tsx`

---

## Phase 3 : Audit Utilisateur Final (Beta Testeur)

### 3.1 "Commencer gratuitement" demande un login : contradiction (CRITIQUE)

En tant que visiteur, je vois "Commencer gratuitement" et "Aucune carte requise". Je clique et je suis redirige vers un formulaire de connexion. C'est trompeur. Je ne comprends pas pourquoi je dois me connecter si c'est "gratuit et instantane".

**Resolution** : Pointer les CTA vers le contenu EDN public (deja accessible sans login) au lieu de la bibliotheque protegee. Ou ajouter une etape intermediaire qui explique la creation de compte avant de rediriger.

### 3.2 Les boutons d'aide ouvrent des pages vides (IMPORTANT)

Je clique "Centre d'aide" ou "Videos tutorielles" dans le bouton d'aide -- un nouvel onglet s'ouvre sur une page 404 "Page introuvable". C'est decevant et donne une impression de produit inacheve.

**Resolution** : Soit creer les pages `/help` et `/tutorials`, soit remplacer par un toast "Bientot disponible" ou un lien mailto.

### 3.3 Apres inscription, le message dit "Verifiez votre email" mais pas de lien de renvoi (MOYEN)

Apres le signup reussi, je vois "Verifiez votre email" avec un seul bouton "Retour a la connexion". Mais si je n'ai pas recu l'email ? Il n'y a aucun bouton "Renvoyer l'email de verification".

**Resolution** : Ajouter un bouton "Renvoyer l'email" sur la page de succes d'inscription.

### 3.4 Mot de passe oublie : flux casse (MOYEN)

La page login n'a pas de lien "Mot de passe oublie" visible. La fonctionnalite `resetPassword` existe dans AuthProvider mais n'est pas exposee dans l'interface utilisateur. Et meme si elle l'etait, la redirection pointe vers `/med-mng/reset-password` qui n'existe pas.

**Resolution** : Ajouter un lien "Mot de passe oublie ?" sur la page login, creer la page de reset, ou utiliser le formulaire de login comme fallback.

### 3.5 Le footer sur mobile est coupe par la bottom nav (BAS)

Le footer apparait normalement, mais les derniers liens sont caches derriere la bottom nav mobile. Il faut scroller tres loin pour voir les mentions legales.

**Resolution** : S'assurer que le spacer `h-20` de la MobileBottomNav s'applique correctement au-dessus du footer.

---

## Plan d'Implementation

| Ordre | Phase | Correction | Fichier(s) | Impact |
|-------|-------|-----------|------------|--------|
| 1 | P2+P3 | CTA Hero : pointer vers ednComplete au lieu de medMngItemsLibrary | AppleHero.tsx | Critique - premiere impression |
| 2 | P2 | CTA Final : pointer vers signup au lieu de medMngItemsLibrary | AppleFinalCTA.tsx | Important - conversion |
| 3 | P1 | OAuth/Signup redirects : /med-mng/library vers /med-mng/music-library | AuthProvider.tsx, MedMngLogin.tsx, MedMngSignup.tsx | Critique - double redirect |
| 4 | P1+P3 | HelpButton : remplacer /help et /tutorials par toast "bientot" | HelpButton.tsx | Important - 404 evitees |
| 5 | P1 | QueryClient retry:1 et refetchOnMount par defaut | App.tsx | Moyen - resilience reseau |
| 6 | P2 | HelpButton masque sur mobile | HelpButton.tsx | Moyen - chevauchement |
| 7 | P2 | Header EDN sticky top-16 | EdnComplete.tsx | Bas - alignement visuel |
| 8 | P3 | Lien "Mot de passe oublie" sur login | MedMngLogin.tsx | Moyen - flux utilisateur |
| 9 | P3 | Bouton "Renvoyer email" sur page succes signup | MedMngSignup.tsx | Moyen - flux utilisateur |
| 10 | P1 | Route /med-mng/reset-password manquante | routes.ts, App.tsx | Bas - flux reset password |
| 11 | P1 | Retirer `as any` sur user_onboarding | AntiAnxietyOnboarding.tsx | Bas - typage |

