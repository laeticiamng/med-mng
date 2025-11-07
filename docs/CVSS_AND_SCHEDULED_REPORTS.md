# Calculateur CVSS v3.1 et Rapports Planifiés

## Vue d'ensemble

Deux fonctionnalités avancées pour la gestion de la sécurité :
1. **Calculateur CVSS v3.1** : Évaluation standardisée des vulnérabilités
2. **Rapports Planifiés** : Envoi automatique de rapports par email

## Calculateur CVSS v3.1

### Qu'est-ce que CVSS ?

CVSS (Common Vulnerability Scoring System) est un standard industriel pour évaluer la gravité des vulnérabilités de sécurité informatique.

### Fonctionnalités

#### 1. Calcul Automatique des Scores

**Métriques de Base (obligatoires) :**
- **Attack Vector (AV)** : Network, Adjacent, Local, Physical
- **Attack Complexity (AC)** : Low, High
- **Privileges Required (PR)** : None, Low, High
- **User Interaction (UI)** : None, Required
- **Scope (S)** : Unchanged, Changed
- **Confidentiality Impact (C)** : None, Low, High
- **Integrity Impact (I)** : None, Low, High
- **Availability Impact (A)** : None, Low, High

**Métriques Temporelles (optionnelles) :**
- Exploit Code Maturity
- Remediation Level
- Report Confidence

**Métriques Environnementales (optionnelles) :**
- Confidentiality/Integrity/Availability Requirements

#### 2. Scoring Automatique

Le système calcule automatiquement :
- **Score de Base** (0-10) avec sévérité (None, Low, Medium, High, Critical)
- **Score Temporel** (ajusté selon exploit disponibilité)
- **Score Environnemental** (ajusté selon contexte)
- **Score d'Impact** et **Score d'Exploitabilité**
- **Vecteur CVSS** (format standard)

#### 3. Priorisation des Patches

Le système génère automatiquement :

| Sévérité | Priorité | Délai | Action |
|----------|----------|-------|--------|
| Critical | P1 | 1 jour | Patch immédiat |
| High | P2 | 7 jours | Patch urgent |
| Medium | P3 | 30 jours | Patch rapide |
| Low | P4 | 90 jours | Patch planifié |
| None | P5 | 365 jours | Monitoring |

#### 4. Matrice de Risque

```
Impact vs Exploitabilité:
                 Low      Medium     High
Exploitabilité
High           Medium    High      Critical
Medium         Low       Medium    High
Low            Info      Low       Medium
```

### Utilisation

#### Créer une Évaluation CVSS

1. **Accéder au calculateur** : Security Dashboard → CVSS
2. **Remplir les informations** :
   - Nom de la vulnérabilité
   - CVE ID (optionnel)
   - Description
3. **Configurer les métriques de base** (toutes obligatoires)
4. **Ajouter métriques temporelles/environnementales** (optionnel)
5. **Ajouter des notes**
6. **Enregistrer**

Le système calcule automatiquement :
- Le score CVSS
- La priorité du patch
- La deadline recommandée

#### Consulter les Vulnérabilités

Security Dashboard → Vulnérabilités

**Statistiques affichées :**
- Total vulnérabilités
- Vulnérabilités critiques
- Non patchées
- En retard (deadline dépassée)

**Actions disponibles :**
- Marquer comme patché
- Supprimer (admin uniquement)
- Voir détails complets

### API Hook

```typescript
import { useCVSSAssessments } from '@/hooks/useCVSSAssessments';

function Component() {
  const { 
    assessments,
    criticalVulns,
    unpatchedVulns,
    overdueVulns,
    createAssessment,
    updateAssessment,
    deleteAssessment 
  } = useCVSSAssessments();

  // Créer une évaluation
  createAssessment({
    vulnerability_name: 'SQL Injection',
    description: 'SQLi in login form',
    cve_id: 'CVE-2024-1234',
    metrics: {
      attackVector: 'N',
      attackComplexity: 'L',
      privilegesRequired: 'N',
      userInteraction: 'N',
      scope: 'C',
      confidentialityImpact: 'H',
      integrityImpact: 'H',
      availabilityImpact: 'H'
    },
    notes: 'Found during security audit'
  });

  // Marquer comme patché
  updateAssessment({ 
    id: 'vuln-uuid', 
    patched: true 
  });
}
```

## Rapports Planifiés

### Configuration

#### Créer un Rapport Planifié

1. **Accéder à la configuration** : Security Dashboard → Rapports
2. **Cliquer sur "Nouveau Rapport"**
3. **Choisir la fréquence** :
   - Quotidien (tous les jours)
   - Hebdomadaire (toutes les semaines)
   - Mensuel (tous les mois)
4. **Ajouter des destinataires** (emails)
5. **Créer**

#### Envoyer Manuellement

Cliquez sur "Envoyer Maintenant" pour envoyer un rapport immédiatement sans attendre la planification.

