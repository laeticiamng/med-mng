# Tests End-to-End (E2E) MED-MNG

## ✅ Configuration Complète

Suite de tests E2E avec Playwright pour valider les fonctionnalités critiques du backend MED-MNG.

### 📋 Couverture des tests

- **🔧 Extraction** : Validation des Edge Functions OIC/EDN/ECOS
- **🎵 Génération Musicale** : Tests Suno API et pipeline complet  
- **🔒 Authentification** : RLS, JWT, permissions Supabase
- **🌐 API Générale** : Performance, erreurs, intégrations

### 🚀 Commandes

```bash
# Installation
pnpm install

# Lancer tous les tests E2E
pnpm test:e2e

# Tests par catégorie
pnpm test:e2e:extraction
pnpm test:e2e:music  
pnpm test:e2e:auth
pnpm test:e2e:api

# Mode debug
pnpm test:e2e:debug

# Tests en mode headed (avec navigateur visible)
pnpm test:e2e:headed
```

### 🔧 Scripts Package.json

Ajoutez dans votre `package.json` :

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:extraction": "playwright test tests/e2e/extraction",
    "test:e2e:music": "playwright test tests/e2e/music", 
    "test:e2e:auth": "playwright test tests/e2e/auth",
    "test:e2e:api": "playwright test tests/e2e/api",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 🌍 Variables d'environnement

```bash
# .env.test (local)
E2E_BASE_URL=https://yaincoxihiqdksxgrsrk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU
```

### 📊 CI/CD Intégration

Les tests E2E sont automatiquement exécutés dans le pipeline CI/CD :

- **🔄 Pull Request** : Validation complète
- **📤 Push main** : Tests + déploiement staging
- **🏷️ Release** : Tests + déploiement production

### 🛠️ Structure des tests

```
tests/e2e/
├── extraction/
│   └── extraction.spec.ts      # Tests Edge Functions extraction
├── music/
│   └── music-generation.spec.ts # Tests génération musicale  
├── auth/
│   └── authentication.spec.ts   # Tests auth et RLS
└── api/
    └── general-api.spec.ts      # Tests API généraux
```

### 🎯 Critères de succès

- **🟢 Vert** : Tous les tests passent
- **🟡 Jaune** : Tests non critiques échouent (quota API)
- **🔴 Rouge** : Tests critiques échouent (build bloqué)

### 🔍 Debug et troubleshooting

```bash
# Voir les traces détaillées
pnpm test:e2e --trace=on

# Rapport HTML
pnpm test:e2e --reporter=html

# Tests spécifiques
pnpm test:e2e --grep="extraction"
```

### 📈 Métriques

Les tests mesurent :
- **⚡ Performance** : < 3s par endpoint
- **🔒 Sécurité** : RLS et auth fonctionnels
- **🎵 Intégrations** : API externes disponibles
- **📊 Données** : Cohérence base de données

**Tests E2E prêts pour la production !** 🚀