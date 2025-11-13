# Tests d'Intégration RLS - Système de Partage

## Vue d'ensemble

Ce document décrit les tests d'intégration automatiques pour valider les politiques RLS (Row Level Security) du système de partage collaboratif.

## Fichiers de Test

- **`test/rls-sharing.test.ts`** : Tests automatiques des permissions viewer, editor et admin
- **Page de test UI** : `/share-test` - Interface manuelle pour tester les permissions

## Comment Exécuter les Tests

### Tests Automatiques

```bash
# Exécuter tous les tests RLS
npm run test test/rls-sharing.test.ts

# Exécuter en mode watch
npm run test:watch test/rls-sharing.test.ts

# Générer un rapport de couverture
npm run test:coverage
```

### Tests Manuels

1. Accéder à `/share-test` dans le navigateur
2. Utiliser les boutons pour tester chaque niveau de permission
3. Vérifier les résultats dans l'interface

## Scénarios de Test

### 1. Permission Viewer (Lecture Seule)

**Autorisé :**
- ✅ Lire les favoris partagés
- ✅ Lire les notes partagées
- ✅ Lire les tags partagés
- ✅ Consulter les statistiques de visite

**Interdit :**
- ❌ Modifier les favoris
- ❌ Créer ou modifier des notes
- ❌ Supprimer des données
- ❌ Gérer les partages

### 2. Permission Editor (Lecture + Écriture)

**Autorisé :**
- ✅ Toutes les permissions de Viewer
- ✅ Modifier les favoris partagés
- ✅ Modifier les notes existantes
- ✅ Ajouter des tags
- ✅ Mettre à jour les seuils d'alerte

**Interdit :**
- ❌ Créer des notes au nom du propriétaire
- ❌ Supprimer les données du propriétaire
- ❌ Gérer les partages

### 3. Permission Admin (Accès Complet)

**Autorisé :**
- ✅ Toutes les permissions d'Editor
- ✅ Gérer les partages (créer, modifier, supprimer)
- ✅ Créer des données au nom du propriétaire
- ✅ Effectuer toutes les opérations CRUD

**Restrictions :**
- ⚠️ Ne peut pas supprimer les données du propriétaire (par design)
- ⚠️ Les logs d'audit enregistrent toutes les actions admin

## Tests de Sécurité

### Isolation des Données

```typescript
✓ Les viewers ne peuvent pas accéder aux données non partagées
✓ Les partages ne donnent accès qu'aux données du propriétaire spécifié
✓ Les utilisateurs sans permission ne peuvent rien voir
```

### Fonction de Sécurité `has_sitemap_access`

```sql
-- Vérification de l'accès
SELECT has_sitemap_access(
  _user_id := 'user-uuid',
  _target_user_id := 'owner-uuid',
  _min_permission := 'viewer'
);
```

**Tests de la fonction :**
- ✅ Retourne `true` pour le propriétaire
- ✅ Retourne `true` pour les utilisateurs avec la bonne permission
- ✅ Retourne `false` pour les utilisateurs sans permission
- ✅ Respecte la hiérarchie des permissions

### Gestion des Partages

**Propriétaire :**
- ✅ Peut créer des partages
- ✅ Peut modifier les permissions
- ✅ Peut supprimer des partages
- ✅ Peut voir tous ses partages

**Utilisateurs Partagés :**
- ✅ Peuvent voir les partages les concernant
- ❌ Ne peuvent pas modifier les partages
- ❌ Ne peuvent pas voir les partages d'autres utilisateurs

## Structure des Tests

### Setup (beforeAll)

1. Création de 4 utilisateurs de test :
   - Owner (propriétaire des données)
   - Viewer (lecture seule)
   - Editor (lecture + écriture)
   - Admin (accès complet)

2. Création des partages avec différentes permissions

3. Insertion de données de test

### Tests par Permission

Chaque niveau de permission a une suite de tests dédiée :
- Tests positifs (actions autorisées)
- Tests négatifs (actions interdites)
- Tests de limites

### Cleanup (afterAll)

- Suppression des données de test
- Suppression des partages
- Suppression des utilisateurs de test

## Résultats Attendus

### Tous les tests doivent passer ✅

```
✓ Viewer Permission Tests (6 tests)
✓ Editor Permission Tests (6 tests)
✓ Admin Permission Tests (6 tests)
✓ Share Management Tests (8 tests)
✓ Data Isolation Tests (2 tests)
```

### En Cas d'Échec

1. Vérifier que les migrations RLS sont appliquées
2. Vérifier que la fonction `has_sitemap_access` existe
3. Vérifier les politiques RLS sur les tables :
   - `user_sitemap_data`
   - `page_notes`
   - `sitemap_shares`
   - `user_metric_alerts`

## Commandes de Diagnostic

```bash
# Vérifier les politiques RLS actives
npm run supabase:linter

# Lister toutes les politiques
psql -c "SELECT * FROM pg_policies WHERE schemaname = 'public';"

# Tester une politique spécifique
npm run test test/rls-sharing.test.ts -t "viewer to read"
```

## Maintenance

### Après Modification des RLS Policies

1. Exécuter la suite complète de tests
2. Vérifier qu'aucune régression n'est introduite
3. Mettre à jour ce document si nécessaire

### Ajout de Nouveaux Tests

Pour ajouter des tests :
1. Identifier le scénario de sécurité à tester
2. Ajouter le test dans la suite appropriée
3. Vérifier que le test échoue sans la bonne politique
4. Vérifier que le test passe avec la politique correcte

## Liens Utiles

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Page de test UI](/share-test)
- [Code source des tests](test/rls-sharing.test.ts)
- [Migrations RLS](supabase/migrations/)

## Checklist de Sécurité

Avant de déployer en production :

- [ ] Tous les tests RLS passent
- [ ] Les politiques sont documentées
- [ ] La fonction `has_sitemap_access` est testée
- [ ] L'isolation des données est validée
- [ ] Les permissions par défaut sont sécurisées
- [ ] Les logs d'audit sont en place
- [ ] Les tests de régression sont écrits
