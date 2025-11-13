# ⏰ Configuration du Job pg_cron pour Alertes Automatiques

## Vue d'ensemble

Ce guide explique comment configurer un job pg_cron dans Supabase pour exécuter automatiquement la fonction `security-alerts` toutes les heures et surveiller les activités suspectes.

## Prérequis

### 1. Extensions PostgreSQL requises

Les extensions suivantes doivent être activées dans votre projet Supabase:

```sql
-- Vérifier que les extensions sont activées
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');

-- Si elles ne sont pas activées, les activer:
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

> **Note**: Les extensions `pg_cron` et `pg_net` sont généralement déjà activées par défaut dans Supabase.

### 2. Edge Function déployée

Vérifier que la fonction `security-alerts` est déployée:
- URL: https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts
- Statut: Actif

## Configuration du Job pg_cron

### Étape 1: Ouvrir le SQL Editor

1. Accéder au SQL Editor Supabase:
   - https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/sql/new

### Étape 2: Créer le Job Cron

**Option A: Exécution toutes les heures (Recommandé)**

```sql
-- Créer un job qui s'exécute toutes les heures
SELECT cron.schedule(
  'security-alerts-hourly',           -- Nom du job
  '0 * * * *',                        -- Cron expression: à la minute 0 de chaque heure
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);
```

**Option B: Exécution toutes les 30 minutes (Surveillance rapprochée)**

```sql
-- Job toutes les 30 minutes
SELECT cron.schedule(
  'security-alerts-30min',
  '*/30 * * * *',                     -- Toutes les 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);
```

**Option C: Exécution tous les jours à une heure précise**

```sql
-- Job quotidien à 9h du matin
SELECT cron.schedule(
  'security-alerts-daily',
  '0 9 * * *',                        -- Chaque jour à 9h00
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);
```

## Comprendre la syntaxe Cron

Format: `minute heure jour mois jour_semaine`

| Expression | Signification |
|------------|---------------|
| `0 * * * *` | Toutes les heures à la minute 0 |
| `*/30 * * * *` | Toutes les 30 minutes |
| `0 */2 * * *` | Toutes les 2 heures |
| `0 9 * * *` | Chaque jour à 9h |
| `0 9 * * 1` | Chaque lundi à 9h |
| `0 9 1 * *` | Le 1er de chaque mois à 9h |

## Gestion des Jobs Cron

### Lister tous les jobs actifs

```sql
-- Voir tous les jobs cron configurés
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
ORDER BY jobid;
```

### Désactiver temporairement un job

```sql
-- Désactiver sans supprimer
UPDATE cron.job 
SET active = false 
WHERE jobname = 'security-alerts-hourly';

-- Réactiver
UPDATE cron.job 
SET active = true 
WHERE jobname = 'security-alerts-hourly';
```

### Supprimer un job

```sql
-- Supprimer définitivement un job
SELECT cron.unschedule('security-alerts-hourly');
```

### Modifier la fréquence d'un job

```sql
-- Supprimer l'ancien job
SELECT cron.unschedule('security-alerts-hourly');

-- Créer un nouveau job avec la nouvelle fréquence
SELECT cron.schedule(
  'security-alerts-hourly',
  '*/15 * * * *',  -- Nouvelle fréquence: toutes les 15 minutes
  $$ ... $$
);
```

## Monitoring et Logs

### Vérifier l'historique d'exécution

```sql
-- Voir les 10 dernières exécutions
SELECT 
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### Vérifier les erreurs

```sql
-- Voir uniquement les exécutions échouées
SELECT 
  runid,
  jobid,
  status,
  return_message,
  start_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 20;
```

### Logs de la fonction Edge

Pour voir les logs détaillés de la fonction `security-alerts`:
- https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/security-alerts/logs

## Exemple de Logs Attendus

### Exécution réussie

```json
{
  "timestamp": "2024-11-13T14:00:00Z",
  "level": "info",
  "msg": "Security alerts check completed",
  "alertsSent": 2,
  "activities": [
    {
      "type": "mass_deletion",
      "severity": "critical",
      "userId": "uuid-here",
      "description": "Suppression massive détectée: 12 suppressions"
    }
  ]
}
```

