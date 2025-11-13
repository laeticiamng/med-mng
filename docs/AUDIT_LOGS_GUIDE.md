# Guide du Système de Logs d'Audit

## Vue d'ensemble

Le système de logs d'audit trace automatiquement toutes les actions effectuées sur les données partagées avec une rétention de 90 jours.

## Architecture

### Base de données

**Table: `share_audit_logs`**
- `id`: Identifiant unique du log
- `user_id`: ID de l'utilisateur qui a effectué l'action
- `user_email`: Email de l'utilisateur pour référence
- `action`: Type d'action (`view`, `create`, `update`, `delete`, `access`)
- `resource_type`: Type de ressource affecté (ex: `sitemap_share`)
- `resource_id`: ID de la ressource
- `details`: Détails JSON de l'action (permissions, changements, etc.)
- `ip_address`: Adresse IP (optionnel, pour traçabilité avancée)
- `user_agent`: Agent utilisateur (optionnel)
- `created_at`: Date et heure de l'action

### Fonctionnalités automatiques

#### 1. Traçage automatique via triggers

Les actions suivantes sont automatiquement loggées :
- **Création de partage**: Enregistre qui, quand, avec qui, et quelles permissions
- **Modification de partage**: Enregistre les anciennes et nouvelles permissions
- **Suppression de partage**: Enregistre les détails du partage supprimé

#### 2. Nettoyage automatique (90 jours)

- Un job cron PostgreSQL s'exécute quotidiennement à 2h du matin
- Supprime automatiquement les logs de plus de 90 jours
- Fonction: `public.cleanup_old_audit_logs()`

#### 3. Sécurité RLS (Row Level Security)

- Les utilisateurs ne peuvent voir que les logs des ressources auxquelles ils ont accès
- Les logs de leurs propres actions
- Les logs des partages qu'ils ont reçus

## Utilisation dans le code

### Hook React: `useAuditLogs`

```typescript
import { useAuditLogs } from '@/hooks/useAuditLogs';

// Dans votre composant
const { data: logs, isLoading } = useAuditLogs({
  resourceId: 'uuid-de-la-ressource', // Optionnel: filtrer par ressource
  resourceType: 'sitemap_share',       // Optionnel: filtrer par type
  action: 'update',                    // Optionnel: filtrer par action
  userId: 'user-uuid',                 // Optionnel: filtrer par utilisateur
  limit: 100,                          // Limite de résultats (défaut: 100)
  days: 30,                            // Période en jours (défaut: 90)
});
```

### Logger manuellement une action

```typescript
import { useLogAuditEvent } from '@/hooks/useAuditLogs';

const { logEvent } = useLogAuditEvent();

// Logger un accès à une ressource
await logEvent(
  'access',
  'sitemap_share',
  resourceId,
  { details: 'Consultation de la sitemap partagée' }
);
```

### Composant UI: `AuditLogsPanel`

```tsx
import { AuditLogsPanel } from '@/components/audit/AuditLogsPanel';

// Afficher tous les logs
<AuditLogsPanel />

// Filtrer par ressource
<AuditLogsPanel 
  resourceId="uuid-de-la-ressource"
  resourceType="sitemap_share"
/>
```

## Intégration dans l'application

### 1. Page d'audit dédiée

Créer une page `/audit` pour afficher tous les logs:

```tsx
import { AuditLogsPanel } from '@/components/audit/AuditLogsPanel';

export default function AuditPage() {
  return (
    <div className="container mx-auto py-8">
      <AuditLogsPanel />
    </div>
  );
}
```

### 2. Panneau latéral dans la gestion des partages

Afficher les logs spécifiques à un partage:

```tsx
<AuditLogsPanel 
  resourceId={shareId}
  resourceType="sitemap_share"
  className="mt-6"
/>
```

## Types d'actions loggées

| Action | Description | Détails enregistrés |
|--------|-------------|---------------------|
| `create` | Création d'un partage | shared_with_user_id, permission, sitemap_id |
| `update` | Modification d'un partage | old_permission, new_permission |
| `delete` | Suppression d'un partage | permission, shared_with_user_id |
| `view` | Consultation d'une ressource | Contexte de consultation |
| `access` | Accès à une ressource | Détails d'accès |

## Requêtes SQL utiles

### Voir tous les logs d'un utilisateur
```sql
SELECT * FROM share_audit_logs 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Logs des dernières 24h
```sql
SELECT * FROM share_audit_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Statistiques par action
```sql
SELECT action, COUNT(*) as count
FROM share_audit_logs
GROUP BY action
ORDER BY count DESC;
```

### Utilisateurs les plus actifs
```sql
SELECT user_email, COUNT(*) as action_count
FROM share_audit_logs
WHERE user_email IS NOT NULL
GROUP BY user_email
ORDER BY action_count DESC
LIMIT 10;
```

## Nettoyage manuel

Si besoin de nettoyer manuellement les logs:

```sql
-- Supprimer les logs de plus de 90 jours
SELECT public.cleanup_old_audit_logs();

-- Supprimer tous les logs (attention!)
TRUNCATE TABLE share_audit_logs;
```

## Conformité et sécurité

- ✅ **RGPD**: Les logs contiennent uniquement les informations nécessaires à l'audit
- ✅ **Rétention**: Nettoyage automatique après 90 jours
- ✅ **Sécurité**: RLS activé, accès restreint aux ressources autorisées
- ✅ **Traçabilité**: Toutes les actions critiques sont enregistrées automatiquement
- ✅ **Performance**: Index sur les colonnes fréquemment interrogées

## Maintenance

### Vérifier le job cron
```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-old-audit-logs';
```

### Voir les exécutions du job
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-old-audit-logs')
ORDER BY start_time DESC
LIMIT 10;
```

### Désactiver temporairement le nettoyage
```sql
SELECT cron.unschedule('cleanup-old-audit-logs');
```

### Réactiver le nettoyage
```sql
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 2 * * *',
  'SELECT public.cleanup_old_audit_logs();'
);
```

## Extension future

Pour ajouter le traçage sur d'autres tables:

1. Créer les fonctions trigger pour la nouvelle table
2. Attacher les triggers
3. Utiliser le même format de log avec `log_share_audit()`

Exemple pour une table `documents`:

```sql
CREATE OR REPLACE FUNCTION audit_document_access()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_share_audit(
    'access',
    'document',
    NEW.id,
    jsonb_build_object('title', NEW.title)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_document_access_trigger
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION audit_document_access();
```
