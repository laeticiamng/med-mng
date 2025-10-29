# 📊 Système de Monitoring & Logs - MED-MNG

## ✅ Vue d'ensemble

Système complet de monitoring et logging pour suivre la performance de la génération musicale en temps réel.

## 🎯 Composants

### 1. Base de Données - Métriques

**Table: `music_generation_metrics`**
```sql
- track_id: UUID du track
- user_id: UUID de l'utilisateur (nullable)
- content_type: Type de contenu (edn/ecos/oic)
- item_code: Code de l'item
- rang: Rang (A/B/AB)
- style: Style musical
- status: Statut (initiated/generating/completed/failed/timeout)
- initiated_at: Début génération
- completed_at: Fin génération
- failed_at: Date d'échec
- duration_seconds: Durée totale (auto-calculée)
- api_response_time_ms: Temps de réponse API
- polling_attempts: Nombre de tentatives polling
- audio_generated: Boolean si audio généré
- audio_url: URL de l'audio
- error_message: Message d'erreur
- error_code: Code d'erreur
```

**Vues Analytics:**
- `music_generation_stats` - Métriques globales (30 jours)
- `music_generation_by_content_type` - Par type de contenu
- `music_generation_by_style` - Par style musical (top 20)
- `music_generation_daily` - Historique quotidien (7 jours)

### 2. Edge Function - API Métriques

**Endpoint**: `/functions/v1/music-metrics`

**Méthodes:**

```typescript
// Métriques globales
GET /functions/v1/music-metrics?type=global

// Métriques par type de contenu
GET /functions/v1/music-metrics?type=content-type

// Métriques par style
GET /functions/v1/music-metrics?type=style

// Métriques quotidiennes
GET /functions/v1/music-metrics?type=daily

// Métriques utilisateur (authentification requise)
GET /functions/v1/music-metrics?type=user
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    // Données selon le type demandé
  }
}
```

### 3. Hook Frontend - `useMusicMetrics`

**Usage:**
```typescript
import { useMusicMetrics } from '@/hooks/useMusicMetrics';

const {
  globalStats,
  contentTypeStats,
  styleStats,
  dailyStats,
  loading,
  error,
  refresh
} = useMusicMetrics();
```

**Features:**
- ✅ Auto-refresh toutes les 30 secondes
- ✅ Chargement parallèle des métriques
- ✅ Gestion d'erreurs
- ✅ TypeScript typé

### 4. Page Monitoring - `/monitoring`

**Dashboard complet avec:**

#### 📈 Cartes Globales
- Total générations
- Taux de succès avec barre de progression
- Durée moyenne
- Nombre d'échecs (erreurs + timeouts)

#### 📊 Onglets Détaillés

**Par Type de Contenu:**
- EDN, ECOS, OIC
- Comparaison performances
- Taux de succès par type
- Durée moyenne par type

**Par Style Musical:**
- Top 20 styles utilisés
- Nombre de générations
- Performance par style
- Durée moyenne

**Historique 7 Jours:**
- Évolution quotidienne
- Total/Réussies/Échouées
- Durée moyenne par jour
- Visualisation des tendances

#### ⚡ Performance API
- Temps de réponse API moyen
- Tentatives de polling moyennes
- Durée de génération moyenne
- Indicateurs visuels de performance

## 🔧 Intégration

### Dans `generate-music` Edge Function

```typescript
import { insertGenerationMetric } from '../_shared/music-database.ts';

// Après réception du trackId
await insertGenerationMetric(supabase, {
  track_id: taskId,
  user_id: userId || undefined,
  content_type: itemCode.toLowerCase(),
  item_code: itemCode,
  rang: rang,
  style: style,
  status: 'initiated',
  api_response_time_ms: apiResponseTime
});
```

### Dans `music-status` Edge Function

```typescript
// Mettre à jour le statut lors du polling
await supabase
  .from('music_generation_metrics')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    audio_generated: true,
    audio_url: audioUrl,
    polling_attempts: attemptCount
  })
  .eq('track_id', taskId);
```

