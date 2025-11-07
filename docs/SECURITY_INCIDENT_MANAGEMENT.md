# Système de Gestion des Incidents de Sécurité

## Vue d'ensemble

Le système de gestion des incidents de sécurité offre un workflow complet pour détecter, escalader et résoudre les incidents de sécurité.

## Fonctionnalités

### 1. Détection Automatique
- Monitoring continu des métriques de sécurité
- Détection automatique des anomalies
- Création automatique d'incidents pour les problèmes critiques

### 2. Workflow de Gestion

#### Statuts des Incidents
- **Open** : Incident nouvellement détecté
- **Acknowledged** : Incident reconnu par l'équipe
- **Investigating** : Enquête en cours
- **Escalated** : Escaladé à un niveau supérieur
- **Resolved** : Incident résolu

#### Niveaux de Sévérité
- **Critical** : Nécessite une action immédiate
- **High** : Action requise sous 24h
- **Medium** : Action requise sous 1 semaine
- **Low** : À traiter lors de la maintenance

### 3. Escalade
- Assignment à des responsables spécifiques
- Notifications automatiques par email
- Tracking de l'escalade dans l'historique

### 4. Résolution
- Ajout de notes de résolution
- Horodatage automatique
- Historique complet des actions

## Export de Rapports PDF

### Génération Automatique
Le système génère des rapports PDF détaillés contenant :
- Score de sécurité global avec tendance
- Métriques RLS (tables, politiques, fonctions)
- Alertes actives par sévérité
- Recommandations personnalisées
- Graphiques d'évolution

### Utilisation
```typescript
// Dans le dashboard
<Button onClick={exportPDFReport}>
  <FileText className="h-4 w-4 mr-1" />
  Export PDF
</Button>
```

## Tests Automatisés RLS

### Suite de Tests
Les tests vérifient automatiquement :
- Isolation des données entre utilisateurs
- Permissions CRUD par table
- Accès en lecture seule sur tables publiques
- Protection des tables sensibles (audit_logs)
- Détection de régressions RLS

### Exécution des Tests
```bash
# Lancer tous les tests RLS
npm run test test/rls-security.test.ts

# Tests en mode watch
npm run test:watch test/rls-security.test.ts
```

### Configuration Requise
Créer `.env.test` avec :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Scénarios de Tests

#### Test 1 : Création de données
```typescript
it('should allow users to create their own items', async () => {
  // Vérifie que les utilisateurs peuvent créer leurs propres données
});
```

#### Test 2 : Isolation des données
```typescript
it('should prevent users from accessing other users items', async () => {
  // Vérifie que User 2 ne peut pas voir les données de User 1
});
```

#### Test 3 : Protection en modification
```typescript
it('should prevent users from updating other users items', async () => {
  // Vérifie que les modifications inter-utilisateurs sont bloquées
});
```

#### Test 4 : Détection de régression
```typescript
it('should detect if RLS is disabled on critical tables', async () => {
  // Vérifie que RLS est toujours activé sur les tables critiques
});
```

## API Edge Functions

### generate-security-report
Génère un rapport HTML/PDF complet.

**Endpoint:** `generate-security-report`

**Réponse:**
```json
{
  "success": true,
  "html": "...",
  "metrics": { "security_score": 95, ... },
  "alerts": [...],
  "historical": [...]
}
```

## Intégration dans l'Application

### Hook useSecurityIncidents
```typescript
import { useSecurityIncidents } from '@/hooks/useSecurityIncidents';

function Component() {
  const { 
    incidents, 
    criticalIncidents, 
    updateIncidentStatus,
    escalateIncident 
  } = useSecurityIncidents();

  // Utilisation...
}
```

### Composant IncidentManagement
```typescript
import { IncidentManagement } from '@/components/security/IncidentManagement';

function SecurityPage() {
  return <IncidentManagement />;
}
```

## Notifications

### Email (Resend)
Les notifications sont envoyées automatiquement pour :
- Nouveaux incidents critiques
- Escalades d'incidents
- Changements de statut importants

Configuration requise :
- `RESEND_API_KEY` : Clé API Resend
- `ALERT_EMAIL` : Email destinataire

### Slack (Optionnel)
Configuration requise :
- `SLACK_WEBHOOK_URL` : URL webhook Slack

## Métriques et KPIs

### Tableau de Bord
- **Incidents Actifs** : Nombre total d'incidents non résolus
- **Incidents Critiques** : Nécessitant une attention immédiate
- **Taux de Résolution** : Pourcentage d'incidents résolus
- **Temps de Résolution Moyen** : Performance de l'équipe

## Best Practices

### 1. Reconnaissance Rapide
Reconnaître les incidents dans les 15 minutes suivant la détection.

### 2. Investigation Structurée
- Documenter les étapes d'investigation
- Identifier la cause racine
- Évaluer l'impact

### 3. Communication
- Notifier les parties prenantes
- Maintenir un historique détaillé
- Partager les lessons learned

### 4. Prévention
- Analyser les incidents récurrents
- Mettre en place des mesures préventives
- Améliorer les politiques RLS

## Automatisation CI/CD

### GitHub Actions
```yaml
name: Security Tests
on: [push, pull_request]
jobs:
  rls-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run RLS Tests
        run: npm run test test/rls-security.test.ts
```

## Support et Documentation

Pour toute question :
- Consulter la documentation Supabase RLS
- Vérifier les logs dans le dashboard
- Contacter l'équipe DevOps

## Roadmap

- [ ] Intégration avec PagerDuty
- [ ] Webhooks personnalisés
- [ ] ML pour détection d'anomalies
- [ ] Rapports planifiés automatiques
- [ ] Intégration SIEM
