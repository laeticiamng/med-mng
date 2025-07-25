# 🚀 MED-MNG Platform - Guide de démarrage rapide

[![CI/CD Pipeline](https://github.com/med-mng/med-mng/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/med-mng/med-mng/actions/workflows/ci-cd.yml)
[![Security Score](https://img.shields.io/badge/Security-A-green.svg)](./docs/axe5-security.md)
[![Test Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen.svg)](./docs/TESTING_COMPLETE.md)

> **🎯 Plateforme d'extraction de données médicales avec génération musicale IA**  
> Onboarding développeur en moins de 10 minutes garanties ⚡

## 🎬 Démarrage ultra-rapide (< 5 min)

```bash
# 1. Clone & Install
git clone https://github.com/votre-org/med-mng.git
cd med-mng
npm install

# 2. Démarrage dev
npm run dev
# ➡️ App disponible sur http://localhost:5173

# 3. Tests (optionnel)
npm test        # Tests unitaires
npm run test:e2e # Tests E2E
```

🎉 **Terminé !** Votre environnement est prêt.

---

## 📁 Architecture du projet

```
med-mng/
├── 🎨 src/
│   ├── components/     # Composants React réutilisables
│   │   ├── admin/      # Dashboards admin temps réel
│   │   ├── audit/      # Outils d'audit et monitoring
│   │   ├── common/     # Composants partagés (alerts, errors, etc.)
│   │   └── security/   # Composants de sécurité
│   ├── hooks/          # Hooks React customs
│   ├── services/       # Services (API, rate limiting, etc.)
│   ├── utils/          # Utilitaires (sanitization, validation)
│   └── pages/          # Pages principales
├── 🔧 supabase/
│   └── functions/      # Edge Functions (extraction, musique)
├── 🧪 tests/           # Tests E2E Playwright
├── 📚 docs/            # Documentation technique
└── 🔒 scripts/         # Scripts d'audit et sécurité
```

---

## 🛠️ Commandes essentielles

### Développement
```bash
npm run dev              # Serveur de développement
npm run build            # Build production
npm run preview          # Prévisualiser build
npm run lint             # Linter TypeScript/ESLint
npm run type-check       # Vérification TypeScript
```

### Tests & Qualité
```bash
npm test                 # Tests unitaires Vitest
npm run test:e2e         # Tests E2E Playwright
npm run test:coverage    # Couverture de tests
npm run audit:security   # Audit sécurité complet
```

### Base de données & Backend
```bash
npm run supabase:start   # Supabase local
npm run supabase:reset   # Reset DB locale
npm run extraction:test  # Test extraction OIC
npm run health:check     # Check santé système
```

### Storybook (Design System)
```bash
npm run storybook        # Lance Storybook
# ➡️ http://localhost:6006
npm run build-storybook  # Build Storybook
```

---

## ⚙️ Configuration

### Variables d'environnement requises
Créez un fichier `.env.local` avec :

```bash
# Supabase (OBLIGATOIRE)
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-cle-publique

# APIs Externes (configurées via Supabase Edge Functions Secrets)
# CAS_USERNAME=__TO_DEFINE__
# CAS_PASSWORD=__TO_DEFINE__
# OPENAI_API_KEY=__TO_DEFINE__
# SUNO_API_KEY=__TO_DEFINE__
```

🔒 **Important** : Les clés sensibles sont gérées via Supabase Edge Functions Secrets, pas en variables d'environnement locales.

### Supabase Setup
1. **Créer un projet** sur [supabase.com](https://supabase.com)
2. **Récupérer URL et clés** dans Settings > API
3. **Configurer les secrets** dans Settings > Edge Functions

---

## 🧩 Composants principaux

### Dashboard Admin
```typescript
import { AdminDashboard } from '@/components/admin/AdminDashboard';

// Dashboard temps réel avec monitoring extraction
<AdminDashboard />
```

### Système d'alertes
```typescript
import { AlertBanner } from '@/components/common/AlertBanner';

// Alertes système intelligentes
<AlertBanner type="error" message="Extraction échouée" />
```

### Sécurité
```typescript
import { SecurityDashboard } from '@/components/security/SecurityDashboard';

// Monitoring sécurité en temps réel
<SecurityDashboard />
```

---

## 🧪 Guide Testing

### Tests unitaires (Vitest)
```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

### Tests E2E (Playwright)
```bash
# Setup initial
npx playwright install

# Lancer tests E2E
npm run test:e2e

# Mode interactif
npm run test:e2e:ui
```

### Structure des tests
```
tests/
├── e2e/                # Tests end-to-end
│   ├── auth.spec.ts    # Tests authentification
│   ├── extraction.spec.ts # Tests extraction
│   └── music.spec.ts   # Tests génération musicale
└── unit/               # Tests unitaires
    ├── components/     # Tests composants
    └── services/       # Tests services
```

---

## 🐛 Debug & Troubleshooting

### Problèmes courants

#### ❌ Erreur de build TypeScript (TS6305)
```bash
# Solution : Clear cache et rebuild
rm -rf node_modules/.vite
rm -rf dist
npm run build
```

#### ❌ Tests E2E qui échouent
```bash
# Vérifier que l'app tourne
npm run dev

# Dans un autre terminal
npm run test:e2e
```

#### ❌ Extraction OIC ne fonctionne pas
```bash
# Vérifier les credentials CAS
npm run extraction:test

# Check logs Supabase
# ➡️ Dashboard Supabase > Edge Functions > Logs
```

#### ❌ API Rate Limited
```bash
# Check status rate limiting
curl -I http://localhost:5173/api/health

# Réinitialiser les limites
npm run rate-limit:reset
```

### Logs & Monitoring
- **Console développeur** : F12 > Console
- **Supabase Logs** : Dashboard > Edge Functions > Logs  
- **Admin Dashboard** : `/admin-center` dans l'app
- **Security Dashboard** : Monitoring sécurité temps réel

---

## 🚀 Déploiement

### Staging (automatique)
```bash
# Push sur main = déploiement auto staging
git push origin main
# ➡️ URL staging générée automatiquement
```

### Production
```bash
# Créer une release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# ➡️ Déploiement production automatique
```

### Health Checks post-déploiement
- ✅ **App responsive** : Tests automatiques
- ✅ **APIs fonctionnelles** : Tests d'intégration
- ✅ **Base de données** : Validation schéma
- ✅ **Sécurité** : Scan automatique

---

## 👥 Équipe & Contacts

### 🔧 Développement
- **Issues GitHub** : [github.com/votre-org/med-mng/issues](https://github.com)
- **Pull Requests** : Process standard GitHub
- **Code Review** : Obligatoire sur main

### 🚨 Support & Incidents
- **Discord/Slack** : Canaux configurés pour alertes
- **Email** : equipe@votre-domaine.com
- **On-call** : Rotation développeurs senior

### 📋 Process
1. **Feature** : Issue → Branch → PR → Review → Merge
2. **Bug** : Issue urgent → Hotfix → Deploy
3. **Release** : Tag → Auto-deploy → Health check

---

## 📚 Documentation avancée

### Liens utiles
- [🔒 Sécurité & Audit](./docs/axe5-security.md)
- [🧪 Tests complets](./docs/TESTING_COMPLETE.md)  
- [⚙️ CI/CD Pipeline](./docs/CI-CD-PIPELINE.md)
- [📊 Monitoring](./docs/axe3-monitoring.md)
- [👨‍💼 Admin Dashboard](./docs/axe4-ux-admin-dashboards.md)
- [📚 Storybook Guide](./docs/storybook-guide.md)
- [❓ FAQ Complète](./docs/FAQ.md)

### API Documentation
- **Supabase API** : Auto-générée
- **Edge Functions** : `/supabase/functions/README.md`
- **Rate Limiting** : Configuration dans `nginx.conf`

---

## 🎯 Quick Win Checklist

### Pour les nouveaux développeurs
- [ ] Clone & `npm install` (2 min)
- [ ] `npm run dev` fonctionne (1 min)  
- [ ] Tests passent `npm test` (2 min)
- [ ] Dashboard admin accessible `/admin-center` (1 min)
- [ ] Storybook accessible `npm run storybook` (1 min)
- [ ] Création d'une feature simple (10 min)

### Pour les QA
- [ ] Tests E2E setup `npm run test:e2e` (5 min)
- [ ] Extraction test `npm run extraction:test` (3 min)
- [ ] Security audit `npm run audit:security` (2 min)

### Pour les DevOps
- [ ] Pipeline CI/CD accessible (GitHub Actions)
- [ ] Monitoring dashboards opérationnels
- [ ] Déploiement staging/prod automatique
- [ ] Alertes configurées (Discord/Slack)

---

🎉 **Félicitations !** Vous maîtrisez maintenant MED-MNG. Questions ? Consultez la [FAQ](./docs/FAQ.md) ou créez une issue GitHub !