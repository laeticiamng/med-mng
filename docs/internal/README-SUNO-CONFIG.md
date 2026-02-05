# Configuration de l'API Suno pour la génération musicale

## Étapes pour configurer Suno

1. **Créer un compte Suno** :
   - Allez sur https://suno.ai
   - Créez un compte ou connectez-vous

2. **Obtenir votre clé API** :
   - Rendez-vous dans les paramètres de votre compte Suno
   - Générez une clé API (API Key)
   - Copiez cette clé

3. **Configurer la clé dans Supabase** :
   - La clé doit être ajoutée comme secret `SUNO_API_KEY`
   - Elle sera utilisée automatiquement par l'edge function

## Alternatives si Suno ne fonctionne pas

Si vous n'avez pas de clé Suno, l'application utilisera un mode de test avec des fichiers audio d'exemple.

## Résolution des erreurs courantes

- **401 Unauthorized** : Clé API invalide ou expirée
- **429 Too Many Requests** : Quota Suno dépassé
- **403 Forbidden** : Permissions insuffisantes
- **Non-2xx status code** : Problème de configuration de l'API

L'edge function a été mise à jour pour mieux gérer ces erreurs et fournir des messages plus clairs.