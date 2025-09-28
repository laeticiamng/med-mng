# 🏗️ MED-MNG - Architecture Technique Complète

## 📊 Vue d'ensemble de l'Architecture

MED-MNG est une plateforme "Spotify IA médicale" basée sur React + Supabase + Edge Functions pour la génération de contenu pédagogique médical.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────┤
│  • Music Player & Streaming (streaming-only)               │
│  • Playlists & Bibliothèque (CRUD)                        │
│  • QCM & Corrections interactifs                          │
│  • Chat IA contextuel                                     │
│  • Dashboard utilisateur & Admin                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL + RLS)                              │
│  • edn_items_immersive (tableaux A/B)                     │
│  • med_mng_songs (musiques générées)                      │
│  • med_mng_playlists (gestion playlists)                  │
│  • user_quotas (gestion abonnements)                      │
│  • user_activity_logs (monitoring)                        │
├─────────────────────────────────────────────────────────────┤
│  Edge Functions (Deno)                                    │
│  • music-generation-secure (Suno API)                     │
│  • openai-chat (Chat IA)                                  │
│  • generate-content (BD/Roman/Poème)                      │
│  • monitoring-alerts (QA/Logs)                            │
│  • analytics-tracker (Stats)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Integration
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                SERVICES EXTERNES                            │
├─────────────────────────────────────────────────────────────┤
│  • Suno AI (génération musicale)                          │
│  • OpenAI GPT-4 (chat, contenu)                          │
│  • Stripe (abonnements)                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Endpoints API Principaux

### 📚 Items EDN & Tableaux

```typescript
// Récupération des tableaux structurés
GET /items/:item_id/tableau-rang-a
GET /items/:item_id/tableau-rang-b
GET /items/:item_id/tableaux          // A+B combinés

// Audit de complétude
GET /items/completeness-audit
POST /items/verify-completeness/:item_id

// Structure de réponse
interface TableauRang {
  title: string;
  sections: Array<{
    title: string;
    content: string;
    keywords: string[];
  }>;
}
```

### 🎵 Génération Musicale

```typescript
// Génération et streaming
POST /functions/music-generation-secure
  Body: { item_code: string, rang: 'A'|'B'|'mix', style?: string }
  
GET /functions/stream-audio/:song_id
  Headers: { Authorization: Bearer <token> }
  
// Gestion bibliothèque
GET /med-mng-songs
POST /med-mng-user-songs          // Ajouter à bibliothèque
DELETE /med-mng-user-songs/:id    // Retirer de bibliothèque

// Playlists
GET /med-mng-playlists
POST /med-mng-playlists
PUT /med-mng-playlists/:id
DELETE /med-mng-playlists/:id
```

### 🧠 QCM & Chat IA

```typescript
// QCM personnalisés
POST /functions/generate-qcm
  Body: { item_code: string, rang: 'A'|'B'|'mix', difficulty: number }
  
POST /qcm-sessions                // Démarrer session
PUT /qcm-sessions/:id/answer      // Répondre question
GET /qcm-sessions/:id/results     // Récupérer résultats

// Chat IA contextuel
POST /functions/openai-chat
  Body: { message: string, context?: 'edn'|'general' }
```

### 📊 Monitoring & Admin

```typescript
// Dashboard admin
GET /admin/music-generation-logs
GET /admin/streaming-security-audit
GET /admin/quota-usage
GET /admin/completeness-alerts

// Métriques temps réel
GET /functions/analytics-tracker
POST /functions/monitoring-alerts
```

## 🗃️ Schéma Base de Données

### Tables Principales

```sql
-- Items EDN avec tableaux structurés
edn_items_immersive (
  id UUID PRIMARY KEY,
  item_code TEXT UNIQUE,
  title TEXT,
  tableau_rang_a JSONB,      -- Structure tableau A
  tableau_rang_b JSONB,      -- Structure tableau B
  quiz_questions JSONB,      -- QCM générés
  scene_immersive JSONB,     -- BD/Roman/Poème
  paroles_musicales TEXT[]   -- Lyrics synchronisées
);

-- Musiques générées et streaming
med_mng_songs (
  id UUID PRIMARY KEY,
  item_code TEXT,
  rang TEXT,
  suno_audio_id TEXT,
  title TEXT,
  style JSONB,
  lyrics JSONB,              -- Lyrics synchronisées
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ
);

-- Bibliothèque utilisateur
med_mng_user_songs (
  user_id UUID REFERENCES auth.users,
  song_id UUID REFERENCES med_mng_songs,
  added_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, song_id)
);

-- Playlists
med_mng_playlists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT,
  songs JSONB,              -- Array des song_ids
  created_at TIMESTAMPTZ
);

-- Quotas et abonnements
user_quotas (
  user_id UUID PRIMARY KEY,
  subscription_type TEXT,
  monthly_music_quota INTEGER,
  monthly_music_used INTEGER,
  monthly_qcm_quota INTEGER,
  monthly_qcm_used INTEGER,
  quota_reset_date TIMESTAMPTZ
);

-- Logs et monitoring
user_activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  activity_type TEXT,
  activity_details JSONB,
  timestamp TIMESTAMPTZ
);

-- Alertes de complétude
completeness_alerts (
  id UUID PRIMARY KEY,
  item_code TEXT,
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  resolved BOOLEAN DEFAULT FALSE
);
```

