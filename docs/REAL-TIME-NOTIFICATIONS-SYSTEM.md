# 🔔 Système de Notifications en Temps Réel et Dashboard Admin

## Vue d'Ensemble

Système complet de notifications en temps réel avec WebSocket pour alerter instantanément sur les problèmes critiques de qualité de code, incluant un tableau de bord d'administration pour la gestion des utilisateurs, permissions, et configuration des seuils d'alerte.

## 🎯 Fonctionnalités

### 1. Notifications en Temps Réel
- **WebSocket via Supabase Realtime** - Alertes instantanées sans rafraîchissement
- **Toast notifications** - Affichage immédiat des alertes critiques
- **Badge de notification** - Compteur d'alertes non lues
- **Popover de notifications** - Accès rapide aux dernières alertes
- **Niveaux de sévérité** : Critical, High, Medium, Low

### 2. Dashboard d'Administration
- **Gestion des rôles utilisateurs** - Admin, Moderator, User
- **Configuration des seuils** - Par projet et par métrique
- **Panneau d'alertes** - Visualisation et gestion des alertes
- **Contrôle d'accès** - Basé sur RLS Supabase sécurisé

### 3. Système de Seuils Personnalisables
- Bugs threshold
- Vulnerabilities threshold
- Code smells threshold
- Coverage threshold (%)
- Maintainability rating threshold
- Security rating threshold
- Notifications par niveau de sévérité

## 📊 Architecture

### Base de Données

#### Tables Créées

**1. user_roles**
```sql
- id: UUID (PK)
- user_id: UUID (FK vers auth.users)
- role: ENUM('admin', 'moderator', 'user')
- created_at: TIMESTAMP
```

**2. quality_thresholds**
```sql
- id: UUID (PK)
- project_name: TEXT (UNIQUE)
- bugs_threshold: INTEGER
- vulnerabilities_threshold: INTEGER
- code_smells_threshold: INTEGER
- coverage_threshold: DECIMAL
- maintainability_threshold: TEXT
- security_threshold: TEXT
- notify_on_critical: BOOLEAN
- notify_on_high: BOOLEAN
- notify_on_medium: BOOLEAN
```

**3. quality_alerts**
```sql
- id: UUID (PK)
- project_name: TEXT
- severity: TEXT ('critical', 'high', 'medium', 'low')
- title: TEXT
- message: TEXT
- metric_type: TEXT
- metric_value: TEXT
- threshold_value: TEXT
- is_read: BOOLEAN
- created_at: TIMESTAMP
```

### Fonctions SQL Sécurisées

**has_role(_user_id UUID, _role app_role)**
- Vérifie si un utilisateur a un rôle spécifique
- SECURITY DEFINER pour éviter les récursions RLS

**check_quality_thresholds(...)**
- Vérifie automatiquement les seuils de qualité
- Crée des alertes si les seuils sont dépassés
- Appelée par le webhook GitHub

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables ont RLS activé avec :

**user_roles:**
- Users can view own roles
- Admins can view all roles
- Admins can manage roles

**quality_thresholds:**
- Anyone authenticated can view
- Only admins can create/update/delete

**quality_alerts:**
- Anyone authenticated can view
- Anyone can mark as read
- Only admins can delete

### Fonctions Security Definer

Toutes les fonctions utilisent `SET search_path = public` pour prévenir les attaques par injection.

## 📱 Composants Frontend

### Hooks

**useUserRole()**
```typescript
const { role, isAdmin, isModerator, loading, refresh } = useUserRole();
```

**useRealtimeAlerts()**
```typescript
const { 
  alerts, 
  loading, 
  unreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteAlert,
  refresh 
} = useRealtimeAlerts();
```

### Pages

**QualityAdminPage** (`/quality-admin`)
- Onglet Alerts - Visualisation des alertes en temps réel
- Onglet Users - Gestion des rôles utilisateurs
- Onglet Settings - Configuration des seuils par projet

### Composants

**RealtimeAlertNotifier**
- Icône de notification avec badge
- Popover avec les 5 dernières alertes
- Lien vers le dashboard admin

**AlertsPanel**
- Liste complète des alertes
- Filtrage par sévérité
- Actions : Mark as read, Delete

**UserManagement**
- Liste de tous les utilisateurs
- Attribution/modification des rôles
- Badge visuel du rôle actuel

**ThresholdSettings**
- Configuration par projet
- Ajout de nouveaux projets
- Modification des seuils
- Toggles de notification par sévérité

## 🚀 Utilisation

### 1. Configuration Initiale

Attribuer le rôle admin au premier utilisateur :

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

### 2. Créer un Projet

1. Aller sur `/quality-admin`
2. Onglet "Quality Thresholds"
3. Entrer le nom du projet
4. Cliquer "Add Project"

