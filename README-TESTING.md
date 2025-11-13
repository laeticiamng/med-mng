# Guide de Test - Système de Partage RLS

## 🎯 Vue d'ensemble

Ce guide explique comment tester le système de partage collaboratif avec permissions granulaires (viewer, editor, admin) et valider les politiques RLS (Row Level Security).

## 📋 Prérequis

- Node.js installé
- Variables d'environnement Supabase configurées dans `.env`
- Base de données Supabase avec les migrations appliquées
- Compte Supabase avec accès service_role pour les tests

### Variables d'environnement requises

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Pour les tests uniquement
```

## 🧪 Types de Tests

### 1. Tests Automatiques (Vitest)

Tests d'intégration complets pour valider les RLS policies.

**Fichier :** `test/rls-sharing.test.ts`

```bash
# Exécuter tous les tests RLS
npm run test test/rls-sharing.test.ts

# Mode watch (re-exécute automatiquement)
npm run test:watch test/rls-sharing.test.ts

# Avec couverture de code
npm run test:coverage test/rls-sharing.test.ts

# Tests spécifiques
npm run test test/rls-sharing.test.ts -t "viewer"
npm run test test/rls-sharing.test.ts -t "editor"
npm run test test/rls-sharing.test.ts -t "admin"
```

**Ce qui est testé :**

- ✅ Permissions viewer (lecture seule)
- ✅ Permissions editor (lecture + écriture)
- ✅ Permissions admin (accès complet)
- ✅ Gestion des partages
- ✅ Isolation des données
- ✅ Fonction `has_sitemap_access`

### 2. Tests Manuels (Interface UI)

Interface interactive pour tester les permissions en temps réel.

**URL :** `/share-test`

**Accès :**
1. Naviguer vers `/share-test` dans le navigateur
2. Ou via le sitemap : Accueil > Administration & OIC > Tests de partage & permissions

**Fonctionnalités :**

- 📊 Vue d'ensemble des partages actifs
- 🧪 Tests automatisés par permission
- 📈 Visualisation des données accessibles
- 🔍 Résultats détaillés en temps réel

**Comment utiliser :**

```
1. Onglet "Vue d'ensemble" : Voir le nombre de partages et données
2. Onglet "Gestion des partages" : Créer/modifier/supprimer des partages
3. Onglet "Tests des permissions" : Lancer les tests automatisés
4. Onglet "Données accessibles" : Voir favoris, notes et partages actifs
```

## 📝 Scénarios de Test

### Scenario 1 : Permission Viewer

```bash
# Test automatique
npm run test test/rls-sharing.test.ts -t "Viewer Permission"

# Test manuel
1. Accéder à /share-test
2. Onglet "Tests des permissions"
3. Cliquer "Tester Viewer"
4. Vérifier que :
   - ✅ Lecture des favoris : SUCCÈS
   - ✅ Lecture des notes : SUCCÈS
   - ❌ Modification : BLOQUÉ (attendu)
```

### Scenario 2 : Permission Editor

```bash
# Test automatique
npm run test test/rls-sharing.test.ts -t "Editor Permission"

# Test manuel
1. Accéder à /share-test
2. Onglet "Tests des permissions"
3. Cliquer "Tester Editor"
4. Vérifier que :
   - ✅ Lecture : SUCCÈS
   - ✅ Création de notes : SUCCÈS
   - ✅ Modification : SUCCÈS
   - ❌ Suppression : BLOQUÉ (attendu)
```

### Scenario 3 : Permission Admin

```bash
# Test automatique
npm run test test/rls-sharing.test.ts -t "Admin Permission"

# Test manuel
1. Accéder à /share-test
2. Onglet "Tests des permissions"
3. Cliquer "Tester Admin"
4. Vérifier toutes les opérations CRUD
```

## 🔒 Tests de Sécurité

### Validation de l'isolation des données

```bash
# Teste que les utilisateurs ne peuvent pas accéder aux données non partagées
npm run test test/rls-sharing.test.ts -t "Data Isolation"
```

**Vérifie :**
- Les viewers ne voient que les données partagées avec eux
- Aucun accès aux données d'autres utilisateurs
- La fonction `has_sitemap_access` fonctionne correctement

### Tests de régression RLS

```bash
# Suite complète pour détecter les régressions
npm run test test/rls-security.test.ts
npm run test test/rls-sharing.test.ts
```

## 🐛 Debugging

### Si les tests échouent

1. **Vérifier les migrations**
```bash
# Lister les migrations appliquées
supabase migration list

# Vérifier que la migration de partage est appliquée
# Rechercher : sitemap_shares, has_sitemap_access
```

2. **Vérifier les politiques RLS**
```sql
-- Dans Supabase SQL Editor
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_sitemap_data', 'page_notes', 'sitemap_shares')
ORDER BY tablename, policyname;
```

3. **Tester la fonction de sécurité**
```sql
-- Vérifier que la fonction existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'has_sitemap_access';

-- Tester manuellement
SELECT has_sitemap_access(
  'user-uuid'::uuid,
  'owner-uuid'::uuid,
  'viewer'::share_permission
);
```

4. **Activer les logs détaillés**
```bash
# Dans les tests
DEBUG=true npm run test test/rls-sharing.test.ts
```

### Erreurs courantes

**Erreur : "relation sitemap_shares does not exist"**
```bash
# La migration n'est pas appliquée
# Solution : Appliquer la migration
supabase migration up
```

**Erreur : "permission denied"**
```bash
# Les RLS policies ne sont pas correctes
# Solution : Vérifier les politiques avec la requête SQL ci-dessus
```

**Erreur : "function has_sitemap_access does not exist"**
```bash
# La fonction n'est pas créée
# Solution : Ré-appliquer la migration de partage
```

## 📊 Rapports de Test

### Génerer un rapport HTML

```bash
npm run test:coverage -- --reporter=html
```

Le rapport sera disponible dans `coverage/index.html`

### CI/CD Integration

```yaml
# Exemple GitHub Actions
name: RLS Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run RLS tests
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: npm run test test/rls-sharing.test.ts
```

## 🔄 Workflow de Développement

### Avant de commiter

```bash
# 1. Exécuter tous les tests
npm run test

# 2. Vérifier les politiques RLS
npm run supabase:linter

# 3. Tests spécifiques de partage
npm run test test/rls-sharing.test.ts
```

### Après modification des RLS

```bash
# 1. Appliquer la migration
supabase migration up

# 2. Tests de régression complets
npm run test test/rls-security.test.ts
npm run test test/rls-sharing.test.ts

# 3. Test manuel dans l'UI
# Accéder à /share-test et tester toutes les permissions
```

## 📚 Documentation Complémentaire

- [Tests d'Intégration RLS](test/rls-sharing.integration.test.md)
- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide de Sécurité](docs/supabase-rls-audit.md)

## 🆘 Support

En cas de problème :
1. Consulter la [documentation des tests](test/rls-sharing.integration.test.md)
2. Vérifier les [logs Supabase](https://app.supabase.com/project/_/logs)
3. Tester manuellement via `/share-test`

## ✅ Checklist Pre-Production

Avant de déployer en production :

- [ ] Tous les tests RLS passent (`npm run test`)
- [ ] Tests manuels effectués via `/share-test`
- [ ] Politiques RLS documentées
- [ ] Fonction `has_sitemap_access` testée
- [ ] Isolation des données validée
- [ ] Permissions par défaut sécurisées
- [ ] Logs d'audit configurés
- [ ] Tests de régression écrits
- [ ] Documentation à jour
