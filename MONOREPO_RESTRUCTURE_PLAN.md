# 🏗️ Plan de Restructuration Monorepo - MED-MNG

**Date**: 2025-11-16
**Objectif**: Restructurer le dépôt med-mng selon les recommandations de l'audit de sécurité pour améliorer la maintenabilité, la scalabilité et la séparation des responsabilités.

---

## 📊 État Actuel vs État Cible

### Structure Actuelle

```
med-mng/
├── src/                          # ❌ Frontend React mélangé avec backend
│   ├── components/
│   ├── hooks/
│   ├── server/                  # Backend Express
│   ├── App.tsx
│   └── main.tsx
├── supabase/functions/          # ❌ 80+ fonctions edge dans un dossier plat
│   ├── unified-extract/
│   ├── openai-chat/
│   └── ... (78 autres)
├── apps/
│   ├── api/supabase/functions/  # ✅ Nouvelle structure (1 fonction seulement)
│   │   └── unified-extract/
│   ├── cron/                    # ⚠️ Vide (préparé)
│   └── worker/                  # ⚠️ Vide (préparé)
├── packages/
│   └── shared/                  # ⚠️ Vide (préparé)
├── scripts/                     # ⚠️ Scripts utilitaires non organisés
└── docs/                        # ✅ Documentation bien organisée
```

### Structure Cible

```
med-mng/
├── apps/
│   ├── frontend/                # ✅ Application React/Vite
│   │   ├── src/
│   │   ├── public/
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── backend/                 # ✅ API Express/NestJS
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── controllers/
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── functions/               # ✅ Fonctions Supabase (edge functions)
│   │   ├── unified-extract/
│   │   ├── openai-chat/
│   │   ├── stripe-webhook/
│   │   └── ... (fonctions organisées par domaine)
│   ├── cron/                    # ✅ Tâches planifiées
│   │   ├── daily-backup/
│   │   ├── weekly-reports/
│   │   └── package.json
│   └── worker/                  # ✅ Background workers
│       ├── data-processing/
│       └── package.json
├── packages/
│   ├── shared/                  # ✅ Types, interfaces, utilitaires communs
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── schemas/         # Schémas Zod partagés
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── ui/                      # 🔮 Futur: composants UI réutilisables
├── tools/                       # ✅ Scripts de développement et migration
│   ├── migration/
│   └── generators/
├── docs/                        # ✅ Documentation (déjà bien organisée)
├── .github/                     # ✅ Workflows CI/CD
└── pnpm-workspace.yaml          # ✅ Configuration workspace
```

---

## 🎯 Objectifs de la Restructuration

### 1. **Séparation des Responsabilités**
- ✅ Frontend et backend complètement découplés
- ✅ Fonctions edge isolées par domaine métier
- ✅ Code partagé centralisé dans `packages/`

### 2. **Maintenabilité**
- ✅ Chaque app a son propre `package.json`
- ✅ Dépendances isolées par contexte
- ✅ Build et déploiement indépendants

### 3. **Scalabilité**
- ✅ Ajout facile de nouvelles apps (mobile, admin, etc.)
- ✅ Microservices-ready
- ✅ Monorepo pnpm workspace optimisé

### 4. **Sécurité**
- ✅ Isolation des secrets par environnement
- ✅ Validation centralisée dans `packages/shared`
- ✅ Middleware de sécurité réutilisable

---

## 📋 Plan d'Exécution (5 Phases)

### Phase 1: Configuration Workspace ⚙️

**Durée estimée**: 30 min

