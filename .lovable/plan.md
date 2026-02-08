

# Audit Utilisateur - Creation de Compte et Utilisation de la Plateforme

## Resume executif

J'ai simule le parcours complet d'un nouvel utilisateur : inscription, connexion, navigation sur la plateforme. Voici les resultats.

---

## 1. Creation de compte - Test en conditions reelles

| Etape | Resultat | Commentaire |
|-------|----------|-------------|
| Affichage page inscription | OK | Page claire, champs visibles |
| Remplir nom, email, mot de passe | OK | Saisie fluide |
| Indication "min 6 caracteres" | OK | Visible sous le champ mot de passe |
| Cases de consentement RGPD | OK | 2 cases obligatoires, claires |
| Bouton "Creer le compte" | OK | Actif apres les consentements |
| Redirection apres inscription | OK | Redirige vers la bibliotheque musicale |
| Message de bienvenue | OK | Toast "Bienvenue sur MED-MNG !" affiche |
| Boutons OAuth | OK | Seul Google visible (Facebook/Apple retires) |

**Verdict inscription : 10/10** - Le flow corrige fonctionne parfaitement. Plus de message "Verifiez votre email" trompeur.

---

## 2. Probleme residuel : le nom n'est pas sauvegarde (P1 non resolu)

**Constat** : Les 2 derniers utilisateurs inscrits ont `name: null` dans la table `profiles`, alors que leur nom est bien present dans les metadonnees Supabase (`full_name: "Test Beta"`, `full_name: "MAUGER"`).

**Cause racine identifiee** : Il existe **2 triggers concurrents** sur `auth.users` qui creent le profil :
- `on_auth_user_created` : insere `(id, email)` SANS le nom, avec `ON CONFLICT DO NOTHING`
- `on_auth_user_created_profiles` : essaie d'inserer `(id, name, avatar_url)` AVEC le nom, mais comme le profil existe deja (cree par le 1er trigger), l'insert est **ignore silencieusement**

Le code AuthProvider fait bien un `upsert` apres connexion pour corriger le nom, mais il semble ne pas s'executer a temps (race condition avec le `setTimeout`).

**Correction requise** :
1. Supprimer le trigger `on_auth_user_created` (celui qui n'insere pas le nom) OU le modifier pour inclure le nom
2. Garder uniquement `on_auth_user_created_profiles` qui gere correctement le nom
3. Renforcer l'upsert AuthProvider en retirant le `setTimeout` pour garantir l'execution

---

## 3. Navigation plateforme apres inscription

| Page | Resultat | Experience utilisateur |
|------|----------|----------------------|
| Bibliotheque musicale (`/med-mng/music-library`) | OK | Contenu affiche, navigation claire |
| Creer une chanson (`/med-mng/create`) | OK | Formulaire de generation visible |
| Items EDN (`/edn-complete`) | OK | 367 items charges avec filtres |
| Tableau de bord progression (`/progress-dashboard`) | OK | Stats, heatmap, badges visibles |
| Flashcards (`/flashcards`) | OK | Interface de creation de decks |
| Mode examen (`/exam-mode`) | OK | Parametres d'examen accessibles |
| Tarifs (`/med-mng/pricing`) | OK | 3 plans affiches clairement |
| Page de connexion (`/med-mng/login`) | OK | Google seul, "Mot de passe oublie" present |

**Verdict navigation : 10/10** - Toutes les pages principales sont accessibles et fonctionnelles.

---

## 4. Securite et UX de la page de connexion

| Fonctionnalite | Statut |
|----------------|--------|
| Rate limiting (anti-brute force) | OK - Bloque apres trop de tentatives |
| Message d'erreur clair | OK |
| Lien "Mot de passe oublie" | OK |
| Lien "Creer un compte" | OK |
| Redirection si deja connecte | OK |

---

## 5. Point de code mineur a nettoyer

La page de connexion (`MedMngLogin.tsx` ligne 16) importe encore `signInWithFacebook` et `signInWithApple` meme si les boutons ont ete retires. Ce n'est pas bloquant mais c'est du code mort.

---

## Score global

| Categorie | Score |
|-----------|-------|
| Inscription | 10/10 |
| Connexion | 10/10 |
| Navigation post-inscription | 10/10 |
| Sauvegarde du nom | 5/10 (bug trigger) |
| **Total** | **35/40** |

---

## Corrections a implementer

### Correction 1 : Fixer la sauvegarde du nom (prioritaire)

**Probleme** : Deux triggers SQL concurrents empechent le nom d'etre sauvegarde.

**Actions** :
- Supprimer le trigger `on_auth_user_created` (celui sans nom) via SQL
- Garder `on_auth_user_created_profiles` qui insere correctement le nom
- Dans `AuthProvider.tsx`, retirer le `setTimeout` autour de l'upsert profil pour garantir son execution immediate

### Correction 2 : Nettoyer les imports morts (mineur)

**Actions** :
- Retirer `signInWithFacebook` et `signInWithApple` de la destructuration dans `MedMngLogin.tsx` ligne 16

