# 🛡️ Guide des Meilleures Pratiques de Sécurité - MED-MNG

**Version**: 1.0
**Date**: 18 Novembre 2025
**Public**: Développeurs, DevOps, Security Team

---

## 📋 Table des Matières

1. [Gestion des Secrets](#1-gestion-des-secrets)
2. [Configuration Sécurisée](#2-configuration-sécurisée)
3. [Développement Sécurisé](#3-développement-sécurisé)
4. [API & Backend](#4-api--backend)
5. [Frontend & Client](#5-frontend--client)
6. [Base de Données](#6-base-de-données)
7. [CI/CD & Déploiement](#7-cicd--déploiement)
8. [Monitoring & Incident Response](#8-monitoring--incident-response)

---

## 1. Gestion des Secrets

### ❌ À NE JAMAIS FAIRE

```javascript
// ❌ MAUVAIS: Clé API en dur
const apiKey = 'sk-1234567890abcdef';

// ❌ MAUVAIS: Credentials dans le code
const username = 'admin@example.com';
const password = 'MyP@ssw0rd123';

// ❌ MAUVAIS: Fallback avec secret
const key = process.env.API_KEY || 'default-secret-key';

// ❌ MAUVAIS: Logger les secrets
console.log('API Key:', process.env.OPENAI_API_KEY);
```

### ✅ BONNES PRATIQUES

```javascript
// ✅ BON: Utiliser les variables d'environnement
const apiKey = process.env.OPENAI_API_KEY;

// ✅ BON: Validation sans fallback
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

// ✅ BON: Logger seulement la présence
console.log('API Key configured:', !!process.env.OPENAI_API_KEY);

// ✅ BON: Masquer dans les logs
const maskedKey = apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : 'not set';
console.log('API Key:', maskedKey);
```

### Configuration .env

```bash
# ✅ BON: Fichier .env (JAMAIS commité)
OPENAI_API_KEY=sk-proj-real-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...real-key

# ✅ BON: Fichier .env.example (commité)
OPENAI_API_KEY=__TO_DEFINE__
SUPABASE_SERVICE_ROLE_KEY=__TO_DEFINE__
```

### Protection Git

```bash
# .gitignore
.env
.env.local
.env.*.local
*.key
*.pem
credentials.json
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
# Détection de secrets
if git diff --cached | grep -i "api.*key.*=.*sk-"; then
  echo "❌ ERREUR: Clé API détectée dans le commit!"
  exit 1
fi

# Scan avec TruffleHog
trufflehog git file://. --since-commit HEAD
```

---

## 2. Configuration Sécurisée

### Backend Express

```typescript
// ✅ BON: Configuration stricte
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // À affiner
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS strict
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 60, // 60 requêtes
  message: 'Too many requests',
});
app.use(limiter);
```

### Vite/Frontend

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // ✅ BON: Headers sécurisés
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  build: {
    // ✅ BON: Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Retirer console.log en prod
      },
    },
  },
});
```

---

## 3. Développement Sécurisé

### Validation des Inputs

```typescript
import { z } from 'zod';

// ✅ BON: Validation stricte avec Zod
const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  age: z.number().int().min(0).max(150),
});

// ❌ MAUVAIS: Pas de validation
function createUser(data: any) {
  // Direct database insert - DANGEREUX
  db.users.insert(data);
}

// ✅ BON: Validation avant utilisation
function createUser(data: unknown) {
  const validated = UserSchema.parse(data); // Throws si invalide
  db.users.insert(validated);
}
```

### Protection XSS

```typescript
import DOMPurify from 'dompurify';

// ❌ MAUVAIS: Insertion HTML directe
function renderComment(comment: string) {
  return <div dangerouslySetInnerHTML={{ __html: comment }} />;
}

// ✅ BON: Sanitization
function renderComment(comment: string) {
  const clean = DOMPurify.sanitize(comment);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// ✅ MIEUX: Utiliser le rendering React
function renderComment(comment: string) {
  return <div>{comment}</div>; // Échappement automatique
}
```

### Protection SQL Injection

```typescript
// ❌ MAUVAIS: Requête SQL concaténée
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ BON: Requête paramétrée (Supabase)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email); // Paramètre sécurisé

// ✅ BON: Prepared statement (PostgreSQL)
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

### Gestion des Erreurs

```typescript
// ❌ MAUVAIS: Exposer les détails d'erreur
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // ❌ Expose l'architecture
  });
});

// ✅ BON: Erreur générique en production
app.use((err, req, res, next) => {
  console.error(err); // Log interne

  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: isDev ? err.message : 'Internal server error',
    requestId: req.id, // Pour le support
    // ❌ PAS de stack en production
  });
});
```

---

## 4. API & Backend

### Authentication

```typescript
// ✅ BON: Vérification JWT
import { verifyJWT } from '@/lib/auth';

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = await verifyJWT(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Authorization (RLS)

```sql
-- ✅ BON: Row Level Security
CREATE POLICY "Users can only read their own data"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can read all data"
ON profiles FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

### Rate Limiting Avancé

```typescript
// ✅ BON: Rate limiting par utilisateur
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requêtes
  duration: 1, // par seconde
  blockDuration: 60, // Bloquer 60 secondes si dépassé
});

async function rateLimitMiddleware(req, res, next) {
  const key = req.user?.id || req.ip;

  try {
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: error.msBeforeNext / 1000,
    });
  }
}
```

---

## 5. Frontend & Client

### Stockage Sécurisé

```typescript
// ❌ MAUVAIS: Secrets dans localStorage
localStorage.setItem('apiKey', 'sk-1234...'); // ❌ Accessible par XSS

// ✅ BON: Utiliser httpOnly cookies
// Configuré côté serveur:
res.cookie('authToken', token, {
  httpOnly: true, // ✅ Non accessible par JavaScript
  secure: true,   // ✅ HTTPS uniquement
  sameSite: 'strict', // ✅ Protection CSRF
  maxAge: 3600000, // 1 heure
});

// ✅ ACCEPTABLE: localStorage pour données non sensibles
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'fr');
```

### Protection CSRF

```typescript
// ✅ BON: Token CSRF
import { generateCSRFToken, verifyCSRFToken } from '@/lib/csrf';

// Génération (serveur)
app.get('/csrf-token', (req, res) => {
  const token = generateCSRFToken(req.session.id);
  res.json({ csrfToken: token });
});

// Vérification (serveur)
app.post('/api/data', (req, res) => {
  const token = req.headers['x-csrf-token'];

  if (!verifyCSRFToken(token, req.session.id)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  // Traiter la requête
});
```

### Content Security Policy

```html
<!-- ✅ BON: CSP Headers -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://cdn.example.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

---

## 6. Base de Données

### Row Level Security (RLS)

```sql
-- ✅ BON: Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ✅ BON: Politique par défaut (deny all)
CREATE POLICY "Default deny" ON profiles
FOR ALL USING (false);

-- ✅ BON: Politiques spécifiques
CREATE POLICY "Users read own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins manage all" ON profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

### Audit Logging

```sql
-- ✅ BON: Table d'audit
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✅ BON: Trigger d'audit
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id,
    old_data, new_data
  ) VALUES (
    auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id,
    to_jsonb(OLD), to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Chiffrement des Données Sensibles

```sql
-- ✅ BON: Extension pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Chiffrement
INSERT INTO sensitive_data (encrypted_field)
VALUES (pgp_sym_encrypt('data sensible', 'secret-key'));

-- Déchiffrement
SELECT pgp_sym_decrypt(encrypted_field, 'secret-key')
FROM sensitive_data;
```

---

## 7. CI/CD & Déploiement

### GitHub Actions Sécurisé

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # ✅ Scan des secrets
      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}

      # ✅ Audit des dépendances
      - name: NPM Audit
        run: pnpm audit --audit-level=high

      # ✅ Scan de vulnérabilités
      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      # ✅ SAST (Static Analysis)
      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          pnpm install
          pnpm test
          pnpm test:e2e
```

### Secrets Management

```yaml
# ✅ BON: Utiliser GitHub Secrets
- name: Deploy
  env:
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: |
    pnpm build
    pnpm deploy
```

### Docker Sécurisé

```dockerfile
# ✅ BON: Dockerfile multi-stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# ✅ Stage final (minimal)
FROM node:20-alpine
WORKDIR /app

# ✅ Utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## 8. Monitoring & Incident Response

### Logging Sécurisé

```typescript
// ✅ BON: Logger structuré (sans secrets)
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
  ],
});

