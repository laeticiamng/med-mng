# 🔐 Security Monitoring & Alerting - Guide d'Implémentation

## 📊 Vue d'Ensemble

Système de monitoring et d'alerting en temps réel pour détecter et répondre aux menaces de sécurité.

### Fonctionnalités Clés
- **Logging centralisé** de tous les événements de sécurité
- **Alertes en temps réel** via Slack/Teams/Email
- **Détection automatique** des patterns d'attaque
- **Dashboard SQL** pour analyse et reporting
- **13 types d'événements** de sécurité trackés

### Événements Trackés
- `UNAUTHORIZED_ACCESS` - Tentative d'accès sans JWT valide
- `FORBIDDEN_ACCESS` - JWT valide mais permissions insuffisantes
- `RATE_LIMIT_EXCEEDED` - Violation des limites de taux
- `SUSPICIOUS_ACTIVITY` - Multiples tentatives échouées
- `DATA_EXPORT` - Export de données sensibles
- `BULK_OPERATION` - Modification massive de données
- `API_KEY_USAGE` - Usage d'API externes (OpenAI, Suno, etc.)
- `WEBHOOK_SIGNATURE_FAIL` - Échec de vérification de signature
- `SQL_INJECTION_ATTEMPT` - Tentative d'injection SQL détectée
- `XSS_ATTEMPT` - Tentative d'attaque XSS détectée
- `BRUTE_FORCE` - Attaque par force brute détectée
- `ACCOUNT_TAKEOVER` - Tentative de prise de contrôle de compte
- `PRIVILEGE_ESCALATION` - Tentative d'escalade de privilèges

---

## 🚀 Installation

### 1. Créer la table `security_events`

```bash
# Exécuter la migration SQL
psql $DATABASE_URL < supabase/migrations/20251119_security_events.sql
```

Ou via Supabase Dashboard:
1. Aller dans SQL Editor
2. Copier le contenu de `supabase/migrations/20251119_security_events.sql`
3. Exécuter

### 2. Vérifier la table

```sql
SELECT * FROM security_events LIMIT 10;
SELECT * FROM security_events_critical;
SELECT * FROM detect_attack_patterns();
```

### 3. Configurer les webhooks (optionnel)

#### Slack Webhook
1. Aller dans Slack App Settings
2. Créer un Incoming Webhook
3. Copier l'URL du webhook
4. Ajouter à Supabase Edge Functions:
```bash
SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

#### Microsoft Teams Webhook
1. Aller dans Teams Channel Settings
2. Ajouter un Connector "Incoming Webhook"
3. Copier l'URL du webhook
4. Ajouter à Supabase Edge Functions:
```bash
TEAMS_SECURITY_WEBHOOK=https://outlook.office.com/webhook/YOUR/WEBHOOK/URL
```

#### Email Alerts
```bash
ALERT_EMAIL=security@med-mng.fr
```

---

## 📝 Usage dans Edge Functions

### Exemple 1: Logging d'un accès non autorisé

```typescript
import { logSecurityEvent } from '../_shared/security-monitoring.ts';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    // ✅ LOGGER l'événement de sécurité
    await logSecurityEvent(supabase, {
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'high',
      endpoint: 'generate-music',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: {
        reason: 'Missing Authorization header',
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  // Continue with authenticated request...
});
```

### Exemple 2: Logging d'un accès interdit (permissions insuffisantes)

```typescript
import { logSecurityEvent } from '../_shared/security-monitoring.ts';

serve(async (req) => {
  // ... vérification auth ...

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const isAdmin = userRoles?.some((r) => r.role === 'admin');

  if (!isAdmin) {
    // ✅ LOGGER l'événement de sécurité avec infos utilisateur
    await logSecurityEvent(supabase, {
      type: 'FORBIDDEN_ACCESS',
      severity: 'high',
      userId: user.id,
      endpoint: 'admin-export',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: {
        reason: 'Admin role required',
        userEmail: user.email,
        attemptedAction: 'export_all_data',
      },
    });

    return new Response(
      JSON.stringify({ error: 'Admin role required' }),
      { status: 403 }
    );
  }

  // Continue with admin operation...
});
```

### Exemple 3: Détection d'activité suspecte

```typescript
import { logSecurityEvent, checkSuspiciousActivity } from '../_shared/security-monitoring.ts';

serve(async (req) => {
  // ... vérification auth échouée ...

  if (authError || !user) {
    // Log l'échec
    await logSecurityEvent(supabase, {
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'medium',
      endpoint: 'protected-endpoint',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    });

    // ✅ VÉRIFIER si c'est un pattern suspect (multiples tentatives)
    const isSuspicious = await checkSuspiciousActivity(
      supabase,
      'anonymous', // ou user.id si disponible
      'protected-endpoint',
      5 // fenêtre de 5 minutes
    );

    if (isSuspicious) {
      // L'alerte est envoyée automatiquement par checkSuspiciousActivity
      console.warn('⚠️ Suspicious activity detected - security team notified');
    }

    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401 }
    );
  }
});
```

### Exemple 4: Logging d'export de données sensibles

```typescript
import { logSecurityEvent } from '../_shared/security-monitoring.ts';

