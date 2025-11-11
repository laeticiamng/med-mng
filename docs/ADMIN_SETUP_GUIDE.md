# 🔐 Guide de Configuration Admin

## 📋 Vue d'ensemble

Ce guide explique comment configurer et gérer les administrateurs de la plateforme MED MNG.

---

## 🛡️ Système de Sécurité

### Architecture

Le système de rôles utilise :
- **Table `user_roles`** - Stocke les rôles des utilisateurs
- **Enum `app_role`** - Définit les rôles possibles (admin, moderator, user)
- **Fonction `has_role()`** - Vérifie les rôles (SECURITY DEFINER)
- **RLS Policies** - Protège l'accès aux données
- **Composant `AdminRoute`** - Protège les routes admin côté React

### Sécurité renforcée

✅ **Vérification server-side** - Jamais de vérification client (localStorage)  
✅ **RLS Policies** - Protection base de données  
✅ **SECURITY DEFINER** - Évite récursion RLS  
✅ **Protection React** - AdminRoute vérifie avant affichage  

---

## 🚀 Configuration initiale

### 1. Créer le premier administrateur

**Méthode 1 : Via SQL Editor Supabase**

```sql
-- Remplacer 'USER_UUID' par l'UUID réel de l'utilisateur
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID', 'admin');
```

**Méthode 2 : Via un script SQL**

```sql
-- Trouver l'utilisateur par email et lui donner le rôle admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### 2. Obtenir l'UUID d'un utilisateur

**Option A : Depuis Supabase Dashboard**

1. Aller sur [Users](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/auth/users)
2. Cliquer sur l'utilisateur
3. Copier l'UUID (visible en haut)

**Option B : Via SQL**

```sql
-- Lister tous les utilisateurs avec leurs UUIDs
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

---

## 👥 Gestion des Administrateurs

### Ajouter un administrateur

```sql
-- Via SQL Editor
INSERT INTO public.user_roles (user_id, role)
VALUES ('UUID_UTILISATEUR', 'admin');
```

### Retirer les droits admin

```sql
-- Via SQL Editor
DELETE FROM public.user_roles
WHERE user_id = 'UUID_UTILISATEUR'
AND role = 'admin';
```

### Lister tous les administrateurs

```sql
-- Via SQL Editor
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

### Vérifier si un utilisateur est admin

```sql
-- Via SQL Editor
SELECT public.has_role('UUID_UTILISATEUR', 'admin');
-- Retourne true ou false
```

---

## 🔒 Routes Admin Protégées

### Liste des routes sécurisées

Toutes ces routes nécessitent le rôle `admin` :

- `/admin/import` - Import de données
- `/admin/audit` - Audit système
- `/admin/extract-edn` - Extraction EDN
- `/admin/extract-ecos` - Extraction ECOS
- `/admin/extract-objectifs` - Extraction objectifs
- `/admin/oic-quality` - Gestion qualité OIC
- `/admin/complete` - Processus complet admin
- `/admin-panel` - Panel admin unifié

### Comportement

**Non authentifié** → Redirection vers `/med-mng/login`  
**Authentifié mais pas admin** → Page "Accès Refusé"  
**Admin confirmé** → Accès autorisé

---

## 🧪 Tests

### Tester l'accès admin

1. **En tant que non-admin** :
   ```
   1. Se connecter avec un compte normal
   2. Essayer d'accéder à /admin-panel
   3. ✅ Doit voir "Accès Refusé"
   ```

2. **En tant qu'admin** :
   ```
   1. Se connecter avec un compte admin
   2. Accéder à /admin-panel
   3. ✅ Doit voir le panel admin
   ```

3. **Sans connexion** :
   ```
   1. Se déconnecter
   2. Essayer d'accéder à /admin-panel
   3. ✅ Doit être redirigé vers /med-mng/login
   ```

### Vérifier les RLS policies

```sql
-- Tester l'accès aux rôles (doit retourner seulement VOS rôles)
SELECT * FROM public.user_roles;

