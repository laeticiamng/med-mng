# 🚀 Démarrage Rapide - Système de Rôles

## Première Configuration

### Étape 1 : Assigner le Premier Admin

Après la migration, vous devez assigner manuellement le premier admin via l'éditeur SQL de Supabase.

1. **Ouvrir l'éditeur SQL** dans Supabase Dashboard
2. **Obtenir votre UUID utilisateur** :

```sql
SELECT id, email FROM auth.users;
```

3. **Assigner le rôle admin** au premier utilisateur :

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('VOTRE-USER-UUID-ICI', 'admin');
```

### Étape 2 : Vérifier l'Assignation

```sql
SELECT 
  u.email,
  ur.role,
  ur.assigned_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.id = 'VOTRE-USER-UUID-ICI';
```

Vous devriez voir une ligne avec `role = 'admin'`.

### Étape 3 : Accéder au Dashboard

1. Déconnectez-vous et reconnectez-vous
2. Accédez à `/security` (ou le composant SecurityDashboard)
3. Vous devriez maintenant voir l'onglet **Gestion des Rôles**

## Assigner d'Autres Utilisateurs

Une fois le premier admin configuré, utilisez l'interface web :

1. Allez dans **Security Dashboard → Gestion des Rôles**
2. Sélectionnez un utilisateur dans la liste
3. Choisissez le rôle à assigner
4. Cliquez sur **Assigner**

## Les 3 Rôles Disponibles

### 👑 Admin
- **Pour qui :** DevOps Lead, Security Manager, CTO/CISO
- **Permissions :** Tout (gestion des rôles, incidents, alertes, métriques)

### 🛡️ Security Analyst  
- **Pour qui :** SOC Analyst, DevSecOps Engineer
- **Permissions :** Gestion des incidents et alertes (pas de gestion des rôles)

### 👁️ Viewer
- **Pour qui :** Développeurs, Product Managers, Auditeurs
- **Permissions :** Lecture seule (métriques, alertes, incidents)

## Tests de Permissions

### Tester comme Admin
```typescript
// Dans votre composant
const { isAdmin } = useUserRoles();
console.log('Admin:', isAdmin); // devrait être true
```

### Tester comme Analyst
```sql
-- Assigner le rôle analyst
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES ('user-uuid', 'security_analyst', 'admin-uuid');
```

### Tester comme Viewer
```sql
-- Assigner le rôle viewer
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES ('user-uuid', 'viewer', 'admin-uuid');
```

## Résolution de Problèmes

### "Accès Refusé" après assignation du rôle

**Cause :** Le cache de la session n'est pas à jour

**Solution :**
1. Déconnexion complète de l'application
2. Reconnexion
3. Vider le cache du navigateur si nécessaire

### Impossible d'assigner des rôles dans l'UI

**Causes possibles :**
1. Vous n'êtes pas admin
2. RLS n'est pas correctement configuré
3. La fonction `has_role` n'existe pas

**Vérifications :**
```sql
-- Vérifier vos rôles
SELECT role FROM user_roles WHERE user_id = auth.uid();

-- Vérifier que la fonction existe
SELECT proname FROM pg_proc WHERE proname = 'has_role';

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'user_roles';
```

### L'interface ne charge pas

**Solution :** Vérifier les logs dans la console du navigateur

```javascript
// Devrait afficher vos rôles
console.log(useUserRoles().myRoles);
```

## Commandes SQL Utiles

### Lister tous les utilisateurs avec leurs rôles
```sql
SELECT 
  u.email,
  ARRAY_AGG(ur.role) as roles,
  u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC;
```

### Retirer un rôle manuellement
```sql
DELETE FROM user_roles 
WHERE user_id = 'user-uuid' 
  AND role = 'admin';
```

### Voir l'historique des assignations
```sql
SELECT 
  u1.email as user_email,
  ur.role,
  u2.email as assigned_by_email,
  ur.assigned_at
FROM user_roles ur
JOIN auth.users u1 ON ur.user_id = u1.id
LEFT JOIN auth.users u2 ON ur.assigned_by = u2.id
ORDER BY ur.assigned_at DESC;
```

### Compter les utilisateurs par rôle
```sql
SELECT 
  role,
  COUNT(*) as count
FROM user_roles
GROUP BY role
ORDER BY count DESC;
```

## Sécurité

### ⚠️ N'oubliez Pas

1. **Ne partagez jamais** les credentials admin
2. **Limitez le nombre d'admins** à 2-3 maximum
3. **Auditez régulièrement** les assignations de rôles
4. **Utilisez le principe du moindre privilège** : assignez le rôle minimum nécessaire

### Audit Mensuel Recommandé

```sql
-- Utilisateurs sans rôle (à assigner ou à supprimer)
SELECT email 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_roles);

-- Admins actifs
SELECT u.email, ur.assigned_at
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.assigned_at DESC;
```

## Support

Pour toute question ou problème :
1. Consulter la documentation complète : `docs/ROLE_BASED_ACCESS_CONTROL.md`
2. Vérifier les tests RLS : `test/rls-security.test.ts`
3. Consulter les logs Supabase dans le dashboard

## Prochaines Étapes

✅ Système de rôles configuré  
⬜ Dashboard temps réel WebSocket  
⬜ Calculateur CVSS  
⬜ Rapports planifiés  
⬜ Intégration PagerDuty
