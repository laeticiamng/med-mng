# 🏥 MED-MNG - Plateforme d'Apprentissage Médical Intelligent

**Version 2.0 | Dernière mise à jour : 29 Janvier 2026**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com/med-mng/med-mng)
[![Score Audit](https://img.shields.io/badge/Audit%20Score-20%2F20-brightgreen)](./docs/AUDIT-TESTS-COMPLET.md)
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
| **ECOS Simulator** | Simulations cliniques interactives |
| **Tableaux Rang A/B** | Concepts fondamentaux et experts |

### 🧠 Apprentissage Intelligent

| Outil | Description |
|-------|-------------|
| **SRS Review** | Répétition espacée adaptative |
| **Exam Mode** | QCM avec feedback animé + confetti |
| **Flashcards** | Cartes avec animation flip 3D |
| **Cas Cliniques IA** | Génération de cas par intelligence artificielle |
| **Chat IA Médical** | Assistant avec sources officielles |

### 📊 Progression & Gamification

| Feature | Description |
|---------|-------------|
| **Dashboard Progression** | Heatmap d'activité, anneaux animés |
| **Système de Points** | XP, niveaux, streaks |
| **Badges & Achievements** | Récompenses débloquables |
| **Leaderboard** | Classement communautaire |

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
| **Testing** | Vitest, Playwright, Testing Library |

---

## 📁 Structure du Projet

```
med-mng/
├── 📁 src/
│   ├── 📁 pages/                    # 73 pages
│   │   ├── Index.tsx                # Page d'accueil
│   │   ├── EdnComplete.tsx          # Items EDN
│   │   ├── ExamMode.tsx             # Mode examen
│   │   ├── Flashcards.tsx           # Flashcards
│   │   ├── MedChat.tsx              # Chat IA
│   │   ├── MedMngCreate.tsx         # Création musicale
│   │   ├── MedMngProgress.tsx       # Progression
│   │   ├── EcosIndex.tsx            # ECOS
│   │   └── ...
│   │
│   ├── 📁 components/               # Composants réutilisables
│   │   ├── 📁 ui/                   # Design system (shadcn)
│   │   │   ├── animated-counter.tsx
│   │   │   ├── animated-progress-ring.tsx
│   │   │   ├── confetti-explosion.tsx
│   │   │   ├── flip-card.tsx
│   │   │   └── ... (50+ composants)
│   │   ├── 📁 edn/                  # Composants EDN
│   │   ├── 📁 med-mng/              # Composants MED-MNG
│   │   ├── 📁 quiz/                 # Composants Quiz
│   │   ├── 📁 pricing/              # Composants Tarifs
│   │   ├── 📁 progress/             # Composants Progression
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
│   ├── AUDIT-TESTS-COMPLET.md
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
| `/exam-mode` | ExamMode | Mode examen QCM |
| `/ecos` | EcosIndex | Simulations ECOS |
| `/med-mng/progress` | MedMngProgress | Tableau de progression |
| `/chat` | MedChat | Assistant IA médical |
| `/flashcards` | Flashcards | Cartes mémoire |
| `/med-mng/create` | MedMngCreate | Génération musicale |
| `/med-mng/pricing` | MedMngPricing | Plans & Tarifs |
| `/statistics` | Statistics | Statistiques détaillées |
| `/achievements` | Achievements | Badges & Succès |

### Routes Secondaires (Menu "Plus")

| Route | Page | Description |
|-------|------|-------------|
| `/srs-review` | SRSReview | Révision espacée |
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
| `/admin/extract-edn` | AdminExtractEdn | Extraction EDN |
| `/diagnostics` | Diagnostics | Outils debug |

### Routes Légales

| Route | Page |
|-------|------|
| `/mentions-legales` | Mentions légales |
| `/politique-confidentialite` | Politique de confidentialité |
| `/cgu` | CGU |
| `/mes-donnees-rgpd` | RGPD |

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

#### 🔧 Utilitaires

```typescript
useDebounce()             // Debounce
useNetworkStatus()        // État réseau
usePWA()                  // PWA status
useCache()                // Cache local
```

---

## 🎨 Design System

### Tokens CSS (index.css)

```css
:root {
  /* Couleurs principales */
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 47 100% 50%;
  --secondary: 270 50% 40%;
  --accent: 280 100% 70%;
  
  /* Feedback */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
  
  /* Composants */
  --card: 0 0% 7%;
  --muted: 0 0% 15%;
  --border: 0 0% 15%;
}
```

### Composants UI Animés

| Composant | Fonction |
|-----------|----------|
| `AnimatedCounter` | Compteur animé avec spring |
| `AnimatedProgressRing` | Anneau de progression SVG |
| `ConfettiExplosion` | Célébration (success/gold) |
| `FlipCard` | Carte retournable 3D |
| `ProgressHeatmap` | Heatmap style GitHub |

### Usage

```tsx
import { AnimatedProgressRing } from "@/components/ui/animated-progress-ring";
import { ConfettiExplosion } from "@/components/ui/confetti-explosion";

<AnimatedProgressRing 
  value={75} 
  max={100} 
  color="success" 
  label="Complété"
/>

<ConfettiExplosion trigger={isSuccess} type="gold" />
```

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
| **Analytics** | `pwa_metrics`, `page_analytics`, `user_analytics` |

### Sécurité RLS

Toutes les tables utilisent Row Level Security :

```sql
-- Exemple: Utilisateurs voient leurs propres données
CREATE POLICY "Users can view own data"
ON flashcards FOR SELECT
USING (auth.uid() = user_id);
```

---

## ⚡ Edge Functions

### Functions Déployées

| Function | Description |
|----------|-------------|
| `suno-generate` | Génération musicale Suno |
| `suno-credits` | Vérification crédits |
| `openai-chat` | Proxy Chat IA |
| `send-welcome-email` | Email de bienvenue |

### Appel depuis le Frontend

```typescript
const { data } = await supabase.functions.invoke('suno-generate', {
  body: { prompt, itemCode }
});
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
src/
├── test/
│   └── setup.ts           # Configuration Vitest
├── components/
│   └── Button.test.tsx    # Tests composants
└── hooks/
    └── useFlashcards.test.ts
```

---

## 📱 PWA & Offline

### Fonctionnalités PWA

- ✅ Installation sur mobile/desktop
- ✅ Mode offline avec Service Worker
- ✅ Push notifications
- ✅ Cache audio intelligent
- ✅ Core Web Vitals tracking

### Configuration

```javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    runtimeCaching: [...]
  }
})
```

---

## 🔐 Sécurité

### Mesures Implémentées

| Mesure | Status |
|--------|--------|
| RLS sur toutes les tables | ✅ |
| Rate Limiting API | ✅ |
| Sanitization inputs | ✅ |
| HTTPS only | ✅ |
| Secrets en Edge Functions | ✅ |
| CSP Headers | ✅ |

### Rate Limiting

```typescript
// Limites par endpoint
Auth: 3 tentatives/15min
API: 100 req/min  
Music Generation: 5/min
```

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
| `/admin/audit` | Audit système |
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

---

## 📈 Scores Audit

| Module | Utilité | UX | Score |
|--------|---------|-----|-------|
| Accueil | 20/20 | 20/20 | ⭐ |
| Items EDN | 20/20 | 20/20 | ⭐ |
| Quiz/Examen | 20/20 | 20/20 | ⭐ |
| Flashcards | 20/20 | 20/20 | ⭐ |
| Progression | 20/20 | 20/20 | ⭐ |
| Tarifs | 20/20 | 20/20 | ⭐ |
| **Global** | **20/20** | **20/20** | **⭐⭐⭐** |

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

*Dernière mise à jour : 29 Janvier 2026*