serve(async (req) => {
  // ... auth + admin check ...

  // ✅ LOGGER l'export de données (audit trail)
  await logSecurityEvent(supabase, {
    type: 'DATA_EXPORT',
    severity: 'medium',
    userId: user.id,
    endpoint: 'export-patient-data',
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    details: {
      exportType: 'patient_records',
      recordCount: 150,
      format: 'CSV',
      userEmail: user.email,
    },
  });

  // Perform export...
  const data = await exportPatientData();

  return new Response(JSON.stringify(data));
});
```

### Exemple 5: Logging de rate limit dépassé

```typescript
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { logSecurityEvent } from '../_shared/security-monitoring.ts';

serve(async (req) => {
  // ... auth ...

  const rateLimit = await checkRateLimit(
    supabase,
    user.id,
    'openai-chat',
    { limit: 20, windowMs: 3600000 }
  );

  if (!rateLimit.allowed) {
    // ✅ LOGGER le dépassement de rate limit
    await logSecurityEvent(supabase, {
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'medium',
      userId: user.id,
      endpoint: 'openai-chat',
      details: {
        limit: rateLimit.limit,
        current: rateLimit.remaining + 1,
        resetAt: rateLimit.resetAt,
        userEmail: user.email,
      },
    });

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        resetAt: rateLimit.resetAt,
      }),
      { status: 429 }
    );
  }

  // Continue with API call...
});
```

### Exemple 6: Logging d'usage d'API coûteuse

```typescript
import { logSecurityEvent } from '../_shared/security-monitoring.ts';

serve(async (req) => {
  // ... auth + rate limit ...

  const { prompt } = await req.json();

  // ✅ LOGGER l'usage de l'API OpenAI (tracking de coûts)
  await logSecurityEvent(supabase, {
    type: 'API_KEY_USAGE',
    severity: 'low',
    userId: user.id,
    endpoint: 'openai-chat-gpt4',
    details: {
      apiProvider: 'OpenAI',
      model: 'gpt-4',
      estimatedCost: 0.03, // per 1K tokens
      promptLength: prompt.length,
      userEmail: user.email,
    },
  });

  // Call OpenAI API...
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });

  return new Response(JSON.stringify(response));
});
```

---

## 🎯 Niveaux de Sévérité

### `low` (🟢)
- Usage normal d'API
- Événements informatifs
- Pas d'alerte envoyée

### `medium` (🟡)
- Rate limit dépassé
- Tentative d'accès refusée unique
- Export de données standard
- **Pas d'alerte immédiate** (logged seulement)

### `high` (🟠)
- Accès non autorisé
- Accès interdit (admin required)
- Multiples tentatives échouées
- Échec de signature webhook
- **Alerte envoyée** (Slack/Teams)

### `critical` (🔴)
- Injection SQL détectée
- Attaque XSS détectée
- Brute force détecté
- Prise de contrôle de compte
- Escalade de privilèges
- **Alerte immédiate** (Slack/Teams/Email)

---

## 📊 Monitoring Dashboard

### Requêtes SQL Utiles

#### 1. Événements critiques récents (7 jours)

```sql
SELECT * FROM security_events_critical
ORDER BY timestamp DESC
LIMIT 50;
```

#### 2. Top utilisateurs suspects

```sql
SELECT * FROM security_top_suspicious_users;
```

#### 3. Statistiques par endpoint

```sql
SELECT * FROM security_stats_by_endpoint
ORDER BY total_events DESC;
```

#### 4. Timeline des événements (par heure)

```sql
SELECT
  hour,
  event_type,
  severity,
  event_count
FROM security_events_timeline
WHERE hour > NOW() - INTERVAL '24 hours'
ORDER BY hour DESC, event_count DESC;
```

#### 5. Détecter les patterns d'attaque (5 dernières minutes)

```sql
SELECT * FROM detect_attack_patterns(NULL, 5);
```

#### 6. Détecter les patterns pour un utilisateur spécifique

```sql
SELECT * FROM detect_attack_patterns('USER_UUID_HERE', 60);
```

#### 7. Événements par type (dernières 24h)

```sql
SELECT
  event_type,
  severity,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM security_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY event_type, severity