-- Si admin, doit retourner TOUS les rôles
SELECT * FROM public.user_roles;

-- Si non-admin, doit retourner seulement VOS rôles
```

---

## 🆘 Troubleshooting

### Problème : "Accès Refusé" alors que je suis admin

**Causes possibles** :
1. Le rôle n'est pas dans la base
2. L'UUID est incorrect
3. La session n'est pas rafraîchie

**Solutions** :

```sql
-- 1. Vérifier si le rôle existe
SELECT * FROM public.user_roles WHERE user_id = 'VOTRE_UUID';

-- 2. Vérifier l'UUID actuel de votre session
SELECT auth.uid();

-- 3. Re-créer le rôle si manquant
INSERT INTO public.user_roles (user_id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT DO NOTHING;
```

Puis **se déconnecter et se reconnecter**.

### Problème : Erreur SQL lors de l'insertion

**Erreur** : `duplicate key value violates unique constraint`

**Cause** : Le rôle existe déjà

**Solution** : Normal, rien à faire ou utiliser `ON CONFLICT DO NOTHING`

### Problème : Les routes admin ne se chargent pas

**Diagnostic** :

1. Ouvrir la console développeur (F12)
2. Regarder les erreurs réseau
3. Vérifier les logs Supabase

**Causes fréquentes** :
- Session expirée → Se reconnecter
- RLS policy bloque → Vérifier policies
- Table user_roles n'existe pas → Exécuter migration

---

## 📊 Monitoring

### Dashboard Supabase

**Voir les admins** :
```
https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/editor/29393
```

**Voir les logs d'authentification** :
```
https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/logs/explorer
```

### Requêtes utiles

```sql
-- Nombre total d'admins
SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin';

-- Derniers admins créés
SELECT 
  ur.*,
  au.email
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC
LIMIT 10;

-- Utilisateurs avec plusieurs rôles
SELECT user_id, array_agg(role) as roles
FROM public.user_roles
GROUP BY user_id
HAVING COUNT(*) > 1;
```

---

## 🔐 Bonnes Pratiques

### ✅ DO

1. **Créer un admin dès le déploiement**
2. **Limiter le nombre d'admins** (principe du moindre privilège)
3. **Auditer régulièrement** la liste des admins
4. **Utiliser des emails professionnels** pour les admins
5. **Documenter** qui a donné les droits et pourquoi
6. **Se déconnecter** après changement de rôle

### ❌ DON'T

1. **Ne jamais hardcoder** d'UUID dans le code
2. **Ne jamais bypass** AdminRoute pour tester
3. **Ne jamais donner admin** sans validation
4. **Ne jamais stocker** les rôles en localStorage
5. **Ne jamais désactiver** RLS sur user_roles
6. **Ne jamais commit** d'UUID dans Git

---

## 📚 Référence API

### Fonction `has_role`

```sql
public.has_role(_user_id UUID, _role app_role) RETURNS BOOLEAN
```

**Exemple** :
```sql
SELECT public.has_role(auth.uid(), 'admin'); -- true/false
SELECT public.has_role('UUID', 'moderator'); -- true/false
```

### Fonction `is_admin`

```sql
public.is_admin() RETURNS BOOLEAN
```

**Exemple** :
```sql
SELECT public.is_admin(); -- true/false (utilisateur actuel)
```

### Composant React `AdminRoute`

```tsx
import { AdminRoute } from '@/components/auth/AdminRoute';

// Protéger une route
<Route path="/admin/dashboard" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

---

## 📝 Checklist Déploiement

Avant de mettre en production :

- [ ] Migration user_roles exécutée
- [ ] Premier admin créé et testé
- [ ] Toutes routes /admin/* protégées
- [ ] Page RGPD débloquée (publique)
- [ ] Tests accès admin validés
- [ ] Tests accès non-admin validés
- [ ] Documentation admin partagée à l'équipe
- [ ] Procédure d'urgence définie (comment donner admin rapidement)

---

**Dernière mise à jour** : 2025-01-XX  
**Maintenu par** : Security Team

