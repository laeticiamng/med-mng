# 📁 ARCHITECTURE PLATEFORME MED-MNG

**Version**: 2.1  
**Date**: 2026-01-29  
**Score organisation**: 18/20

---

## 📊 VUE D'ENSEMBLE

```
src/
├── assets/          # Images, icônes, fonts
├── components/      # 90+ dossiers de composants UI
├── config/          # Configuration (routes, navigation)
├── contexts/        # Providers React (audio, auth, i18n)
├── data/            # Données statiques JSON
├── hooks/           # 150+ hooks organisés par domaine
├── integrations/    # Supabase, APIs externes
├── lib/             # Utilitaires (utils.ts)
├── locales/         # Traductions i18n
├── pages/           # 80+ pages organisées par index
├── schemas/         # Validation Zod
├── services/        # Logique métier
├── stores/          # État global Zustand
├── styles/          # CSS additionnels
├── tests/           # Tests unitaires/E2E
├── types/           # Types TypeScript globaux
└── utils/           # Fonctions utilitaires
```

---

## 📚 PAGES (src/pages/)

### Organisation par domaine (index.ts)

| Catégorie | Fichiers | Description |
|-----------|----------|-------------|
| 🏠 Core | 2 | Index, NotFound |
| 📚 EDN & Learning | 8 | EdnComplete, Flashcards, SRS... |
| 🎯 ECOS | 2 | EcosIndex, EcosScenario |
| 🎯 Motivation | 6 | Leaderboard, DailyChallenges, Pomodoro... |
| 📊 Dashboards | 7 | Dashboard, ProgressDashboard, Statistics... |
| 🎵 Music | 4 | Generator, SharedMusic, Karaoke... |
| 🔐 Auth | 2 | Login, Signup |
| 👤 User | 10 | Profile, Library, Favorites... |
| 💳 Subscription | 5 | Pricing, Subscribe, Store... |
| 👨‍💼 Admin | 12 | AdminPanel, Import, Audit... |
| ⚙️ Platform | 10 | Monitoring, Diagnostics, PWA... |
| 📄 Legal | 5 | CGU, Mentions, RGPD... |

**Total**: 80 pages

---

## 🪝 HOOKS (src/hooks/)

### Organisation thématique

| Catégorie | Dossier | Nb hooks | Exemples |
|-----------|---------|----------|----------|
| 📚 Learning | `/learning` | 26 | useEdnItems, useFlashcards, useSRS |
| 🎵 Audio | `/audio` | 33 | useAudioPlayer, useMusicGeneration |
| 🎯 Gamification | `/gamification` | 9 | useLeaderboard, useDailyChallenges |
| 📊 Analytics | `/analytics` | 24 | useAnalytics, useSystemStatus |
| 🔐 Auth | `/auth` | 11 | useSubscription, useUserRoles |
| 🖥️ UI | `/ui` | 17 | useAccessibility, useTranslation |
| 👥 Social | `/social` | 9 | useCommunityPosts, useChat |
| 💾 Data | `/data` | 28 | useCache, useOfflineSync |

**Total**: 157 hooks

### Import optimisé

```typescript
// ✅ Import ciblé (recommandé)
import { useFlashcards, useSRS } from '@/hooks/learning';
import { useAudioPlayer } from '@/hooks/audio';

// ✅ Import global (legacy compatible)
import { useFlashcards, useAudioPlayer } from '@/hooks';
```

---

## 🧩 COMPONENTS (src/components/)

### Structure par domaine

| Dossier | Description | Nb fichiers |
|---------|-------------|-------------|
| `/ui` | Composants shadcn/ui | 50+ |
| `/layout` | Navigation, Header, Footer | 8 |
| `/edn` | Items EDN, tableaux | 15 |
| `/music` | Player, Generator | 12 |
| `/gamification` | Badges, streaks | 8 |
| `/admin` | Panels admin | 10 |
| `/auth` | Login, ProtectedRoute | 5 |
| `/flashcards` | Cartes, import Anki | 8 |
| `/ecos` | Simulations ECOS | 10 |

### Composants racine à déplacer

Ces fichiers à la racine de `/components/` devraient être relocalisés :

```
❌ À déplacer vers /music/
- AdvancedMixer.tsx
- GeneratorMusicPlayer.tsx
- GlobalMiniPlayer.tsx
- ListeningModesPanel.tsx
- MusicGenerationSection.tsx

❌ À déplacer vers /home/
- HeroSection.tsx
- MainSections.tsx
- MngPresentation.tsx

❌ À déplacer vers /ui/
- LanguageSelector.tsx
- TranslatedText.tsx
```

---

## 🧭 NAVIGATION (src/config/)

### Configuration centralisée

| Fichier | Contenu |
|---------|---------|
| `routes.ts` | 75+ ROUTE_PATHS constants |
| `navigation.ts` | MAIN_NAV_ITEMS, SECONDARY_NAV_GROUPS |

### Structure des menus

```
Navigation principale (6 items)
├── Accueil
├── Items EDN
├── Entraînement
├── ECOS
├── Progression
└── Chat IA

Menu "Plus" (6 groupes, 25 items)
├── 🎯 Motivation (6)
├── 📚 Apprentissage (4)
├── 🎵 Musique (4)
├── 📅 Planning (2)
├── 📊 Statistiques (3)
└── 📦 Ressources (6)
```

---

## 📈 MÉTRIQUES

| Métrique | Valeur | Objectif |
|----------|--------|----------|
| Pages | 80 | ✅ Organisées par index |
| Hooks | 157 | ✅ Groupés par domaine |
| Components | 90+ dossiers | ⚠️ 23 orphelins |
| Routes | 75+ | ✅ Centralisées |
| Lazy loading | 95% | ✅ Optimisé |

---

## ✅ AMÉLIORATIONS APPLIQUÉES

1. **`src/pages/index.ts`** - Export groupé par catégorie
2. **`src/hooks/learning/index.ts`** - 26 hooks EDN/apprentissage
3. **`src/hooks/audio/index.ts`** - 33 hooks audio/musique
4. **`src/hooks/gamification/index.ts`** - 9 hooks motivation
5. **`src/hooks/analytics/index.ts`** - 24 hooks stats
6. **`src/hooks/auth/index.ts`** - 11 hooks sécurité
7. **`src/hooks/ui/index.ts`** - 17 hooks interface
8. **`src/hooks/social/index.ts`** - 9 hooks communauté
9. **`src/hooks/data/index.ts`** - 28 hooks data
10. **`src/hooks/index.ts`** - Index central réorganisé
11. **`src/config/navigation.ts`** - Menu "Plus" groupé en 6 catégories

---

*Architecture documentée automatiquement - MED-MNG Platform v2.1*