// ✅ BON: Log des événements sécurité
logger.info('Login attempt', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  success: true,
  // ❌ PAS de mot de passe
});

// ✅ BON: Log des erreurs (sans stack en prod)
logger.error('API Error', {
  error: err.message,
  requestId: req.id,
  // ❌ PAS de err.stack en production
});
```

### Alertes Sentry

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // ✅ BON: Filtrer les données sensibles
  beforeSend(event) {
    // Retirer les données sensibles
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['authorization'];
    }
    return event;
  },
});
```

### Incident Response Plan

```markdown
## En cas d'incident de sécurité:

1. **Détection** (0-15 min)
   - Alertes Sentry/Datadog
   - Logs anormaux
   - Rapport utilisateur

2. **Confinement** (15-30 min)
   - Identifier la source
   - Bloquer l'IP si nécessaire
   - Révoquer les tokens compromis

3. **Investigation** (30 min - 2h)
   - Analyser les logs
   - Identifier l'étendue
   - Documenter l'incident

4. **Correction** (2h - 24h)
   - Appliquer le patch
   - Déployer en production
   - Vérifier la correction

5. **Post-Mortem** (1-3 jours)
   - Rapport d'incident
   - Leçons apprises
   - Améliorations à implémenter
```

---

## 📝 Checklist de Sécurité

