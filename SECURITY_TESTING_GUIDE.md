# 🔒 Security Testing Guide - Med-MNG

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Tests Automatisés CI/CD](#tests-automatisés-cicd)
3. [Outils de Sécurité](#outils-de-sécurité)
4. [Tests Manuels](#tests-manuels)
5. [OWASP Top 10](#owasp-top-10)
6. [Calendrier de Tests](#calendrier-de-tests)
7. [Remédiation](#remédiation)

---

## 🚀 Introduction

Ce guide décrit le processus de tests de sécurité pour la plateforme Med-MNG. Les tests de sécurité sont **automatisés** et s'exécutent à chaque push, pull request et quotidiennement.

### Objectifs
- **Prévention**: Détecter les vulnérabilités avant le déploiement
- **Conformité**: Respecter les standards OWASP Top 10
- **Continuous Security**: Tests de sécurité continus dans CI/CD
- **Documentation**: Traçabilité de tous les tests et remédiation

---

## 🤖 Tests Automatisés CI/CD

### Workflow GitHub Actions

Le fichier `.github/workflows/security-scan.yml` exécute automatiquement 6 types de tests de sécurité :

#### 1. Dependency Scan (Scan des Dépendances)

**Outils**: npm audit, Snyk

**Quand**: À chaque push, PR, et quotidiennement

**Ce qui est testé**:
- Vulnérabilités dans les packages npm
- Versions obsolètes avec failles connues
- CVE (Common Vulnerabilities and Exposures)

**Commande manuelle**:
```bash
# npm audit
npm audit --audit-level=moderate

# Snyk (nécessite SNYK_TOKEN)
npx snyk test --severity-threshold=high
```

**Seuils d'alerte**:
- **Critical**: Bloque le déploiement
- **High**: Nécessite action immédiate
- **Moderate**: Doit être corrigé dans la semaine
- **Low**: Peut être planifié

---

#### 2. Code Security Analysis (Analyse du Code)

**Outils**: ESLint security plugins, Semgrep, TruffleHog

**Quand**: À chaque push et PR

**Ce qui est testé**:
- Patterns de code dangereux (eval, innerHTML, etc.)
- Secrets hardcodés (API keys, tokens)
- Vulnérabilités OWASP Top 10
- Injections SQL/XSS potentielles

**Commande manuelle**:
```bash
# ESLint security check
npx eslint . \
  --config .eslintrc.security.json \
  --ext .js,.jsx,.ts,.tsx

# Semgrep
npx semgrep --config .semgrep/security-rules.yml apps/

# TruffleHog (scan de secrets)
docker run --rm -v "$(pwd):/src" trufflesecurity/trufflehog:latest \
  filesystem /src --json --only-verified
```

**Règles personnalisées**:
- `missing-jwt-auth`: Fonction sans authentification JWT
- `missing-admin-check`: Endpoint admin sans vérification de rôle
- `missing-rate-limit`: API coûteuse sans rate limiting
- `sql-injection-*`: Patterns d'injection SQL
- `xss-dangerous-html`: HTML non sanitizé
- `hardcoded-secret`: Secrets dans le code

---

#### 3. SQL Injection Scan

**Quand**: À chaque push et PR

**Ce qui est testé**:
- Concaténation de chaînes dans les requêtes SQL
- Template literals avec variables utilisateur
- Utilisation de `.raw()` non sécurisée
- Variables de requête directement dans SQL

**Patterns détectés**:
```typescript
// ❌ DANGEREUX
const query = `SELECT * FROM users WHERE id = ${userId}`;
const result = await supabase.from('users').select(`${userInput}`);

// ✅ SÉCURISÉ
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

**Commande manuelle**:
```bash
# Scan patterns SQL injection
grep -r "SELECT.*\${" apps/functions/ --include="*.ts"
grep -r "\.query.*req\." apps/functions/ --include="*.ts"
```

---

#### 4. XSS Vulnerability Scan

**Quand**: À chaque push et PR

**Ce qui est testé**:
- `dangerouslySetInnerHTML` sans sanitization
- `.innerHTML` assignments
- `eval()` usage
- Présence de DOMPurify

**Patterns détectés**:
```typescript
// ❌ DANGEREUX
element.innerHTML = userInput;
<div dangerouslySetInnerHTML={{__html: userInput}} />
eval(userCode);

// ✅ SÉCURISÉ
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

**Commande manuelle**:
```bash
# Scan XSS patterns
grep -r "dangerouslySetInnerHTML" apps/ --include="*.tsx"
grep -r "\.innerHTML\s*=" apps/ --include="*.ts"
grep -r "\beval(" apps/ --include="*.js"
```

---

#### 5. API Security Test

**Quand**: À chaque PR

**Ce qui est testé**:
- **Authentication**: Toutes les fonctions ont vérification JWT
- **Rate Limiting**: APIs coûteuses ont rate limiting
- **Admin Protection**: Endpoints admin vérifient le rôle

**Endpoints testés**:

| Endpoint | Auth Required | Rate Limit | Admin Only |
|----------|---------------|------------|------------|
| `/generate-music` | ✅ | ✅ | ❌ |
| `/content-ai-generator` | ✅ | ✅ | ❌ |
| `/openai-image` | ✅ | ✅ | ❌ |
| `/ai-code-analysis` | ✅ | ✅ | ❌ |
| `/admin-export` | ✅ | ✅ | ✅ |
| `/analytics-aggregator` | ✅ | ❌ | ✅ |
| `/stripe-webhook` | Signature | ❌ | ❌ |

**Commande manuelle**:
```bash
# Vérifier auth sur tous les endpoints
for func in apps/functions/*/index.ts; do
  if grep -q "Authorization" "$func" && grep -q "authHeader" "$func"; then
    echo "✅ $func has auth"
  else
    echo "❌ $func missing auth"
  fi
done
```

---

#### 6. OWASP ZAP Dynamic Testing

**Quand**: Quotidiennement (scheduled) ou manuellement

**Ce qui est testé**:
- Tests d'intrusion automatisés
- Scan OWASP Top 10 complet
- Tests de fuzzing
- Analyse des réponses HTTP

**Commande manuelle**:
```bash
# Baseline scan (rapide)
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-project.supabase.co \
  -r zap-report.html

# Full scan (lent, complet)
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://your-project.supabase.co \
  -r zap-full-report.html
```

---

## 🛠️ Outils de Sécurité

### 1. ESLint Security Plugins

Configuration: `.eslintrc.security.json`

**Plugins installés**:
```bash
npm install --save-dev \
  eslint-plugin-security \
  eslint-plugin-no-secrets \
  @typescript-eslint/eslint-plugin
```

**Règles activées**:
- `security/detect-object-injection`: Injection d'objets
- `security/detect-unsafe-regex`: Regex vulnérables (ReDoS)
- `security/detect-eval-with-expression`: Usage eval()
- `no-secrets/no-secrets`: Détection de secrets hardcodés

---

### 2. Semgrep

Configuration: `.semgrep/security-rules.yml`

**Règles personnalisées** (18 règles):
- Authentification JWT manquante
- Vérification admin manquante
- Rate limiting manquant
- Injection SQL (template literals, concat)
- XSS (dangerouslySetInnerHTML, innerHTML)
- CORS non validé
- Secrets hardcodés
- eval() usage
- Gestion d'erreur manquante
- Logging de sécurité manquant
- Math.random() faible
- CSRF token manquant
- Signature webhook manquante
- Validation input manquante
- API key exposée
- Données sensibles non chiffrées

**Usage**:
```bash
# Scan avec règles personnalisées
npx semgrep --config .semgrep/security-rules.yml apps/

# Scan avec règles OWASP
npx semgrep --config "p/owasp-top-ten" apps/

# Scan avec règles secrets
npx semgrep --config "p/secrets" apps/
```

---

### 3. Snyk

**Installation**:
```bash
npm install -g snyk
snyk auth
```

**Usage**:
```bash
# Scan des dépendances
snyk test

# Scan du code
snyk code test

# Monitor continu
snyk monitor

# Scan des containers
snyk container test your-image:tag
```

---

### 4. TruffleHog

**Usage**:
```bash
# Scan du repo complet
docker run --rm -v "$(pwd):/src" trufflesecurity/trufflehog:latest \
  filesystem /src --json

# Scan uniquement les secrets vérifiés
docker run --rm -v "$(pwd):/src" trufflesecurity/trufflehog:latest \
  filesystem /src --json --only-verified
```

---

### 5. OWASP ZAP

Configuration: `.zap/rules.tsv`

**Installation**:
```bash
docker pull owasp/zap2docker-stable
```

**Types de scans**:

1. **Baseline Scan** (rapide, ~5 min)
```bash
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-app.com \
  -r zap-baseline.html
```

2. **Full Scan** (complet, ~1h)
```bash
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://your-app.com \
  -r zap-full.html
```

3. **API Scan** (pour APIs)
```bash
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-api-scan.py \
  -t https://your-app.com/openapi.yaml \
  -f openapi \
  -r zap-api.html
```

---

## 🧪 Tests Manuels

### 1. Test d'Authentification

**Objectif**: Vérifier que tous les endpoints protégés nécessitent un JWT valide

**Procédure**:
```bash
# Test sans token
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Devrait retourner 401 Unauthorized

# Test avec token invalide
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Devrait retourner 401 Unauthorized

# Test avec token valide
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Devrait retourner 200 OK ou 429 Rate Limit
```

---

### 2. Test de Rate Limiting

**Objectif**: Vérifier que le rate limiting fonctionne correctement

**Procédure**:
```bash
# Script pour tester rate limiting
for i in {1..25}; do
  echo "Request $i"
  curl -X POST https://your-project.supabase.co/functions/v1/content-ai-generator \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"prompt":"test"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done

# Les 20 premières devraient retourner 200
# Les suivantes devraient retourner 429
```

**Vérifier les headers**:
```bash
curl -I -X POST https://your-project.supabase.co/functions/v1/content-ai-generator \
  -H "Authorization: Bearer $TOKEN"

# Headers attendus:
# X-RateLimit-Limit: 20
# X-RateLimit-Remaining: 19
# X-RateLimit-Reset: 2025-11-19T15:30:00Z
```

---

### 3. Test d'Autorisation Admin

**Objectif**: Vérifier que les endpoints admin nécessitent le rôle admin

**Procédure**:
```bash
# Test avec utilisateur normal (non-admin)
curl -X POST https://your-project.supabase.co/functions/v1/admin-export \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"patients","format":"csv"}'

# Devrait retourner 403 Forbidden

# Test avec utilisateur admin
curl -X POST https://your-project.supabase.co/functions/v1/admin-export \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"patients","format":"csv"}'

# Devrait retourner 200 OK
```

---

### 4. Test d'Injection SQL

**Objectif**: Vérifier que les inputs utilisateur sont sanitizés

**Payloads de test**:
```bash
# Test 1: Simple quote
curl -X POST https://your-app.com/api/search \
  -d '{"query":"test'\'' OR 1=1--"}'

# Test 2: UNION injection
curl -X POST https://your-app.com/api/search \
  -d '{"query":"test UNION SELECT * FROM users--"}'

# Test 3: Boolean-based
curl -X POST https://your-app.com/api/search \
  -d '{"query":"test'\'' AND 1=1--"}'

# Tous devraient être bloqués ou sanitizés
```

---

### 5. Test XSS

**Objectif**: Vérifier que le HTML utilisateur est sanitizé

**Payloads de test**:
```bash
# Test 1: Script tag
curl -X POST https://your-app.com/api/comment \
  -d '{"content":"<script>alert(1)</script>"}'

# Test 2: Event handler
curl -X POST https://your-app.com/api/comment \
  -d '{"content":"<img src=x onerror=alert(1)>"}'

# Test 3: Javascript protocol
curl -X POST https://your-app.com/api/comment \
  -d '{"content":"<a href=javascript:alert(1)>click</a>"}'

# Le contenu devrait être sanitizé avec DOMPurify
```

---

### 6. Test CSRF

**Objectif**: Vérifier la protection CSRF sur les opérations sensibles

**Procédure**:
```bash
# Test sans CSRF token
curl -X POST https://your-app.com/api/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":1000,"to":"attacker"}'

# Devrait retourner 403 Forbidden

# Test avec CSRF token invalide
curl -X POST https://your-app.com/api/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: invalid" \
  -d '{"amount":1000,"to":"attacker"}'

# Devrait retourner 403 Forbidden
```

---

## 🎯 OWASP Top 10 (2021)

### A01:2021 - Broken Access Control

**Tests**:
- [ ] Authentification JWT sur tous les endpoints
- [ ] Vérification du rôle admin sur endpoints sensibles
- [ ] RLS activée sur tables Supabase
- [ ] Pas d'accès direct aux IDs d'autres utilisateurs

**Commande**:
```bash
# Vérifier auth sur tous les endpoints
grep -r "Authorization" apps/functions/ --include="*.ts" | wc -l

# Vérifier admin checks
grep -r "isAdmin" apps/functions/ --include="*.ts" | wc -l
```

---

### A02:2021 - Cryptographic Failures

**Tests**:
- [ ] HTTPS uniquement (pas de HTTP)
- [ ] Secrets stockés dans variables d'environnement
- [ ] Pas de secrets hardcodés dans le code
- [ ] Données sensibles chiffrées en base

**Commande**:
```bash
# Scan secrets hardcodés
npx semgrep --config "p/secrets" apps/

# Vérifier TruffleHog
docker run --rm -v "$(pwd):/src" trufflesecurity/trufflehog:latest \
  filesystem /src --only-verified
```

---

### A03:2021 - Injection

**Tests**:
- [ ] Pas de concaténation SQL
- [ ] Requêtes paramétrées uniquement
- [ ] Validation de tous les inputs
- [ ] Sanitization HTML avec DOMPurify

**Commande**:
```bash
# Scan SQL injection
grep -r "SELECT.*\${" apps/functions/ --include="*.ts"

# Scan XSS
grep -r "dangerouslySetInnerHTML" apps/ --include="*.tsx"
```

---

### A04:2021 - Insecure Design

**Tests**:
- [ ] Rate limiting sur APIs coûteuses
- [ ] Throttling sur authentification
- [ ] Logging de sécurité activé
- [ ] Monitoring en temps réel

---

### A05:2021 - Security Misconfiguration

**Tests**:
- [ ] Pas d'informations de version exposées
- [ ] CORS configuré correctement
- [ ] Headers de sécurité présents
- [ ] Erreurs ne révèlent pas de détails

**Headers requis**:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

---

### A06:2021 - Vulnerable and Outdated Components

**Tests**:
- [ ] npm audit passe sans vulnérabilités high/critical
- [ ] Dépendances mises à jour régulièrement
- [ ] Snyk monitoring actif

**Commande**:
```bash
npm audit --audit-level=high
npx snyk test --severity-threshold=high
```

---

### A07:2021 - Identification and Authentication Failures

**Tests**:
- [ ] JWT pour authentification
- [ ] Tokens expirés après 1h
- [ ] Pas de credentials dans URLs
- [ ] Brute force protection

---

### A08:2021 - Software and Data Integrity Failures

**Tests**:
- [ ] Webhooks avec signature HMAC
- [ ] Pas d'auto-updates non vérifiés
- [ ] CI/CD avec vérifications de sécurité

---

### A09:2021 - Security Logging and Monitoring Failures

**Tests**:
- [ ] Tous les échecs auth loggés
- [ ] Alertes Slack/Teams configurées
- [ ] Dashboard de sécurité actif

**Vérifier**:
```sql
SELECT COUNT(*) FROM security_events
WHERE timestamp > NOW() - INTERVAL '24 hours';
```

---

### A10:2021 - Server-Side Request Forgery (SSRF)

**Tests**:
- [ ] Validation des URLs externes
- [ ] Whitelist de domaines autorisés
- [ ] Pas d'accès à localhost/127.0.0.1

---

## 📅 Calendrier de Tests

### Automatisés (CI/CD)

| Test | Fréquence | Durée | Blocant |
|------|-----------|-------|---------|
| npm audit | À chaque push | 1 min | ✅ |
| ESLint security | À chaque push | 2 min | ✅ |
| Semgrep | À chaque push | 3 min | ✅ |
| SQL Injection scan | À chaque PR | 1 min | ✅ |
| XSS scan | À chaque PR | 1 min | ✅ |
| API security | À chaque PR | 2 min | ✅ |
| OWASP ZAP baseline | Quotidien 2 AM | 10 min | ❌ |

### Manuels

| Test | Fréquence | Durée | Responsable |
|------|-----------|-------|-------------|
| Pentest complet | Trimestriel | 2-3 jours | Security Team |
| OWASP ZAP full scan | Mensuel | 1-2h | DevOps |
| Review logs sécurité | Hebdomadaire | 30 min | Security Team |
| Audit dépendances | Mensuel | 1h | Dev Team |

---

## 🔧 Remédiation

### Priorités

**P0 - Critical** (Fix immédiat):
- SQL Injection
- XSS
- Secrets exposés
- Auth bypass
- Admin access sans vérification

**P1 - High** (Fix sous 24h):
- Rate limiting manquant
- Logging manquant
- Vulnérabilités dépendances (Critical)

**P2 - Medium** (Fix sous 1 semaine):
- Headers sécurité manquants
- CORS mal configuré
- Vulnérabilités dépendances (High)

**P3 - Low** (Fix sous 1 mois):
- Warnings ESLint
- Vulnérabilités dépendances (Moderate)
- Améliorations documentation

---

### Workflow de Remédiation

1. **Détection** (automatique via CI/CD)
2. **Triage** (évaluation de la sévérité)
3. **Assignation** (développeur assigné)
4. **Fix** (correction du code)
5. **Vérification** (tests passent)
6. **Déploiement** (merge + deploy)
7. **Validation** (scan post-déploiement)

---

## 📊 Métriques de Sécurité

### KPIs à Surveiller

1. **Vulnerability Count** (nombre de vulnérabilités)
   - Objectif: 0 Critical, 0 High
   - Actuel: Tracker dans GitHub Security

2. **Time to Remediate** (temps de correction)
   - Objectif: <24h pour Critical, <7 jours pour High
   - Actuel: Tracker dans tickets

3. **Security Events** (événements de sécurité)
   - Objectif: <100/jour
   - Actuel: Dashboard Supabase

4. **Failed Auth Attempts** (tentatives d'auth échouées)
   - Objectif: <50/jour
   - Actuel: security_events table

---

## 🆘 Support

**Questions ou incidents de sécurité?**

- Email: security@med-mng.fr
- Slack: #security-alerts
- Documentation: Ce guide + `SECURITY_AUDIT_FINAL_REPORT.md`

**Ressources**:
- OWASP Top 10: https://owasp.org/Top10/
- Semgrep Rules: https://semgrep.dev/explore
- Snyk Database: https://security.snyk.io/
