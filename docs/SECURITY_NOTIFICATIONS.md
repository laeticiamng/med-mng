# 🔔 Notifications de Sécurité - Configuration

## Vue d'ensemble

Le système de monitoring de sécurité MED-MNG envoie automatiquement des notifications email et Slack pour les alertes critiques détectées.

## 📧 Configuration Email (Resend)

### Prérequis
✅ **Déjà configuré**: `RESEND_API_KEY` est enregistré dans Supabase Secrets

### Configuration de l'email de destination

Pour configurer l'adresse email qui recevra les alertes:

1. Aller dans [Supabase Edge Functions Secrets](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/settings/functions)
2. Ajouter le secret `ALERT_EMAIL` avec l'adresse email de votre choix
3. Par défaut: `admin@example.com`

### Format des emails

Les emails d'alerte incluent:
- **En-tête coloré** selon la sévérité (rouge=critical, orange=high, bleu=medium)
- **Niveau de sévérité** en badge
- **Description détaillée** de l'alerte
- **Métadonnées** (type, ressource affectée, détails)
- **Recommandation** pour résoudre le problème
- **Lien** vers le dashboard de sécurité

## 💬 Configuration Slack (Optionnel)

### Activation des notifications Slack

Pour recevoir les alertes critiques sur Slack:

1. Créer un webhook Slack:
   - Aller sur https://api.slack.com/apps
   - Créer une nouvelle app ou sélectionner une existante
   - Activer "Incoming Webhooks"
   - Créer un nouveau webhook pour le channel désiré
   - Copier l'URL du webhook

2. Configurer dans Supabase:
   - Aller dans [Supabase Edge Functions Secrets](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/settings/functions)
   - Ajouter le secret `SLACK_WEBHOOK_URL` avec l'URL du webhook

### Format des notifications Slack

Les notifications Slack incluent:
- **Header** avec le titre de l'alerte
- **Champs** sévérité et type d'alerte
- **Description** complète
- **Recommandation** pour résoudre
- **Context** avec ressource affectée et horodatage

⚠️ **Note**: Seules les alertes de sévérité `critical` et `high` sont envoyées sur Slack.

## 🤖 Cron Job - Snapshots Automatiques

Pour exécuter automatiquement les snapshots de sécurité toutes les heures:

### 1. Activer les extensions (si pas déjà fait)

```sql
-- Exécuter dans le SQL Editor Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Créer le cron job

```sql
-- Snapshot de sécurité toutes les heures
SELECT cron.schedule(
  'security-metrics-hourly',
  '0 * * * *', -- À chaque heure (minute 0)
  $$
  SELECT
    net.http_post(
      url := 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-metrics',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

### 3. Vérifier les cron jobs actifs

```sql
-- Lister tous les cron jobs
SELECT * FROM cron.job;

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### 4. Désactiver/Supprimer un cron job

```sql
-- Désactiver temporairement
SELECT cron.unschedule('security-metrics-hourly');

-- Ou supprimer définitivement
DELETE FROM cron.job WHERE jobname = 'security-metrics-hourly';
```

## 🎯 Plannings de Cron disponibles

```bash
# Toutes les heures
'0 * * * *'

# Toutes les 4 heures
'0 */4 * * *'

# Tous les jours à 9h00
'0 9 * * *'

# Toutes les 30 minutes
'*/30 * * * *'

# Du lundi au vendredi à 8h00
'0 8 * * 1-5'
```

## 🔍 Monitoring des notifications

### Vérifier les logs des edge functions

1. [Logs security-metrics](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/security-metrics/logs)
2. [Logs send-security-alert](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/send-security-alert/logs)

### Tester manuellement

```bash
# Déclencher un snapshot manuellement
curl -X POST https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-metrics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU" \
  -H "Content-Type: application/json"
```

## 📊 Types d'alertes générées

| Type d'alerte | Sévérité | Déclencheur |
|---------------|----------|-------------|
| `low_security_score` | medium | Score < 90% |
| `rls_missing` | high | Tables sans RLS |
| `critical_vulnerability` | critical | Vulnérabilité critique détectée |
| `policy_misconfiguration` | high | Politique mal configurée |

## 🔒 Sécurité

- ✅ Tous les secrets sont stockés dans Supabase Secrets (chiffrés)
- ✅ Les edge functions utilisent CORS appropriés
- ✅ Les webhooks Slack ne contiennent pas de données sensibles
- ✅ Les emails sont envoyés via Resend (service sécurisé)

## 🆘 Dépannage

### Les emails ne sont pas envoyés

1. Vérifier que `RESEND_API_KEY` est configuré
2. Vérifier que le domaine est validé sur Resend
3. Consulter les [logs send-security-alert](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/send-security-alert/logs)

### Les notifications Slack ne fonctionnent pas

1. Vérifier que `SLACK_WEBHOOK_URL` est configuré
2. Tester le webhook manuellement
3. Vérifier que l'alerte est de sévérité `high` ou `critical`

### Le cron job ne s'exécute pas

1. Vérifier que `pg_cron` et `pg_net` sont activés
2. Consulter `cron.job_run_details` pour les erreurs
3. Vérifier l'URL et le token dans la configuration du cron

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pgcron)
- [Dashboard de sécurité MED-MNG](/security-monitoring)