## 📊 Métriques Clés

### Performance
- **Temps de réponse API**: Cible < 3000ms
- **Tentatives polling**: Optimal 6-12 tentatives
- **Durée génération**: Cible < 3 minutes

### Qualité
- **Taux de succès**: Cible > 95%
- **Taux d'échec**: < 5%
- **Taux timeout**: < 1%

### Volume
- **Générations totales**: 30 derniers jours
- **Générations quotidiennes**: Tendance 7 jours
- **Par type de contenu**: Répartition EDN/ECOS/OIC

## 🚀 Logs Supabase

### Edge Functions Logs

**generate-music:**
- 🎵 Requête génération musicale
- 🔑 Clé API Suno validée
- 🆔 TaskID reçu
- ✅ Track enregistrée en BDD
- ⏱️ Temps de réponse API

**music-status:**
- 🔍 Vérification statut pour taskId
- 🔄 Tentative polling
- ✅ Génération terminée
- ❌ Génération échouée

**music-metrics:**
- 📊 Type de métrique demandé
- ✅ Métriques récupérées
- ❌ Erreur récupération

### Accès aux Logs

**Via Dashboard Supabase:**
- [Generate Music Logs](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/generate-music/logs)
- [Music Status Logs](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/music-status/logs)
- [Music Metrics Logs](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/music-metrics/logs)

**Via CLI:**
```bash
# Logs en temps réel
supabase functions logs generate-music --follow

# Logs avec filtre
supabase functions logs generate-music --filter "ERROR"

# Logs des 24 dernières heures
supabase functions logs generate-music --since 24h
```

## 🎯 Dashboard Analytics

### Accès
- **URL**: `/monitoring`
- **Auth**: Public (voir uniquement les métriques agrégées)

### Refresh
- **Auto**: Toutes les 30 secondes
- **Manuel**: Bouton refresh (futur)

### Filtres (futur)
- Par période (7j, 30j, 90j, custom)
- Par type de contenu
- Par utilisateur (admin)

## 🔐 Sécurité & RLS

### Table `music_generation_metrics`

**Policies:**
```sql
-- Lecture: Utilisateurs voient leurs métriques
CREATE POLICY "Users can view their own metrics"
  ON music_generation_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Insertion: Utilisateurs créent leurs métriques
CREATE POLICY "Users can insert their own metrics"
  ON music_generation_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role: Accès complet
CREATE POLICY "Service role can manage all metrics"
  ON music_generation_metrics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

### Fonctions RPC

Toutes les fonctions RPC sont `SECURITY DEFINER` avec `SET search_path = public` pour la sécurité.

## 📈 Métriques Avancées (Futur)

### À implémenter
- [ ] Alertes automatiques (taux d'échec > 10%)
- [ ] Notifications Slack/Discord
- [ ] Export CSV des métriques
- [ ] Graphiques interactifs (Recharts)
- [ ] Comparaison périodes
- [ ] Prédictions ML (tendances)
- [ ] Heat map des heures de pic
- [ ] Coût par génération
- [ ] ROI par style musical

## 🔍 Troubleshooting

### Métriques ne s'affichent pas
1. Vérifier que la table `music_generation_metrics` existe
2. Vérifier les RLS policies
3. Vérifier logs edge function `music-metrics`
4. Vérifier la connexion Supabase

### Données manquantes
1. Vérifier que `generate-music` insère bien les métriques
2. Vérifier que `music-status` met à jour les statuts
3. Consulter les logs edge functions

### Performance lente
1. Vérifier les index sur `music_generation_metrics`
2. Limiter la période analysée (30j au lieu de 90j)
3. Utiliser le cache frontend

## 📚 Références

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Analytics](https://supabase.com/docs/guides/database/debugging-performance)
- [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

**Système de monitoring complet et opérationnel !** 📊✨
