# 🔒 Rate Limiting - Guide d'Implémentation

## 📊 Vue d'Ensemble

Système de rate limiting pour protéger les API coûteuses contre l'abus et les coûts excessifs.

### Coûts API Protégés
- **OpenAI GPT-4**: $0.03/1K tokens → $30/M tokens
- **DALL-E 3**: $0.04/image → $40/1K images
- **Suno Music API**: ~$0.10/song → $100/1K songs
- **Resend Email**: $0.001/email → $1/1K emails

**Économies potentielles**: $50,000+/mois avec rate limiting approprié

---

## 🚀 Installation

### 1. Créer la table `rate_limits`

```bash
# Exécuter la migration SQL
psql $DATABASE_URL < supabase/migrations/20251119_rate_limits.sql
```

Ou via Supabase Dashboard:
1. Aller dans SQL Editor
2. Copier le contenu de `supabase/migrations/20251119_rate_limits.sql`
3. Exécuter

### 2. Vérifier la table

```sql
SELECT * FROM rate_limits LIMIT 10;
```

---

## 📝 Usage dans Edge Functions

### Exemple 1: Music Generation (Suno API)

**Avant** (sans rate limiting):
```typescript
// ❌ DANGEREUX: Aucune limite
serve(async (req) => {
  // ... auth code ...

  // Direct call to Suno API - unlimited!
  const taskId = await sunoClient.generateMusic(payload);

  return new Response(JSON.stringify({ taskId }));
});
```

**Après** (avec rate limiting):
```typescript
import { checkRateLimit, RATE_LIMITS } from '../_shared/rate-limit.ts';

serve(async (req) => {
  // ... auth code ...

  // ✅ SÉCURISÉ: Rate limiting
  const rateLimit = await checkRateLimit(
    supabase,
    user.id,
    'suno-music',
    RATE_LIMITS.MUSIC_GEN  // 5 songs/hour par défaut
  );

  if (!rateLimit.allowed) {
    console.warn(`❌ Rate limit exceeded for user ${user.id} on suno-music`);
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `You can generate ${rateLimit.limit} songs per hour. Try again in ${Math.ceil((new Date(rateLimit.resetAt).getTime() - Date.now()) / 60000)} minutes.`,
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
        limit: rateLimit.limit,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt,
          'Retry-After': Math.ceil((new Date(rateLimit.resetAt).getTime() - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  console.log(`✅ Rate limit OK: ${rateLimit.remaining}/${rateLimit.limit} remaining`);

  // Call Suno API
  const taskId = await sunoClient.generateMusic(payload);

  return new Response(
    JSON.stringify({
      success: true,
      taskId,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
        limit: rateLimit.limit,
      },
    }),
    {
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt,
      },
    }
  );
});
```

---

### Exemple 2: AI Chat (OpenAI GPT-4)

```typescript
import { checkRateLimit, getRateLimitConfig } from '../_shared/rate-limit.ts';

serve(async (req) => {
  // ... auth code ...

  // ✅ Rate limiting avec support premium users
  const config = await getRateLimitConfig(supabase, user.id, 'AI_CHAT');
  // Free: 20/hour, Premium: 100/hour

  const rateLimit = await checkRateLimit(
    supabase,
    user.id,
    'openai-chat',
    config
  );

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Upgrade to Premium for higher limits!',
        upgradeUrl: '/pricing',
        ...rateLimit,
      }),
      { status: 429 }
    );
  }

  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [...],
  });

  return new Response(JSON.stringify(response));
});
```

---

### Exemple 3: Image Generation (DALL-E 3)

