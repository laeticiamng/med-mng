# Système de Contrôle d'Accès Basé sur les Rôles (RBAC)

## Vue d'ensemble

Le système de sécurité implémente un contrôle d'accès granulaire basé sur trois rôles distincts, sécurisé via Row Level Security (RLS) de Supabase.

## Architecture de Sécurité

### 1. Stockage des Rôles

**❌ JAMAIS faire :**
- Stocker les rôles dans `localStorage` ou `sessionStorage`
- Hardcoder les rôles dans le code frontend
- Vérifier les permissions uniquement côté client

**✅ Toujours faire :**
- Stocker les rôles dans une table dédiée `user_roles`
- Utiliser RLS pour sécuriser l'accès
- Vérifier les permissions côté serveur avec `SECURITY DEFINER`

### 2. Table user_roles

```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    role app_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, role)
);
```

### 3. Fonction has_role (SECURITY DEFINER)

Cette fonction bypass RLS pour éviter les récursions :

```sql
CREATE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

## Les 3 Rôles

### 🔴 Admin
**Permissions complètes**
- ✅ Gérer les rôles utilisateurs
- ✅ Créer, modifier, supprimer des incidents
- ✅ Modifier toutes les alertes
- ✅ Accès complet aux métriques
- ✅ Exporter les rapports
- ✅ Configurer les intégrations

**Use Cases:**
- DevOps Lead
- Security Manager
- CTO/CISO

### 🔵 Security Analyst
**Gestion opérationnelle de la sécurité**
- ✅ Créer et modifier des incidents
- ✅ Mettre à jour les alertes
- ✅ Escalader les problèmes
- ✅ Consulter toutes les métriques
- ✅ Exporter les rapports
- ❌ Gérer les rôles
- ❌ Supprimer des incidents

**Use Cases:**
- Security Operations Center (SOC) Analyst
- DevSecOps Engineer
- Security Incident Responder

### 🟢 Viewer
**Accès en lecture seule**
- ✅ Consulter les métriques
- ✅ Voir les alertes
- ✅ Lire les incidents
- ✅ Télécharger les rapports
- ❌ Modifier quoi que ce soit
- ❌ Créer des incidents
- ❌ Escalader

**Use Cases:**
- Développeurs
- Product Managers
- Auditeurs externes

## Utilisation

### Hook React

```typescript
import { useUserRoles } from '@/hooks/useUserRoles';

function SecurityComponent() {
  const { isAdmin, isSecurityAnalyst, isViewer, hasRole } = useUserRoles();

  if (!hasRole('admin')) {
    return <AccessDenied />;
  }

  return <AdminPanel />;
}
```

### Assigner un Rôle (Admin uniquement)

```typescript
const { assignRole } = useUserRoles();

// Assigner le rôle d'analyste à un utilisateur
assignRole({ 
  userId: 'user-uuid', 
  role: 'security_analyst' 
});
```

### Retirer un Rôle (Admin uniquement)

```typescript
const { removeRole } = useUserRoles();

removeRole({ 
  userId: 'user-uuid', 
  role: 'viewer' 
});
```

## RLS Policies

### Tables Sécurisées

#### user_roles
- **SELECT** : Utilisateurs voient leurs propres rôles + Admins voient tout
- **INSERT/UPDATE/DELETE** : Admins uniquement

#### security_alerts
- **SELECT** : Tous les rôles sécurité (admin, analyst, viewer)
- **UPDATE** : Admin + Security Analyst
- **DELETE** : Admin uniquement

#### security_metrics_snapshots
- **SELECT** : Tous les rôles sécurité
- **INSERT/UPDATE/DELETE** : Admin uniquement

## Composants UI

### SecurityDashboard
Affiche différents onglets selon les permissions :
- **Vue d'ensemble** : Tous les rôles
- **Gestion des Incidents** : Admin + Analyst (viewer en lecture seule)
- **Gestion des Rôles** : Admin uniquement

### RoleManagement
Interface d'administration pour :
- Visualiser tous les utilisateurs avec leurs rôles
- Assigner/retirer des rôles
- Voir les définitions des rôles

### IncidentManagement
Adapte l'interface selon les permissions :
- Boutons de modification visibles uniquement pour admin/analyst
- Message d'avertissement pour les viewers

## Sécurité

### Protection contre l'Escalade de Privilèges

1. **RLS obligatoire** sur toutes les tables sensibles
2. **SECURITY DEFINER** pour éviter les récursions RLS
3. **Validation côté serveur** via les policies
4. **Aucune confiance** dans les données client

### Audit Trail

Chaque assignation de rôle enregistre :
- `assigned_by` : UUID de l'admin qui a assigné
- `assigned_at` : Timestamp de l'assignation

### Tests de Sécurité

Inclus dans `test/rls-security.test.ts` :
- Vérification que RLS est activé
- Tests d'isolation des rôles
- Détection de régression

## Migration Initiale

Pour assigner le premier admin (à exécuter via SQL Editor) :

```sql
-- Obtenir l'UUID de votre utilisateur
SELECT id, email FROM auth.users;

-- Assigner le rôle admin au premier utilisateur
INSERT INTO public.user_roles (user_id, role)
VALUES ('votre-user-uuid', 'admin');
```

## Best Practices

### 1. Principe du Moindre Privilège
Assignez le rôle minimum nécessaire à chaque utilisateur.

### 2. Rotation des Admins
Limitez le nombre d'admins et auditez régulièrement.

### 3. Traçabilité
Tous les changements de rôles sont tracés via `assigned_by` et `assigned_at`.

### 4. Revue Périodique
Auditez les rôles assignés mensuellement et retirez les accès inutiles.

### 5. Séparation des Tâches
Un analyste ne devrait pas être admin sur le même système.

## Dépannage

### L'utilisateur ne voit pas le dashboard
1. Vérifier qu'un rôle est assigné : 
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'uuid';
   ```
2. Vérifier que RLS est activé sur les tables
3. Vérifier les logs d'erreur dans Supabase

### Impossible d'assigner des rôles
1. Vérifier que l'utilisateur actuel est admin
2. Vérifier les policies RLS sur `user_roles`
3. Vérifier que la fonction `has_role` existe

### Permissions incohérentes
1. Rafraîchir la session utilisateur
2. Vérifier les policies RLS conflictuelles
3. Vérifier l'ordre d'exécution des policies

## Intégration CI/CD

Les tests RLS s'exécutent automatiquement :

```yaml
- name: Test RLS Policies
  run: npm run test test/rls-security.test.ts
```

## Roadmap

- [ ] Support des rôles personnalisés
- [ ] Permissions granulaires par ressource
- [ ] Groupes d'utilisateurs
- [ ] Rôles temporaires avec expiration
- [ ] Approbation multi-niveaux pour changements critiques
