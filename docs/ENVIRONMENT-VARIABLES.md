# Variables d'Environnement - Guide Complet

Ce guide détaille toutes les variables d'environnement utilisées par la plateforme Med Music Platform, leur configuration et leur validation.

## 📋 Aperçu Général

La plateforme utilise un système de validation automatique des variables d'environnement basé sur **Zod** pour garantir la sécurité et la cohérence de la configuration.

### Configuration de Base

```bash
# 1. Copier le template
cp .env.example .env

# 2. Éditer avec vos valeurs
nano .env

# 3. Valider la configuration
npm run validate:env
```

---

## 🔴 Variables Critiques (Obligatoires)

### Supabase (Base de Données)

```bash
# URL de votre projet Supabase
VITE_SUPABASE_URL=https://yaincoxihiqdksxgrsrk.supabase.co

# Clé publique Supabase (safe pour le frontend)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé service role (SENSIBLE - backend only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Obtenir ces clés :**
1. [Dashboard Supabase](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk)
2. Settings → API
3. Copy anon key (public) et service_role key (privée)

### Sécurité JWT

```bash
# Secret pour signer les JWT (minimum 32 caractères)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
```

**Générer un secret sécurisé :**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configuration CORS

```bash
# Origines autorisées (séparées par virgules)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Exemple développement
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🟡 Variables Importantes (Fonctionnalités)

### APIs Externes

