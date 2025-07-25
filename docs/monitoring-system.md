# Système de Monitoring Unifié - Axe 3

## Vue d'ensemble

Le système de monitoring unifié fournit une surveillance complète de la plateforme Med-MNG avec :

- **Monitoring en temps réel** des extractions, erreurs système et performances
- **Alertes automatiques** via Discord/Slack pour les incidents critiques  
- **Dashboard unifié** centralisant toutes les métriques importantes
- **Système de santé** surveillant la base de données, edge functions et services

## Architecture

### 1. Components Principaux

#### UnifiedMonitoringDashboard
```typescript
src/components/monitoring/UnifiedMonitoringDashboard.tsx
```
- Dashboard principal avec 4 onglets : Vue d'ensemble, Extractions, Plateforme, Performance
- Métriques temps réel avec auto-refresh configurable
- Alertes critiques en temps réel
- Intégration des dashboards existants

#### MonitoringService
```typescript
src/services/monitoringService.ts
```
- Service central pour le health check et métriques de performance
- Surveillance automatique avec callbacks
- Génération de rapports de santé
- Alertes automatiques pour incidents critiques

#### useRealTimeMonitoring Hook
```typescript
src/hooks/useRealTimeMonitoring.ts
```
- Surveillance temps réel via Supabase subscriptions
- Événements pour extractions, erreurs système, performance, sécurité
- Notifications toast pour événements critiques
- Filtrage par type et sévérité

### 2. Métriques Surveillées

#### Système Global
- Utilisateurs actifs (24h)
- Appels API (24h) 
- Taux d'erreur global
- Temps de réponse moyen

#### Santé des Services
- **Base de données** : Connectivité, performances
- **Edge Functions** : Disponibilité, temps de réponse
- **Authentification** : Sessions actives
- **Stockage** : Utilisation, disponibilité

#### Performance
- API Response Times (P50, P95, P99)
- Performance base de données
- Utilisation des ressources (CPU, Mémoire, Stockage)

### 3. Système d'Alertes

#### Types d'Incidents
```typescript
export type IncidentType =
  | 'EXTRACTION_FAILURE'
  | 'PAYMENT_FAILURE' 
  | 'BACKEND_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'SUPABASE_DOWN';
```

#### Canaux de Notification
- **Discord** : Via webhook pour alertes temps réel
- **Slack** : Intégration workspace pour équipes
- **Toast** : Notifications in-app pour utilisateurs admin

#### Déclencheurs d'Alertes
- Extractions échouées (>1 par heure)
- Taux d'erreur élevé (>5%)
- Temps de réponse critique (>5s)
- Services indisponibles
- Utilisation stockage élevée (>85%)

### 4. Monitoring Temps Réel

#### Subscriptions Supabase
```typescript
// Surveillance extractions
supabase.channel('extraction-monitoring')
  .on('postgres_changes', { table: 'extraction_logs' })

// Surveillance erreurs  
supabase.channel('error-monitoring')
  .on('postgres_changes', { table: 'operation_logs', filter: 'type=eq.error' })
```

#### Événements Surveillés
- **Extractions** : Démarrage, progression, échec, succès
- **Erreurs** : Erreurs système, pannes services
- **Performance** : Requêtes lentes, pics de charge
- **Sécurité** : Tentatives intrusion, violations RLS

## Utilisation

### 1. Accès au Dashboard

```bash
# URL principale
/monitoring

# Onglets disponibles
/monitoring#overview      # Vue d'ensemble  
/monitoring#extractions   # Monitoring extractions
/monitoring#platform      # Santé plateforme
/monitoring#performance   # Métriques performance
```

### 2. Configuration Auto-Refresh

```typescript
// Intervalles disponibles
15s, 30s, 1min, 5min

// Configuration par défaut
refreshInterval: 30 // secondes
autoRefresh: true
```

### 3. Actions Rapides

- **Exporter les logs** : Téléchargement rapport détaillé
- **Nettoyer la base** : Maintenance automatique
- **Redémarrer services** : Restart edge functions

