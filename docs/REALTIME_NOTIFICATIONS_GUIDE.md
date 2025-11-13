# 🔔 Guide des Notifications en Temps Réel

## Vue d'ensemble

Le système de notifications en temps réel utilise Supabase Realtime pour alerter instantanément les administrateurs et security_analysts lors d'activités critiques de sécurité.

## Architecture

### Table `security_notifications`

```sql
CREATE TABLE security_notifications (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  type TEXT CHECK (type IN ('mass_deletion', 'unauthorized_access', 'suspicious_activity', 'system_alert')),
  details JSONB,
  related_user_id UUID,
  related_resource_type TEXT,
  related_resource_id TEXT,
  read_by UUID[],
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

### Réplication en Temps Réel

La table utilise `REPLICA IDENTITY FULL` pour permettre à Supabase Realtime de capturer tous les changements.

## Fonctionnalités

### 1. Détection Automatique

Les notifications sont créées automatiquement par la fonction `security-alerts` lors de :

- **Suppressions Massives** (≥5 suppressions/heure)
  - Severity: `critical` si ≥10, sinon `high`
  - Type: `mass_deletion`

- **Accès Non Autorisés**
  - Severity: `warning`
  - Type: `unauthorized_access`

- **Patterns Suspects** (>20 ressources accédées/heure)
  - Severity: `warning`
  - Type: `suspicious_activity`

### 2. Notifications en Direct

Les utilisateurs avec les rôles `admin` ou `security_analyst` reçoivent :

#### 🔴 Notifications Visuelles
- Badge rouge sur l'icône de cloche
- Popup toast en temps réel
- Liste déroulante avec détails

#### 🔊 Notifications Sonores
- Son distinct selon la sévérité :
  - `info`: 440 Hz (ton bas)
  - `warning`: 554 Hz (ton moyen)
  - `critical`: 659 Hz (ton aigu)

#### 📱 Notifications Toast
- **Critical** : Toast rouge, durée 10s, bouton "Voir"
- **Warning** : Toast orange, durée 7s
- **Info** : Toast bleu, durée 5s

### 3. Interface Utilisateur

#### Cloche de Notification

Située dans la barre de navigation principale :

```tsx
<RealtimeNotificationBell />
```

**Affichage** :
- Badge avec nombre de notifications non lues
- Click pour ouvrir le panneau
- Bouton "Tout marquer comme lu"
- Liste scrollable des notifications
- Temps relatif (Il y a X min/h/j)

#### Détails des Notifications

Chaque notification affiche :
- 🔔 Icône colorée selon la sévérité
- Type d'alerte (emoji + label)
- Titre et message
- Point bleu si non lue
- Timestamp relatif

### 4. Gestion des États

#### Marquer comme Lu

```typescript
const { markAsRead } = useRealtimeNotifications();
await markAsRead(notificationId);
```

#### Marquer Tout comme Lu

```typescript
const { markAllAsRead } = useRealtimeNotifications();
await markAllAsRead();
```

#### Compter les Non Lues

```typescript
const { unreadCount } = useRealtimeNotifications();
// unreadCount contient le nombre de notifications non lues
```

## Implémentation Technique

### Hook Personnalisé

```typescript
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

function MyComponent() {
  const { 
    notifications,     // Liste des notifications
    unreadCount,       // Nombre de non lues
    markAsRead,        // Fonction pour marquer comme lue
    markAllAsRead      // Fonction pour tout marquer
  } = useRealtimeNotifications();
  
  // ...
}
```

### Écoute Realtime

Le hook s'abonne automatiquement aux changements :

```typescript
supabase
  .channel('security-notifications-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'security_notifications'
  }, (payload) => {
    // Nouvelle notification reçue
  })
  .subscribe();
```

### Création de Notification

#### Depuis une Edge Function

```typescript
const { error } = await supabase
  .from('security_notifications')
  .insert({
    title: '🚨 Alerte Critique',
    message: 'Activité suspecte détectée',
    severity: 'critical',
    type: 'mass_deletion',
    details: { /* ... */ }
  });
```

#### Depuis le Client (Admin uniquement)

```typescript
// Seuls les admins peuvent créer des notifications
const { data, error } = await supabase
  .from('security_notifications')
  .insert({
    title: 'Test',
    message: 'Notification de test',
    severity: 'info',
    type: 'system_alert'
  });