ORDER BY count DESC;
```

#### 8. IPs suspectes (multiples tentatives)

```sql
SELECT
  ip_address,
  COUNT(*) as attempt_count,
  COUNT(DISTINCT user_id) as unique_users,
  json_agg(DISTINCT event_type) as event_types,
  MAX(timestamp) as last_attempt
FROM security_events
WHERE timestamp > NOW() - INTERVAL '1 hour'
  AND event_type IN ('UNAUTHORIZED_ACCESS', 'BRUTE_FORCE')
  AND ip_address IS NOT NULL
GROUP BY ip_address
HAVING COUNT(*) >= 5
ORDER BY attempt_count DESC;
```

---

## 🔧 Maintenance

### Nettoyage Automatique

#### Option 1: Via SQL Function (Recommandé)

```sql
-- Nettoyer les événements > 30 jours (720 heures)
SELECT cleanup_old_security_events(720);

-- Nettoyer les événements > 7 jours (168 heures)
SELECT cleanup_old_security_events(168);
```

#### Option 2: Via Cron Job (Supabase)

```sql
-- Créer un cron job pour nettoyer chaque jour à 3h du matin
SELECT cron.schedule(
  'cleanup-security-events',
  '0 3 * * *',  -- Every day at 3 AM
  $$SELECT cleanup_old_security_events(720);$$  -- Keep 30 days
);
```

#### Option 3: Via Edge Function

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  // Appeler la fonction de nettoyage
  const { data, error } = await supabase.rpc('cleanup_old_security_events', {
    hours_to_keep: 720, // 30 jours
  });

  if (error) {
    console.error('Cleanup failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }

  console.log(`✅ Cleaned up ${data} old security events`);

  return new Response(
    JSON.stringify({ deletedCount: data }),
    { status: 200 }
  );
});
```

---

## 🚨 Configuration des Alertes

### Format d'Alerte Slack

Les alertes Slack incluent:
- **Couleur** selon la sévérité (vert/orange/rouge/rouge foncé)
- **Emoji** de sévérité (🟢/🟡/🟠/🔴)
- **Champs détaillés**:
  - Severity
  - Event Type
  - Endpoint
  - User ID
  - IP Address
  - Timestamp
- **Footer**: Med-MNG Security System

### Format d'Alerte Teams

Les alertes Teams incluent:
- **MessageCard** formaté
- **Icône de sécurité** (shield)
- **Couleur thématique** selon sévérité
- **Facts** (mêmes champs que Slack)
- **Message détaillé** avec contexte

### Format d'Alerte Email (Critical only)

Les alertes email incluent:
- **HTML formaté** avec styles
- **Header coloré** selon sévérité
- **Sections détaillées** pour chaque champ
- **JSON details** pour informations supplémentaires

### Tester les Alertes

```typescript
import { logSecurityEvent } from '../_shared/security-monitoring.ts';

// Test alerte HIGH (Slack/Teams)
await logSecurityEvent(supabase, {
  type: 'UNAUTHORIZED_ACCESS',
  severity: 'high',
  endpoint: 'test-endpoint',
  details: { test: true },
});

// Test alerte CRITICAL (Slack/Teams/Email)
await logSecurityEvent(supabase, {
  type: 'SQL_INJECTION_ATTEMPT',
  severity: 'critical',
  endpoint: 'test-endpoint',
  details: {
    test: true,
    payload: 'SELECT * FROM users WHERE id = 1 OR 1=1',
  },
});
```

---

## 📈 Métriques & KPIs

### Métriques à Surveiller

1. **Nombre d'événements par jour**
   - Baseline normal: <100 événements/jour
   - Alerte si: >1000 événements/jour

2. **Ratio événements high/critical**
   - Normal: <5% des événements
   - Alerte si: >10% des événements

3. **Temps de réponse aux alertes**
   - Objectif: <5 minutes pour critical
   - Objectif: <1 heure pour high

4. **Taux de faux positifs**
   - Objectif: <10%
   - Action si: >20%

### Dashboard SQL pour KPIs

```sql
-- KPIs de sécurité (dernières 24h)
SELECT
  COUNT(*) as total_events,
  COUNT(CASE WHEN severity IN ('high', 'critical') THEN 1 END) as critical_events,
  ROUND(COUNT(CASE WHEN severity IN ('high', 'critical') THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as critical_ratio_percent,
  COUNT(DISTINCT user_id) as unique_users_affected,
  COUNT(DISTINCT endpoint) as unique_endpoints_targeted,
  COUNT(DISTINCT event_type) as unique_event_types
FROM security_events
WHERE timestamp > NOW() - INTERVAL '24 hours';
```

