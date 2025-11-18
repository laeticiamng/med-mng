# 🚀 Guide de Déploiement - MED-MNG

**Version**: 1.0
**Dernière mise à jour**: 18 Novembre 2025
**Public**: DevOps, Développeurs Senior

---

## 📋 Table des Matières

1. [Pré-requis](#pré-requis)
2. [Environnements](#environnements)
3. [Configuration](#configuration)
4. [Déploiement Frontend](#déploiement-frontend)
5. [Déploiement Backend](#déploiement-backend)
6. [Base de Données](#base-de-données)
7. [Edge Functions](#edge-functions)
8. [Monitoring](#monitoring)
9. [Rollback](#rollback)
10. [Checklist de Déploiement](#checklist-de-déploiement)

---

## Pré-requis

### Outils Requis

| Outil | Version Minimale | Installation |
|-------|------------------|--------------|
| **Node.js** | 20.x LTS | https://nodejs.org |
| **pnpm** | 8.x | `npm install -g pnpm` |
| **Git** | 2.x | https://git-scm.com |
| **Docker** | 24.x (optionnel) | https://docker.com |
| **Supabase CLI** | Latest | `npm install -g supabase` |

### Accès Requis

- [ ] Accès au repository Git
- [ ] Accès au projet Supabase
- [ ] Clés API (OpenAI, Suno, Resend)
- [ ] Accès aux services de monitoring (Sentry)
- [ ] Accès au serveur de production (si auto-hébergé)

---

## Environnements

### Architecture des Environnements

```
┌─────────────────┐
│  Development    │ ← localhost:5173
│  (Local)        │   localhost:3000
└─────────────────┘
        ↓
┌─────────────────┐
│  Staging        │ ← staging.med-mng.com
│  (Pre-prod)     │   Données de test
└─────────────────┘
        ↓
┌─────────────────┐
│  Production     │ ← app.med-mng.com
│  (Prod)         │   Données réelles
└─────────────────┘
```

### Configuration par Environnement

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| **NODE_ENV** | development | production | production |
| **ALLOWED_ORIGINS** | localhost:5173 | staging.med-mng.com | app.med-mng.com |
| **SENTRY_ENV** | development | staging | production |
| **Rate Limit** | 120 req/min | 60 req/min | 60 req/min |
| **Log Level** | debug | info | error |
| **Minification** | Non | Oui | Oui |
| **Source Maps** | Oui | Oui | Non (privés) |

---

## Configuration

### 1. Variables d'Environnement

#### Production (.env.production)

```bash
# =============================================================================
# PRODUCTION CONFIGURATION
# =============================================================================

# Supabase
SUPABASE_URL=https://yaincoxihiqdksxgrsrk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...REAL_KEY_HERE
SUPABASE_ANON_KEY=eyJhbG...REAL_KEY_HERE

# APIs
OPENAI_API_KEY=sk-proj-...REAL_KEY_HERE
SUNO_API_KEY=...REAL_KEY_HERE
RESEND_API_KEY=...REAL_KEY_HERE

# Security
JWT_SECRET=...RANDOM_64_CHAR_STRING_HERE

# CORS (CRITICAL)
ALLOWED_ORIGINS=https://app.med-mng.com,https://www.med-mng.com

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENV=production
ALERT_EMAIL=admin@med-mng.com

# Performance
BATCH_SIZE=20
```

**🔒 SÉCURITÉ**:
- ❌ Ne JAMAIS commiter ce fichier
- ✅ Stocker dans un gestionnaire de secrets (AWS Secrets Manager, Vault)
- ✅ Rotation des clés tous les 90 jours
- ✅ Accès restreint (principe du moindre privilège)

### 2. Vérification de la Configuration

```bash
# Script de vérification
node scripts/verify-env.js

# Vérifications:
# ✅ Toutes les variables requises sont définies
# ✅ Format des URLs valide
# ✅ Clés API valides (longueur, format)
# ✅ CORS ne contient pas '*'
# ✅ JWT_SECRET >= 64 caractères
```

---

## Déploiement Frontend

### Option 1: Vercel (Recommandé)

#### Avantages
- ✅ Déploiement automatique depuis Git
- ✅ CDN global intégré
- ✅ Preview deployments pour chaque PR
- ✅ Rollback en un clic
- ✅ Analytics intégrés

#### Configuration

1. **Connecter le repository**
   ```bash
   # Installer Vercel CLI
   npm install -g vercel

   # Login
   vercel login

   # Configurer le projet
   vercel
   ```

2. **Configuration Vercel** (vercel.json)
   ```json
   {
     "buildCommand": "pnpm build",
     "outputDirectory": "apps/frontend/dist",
     "devCommand": "pnpm dev:frontend",
     "installCommand": "pnpm install",
     "framework": "vite",
     "env": {
       "NODE_ENV": "production"
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "Referrer-Policy",
             "value": "strict-origin-when-cross-origin"
           },
           {
             "key": "Permissions-Policy",
             "value": "camera=(), microphone=(), geolocation=()"
           }
         ]
       }
     ]
   }
   ```

3. **Variables d'environnement Vercel**
   ```bash
   # Via CLI
   vercel env add SUPABASE_URL production
   vercel env add SUPABASE_ANON_KEY production
   # ... autres variables

   # Ou via Dashboard: vercel.com/dashboard
   ```

4. **Déployer**
   ```bash
   # Production
   vercel --prod

   # Staging
   vercel
   ```

### Option 2: Netlify

```bash
# Installation
npm install -g netlify-cli

# Configuration
netlify init

# Déploiement
netlify deploy --prod
```

### Option 3: Auto-hébergement (Docker)

```bash
# Build de l'image
docker build -t med-mng-frontend -f Dockerfile.frontend .

# Run
docker run -d \
  -p 80:80 \
  -p 443:443 \
  --env-file .env.production \
  --name med-mng-frontend \
  med-mng-frontend

# Avec Docker Compose
docker-compose up -d frontend
```

**Dockerfile.frontend**:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:frontend

# Stage 2: Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Déploiement Backend

### Option 1: Railway / Render

```bash
# Railway
railway login
railway init
railway up

# Render (via Dashboard)
# 1. Connecter le repository
# 2. Sélectionner "apps/backend"
# 3. Configurer les variables d'environnement
# 4. Deploy
```

### Option 2: Docker

```dockerfile
# Dockerfile.backend
FROM node:20-alpine

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod

COPY apps/backend ./apps/backend
COPY packages ./packages

RUN pnpm build:backend

# Utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]
```

```bash
# Build
docker build -t med-mng-backend -f Dockerfile.backend .

# Run
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name med-mng-backend \
  med-mng-backend
```

### Option 3: Kubernetes (Production avancée)

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: med-mng-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: med-mng-backend
  template:
    metadata:
      labels:
        app: med-mng-backend
    spec:
      containers:
      - name: backend
        image: med-mng-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: med-mng-secrets
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## Base de Données

### Migrations Supabase

```bash
# 1. Vérifier les migrations locales
supabase db diff

# 2. Créer une nouvelle migration si nécessaire
supabase migration new description_migration

# 3. Tester localement
supabase db reset

# 4. Déployer en staging
supabase db push --db-url $STAGING_DB_URL

# 5. Vérifier en staging
# ... tests ...

# 6. Déployer en production
supabase db push --db-url $PRODUCTION_DB_URL

# 7. Backup immédiat
supabase db dump -f backup-$(date +%Y%m%d-%H%M%S).sql
```

### Backup Automatisé

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/med-mng"
FILENAME="med-mng-db-$DATE.sql"

# Backup
supabase db dump -f "$BACKUP_DIR/$FILENAME"

# Compression
gzip "$BACKUP_DIR/$FILENAME"

# Upload vers S3 (optionnel)
aws s3 cp "$BACKUP_DIR/$FILENAME.gz" \
  s3://med-mng-backups/database/

# Retention: garder 30 jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup completed: $FILENAME.gz"
```

### Rollback de Migration

```bash
# Si une migration pose problème:

# 1. Identifier la migration problématique
supabase migration list

# 2. Créer une migration de rollback
supabase migration new rollback_problematic_migration

# 3. Écrire le SQL de rollback (DROP, ALTER, etc.)
# Exemple: supabase/migrations/xxx_rollback.sql

# 4. Déployer le rollback
supabase db push
```

---

## Edge Functions

### Déploiement

```bash
# 1. Tester localement
supabase functions serve

# 2. Déployer toutes les fonctions
supabase functions deploy

# 3. Déployer une fonction spécifique
supabase functions deploy medical-chat-ai

# 4. Vérifier le déploiement
curl https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/medical-chat-ai \
  -H "Authorization: Bearer $ANON_KEY"
```

### Configuration des Secrets

```bash
# Définir un secret pour les fonctions
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Lister les secrets
supabase secrets list

# Supprimer un secret
supabase secrets unset OLD_SECRET
```

---

## Monitoring

### 1. Sentry (Erreurs)

```typescript
// apps/frontend/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1, // 10% des transactions
  beforeSend(event) {
    // Filtrer les données sensibles
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### 2. Uptime Monitoring

**Recommandations**:
- **UptimeRobot** (gratuit)
- **Pingdom**
- **Datadog**

**Endpoints à monitorer**:
- Frontend: https://app.med-mng.com
- Backend: https://api.med-mng.com/health
- API Health: https://api.med-mng.com/health/live
- Database: Via Supabase Dashboard

### 3. Logs

```bash
# Frontend (via Vercel/Netlify)
vercel logs --follow

# Backend
docker logs -f med-mng-backend

# Supabase Functions
supabase functions logs medical-chat-ai --follow
```

### 4. Métriques

**À surveiller**:
- Temps de réponse API (< 200ms)
- Taux d'erreur (< 1%)
- Utilisation CPU (< 70%)
- Utilisation RAM (< 80%)
- Taille des requêtes DB (< 100ms)
- Rate limit hits
- Failed login attempts

---

## Rollback

### Frontend (Vercel)

```bash
# Via CLI
vercel rollback

# Via Dashboard
# 1. Aller sur vercel.com/dashboard
# 2. Sélectionner le projet
# 3. Deployments
# 4. Cliquer sur le déploiement précédent
# 5. Promote to Production
```

### Backend (Docker)

```bash
# 1. Lister les versions
docker images med-mng-backend

# 2. Revenir à la version précédente
docker stop med-mng-backend
docker rm med-mng-backend
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name med-mng-backend \
  med-mng-backend:v1.2.3  # Version précédente

# 3. Vérifier
curl http://localhost:3000/health
```

### Base de Données

```bash
# 1. Arrêter les services
# ... stop backend, functions ...

# 2. Restaurer depuis backup
psql $DATABASE_URL < backup-20251118-103000.sql

# 3. Vérifier l'intégrité
pnpm run integrity:audit

# 4. Redémarrer les services
```

---

## Checklist de Déploiement

### Avant le Déploiement

- [ ] **Code**
  - [ ] Tous les tests passent (`pnpm test`)
  - [ ] Build réussit (`pnpm build`)
  - [ ] Aucune vulnérabilité critique (`pnpm audit`)
  - [ ] Code review approuvé
  - [ ] Branch mergé dans `main`

- [ ] **Configuration**
  - [ ] Variables d'environnement configurées
  - [ ] CORS strictement configuré (pas de `*`)
  - [ ] Secrets rotés (si nécessaire)
  - [ ] Rate limiting activé
  - [ ] Logs configurés

- [ ] **Base de Données**
  - [ ] Migrations testées en staging
  - [ ] Backup créé
  - [ ] Plan de rollback préparé

- [ ] **Monitoring**
  - [ ] Sentry configuré
  - [ ] Uptime monitoring activé
  - [ ] Alertes configurées

### Pendant le Déploiement

- [ ] **Notification**
  - [ ] Équipe notifiée du déploiement
  - [ ] Fenêtre de maintenance annoncée (si nécessaire)

- [ ] **Exécution**
  - [ ] Frontend déployé
  - [ ] Backend déployé
  - [ ] Migrations appliquées
  - [ ] Edge functions déployées
  - [ ] Cache invalidé (CDN)

### Après le Déploiement

- [ ] **Vérification**
  - [ ] Health checks passent
  - [ ] Tests de fumée réussis
  - [ ] Monitoring actif
  - [ ] Aucune erreur dans Sentry
  - [ ] Performance acceptable (Lighthouse)

- [ ] **Communication**
  - [ ] Équipe notifiée du succès
  - [ ] Changelog mis à jour
  - [ ] Documentation mise à jour

- [ ] **Surveillance (24h)**
  - [ ] Surveiller les erreurs Sentry
  - [ ] Surveiller les métriques de performance
  - [ ] Surveiller l'uptime
  - [ ] Prêt pour rollback si nécessaire

---

## Troubleshooting

### Problème: Build échoue

```bash
# 1. Nettoyer le cache
pnpm clean
rm -rf node_modules pnpm-lock.yaml

# 2. Réinstaller
pnpm install

# 3. Rebuild
pnpm build
```

### Problème: Migrations échouent

```bash
# 1. Vérifier l'état actuel
supabase migration list

# 2. Rollback manuel
supabase db reset

# 3. Réappliquer
supabase db push
```

### Problème: Performance dégradée

```bash
# 1. Vérifier les logs
vercel logs
docker logs med-mng-backend

# 2. Vérifier les métriques
# ... CPU, RAM, DB connections ...

# 3. Scale up si nécessaire
# Vercel: Auto-scale
# Docker: docker-compose up --scale backend=3
```

---

## Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Docker Docs](https://docs.docker.com)
- [Kubernetes Docs](https://kubernetes.io/docs)

---

**Dernière mise à jour**: 18 Novembre 2025
**Prochaine révision**: Mensuelle
**Contact**: devops@med-mng.com
