# Configuration GitHub Actions pour Tests RLS

Ce guide explique comment configurer les GitHub Actions pour exécuter automatiquement les tests RLS sur votre projet Med-MNG.

## 📋 Prérequis

- Repository GitHub avec le code Med-MNG
- Projet Supabase configuré
- Accès admin au repository GitHub

## 🔐 Configuration des Secrets GitHub

### Étape 1 : Accéder aux Settings

1. Aller sur votre repository GitHub
2. Cliquer sur **Settings** (⚙️)
3. Dans le menu de gauche, sélectionner **Secrets and variables** > **Actions**

### Étape 2 : Ajouter les Secrets

Cliquer sur **New repository secret** pour chaque secret suivant :

#### Secret 1 : SUPABASE_URL

```
Name: SUPABASE_URL
Value: https://yaincoxihiqdksxgrsrk.supabase.co
```

**Description :** URL de votre projet Supabase

**Où le trouver :**
- Dashboard Supabase > Project Settings > API > Project URL

---

#### Secret 2 : SUPABASE_ANON_KEY

```
Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU
```

**Description :** Clé anonyme (anon key) pour les appels client Supabase

**Où la trouver :**
- Dashboard Supabase > Project Settings > API > Project API keys > `anon` `public`

---

#### Secret 3 : SUPABASE_SERVICE_KEY (⚠️ SENSIBLE)

```
Name: SUPABASE_SERVICE_KEY
Value: [VOTRE_SERVICE_ROLE_KEY]
```

**Description :** Clé de service avec droits admin complets (⚠️ NE JAMAIS PARTAGER)

**Où la trouver :**
- Dashboard Supabase > Project Settings > API > Project API keys > `service_role` `secret`
- Cliquer sur "Reveal" pour voir la clé
- **ATTENTION :** Cette clé bypass tous les RLS et donne un accès total à la base de données

**⚠️ Sécurité critique :**
- Ne jamais commit cette clé dans le code
- Ne jamais la partager publiquement
- L'utiliser uniquement dans GitHub Secrets
- Limiter l'accès aux secrets aux collaborateurs de confiance

---

### Étape 3 : Vérifier les Secrets

Une fois les 3 secrets ajoutés, vous devriez voir :

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
```

dans la liste des secrets du repository.

## 🚀 Activation des Workflows

Les workflows sont déjà configurés dans `.github/workflows/rls-tests.yml` et s'activeront automatiquement une fois les secrets configurés.

### Déclencheurs

Les tests RLS s'exécutent sur :

- ✅ Chaque **push** sur `main` ou `develop`
- ✅ Chaque **pull request** vers `main` ou `develop`
- ✅ **Manuellement** via l'interface GitHub Actions

### Exécution Manuelle

Pour lancer les tests manuellement :

1. Aller dans l'onglet **Actions** du repository
2. Sélectionner **RLS Security Tests** dans la liste des workflows
3. Cliquer sur **Run workflow**
4. Choisir la branche
5. Cliquer sur **Run workflow** (bouton vert)

## 📊 Consulter les Résultats

### Sur les Pull Requests

Les résultats des tests apparaissent directement sur la PR :

- ✅ **Check vert** : Tous les tests passent
- ❌ **Check rouge** : Au moins un test échoue
- 💬 **Commentaire automatique** : Résumé des tests avec détails

### Dans GitHub Actions

1. Aller dans l'onglet **Actions**
2. Sélectionner une exécution du workflow
3. Voir les logs détaillés de chaque étape
4. Télécharger les artifacts (rapports de couverture)

### Artifacts Disponibles

Pour chaque exécution réussie :
- 📊 **Coverage reports** : Rapports de couverture de tests
- 🔍 **Test results** : Résultats détaillés au format JSON
- Disponibles pendant **30 jours**

## 🔧 Personnalisation du Workflow

### Modifier les Branches

Éditer `.github/workflows/rls-tests.yml` :

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging  # Ajouter d'autres branches
  pull_request:
    branches:
      - main
      - develop
```

### Ajouter des Tests

Modifier la section `Run RLS security tests` :

```yaml
- name: Run RLS security tests
  run: |
    npm run test test/rls-security.test.ts
    npm run test test/rls-sharing.test.ts
    npm run test test/mon-nouveau-test.test.ts  # Nouveau test
```

### Changer les Versions Node.js

Modifier la matrice de tests :

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 21.x]  # Ajouter/retirer versions
```

## 🐛 Troubleshooting

### Erreur : "Error: Unable to find Node"

**Solution :** Vérifier que `node-version` dans le workflow correspond à une version existante

### Erreur : "SUPABASE_URL is not defined"

**Solution :** Vérifier que le secret `SUPABASE_URL` est bien configuré dans GitHub

### Erreur : "Authentication failed"

**Solution :** 
1. Vérifier que les secrets sont correctement configurés
2. Vérifier que `SUPABASE_SERVICE_KEY` est la bonne clé (service_role)
3. Tester localement avec les mêmes variables d'environnement

### Tests échouent en CI mais passent localement

**Causes possibles :**
1. Variables d'environnement différentes
2. Base de données test différente
3. Versions Node.js différentes
4. Dépendances non installées correctement

**Solutions :**
```bash
# Reproduire l'environnement CI localement
npm ci  # Au lieu de npm install
export VITE_SUPABASE_URL="https://yaincoxihiqdksxgrsrk.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="votre-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="votre-service-key"
npm run test test/rls-*.test.ts
```

## 📝 Bonnes Pratiques

### ✅ À faire

- Configurer les 3 secrets dès le début
- Tester le workflow manuellement après configuration
- Vérifier les résultats des tests sur chaque PR
- Maintenir les secrets à jour si changement de projet Supabase
- Documenter les changements de workflow

### ❌ À ne pas faire

- Commit les clés API dans le code
- Partager `SUPABASE_SERVICE_KEY` publiquement
- Ignorer les échecs de tests en CI
- Désactiver les checks obligatoires
- Utiliser les clés de production en développement

## 🔒 Sécurité

### Protection des Secrets

GitHub Actions protège automatiquement les secrets :
- Masqués dans les logs
- Non accessibles par les forks
- Chiffrés au repos
- Uniquement disponibles pendant l'exécution

### Bonnes Pratiques

1. **Rotation des clés** : Changer régulièrement `SUPABASE_SERVICE_KEY`
2. **Accès limité** : Restreindre qui peut modifier les secrets
3. **Audit** : Consulter l'historique des modifications dans Settings > Actions
4. **Environnements** : Utiliser des environnements GitHub pour séparer dev/staging/prod

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase CI/CD Guide](https://supabase.com/docs/guides/platform/ci-cd-workflow)
- [README-TESTING.md](../README-TESTING.md) - Guide de test local
- [test/rls-sharing.integration.test.md](../test/rls-sharing.integration.test.md) - Documentation des tests

## 🆘 Support

En cas de problème :

1. Consulter la section Troubleshooting ci-dessus
2. Vérifier les logs dans GitHub Actions
3. Tester localement avec les mêmes configurations
4. Consulter la [documentation Supabase](https://supabase.com/docs)

---

**✅ Une fois configuré, vos tests RLS s'exécuteront automatiquement sur chaque changement !**
