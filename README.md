# 🏥 MED-MNG - Plateforme d'Apprentissage Médical

**Version 9.6.3 | Dernière mise à jour : 4 Février 2026**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/med-mng/med-mng)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://web.dev/progressive-web-apps/)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG_2.1-blue)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **🎵 "Une chanson = Un item médical maîtrisé"**
>
> MED-MNG est un outil pédagogique expérimental qui explore l'apprentissage médical par la musique générée par IA. Conçue pour les étudiants en médecine.

> ⚠️ **IMPORTANT** : Voir [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) pour les limites, risques et transparence sur les métriques.

---

## 📋 Table des Matières

- [🎯 Vision & Philosophie](#-vision--philosophie)
- [🆕 Nouveautés v9.5](#-nouveautés-v95)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [🏗️ Architecture](#️-architecture)
- [📁 Structure du Projet](#-structure-du-projet)
- [🛣️ Routes & Navigation](#️-routes--navigation)
- [🔧 Hooks & Services](#-hooks--services)
- [🎨 Design System](#-design-system)
- [🗄️ Base de Données](#️-base-de-données)
- [⚡ Edge Functions](#-edge-functions)
- [🧪 Tests](#-tests)
- [📱 PWA & Offline](#-pwa--offline)
- [🔐 Sécurité](#-sécurité)
- [📊 Monitoring & Analytics](#-monitoring--analytics)
- [🚀 Déploiement](#-déploiement)
- [🤝 Contribution](#-contribution)

---

## 🎯 Vision & Philosophie

### Positionnement Unique

MED-MNG n'est **pas** une banque de fiches de plus. C'est un **système anti-panique académique** :

| ❌ Ce que nous ne sommes PAS | ✅ Ce que nous sommes |
|------------------------------|----------------------|
| Plateforme de révision classique | Régulation cognitive anti-panique |
| Accumulateur de ressources | Clarificateur de priorités |
| Exhaustivité avant tout | Action immédiate avant compréhension |

### Principes Fondateurs

1. **🎵 Musique = Apprentissage** : Chaque chanson IA contient un item médical complet
2. **🧠 Décision avant Contenu** : Guider plutôt qu'accumuler
3. **⚡ Clarté avant Exhaustivité** : Réduire la charge cognitive
4. **🎯 Action avant Compréhension** : Débloquer immédiatement

---

## 🆕 Nouveautés v9.6.1 — Accessibilité & Stabilisation

### 🏥 Medical AI Copilot (Révolution v9.5)

Le cœur de la plateforme est désormais un **orchestrateur IA médical intelligent** qui intègre des services premium :

| Mode | Description | Services |
|------|-------------|----------|
| **⚡ Rapide** | Réponses concises en 2-3s | OpenAI GPT-4o |
| **🔬 Recherche** | Analyse académique approfondie avec citations | Perplexity AI |
| **🏥 Clinique** | Raisonnement médical avancé | OpenAI + Guidelines |
| **📄 Analyse Web** | Extraction et analyse de guidelines | Firecrawl |
| **🎙️ Vocal** | Requêtes audio-to-answer | Whisper + GPT-4o |

### ⚡ Streaming Temps Réel (SSE)

```typescript
// Réponses token-by-token en temps réel
await medicalCopilot.stream(
  "Prise en charge d'une pneumopathie communautaire",
  "research",
  (delta) => appendToUI(delta),  // Chaque token affiché immédiatement
  () => finalizeResponse()
);
```

### 🏆 Jalons Majeurs Accomplis (v9.0 → v9.5)

| Feature | Description | Status |
|---------|-------------|--------|
| **📦 Import Anki** | Import .apkg natif avec JSZip | ✅ |
| **🎙️ Voice Mode** | ElevenLabs TTS intégré | ✅ |
| **📋 Grilles UNESS** | Évaluation ECOS officielle | ✅ |
| **🧩 Dashboard Widgets** | Drag-and-drop personnalisable | ✅ |
| **📅 Sync Calendrier** | iCal + Google Calendar | ✅ |
| **💳 Stripe Subscriptions** | Paiements récurrents | ✅ |
| **📊 Excel Export** | Export natif sécurisé | ✅ |
| **🤖 Medical Copilot** | Orchestrateur IA avec streaming | ✅ |

### 📈 Métriques Actuelles

> **Note** : Ces métriques sont des estimations internes, non validées par un audit externe.
> Voir [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) pour plus de détails.

| Métrique | Estimation | Contexte |
|----------|------------|----------|
| Pages React | ~80 | Interface utilisateur |
| Hooks React | ~100 | Logique métier |
| Tables Supabase | ~50-80 | Schéma actif |
| Edge Functions | ~15-20 | APIs backend |

---

## ✨ Fonctionnalités

### 🎵 Apprentissage Musical (Core)

| Fonctionnalité | Description |
|----------------|-------------|
| **Génération Suno IA** | Création de chansons pédagogiques personnalisées (V4.5) |
| **Paroles Médicales** | Lyrics contenant les concepts clés de chaque item |
| **Répétition Espacée** | Refrain = concepts essentiels (SRS audio) |
| **Bibliothèque Musicale** | Organisation par items, spécialités, playlists |
| **UnifiedAudioPlayer** | Lecteur audio avec variantes (minimal, compact, card) |

### 🏥 Medical AI Copilot

| Mode | Description |
|------|-------------|
| **Quick Answer** | Réponses concises pour questions simples |
| **Research** | Analyse approfondie avec sources académiques |
| **Clinical Assistant** | Raisonnement médical structuré |
| **Scrape-Analyze** | Extraction de guidelines médicales |
| **Voice Query** | Questions vocales transcrites |

### 📚 Contenu EDN/ECOS

| Module | Description |
|--------|-------------|
| **Items EDN Complets** | 362+ items avec contenu enrichi |
| **Mode Immersif** | Apprentissage gamifié avec animations |
| **ECOS Simulator** | Simulations cliniques avec timer 7min + grilles UNESS |
| **Tableaux Rang A/B** | Concepts fondamentaux et experts |

### 🧠 Apprentissage Intelligent

| Outil | Description |
|-------|-------------|
| **SRS Review** | Répétition espacée adaptative + export stats |
| **Exam Mode** | QCM avec feedback animé + confetti + export PDF |
| **Flashcards** | Cartes 3D avec raccourcis clavier + import Anki |
| **Cas Cliniques IA** | Génération de cas par intelligence artificielle |
| **Chat IA Médical** | Assistant streaming avec sources + feedback persisté |

### 📊 Progression & Gamification

| Feature | Description |
|---------|-------------|
| **Dashboard Progression** | Heatmap d'activité, anneaux animés |
| **Système de Points** | XP, niveaux, streaks |
| **Badges & Achievements** | Récompenses débloquables |
| **Leaderboard** | Classement communautaire temps réel |
| **Défis Quotidiens** | Challenges avec récompenses XP |
| **Objectifs Personnels** | Suivi d'objectifs SMART |

### 🧘 Bien-être & Productivité

| Feature | Description |
|---------|-------------|
| **Pomodoro Timer** | Sessions de travail focalisé avec presets |
| **Mood Tracker** | Suivi quotidien humeur/énergie/stress |
| **Smart Study Planner** | Planification intelligente avec sync calendrier |

### 👥 Communauté (Planifié)

> ⚠️ **Note** : Ces fonctionnalités sont **planifiées mais non implémentées**.

| Feature | Status |
|---------|--------|
| **Community Hub** | 📋 Planifié |
| **Mentorat** | 📋 Planifié |
| **Ressources Partagées** | 📋 Planifié |
| **Étude Collaborative** | 📋 Planifié |

---

## 🚀 Démarrage Rapide

### Prérequis

```bash
Node.js 20+
pnpm 8+ (recommandé) ou npm
Git
```

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/med-mng/med-mng.git
cd med-mng

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés

# 4. Lancer en développement
pnpm dev
```

### URLs d'Accès

| Environnement | URL |
|---------------|-----|
| **Développement** | http://localhost:5173 |
| **Preview** | https://id-preview--1b544bf9-a0a9-40d7-aa20-d14835dcd1a3.lovable.app |
| **Production** | https://med-mng.lovable.app |

---

## 🏗️ Architecture

### Stack Technique

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│  React 18 + TypeScript + Vite + Tailwind + Framer Motion │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                      │
│        TanStack Query + Zustand + React Context          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 UNIFIED API CLIENT                       │
│     medicalCopilot │ audioApi │ coreApi │ contentApi     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              5 EDGE FUNCTION ROUTERS                     │
│  ai-audio │ ai-core │ ai-content │ system │ webhooks     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                      │
│   Supabase (Auth + 135+ Tables + Storage + Functions)    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                         │
│  Suno │ OpenAI │ Perplexity │ Firecrawl │ ElevenLabs │   │
│  Whisper │ Stripe │ Resend │ Google Calendar             │
└─────────────────────────────────────────────────────────┘
```

### Technologies Clés

| Catégorie | Technologies |
|-----------|--------------|
| **Framework** | React 18.3, TypeScript 5.0 |
| **Build** | Vite 5, SWC |
| **Styling** | Tailwind CSS 3.4, CSS Variables |
| **UI Components** | shadcn/ui, Radix UI |
| **Animations** | Framer Motion 12 |
| **State** | TanStack Query 5, Zustand 5 |
| **Backend** | Supabase (PostgreSQL + Auth + 130+ Edge Functions) |
| **Music AI** | Suno API V4.5 |
| **Chat AI** | OpenAI GPT-4o, Perplexity |
| **Voice** | ElevenLabs TTS, Whisper STT |
| **Web Scraping** | Firecrawl |
| **Payments** | Stripe (subscriptions) |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **PDF/Excel Export** | jsPDF, xlsx native |
| **Testing** | Vitest, Playwright, Testing Library |

---

## 📁 Structure du Projet

```
med-mng/
├── 📁 src/
│   ├── 📁 pages/                    # 80+ pages
│   │   ├── Index.tsx                # Page d'accueil
│   │   ├── EdnComplete.tsx          # Items EDN
│   │   ├── ExamMode.tsx             # Mode examen + PDF export
│   │   ├── Flashcards.tsx           # Flashcards + Anki import
│   │   ├── MedChat.tsx              # Chat IA streaming + feedback
│   │   ├── MedMngCreate.tsx         # Création musicale
│   │   ├── MedMngProgress.tsx       # Progression
│   │   ├── EcosScenario.tsx         # ECOS + timer + grilles UNESS
│   │   ├── SRSReview.tsx            # SRS + export stats
│   │   └── ...
│   │
│   ├── 📁 components/               # Composants réutilisables
│   │   ├── 📁 ui/                   # Design system (50+ composants)
│   │   ├── 📁 ecos/                 # ECOS (timer, grilles)
│   │   ├── 📁 exam/                 # Exam (PDF export)
│   │   ├── 📁 srs/                  # SRS (export stats)
│   │   ├── 📁 edn/                  # EDN (tableaux, items)
│   │   ├── 📁 music/                # Audio (UnifiedAudioPlayer)
│   │   ├── 📁 ai/                   # AI (UnifiedChat)
│   │   ├── 📁 layout/               # Premium layouts
│   │   └── 📁 admin/                # Admin components
│   │
│   ├── 📁 hooks/                    # 160+ hooks organisés
│   │   ├── 📁 learning/             # Flashcards, SRS, Exam
│   │   ├── 📁 audio/                # useUnifiedAudio, playlists
│   │   ├── 📁 gamification/         # XP, badges, streaks
│   │   ├── 📁 analytics/            # Tracking, metrics
│   │   ├── 📁 auth/                 # Authentication
│   │   ├── 📁 ui/                   # UI state
│   │   ├── 📁 social/               # Community, sharing
│   │   └── 📁 data/                 # Data fetching
│   │
│   ├── 📁 lib/                      # Utilitaires & Clients API
│   │   ├── api/                     # API clients
│   │   │   ├── medicalCopilot.ts    # Medical AI Copilot client
│   │   │   ├── unifiedApiClient.ts  # Unified API client
│   │   │   └── ...
│   │   └── utils.ts                 # Fonctions helper
│   │
│   ├── 📁 config/                   # Configuration
│   │   ├── routes.ts                # 90+ routes définies
│   │   ├── navigation.ts            # Navigation config
│   │   └── env.ts                   # Environment config
│   │
│   └── 📁 services/                 # Business logic services
│       ├── healthService.ts
│       ├── ecosService.ts
│       └── ...
│
├── 📁 supabase/
│   ├── 📁 functions/                # 130+ Edge Functions
│   │   ├── ai-audio/                # Routeur audio
│   │   ├── ai-core/                 # Routeur OpenAI
│   │   ├── ai-content/              # Routeur contenu
│   │   ├── system/                  # Routeur système
│   │   ├── webhooks/                # Routeur webhooks
│   │   ├── medical-ai-copilot/      # Orchestrateur IA
│   │   ├── medical-ai-copilot-stream/ # Streaming SSE
│   │   └── ...
│   └── 📁 migrations/               # Migrations SQL
│
├── 📁 docs/                         # Documentation
│   ├── ARCHITECTURE_PLATEFORME.md
│   ├── AUDIT_COMPLET_MODULES.md
│   ├── AUDIT_COHERENCE_PLATEFORME.md
│   └── ...
│
├── 📁 tests/                        # Tests E2E Playwright
│   └── e2e/                         # ~200 tests
│
└── 📄 Configuration files
```

---

## 🛣️ Routes & Navigation

### Routes Principales

| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Page d'accueil |
| `/edn-complete` | EdnComplete | Bibliothèque items EDN |
| `/exam-mode` | ExamMode | Mode examen QCM + PDF |
| `/ecos` | EcosIndex | Simulations ECOS |
| `/ecos/:id` | EcosScenario | Scénario ECOS avec timer |
| `/chat` | MedChat | Assistant IA streaming |
| `/flashcards` | Flashcards | Cartes mémoire + Anki |
| `/med-mng/create` | MedMngCreate | Génération musicale |
| `/srs-review` | SRSReview | Révision espacée |
| `/clinical-cases` | ClinicalCases | Cas cliniques IA |

### Routes Productivité

| Route | Page | Description |
|-------|------|-------------|
| `/pomodoro` | Pomodoro | Timer productivité |
| `/daily-challenges` | DailyChallenges | Défis quotidiens |
| `/smart-study-planner` | SmartStudyPlanner | Planification + Calendar |
| `/mood-tracker` | MoodTracker | Suivi bien-être |

### Routes Admin

| Route | Page | Description |
|-------|------|-------------|
| `/admin-panel` | AdminPanel | Dashboard admin |
| `/diagnostics` | Diagnostics | Outils debug |
| `/platform-status` | PlatformStatus | Statut plateforme |
| `/rls-documentation` | RLSDocumentation | Audit sécurité RLS |

---

## 🔧 Hooks & Services

### Architecture Domain-Driven

```
src/hooks/
├── 📁 learning/     # useFlashcards, useSRS, useExamMode
├── 📁 audio/        # useUnifiedAudio, usePlaylists
├── 📁 gamification/ # useGamification, useAchievements
├── 📁 analytics/    # useActivityTracking, useMetrics
├── 📁 auth/         # useAuth, useSubscription
├── 📁 ui/           # useTheme, useResponsive
├── 📁 social/       # useCommunity, useSharing
└── 📁 data/         # useEdnItems, useOicCompetences
```

### Clients API Unifiés

```typescript
import { medicalCopilot } from '@/lib/api/medicalCopilot';
import { audioApi, coreApi, contentApi, systemApi } from '@/lib';

// Medical AI Copilot (streaming)
await medicalCopilot.stream(question, mode, onDelta, onDone);

// Audio generation
const result = await audioApi.generateMusic({ lyrics, style });

// Chat IA
const response = await coreApi.chat(messages);

// Health check
const health = await systemApi.health();
```

---

## 🎨 Design System

### Tokens Sémantiques (index.css)

```css
:root {
  /* Couleurs principales */
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 47 100% 50%;
  --secondary: 270 50% 40%;
  --accent: 280 100% 70%;
  
  /* Feedback sémantique */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
  
  /* Gradients premium */
  --gradient-medical: linear-gradient(135deg, ...);
  --gradient-hero: linear-gradient(180deg, ...);
}
```

### ⚠️ Règle Critique

**NE JAMAIS utiliser de couleurs hardcodées.** Toujours utiliser les tokens :

```tsx
// ❌ Mauvais
<span className="text-green-500">Succès</span>

// ✅ Correct
<span className="text-success">Succès</span>
```

---

## 🗄️ Base de Données

### Vue d'Ensemble

| Métrique | Valeur |
|----------|--------|
| **Tables** | 723 |
| **RLS Enabled** | ✅ Toutes |
| **Security Grade** | A+ |

### Tables Principales

| Catégorie | Tables |
|-----------|--------|
| **Contenu** | `edn_items_complete`, `ecos_situations`, `oic_competences` |
| **Musique** | `med_mng_songs`, `generated_music_tracks`, `playlists` |
| **Utilisateurs** | `profiles`, `med_mng_subscriptions`, `user_roles` |
| **Apprentissage** | `flashcards`, `flashcard_decks`, `srs_reviews` |
| **Gamification** | `achievements`, `user_badges`, `gamification_activities` |
| **AI** | `chat_conversations`, `chat_messages`, `ai_chat_feedback` |

---

## ⚡ Edge Functions

### Architecture Consolidée (5 Routeurs)

| Routeur | Actions | Description |
|---------|---------|-------------|
| **`ai-audio`** | generate, status, credits, extend | Suno/ElevenLabs |
| **`ai-core`** | chat, image, embed | OpenAI GPT-4o |
| **`ai-content`** | qcm, clinical-case, recommendations | Génération pédagogique |
| **`system`** | health, metrics, quota | Monitoring |
| **`webhooks`** | stripe, auth, suno-callback | Callbacks externes |

### Medical AI Copilot

| Function | Description |
|----------|-------------|
| `medical-ai-copilot` | Orchestrateur principal (multi-mode) |
| `medical-ai-copilot-stream` | Streaming SSE temps réel |

### Appel depuis le Frontend

```typescript
import { medicalCopilot } from '@/lib/api/medicalCopilot';

// Mode classique
const response = await medicalCopilot.query(question, 'research');

// Mode streaming (recommandé)
await medicalCopilot.stream(
  question,
  'research',
  (delta) => setContent(prev => prev + delta),
  () => setIsLoading(false)
);
```

---

## 🧪 Tests

### Configuration

```bash
# Tests unitaires (Vitest)
pnpm test

# Tests E2E (Playwright)
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Couverture E2E

~200 tests Playwright couvrant :
- Learning System (Flashcards, SRS, Exam)
- EDN & Music
- Admin & ECOS
- User Flows (Auth, Subscriptions)

---

## 📱 PWA & Offline

- ✅ Installation sur mobile/desktop
- ✅ Mode offline avec Service Worker
- ✅ Push notifications
- ✅ Cache audio intelligent
- ✅ Core Web Vitals tracking

---

## 🔐 Sécurité

### Grade A+ Certifié

| Mesure | Status |
|--------|--------|
| RLS sur toutes les tables | ✅ |
| Rate Limiting API | ✅ |
| SECURITY DEFINER functions | ✅ |
| Explicit search_path | ✅ |
| HTTPS only | ✅ |
| Secrets en Edge Functions | ✅ |
| Admin role verification (server-side) | ✅ |

---

## 📊 Monitoring & Analytics

### Dashboards

| Route | Dashboard |
|-------|-----------|
| `/diagnostics` | Debug (dev only) |
| `/platform-status` | Statut plateforme |
| `/rls-documentation` | Audit sécurité RLS |
| `/statistics` | Stats utilisateur |

---

## 🚀 Déploiement

### Environnements

| Env | Déploiement |
|-----|-------------|
| **Preview** | Automatique sur chaque commit |
| **Production** | Click "Publish" dans Lovable |

### Secrets Edge Functions

```bash
# APIs Premium (configurés dans Supabase)
SUNO_API_KEY=
OPENAI_API_KEY=
PERPLEXITY_API_KEY=
FIRECRAWL_API_KEY=
ELEVENLABS_API_KEY=
STRIPE_SECRET_KEY=
RESEND_API_KEY=
```

---

## 🤝 Contribution

### Standards de Code

- TypeScript strict
- ESLint + Prettier
- Tests pour nouvelles features
- **Tokens sémantiques obligatoires**
- Domain-driven organization

---

## 📈 Scores Audit v9.5

| Module | Score | Status |
|--------|-------|--------|
| Medical AI Copilot | 20/20 | ⭐⭐⭐ |
| Streaming SSE | 20/20 | ⭐⭐⭐ |
| Items EDN | 20/20 | ⭐⭐⭐ |
| ECOS (Grilles UNESS) | 20/20 | ⭐⭐⭐ |
| Flashcards (Anki) | 20/20 | ⭐⭐⭐ |
| SRS Review | 20/20 | ⭐⭐⭐ |
| Gamification | 20/20 | ⭐⭐⭐ |
| Sécurité (RLS) | 20/20 | ⭐⭐⭐ |
| **Global** | **20/20** | **⭐⭐⭐** |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE_PLATEFORME.md](./docs/ARCHITECTURE_PLATEFORME.md) | Architecture consolidée |
| [AUDIT_COMPLET_MODULES.md](./docs/AUDIT_COMPLET_MODULES.md) | Audit détaillé |
| [AUDIT_COHERENCE_PLATEFORME.md](./docs/AUDIT_COHERENCE_PLATEFORME.md) | Cohérence design |

---

## 📞 Support

- **Documentation** : `/docs`
- **Issues** : GitHub Issues
- **Email** : support@med-mng.app

---

<p align="center">
  <strong>🎵 MED-MNG v9.5 - Apprendre la médecine en musique 🎵</strong>
  <br>
  <em>Made with ❤️ for medical students</em>
  <br><br>
  <strong>🏥 Medical AI Copilot • ⚡ Real-time Streaming • 🔐 Grade A+ Security</strong>
</p>

---

*Dernière mise à jour : 3 Février 2026 - Version 9.5 (Medical AI Copilot & Streaming)*
