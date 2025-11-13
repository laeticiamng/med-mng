# Configuration des Tâches Planifiées (CRON)

Ce document explique comment configurer les tâches planifiées pour l'envoi automatique des digests de qualité.

## Prérequis

Les extensions PostgreSQL `pg_cron` et `pg_net` doivent être activées dans votre projet Supabase.

## Configuration du Digest Automatique

### 1. Activer les extensions (si ce n'est pas déjà fait)

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Activer pg_cron pour les tâches planifiées
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Activer pg_net pour les requêtes HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Créer le job CRON pour les digests quotidiens

Exécutez ce SQL pour créer un job qui s'exécute **tous les jours à 9h00** :

```sql
SELECT cron.schedule(
  'send-daily-quality-digests',
  '0 9 * * *', -- Tous les jours à 9h00
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-quality-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
    body := '{"trigger": "cron", "type": "daily"}'::jsonb
  ) AS request_id;
  $$
);
```

### 3. Créer le job CRON pour les digests hebdomadaires

Exécutez ce SQL pour créer un job qui s'exécute **tous les lundis à 9h00** :

```sql
SELECT cron.schedule(
  'send-weekly-quality-digests',
  '0 9 * * 1', -- Tous les lundis à 9h00
  $$
  SELECT net.http_post(
    url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-quality-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
    body := '{"trigger": "cron", "type": "weekly"}'::jsonb
  ) AS request_id;
  $$
);
```

## Format des expressions CRON

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Jour de la semaine (0-6, 0 = Dimanche)
│ │ │ └─── Mois (1-12)
│ │ └───── Jour du mois (1-31)
│ └─────── Heure (0-23)
└───────── Minute (0-59)
```

### Exemples courants :

- `0 9 * * *` - Tous les jours à 9h00
- `0 9 * * 1` - Tous les lundis à 9h00
- `0 */6 * * *` - Toutes les 6 heures
- `0 0 * * *` - Tous les jours à minuit
- `0 9 * * 1-5` - Du lundi au vendredi à 9h00

## Gestion des jobs CRON

### Lister tous les jobs actifs

```sql
SELECT * FROM cron.job;
```

### Désactiver un job

```sql
SELECT cron.unschedule('send-daily-quality-digests');
```

### Modifier un job existant

Vous devez d'abord le désactiver, puis le recréer avec la nouvelle configuration.

## Vérification des exécutions

### Voir l'historique des exécutions

```sql
SELECT 
  jobid,
  runid,
  job_pid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

### Voir les erreurs récentes

```sql
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 10;
```

## Configuration des utilisateurs

Les utilisateurs peuvent configurer leurs préférences de digest dans l'application via la page `/alert-config` :

- **Activation** : Activer/désactiver le digest
- **Fréquence** : Quotidien ou hebdomadaire
- **Jour** : Pour les digests hebdomadaires (lundi par défaut)
- **Heure** : Heure d'envoi souhaitée (9h00 par défaut)
- **Destinataires** : Liste des emails à notifier

## Dépannage

### Le job ne s'exécute pas

1. Vérifier que les extensions sont activées :
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
   ```

2. Vérifier les logs d'exécution :
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
   ```

3. Tester manuellement la fonction :
   ```bash
   curl -X POST \
     'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-quality-digest' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"trigger": "manual"}'
   ```

### Les emails ne sont pas envoyés

1. Vérifier que `RESEND_API_KEY` et `ALERT_EMAIL` sont configurés dans les secrets Supabase
2. Vérifier les logs de la fonction `send-quality-digest` dans Supabase Dashboard
3. Vérifier que le domaine email est validé dans Resend

## Sécurité

⚠️ **Important** : Le token `SUPABASE_ANON_KEY` est utilisé dans les jobs CRON. Ce token est public mais les fonctions doivent avoir `verify_jwt = false` dans `supabase/config.toml` pour être accessibles par CRON.

Les fonctions vérifient toujours les permissions via les politiques RLS de la base de données.