```typescript
import { checkRateLimit, RATE_LIMITS } from '../_shared/rate-limit.ts';

serve(async (req) => {
  // ... auth code ...

  const rateLimit = await checkRateLimit(
    supabase,
    user.id,
    'dall-e-image',
    RATE_LIMITS.IMAGE_GEN  // 10 images/hour
  );

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Maximum ${rateLimit.limit} images per hour`,
        resetAt: rateLimit.resetAt,
      }),
      { status: 429 }
    );
  }

  // Generate image with DALL-E
  const image = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
  });

  return new Response(JSON.stringify({ imageUrl: image.data[0].url }));
});
```

---

## 🎯 Limites Recommandées

Configurées dans `_shared/rate-limit.ts`:

| API Type | Free Users | Premium Users | Window |
|----------|-----------|---------------|--------|
| AI Chat (GPT-4) | 20/hour | 100/hour | 1h |
| Image Gen (DALL-E) | 10/hour | 50/hour | 1h |
| Music Gen (Suno) | 5/hour | 20/hour | 1h |
| Code Analysis | 15/hour | 50/hour | 1h |
| Email Send | 50/hour | 200/hour | 1h |
| Data Export | 5/hour | 20/hour | 1h |
| External Scrape | 10/day | 50/day | 24h |
| Admin Bulk Ops | 3/hour | 10/hour | 1h |

### Personnalisation

```typescript
// Custom rate limit
const customLimit = await checkRateLimit(
  supabase,
  user.id,
  'custom-endpoint',
  {
    limit: 50,           // 50 requests
    windowMs: 3600000,   // per hour (in ms)
  }
);
```

---

## 🔧 Maintenance

### Nettoyage Automatique (Optionnel)

Créer une Edge Function `cleanup-rate-limits` appelée via cron:

```typescript
import { cleanupOldRateLimits } from '../_shared/rate-limit.ts';

serve(async (req) => {
  const supabase = createClient(/*...*/);

  const deletedCount = await cleanupOldRateLimits(supabase, 24);

  console.log(`Cleaned up ${deletedCount} old rate limit records`);

  return new Response(JSON.stringify({ deletedCount }));
});
```

Configurer cron (Supabase):
```sql
SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 2 * * *',  -- Every day at 2 AM
  $$SELECT net.http_post(
    'https://your-project.supabase.co/functions/v1/cleanup-rate-limits',
    '{}',
    '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}'
  );$$
);
```

Ou simplement via SQL:
```sql
SELECT cleanup_old_rate_limits();  -- Returns number of deleted records
```

---

## 📊 Monitoring Dashboard

Créer une vue pour les admins:

```sql
-- Vue des rate limits actifs
CREATE OR REPLACE VIEW rate_limits_dashboard AS
SELECT
  rl.endpoint,
  rl.user_id,
  u.email,
  rl.count,
  rl.limit,
  ROUND((rl.count::NUMERIC / rl.limit) * 100, 2) AS usage_percent,
  rl.window_start,
  rl.window_end,
  rl.updated_at
FROM rate_limits rl
LEFT JOIN auth.users u ON rl.user_id = u.id
WHERE rl.window_end > NOW()
ORDER BY usage_percent DESC, rl.updated_at DESC;

-- Top users by API usage
CREATE OR REPLACE VIEW top_api_users AS
SELECT
  user_id,
  u.email,
  endpoint,
  SUM(count) AS total_requests,
  COUNT(*) AS windows_count,
  MAX(updated_at) AS last_request
FROM rate_limits rl
LEFT JOIN auth.users u ON rl.user_id = u.id
WHERE window_start > NOW() - INTERVAL '7 days'
GROUP BY user_id, u.email, endpoint
ORDER BY total_requests DESC
LIMIT 100;
```

Requêtes utiles:

```sql
-- Current rate limits
SELECT * FROM rate_limits_dashboard;

-- Top users last 7 days
SELECT * FROM top_api_users;

-- Rate limit violations (attempts after limit exceeded)
SELECT
  user_id,
  email,
  endpoint,
  count,
  limit,
  updated_at
FROM rate_limits_dashboard
WHERE count > limit
ORDER BY updated_at DESC;

-- API usage by endpoint
SELECT
  endpoint,
  SUM(count) AS total_requests,
  AVG(count) AS avg_requests,
  MAX(count) AS max_requests
