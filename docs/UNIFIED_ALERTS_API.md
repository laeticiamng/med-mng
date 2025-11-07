# 🔔 API Unifiée d'Alertes (PagerDuty + NVD)

## Vue d'ensemble

Cette fonction Edge Supabase **unifie** trois sources de données externes :
- **PagerDuty** : Incidents et alertes opérationnelles
- **NVD (National Vulnerability Database)** : CVEs et vulnérabilités de sécurité
- **Temps réel** : Diffusion WebSocket via Supabase Realtime

**Objectif** : Remplacer 3 intégrations distinctes par un seul endpoint sécurisé.

---

## ⚙️ Configuration requise

### 1. Secrets Supabase à configurer

Accédez à [Supabase Edge Functions Secrets](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/settings/functions) et ajoutez :

| Secret | Description | Obligatoire |
|--------|-------------|-------------|
| `PAGERDUTY_API_KEY` | Clé API PagerDuty (Token) | ⚠️ Optionnel |
| `PAGERDUTY_INTEGRATION_KEY` | Clé d'intégration PagerDuty | ⚠️ Optionnel |
| `NVD_API_KEY` | Clé API NVD/NIST | ⚠️ Optionnel |

**Note** : Les secrets sont optionnels. L'API fonctionnera même sans ces clés, mais ne retournera des données que pour les sources configurées.

### 2. Obtenir les clés API