## 🔒 Sécurité & RLS Policies

### Streaming Sécurisé

```sql
-- Politique streaming-only
CREATE POLICY "secure_streaming_access" ON med_mng_songs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_quotas 
      WHERE user_id = auth.uid() AND monthly_music_used < monthly_music_quota
    )
  );

-- URLs signées temporaires (Edge Function)
const streamingUrl = await supabase.storage
  .from('audio')
  .createSignedUrl(audioPath, 300); // 5 minutes max
```

### Protection Anti-Download

```typescript
// Headers sécurisés dans Edge Functions
const secureHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer'
};
```

## 🎨 Architecture Frontend

### Structure des Composants

```
src/
├── components/
│   ├── med-mng/
│   │   ├── MusicPlayer.tsx           # Player streaming-only
│   │   ├── PlaylistManager.tsx       # CRUD playlists
│   │   ├── QCMInterface.tsx          # QCM interactifs
│   │   ├── ChatAI.tsx               # Chat contextuel
│   │   └── DashboardUser.tsx        # Dashboard user
│   ├── admin/
│   │   ├── AdminDashboard.tsx       # Dashboard admin
│   │   ├── MonitoringLogs.tsx       # Logs & alertes
│   │   └── CompletenessAudit.tsx    # Audit complétude
│   └── edn/
│       ├── TableauRangA.tsx         # Affichage tableau A
│       ├── TableauRangB.tsx         # Affichage tableau B
│       └── ItemViewer.tsx           # Vue complète item
├── hooks/
│   ├── useMusicGeneration.ts        # Hook génération musique
│   ├── useQuotaManager.ts           # Gestion quotas
│   ├── usePlaylist.ts               # Gestion playlists
│   └── useStreamingPlayer.ts        # Player sécurisé
├── services/
│   ├── musicService.ts              # API musique
│   ├── qcmService.ts                # API QCM
│   └── monitoringService.ts         # API monitoring
└── types/
    ├── medmng.ts                    # Types MED-MNG
    └── monitoring.ts                # Types monitoring
```

### State Management

```typescript
// Context global MED-MNG
interface MedMngState {
  currentPlaylist: Playlist | null;
  currentSong: Song | null;
  isPlaying: boolean;
  quota: UserQuota;
  streamingStatus: 'loading' | 'playing' | 'paused' | 'error';
}

// Hook de monitoring temps réel
const useRealtimeMonitoring = () => {
  // WebSocket/Supabase Realtime pour logs en temps réel
  // Alertes push pour admin
  // Métriques performance
};
```

## 🧪 Tests & QA

### Tests Unitaires

```typescript
// tests/components/MusicPlayer.test.tsx
describe('MusicPlayer', () => {
  it('should stream audio securely', async () => {
    // Test streaming-only
    // Vérification anti-download
    // Test quotas
  });
});

// tests/services/quotaService.test.ts
describe('QuotaService', () => {
  it('should enforce quota limits', () => {
    // Test limites quotas
    // Test reset automatique
  });
});
```

### Tests E2E Spécifiques

```typescript
// tests/e2e/med-mng-workflow.spec.ts
test('Complete MED-MNG workflow', async ({ page }) => {
  // 1. Login et vérification quotas
  // 2. Génération musique sur item
  // 3. Ajout à bibliothèque/playlist
  // 4. QCM avec génération chanson erreurs
  // 5. Chat IA contextuel
  // 6. Vérification streaming-only (aucun download)
});
```

### Audit de Complétude Automatisé

```typescript
// scripts/audit-completeness.ts
export async function auditItemCompleteness() {
  const items = await supabase.from('edn_items_immersive').select('*');
  
  const incompleteItems = items.data?.filter(item => 
    !item.tableau_rang_a || 
    !item.tableau_rang_b || 
    !item.quiz_questions ||
    !item.scene_immersive
  );
  
  if (incompleteItems?.length > 0) {
    // Créer alertes
    // Notifier admin
    // Logger dans monitoring
  }
}
```

## 📈 Monitoring & Performance

### Métriques Clés

```typescript
interface PerformanceMetrics {
  musicGenerationTime: number;      // Temps génération Suno
  streamingLatency: number;         // Latence streaming
  qcmCompletionRate: number;        // Taux completion QCM
  quotaUtilization: number;         // Utilisation quotas
  itemCompleteness: number;         // % items complets
  chatResponseTime: number;         // Temps réponse chat IA
}

// Dashboard temps réel
const useMonitoringDashboard = () => {
  // Métriques en temps réel
  // Alertes automatiques
  // Exports logs
};
```

### Alertes Automatiques

```typescript
// Edge Function: monitoring-alerts
const alerts = [
  {
    condition: 'music_generation_time > 30s',
    action: 'notify_admin',
    severity: 'warning'
  },
  {
    condition: 'item_completeness < 90%',
    action: 'block_deployment',
    severity: 'critical'
  }
];
```

