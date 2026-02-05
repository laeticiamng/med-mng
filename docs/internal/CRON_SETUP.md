# Configuration du Cron Job pour les Alertes de Recommandations

## Instructions de Configuration

Pour activer la vérification automatique quotidienne des alertes de recommandations, suivez ces étapes:

### 1. Vérifier que les extensions sont activées

Les extensions `pg_cron` et `pg_net` doivent être activées dans votre projet Supabase. Elles le sont déjà.

### 2. Créer le cron job

Exécutez la commande SQL suivante dans votre éditeur SQL Supabase (remplacez les valeurs entre crochets):

```sql
select
  cron.schedule(
    'check-recommendation-alerts-daily',
    '0 0 * * *', -- Tous les jours à minuit UTC
    $$
    select
      net.http_post(
          url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/check-recommendation-alerts',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
          body:='{"scheduled": true}'::jsonb
      ) as request_id;
    $$
  );
```

### 3. Vérifier que le cron job est créé

```sql
SELECT * FROM cron.job WHERE jobname = 'check-recommendation-alerts-daily';
```

### 4. Tester manuellement (optionnel)

Pour tester immédiatement sans attendre minuit:

```sql
select
  net.http_post(
      url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/check-recommendation-alerts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
      body:='{"manual_test": true}'::jsonb
  );
```

### 5. Supprimer le cron job (si nécessaire)

Si vous devez supprimer ou recréer le cron job:

```sql
SELECT cron.unschedule('check-recommendation-alerts-daily');
```

### 6. Réactiver le cron avec surveillance post-run

Après validation de l’état **OK**, réactivez le cron puis surveillez son premier passage:

1. **(Re)créer le cron job** (si supprimé)
   ```sql
   SELECT cron.schedule(
     'check-recommendation-alerts-daily',
     '0 0 * * *',
     $$ SELECT net.http_post(
          url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/check-recommendation-alerts',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
          body:='{"scheduled": true}'::jsonb
        ) as request_id; $$);
   ```

2. **Surveiller le premier run**
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-recommendation-alerts-daily')
   ORDER BY start_time DESC
   LIMIT 1;
   ```
   - Statut `succeeded`
   - Aucune erreur dans les logs Supabase (Edge Function)

## Comment ça fonctionne

1. **Suivi automatique**: Quand une recommandation avec un score > 70 est générée, elle est automatiquement ajoutée à la table `recommendation_alerts`

2. **Vérification quotidienne**: Le cron job s'exécute tous les jours à minuit et:
   - Vérifie toutes les alertes actives
   - Pour chaque alerte non appliquée depuis > 7 jours avec score > 70, déclenche l'alerte
   - Met à jour automatiquement le statut des recommandations appliquées

3. **Affichage des alertes**: Le composant `RecommendationAlertsPanel` affiche:
   - Les alertes déclenchées (urgentes, en rouge)
   - Les recommandations suivies (pas encore 7 jours)
   - Le décompte des jours restants avant alerte

4. **Actions utilisateur**:
   - Ignorer une alerte (bouton X)
   - Appliquer une recommandation (via le panel de recommandations)
   - Les alertes disparaissent automatiquement une fois la recommandation appliquée

## Fréquence du cron job

Le cron job est configuré pour s'exécuter quotidiennement à minuit UTC (`0 0 * * *`).

Vous pouvez modifier cette fréquence:
- `0 */6 * * *` - Toutes les 6 heures
- `0 */12 * * *` - Toutes les 12 heures
- `0 8 * * *` - Tous les jours à 8h du matin
- `0 0 * * 1` - Tous les lundis à minuit

## Dépannage

Si les alertes ne se déclenchent pas:

1. Vérifiez que le cron job est actif:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'check-recommendation-alerts-daily';
   ```

2. Vérifiez les logs du cron job:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-recommendation-alerts-daily')
   ORDER BY start_time DESC
   LIMIT 10;
   ```

3. Testez manuellement l'edge function:
   - Allez dans l'onglet Edge Functions de votre dashboard Supabase
   - Appelez `check-recommendation-alerts`
   - Vérifiez les logs
