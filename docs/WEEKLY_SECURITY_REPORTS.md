# 📊 Rapports Hebdomadaires de Sécurité

## Vue d'ensemble

Le système de rapports hebdomadaires automatiques génère et envoie par email des statistiques détaillées de sécurité chaque semaine aux administrateurs.

## Fonctionnalités

### 📈 Statistiques Incluses

1. **Activité Globale**
   - Nombre total d'événements de la semaine
   - Nombre d'utilisateurs actifs uniques
   - Tendance par rapport à la semaine précédente (% changement)

2. **Analyse par Type d'Action**
   - Répartition détaillée des actions (view, create, update, delete, access)
   - Nombre d'occurrences pour chaque type

3. **Top 5 des Ressources**
   - Les ressources les plus accédées
   - Nombre d'accès par type de ressource

4. **Activité Suspecte**
   - Détection automatique des suppressions
   - Identification des patterns inhabituels
   - Alerte visuelle si activité suspecte détectée

5. **Comparaison Temporelle**
   - Évolution semaine par semaine
   - Indicateur de tendance (hausse/baisse)

## Configuration

### 1. Secrets Requis

Les secrets suivants doivent être configurés dans Supabase Edge Functions :

```bash
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@votredomaine.com
```

### 2. Configuration du Job Cron

Pour automatiser l'envoi des rapports chaque semaine, créez un job pg_cron :

```sql
-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer le job pour l'envoi hebdomadaire (tous les lundis à 9h)
SELECT cron.schedule(
  'weekly-security-report',
  '0 9 * * 1', -- Tous les lundis à 9h du matin
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/weekly-security-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### 3. Tester Manuellement

Vous pouvez tester la fonction manuellement :

```bash
curl -X POST \
  https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/weekly-security-report \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## Format du Rapport Email

Le rapport email contient :

### En-tête
- Titre avec période couverte
- Design professionnel avec gradient

### Métriques Principales
- Total d'événements (grand chiffre mis en avant)
- Comparaison avec semaine précédente
- Nombre d'utilisateurs actifs

### Alertes
- Section d'avertissement si activité suspecte détectée
- Nombre d'événements suspects identifiés

### Tableaux Détaillés
- **Actions par Type** : Tableau avec toutes les actions et leur fréquence
- **Top 5 Ressources** : Les ressources les plus accédées

### Footer
- Note sur la génération automatique
- Lien vers la plateforme d'administration

## Personnalisation

### Changer la Fréquence

Modifiez le cron pattern dans la requête SQL :

```sql
-- Quotidien à 8h
'0 8 * * *'

-- Bihebdomadaire (lundi et jeudi)
'0 9 * * 1,4'

-- Mensuel (premier jour du mois)
'0 9 1 * *'
```

### Ajouter des Destinataires

Vous pouvez envoyer à plusieurs emails :

1. Modifier la fonction pour accepter une liste d'emails
2. Ou créer plusieurs variables d'environnement : `ADMIN_EMAIL_1`, `ADMIN_EMAIL_2`, etc.

### Personnaliser le Contenu

Modifiez le fichier `supabase/functions/weekly-security-report/index.ts` :

- Ajoutez de nouvelles métriques dans l'interface `SecurityStats`
- Modifiez les requêtes SQL pour extraire d'autres données
- Personnalisez le HTML du rapport

## Gestion des Jobs Cron

### Lister tous les jobs

```sql
SELECT * FROM cron.job;
```

### Désactiver un job

```sql
SELECT cron.unschedule('weekly-security-report');
```

### Voir l'historique d'exécution

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-security-report')
ORDER BY start_time DESC 
LIMIT 10;
```

## Dépannage

### Le rapport n'est pas envoyé

1. Vérifiez que les secrets sont configurés :
   - Dans Supabase Dashboard > Edge Functions > Settings
   
2. Vérifiez les logs de la fonction :
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'weekly-security-report')
   ORDER BY start_time DESC;
   ```

3. Testez manuellement la fonction pour voir les erreurs

### Email non reçu

1. Vérifiez votre clé API Resend
2. Confirmez que le domaine est vérifié dans Resend
3. Vérifiez les spams
4. Consultez les logs Resend : https://resend.com/emails

### Pas de données

Si le rapport ne contient aucune donnée :
- Vérifiez que la table `share_audit_logs` existe
- Vérifiez qu'il y a des logs dans la période
- Vérifiez les permissions RLS sur la table

## Sécurité

- ✅ La fonction utilise `SUPABASE_SERVICE_ROLE_KEY` pour accéder aux logs
- ✅ Les emails sont envoyés via un service tiers sécurisé (Resend)
- ✅ Les données sensibles sont masquées dans le rapport
- ✅ Seuls les administrateurs reçoivent les rapports

## Ressources

- [Documentation Resend](https://resend.com/docs)
- [Documentation pg_cron](https://github.com/citusdata/pg_cron)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
