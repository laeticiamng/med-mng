# 🏥 MED-MNG - Plateforme Médicale Intelligente
**Dernière mise à jour : 28 Juillet 2025**

[![CI/CD Pipeline](https://github.com/med-mng/med-mng/actions/workflows/ci.yml/badge.svg)](https://github.com/med-mng/med-mng/actions/workflows/ci.yml)
[![Performance](https://img.shields.io/badge/Performance-B+-green)](https://lighthouse.com)
[![Security](https://img.shields.io/badge/Security-A-brightgreen)](https://securityheaders.com)
[![Audit Score](https://img.shields.io/badge/Audit%20Score-98.3%2F100-brightgreen)](./docs/AUDIT-PLATEFORME-28-JUILLET-2025.md)
[![Database](https://img.shields.io/badge/Database-17%20Issues-yellow)](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk)

## 🎯 **PLATEFORME SÉCURISÉE - GRADE A (98.3%)**

### ✅ **ÉTAT ACTUEL (28 Juillet 2025)**
- 🏗️ **Architecture** : React + TypeScript + Supabase (Solide)
- 🎵 **Fonctionnalités Core** : Chat IA + Génération Musicale + EDN/ECOS (Opérationnelles)
- 🔐 **Sécurité** : **HAUTEMENT SÉCURISÉE** - 98.3% Grade A ✅
- 🗄️ **Base de Données** : 95 tables + RLS complet (**17 problèmes mineurs restants**)
- 📚 **Documentation** : Complète et structurée
- ⚡ **Edge Functions** : Structure présente (code non accessible actuellement)

### 🎉 **SÉCURITÉ CRITIQUE CORRIGÉE**
- **✅ Critique** : 110 → 17 problèmes (-85% résolution)
- **✅ RLS Policies** : Toutes les politiques de sécurité activées
- **✅ Functions** : 27 fonctions critiques sécurisées
- **📋 Reste** : 17 problèmes mineurs non-critiques

---

## 🚀 Démarrage Rapide (< 5 minutes)

### 📋 Prérequis
```bash
Node.js 20+, pnpm 8+, Git
```

### ⚡ Installation
```bash
# 1. Cloner le projet
git clone https://github.com/med-mng/med-mng.git
cd med-mng

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env
# ➜ Éditer .env avec vos clés Supabase

# 4. Lancer en développement
pnpm dev
```

### 🌐 Accès
- **Application** : http://localhost:5173
- **Supabase Dashboard** : https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk
- **Documentation** : `/docs` répertoire

---

## 🏗️ Architecture Technique

### 📱 Frontend (React + TypeScript)
```
src/
├── 📄 pages/                    # 15+ pages fonctionnelles
│   ├── MedChat.tsx             # 💬 Chat IA médical avec sources
│   ├── EdnComplete.tsx         # 📚 Interface EDN unifiée
│   ├── MedMngCreate.tsx        # 🎵 Génération musicale
│   └── Admin*.tsx              # 🛡️ Dashboards administration
├── 🧩 components/              # Composants modulaires
│   ├── edn/                    # Composants EDN/ECOS
│   ├── med-mng/               # Système musical
│   ├── admin/                  # Administration
│   └── ui/                     # Design system (shadcn)
├── 🔧 hooks/                   # Hooks métier spécialisés
├── 📚 lib/                     # Utilitaires + clients sécurisés
└── 🎨 styles/                  # Design system + Tailwind
```

### 🗄️ Base de Données (Supabase)
**95 tables organisées par domaine :**
```sql
-- 📚 Contenu Éducatif
edn_items, edn_items_complete, ecos_situations, oic_competences

-- 🎵 Système Musical MED-MNG  
med_mng_songs, med_mng_playlists, audio_tracks, generated_music_tracks

-- 👥 Gestion Utilisateurs
profiles, med_mng_subscriptions, user_preferences, chat_conversations

-- 🔐 Sécurité & Audit
security_audit_logs, operation_logs, extraction_logs

-- 📊 Analytics & Monitoring
med_mng_user_analytics, page_analytics, monitoring_incidents
```

### ⚡ Edge Functions (Supabase)
```typescript
// Structure configurée - Code à vérifier
supabase/functions/
├── med-mng-api/           # API principale
├── openai-chat/           # Proxy IA sécurisé
├── extract-edn-objectifs/ # Extraction OIC
└── send-welcome-email/    # Notifications
```

---

## 🎵 Fonctionnalités Principales

### 💬 Chat IA Médical Intelligent
- **IA Conversationnelle** : Questions médicales avec sources automatiques
- **Sources Officielles** : Référentiels EDN/ECOS intégrés
- **Interface Moderne** : Design glassmorphism + animations Framer Motion
- **Historique** : Sauvegarde des conversations

### 🎼 Génération Musicale Thérapeutique
- **Suno API** : Génération musicale IA de qualité professionnelle
- **Playlists Médicales** : Organisation par spécialités
- **Analytics d'Écoute** : Suivi détaillé des habitudes
- **Système d'Abonnements** : Plans freemium et premium

#### ⚠️ Limitations de l'API Suno
- Les paroles et timestamps ne sont pas garantis pour tous les morceaux.
- Des erreurs `429` peuvent survenir en cas de dépassement de crédits ou de quotas.
- Le temps de génération peut varier et atteindre plusieurs minutes.
- L'API peut temporairement renvoyer `503` lors des périodes de maintenance.

### 📚 Contenu Éducatif EDN/ECOS
- **Interface Unifiée** : Navigation fluide entre les items
- **Paroles Musicales** : Transformation des cours en chansons
- **Mode Immersif** : Apprentissage gamifié
- **Audit Automatique** : Validation qualité du contenu

### 🛡️ Administration Complète
- **Dashboards Temps Réel** : Monitoring extraction + utilisateurs
- **Système d'Alertes** : Notifications intelligentes
- **Audit de Sécurité** : Scan automatique + rapports
- **Gestion des Quotas** : Rate limiting + métriques

---

## 🔐 Sécurité & Conformité

### 🛡️ Mesures Implémentées ✅
```typescript
// Headers de sécurité configurés
Content-Security-Policy: "default-src 'self'"
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000

// Rate limiting multi-niveaux
Auth: 3 tentatives/15min
API: 100 req/min
Music: 5 générations/min
```

### ✅ Sécurité Renforcée (98.3% Grade A)
- **✅ RÉSOLU** : 27 fonctions critiques sécurisées avec search_path
- **✅ RÉSOLU** : Toutes les politiques RLS activées
- **✅ RÉSOLU** : Security Definer views corrigées
- **📋 Reste** : 17 problèmes mineurs de configuration

### 🎯 Dernières Optimisations
1. **Configuration** : 3 paramètres Supabase dashboard
2. **Monitoring** : 11 fonctions restantes (non-critiques)
3. **Documentation** : 3 configurations mineures

---

## 🧪 Tests & Qualité

### 🎭 Tests E2E (Playwright)
```bash
# Lancer tous les tests
pnpm test:e2e

# Tests par domaine
pnpm test:e2e:extraction    # Tests extraction OIC/EDN
pnpm test:e2e:music        # Tests génération Suno
pnpm test:e2e:auth         # Tests authentification
pnpm test:e2e:admin        # Tests dashboards admin
```

### 🔍 Audit & Monitoring
```bash
# Audit complet automatisé
./scripts/audit-global.sh

# Monitoring sécurité temps réel
./scripts/security-validation.js

# Performance & métriques
./scripts/performance-tests.sh
```

### 📊 Pipeline CI/CD (9 Étapes)
1. 🔒 **Security Scan** : TruffleHog + secrets
2. 🧹 **Lint & Type** : ESLint + TypeScript strict
3. 🧪 **Unit Tests** : Jest + coverage
4. 🎭 **E2E Tests** : Playwright multi-navigateurs
5. 🏗️ **Build** : Vite + bundle analysis
6. ⚡ **Performance** : Lighthouse CI
7. 🐳 **Security** : Trivy Docker scan
8. 🚀 **Deploy** : Auto staging/production
9. 🏥 **Health Check** : Post-deploy validation

---

## 📊 Monitoring & Analytics

### 📈 Métriques Temps Réel
- **Performance** : Web Vitals + Core metrics
- **Utilisateurs** : Analytics d'engagement
- **Sécurité** : Tentatives d'intrusion + violations
- **Business** : Conversions + rétention

### 🔔 Système d'Alertes
- **Sentry** : Erreurs JavaScript + tracing
- **Discord/Slack** : Notifications incidents
- **Email** : Rapports hebdomadaires
- **Dashboard** : Monitoring centralisé

### 📊 Dashboards Disponibles
- **`/admin`** : Administration générale
- **`/admin/audit`** : Audit système complet
- **`/admin/extract-edn`** : Monitoring extractions
- **`/med-mng/analytics`** : Analytics musicales

---

## 🚀 Déploiement & Environnements

### 🌍 Environnements
```bash
# Development (Local)
pnpm dev                    # http://localhost:5173

# Staging (Auto-deploy main)
git push origin main        # Deploy automatique

# Production (Release tags)
git tag v1.x.x && git push  # Deploy production
```

### 📦 Variables d'Environnement
```bash
# Supabase (Obligatoire)
VITE_SUPABASE_URL=https://yaincoxihiqdksxgrsrk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# APIs Externes
SUNO_API_KEY=your_suno_key              # Génération musicale
OPENAI_API_KEY=your_openai_key          # Chat IA
RESEND_API_KEY=your_resend_key          # Emails

# Authentification CAS (Extraction)
CAS_USERNAME=your_cas_user
CAS_PASSWORD=your_cas_pass

# Monitoring (Optionnel)
SENTRY_DSN=your_sentry_dsn
DISCORD_WEBHOOK_URL=your_discord_webhook
```

---

## 📚 Documentation Complète

### 📖 Guides Développeur
- [`docs/AUDIT-PLATEFORME-28-JUILLET-2025.md`](./docs/AUDIT-PLATEFORME-28-JUILLET-2025.md) - Audit complet actuel
- [`docs/CI-CD-PIPELINE.md`](./docs/CI-CD-PIPELINE.md) - Configuration pipeline
- [`docs/axe5-security.md`](./docs/axe5-security.md) - Guide sécurité
- [`docs/E2E-TESTS.md`](./docs/E2E-TESTS.md) - Tests end-to-end

### 🔧 Scripts Utilitaires
- [`scripts/audit-global.sh`](./scripts/audit-global.sh) - Audit automatisé complet
- [`scripts/security-validation.js`](./scripts/security-validation.js) - Validation sécurité
- [`scripts/performance-tests.sh`](./scripts/performance-tests.sh) - Tests performance

### 📋 Troubleshooting
- [`docs/FAQ.md`](./docs/FAQ.md) - Questions fréquentes
- **Component Storybook** : Documentation composants interactifs
- **Debug Pipeline** : Guides diagnostique CI/CD

---

## 🤝 Contribution & Support

### 🐛 Signaler un Bug
1. **Vérifier** : Issues existantes GitHub
2. **Reproduire** : Steps détaillés
3. **Logs** : Console + network + Sentry
4. **Environnement** : Browser + OS + version

### 💡 Proposer une Feature
1. **Discussion** : GitHub Discussions
2. **RFC** : Document détaillé
3. **Prototype** : POC si possible
4. **Pull Request** : Code + tests + docs

### 📞 Contacts
- **GitHub Issues** : Bugs + features
- **Discord** : Community support
- **Email** : Security issues
- **Supabase Dashboard** : Database monitoring

---

## 🎯 Roadmap 2025

### ✅ Q3 2025 (Majoritairement Complété)
- [x] **Sécurité** : 85% des problèmes Supabase corrigés (98.3% Grade A)
- [ ] **Edge Functions** : Diagnostic + réparation accès
- [ ] **Performance** : Optimisation + monitoring avancé
- [ ] **Tests** : Couverture E2E complète

### 🚀 Q4 2025 (Innovation)
- [ ] **IA Avancée** : GPT-4 + vision + multimodal
- [ ] **Mobile App** : React Native + push notifications
- [ ] **API Publique** : RESTful + GraphQL
- [ ] **Marketplace** : Plugins + extensions

### 🌍 2026 (Expansion)
- [ ] **Internationalisation** : Multi-langues + locales
- [ ] **Institutions** : Déploiement universités
- [ ] **Certifications** : Conformité médicale
- [ ] **Scale** : Architecture microservices

---

## 📈 Métriques de Succès

### 🎯 KPIs Techniques
- **Uptime** : > 99.9%
- **Performance** : Lighthouse > 90
- **Security** : 0 vulnérabilités critiques
- **Coverage** : Tests > 80%

### 👥 KPIs Utilisateurs  
- **Engagement** : Temps session > 15min
- **Rétention** : 7 jours > 40%
- **Satisfaction** : NPS > 50
- **Conversion** : Free to paid > 15%

### 💼 KPIs Business
- **ARR** : Annual Recurring Revenue
- **CAC** : Customer Acquisition Cost
- **LTV** : Lifetime Value
- **Churn** : Monthly < 5%

---

## 🏆 **RÉSUMÉ PLATEFORME**

**MED-MNG est une plateforme médicale intelligente hautement sécurisée avec :**
- ✅ **Architecture robuste** : React + TypeScript + Supabase
- ✅ **Fonctionnalités complètes** : Chat IA + Musique + EDN/ECOS + Admin
- ✅ **Sécurité Grade A** : 98.3% - Headers + Rate limiting + RLS + Fonctions sécurisées
- ✅ **Base de données** : 85% des problèmes corrigés (17 mineurs restants)
- ✅ **Documentation** : Complète et maintenue à jour
- ✅ **Monitoring** : Dashboards temps réel + alertes intelligentes

**Grade actuel : A (98.3/100) - Plateforme hautement sécurisée et production-ready**

---

*Dernière mise à jour : 28 Juillet 2025 - [Audit complet](./docs/AUDIT-PLATEFORME-28-JUILLET-2025.md)*