### Exécution sans alerte

```json
{
  "timestamp": "2024-11-13T15:00:00Z",
  "level": "info",
  "msg": "Security alerts check completed",
  "alertsSent": 0,
  "activities": []
}
```

## Tests et Validation

### Test manuel du job

```sql
-- Exécuter manuellement le code du job
SELECT net.http_post(
  url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
  ),
  body := jsonb_build_object('time', now()::text)
) AS request_id;
```

### Créer des activités de test

```sql
-- Insérer des logs de test pour déclencher une alerte
DO $$
DECLARE
  test_user_id uuid := (SELECT id FROM auth.users LIMIT 1);
BEGIN
  FOR i IN 1..12 LOOP
    INSERT INTO share_audit_logs (
      user_id,
      user_email,
      action,
      resource_type,
      resource_id
    ) VALUES (
      test_user_id,
      'test@example.com',
      'delete',
      'sitemap',
      'test-' || i
    );
  END LOOP;
END $$;

-- Attendre 1 minute puis vérifier les emails reçus
```

## Bonnes Pratiques

### 1. Choisir la bonne fréquence

| Fréquence | Utilisation recommandée |
|-----------|-------------------------|
| Toutes les heures | Production standard |
| Toutes les 30 min | Surveillance rapprochée |
| Toutes les 4 heures | Environnement de test |
| Une fois par jour | Rapports quotidiens |

### 2. Gérer les notifications

```typescript
// Dans security-alerts/index.ts
// Éviter le spam d'emails pour les petites activités
if (suspiciousActivities.length > 0 && 
    suspiciousActivities.some(a => a.severity === 'critical' || a.severity === 'high')) {
  // Envoyer l'email uniquement pour les alertes importantes
}
```

### 3. Rotation des logs cron

```sql
-- Nettoyer les vieux logs d'exécution (>30 jours)
DELETE FROM cron.job_run_details 
WHERE start_time < NOW() - INTERVAL '30 days';
```

## Dépannage

### ❌ Le job ne s'exécute pas

1. **Vérifier que le job est actif**:
```sql
SELECT * FROM cron.job WHERE jobname = 'security-alerts-hourly';
```

2. **Vérifier les extensions**:
```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
```

3. **Vérifier les permissions**:
```sql
SELECT has_database_privilege(current_user, current_database(), 'CREATE');
```

### ❌ Erreur "could not establish connection"

- Vérifier que l'URL de la fonction est correcte
- Vérifier que l'anon key n'a pas expiré
- Vérifier que la fonction est déployée

### ❌ Job exécuté mais pas d'emails

1. Vérifier les logs de la fonction Edge
2. Vérifier que RESEND_API_KEY est configuré
3. Vérifier que des activités suspectes existent dans les logs

## Monitoring Avancé

### Dashboard de surveillance

```sql
-- Statistiques d'exécution des jobs
SELECT 
  j.jobname,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE jrd.status = 'succeeded') as successful_runs,
  COUNT(*) FILTER (WHERE jrd.status = 'failed') as failed_runs,
  AVG(EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time))) as avg_duration_seconds
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
WHERE j.jobname LIKE 'security-alerts%'
  AND jrd.start_time > NOW() - INTERVAL '7 days'
GROUP BY j.jobname;
```

### Alertes sur les échecs

```sql
-- Créer une alerte si trop d'échecs
CREATE OR REPLACE FUNCTION check_cron_health()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  failed_count integer;
BEGIN
  SELECT COUNT(*) INTO failed_count
  FROM cron.job_run_details
  WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'security-alerts-hourly')
    AND status = 'failed'
    AND start_time > NOW() - INTERVAL '1 day';
  
  IF failed_count > 5 THEN
    RAISE NOTICE 'ALERT: More than 5 cron job failures in the last 24 hours!';
  END IF;
END;
$$;
```

## Ressources

- [Documentation pg_cron](https://github.com/citusdata/pg_cron)
- [Documentation pg_net](https://github.com/supabase/pg_net)
- [Cron Expression Generator](https://crontab.guru/)

---

**🔧 Support**: En cas de problème avec la configuration du cron, consulter les logs d'exécution dans le SQL Editor et vérifier que les extensions sont bien activées.
