# Configuration du Cron Job pour les Alertes de Dégradation de Performance

Ce document explique comment configurer le cron job qui vérifie automatiquement les dégradations de performance.

## Configuration

La fonction Edge `check-performance-degradation` vérifie périodiquement les performances et crée des alertes si une baisse de plus de 10% est détectée.

## Mise en place du Cron Job (Recommandé: Quotidien)

Pour exécuter automatiquement la vérification chaque jour à 8h du matin, utilisez la requête SQL suivante dans l'éditeur SQL de Supabase :

```sql
-- Activer les extensions nécessaires si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer le cron job
SELECT cron.schedule(
  'check-performance-degradation-daily',
  '0 8 * * *', -- Tous les jours à 8h00 (heure serveur UTC)
  $$
  SELECT
    net.http_post(
      url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/check-performance-degradation',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Autres Fréquences Possibles

### Toutes les heures
```sql
SELECT cron.schedule(
  'check-performance-degradation-hourly',
  '0 * * * *', -- Toutes les heures à la minute 0
  $$ ... $$
);
```

### Deux fois par jour (8h et 20h)
```sql
SELECT cron.schedule(
  'check-performance-degradation-twice-daily',
  '0 8,20 * * *', -- À 8h et 20h
  $$ ... $$
);
```

### Tous les lundis à 9h
```sql
SELECT cron.schedule(
  'check-performance-degradation-weekly',
  '0 9 * * 1', -- Tous les lundis à 9h
  $$ ... $$
);
```

## Gestion des Cron Jobs

### Lister tous les cron jobs
```sql
SELECT * FROM cron.job;
```

### Désactiver un cron job
```sql
SELECT cron.unschedule('check-performance-degradation-daily');
```

### Voir l'historique d'exécution
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-performance-degradation-daily')
ORDER BY start_time DESC
LIMIT 10;
```

## Test Manuel

Vous pouvez tester la fonction manuellement en utilisant curl :

```bash
curl -X POST https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/check-performance-degradation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"
```

## Fonctionnement

1. La fonction compare les performances des 7 derniers jours avec les 7 jours précédents
2. Pour chaque catégorie (timing, platform, volume, quality), elle calcule le score moyen
3. Si une baisse de plus de 10% est détectée, une alerte est créée
4. Les alertes avec une baisse > 20% sont marquées comme "critiques"
5. Les utilisateurs voient les alertes dans le dashboard d'efficacité

## Notifications Push (À Implémenter)

Pour ajouter des notifications push, vous pouvez :
1. Utiliser Firebase Cloud Messaging (FCM)
2. Utiliser Web Push API
3. Intégrer avec un service tiers (OneSignal, Pushover, etc.)

## Logs

Consultez les logs de la fonction dans le dashboard Supabase :
[Logs de check-performance-degradation](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/check-performance-degradation/logs)