1. Créer `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

2. Structurer les package.json:
   - Package root (scripts globaux)
   - apps/frontend/package.json
   - apps/backend/package.json
   - apps/functions/package.json (Deno)
   - packages/shared/package.json

**Checklist**:
- [ ] pnpm-workspace.yaml créé
- [ ] Package.json configurés pour chaque app
- [ ] Scripts de build globaux définis

---

### Phase 2: Migration Frontend 🎨

**Durée estimée**: 1h

1. **Créer apps/frontend/**:
```bash
mkdir -p apps/frontend/src
mkdir -p apps/frontend/public
```

2. **Déplacer les fichiers**:
```bash
# Frontend code
mv src/components apps/frontend/src/
mv src/hooks apps/frontend/src/
mv src/contexts apps/frontend/src/
mv src/lib apps/frontend/src/
mv src/integrations apps/frontend/src/
mv src/data apps/frontend/src/
mv src/locales apps/frontend/src/
mv src/assets apps/frontend/src/
mv src/App.* apps/frontend/src/
mv src/main.tsx apps/frontend/src/
mv src/index.css apps/frontend/src/
mv src/*.css apps/frontend/src/

# Public assets
mv public/* apps/frontend/public/

# Config files
mv vite.config.ts apps/frontend/
mv tailwind.config.ts apps/frontend/
mv postcss.config.js apps/frontend/
```

3. **Créer apps/frontend/package.json**:
```json
{
  "name": "@med-mng/frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@med-mng/shared": "workspace:*"
  }
}
```

4. **Mettre à jour les imports**:
   - Remplacer imports absolus par chemins relatifs ou aliases
   - Ajouter alias dans vite.config.ts pour `@shared`

**Checklist**:
- [ ] apps/frontend/ créé
- [ ] Fichiers déplacés
- [ ] package.json configuré
- [ ] Build fonctionne: `pnpm --filter @med-mng/frontend build`
- [ ] Dev server fonctionne: `pnpm --filter @med-mng/frontend dev`

---

### Phase 3: Migration Backend 🔧

**Durée estimée**: 45 min

1. **Créer apps/backend/**:
```bash
mkdir -p apps/backend/src/{routes,middleware,controllers,utils}
```

2. **Déplacer les fichiers**:
```bash
# Backend Express
mv src/server/* apps/backend/src/
mv src/middleware apps/backend/src/
mv src/controllers apps/backend/src/
mv src/utils apps/backend/src/
mv src/index.ts apps/backend/src/
```

3. **Créer apps/backend/package.json**:
```json
{
  "name": "@med-mng/backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "ts-node-esm src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "helmet": "^7.2.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.5.1",
    "@med-mng/shared": "workspace:*"
  }
}
```

4. **Configuration TypeScript**:
   - Créer apps/backend/tsconfig.json
   - Référencer packages/shared dans paths

**Checklist**:
- [ ] apps/backend/ créé
- [ ] Fichiers déplacés
- [ ] package.json configuré
- [ ] Build réussit: `pnpm --filter @med-mng/backend build`
- [ ] Server démarre: `pnpm --filter @med-mng/backend dev`

---

### Phase 4: Organisation Fonctions Supabase ☁️

**Durée estimée**: 2h (80+ fonctions)

1. **Organiser par domaine**:
```bash
apps/functions/
├── auth/                 # Authentification
│   ├── auth-webhook/
│   └── generate-cas-cookie/
├── analytics/            # Analytics & Tracking
│   ├── analytics-tracker/
│   └── analytics-engine/
├── content/              # Gestion de contenu
│   ├── openai-chat/
│   ├── content-ai-generator/
│   └── qcm-generator/
├── extraction/           # Extraction EDN/ECOS
│   ├── unified-extract/
│   ├── extract-edn-uness/
│   └── secure-edn-extraction/
├── webhooks/             # Webhooks externes
│   ├── stripe-webhook/
│   ├── shopify-webhook/
│   └── github-quality-webhook/
├── security/             # Sécurité & Monitoring
│   ├── security-scanner/
│   ├── security-alerts/
│   └── audit-system/
├── music/                # Génération musicale
│   ├── generate-music/
│   └── playlist-manager/
└── admin/                # Administration
    ├── admin-export/
    └── admin-quick-edit/
```

2. **Stratégie de migration progressive**:
   - ✅ Créer des liens symboliques temporaires
   - ✅ Migrer une fonction par domaine pour tester
   - ✅ Valider déploiement Supabase
   - ✅ Migrer le reste par batch

3. **Script de migration automatique**:
```bash
# tools/migrate-functions.sh
#!/bin/bash
# Script pour déplacer les fonctions vers apps/functions/
```

**Checklist**:
- [ ] Catégories de domaines définies
- [ ] Script de migration créé
- [ ] Test migration 1 fonction (ex: unified-extract)
- [ ] Déploiement Supabase validé
- [ ] Toutes les fonctions migrées
- [ ] Ancien dossier supabase/functions/ supprimé

---

### Phase 5: Package Shared 📦

**Durée estimée**: 1h30

1. **Créer la structure**:
```bash
packages/shared/
├── src/
│   ├── types/
│   │   ├── supabase.ts        # Types Supabase auto-générés
│   │   ├── api.ts             # Types API
│   │   └── domain.ts          # Types métier
│   ├── schemas/
│   │   ├── validation.ts      # Schémas Zod communs
│   │   └── api-schemas.ts     # Schémas d'API
│   ├── utils/
│   │   ├── error-handling.ts
│   │   ├── formatting.ts
│   │   └── security.ts
│   ├── constants/
│   │   └── config.ts
│   └── index.ts               # Barrel exports
├── tsconfig.json
└── package.json
```

2. **Migrer les types communs**:
   - Extraire types partagés entre frontend/backend
   - Créer schémas Zod réutilisables
   - Migrer utilitaires communs

3. **Configuration package.json**:
```json
{
  "name": "@med-mng/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./schemas": "./src/schemas/index.ts",
    "./utils": "./src/utils/index.ts"
  }
}
```

**Checklist**:
- [ ] Structure créée
- [ ] Types communs extraits et déplacés
- [ ] Schémas Zod partagés créés
- [ ] Utilitaires migrés
- [ ] Imports mis à jour dans frontend/backend
- [ ] Build validé

---

## 🔄 Migration des Scripts et Configuration

### Scripts Root (package.json)

```json
{
  "scripts": {
    "dev": "pnpm --parallel --filter @med-mng/frontend --filter @med-mng/backend dev",
    "build": "pnpm -r build",
    "build:frontend": "pnpm --filter @med-mng/frontend build",
    "build:backend": "pnpm --filter @med-mng/backend build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "deploy:functions": "pnpm --filter @med-mng/functions deploy"
  }
}
```

### Configuration TypeScript

Créer un `tsconfig.base.json` partagé:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@shared/*": ["../../packages/shared/src/*"]
    }
  }
}
```

Chaque app étend cette config:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

---

## ⚠️ Risques et Mitigations

### Risque 1: Casser le Build
**Mitigation**:
- ✅ Créer une branche dédiée `feat/monorepo-restructure`
- ✅ Tester chaque phase indépendamment
- ✅ Garder l'ancienne structure jusqu'à validation complète

### Risque 2: Déploiement Supabase Functions
**Mitigation**:
- ✅ Migrer d'abord unified-extract (déjà testée)
- ✅ Créer un script de déploiement automatisé
- ✅ Tester en environnement staging

### Risque 3: Imports Cassés
**Mitigation**:
- ✅ Utiliser des alias TypeScript (`@shared`, `@backend`, etc.)
- ✅ Script de recherche/remplacement automatique
- ✅ Vérifier avec `tsc --noEmit` à chaque étape

### Risque 4: CI/CD Workflows
**Mitigation**:
- ✅ Mettre à jour `.github/workflows/` progressivement
- ✅ Tester chaque workflow avant merge
- ✅ Conserver rollback plan

---

## 📊 Checklist Finale de Validation

### ✅ Build & Tests
- [ ] `pnpm build` réussit (root)
- [ ] `pnpm --filter @med-mng/frontend build` réussit
- [ ] `pnpm --filter @med-mng/backend build` réussit
- [ ] `pnpm --filter @med-mng/shared build` réussit
- [ ] `pnpm test` passe (toutes les apps)

### ✅ Développement
- [ ] `pnpm dev` lance frontend + backend en parallèle
- [ ] Hot reload fonctionne (frontend)
- [ ] Hot reload fonctionne (backend)
- [ ] Imports `@shared` fonctionnent partout

### ✅ CI/CD
- [ ] Workflow CI passe (lint, typecheck, tests)
- [ ] Build Docker réussit
- [ ] Déploiement Supabase functions validé
- [ ] E2E tests passent

### ✅ Documentation
- [ ] README.md mis à jour avec nouvelle structure
- [ ] Documentation de migration créée
- [ ] Guide de contribution mis à jour
- [ ] Scripts de développement documentés

---

## 🚀 Timeline Estimée

| Phase | Durée | Dépendances |
|-------|-------|-------------|
| Phase 1: Workspace Config | 30 min | Aucune |
| Phase 2: Frontend | 1h | Phase 1 |
| Phase 3: Backend | 45 min | Phase 1 |
| Phase 4: Functions | 2h | Phase 1 |
| Phase 5: Shared Package | 1h30 | Phases 2, 3 |
| Tests & Validation | 1h | Toutes |
| CI/CD Updates | 30 min | Tests OK |

**Total estimé**: ~7h de travail technique

---

## 📝 Notes Importantes

1. **Supabase Functions**: Les fonctions Deno n'ont pas de package.json classique. Utiliser `deno.json` si nécessaire.

2. **Backward Compatibility**: Créer des aliases/symlinks temporaires pour assurer la compatibilité pendant la transition.

3. **Environment Variables**: Réviser `.env.example` pour chaque app.

4. **Git**: Utiliser `git mv` au lieu de `mv` pour préserver l'historique.

---

## ✅ Prêt à Démarrer ?

**Actions immédiates**:
1. Créer branche: `git checkout -b feat/monorepo-restructure`
2. Commencer par Phase 1 (Workspace Config)
3. Valider chaque phase avant de passer à la suivante

**Contact**: Si blocage, consulter l'équipe DevOps.

---

**Document créé le**: 2025-11-16
**Dernière mise à jour**: 2025-11-16
**Statut**: 📋 Plan prêt - En attente de validation
