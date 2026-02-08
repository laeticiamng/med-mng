
# Audit Beta-Testeur : Creation de Compte

## Resultats des tests live

### Tests effectues

| Test | Resultat | Probleme |
|------|----------|----------|
| Chargement page `/med-mng/signup` | OK | - |
| Validation consentements (sans cocher) | OK | Erreur affichee correctement |
| Scroll auto vers consentements | OK | UX fluide |
| OAuth Google | OK | Redirige vers Google login |
| OAuth Facebook | Non teste (config requise) | Probablement non configure |
| OAuth Apple | Non teste (config requise) | Probablement non configure |
| Inscription email (BDD) | OK | Des utilisateurs s'inscrivent avec succes |
| Email confirmation | Desactive (auto-confirm) | - |

### Utilisateurs en base

8 utilisateurs existants dont 2 recents (7 et 8 fevrier 2026). Les inscriptions email **fonctionnent techniquement**.

---

## Problemes identifies

### P0 - Message post-inscription trompeur (BLOQUANT UX)

**Le probleme principal** : apres une inscription reussie, la page affiche :
- "Compte cree !"
- "Verifiez votre email pour confirmer votre compte"
- Bouton "Retour a la connexion"
- Bouton "Renvoyer l'email de verification"

**Or, la confirmation email est DESACTIVEE** dans Supabase (auto-confirm actif). Le compte est immediatement utilisable, mais l'utilisateur pense qu'il doit attendre un email qui n'arrivera jamais.

**Impact** : L'utilisateur cree son compte, voit "Verifiez votre email", attend un email, ne le recoit jamais, et conclut que "la creation de compte ne fonctionne pas".

**Correction** : Remplacer le message de succes par une redirection automatique vers `/med-mng/music-library` ou la page de connexion avec un toast "Compte cree avec succes ! Connectez-vous."

### P1 - Nom non sauvegarde dans les metadonnees

Tous les utilisateurs recents ont `name: null` dans `raw_user_meta_data`. Le signup envoie bien `data: { name }` mais le champ semble ne pas etre stocke. Verification : les 2 derniers users (testbeta2026@yopmail.com et maugervictorine@yahoo.fr) ont `name: nil`.

**Correction** : Verifier que `user_metadata.name` est bien le bon champ et non `full_name`, et/ou creer un profil dans la table `profiles` apres inscription.

### P2 - OAuth Facebook et Apple probablement non configures

Les boutons Facebook et Apple sont affiches mais ces providers ne sont probablement pas configures dans Supabase. Un clic generera une erreur pour l'utilisateur.

**Correction** : Soit configurer les providers dans Supabase Dashboard > Authentication > Providers, soit masquer les boutons non configures.

### P3 - Pas de validation de force du mot de passe

Aucune indication de la longueur minimale requise (6 caracteres par defaut Supabase). Un mot de passe trop court generera une erreur Supabase cryptique.

**Correction** : Ajouter une validation cote frontend avec un message clair sur les exigences.

---

## Plan de corrections

### Correction 1 : Fixer le flow post-inscription (P0)

**Fichier** : `src/pages/MedMngSignup.tsx`

Puisque l'email auto-confirm est actif :
- Supprimer l'ecran "Verifiez votre email"
- Apres `signUp` reussi, rediriger automatiquement vers la page de connexion avec un toast de succes
- Ou mieux : puisque auto-confirm est actif, connecter automatiquement l'utilisateur et rediriger vers `/med-mng/music-library`

Concretement :
1. Apres `signUp` reussi (pas d'erreur), appeler `signIn(email, password)` immediatement
2. Si le signIn reussit, la redirection vers music-library se fait automatiquement (via le `if (user) return Navigate`)
3. Si le signIn echoue (cas rare), afficher un toast "Compte cree ! Connectez-vous" et rediriger vers login

### Correction 2 : Sauvegarder le nom dans le profil (P1)

**Fichier** : `src/components/med-mng/AuthProvider.tsx`

Dans le handler `onAuthStateChange`, quand `event === 'SIGNED_IN'` et que c'est un nouvel utilisateur, inserer/upsert dans la table `profiles` avec le nom depuis `user_metadata.name`.

### Correction 3 : Masquer les boutons OAuth non configures (P2)

**Fichier** : `src/pages/MedMngSignup.tsx` et `src/pages/MedMngLogin.tsx`

Retirer les boutons Facebook et Apple, ou les marquer "Bientot disponible", en attendant que les providers soient configures dans Supabase.

### Correction 4 : Validation mot de passe (P3)

**Fichier** : `src/pages/MedMngSignup.tsx`

Ajouter une validation frontend : minimum 6 caracteres, afficher un message d'aide sous le champ.

---

## Ordre d'implementation

1. **P0** - Fixer le message post-inscription (impact direct sur les plaintes utilisateurs)
2. **P2** - Retirer Facebook/Apple (eviter les erreurs)
3. **P3** - Validation mot de passe (prevenir les erreurs cryptiques)
4. **P1** - Sauvegarde du nom (amelioration)