### Contenu des Rapports

Les rapports incluent :
- **Score de sécurité** avec tendance
- **Métriques RLS** (tables, politiques)
- **Alertes critiques** récentes
- **Vulnérabilités CVSS** non patchées
- **Analyse de tendances** sur la période
- **Recommandations d'action**

### Configuration des Cron Jobs

Pour activer l'envoi automatique, configurez les cron jobs Supabase :

#### 1. Activer les Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

#### 2. Créer les Cron Jobs

```sql
-- Rapport Quotidien (tous les jours à 9h)
SELECT cron.schedule(
  'send-daily-security-report',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-scheduled-reports',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{"reportType": "daily"}'::jsonb
  ) as request_id;
  $$
);

-- Rapport Hebdomadaire (tous les lundis à 9h)
SELECT cron.schedule(
  'send-weekly-security-report',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-scheduled-reports',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{"reportType": "weekly"}'::jsonb
  ) as request_id;
  $$
);

-- Rapport Mensuel (le 1er de chaque mois à 9h)
SELECT cron.schedule(
  'send-monthly-security-report',
  '0 9 1 * *',
  $$
  SELECT net.http_post(
    url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-scheduled-reports',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{"reportType": "monthly"}'::jsonb
  ) as request_id;
  $$
);
```

**Remplacez** :
- `yaincoxihiqdksxgrsrk` par votre project ID
- `YOUR_ANON_KEY` par votre clé anon (trouvable dans Supabase Dashboard → Settings → API)

#### 3. Vérifier les Cron Jobs

```sql
-- Lister les cron jobs
SELECT * FROM cron.job;

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

-- Supprimer un cron job
SELECT cron.unschedule('send-daily-security-report');
```

### Personnalisation des Emails

Les emails sont envoyés via Resend. Pour personnaliser :

1. **Design** : Modifier `supabase/functions/send-scheduled-reports/index.ts`
2. **Expéditeur** : Configurer le domaine dans Resend Dashboard
3. **Destinataires** : Gérer dans l'interface UI

## Permissions

### CVSS Calculator
- **Viewer** : Consulter les évaluations
- **Security Analyst** : Créer, modifier, marquer comme patché
- **Admin** : Toutes permissions + supprimer

### Rapports Planifiés
- **Viewer** : Consulter la configuration
- **Security Analyst** : Consulter la configuration
- **Admin** : Créer, modifier, supprimer, envoyer manuellement

## Best Practices

### Évaluation CVSS

1. **Soyez précis** dans les métriques de base
2. **Incluez le CVE ID** si disponible
3. **Ajoutez des notes** pour le contexte
4. **Utilisez les métriques temporelles** si un exploit existe
5. **Réévaluez** après changement de contexte
6. **Marquez comme patché** dès correction

### Rapports Planifiés

1. **Quotidien** : Pour équipes SOC actives
2. **Hebdomadaire** : Pour revues d'équipe régulières
3. **Mensuel** : Pour reporting management
4. **Limitez les destinataires** aux personnes pertinentes
5. **Testez manuellement** avant activation des crons
6. **Surveillez les logs** Supabase pour erreurs

## Intégration avec Autres Outils

### Export CVSS vers SIEM

```typescript
const { assessments } = useCVSSAssessments();

// Format pour Splunk/ELK
const siem Export = assessments.map(a => ({
  timestamp: a.assessed_at,
  vulnerability: a.vulnerability_name,
  cvss_score: a.base_score,
  severity: a.base_severity,
  vector: a.vector_string,
  patched: a.patched
}));
```

### Webhooks pour Nouveaux Rapports

```typescript
// Recevoir notification quand rapport envoyé
supabase
  .from('scheduled_reports')
  .on('UPDATE', payload => {
    if (payload.new.last_sent_at !== payload.old.last_sent_at) {
      // Rapport vient d'être envoyé
      notifyTeam(payload.new);
    }
  })
  .subscribe();
```

## Troubleshooting

### CVSS : Score incohérent
- Vérifier que toutes les métriques de base sont sélectionnées
- S'assurer que Scope est correct (impact majeur sur score)

### Rapports non envoyés
1. Vérifier que `RESEND_API_KEY` est configuré
2. Vérifier que `ALERT_EMAIL` est défini
3. Consulter les logs edge function
4. Vérifier que les cron jobs sont actifs

### Cron jobs ne s'exécutent pas
1. Vérifier que `pg_cron` et `pg_net` sont activés
2. Vérifier l'URL de l'edge function
3. Vérifier que l'anon key est correcte
4. Consulter `cron.job_run_details` pour erreurs

## Roadmap

- [ ] Import CVE automatique depuis NVD
- [ ] Scan automatique de vulnérabilités
- [ ] Intégration Jira pour tracking patches
- [ ] Graphiques de tendances CVSS
- [ ] Export rapports en PDF
- [ ] Notifications Slack pour nouvelles vulnérabilités