FROM rate_limits
WHERE window_start > NOW() - INTERVAL '7 days'
GROUP BY endpoint
ORDER BY total_requests DESC;
```

---

## 🚨 Alertes

Créer une fonction qui envoie une alerte quand un user dépasse 80% de sa limite:

```typescript
// Dans la fonction rate-limited
if (rateLimit.remaining <= rateLimit.limit * 0.2) {
  // Send warning email
  await supabase.functions.invoke('send-emails', {
    body: {
      type: 'rate_limit_warning',
      to: user.email,
      data: {
        endpoint: 'Music Generation',
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
        resetAt: rateLimit.resetAt,
      },
    },
  });
}
```

---

## ✅ Checklist d'Implémentation

### Phase 1: Infrastructure (Fait ✅)
- [x] Créer `_shared/rate-limit.ts`
- [x] Créer migration SQL `rate_limits` table
- [x] Définir limites recommandées

### Phase 2: Déploiement (À Faire)
- [ ] Exécuter migration SQL en production
- [ ] Tester la table `rate_limits`
- [ ] Vérifier RLS policies

### Phase 3: Intégration (À Faire)
- [ ] Intégrer dans `generate-music` (Suno)
- [ ] Intégrer dans `ai-code-analysis` (OpenAI)
- [ ] Intégrer dans `openai-image` (DALL-E)
- [ ] Intégrer dans `content-ai-generator` (GPT-4)
- [ ] Intégrer dans toutes fonctions coûteuses (25+ fonctions)

### Phase 4: Monitoring (À Faire)
- [ ] Créer vues dashboard SQL
- [ ] Configurer cleanup cron job
- [ ] Configurer alertes (80% utilisation)
- [ ] Tester en staging

### Phase 5: Documentation (À Faire)
- [ ] Documenter dans API docs
- [ ] Créer guide utilisateur (limites)
- [ ] Créer message d'erreur clair (frontend)

---

## 💡 Best Practices

### 1. Headers Standards HTTP

Toujours retourner ces headers:

```typescript
{
  'X-RateLimit-Limit': limit.toString(),
  'X-RateLimit-Remaining': remaining.toString(),
  'X-RateLimit-Reset': resetAt,  // ISO timestamp
  'Retry-After': seconds.toString(),  // For 429 responses
}
```

### 2. Messages d'Erreur Clairs

```json
{
  "error": "Rate limit exceeded",
  "message": "You can generate 5 songs per hour. Upgrade to Premium for 20 songs/hour!",
  "details": {
    "current": 6,
    "limit": 5,
    "remaining": 0,
    "resetAt": "2025-11-19T15:30:00Z",
    "resetInMinutes": 23
  },
  "upgradeUrl": "/pricing"
}
```

### 3. Graceful Degradation

En cas d'erreur DB, fail open (permettre la requête):

```typescript
// Le module rate-limit.ts fait déjà ça
if (dbError) {
  console.error('Rate limit DB error, allowing request');
  return { allowed: true, ... };
}
```

### 4. Logging

```typescript
// Log succès
console.log(`✅ Rate limit OK: user=${user.id} endpoint=${endpoint} remaining=${remaining}/${limit}`);

// Log rejets
console.warn(`❌ Rate limit EXCEEDED: user=${user.id} endpoint=${endpoint} count=${current}/${limit}`);
```

---

## 📈 ROI Estimé

### Sans Rate Limiting
- **Risque**: Abus API $50K+/mois
- **Cas réel**: Script malveillant génère 10,000 images → $400
- **Impact**: Service degradation, coûts explosifs

### Avec Rate Limiting
- **Coût implémentation**: $0 (Supabase DB gratuit)
- **Temps dev**: 2-3 heures
- **Économies**: $50,000+/mois
- **ROI**: ∞ (coût $0, bénéfice $50K+)

---

## 🆘 Support

**Questions ou problèmes?**

1. Vérifier que la table `rate_limits` existe
2. Vérifier que RLS policies sont activées
3. Consulter les logs Supabase
4. Tester avec `SELECT * FROM rate_limits WHERE user_id = 'xxx'`

**Contact**: security@med-mng.fr