## 🚀 Déploiement & CI/CD

### Pipeline de Déploiement

```yaml
# .github/workflows/med-mng-deploy.yml
name: MED-MNG Deploy
on:
  push:
    branches: [main]

jobs:
  audit-completeness:
    runs-on: ubuntu-latest
    steps:
      - name: Audit Item Completeness
        run: npm run audit:completeness
      - name: Block if incomplete
        if: ${{ steps.audit.outputs.incomplete > 0 }}
        run: exit 1

  test-streaming-security:
    runs-on: ubuntu-latest
    steps:
      - name: Test Anti-Download Security
        run: npm run test:security:streaming

  deploy:
    needs: [audit-completeness, test-streaming-security]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: npm run deploy:prod
```

## 📚 Documentation Utilisateur

### User Stories Principales

```markdown
## 🎵 En tant qu'étudiant médecine, je veux...

1. **Génération Musicale**
   - Générer une chanson pour l'item IC-23 Rang A
   - Écouter en streaming sans pouvoir télécharger
   - Ajouter à ma playlist "Gynéco-Obstétrique"

2. **QCM Interactifs**
   - Faire un QCM sur l'item IC-45 mixte (A+B)
   - Voir ma correction détaillée
   - Générer une chanson de mes erreurs

3. **Chat IA**
   - Poser une question sur l'endométriose
   - Recevoir une réponse basée sur EDN
   - Voir les suggestions (musiques/QCM liés)

4. **Bibliothèque**
   - Organiser mes musiques par spécialité
   - Créer des playlists pour révisions
   - Voir mon historique d'écoute
```

### Wireframes UI

```
┌─────────────────────────────────────────┐
│  MED-MNG Dashboard                      │
├─────────────────────────────────────────┤
│  [Quota: ████████░░ 80%]               │
│                                         │
│  🎵 Ma Bibliothèque (234 chansons)    │
│  ├─ Playlist: Gynéco (23)             │
│  ├─ Playlist: Cardio (45)             │
│  └─ Favoris (12)                       │
│                                         │
│  📚 Items EDN                          │
│  ├─ IC-23: [Tableau A] [Tableau B]    │
│  │          [♪ Générer] [📝 QCM]      │
│  └─ IC-45: [Tableau A] [Tableau B]    │
│                                         │
│  💬 Chat IA                            │
│  └─ [Zone de chat contextuel]          │
└─────────────────────────────────────────┘
```

## 🔧 Scripts de Maintenance

### Nettoyage Legacy

```bash
#!/bin/bash
# scripts/clean-legacy.sh

echo "🧹 Nettoyage du code legacy MED-MNG..."

# Supprimer anciens composants
rm -rf src/components/legacy/
rm -rf src/hooks/deprecated/

# Nettoyer imports inutilisés
npm run lint:fix
npm run format

# Audit sécurité
npm audit fix

echo "✅ Legacy nettoyé avec succès"
```

### Vérification Quotidienne

```bash
#!/bin/bash
# scripts/daily-check.sh

# Audit complétude items
npm run audit:completeness

# Vérification quotas
npm run check:quotas

# Test streaming sécurisé
npm run test:streaming:security

# Monitoring performances
npm run monitor:performance
```

## 📖 Guide Contribution

### Avant chaque commit

```bash
# Checklist développeur
npm run lint                    # ESLint + Prettier
npm run type-check             # TypeScript
npm run test:unit              # Tests unitaires
npm run test:e2e:critical      # Tests E2E critiques
npm run audit:completeness     # Audit complétude
npm run test:security          # Tests sécurité
```

### Standards Code

```typescript
// ✅ Bon exemple - Component MED-MNG
interface MusicPlayerProps {
  song: Song;
  onError: (error: StreamingError) => void;
  quotaRemaining: number;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  song,
  onError,
  quotaRemaining
}) => {
  // Hooks
  const { isPlaying, stream } = useStreamingPlayer();
  const { trackUsage } = useQuotaManager();
  
  // Handlers
  const handlePlay = useCallback(async () => {
    if (quotaRemaining <= 0) {
      onError({ type: 'quota_exceeded' });
      return;
    }
    
    await stream(song.id);
    trackUsage(1);
  }, [song.id, quotaRemaining, stream, trackUsage, onError]);
  
  return (
    <div className="music-player">
      {/* UI streaming-only */}
    </div>
  );
};
```

## 🎯 Roadmap Technique

### Q1 2025
- [ ] Audit complétude 100% items EDN
- [ ] Streaming sécurisé optimisé
- [ ] Dashboard monitoring temps réel

### Q2 2025  
- [ ] IA génération BD/Roman améliorée
- [ ] Chat IA contextuel avancé
- [ ] Mobile app (React Native)

### Q3 2025
- [ ] Analytics avancées utilisateur
- [ ] API publique pour partenaires
- [ ] Intégration LMS externes

---

**Cette architecture technique MED-MNG est conçue pour être scalable, sécurisée et maintenir une UX premium tout en respectant les contraintes de streaming-only et de monitoring complet.**