#### Suno AI (Génération Musicale)
```bash
SUNO_API_KEY=your-suno-api-key-here
```
**Obtenir la clé :** [https://suno.ai/api](https://suno.ai/api)

#### OpenAI (Intelligence Artificielle)
```bash
OPENAI_API_KEY=sk-proj-your-openai-key-here
```
**Obtenir la clé :** [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

#### Resend (Emails)
```bash
RESEND_API_KEY=re_your-resend-key-here
```
**Obtenir la clé :** [https://resend.com/api-keys](https://resend.com/api-keys)

### Extraction EDN/OIC

```bash
# Authentification CAS UNES
CAS_USERNAME=your-unes-username
CAS_PASSWORD=your-unes-password

# Configuration extraction
ENABLE_AUTO_EXTRACTION=false
EXTRACTION_SCHEDULE_CRON=0 2 * * *  # Tous les jours à 2h
```

### Monitoring & Alertes

#### Sentry (Monitoring Erreurs)
```bash
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
```
**Obtenir DSN :** [https://sentry.io/settings/projects/](https://sentry.io/settings/projects/)

#### Webhooks d'Alertes
```bash
# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123/abc

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/abc
```

---

## 🟢 Variables de Configuration (Optionnelles)

### Application

```bash
# Environnement d'exécution
NODE_ENV=development  # development|staging|production

# Port du serveur
PORT=3000

# URL publique utilisée pour le sitemap et robots.txt
SITE_URL=https://med-mng.com

# Configuration proxy (load balancers)
TRUST_PROXY=1
```

### Sécurité & Rate Limiting

```bash
# Limitation de requêtes
RATE_LIMIT_WINDOW_MS=900000      # Fenêtre de 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requêtes max par fenêtre

# Protection DoS
MAX_PAYLOAD_MB=1                 # Taille max des requêtes (1MB)
```

### Logging

```bash
# Niveau de logs
LOG_LEVEL=info                   # debug|info|warn|error

# Format des logs
LOG_FORMAT=json                  # json|pretty
```

### Feature Flags

```bash
# Fonctionnalités principales
ENABLE_MUSIC_GENERATION=true
ENABLE_REAL_TIME_FEATURES=true
ENABLE_ANALYTICS=true
ENABLE_CHAT_AI=true

# Fonctionnalités expérimentales
ENABLE_BETA_FEATURES=false
ENABLE_DEBUG_MODE=false
```

### Développement & Tests

```bash
# Options de développement (NE PAS utiliser en production)
SKIP_ENV_VALIDATION=false
MOCK_EXTERNAL_APIS=false

# Configuration de test
TEST_SUPABASE_URL=https://test.supabase.co
TEST_SUPABASE_ANON_KEY=test-key
```

---

## 🔧 Validation et Sécurité

### Validation Automatique

Le système utilise **Zod** pour valider toutes les variables au démarrage :

```typescript
// packages/config/src/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  VITE_SUPABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'Must be at least 32 characters'),
  // ... autres validations
});
```

### Commandes de Validation

```bash
# Validation complète
pnpm env:check

# Validation stricte (mode CI)
pnpm env:check -- --strict

# Test avec variables manquantes
SKIP_ENV_VALIDATION=false pnpm dev
```

### Exemple de Validation Réussie

```bash
✅ Environment validation successful
   - Environment: production
   - Port: 3000
   - Supabase URL: https://yaincoxihiqdksxgrsrk.supabase.co
   - Features enabled: Music=true, Analytics=true
```

### Exemple d'Erreur de Validation

```bash
❌ Environment validation failed:
Missing or invalid environment variables:
  - JWT_SECRET: String must contain at least 32 character(s)
  - VITE_SUPABASE_ANON_KEY: Invalid Supabase anon key format
  - CORS_ALLOWED_ORIGINS: Required

💡 Required environment variables:
  - VITE_SUPABASE_URL: Your Supabase project URL
  - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
  - SUPABASE_SERVICE_ROLE_KEY: Required for secure orchestration calls
  - OPENAI_API_KEY: Required for prompt generation
  - SUNO_API_KEY: Required for music generation
  - JWT_SECRET: Strong JWT signing secret (min 32 chars)
```

---

## 🌍 Configuration par Environnement

### Développement Local

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
SKIP_ENV_VALIDATION=false
MOCK_EXTERNAL_APIS=false

# APIs réelles pour tester
SUNO_API_KEY=your-dev-key
OPENAI_API_KEY=your-dev-key
```

### Staging

```bash
NODE_ENV=staging
PORT=3000
LOG_LEVEL=info

# Clés de test
SUNO_API_KEY=suno-staging-key
OPENAI_API_KEY=openai-staging-key
SENTRY_DSN=staging-sentry-dsn

# Rate limiting plus strict
RATE_LIMIT_MAX_REQUESTS=50
```

### Production

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn

# Sécurité renforcée
JWT_SECRET=production-32-char-secret-here
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Monitoring complet
SENTRY_DSN=production-sentry-dsn
DISCORD_WEBHOOK_URL=production-discord-webhook

# Rate limiting strict
RATE_LIMIT_MAX_REQUESTS=30
MAX_PAYLOAD_MB=1
TRUST_PROXY=1
```

---

## 🔐 Sécurité des Secrets

### ✅ Bonnes Pratiques

1. **Utiliser .env.example** avec des placeholders
   ```bash
   OPENAI_API_KEY=sk-your-openai-key-here
   ```

2. **Valider toutes les variables** avec Zod
   ```typescript
   OPENAI_API_KEY: z.string().min(40).optional()
   ```

3. **Rotation régulière** des clés sensibles

4. **Monitoring des accès** via Sentry/logs

### ❌ Erreurs à Éviter

1. **Ne jamais commit** de vraies clés
   ```bash
   # ❌ DANGER
   OPENAI_API_KEY=sk-proj-abc123def456...
   ```

2. **Ne pas utiliser** de variables non documentées
   ```bash
   # ❌ Non validée
   SECRET_HACK_KEY=abc123
   ```

3. **Ne pas partager** les .env de production

### Audit de Sécurité

```bash
# Scanner les secrets dans le code
./scripts/security-scan.sh

# Vérifier les variables exposées
npm run audit:env

# Tests de sécurité complets
./scripts/test-security.sh --all
```

---

## 🚨 Troubleshooting

### Erreurs Courantes

#### 1. Variable Manquante
```
Error: Environment not validated. Call validateEnvironment() first.
```
**Solution :** Ajouter la variable dans `.env` et `env.ts`

#### 2. Format Invalide
```
- VITE_SUPABASE_URL: Invalid URL format
```
**Solution :** Vérifier le format de l'URL Supabase

#### 3. Clé Trop Courte
```
- JWT_SECRET: String must contain at least 32 character(s)
```
**Solution :** Générer un secret plus long avec `openssl rand -base64 32`

#### 4. CORS Refusé
```
CORS: Origin not allowed
```
**Solution :** Ajouter votre domaine dans `CORS_ALLOWED_ORIGINS`

### Commandes de Debug

```bash
# Vérifier les variables chargées
npm run debug:env

# Tester la configuration CORS
curl -H "Origin: https://mydomain.com" http://localhost:3000/health

# Vérifier les logs en temps réel
tail -f logs/combined.log | grep "Environment"
```

---

## 📚 Ressources Supplémentaires

### Documentation
- [Configuration Supabase](https://supabase.com/docs/guides/getting-started)
- [Sécurité CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Validation Zod](https://zod.dev/)

### Outils Utiles
- [Générateur JWT Secret](https://generate-secret.now.sh/32)
- [Testeur CORS](https://cors-test.codehappy.dev/)
- [Validateur URL](https://www.urlvalidator.com/)

### Support
- **GitHub Issues** : Problèmes de configuration
- **Supabase Dashboard** : Monitoring base de données
- **Sentry Dashboard** : Monitoring des erreurs

---

*Dernière mise à jour : Janvier 2025*