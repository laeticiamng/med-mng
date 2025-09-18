# Migration vers Rate Limiting Distribué - Documentation

## 🚨 Problème identifié

Le rate limiting précédent utilisait une `Map` locale en mémoire, causant des problèmes dans un environnement distribué:
- **État non partagé**: Chaque instance conservait ses propres compteurs
- **Incohérence**: Un utilisateur pouvait contourner les limites en touchant différentes instances
- **Pas de persistence**: Redémarrage d'instance = perte des compteurs
- **Pas de monitoring centralisé**: Impossible de voir l'état global

## ✅ Solution distribuée implémentée

### 1. Architecture avec abstraction de stockage

#### Interface `RateLimitStore`
```typescript
export interface RateLimitStore {
  checkAndIncrement(identifier: string, windowDurationSeconds: number, maxRequests: number): Promise<RateLimitResult>;
  getStatus(identifier: string, windowDurationSeconds: number, maxRequests: number): Promise<RateLimitResult>;
  cleanup?(): Promise<number>;
  reset?(identifier: string): Promise<void>;
}
```

#### Service principal `RateLimitService`
- ✅ **Injection de dépendance**: Store configurable (Supabase/Redis/Memory)
- ✅ **Configuration flexible**: Window, max requests, key generator custom
- ✅ **Middleware Express**: Intégration transparente
- ✅ **Skip conditions**: Bypass pour certaines requêtes (admin, etc.)

### 2. Implémentations du store

#### `SupabaseRateLimitStore` (Production)
- 🗄️ **Stockage distribué**: Table `rate_limit_counters` en Supabase
- ⚡ **Opérations atomiques**: Fonctions SQL pour increment/check
- 🔄 **Auto-cleanup**: Suppression des compteurs expirés
- 📊 **Monitoring**: Logs structurés et métriques

#### `MemoryRateLimitStore` (Développement/Tests)
- 🏠 **Stockage local**: Map en mémoire pour tests
- 🧹 **Cleanup automatique**: Intervalle configurable
- 📈 **Statistiques**: Compteurs actifs/totaux
- ⚠️ **Avertissement**: Non adapté au déploiement distribué

### 3. Base de données Supabase

#### Table `rate_limit_counters`
```sql
CREATE TABLE public.rate_limit_counters (
  id UUID PRIMARY KEY,
  identifier TEXT NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  max_requests INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Fonctions SQL sécurisées
- ✅ `increment_rate_limit_counter()`: Incrémentation atomique
- ✅ `get_rate_limit_status()`: Status sans incrémentation
- ✅ `cleanup_expired_rate_limit_counters()`: Nettoyage automatique

#### Sécurité
- ✅ **Row Level Security (RLS)**: Activé
- ✅ **Service Role Policy**: Accès contrôlé
- ✅ **Index optimisés**: Performance garantie
- ✅ **Search Path sécurisé**: Protection contre l'injection

## 🔧 Utilisation après migration

### Configuration standard
```typescript
import { RateLimitService } from '@/services/rateLimitService';
import { createSupabaseRateLimitStore } from '@/services/stores/SupabaseRateLimitStore';

const rateLimitService = new RateLimitService(
  createSupabaseRateLimitStore(),
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => req.ip // Par IP
  }
);

// Utilisation comme middleware Express
app.use(rateLimitService.middleware());
```

### Configuration avancée
```typescript
const advancedRateLimit = new RateLimitService(
  createSupabaseRateLimitStore(),
  {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
    // Rate limiting par utilisateur
    keyGenerator: (req) => `user:${req.user?.id || req.ip}`,
    // Skip pour les admins
    skipCondition: (req) => req.user?.role === 'admin'
  }
);
```

### Vérification de statut
```typescript
// Vérifier sans incrémenter
const status = await rateLimitService.getStatus(request);
console.log(`${status.remainingRequests}/${status.maxRequests} remaining`);

// Reset pour un utilisateur spécifique
await rateLimitService.reset(request);
```

## 📊 Comparaison avant/après

| Aspect | Avant (Map locale) | Après (Supabase distribué) |
|--------|-------|-------|
| **Cohérence multi-instance** | ❌ Non | ✅ Oui |
| **Persistence** | ❌ Volatile | ✅ Persistante |
| **Monitoring** | ❌ Local uniquement | ✅ Centralisé |
| **Scalabilité** | ❌ Limitée à 1 instance | ✅ Illimitée |
| **Configuration** | ❌ Hardcodée | ✅ Flexible |
| **Tests** | ❌ Difficiles | ✅ Complets |
| **Performance** | ✅ Très rapide | ✅ Rapide (réseau) |
| **Fallback** | ❌ Aucun | ✅ Memory store disponible |

## 🧪 Tests implémentés

### Tests unitaires (`test/security/rateLimitService.test.ts`)
- ✅ Rate limiting basique (allow/deny)
- ✅ Isolation des identifiants différents
- ✅ Key generators personnalisés
- ✅ Skip conditions
- ✅ Vérification de statut sans incrémentation
- ✅ Reset de compteurs
- ✅ Middleware Express
- ✅ Gestion d'erreurs

### Tests d'intégration multi-instances (`test/security/distributedRateLimit.test.ts`)
- ✅ **Cohérence cross-instance**: Compteurs partagés
- ✅ **Requêtes concurrentes**: Handling atomique
- ✅ **Isolation clients**: Séparation par IP/utilisateur
- ✅ **Headers corrects**: X-RateLimit-* appropriés
- ✅ **Reset de fenêtres**: Comportement après expiration
- ✅ **Gestion d'erreurs**: Fallback gracieux
- ✅ **Key generation custom**: Rate limiting par utilisateur

## 🛡️ Sécurité et robustesse

### Protection contre les contournements
```typescript
// Rate limiting par IP (défaut)
keyGenerator: (req) => req.ip