---

## 💡 Best Practices

### 1. Toujours Logger les Événements de Sécurité

```typescript
// ✅ BON
if (!authHeader) {
  await logSecurityEvent(supabase, {
    type: 'UNAUTHORIZED_ACCESS',
    severity: 'high',
    endpoint: 'my-function',
  });
  return new Response(..., { status: 401 });
}

// ❌ MAUVAIS
if (!authHeader) {
  return new Response(..., { status: 401 }); // Pas de logging
}
```

### 2. Inclure le Contexte Maximum

```typescript
// ✅ BON - Contexte riche
await logSecurityEvent(supabase, {
  type: 'FORBIDDEN_ACCESS',
  severity: 'high',
  userId: user.id,
  endpoint: 'admin-export',
  ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
  userAgent: req.headers.get('user-agent') || 'unknown',
  details: {
    reason: 'Admin role required',
    userEmail: user.email,
    attemptedAction: 'export_all_data',
    timestamp: new Date().toISOString(),
  },
});

// ❌ MAUVAIS - Contexte minimal
await logSecurityEvent(supabase, {
  type: 'FORBIDDEN_ACCESS',
  severity: 'high',
  endpoint: 'admin-export',
});
```

### 3. Utiliser les Bons Niveaux de Sévérité

```typescript
// low: Usage normal API
await logSecurityEvent(supabase, {
  type: 'API_KEY_USAGE',
  severity: 'low', // ✅
  ...
});

// medium: Rate limit, export standard
await logSecurityEvent(supabase, {
  type: 'RATE_LIMIT_EXCEEDED',
  severity: 'medium', // ✅
  ...
});

// high: Accès non autorisé, multiples tentatives
await logSecurityEvent(supabase, {
  type: 'UNAUTHORIZED_ACCESS',
  severity: 'high', // ✅
  ...
});

// critical: Injection, brute force
await logSecurityEvent(supabase, {
  type: 'SQL_INJECTION_ATTEMPT',
  severity: 'critical', // ✅
  ...
});
```

### 4. Ne Pas Logger de Données Sensibles

```typescript
// ✅ BON
await logSecurityEvent(supabase, {
  type: 'BRUTE_FORCE',
  severity: 'critical',
  details: {
    attemptCount: 10,
    // Pas de mots de passe ou tokens
  },
});

// ❌ MAUVAIS
await logSecurityEvent(supabase, {
  type: 'BRUTE_FORCE',
  severity: 'critical',
  details: {
    attemptCount: 10,
    password: 'user-password', // ❌ NE JAMAIS FAIRE ÇA
    token: 'jwt-token', // ❌ NE JAMAIS FAIRE ÇA
  },
});
```

### 5. Utiliser checkSuspiciousActivity Proactivement

```typescript
// ✅ BON - Détection automatique
if (authError) {
  await logSecurityEvent(...);

  // Vérifier si pattern suspect
  const isSuspicious = await checkSuspiciousActivity(
    supabase,
    user?.id || 'anonymous',
    'my-endpoint'
  );

  if (isSuspicious) {
    // L'alerte est déjà envoyée automatiquement
    console.warn('⚠️ Suspicious activity detected');
  }
}
```

---

## 🆘 Troubleshooting

### Problème 1: Alertes Slack ne sont pas envoyées

**Vérifications:**
1. Vérifier que `SLACK_SECURITY_WEBHOOK` est configuré dans Supabase Edge Functions
2. Tester le webhook manuellement:
```bash
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text": "Test alert"}'
```
3. Vérifier les logs de la fonction Edge:
```typescript
console.log('✅ Slack alert sent successfully'); // Doit apparaître
```

### Problème 2: Table security_events n'existe pas

**Solution:**
```sql
-- Vérifier si la table existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'security_events'
);

-- Si FALSE, exécuter la migration
\i supabase/migrations/20251119_security_events.sql
```

### Problème 3: RLS bloque les insertions

**Solution:**
```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'security_events';

-- S'assurer que service_role peut insérer
-- (déjà dans la migration, mais vérifier)
CREATE POLICY "Service role can insert security events"
  ON security_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);
```

### Problème 4: Trop d'alertes (faux positifs)

**Solution:**
1. Ajuster les seuils dans `checkSuspiciousActivity`:
```typescript
// Passer de 3 à 5 tentatives
if (failedAttempts >= 5) { // Au lieu de 3
  await logSecurityEvent(...);
}
```