#### PagerDuty
1. Connectez-vous à [PagerDuty](https://app.pagerduty.com/)
2. Allez dans **Integrations → API Access Keys**
3. Créez une nouvelle clé API avec permissions `read`
4. Copiez le token généré

#### NVD (National Vulnerability Database)
1. Allez sur [NVD Request API Key](https://nvd.nist.gov/developers/request-an-api-key)
2. Remplissez le formulaire de demande
3. Recevez la clé par email (sous 24-48h)
4. Copiez la clé API

---

## 📡 Utilisation de l'API

### Endpoint

```
POST https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-alerts
```

### Paramètres

| Paramètre | Type | Valeurs | Description |
|-----------|------|---------|-------------|
| `mode` | string | `combined`, `pagerduty`, `nvd` | Source des alertes |

### Exemples d'appel

#### 1. Toutes les sources (par défaut)

```bash
curl -X POST \
  'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-alerts?mode=combined' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'
```

#### 2. PagerDuty uniquement

```bash
curl -X POST \
  'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-alerts?mode=pagerduty' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'
```

#### 3. NVD/CVE uniquement

```bash
curl -X POST \
  'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/unified-alerts?mode=nvd' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'
```

### Réponse JSON

```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "mode": "combined",
  "total": 15,
  "critical": 3,
  "high": 5,
  "medium": 4,
  "low": 3,
  "alerts": [
    {
      "id": "pd-ABC123",
      "source": "pagerduty",
      "severity": "critical",
      "title": "Database CPU High",
      "description": "CPU usage above 90% for 5 minutes",
      "created_at": "2025-01-15T10:25:00.000Z",
      "url": "https://app.pagerduty.com/incidents/ABC123",
      "status": "triggered"
    },
    {
      "id": "nvd-CVE-2025-1234",
      "source": "nvd",
      "severity": "high",
      "title": "CVE-2025-1234",
      "description": "Remote code execution vulnerability in...",
      "created_at": "2025-01-14T08:00:00.000Z",
      "cvss_score": 8.5,
      "url": "https://nvd.nist.gov/vuln/detail/CVE-2025-1234"
    }
  ]
}
```

---

## 🔄 Temps Réel (WebSocket)

### Frontend - Hook React

```typescript
import { useUnifiedAlerts } from '@/hooks/useUnifiedAlerts';

function MyComponent() {
  const { 
    alerts,           // Liste des alertes
    realtimeAlerts,   // Alertes en temps réel
    isLoading,        // État de chargement
    refresh,          // Fonction de rafraîchissement manuel
    stats             // Statistiques (critical, high, medium, low)
  } = useUnifiedAlerts('combined');

  return (
    <div>
      <h2>Alertes Critiques: {stats.critical}</h2>
      {alerts.map(alert => (
        <div key={alert.id}>{alert.title}</div>
      ))}
    </div>
  );
}
```

### Composant UI

```typescript
import { UnifiedAlertsPanel } from '@/components/security/UnifiedAlertsPanel';

function SecurityPage() {
  return (
    <div>
      <UnifiedAlertsPanel />
    </div>
  );
}
```

---

## 🔧 Fonctionnalités

### ✅ Implémenté

- ✅ Agrégation PagerDuty + NVD en un seul appel
- ✅ Tri automatique par sévérité et date
- ✅ Diffusion temps réel via Supabase Broadcast
- ✅ Gestion des erreurs par source (une source en échec n'affecte pas les autres)
- ✅ Filtrage par mode (combined, pagerduty, nvd)
- ✅ Calcul automatique des statistiques
- ✅ Support CORS pour appels frontend
- ✅ Hook React avec state management
- ✅ Composant UI avec tabs et refresh

### 📝 Calcul de sévérité

#### PagerDuty
- `urgency: high` → `critical`
- `urgency: low` → `high`

#### NVD (basé sur CVSS score)
- CVSS ≥ 9.0 → `critical`
- CVSS ≥ 7.0 → `high`
- CVSS ≥ 4.0 → `medium`
- CVSS < 4.0 → `low`

---

## 🎯 Avantages

### Avant (3 intégrations)
```
Frontend → PagerDuty API (PAGERDUTY_API_KEY)
Frontend → NVD API (NVD_API_KEY)
Frontend → WebSocket (WEBSOCKET_KEY)
```

**Problèmes** :
- 3 clés API à gérer
- 3 points de défaillance
- Complexité accrue
- Coûts multiples

### Après (1 intégration)
```
Frontend → Supabase Edge Function (SUPABASE_ANON_KEY)
            ↓
         Unified Alerts
            ↓
    PagerDuty + NVD + WebSocket
```

**Avantages** :
- ✅ 1 seule clé à gérer (SUPABASE_ANON_KEY)
- ✅ Secrets sécurisés côté serveur
- ✅ Gestion centralisée des erreurs
- ✅ Cache et optimisation possibles
- ✅ Temps réel natif via Supabase

---

## 🚀 Déploiement

L'Edge Function est **déployée automatiquement** avec votre projet Lovable.dev.

Aucune action manuelle requise !

---

## 🔐 Sécurité

### Bonnes pratiques

✅ **Secrets côté serveur uniquement**
- Les clés API (PagerDuty, NVD) ne sont jamais exposées au frontend
- Stockées dans Supabase Edge Functions Secrets

✅ **Authentification Supabase**
- L'Edge Function utilise `verify_jwt = false` pour être accessible publiquement
- Mais peut être sécurisée avec RLS si nécessaire

✅ **CORS configuré**
- Headers CORS permettent les appels depuis le frontend

✅ **Gestion des erreurs**
- Une source en échec n'affecte pas les autres
- Logs détaillés pour debugging

---

## 📊 Monitoring

### Logs Edge Function

Accédez aux logs dans Supabase :
1. [Edge Functions Logs](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions)
2. Sélectionnez `unified-alerts`
3. Consultez les logs en temps réel

### Métriques disponibles

```typescript
{
  total: 15,      // Total des alertes
  critical: 3,    // Alertes critiques
  high: 5,        // Alertes élevées
  medium: 4,      // Alertes moyennes
  low: 3          // Alertes faibles
}
```

---

## 🆘 Troubleshooting

### Aucune alerte PagerDuty

1. Vérifiez que `PAGERDUTY_API_KEY` est configuré
2. Testez l'API PagerDuty directement :
   ```bash
   curl -H "Authorization: Token token=YOUR_KEY" \
        -H "Accept: application/vnd.pagerduty+json;version=2" \
        https://api.pagerduty.com/incidents
   ```

### Aucune CVE NVD

1. Vérifiez que `NVD_API_KEY` est configuré
2. Testez l'API NVD directement :
   ```bash
   curl -H "apiKey: YOUR_KEY" \
        "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=5"
   ```

### Temps réel ne fonctionne pas

1. Vérifiez que Supabase Realtime est activé
2. Testez la connexion WebSocket dans les DevTools (Network → WS)
3. Vérifiez les logs de l'Edge Function

---

## 🔗 Liens utiles

- [PagerDuty API Docs](https://developer.pagerduty.com/api-reference/)
- [NVD API Docs](https://nvd.nist.gov/developers)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## 📝 Changelog

### v1.0.0 (2025-01-15)
- ✅ Création de l'Edge Function `unified-alerts`
- ✅ Support PagerDuty + NVD
- ✅ Temps réel via Supabase Broadcast
- ✅ Hook React `useUnifiedAlerts`
- ✅ Composant UI `UnifiedAlertsPanel`
- ✅ Documentation complète

---

**💡 Tip** : Pour toute question ou problème, consultez les logs Edge Function ou ouvrez un ticket support.
