# 📋 Guide d'Implémentation Backend Complet

## Overview
Ce guide couvre l'implémentation complète du backend Supabase pour les Phases 1, 2, 3 de la plateforme MedMNG.

---

## 🚀 Phase 1: Setup Initial

### 1.1 Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer les credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 1.2 Exécuter le schéma SQL
1. Copier le contenu de `SCHEMA_COMPLETE_BACKEND.sql`
2. Aller dans Supabase Dashboard > SQL Editor
3. Créer une nouvelle query
4. Coller et exécuter le SQL

### 1.3 Vérifier la création des tables
```sql
SELECT * FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 1.4 Vérifier les RLS
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🔐 Phase 2: Row Level Security (RLS)

### 2.1 Concepts clés
- **RLS Policies**: Règles d'accès au niveau des lignes
- **Authentication**: Utilise `auth.uid()` pour identifier l'utilisateur
- **Authorization**: Policies définissent qui peut faire quoi

### 2.2 Vérifier les policies
```sql
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2.3 Tester les policies
```sql
-- En tant qu'utilisateur anonyme
SELECT * FROM public.user_favorites;  -- Doit échouer

-- Après authentification, ne voir que ses favoris
SELECT * FROM public.user_favorites;  -- Doit retourner uniquement ses données
```

---

## 🔧 Phase 3: Configurations et Webhooks

### 3.1 Variables d'environnement
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_KEY=your-service-key  # Pour les admin functions
```

### 3.2 Webhooks pour notifications temps réel
Supabase > Database > Webhooks

```json
{
  "name": "user_activity_logger",
  "table": "user_activity",
  "events": ["INSERT"],
  "webhook": "https://your-api.com/webhooks/activity",
  "method": "POST"
}
```

### 3.3 Fonctions Edge (optionnel)
```sql
CREATE OR REPLACE FUNCTION public.send_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Envoyer notification via Supabase Realtime
  PERFORM pg_notify(
    'activity',
    json_build_object('user_id', NEW.user_id, 'action', NEW.action)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Tables et Schémas

### Phase 1: Analytics & Favorites
| Table | Rows | Purpose |
|-------|------|---------|
| `analytics_events` | ∞ | Event tracking |
| `user_favorites` | ~1000 | Favoris |

### Phase 2: Security
| Table | Rows | Purpose |
|-------|------|---------|
| `user_2fa` | 1 per user | 2FA config |
| `user_connected_devices` | ~5 per user | Device tracking |
| `user_session_logs` | ~100 per user | Session history |
| `user_activity` | ~1000 per user | Activity log |

### Phase 3: Collaboration
| Table | Rows | Purpose |
|-------|------|---------|
| `user_playlists` | ~20 per user | Playlists |
| `playlist_collaborators` | ~5 per playlist | Collaborators |
| `playlist_activity` | ~50 per playlist | Activity |
| `product_reviews` | ~100 per product | Reviews |
| `review_votes` | ~1000 total | Votes |
| `conversations` | ~10 per user | Conversations |
| `direct_messages` | ~1000 per conversation | Messages |

---

## 🎯 Stratégie de Performance

### Indexing
```sql
-- Créés automatiquement via SCHEMA_COMPLETE_BACKEND.sql
-- Vérifier:
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Query Optimization
1. **Utiliser les index**: WHERE clauses avec colonnes indexées
2. **Limiter les résultats**: Toujours utiliser LIMIT
3. **Eager loading**: Charger les relations associées avec SELECT

### Exemple optimisé
```typescript
// Bon ❌
const { data } = await supabase
  .from('user_playlists')
  .select(`
    *,
    playlist_collaborators(id, user_name, permission),
    playlist_activity(action, created_at)
  `)
  .eq('is_collaborative', true)
  .limit(10);
```

---

## 🔄 Supabase Realtime Setup

### 1. Activer Realtime pour les tables
```sql
-- Dans Supabase Dashboard > Realtime
-- Sélectionner les tables pour realtime:
- direct_messages ✅
- conversations ✅
- playlist_activity ✅
- user_activity ✅
```

### 2. Écouter les changements
```typescript
const channel = supabase
  .channel('direct_messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'direct_messages' },
    (payload) => {
      console.log('New message:', payload);
    }
  )
  .subscribe();
```

---

## 📱 Storage pour fichiers

### Configuration
Supabase > Storage > Create bucket

```typescript
// Créer bucket
const { data, error } = await supabase
  .storage
  .createBucket('user-files', {
    public: false,
    allowedMimeTypes: ['image/*', 'video/*'],
    fileSizeLimit: 52428800 // 50MB
  });
```

### Upload fichier
```typescript
const { data, error } = await supabase.storage
  .from('user-files')
  .upload(`${userId}/reviews/${fileName}`, file);
```

---

## 🚨 Backup et Disaster Recovery

### 1. Backups automatiques
Supabase > Database > Backups
- ✅ Automatique tous les jours
- ✅ Rétention: 7-30 jours

### 2. Export manuel
```bash
# Via Supabase CLI
supabase db dump --db-url "postgresql://..." > backup.sql
```

### 3. Restore
```bash
# Restaurer depuis backup
psql -U postgres -d postgres < backup.sql
```

---

## 🧪 Testing

### Test RLS Policies
```typescript
// Test comme utilisateur authentifié
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password'
});

