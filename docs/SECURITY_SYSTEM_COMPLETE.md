# 🛡️ Système de Sécurité Complet

## Vue d'ensemble

Ce document regroupe toute la documentation du système de sécurité et d'audit de la plateforme.

## 📚 Table des matières

1. [Gestion des Rôles](#gestion-des-rôles)
2. [Logs d'Audit](#logs-daudit)
3. [Alertes de Sécurité](#alertes-de-sécurité)
4. [Rapports Hebdomadaires](#rapports-hebdomadaires)
5. [Configuration Complète](#configuration-complète)

---

## 1. Gestion des Rôles

### Page d'Administration des Rôles
**URL**: `/admin/roles`

Interface web pour gérer visuellement les rôles des utilisateurs.

### Rôles Disponibles

#### 🔴 Admin
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs et rôles
- Configuration système
- Accès à toutes les données

#### 🟡 Security Analyst
- Accès aux logs d'audit (/audit-security)
- Surveillance de sécurité
- Consultation des rapports
- **Lecture seule** - pas de modifications

#### 🟢 Viewer
- Accès en lecture seule
- Contenu éducatif public
- Pas d'accès aux fonctionnalités admin

### Assignation de Rôles

#### Via Interface Web
1. Connectez-vous en tant qu'admin
2. Accédez à `/admin/roles`
3. Sélectionnez un rôle dans le menu déroulant
4. Cliquez sur "Assigner" à côté de l'utilisateur

#### Via SQL
```sql
-- Assigner un rôle
INSERT INTO user_roles (user_id, role, assigned_by)
VALUES ('user-uuid', 'security_analyst', 'admin-uuid');

-- Retirer un rôle
DELETE FROM user_roles 
WHERE user_id = 'user-uuid' AND role = 'security_analyst';
```

---

## 2. Logs d'Audit

### Page de Consultation
**URL**: `/audit-security`

### Fonctionnalités

- **Dashboard** : Vue d'ensemble avec statistiques
- **Logs détaillés** : Table avec filtres et recherche
- **Export CSV** : Pour analyse externe
- **Graphiques** : Visualisation des tendances

### Types d'Événements Tracés

- `view` : Consultation de ressources
- `create` : Création de contenu
- `update` : Modification de données
- `delete` : Suppression (⚠️ activité surveillée)
- `access` : Accès système

### Structure d'un Log

```typescript
{
  id: string;
  user_id: string;
  user_email: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'access';
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}
```

---

## 3. Alertes de Sécurité

### Fonction : `security-alerts`

#### Détection Automatique

1. **Suppressions Massives**
   - Seuil : 10+ suppressions en 1 heure
   - Gravité : 🔴 Critique

2. **Accès Non Autorisés**
   - Tentatives d'accès à ressources protégées
   - Échecs d'authentification multiples
   - Gravité : 🟠 Moyenne

3. **Patterns Suspects**
   - Activité inhabituelle
   - Horaires anormaux
   - Gravité : 🟡 Faible

#### Configuration

```bash
# Secrets requis
RESEND_API_KEY=votre_clé_resend
ADMIN_EMAIL=admin@votredomaine.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/... (optionnel)
```

#### Déclenchement Automatique

Job cron configuré pour vérifier toutes les heures :

```sql
SELECT cron.schedule(
  'security-alerts-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## 4. Rapports Hebdomadaires

### Fonction : `weekly-security-report`

#### Contenu du Rapport

1. **Métriques Principales**
   - Total d'événements
   - Utilisateurs actifs uniques
   - Tendance vs semaine précédente

2. **Analyse Détaillée**
   - Actions par type
   - Top 5 ressources accédées
   - Activité suspecte détectée

3. **Visualisation**
   - Tableaux comparatifs
   - Indicateurs de tendance
   - Alertes visuelles

#### Planification

Envoi automatique tous les lundis à 9h :

```sql
SELECT cron.schedule(
  'weekly-security-report',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/weekly-security-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## 5. Configuration Complète

### Prérequis

1. **Compte Resend**
   - Créez un compte sur https://resend.com
   - Générez une API key
   - Vérifiez votre domaine d'envoi

2. **Extensions Supabase**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

### Installation Pas à Pas

#### Étape 1 : Configurer les Secrets

Dans Supabase Dashboard > Edge Functions > Settings :

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
ADMIN_EMAIL=admin@votredomaine.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx (optionnel)
```

#### Étape 2 : Exécuter les Scripts SQL

1. **Rôles et Permissions**
   ```bash
   # Exécuter scripts/setup-security-analyst.sql
   ```

2. **Alertes Automatiques**
   ```bash
   # Voir docs/SECURITY_CRON_SETUP.md
   ```

3. **Rapports Hebdomadaires**
   ```bash
   # Exécuter scripts/setup-weekly-reports.sql
   ```

#### Étape 3 : Tester

```bash
# Test alertes
curl -X POST https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/security-alerts \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test rapport
curl -X POST https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/weekly-security-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Monitoring

#### Vérifier les Jobs Cron

```sql
-- Liste des jobs
SELECT * FROM cron.job;

-- Historique d'exécution
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

#### Logs Edge Functions

- Dashboard Supabase > Functions > [nom-fonction] > Logs
- Liens directs :
  - [Logs security-alerts](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/security-alerts/logs)
  - [Logs weekly-security-report](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/weekly-security-report/logs)

---

## 🚨 Dépannage

### Emails Non Reçus

1. Vérifiez la clé API Resend
2. Confirmez la vérification du domaine
3. Consultez https://resend.com/emails
4. Vérifiez les spams

### Jobs Cron Non Exécutés

```sql
-- Vérifier statut
SELECT * FROM cron.job WHERE active = true;

-- Voir erreurs
SELECT * FROM cron.job_run_details 
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Pas de Données dans les Rapports

1. Vérifiez que `share_audit_logs` contient des données :
   ```sql
   SELECT COUNT(*) FROM share_audit_logs;
   ```

2. Vérifiez la période :
   ```sql
   SELECT MIN(created_at), MAX(created_at) 
   FROM share_audit_logs;
   ```

---

## 📊 Métriques de Succès

- ✅ Temps de détection : < 1 heure
- ✅ Taux de faux positifs : < 5%
- ✅ Disponibilité des logs : 99.9%
- ✅ Délai d'envoi rapport : < 1 minute

---

## 🔒 Sécurité

- Utilisation de `SUPABASE_SERVICE_ROLE_KEY` pour accès privilégié
- RLS activé sur toutes les tables sensibles
- Secrets stockés de manière sécurisée
- Communications chiffrées (TLS)
- Logs d'audit immuables

---

## 📝 Changelog

### Version 1.0 (Novembre 2024)
- ✅ Système de rôles (admin, security_analyst, viewer)
- ✅ Page de gestion des rôles `/admin/roles`
- ✅ Logs d'audit complets
- ✅ Alertes automatiques par email
- ✅ Rapports hebdomadaires
- ✅ Dashboard de visualisation

---

## 📚 Ressources

- [Guide d'alertes](./SECURITY_ALERTS_GUIDE.md)
- [Configuration des rôles](./SECURITY_ROLES_SETUP.md)
- [Configuration cron](./SECURITY_CRON_SETUP.md)
- [Rapports hebdomadaires](./WEEKLY_SECURITY_REPORTS.md)

---

## 🤝 Support

Pour toute question ou problème :
1. Consultez les logs de la fonction concernée
2. Vérifiez la configuration des secrets
3. Testez manuellement les fonctions
4. Consultez la documentation Supabase
