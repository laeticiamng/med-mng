# GitHub Actions Workflows

## RLS Security Tests

Ce workflow automatise l'exécution des tests de sécurité RLS (Row Level Security) pour garantir l'intégrité des permissions de partage.

### Configuration Requise

Avant d'utiliser ce workflow, vous devez configurer les secrets suivants dans votre repository GitHub :

1. **Accéder aux Settings du repository**
   - Aller sur GitHub.com > Votre Repository > Settings > Secrets and variables > Actions

2. **Ajouter les secrets suivants :**

   - `SUPABASE_URL` : URL de votre projet Supabase
     ```
     https://yaincoxihiqdksxgrsrk.supabase.co
     ```
   
   - `SUPABASE_ANON_KEY` : Clé anonyme (anon key) de Supabase
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU
     ```
   
   - `SUPABASE_SERVICE_KEY` : Clé de service (service_role key) de Supabase
     - ⚠️ **ATTENTION** : Cette clé donne un accès complet à votre base de données
     - Trouvable dans : Supabase Dashboard > Project Settings > API > service_role key
     - Ne JAMAIS partager cette clé publiquement

### Déclenchement du Workflow

Le workflow s'exécute automatiquement sur :
- ✅ Chaque push sur `main` ou `develop`
- ✅ Chaque pull request vers `main` ou `develop`
- ✅ Manuellement via l'interface GitHub Actions

### Tests Exécutés

1. **Tests RLS de base** (`test/rls-security.test.ts`)
   - Isolation des données utilisateur
   - Politiques RLS sur `med_mng_items`
   - Accès aux tables publiques
   - Logs d'audit

2. **Tests de partage** (`test/rls-sharing.test.ts`)
   - Permissions Viewer (lecture seule)
   - Permissions Editor (lecture + écriture)
   - Permissions Admin (accès complet)
   - Gestion des partages
   - Isolation des données partagées

3. **Audit de sécurité**
   - Scan des dépendances npm
   - Vérification des vulnérabilités
   - Rapport de sécurité

### Résultats et Artifacts

- 📊 **Rapports de couverture** : Uploadés comme artifacts (disponibles 30 jours)
- 💬 **Commentaires PR** : Résumé automatique sur les pull requests
- ✅ **Statut des checks** : Visible sur GitHub PR interface

### Accéder aux Rapports

1. Aller sur l'onglet **Actions** de votre repository
2. Sélectionner le workflow **RLS Security Tests**
3. Cliquer sur une exécution spécifique
4. Télécharger les artifacts dans la section **Artifacts**

### En Cas d'Échec

Si les tests échouent :

1. **Consulter les logs** dans GitHub Actions
2. **Reproduire localement** :
   ```bash
   npm run test test/rls-security.test.ts
   npm run test test/rls-sharing.test.ts
   ```
3. **Vérifier les politiques RLS** :
   ```bash
   npm run supabase:linter
   ```
4. **Consulter la documentation** : [README-TESTING.md](../../README-TESTING.md)

### Personnalisation

Pour modifier le workflow :
1. Éditer `.github/workflows/rls-tests.yml`
2. Ajuster les branches, versions Node.js, ou commandes de test
3. Commit et push les changements

### Sécurité

⚠️ **Points importants :**
- Ne jamais commit les secrets dans le code
- Utiliser uniquement GitHub Secrets pour les clés sensibles
- La clé service_role donne un accès admin complet
- Limiter l'accès aux secrets aux collaborateurs de confiance

### Support

Pour des questions ou problèmes :
- Consulter [README-TESTING.md](../../README-TESTING.md)
- Tester localement avec la page `/share-test`
- Vérifier les [logs Supabase](https://app.supabase.com/project/yaincoxihiqdksxgrsrk/logs)