### 3. Configurer les Seuils

1. Ajuster les valeurs numériques pour chaque métrique
2. Définir les ratings minimum (A, B, C, D, E)
3. Activer/désactiver les notifications par sévérité
4. Cliquer "Save Changes"

### 4. Gérer les Utilisateurs

1. Onglet "User Roles"
2. Sélectionner le rôle dans le dropdown
3. Le rôle est appliqué immédiatement

### 5. Surveiller les Alertes

**Via le notifier (top bar):**
- Cliquer sur l'icône Bell
- Voir les dernières alertes
- Cliquer pour marquer comme lu
- "View All Alerts" pour le dashboard complet

**Via le dashboard:**
- Onglet "Real-time Alerts"
- Filtrer et rechercher
- Actions en masse (Mark all as read)
- Supprimer les alertes résolues

## 🔄 Flux de Notifications

1. **Webhook GitHub** détecte un push
2. **Edge Function** analyse le code avec OpenAI
3. **check_quality_thresholds()** compare aux seuils
4. **quality_alerts** INSERT si seuil dépassé
5. **Supabase Realtime** broadcaste l'alerte
6. **Frontend** reçoit l'alerte instantanément
7. **Toast notification** apparaît
8. **Badge** s'incrémente
9. **Popover** affiche l'alerte

## 📈 Métriques Surveillées

| Métrique | Type | Seuil Default | Sévérité |
|----------|------|---------------|----------|
| Bugs | INTEGER | 10 | High/Critical |
| Vulnerabilities | INTEGER | 5 | Critical |
| Code Smells | INTEGER | 20 | Medium |
| Coverage | DECIMAL | 80.0% | High |
| Maintainability | RATING | B | Medium |
| Security | RATING | B | High |

## 🎨 Personnalisation

### Ajouter une Nouvelle Métrique

1. **Migration SQL**
```sql
ALTER TABLE quality_thresholds 
ADD COLUMN new_metric_threshold INTEGER DEFAULT 50;
```

2. **Fonction check_quality_thresholds**
```sql
IF p_new_metric > v_threshold.new_metric_threshold THEN
  INSERT INTO quality_alerts (...)
  VALUES (...);
END IF;
```

3. **Interface**
```tsx
<div>
  <Label>New Metric Threshold</Label>
  <Input
    type="number"
    value={threshold.new_metric_threshold}
    onChange={(e) =>
      handleFieldChange(threshold.id, 'new_metric_threshold', parseInt(e.target.value))
    }
  />
</div>
```

### Ajouter un Nouveau Rôle

1. **Modifier l'enum**
```sql
ALTER TYPE app_role ADD VALUE 'super_admin';
```

2. **Mettre à jour les interfaces TypeScript**
```typescript
export type AppRole = 'admin' | 'moderator' | 'user' | 'super_admin';
```

3. **Ajouter les policies RLS**

## 🐛 Dépannage

### Les notifications ne s'affichent pas

1. Vérifier Supabase Realtime est activé
2. Vérifier `REPLICA IDENTITY FULL` sur quality_alerts
3. Vérifier la publication `supabase_realtime`
4. Vérifier les RLS policies

### Les seuils ne se sauvegardent pas

1. Vérifier le rôle admin de l'utilisateur
2. Vérifier les RLS policies sur quality_thresholds
3. Vérifier les logs de la console

### Erreur "Access Denied"

1. Vérifier user_roles pour l'utilisateur
2. Vérifier la fonction has_role()
3. Vérifier les policies RLS

## 📝 TODO

- [ ] Filtres avancés sur les alertes
- [ ] Export des alertes en CSV/PDF
- [ ] Graphiques de tendance
- [ ] Intégration Slack/Discord
- [ ] Email digest hebdomadaire
- [ ] Alertes SMS pour critical
- [ ] Dashboard analytics avancé
- [ ] Historique des modifications de seuils

## 🤝 Contribution

Pour ajouter des fonctionnalités :

1. Créer la migration SQL si nécessaire
2. Créer/modifier les hooks React
3. Créer/modifier les composants UI
4. Ajouter les routes si nécessaire
5. Documenter les changements
6. Tester avec différents rôles

## 📚 Ressources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

## ✅ Checklist de Déploiement

- [x] Migrations SQL exécutées
- [x] RLS policies activées
- [x] Realtime activé sur quality_alerts
- [x] Admin user créé
- [x] Premiers seuils configurés
- [x] Tests des notifications
- [x] Tests des permissions
- [x] Documentation à jour

---

**Version:** 1.0.0  
**Date:** 13 novembre 2025  
**Auteur:** Lovable AI  
**Statut:** ✅ Production Ready