// Rate limiting par utilisateur authentifié
keyGenerator: (req) => `user:${req.user?.id || req.ip}`

// Rate limiting par API key
keyGenerator: (req) => `api:${req.headers['x-api-key'] || req.ip}`
```

### Gestion des pannes
- ✅ **Fallback gracieux**: Les requêtes continuent si le rate limiting échoue
- ✅ **Logs d'erreurs**: Monitoring des problèmes de stockage
- ✅ **Timeout handling**: Pas de blocage infini
- ✅ **Store switching**: Changement de store à chaud possible

### Monitoring et observabilité
```typescript
// Cleanup manuel avec monitoring
const deletedCount = await rateLimitService.cleanup();
console.log(`${deletedCount} expired counters cleaned up`);

// Métriques en temps réel
const status = await rateLimitService.getStatus(request);
console.log(`Rate limit status: ${JSON.stringify(status)}`);
```

## 🚀 Déploiement et maintenance

### Variables d'environnement
Aucune variable supplémentaire requise - utilise la configuration Supabase existante:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (pour les edge functions)

### Maintenance automatique
- ✅ **Cleanup automatique**: Fonction SQL exécutée périodiquement
- ✅ **Monitoring intégré**: Logs dans Supabase
- ✅ **Métriques de performance**: Temps de réponse, erreurs

### Commandes de maintenance
```sql
-- Voir l'état current des rate limits
SELECT identifier, request_count, max_requests, window_end
FROM public.rate_limit_counters
WHERE window_end > now()
ORDER BY identifier;

-- Cleanup manuel des compteurs expirés
SELECT public.cleanup_expired_rate_limit_counters();

-- Reset pour un client spécifique
DELETE FROM public.rate_limit_counters WHERE identifier = '192.168.1.1';
```

## 📈 Bénéfices obtenus

### Performance
- **Cohérence garantie**: Même comportement sur toutes les instances
- **Évite les contournements**: Protection réelle contre l'abus
- **Cleanup automatique**: Pas d'accumulation de données

### Développement
- **Tests robustes**: Simulation multi-instance
- **Debugging facilité**: Logs centralisés et structurés
- **Configuration flexible**: Adaptation par environnement

### Operations
- **Monitoring centralisé**: Vue d'ensemble des rate limits
- **Maintenance simplifiée**: Commandes SQL directes
- **Scalabilité illimitée**: Support de N instances

---

## 🎯 Migration réussie

✅ **Architecture distribuée** implémentée avec abstraction store  
✅ **Implémentation Supabase** pour la production  
✅ **Fallback mémoire** pour le développement/tests  
✅ **Tests complets** incluant simulation multi-instance  
✅ **Integration Express** transparente avec headers appropriés  

La limitation de débit fonctionne maintenant de manière cohérente sur toutes les instances déployées.
## ⚙️ Variables d'environnement MED-MNG API

La fonction Deno `med-mng-api` expose plusieurs garde-fous configurables via les variables d'environnement suivantes (valeurs par défaut indiquées entre parenthèses) :

| Variable | Description | Valeur par défaut |
| --- | --- | --- |
| `RATE_LIMIT_API_MAX_REQUESTS` | Plafond global par fenêtre pour tout appel à l'API | `120` |
| `RATE_LIMIT_API_WINDOW_SECONDS` | Durée de la fenêtre glissante globale (secondes) | `60` |
| `RATE_LIMIT_API_RETRY_SECONDS` | Délai conseillé avant nouvelle tentative quand la limite globale est atteinte | `60` |
| `RATE_LIMIT_COMPLETE_ITEM_MAX_REQUESTS` | Requêtes autorisées pour `/complete-item/:id` par fenêtre | `6` |
| `RATE_LIMIT_COMPLETE_ITEM_WINDOW_SECONDS` | Fenêtre de contrôle pour la complétion unitaire (secondes) | `300` |
| `RATE_LIMIT_COMPLETE_ITEM_RETRY_SECONDS` | Délai de ré-essai suggéré pour la complétion unitaire | `120` |
| `RATE_LIMIT_COMPLETE_BULK_MAX_REQUESTS` | Nombre d'exécutions `/complete-all` autorisées par fenêtre | `2` |
| `RATE_LIMIT_COMPLETE_BULK_WINDOW_SECONDS` | Fenêtre de contrôle du bulk (secondes) | `3600` |
| `RATE_LIMIT_COMPLETE_BULK_RETRY_SECONDS` | Délai conseillé avant de retenter un bulk | `900` |
| `RATE_LIMIT_RGPD_EXPORT_MAX_REQUESTS` | Limite pour `/rgpd/export` | `3` |
| `RATE_LIMIT_RGPD_EXPORT_WINDOW_SECONDS` | Fenêtre associée au rate limit RGPD (secondes) | `3600` |
| `RATE_LIMIT_RGPD_EXPORT_RETRY_SECONDS` | Délai conseillé avant un nouvel export RGPD | `900` |

⚠️ **Important** : les limites spécifiques s'appuient sur Supabase (`increment_rate_limit_counter`). Veillez à définir `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` côté Edge Functions, sans quoi le throttling repassera en mode permissif.
