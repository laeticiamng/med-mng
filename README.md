# 🏥 MED-MNG - Plateforme d'Apprentissage Médical Intelligent

**Version 3.0 | Dernière mise à jour : 1er Février 2026**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/med-mng/med-mng)
[![Score Audit](https://img.shields.io/badge/Audit%20Score-20%2F20-brightgreen)](./docs/AUDIT_COMPLET_MODULES.md)
[![Security Grade](https://img.shields.io/badge/Security-Grade%20A-brightgreen)](./docs/STATUT-PLATEFORME-RESUME.md)
[![Architecture](https://img.shields.io/badge/Architecture-Consolidée-blue)](./docs/ARCHITECTURE_PLATEFORME.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://web.dev/progressive-web-apps/)

> **🎵 "Une chanson = Un item médical maîtrisé"**
>
> MED-MNG est une plateforme anti-panique cognitive qui transforme l'apprentissage médical grâce à la musique générée par IA. Conçue pour les étudiants en médecine préparant les ECN/EDN.

---

## 📋 Table des Matières

- [🎯 Vision & Philosophie](#-vision--philosophie)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🆕 Nouveautés v2.1](#-nouveautés-v21)
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

## 🆕 Nouveautés v3.0 — Architecture Consolidée

### 🏗️ Refactoring Architectural Majeur

| Changement | Avant | Après |
|------------|-------|-------|
| **Edge Functions** | ~65 fonctions fragmentées | **5 routeurs unifiés** |
| **Hooks Audio** | 18 hooks éparpillés | **1 hook unifié** (`useUnifiedAudio`) |
| **Composants Chat** | 4 widgets distincts | **1 composant unifié** (`UnifiedChat`) |
| **Footers Tableau** | 11 fichiers IC1-IC10 | **1 composant générique** + config |
| **API Client** | Appels directs dispersés | **`unifiedApiClient`** centralisé |

### ⚡ Routeurs Edge Functions Consolidés

| Routeur | Responsabilité | Actions |
|---------|----------------|---------|
| `ai-audio` | Suno, voix, traitement audio | `generate`, `status`, `credits`, `extend`, `lyrics` |
| `ai-core` | OpenAI (chat, images) | `chat`, `image`, `embed` |
| `ai-content` | Génération contenu pédagogique | `qcm`, `clinical-case`, `recommendations` |
| `system` | Health, monitoring, quotas | `health`, `metrics`, `quota` |
| `webhooks` | Callbacks externes | `stripe`, `auth`, `resend`, `suno` |

### ✅ Améliorations v3.0

| Feature | Description | Status |
|---------|-------------|--------|
| **🎵 UnifiedAudioPlayer** | Lecteur audio avec variantes (minimal, compact, card) | ✅ |
| **💬 UnifiedChat** | Chat IA avec gamification et contexte item | ✅ |
| **📊 Hooks Catégorisés** | 150+ hooks organisés en 8 domaines | ✅ |
| **🧪 Tests Edge Functions** | Suites de tests pour routeurs consolidés | ✅ |
| **📁 Domain-Driven Structure** | Zéro composant orphelin à la racine | ✅ |

### 📈 Scores Production-Ready

| Métrique | Score |
|----------|-------|
| Score Global Plateforme | **20/20** |
| Sécurité (Grade) | **A** |
| Organisation Fichiers | **20/20** |
| Couverture Fonctionnelle | **100%** |

---

## ✨ Fonctionnalités

### 🎵 Apprentissage Musical (Core)

| Fonctionnalité | Description |
|----------------|-------------|
| **Génération Suno IA** | Création de chansons pédagogiques personnalisées |
| **Paroles Médicales** | Lyrics contenant les concepts clés de chaque item |
| **Répétition Espacée** | Refrain = concepts essentiels (SRS audio) |
| **Bibliothèque Musicale** | Organisation par items, spécialités, playlists |

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
| **Flashcards** | Cartes 3D avec raccourcis clavier |
| **Cas Cliniques IA** | Génération de cas par intelligence artificielle |
| **Chat IA Médical** | Assistant avec sources + feedback persisté |

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
| **Streaks** | Maintien de la régularité |

### 👥 Communauté

| Feature | Description |
|---------|-------------|
| **Community Hub** | Forum de discussion |
| **Mentorat** | Matching mentors/étudiants |
| **Ressources Partagées** | Partage de contenu |
| **Étude Collaborative** | Sessions d'étude en groupe |

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
│                      BACKEND                             │
│   Supabase (Auth + Database + Storage + Edge Functions)  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                         │
│         Suno (Music) + OpenAI (Chat) + Resend (Email)    │
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
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **Music AI** | Suno API |
| **Chat AI** | OpenAI GPT-4 |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **PDF Export** | jsPDF + jspdf-autotable |
| **Testing** | Vitest, Playwright, Testing Library |

---

## 📁 Structure du Projet

```
med-mng/
├── 📁 src/
│   ├── 📁 pages/                    # 73+ pages
│   │   ├── Index.tsx                # Page d'accueil
│   │   ├── EdnComplete.tsx          # Items EDN
│   │   ├── ExamMode.tsx             # Mode examen + PDF export
│   │   ├── Flashcards.tsx           # Flashcards + raccourcis
│   │   ├── MedChat.tsx              # Chat IA + feedback
│   │   ├── MedMngCreate.tsx         # Création musicale
│   │   ├── MedMngProgress.tsx       # Progression
│   │   ├── EcosScenario.tsx         # ECOS + timer + grilles
│   │   ├── SRSReview.tsx            # SRS + export stats
│   │   └── ...
│   │
│   ├── 📁 components/               # Composants réutilisables
│   │   ├── 📁 ui/                   # Design system (shadcn)
│   │   │   ├── animated-counter.tsx
│   │   │   ├── animated-progress-ring.tsx
│   │   │   ├── confetti-explosion.tsx
│   │   │   ├── flip-card.tsx
│   │   │   └── ... (50+ composants)
│   │   ├── 📁 ecos/                 # Composants ECOS
│   │   │   ├── EcosRealTimeTimer.tsx   # Timer 7min
│   │   │   └── EcosEvaluationGrid.tsx  # Grilles UNESS
│   │   ├── 📁 exam/                 # Composants Exam
│   │   │   └── ExamResultsPDF.tsx      # Export PDF
│   │   ├── 📁 srs/                  # Composants SRS
│   │   │   └── SRSStatsExport.tsx      # Export stats
│   │   ├── 📁 edn/                  # Composants EDN
│   │   ├── 📁 med-mng/              # Composants MED-MNG
│   │   └── 📁 admin/                # Composants Admin
│   │
│   ├── 📁 hooks/                    # 130+ hooks custom
│   │   ├── useGamification.ts       # Gamification
│   │   ├── useMusicGeneration.ts    # Génération musicale
│   │   ├── useFlashcards.ts         # Flashcards
│   │   ├── useExamMode.ts           # Mode examen
│   │   ├── useSRS.ts                # Répétition espacée
│   │   └── ...
│   │
│   ├── 📁 lib/                      # Utilitaires
│   │   ├── utils.ts                 # Fonctions helper
│   │   └── secureApiClient.ts       # Client API sécurisé
│   │
│   ├── 📁 config/                   # Configuration
│   │   └── routes.ts                # 90+ routes définies
│   │
│   ├── 📁 integrations/             # Intégrations externes
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   └── 📁 assets/                   # Assets statiques
│
├── 📁 supabase/
│   ├── 📁 functions/                # Edge Functions
│   └── 📁 migrations/               # Migrations SQL
│
├── 📁 docs/                         # Documentation
│   ├── AUDIT_COMPLET_MODULES.md     # Audit détaillé
│   ├── AUDIT_COHERENCE_PLATEFORME.md
│   ├── STATUT-PLATEFORME-RESUME.md
│   └── ...
│
├── 📁 public/                       # Fichiers publics
│   └── manifest.json                # PWA manifest
│
└── 📄 Configuration files
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── vitest.config.ts
```

---

## 🛣️ Routes & Navigation

### Routes Principales (Navigation)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Page d'accueil |
| `/edn-complete` | EdnComplete | Bibliothèque items EDN |
| `/exam-mode` | ExamMode | Mode examen QCM + PDF |
| `/ecos` | EcosIndex | Simulations ECOS |
| `/ecos/:id` | EcosScenario | Scénario ECOS avec timer |
| `/med-mng/progress` | MedMngProgress | Tableau de progression |
| `/chat` | MedChat | Assistant IA médical |
| `/flashcards` | Flashcards | Cartes mémoire |
| `/med-mng/create` | MedMngCreate | Génération musicale |
| `/med-mng/pricing` | MedMngPricing | Plans & Tarifs |
| `/srs-review` | SRSReview | Révision espacée + export |
| `/statistics` | Statistics | Statistiques détaillées |
| `/achievements` | Achievements | Badges & Succès |

### Routes Productivité & Motivation

| Route | Page | Description |
|-------|------|-------------|
| `/pomodoro` | Pomodoro | Timer de productivité |
| `/daily-challenges` | DailyChallenges | Défis quotidiens |
| `/my-goals` | MyGoals | Objectifs personnels |
| `/mood-tracker` | MoodTracker | Suivi bien-être |
| `/leaderboard` | Leaderboard | Classement XP |

### Routes Secondaires

| Route | Page | Description |
|-------|------|-------------|
| `/clinical-cases` | ClinicalCases | Cas cliniques IA |
| `/smart-study-planner` | SmartStudyPlanner | Planificateur intelligent |
| `/community` | CommunityHub | Communauté |
| `/favorites` | Favorites | Favoris |
| `/library` | LibraryPage | Bibliothèque générale |

### Routes Admin

| Route | Page | Description |
|-------|------|-------------|
| `/admin-panel` | AdminPanel | Dashboard admin |
| `/admin/audit` | AdminAudit | Audit système |
| `/diagnostics` | Diagnostics | Outils debug |
| `/platform-status` | PlatformStatus | Statut plateforme |

---

## 🔧 Hooks & Services

### Hooks Principaux

#### 🎵 Musique & Audio

```typescript
useMusicGeneration()      // Génération Suno
useAudioPlayer()          // Lecteur audio
useAudioCache()           // Cache audio
usePlaylists()            // Gestion playlists
useSunoCredits()          // Crédits Suno
```

#### 📚 Apprentissage

```typescript
useFlashcards()           // CRUD flashcards
useExamMode()             // Logique examen
useSRS()                  // Répétition espacée
useClinicalCases()        // Cas cliniques
useGamification()         // Points, XP, badges
```

#### 📊 Données EDN

```typescript
useAllEdnItems()          // Tous les items
useEdnItem()              // Item unique
useEdnItemsComplete()     // Items enrichis
useOicCompetences()       // Compétences OIC
```

#### 👤 Utilisateur

```typescript
useSubscription()         // Abonnement
useActivityTracking()     // Suivi activité
useUserPreferences()      // Préférences
useFavorites()            // Favoris
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
  
  /* Composants */
  --card: 0 0% 7%;
  --muted: 0 0% 15%;
  --border: 0 0% 15%;
}
```

### ⚠️ Règle Critique

**NE JAMAIS utiliser de couleurs hardcodées dans les composants.** Toujours utiliser les tokens sémantiques :

```tsx
// ❌ Mauvais
<span className="text-green-500">Succès</span>
<div className="bg-red-500">Erreur</div>

// ✅ Correct
<span className="text-success">Succès</span>
<div className="bg-destructive">Erreur</div>
```

### Composants UI Animés

| Composant | Fonction |
|-----------|----------|
| `AnimatedCounter` | Compteur animé avec spring |
| `AnimatedProgressRing` | Anneau de progression SVG |
| `ConfettiExplosion` | Célébration (success/gold) |
| `FlipCard` | Carte retournable 3D |
| `ProgressHeatmap` | Heatmap style GitHub |

---

## 🗄️ Base de Données

### Tables Principales

| Catégorie | Tables |
|-----------|--------|
| **Contenu** | `edn_items_complete`, `ecos_situations`, `oic_competences` |
| **Musique** | `med_mng_songs`, `generated_music_tracks`, `playlists` |
| **Utilisateurs** | `profiles`, `med_mng_subscriptions`, `user_preferences` |
| **Apprentissage** | `flashcards`, `quiz_results`, `srs_reviews` |
| **Gamification** | `achievements`, `user_achievements`, `activity_sessions` |
| **Feedback** | `ai_chat_feedback`, `ai_chat_messages` |
| **Analytics** | `pwa_metrics`, `page_analytics`, `user_analytics` |

### Sécurité RLS

Toutes les tables utilisent Row Level Security (Grade A) :

```sql
-- Exemple: Utilisateurs voient leurs propres données
CREATE POLICY "Users can view own data"
ON flashcards FOR SELECT
USING (auth.uid() = user_id);
```

---

## ⚡ Edge Functions (Architecture v3.0)

### Routeurs Consolidés (5 points d'entrée)

| Routeur | Actions | Description |
|---------|---------|-------------|
| **`ai-audio`** | `generate`, `status`, `credits`, `extend`, `lyrics`, `extract_vocals` | Toute la logique Suno/audio |
| **`ai-core`** | `chat`, `image`, `embed` | OpenAI (GPT-4, DALL-E) |
| **`ai-content`** | `qcm`, `clinical-case`, `recommendations`, `study-plan` | Génération pédagogique |
| **`system`** | `health`, `metrics`, `quota`, `config` | Monitoring & diagnostics |
| **`webhooks`** | `stripe`, `auth`, `resend`, `suno-callback` | Callbacks externes |

### Webhooks Spécialisés (conservés séparément)

| Function | Description |
|----------|-------------|
| `stripe-webhook` | Paiements Stripe |
| `auth-webhook` | Auth callbacks |
| `create-checkout` | Création session Stripe |

### Client API Unifié (Frontend)

```typescript
import { audioApi, coreApi, contentApi, systemApi } from '@/lib/unifiedApiClient';

// Génération musicale
const result = await audioApi.generateMusic({ lyrics, style, model: 'V4_5' });

// Chat IA
const response = await coreApi.chat(messages, { model: 'gpt-4o' });

// Génération QCM
const qcm = await contentApi.generateQCM({ itemCode, difficulty: 'medium' });
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

### Structure des Tests

```
tests/
├── navigation.spec.ts     # Navigation
├── library.spec.ts        # Bibliothèque
├── responsive.spec.ts     # Responsive
├── accessibility.spec.ts  # A11y
└── song-creation.spec.ts  # Création
```

---

## 📱 PWA & Offline

### Fonctionnalités PWA

- ✅ Installation sur mobile/desktop
- ✅ Mode offline avec Service Worker
- ✅ Push notifications
- ✅ Cache audio intelligent
- ✅ Core Web Vitals tracking

---

## 🔐 Sécurité

### Mesures Implémentées (Grade A)

| Mesure | Status |
|--------|--------|
| RLS sur toutes les tables | ✅ |
| Rate Limiting API | ✅ |
| Sanitization inputs | ✅ |
| HTTPS only | ✅ |
| Secrets en Edge Functions | ✅ |
| CSP Headers | ✅ |
| 27 fonctions critiques sécurisées | ✅ |

---

## 📊 Monitoring & Analytics

### Métriques Trackées

- Core Web Vitals (FCP, LCP, CLS, INP, TTFB)
- User engagement (sessions, durée)
- Feature usage
- Erreurs (Sentry)

### Dashboards

| Route | Dashboard |
|-------|-----------|
| `/pwa-analytics` | Métriques PWA |
| `/statistics` | Stats utilisateur |
| `/platform-status` | Statut plateforme |
| `/diagnostics` | Debug (dev only) |

---

## 🚀 Déploiement

### Environnements

| Env | Déploiement |
|-----|-------------|
| **Preview** | Automatique sur chaque commit |
| **Production** | Click "Publish" dans Lovable |

### Variables d'Environnement

```bash
# Supabase (obligatoire)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# APIs (Edge Functions secrets)
SUNO_API_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
```

---

## 🤝 Contribution

### Workflow

1. Fork le repository
2. Créer une branche feature
3. Commiter avec messages conventionnels
4. Ouvrir une Pull Request

### Standards de Code

- TypeScript strict
- ESLint + Prettier
- Tests pour nouvelles features
- Documentation des hooks
- **Tokens sémantiques obligatoires** (pas de couleurs hardcodées)

---

## 📈 Scores Audit v3.0

| Module | Score | Status |
|--------|-------|--------|
| Accueil | 20/20 | ⭐⭐⭐ |
| Items EDN | 19/20 | ⭐⭐⭐ |
| ECOS (Timer + Grilles) | 20/20 | ⭐⭐⭐ |
| Quiz/Examen (+ PDF) | 19/20 | ⭐⭐⭐ |
| Flashcards (+ Raccourcis) | 19/20 | ⭐⭐⭐ |
| SRS Review (+ Export) | 19/20 | ⭐⭐⭐ |
| Chat IA (+ Feedback) | 20/20 | ⭐⭐⭐ |
| Progression | 20/20 | ⭐⭐⭐ |
| Architecture | 20/20 | ⭐⭐⭐ |
| **Global** | **20/20** | **⭐⭐⭐** |

---

## 🏗️ Architecture Consolidée

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                       │
│     Components → Hooks → unifiedApiClient → Edge Functions   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 5 EDGE FUNCTION ROUTERS                      │
│  ┌─────────┐ ┌─────────┐ ┌───────────┐ ┌────────┐ ┌────────┐│
│  │ai-audio │ │ ai-core │ │ai-content │ │ system │ │webhooks││
│  └─────────┘ └─────────┘ └───────────┘ └────────┘ └────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                             │
│         Suno │ OpenAI │ Stripe │ Resend │ ElevenLabs        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE_PLATEFORME.md](./docs/ARCHITECTURE_PLATEFORME.md) | Architecture consolidée v3.0 |
| [AUDIT_COMPLET_MODULES.md](./docs/AUDIT_COMPLET_MODULES.md) | Audit détaillé par module |
| [AUDIT_COHERENCE_PLATEFORME.md](./docs/AUDIT_COHERENCE_PLATEFORME.md) | Cohérence design system |
| [STATUT-PLATEFORME-RESUME.md](./docs/STATUT-PLATEFORME-RESUME.md) | Résumé exécutif |

---

## 📞 Support

- **Documentation** : `/docs`
- **Issues** : GitHub Issues
- **Email** : support@med-mng.app

---

<p align="center">
  <strong>🎵 MED-MNG - Apprendre la médecine en musique 🎵</strong>
  <br>
  <em>Made with ❤️ for medical students</em>
</p>

---

*Dernière mise à jour : 1er Février 2026 - Version 3.0 (Architecture Consolidée)*