### Avant chaque Commit

- [ ] Aucun secret en dur dans le code
- [ ] Validation des inputs implémentée
- [ ] Gestion d'erreurs appropriée
- [ ] Tests unitaires passent
- [ ] Linter ne remonte aucune erreur critique

### Avant chaque PR

- [ ] Tests E2E passent
- [ ] Audit de sécurité manuel effectué
- [ ] Documentation mise à jour
- [ ] Revue de code par un pair
- [ ] CI/CD passe (tests, security scan)

### Avant chaque Déploiement

- [ ] Variables d'environnement configurées
- [ ] CORS configuré strictement
- [ ] Rate limiting activé
- [ ] Logs et monitoring configurés
- [ ] Plan de rollback prêt
- [ ] Backup de la DB effectué

### Audit Mensuel

- [ ] `pnpm audit` exécuté et résolu
- [ ] Dépendances mises à jour
- [ ] Revue des logs de sécurité
- [ ] Revue des accès utilisateurs
- [ ] Test de pénétration interne

---

## 📚 Ressources Complémentaires

### Standards & Guidelines

- [OWASP Top 10](https://owasp.org/Top10/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Secure Software Development](https://csrc.nist.gov/projects/ssdf)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Outils Recommandés

- **SAST**: ESLint, SonarQube, CodeQL
- **DAST**: OWASP ZAP, Burp Suite
- **Dependency Scanning**: Snyk, npm audit, Dependabot
- **Secret Scanning**: TruffleHog, GitGuardian
- **Runtime Protection**: Sentry, Datadog

### Formation Continue

- [OWASP Academy](https://owasp.org/www-project-top-ten/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [Hack The Box](https://www.hackthebox.com/)
- [TryHackMe](https://tryhackme.com/)

---

## ✅ Conclusion

La sécurité est un processus continu, pas une destination. Suivez ces pratiques, restez informés des nouvelles vulnérabilités, et n'hésitez pas à remettre en question les pratiques existantes.

**En cas de doute**: Always fail secure. Il vaut mieux bloquer une action légitime que d'autoriser une action malveillante.

---

**Questions?** Contactez l'équipe sécurité: security@med-mng.com

**Dernière mise à jour**: 18 Novembre 2025
**Prochaine révision**: 18 Février 2026