### 4. Intégration Programmatique

#### Utilisation du Service
```typescript
import { monitoringService } from '@/services/monitoringService';

// Health check manuel
const health = await monitoringService.checkSystemHealth();

// Monitoring automatique  
monitoringService.startHealthMonitoring(30000);

// Callback sur changement
const unsubscribe = monitoringService.onHealthChange((health) => {
  console.log('System health:', health.status);
});

// Génération rapport
const report = await monitoringService.generateHealthReport();
```

#### Utilisation du Hook
```typescript
import { useRealTimeMonitoring } from '@/hooks/useRealTimeMonitoring';

function MyComponent() {
  const { events, isConnected, getCriticalEvents } = useRealTimeMonitoring();
  
  const criticalEvents = getCriticalEvents();
  
  return (
    <div>
      <span>Connexion: {isConnected ? '🟢' : '🔴'}</span>
      <span>Événements critiques: {criticalEvents.length}</span>
    </div>
  );
}
```

## Configuration

### 1. Variables d'Environnement

```bash
# Alertes Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Alertes Slack  
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Monitoring Sentry
SENTRY_DSN=https://...@sentry.io/...
```

### 2. Base de Données

#### Tables Requises
- `extraction_logs` : Logs des extractions batch
- `operation_logs` : Logs des opérations système  
- `user_activity_logs` : Activité utilisateurs

#### Fonctions RPC
- `get_activity_stats()` : Statistiques activité
- `get_extraction_status()` : Statut extractions

### 3. Edge Functions

#### med-mng-api
Support du health check :
```typescript
// GET /functions/v1/med-mng-api?action=health_check
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": true,
    "auth": true
  }
}
```

## Tests

### 1. Tests Unitaires (Vitest)
```bash
npm run test src/services/monitoringService.test.ts
npm run test src/hooks/useRealTimeMonitoring.test.ts
```

### 2. Tests E2E (Playwright)
```bash
npm run test:e2e tests/e2e/monitoring/
```

Couvre :
- Navigation dashboard monitoring
- Alertes temps réel
- Auto-refresh fonctionnel
- Export rapports

### 3. Tests de Charge
```bash
# Simulation pic de charge
npm run test:load monitoring
```

## Maintenance

### 1. Nettoyage Automatique

```sql
-- Nettoyage logs anciens (>30 jours)
DELETE FROM operation_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Nettoyage events monitoring (>7 jours)  
DELETE FROM extraction_events
WHERE created_at < NOW() - INTERVAL '7 days';
```

### 2. Optimisation Performance

```sql
-- Index pour requêtes monitoring
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at);
CREATE INDEX idx_extraction_logs_status ON extraction_logs(status);
CREATE INDEX idx_extraction_logs_started_at ON extraction_logs(started_at);
```

### 3. Sauvegarde Métriques

```bash
# Export quotidien métriques
npm run export:metrics --date=2024-01-15

# Sauvegarde dashboard config
npm run backup:monitoring-config
```

## Évolutions Futures

### 1. Métriques Avancées
- Monitoring infrastructure (CPU, RAM, Network)
- Analyse prédictive des pannes
- Corrélation automatique des incidents

### 2. Alertes Intelligentes  
- Machine learning pour réduction faux positifs
- Escalade automatique selon sévérité
- Intégration PagerDuty/OpsGenie

### 3. Visualisations
- Graphiques temps réel (Chart.js)
- Heatmaps de performance
- Timeline des incidents

## Documentation Technique

- **Architecture** : `/docs/monitoring-architecture.md`
- **API Reference** : `/docs/monitoring-api.md`  
- **Troubleshooting** : `/docs/monitoring-troubleshooting.md`
- **Runbook** : `/docs/monitoring-runbook.md`

---

**Status Axe 3** : ✅ COMPLET
- Monitoring unifié fonctionnel
- Alertes temps réel opérationnelles  
- Dashboard centralisé déployé
- Tests complets validés