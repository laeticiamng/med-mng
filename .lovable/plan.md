

# Correction : Message d'erreur "utilisateur deja enregistre"

## Diagnostic

L'utilisatrice beta (afifi.sarah@laposte.net) a bien un compte actif cree le 8 fevrier a 19h49 avec son nom "AFIFI Sarah" correctement enregistre. Le probleme n'est pas technique : **Supabase refuse a raison la double inscription** (erreur 422).

Le souci est que le message d'erreur affiche est le texte brut de Supabase ("User already registered") au lieu d'un message clair en francais avec un lien vers la connexion.

## Correction a appliquer

### Fichier : `src/pages/MedMngSignup.tsx` (lignes 69-75)

Remplacer l'affichage brut de l'erreur par une detection du cas "utilisateur deja inscrit" et un message adapte :

- Detecter si le message d'erreur contient "already registered" ou "already exists"
- Afficher : "Un compte existe deja avec cet email. Connectez-vous plutot."
- Ajouter un lien/bouton vers la page de connexion dans le message d'erreur
- Garder le message generique pour les autres types d'erreur

### Detail technique

```
// Avant (ligne 71-72)
if (signUpError) {
  setError(signUpError.message);  // Message brut en anglais
}

// Apres
if (signUpError) {
  if (signUpError.message?.includes('already') || signUpError.status === 422) {
    setError('already_registered');  // Cas special gere dans le rendu
  } else {
    setError(signUpError.message);
  }
}
```

Dans le rendu JSX, quand `error === 'already_registered'` :
- Afficher "Un compte existe deja avec cet email."
- Ajouter un bouton "Se connecter" qui redirige vers `/med-mng/login`

### Impact
- Aucune modification base de donnees
- Correction UX uniquement dans `MedMngSignup.tsx`
- La beta-testeuse pourra se connecter avec son compte existant

