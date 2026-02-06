
# Corrections Pre-Publication : CTA Inscription + Verification Signup

## Probleme 1 : CTA "Creer un compte" pas assez visible

**Constat :** Le bouton "Creer un compte gratuit" dans le hero utilise `variant="outline"` (simple bordure), ce qui le rend visuellement secondaire par rapport au bouton principal "Decouvrir les items EDN".

**Correction :**
- Transformer le CTA "Creer un compte gratuit" en bouton **principal** avec un gradient accrocheur et une ombre
- Inverser la hierarchie : l'inscription devient le CTA principal, la decouverte EDN devient secondaire
- Ajouter un badge "Gratuit" ou une animation subtile pour attirer l'oeil

**Fichier concerne :** `src/components/home/AppleHero.tsx` (lignes 110-127)

Changements prevus :
- Le bouton "Creer un compte gratuit" recoit le style gradient principal (bg-gradient, shadow, hover:scale)
- Le bouton "Decouvrir les items EDN" passe en variant outline
- Optionnel : ajout d'un sous-texte "100% gratuit - Sans carte bancaire" sous les boutons pour rassurer

---

## Probleme 2 : Erreur base de donnees au signup

**Constat apres test reel :** Le flux d'inscription a ete teste de bout en bout via le navigateur. Le formulaire fonctionne correctement et le trigger `handle_new_user` insere bien le profil dans la table `profiles`. **Aucune erreur DB n'a ete reproduite.**

Les erreurs visibles dans les logs Postgres (`column mood_entries.valence does not exist`, `column user_preferences.preferred_activities does not exist`) proviennent d'autres requetes executees apres la connexion, pas du processus d'inscription lui-meme.

**Correction preventive :** Corriger les 2 requetes qui referent a des colonnes inexistantes pour eliminer ces erreurs post-connexion qui pourraient etre confondues avec un echec d'inscription :
- Trouver et corriger la requete qui appelle `mood_entries.valence`
- Trouver et corriger la requete qui appelle `user_preferences.preferred_activities`

**Fichiers a investiguer :** Recherche dans le code des references a `valence` et `preferred_activities`.

---

## Resume des modifications

| Fichier | Modification |
|---------|-------------|
| `src/components/home/AppleHero.tsx` | Inverser les styles CTA : inscription = primaire, decouverte = secondaire |
| Fichiers referant `mood_entries.valence` | Corriger la colonne inexistante |
| Fichiers referant `user_preferences.preferred_activities` | Corriger la colonne inexistante |

## Section technique

### AppleHero.tsx - Inversion CTA
Le bouton "Creer un compte gratuit" (ligne 118-126) recevra les classes du bouton principal :
```
className="h-14 px-8 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:scale-105"
```
Le bouton "Decouvrir les items EDN" (ligne 110-117) passera en outline :
```
variant="outline" className="h-14 px-8 text-lg font-semibold rounded-2xl border-2 hover:bg-secondary/50 transition-all hover:scale-105"
```

### Colonnes manquantes
Les references a `mood_entries.valence` et `user_preferences.preferred_activities` doivent etre supprimees ou remplacees par les colonnes existantes dans le schema.