// Puis essayer d'accéder aux données
const { data: favorites } = await supabase
  .from('user_favorites')
  .select('*');
```

### Test Realtime
```typescript
// Créer un channel
const channel = supabase.channel('test');

channel.on('broadcast', { event: 'test' }, (payload) => {
  console.log('Received:', payload);
}).subscribe();

// Envoyer un message
channel.send({
  type: 'broadcast',
  event: 'test',
  payload: { message: 'Hello' }
});
```

---

## 📈 Monitoring

### 1. Database Stats
```sql
-- Taille des tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Query Performance
```sql
-- Top slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 3. Logs
Supabase > Logs (SQL, Realtime, Storage)

---

## 🔗 Intégration avec TypeScript

### 1. Types database.ts
```typescript
import type { Database } from '@/types/database';

const supabase = createClient<Database>(url, key);

// Maintenant avec types complets!
const { data } = await supabase
  .from('user_favorites')
  .select('*');
// data est typé comme UserFavorite[]
```

### 2. Services supabaseService.ts
```typescript
import { favoritesService, reviewService } from '@/services/supabaseService';

// Utiliser les services
await favoritesService.addFavorite('123', 'song', 'Mon chanson');
const reviews = await reviewService.getProductReviews('product-id');
```

---

## 🚀 Déploiement

### 1. Avant le déploiement
- [ ] Exécuter le schéma SQL en production
- [ ] Vérifier les RLS policies
- [ ] Configurer les variables d'environnement
- [ ] Activer Realtime pour les tables nécessaires
- [ ] Créer les buckets Storage
- [ ] Configurer les webhooks si needed
- [ ] Tester avec différents utilisateurs

### 2. Post-déploiement
- [ ] Vérifier les logs de Supabase
- [ ] Monitorer la performance des queries
- [ ] Vérifier les webhooks
- [ ] Tester les fonctionnalités en production

---

## 📚 Ressources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 Troubleshooting

### Problème: RLS block all access
**Solution**: Vérifier les policies, utiliser `SECURITY DEFINER` si needed

### Problème: Realtime not working
**Solution**:
1. Vérifier que Realtime est activé pour la table
2. Utiliser `broadcast` ou `postgres_changes`
3. Vérifier que le canal est subscribé

### Problème: Slow queries
**Solution**:
1. Créer les index nécessaires
2. Utiliser EXPLAIN ANALYZE
3. Limiter les résultats avec LIMIT
4. Utiliser les Foreign Keys pour eager loading

---

**Last Updated**: November 2025
**Version**: 3.0 (Complete Backend)
