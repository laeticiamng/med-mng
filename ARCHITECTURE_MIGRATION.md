# 🏗️ MIGRATION ARCHITECTURALE MED-MNG

## 📊 État actuel vs Architecture cible

### Structure ACTUELLE (simple)
```
src/
├── components/          # Composants mélangés (UI + métier)
├── pages/              # Pages directes
├── hooks/              # Hooks React variés
├── contexts/           # Contextes React
├── types/              # Types locaux
├── integrations/       # Supabase seulement
├── lib/                # Utilitaires mélangés
└── styles/             # Styles
```

### Architecture CIBLE (monorepo professionnel)
```
apps/
├── api/                # API backend
├── web/                # Frontend React
├── worker/             # Jobs arrière-plan
└── cron/               # Tâches planifiées

packages/
├── core/               # Logique métier pure
├── types/              # Contrats de données
├── ui/                 # Design system
├── shared/             # Utilitaires communs
└── config/             # Configuration partagée

src/ (dans apps/web)
├── features/           # Fonctionnalités métier complètes
├── controllers/        # Orchestration UI ↔ Services
├── services/           # Accès données (API/Supabase)
├── integrations/       # Services externes (Suno, OpenAI)
├── components/         # UI pure réutilisable
├── pages/              # Routes/écrans
├── stores/             # État global
├── hooks/              # Logique React réutilisable
├── schemas/            # Validation données
└── utils/              # Fonctions utilitaires
```

## 🎯 Plan de migration (Phase par Phase)

### Phase 1: Restructuration packages/
1. **packages/core** - Extraire logique métier
2. **packages/types** - Centraliser tous les types
3. **packages/ui** - Design system unifié
4. **packages/shared** - Utilitaires communs

### Phase 2: Réorganisation src/
1. **src/features/** - Regrouper par fonctionnalité
2. **src/controllers/** - Orchestration propre
3. **src/services/** - Accès données standardisé
4. **src/integrations/** - Services externes

### Phase 3: Apps séparées
1. **apps/web** - Frontend restructuré
2. **apps/api** - API dédiée
3. **apps/worker** - Jobs asynchrones

## 🔄 Règles de migration

### DO ✅
- **Séparer UI ↔ Métier** : UI dans components, métier dans features/controllers
- **Centraliser types** : packages/types pour tout
- **Services dédiés** : une intégration = un module
- **Validation partout** : schemas à l'entrée/sortie

### DON'T ❌
- **Logique métier dans UI** : React reste présentation
- **Types éparpillés** : tout dans packages/types
- **Features fourre-tout** : une feature = un use-case
- **Appels directs** : toujours passer par services/controllers

## 🎯 Fonctionnalités MED-MNG à restructurer

### Features identifiées
```typescript
src/features/
├── edn-system/         # Items EDN (367 items)
│   ├── components/
│   ├── controllers/
│   ├── services/
│   └── types/
├── ecos-simulation/    # Simulations ECOS
├── music-generation/   # IA musicale (Suno)
├── ai-assistant/       # MedChat IA
├── user-profile/       # Profils & badges
├── analytics/          # Métriques apprentissage
├── community/          # Social médical
└── med-mng-studio/     # Studio musical premium
```

### Controllers à créer
```typescript
src/controllers/
├── EdnController.ts       # Gestion items EDN
├── MusicController.ts     # Génération/lecture
├── ChatController.ts      # Assistant IA
├── UserController.ts      # Profils/settings
├── AnalyticsController.ts # Métriques
└── AuthController.ts      # Authentification
```

### Services à structurer
```typescript
src/services/
├── SupabaseService.ts     # Base de données
├── AIService.ts           # OpenAI/Assistant
├── MusicService.ts        # Suno/Audio
├── AnalyticsService.ts    # Métriques
└── AuthService.ts         # Authentification
```

## 🚀 Avantages de la migration

### Maintenabilité
- **Séparation claire** des responsabilités
- **Tests unitaires** plus faciles (core isolé)
- **Debugging** simplifié par couches

### Scalabilité
- **Équipes multiples** peuvent travailler en parallèle
- **Deploy indépendant** des apps
- **Réutilisabilité** maximale (packages)

### Qualité
- **Validation** systématique (schemas)
- **Types cohérents** (packages/types)
- **Design system** unifié (packages/ui)

## ⏳ Timeline estimée

### Semaine 1-2: Packages
- Créer packages/core avec logique métier
- Migrer types vers packages/types
- Extraire UI vers packages/ui

### Semaine 3-4: Features
- Restructurer par fonctionnalité
- Créer controllers dédiés
- Standardiser services

### Semaine 5-6: Apps
- Séparer apps/web/api
- Configurer monorepo (Turborepo/Nx)
- Tests d'intégration

## 🎯 Objectif final

Une architecture **robuste**, **scalable** et **maintenable** pour MED-MNG qui permet :
- **Développement équipe** efficace
- **Tests** complets et isolés  
- **Deploy** séparé des composants
- **Évolution** sans régression