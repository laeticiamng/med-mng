# Backend Générateur - Architecture Robuste et Scalable

## 🎯 Vue d'ensemble

Le backend du générateur de musique a été complètement refactorisé pour garantir:
- **Robustesse**: Gestion atomique des quotas, idempotence, retry logic
- **Scalabilité**: Rate limiting, index optimisés, cleanup automatique
- **Sécurité**: RLS policies, locks pour race conditions, validation

## 🏗️ Architecture

### 1. Système de Quotas (Atomique)

**Tables:**
- `user_ia_quotas`: Quotas par utilisateur avec gestion des périodes
- `quota_locks`: Locks temporaires pour éviter les race conditions

**Fonctions SQL:**

#### `check_and_consume_credits(user_id, credits_required)`
- ✅ **ATOMIQUE**: Lock pessimiste + transaction
- ✅ **Évite race conditions**: Lock temporaire via `quota_locks`
- ✅ **Crée automatiquement**: Quota si n'existe pas
- ✅ **Retourne**: `{success, remaining_credits, message}`

```sql
-- Exemple d'utilisation
SELECT check_and_consume_credits(
  'user-uuid'::UUID,
  1  -- 1 crédit pour génération
);
```

#### `get_user_quota(user_id)`
- ✅ **Rapide**: Lecture seule, pas de lock
- ✅ **Auto-création**: Si quota n'existe pas
- ✅ **Retourne**: `{remaining_credits, total_credits, can_generate}`

#### `cleanup_stuck_generations()`
- ✅ **Cron job**: À exécuter toutes les 5 minutes
- ✅ **Timeout**: Marque comme "failed" après 10 minutes
- ✅ **Retourne**: Nombre de générations nettoyées

### 2. Rate Limiting par Utilisateur

**Table:**
- `user_rate_limits`: Compteur de requêtes par endpoint et fenêtre

**Fonction:**
```sql
check_user_rate_limit(
  user_id UUID,
  endpoint TEXT,
  max_requests INTEGER DEFAULT 10,
  window_minutes INTEGER DEFAULT 5
)
```

**Configuration actuelle:**
- `/quota/check-and-consume`: 20 requêtes / 5 minutes
- Fenêtres glissantes par minute
- Cleanup automatique des vieilles entrées

### 3. Système d'Idempotence

**Table:**
- `idempotency_records`: Enregistre les opérations pour éviter doublons

**Fonctions TypeScript:**
```typescript
// Vérifier si déjà traité
const { canProceed, existingResult } = await checkIdempotency(
  supabase,
  'operation_key_unique',
  userId,
  300 // TTL 5 minutes
);

// Marquer comme complété
await markCompleted(supabase, operationKey, result);

// Marquer comme échoué
await markFailed(supabase, operationKey, error);
```

**Utilisation:**
- Callbacks Suno (évite doublons)
- Opérations critiques
- TTL configurable (défaut 5 minutes)

### 4. Index et Performance

**Index optimisés:**
```sql
-- Status + date pour queries fréquentes
idx_generated_music_tracks_status_updated

-- Task ID pour polling
idx_generated_music_tracks_task_id (filtered)

-- User + status pour historique
idx_generated_music_tracks_user_status

-- Quotas par user
idx_user_ia_quotas_user_id
idx_user_ia_quotas_updated_at

-- Rate limiting
idx_user_rate_limits_cleanup

-- Idempotence
idx_idempotency_created_at
idx_idempotency_user_id
```

## 📡 API Endpoints (med-mng-api)

### GET `/quota`
**Authentifié**: Oui  
**Rate limit**: Non (lecture seule)

**Response:**
```json
{
  "remaining_credits": 160,
  "total_credits": 160,
  "credits_used": 0,
  "can_generate": true,
  "last_reset_at": "2025-01-01T00:00:00Z"
}
```

### POST `/quota/check-and-consume`
**Authentifié**: Oui  
**Rate limit**: 20 req / 5 min

**Request:**
```json
{
  "credits_required": 1,
  "service_type": "music_generation",
  "operation_type": "generate",
  "request_details": {}
}
```

**Response (Success):**
```json
{
  "success": true,
  "remaining_credits": 159,
  "credits_consumed": 1,
  "message": "Crédits consommés avec succès"
}
```

**Response (Insufficient):**
```json
{
  "success": false,
  "error": "INSUFFICIENT_CREDITS",
  "message": "Crédits insuffisants",
  "remaining_credits": 0,
  "required_credits": 1
}
```