```

## Politiques RLS

### Lecture
- ✅ Admins
- ✅ Security Analysts

### Création
- ✅ Admins uniquement

### Mise à Jour
- ✅ Admins et Security Analysts (pour marquer comme lu)

### Suppression
- ✅ Admins uniquement

## Nettoyage Automatique

Les notifications expirent après 7 jours par défaut.

### Fonction de Nettoyage

```sql
SELECT public.cleanup_expired_notifications();
```

### Planification avec pg_cron

```sql
SELECT cron.schedule(
  'cleanup-notifications',
  '0 2 * * *', -- Tous les jours à 2h du matin
  $$
  SELECT public.cleanup_expired_notifications();
  $$
);
```

## Personnalisation

### Modifier la Durée d'Expiration

```sql
-- Dans la table
expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '14 days'
```

### Changer les Sons

Modifiez la fonction `playNotificationSound` dans `useRealtimeNotifications.ts` :

```typescript
const frequencies = {
  info: 440,      // Personnalisez ici
  warning: 554,
  critical: 659,
};
```

### Ajouter de Nouveaux Types

1. Modifier le CHECK constraint :
```sql
ALTER TABLE security_notifications 
DROP CONSTRAINT security_notifications_type_check;

ALTER TABLE security_notifications 
ADD CONSTRAINT security_notifications_type_check 
CHECK (type IN ('mass_deletion', 'unauthorized_access', 'suspicious_activity', 'system_alert', 'new_type'));
```

2. Ajouter le label dans `RealtimeNotificationBell.tsx` :
```typescript
const getTypeLabel = (type: string) => {
  switch (type) {
    // ... existing cases
    case 'new_type':
      return '🆕 Nouveau Type';
  }
};
```

## Tests

### Tester Localement

1. Créer une notification manuellement :
```sql
INSERT INTO security_notifications (title, message, severity, type)
VALUES ('Test', 'Notification de test', 'info', 'system_alert');
```

2. La notification devrait apparaître instantanément dans l'interface

### Tester la Fonction de Sécurité

```bash
curl -X POST \
  https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Monitoring

### Vérifier l'État du Channel

```typescript
const channel = supabase.channel('security-notifications-realtime');
console.log(channel.state); // 'joined' si connecté
```

### Logs Realtime

Les logs de connection/déconnection apparaissent dans la console :
```
New notification received: {...}
✅ Real-time notification created for mass_deletion
```

## Dépannage

### Notifications Non Reçues

1. **Vérifier les rôles** : L'utilisateur doit être admin ou security_analyst
2. **Vérifier RLS** : Les politiques doivent autoriser l'accès
3. **Vérifier le channel** : Le canal Realtime doit être subscribed
4. **Console** : Chercher les erreurs dans DevTools

### Son Non Joué

- Certains navigateurs bloquent l'autoplay
- L'utilisateur doit avoir interagi avec la page au moins une fois
- Vérifier les permissions audio du navigateur

### Badge Non Mis à Jour

- Vérifier que `mark_notification_as_read` fonctionne
- Examiner l'array `read_by` dans la base de données
- S'assurer que l'utilisateur est authentifié

## Sécurité

### Bonnes Pratiques

✅ **À faire** :
- Toujours vérifier les rôles avant d'afficher les notifications
- Utiliser RLS pour protéger l'accès aux données
- Logger toutes les créations de notifications
- Nettoyer régulièrement les notifications expirées

❌ **À éviter** :
- Ne jamais exposer d'informations sensibles dans les notifications
- Ne pas créer de notifications sans vérifier les permissions
- Ne pas désactiver RLS sur cette table

## Performance

### Optimisations

- Index sur `created_at` pour tri rapide
- Index sur `severity` pour filtrage
- Index GIN sur `read_by` pour recherche rapide
- Limite de 50 notifications affichées
- Nettoyage automatique des anciennes notifications

### Métriques

- Temps de réception : < 500ms
- Affichage toast : < 100ms
- Lecture son : < 50ms

## Intégration Future

### Possibilités d'Extension

- 📧 Notifications par email
- 💬 Intégration Slack/Discord
- 📱 Push notifications mobile
- 🔊 Sons personnalisés par type
- 🎨 Thèmes de notification
- 📊 Statistiques de notifications
- 🔍 Recherche dans l'historique
- 📅 Filtres par date/type/sévérité

## Ressources

- [Documentation Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Guide RLS](../SECURITY_ROLES_SETUP.md)
- [Système d'Alertes](../SECURITY_ALERTS_GUIDE.md)

---

**Mis à jour** : Novembre 2024  
**Version** : 1.0