2. Filtrer par sévérité:
```typescript
// Ne logger que les événements high/critical
if (severity === 'high' || severity === 'critical') {
  await logSecurityEvent(...);
}
```

---

## 📚 Exemples d'Intégration Complète

### Exemple: Fonction Admin avec Monitoring Complet

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { logSecurityEvent, checkSuspiciousActivity } from '../_shared/security-monitoring.ts';
import { checkRateLimit, RATE_LIMITS } from '../_shared/rate-limit.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    // 1. ✅ Vérifier authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      await logSecurityEvent(supabase, {
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'high',
        endpoint: 'admin-bulk-export',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      });

      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. ✅ Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      await logSecurityEvent(supabase, {
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'high',
        endpoint: 'admin-bulk-export',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        details: { reason: 'Invalid or expired token' },
      });

      // Vérifier si activité suspecte
      await checkSuspiciousActivity(supabase, 'anonymous', 'admin-bulk-export');

      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 3. ✅ Vérifier rôle admin
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      await logSecurityEvent(supabase, {
        type: 'FORBIDDEN_ACCESS',
        severity: 'high',
        userId: user.id,
        endpoint: 'admin-bulk-export',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        details: {
          reason: 'Admin role required',
          userEmail: user.email,
        },
      });

      return new Response(
        JSON.stringify({ error: 'Admin role required' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // 4. ✅ Vérifier rate limit
    const rateLimit = await checkRateLimit(
      supabase,
      user.id,
      'admin-bulk-export',
      RATE_LIMITS.ADMIN_BULK
    );

    if (!rateLimit.allowed) {
      await logSecurityEvent(supabase, {
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'medium',
        userId: user.id,
        endpoint: 'admin-bulk-export',
        details: {
          limit: rateLimit.limit,
          current: rateLimit.remaining + 1,
          userEmail: user.email,
        },
      });

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', resetAt: rateLimit.resetAt }),
        { status: 429, headers: corsHeaders }
      );
    }

    // 5. ✅ Logger l'export de données
    await logSecurityEvent(supabase, {
      type: 'BULK_OPERATION',
      severity: 'medium',
      userId: user.id,
      endpoint: 'admin-bulk-export',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      details: {
        action: 'bulk_export_started',
        userEmail: user.email,
      },
    });

    // 6. Effectuer l'export
    const data = await performBulkExport();

    // 7. ✅ Logger le succès
    await logSecurityEvent(supabase, {
      type: 'DATA_EXPORT',
      severity: 'medium',
      userId: user.id,
      endpoint: 'admin-bulk-export',
      details: {
        action: 'bulk_export_completed',
        recordCount: data.length,
        userEmail: user.email,
      },
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    // ✅ Logger les erreurs
    await logSecurityEvent(supabase, {
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'high',
      endpoint: 'admin-bulk-export',
      details: {
        error: error.message,
        stack: error.stack,
      },
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
```

---

## 📊 ROI & Impact

### Sans Monitoring
- **Risque**: Attaques non détectées pendant des jours/semaines
- **Cas réel**: Brute force attack → 10,000 tentatives avant détection manuelle
- **Impact**: Compromission de comptes, fuites de données

### Avec Monitoring
- **Coût implémentation**: $0 (Supabase DB gratuit)
- **Temps dev**: 2-3 heures
- **Détection**: Temps réel (<1 minute)
- **ROI**: Invaluable (prévention de compromissions)

---

## ✅ Checklist d'Implémentation

### Phase 1: Infrastructure (Fait ✅)
- [x] Créer `_shared/security-monitoring.ts`
- [x] Créer migration SQL `security_events` table
- [x] Créer vues et fonctions SQL

### Phase 2: Déploiement (À Faire)
- [ ] Exécuter migration SQL en production
- [ ] Tester la table `security_events`
- [ ] Vérifier RLS policies
- [ ] Configurer webhooks Slack/Teams/Email

### Phase 3: Intégration (À Faire)
- [ ] Intégrer dans toutes les fonctions avec auth
- [ ] Intégrer dans toutes les fonctions admin
- [ ] Intégrer avec rate limiting
- [ ] Tester les alertes

### Phase 4: Monitoring (À Faire)
- [ ] Créer dashboard Supabase
- [ ] Configurer cleanup cron job
- [ ] Tester détection de patterns
- [ ] Former l'équipe sécurité

---

## 🆘 Support

**Questions ou problèmes?**

1. Vérifier que la table `security_events` existe
2. Vérifier que RLS policies sont activées
3. Consulter les logs Supabase
4. Tester avec `SELECT * FROM security_events`

**Contact**: security@med-mng.fr