**Response (Rate Limited - 429):**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Maximum 20 requêtes par 5 minutes",
  "retry_after_seconds": 300
}
```

### GET `/quota/stats`
**Authentifié**: Oui

**Response:**
```json
{
  "total_generations": 25,
  "completed": 20,
  "generating": 3,
  "failed": 2,
  "last_24h": 5,
  "last_7d": 15,
  "total_duration_seconds": 6000
}
```

## 🔄 Callbacks Suno (Idempotent)

**Edge Function:** `suno-callback`

**Améliorations:**
- ✅ **Idempotence**: Vérifie si déjà traité
- ✅ **Skip doublons**: Retourne immédiatement si déjà processed
- ✅ **Error tracking**: Marque comme failed en cas d'erreur
- ✅ **Priorité au track principal**: Update le track principal en premier

**Flow:**
1. Réception callback
2. Check idempotence (`suno_callback_{taskId}_{type}_{timestamp}`)
3. Si déjà traité → Skip
4. Sinon → Traiter
5. Update track principal avec premier audio disponible
6. Update/Create tracks individuels
7. Mark as completed

## 🔐 Sécurité

### RLS Policies

**user_ia_quotas:**
```sql
-- Users can view own quota
FOR SELECT USING (auth.uid() = user_id)
```

**idempotency_records:**
```sql
-- Users can view own records
FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id)
```

### Locks et Race Conditions

**quota_locks table:**
- Primary key sur `user_id` (un seul lock par user)
- Constraint `CHECK` pour timeout automatique (30 secondes)
- Cleanup automatique via `cleanup_old_quota_locks()`

**Pattern d'utilisation:**
```sql
-- 1. Acquérir lock
INSERT INTO quota_locks (user_id, operation) 
VALUES ($1, 'consume_credits')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Opération avec FOR UPDATE
SELECT * FROM user_ia_quotas 
WHERE user_id = $1 
FOR UPDATE;

-- 3. Libérer lock
DELETE FROM quota_locks WHERE user_id = $1;
```

## 🚀 Scalabilité

### Optimisations

1. **Queries optimisées:**
   - Index sur colonnes fréquemment filtrées
   - Partial indexes pour status spécifiques
   - Compound indexes pour queries complexes

2. **Cleanup automatique:**
   - Vieux locks (> 30 secondes)
   - Rate limits (> 1 heure)
   - Idempotency records (> 1 heure)
   - Générations stuck (> 10 minutes)

3. **Non-blocking operations:**
   - Logging d'usage en arrière-plan
   - Cleanup asynchrone
   - Callbacks non-bloquants

### Métriques de Performance

**Temps de réponse cibles:**
- GET `/quota`: < 50ms
- POST `/quota/check-and-consume`: < 200ms
- Callback processing: < 1s

**Capacité:**
- 1000+ utilisateurs simultanés
- 10,000+ générations/jour
- 100+ callbacks/seconde

## 🔧 Maintenance

### Cron Jobs Recommandés

```bash
# Nettoyage des générations stuck (toutes les 5 minutes)
*/5 * * * * curl -X POST https://your-project.supabase.co/rest/v1/rpc/cleanup_stuck_generations

# Nettoyage des vieux locks (toutes les minutes)
* * * * * curl -X POST https://your-project.supabase.co/rest/v1/rpc/cleanup_old_quota_locks
```

### Monitoring

**Métriques à surveiller:**
- Nombre de générations stuck par jour
- Taux de callbacks dupliqués
- Rate limit hits par endpoint
- Latence moyenne des RPC calls
- Crédits consommés par jour

**Alerts recommandées:**
- Générations stuck > 50
- Rate limit hits > 1000/jour pour un user
- Latence RPC > 500ms
- Callbacks failed > 10%

## 📊 Diagramme d'Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       v                                     v
┌─────────────────┐              ┌──────────────────┐
│  generate-music │              │  med-mng-api     │
│  Edge Function  │              │  /quota/*        │
└────────┬────────┘              └────────┬─────────┘
         │                                │
         │                                v
         │                    ┌───────────────────────┐
         │                    │ check_and_consume     │
         │                    │ - Lock user           │
         │                    │ - Check credits       │
         │                    │ - Consume atomically  │
         │                    │ - Unlock user         │
         │                    └───────────────────────┘
         │
         v
┌─────────────────┐
│   Suno API      │
│  (External)     │
└────────┬────────┘
         │ Callback
         v
┌─────────────────┐
│ suno-callback   │
│ - Idempotence   │
│ - Update tracks │
│ - Mark complete │
└─────────────────┘
```

## ✅ Checklist de Production

- [x] Système de quotas atomique
- [x] Rate limiting par utilisateur
- [x] Idempotence des callbacks
- [x] Index optimisés
- [x] RLS policies
- [x] Cleanup automatique
- [x] Error handling robuste
- [x] Logging complet
- [x] Documentation

## 🔗 Ressources

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Locks](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Idempotency Patterns](https://stripe.com/docs/api/idempotent_requests)
