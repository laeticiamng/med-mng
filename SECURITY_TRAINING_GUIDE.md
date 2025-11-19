## 🎓 Med-MNG Security Training Guide

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Formation Développeurs](#formation-développeurs)
3. [Formation DevOps](#formation-devops)
4. [Formation Management](#formation-management)
5. [Secure Coding Guidelines](#secure-coding-guidelines)
6. [Code Review Checklist](#code-review-checklist)
7. [Incident Response](#incident-response)
8. [Quiz & Évaluation](#quiz--évaluation)

---

## 🚀 Introduction

Ce guide fournit une formation complète en sécurité pour toute l'équipe Med-MNG. Chaque membre de l'équipe doit compléter la formation correspondant à son rôle.

### Objectifs de Formation

- **Sensibilisation**: Comprendre les risques de sécurité
- **Prevention**: Apprendre les best practices
- **Détection**: Identifier les vulnérabilités
- **Response**: Réagir correctement aux incidents

### Calendrier

| Formation | Durée | Fréquence | Obligatoire |
|-----------|-------|-----------|-------------|
| Onboarding sécurité | 2h | À l'embauche | ✅ |
| OWASP Top 10 | 3h | Annuel | ✅ |
| Secure coding | 4h | Semestriel | ✅ Devs |
| Incident response | 2h | Annuel | ✅ Tous |
| Security updates | 30min | Mensuel | ✅ Tous |

---

## 👨‍💻 Formation Développeurs

### Module 1: OWASP Top 10 (2021)

#### A01: Broken Access Control

**Qu'est-ce que c'est?**
- Accès non autorisé aux ressources
- Bypass d'authentification/autorisation
- Manipulation d'IDs pour accéder aux données d'autres utilisateurs

**Exemple vulnérable**:
```typescript
// ❌ DANGEREUX - Pas de vérification d'autorisation
export async function getUserData(req: Request) {
  const { userId } = await req.json();

  // N'importe qui peut accéder aux données de n'importe quel utilisateur!
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return new Response(JSON.stringify(data));
}
```

**Correction**:
```typescript
// ✅ SÉCURISÉ - Vérification JWT + autorisation
export async function getUserData(req: Request) {
  // 1. Vérifier l'authentification
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Extraire et vérifier le JWT
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response('Invalid token', { status: 401 });
  }

  // 3. L'utilisateur ne peut accéder qu'à ses propres données
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return new Response(JSON.stringify(data));
}
```

**Checklist**:
- [ ] Toutes les fonctions ont vérification JWT
- [ ] L'utilisateur ne peut accéder qu'à ses propres données
- [ ] Les rôles admin sont vérifiés pour les opérations sensibles
- [ ] RLS (Row Level Security) activée sur toutes les tables

---

#### A02: Cryptographic Failures

**Qu'est-ce que c'est?**
- Secrets hardcodés dans le code
- Données sensibles non chiffrées
- Transmission en clair (HTTP vs HTTPS)

**Exemple vulnérable**:
```typescript
// ❌ DANGEREUX - API key hardcodée
const openai = new OpenAI({
  apiKey: 'sk-abc123def456...',
});

// ❌ DANGEREUX - Mot de passe en clair
await supabase.from('users').insert({
  email: 'user@example.com',
  password: 'mypassword123',
});
```

**Correction**:
```typescript
// ✅ SÉCURISÉ - API key depuis variable d'environnement
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// ✅ SÉCURISÉ - Utiliser Supabase Auth (hash bcrypt automatique)
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'mypassword123', // Automatiquement hashé
});
```

**Checklist**:
- [ ] Aucun secret hardcodé (vérifier avec TruffleHog)
- [ ] Toutes les API keys dans variables d'environnement
- [ ] HTTPS uniquement (pas de HTTP)
- [ ] Mots de passe hashés avec bcrypt/argon2

---

#### A03: Injection (SQL, XSS, Command)

**SQL Injection**:

```typescript
// ❌ DANGEREUX - Concaténation SQL
const userId = req.query.get('id');
const query = `SELECT * FROM users WHERE id = ${userId}`;
// Attaque: ?id=1 OR 1=1--

// ✅ SÉCURISÉ - Requêtes paramétrées
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId); // Automatiquement échappé
```

**XSS (Cross-Site Scripting)**:

```typescript
// ❌ DANGEREUX - HTML non sanitizé
function displayComment(comment) {
  element.innerHTML = comment;
  // Attaque: comment = '<script>alert(document.cookie)</script>'
}

// ✅ SÉCURISÉ - Sanitization avec DOMPurify
import DOMPurify from 'dompurify';

function displayComment(comment) {
  element.innerHTML = DOMPurify.sanitize(comment);
}
```

**Checklist**:
- [ ] Jamais de concaténation SQL
- [ ] Toujours utiliser les query builders (Supabase)
- [ ] Sanitizer tous les inputs utilisateur avec DOMPurify
- [ ] Jamais de `eval()` ou `Function()` constructor

---

#### A04: Insecure Design

**Rate Limiting**:

```typescript
// ❌ DANGEREUX - Pas de rate limiting sur API coûteuse
export async function generateMusic(req: Request) {
  const { prompt } = await req.json();

  // N'importe qui peut générer 1000 chansons et coûter $100!
  const music = await sunoAPI.generate(prompt);

  return new Response(JSON.stringify(music));
}

// ✅ SÉCURISÉ - Rate limiting activé
import { checkRateLimit, RATE_LIMITS } from '../_shared/rate-limit.ts';

export async function generateMusic(req: Request) {
  // Vérifier auth...
  const { user } = await verifyAuth(req);

  // Vérifier rate limit
  const rateLimit = await checkRateLimit(
    supabase,
    user.id,
    'music-generation',
    RATE_LIMITS.MUSIC_GEN
  );

  if (!rateLimit.allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const { prompt } = await req.json();
  const music = await sunoAPI.generate(prompt);

  return new Response(JSON.stringify(music));
}
```

**Checklist**:
- [ ] Rate limiting sur toutes les APIs coûteuses
- [ ] Logging de sécurité sur tous les endpoints
- [ ] Validation de tous les inputs
- [ ] Throttling sur authentification (brute force protection)

---

### Module 2: Secure Coding Practices

#### 1. Input Validation

**Toujours valider les inputs utilisateur**:

```typescript
// ❌ DANGEREUX - Pas de validation
export async function createUser(req: Request) {
  const { email, age } = await req.json();

  // Que se passe-t-il si age = "abc" ou -1?
  await supabase.from('users').insert({ email, age });
}

// ✅ SÉCURISÉ - Validation avec Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email().max(255),
  age: z.number().int().min(18).max(120),
});

export async function createUser(req: Request) {
  const body = await req.json();

  // Valider le schéma
  const result = userSchema.safeParse(body);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid input', details: result.error }),
      { status: 400 }
    );
  }

  const { email, age } = result.data;
  await supabase.from('users').insert({ email, age });
}
```

**Types de validation**:
- **Type**: String, Number, Boolean, Object, Array
- **Format**: Email, URL, UUID, Date
- **Range**: min/max length, min/max value
- **Whitelist**: Enum de valeurs acceptées

---

#### 2. Error Handling

```typescript
// ❌ DANGEREUX - Erreurs révèlent des détails
export async function getUser(req: Request) {
  try {
    const { userId } = await req.json();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Ne pas exposer les erreurs SQL!
      return new Response(error.message, { status: 500 });
    }

    return new Response(JSON.stringify(data));

  } catch (error) {
    // Ne pas exposer la stack trace!
    return new Response(error.stack, { status: 500 });
  }
}

// ✅ SÉCURISÉ - Erreurs génériques + logging
export async function getUser(req: Request) {
  try {
    const { userId } = await req.json();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Logger l'erreur en interne
      console.error('Database error:', error);

      // Logger l'événement de sécurité
      await logSecurityEvent(supabase, {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        endpoint: 'get-user',
        details: { error: error.message },
      });

      // Retourner un message générique
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(data));

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
```

---

#### 3. Logging & Monitoring

**Toujours logger les événements de sécurité**:

```typescript
import { logSecurityEvent } from '../_shared/security-monitoring.ts';

// ✅ Logger les échecs d'authentification
if (!authHeader) {
  await logSecurityEvent(supabase, {
    type: 'UNAUTHORIZED_ACCESS',
    severity: 'high',
    endpoint: 'protected-function',
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  });

  return new Response('Unauthorized', { status: 401 });
}

// ✅ Logger les accès refusés
if (!isAdmin) {
  await logSecurityEvent(supabase, {
    type: 'FORBIDDEN_ACCESS',
    severity: 'high',
    userId: user.id,
    endpoint: 'admin-function',
    details: {
      reason: 'Admin role required',
      userEmail: user.email,
    },
  });

  return new Response('Forbidden', { status: 403 });
}

// ✅ Logger l'usage d'APIs coûteuses
await logSecurityEvent(supabase, {
  type: 'API_KEY_USAGE',
  severity: 'low',
  userId: user.id,
  endpoint: 'openai-gpt4',
  details: {
    apiProvider: 'OpenAI',
    model: 'gpt-4',
    estimatedCost: 0.03,
  },
});
```

---

### Module 3: Code Review Guidelines

#### Checklist de Sécurité pour Code Review

**Authentification & Autorisation**:
- [ ] Vérification JWT présente (`Authorization` header)
- [ ] Token validé avec `supabase.auth.getUser()`
- [ ] Vérification du rôle admin si nécessaire
- [ ] L'utilisateur ne peut accéder qu'à ses propres données
- [ ] RLS activée sur les tables

**Input Validation**:
- [ ] Tous les inputs validés (type, format, range)
- [ ] Utilisation de Zod ou similaire pour validation
- [ ] Pas de valeurs par défaut dangereuses

**Injection Prevention**:
- [ ] Pas de concaténation SQL
- [ ] Query builder utilisé (Supabase)
- [ ] HTML sanitizé avec DOMPurify
- [ ] Pas d'`eval()` ou `Function()` constructor

**Secrets & Configuration**:
- [ ] Aucun secret hardcodé
- [ ] API keys dans variables d'environnement
- [ ] Pas de credentials dans les logs

**Rate Limiting**:
- [ ] Rate limiting sur APIs coûteuses (OpenAI, Suno, DALL-E)
- [ ] Rate limiting sur endpoints sensibles (admin, export)
- [ ] Headers de rate limiting retournés

**Logging & Monitoring**:
- [ ] Échecs d'auth loggés
- [ ] Accès refusés loggés
- [ ] Erreurs loggées (sans détails sensibles)
- [ ] Usage d'APIs coûteuses loggé

**Error Handling**:
- [ ] Try-catch présent
- [ ] Erreurs génériques retournées (pas de détails internes)
- [ ] Pas de stack traces exposées

**Security Headers**:
- [ ] CORS configuré correctement
- [ ] Headers de sécurité présents (X-Frame-Options, etc.)

---

## 👷 Formation DevOps

### Module 1: Infrastructure Security

#### 1. Secrets Management

**Utiliser des secrets sécurisés**:

```bash
# ❌ DANGEREUX - Secrets dans le code
echo "OPENAI_API_KEY=sk-abc123..." >> .env

# ❌ DANGEREUX - Commit des secrets
git add .env
git commit -m "Add env file"

# ✅ SÉCURISÉ - Utiliser Supabase Secrets
supabase secrets set OPENAI_API_KEY=sk-abc123...

# ✅ SÉCURISÉ - Ajouter .env au .gitignore
echo ".env" >> .gitignore
```

**Rotation des secrets**:
- Rotation trimestrielle de toutes les API keys
- Rotation immédiate si compromis
- Documenter toutes les rotations

---

#### 2. CI/CD Security

**Security Checks dans GitHub Actions**:

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Scan des dépendances
      - name: npm audit
        run: npm audit --audit-level=moderate

      # Scan du code
      - name: Semgrep scan
        run: npx semgrep --config .semgrep/security-rules.yml apps/

      # Scan des secrets
      - name: TruffleHog scan
        uses: trufflesecurity/trufflehog@main
```

---

#### 3. Monitoring & Alerting

**Configurer les alertes Slack**:

```bash
# Ajouter webhook Slack dans Supabase
supabase secrets set SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/...

# Les alertes sont envoyées automatiquement pour:
# - Événements CRITICAL (injection SQL, XSS, brute force)
# - Événements HIGH (accès non autorisé, accès interdit)
```

**Dashboard de sécurité**:

```sql
-- Vue des événements critiques (dernières 24h)
SELECT * FROM security_events_critical
WHERE timestamp > NOW() - INTERVAL '24 hours';

-- Top utilisateurs suspects
SELECT * FROM security_top_suspicious_users;

-- Statistiques par endpoint
SELECT * FROM security_stats_by_endpoint;
```

---

### Module 2: Backup & Disaster Recovery

#### Tests de Restauration Mensuels

```bash
# Exécuter le test de restauration
./scripts/test-restore.sh

# Vérifier le rapport
cat test-results/restore_test_YYYYMMDD.txt
```

**Checklist DR**:
- [ ] Backup quotidien vérifié
- [ ] Test de restauration mensuel passé
- [ ] RTO < 2 heures
- [ ] RPO < 1 heure
- [ ] Backups stockés dans 2 régions différentes

---

## 👔 Formation Management

### Module 1: Security Metrics

**KPIs de sécurité à suivre**:

| Métrique | Objectif | Actuel | Trend |
|----------|----------|--------|-------|
| Vulnérabilités Critical | 0 | ? | ? |
| Vulnérabilités High | 0 | ? | ? |
| Time to Remediate (Critical) | <24h | ? | ? |
| Security Events (failed auth) | <50/jour | ? | ? |
| Test Coverage | >80% | ? | ? |
| Backup Success Rate | 100% | ? | ? |

---

### Module 2: Compliance

**RGPD Checklist**:
- [ ] Consentement utilisateur pour données personnelles
- [ ] Droit à l'oubli implémenté
- [ ] Export de données utilisateur disponible
- [ ] Données chiffrées au repos et en transit
- [ ] Rétention de données documentée (30 jours, 12 mois)
- [ ] DPO désigné

---

## 📝 Secure Coding Guidelines

### Checklist Développeur (Avant chaque commit)

**1. Authentication & Authorization**:
- [ ] Vérification JWT sur tous les endpoints (sauf webhooks)
- [ ] Vérification du rôle admin sur endpoints sensibles
- [ ] L'utilisateur ne peut accéder qu'à ses propres données

**2. Input Validation**:
- [ ] Tous les inputs validés (Zod, Joi, etc.)
- [ ] Types vérifiés (string, number, boolean, etc.)
- [ ] Ranges vérifiés (min/max, length)

**3. Injection Prevention**:
- [ ] Pas de concaténation SQL
- [ ] HTML sanitizé avec DOMPurify
- [ ] Pas d'eval() ou Function() constructor

**4. Rate Limiting**:
- [ ] Rate limiting sur APIs coûteuses (OpenAI, Suno, DALL-E)
- [ ] Rate limiting sur endpoints sensibles

**5. Logging & Monitoring**:
- [ ] Échecs d'auth loggés avec `logSecurityEvent()`
- [ ] Accès refusés loggés
- [ ] Usage d'APIs coûteuses loggé

**6. Error Handling**:
- [ ] Try-catch présent
- [ ] Erreurs génériques retournées
- [ ] Pas de stack traces exposées

**7. Secrets**:
- [ ] Aucun secret hardcodé
- [ ] API keys dans variables d'environnement
- [ ] Vérification avec TruffleHog

---

## 🔍 Code Review Checklist

### Pour le Reviewer

**Avant d'approuver une PR**:

1. **Security Scan Pass** ✅
   - [ ] GitHub Actions security scan passé
   - [ ] Aucune nouvelle vulnérabilité introduite

2. **Authentication** ✅
   - [ ] Tous les nouveaux endpoints ont auth JWT
   - [ ] Vérification admin si nécessaire

3. **Input Validation** ✅
   - [ ] Tous les inputs validés
   - [ ] Pas de valeurs dangereuses acceptées

4. **Injection Prevention** ✅
   - [ ] Pas de concaténation SQL
   - [ ] HTML sanitizé

5. **Rate Limiting** ✅
   - [ ] Rate limiting sur APIs coûteuses

6. **Logging** ✅
   - [ ] Événements de sécurité loggés

7. **Tests** ✅
   - [ ] Tests unitaires pour la logique de sécurité
   - [ ] Tests d'intégration pour les endpoints

---

## 🚨 Incident Response

### Procédure en Cas de Découverte de Vulnérabilité

**1. Évaluation (0-15 min)**:
- Identifier le type de vulnérabilité
- Évaluer la sévérité (Critical, High, Medium, Low)
- Déterminer l'impact potentiel

**2. Containment (15-60 min)**:
- **Critical**: Désactiver immédiatement l'endpoint
- **High**: Limiter l'accès (IP whitelist temporaire)
- **Medium/Low**: Monitorer activement

**3. Investigation (1-4h)**:
- Analyser les logs de sécurité
- Vérifier si exploitation déjà effectuée
- Identifier la cause racine

**4. Fix (4-24h)**:
- Développer le patch
- Tester le patch en environnement de test
- Déployer le patch en production

**5. Post-Mortem (24-48h)**:
- Documenter l'incident
- Mettre à jour les procédures
- Former l'équipe sur la prévention

---

### Contact d'Urgence

| Sévérité | Qui Contacter | Délai |
|----------|---------------|-------|
| **Critical** | Security Lead + CTO | Immédiat |
| **High** | Security Team | <1h |
| **Medium** | Dev Lead | <24h |
| **Low** | Créer un ticket | <1 semaine |

**Canaux**:
- Slack: #security-incidents (Critical/High)
- Email: security@med-mng.fr
- Phone: +33 X XX XX XX XX (Critical uniquement)

---

## 📚 Quiz & Évaluation

### Quiz OWASP Top 10

**Question 1**: Quelle est la bonne façon de vérifier l'authentification?

A) Vérifier uniquement que le header Authorization existe
B) Vérifier le JWT avec `supabase.auth.getUser()`
C) Vérifier le JWT côté client uniquement
D) Faire confiance au client

**Réponse**: B ✅

---

**Question 2**: Comment prévenir les injections SQL?

A) Échapper les quotes manuellement
B) Utiliser des requêtes paramétrées (query builders)
C) Valider côté client uniquement
D) Bloquer le caractère `'`

**Réponse**: B ✅

---

**Question 3**: Où doivent être stockées les API keys?

A) Dans le code source
B) Dans .env commité dans Git
C) Dans des variables d'environnement (Supabase Secrets)
D) Dans localStorage

**Réponse**: C ✅

---

**Question 4**: Quel est le bon niveau de rate limiting pour GPT-4?

A) Pas de limite
B) 20 requêtes/heure (gratuit), 100/h (premium)
C) 1000 requêtes/jour
D) Illimité pour les admins

**Réponse**: B ✅

---

**Question 5**: Quand faut-il logger un événement de sécurité?

A) Uniquement pour les événements Critical
B) Jamais (trop de logs)
C) Pour tous les échecs d'auth, accès refusés, et activités suspectes
D) Uniquement en production

**Réponse**: C ✅

---

### Évaluation Pratique

**Exercice 1**: Sécuriser cette fonction

```typescript
// Fonction vulnérable
export async function deleteUser(req: Request) {
  const { userId } = await req.json();

  await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  return new Response('User deleted');
}
```

**Solution**:
```typescript
// Fonction sécurisée
export async function deleteUser(req: Request) {
  // 1. Vérifier auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response('Invalid token', { status: 401 });
  }

  // 2. Vérifier que c'est un admin
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const isAdmin = userRoles?.some(r => r.role === 'admin');
  if (!isAdmin) {
    await logSecurityEvent(supabase, {
      type: 'FORBIDDEN_ACCESS',
      severity: 'high',
      userId: user.id,
      endpoint: 'delete-user',
    });

    return new Response('Forbidden', { status: 403 });
  }

  // 3. Valider l'input
  const { userId } = await req.json();
  if (!userId || typeof userId !== 'string') {
    return new Response('Invalid userId', { status: 400 });
  }

  // 4. Supprimer l'utilisateur
  await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  // 5. Logger l'action
  await logSecurityEvent(supabase, {
    type: 'BULK_OPERATION',
    severity: 'medium',
    userId: user.id,
    endpoint: 'delete-user',
    details: { deletedUserId: userId },
  });

  return new Response('User deleted');
}
```

---

## 🎯 Certification

Après avoir complété cette formation, les développeurs doivent:

1. **Passer le quiz** avec un score minimum de 80%
2. **Compléter l'exercice pratique**
3. **Faire reviewer leur code** par un senior
4. **Recevoir la certification** "Med-MNG Secure Developer"

**Renouvellement**: Annuel

---

## 📚 Ressources Supplémentaires

**Documentation**:
- OWASP Top 10: https://owasp.org/Top10/
- Supabase Security: https://supabase.com/docs/guides/auth/auth-deep-dive
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

**Outils**:
- OWASP ZAP: https://www.zaproxy.org/
- Semgrep: https://semgrep.dev/
- Snyk: https://snyk.io/

**Support**:
- Slack: #security-help
- Email: security-training@med-mng.fr

---

**Dernière mise à jour**: 2025-11-19
**Version**: 1.0
**Contact**: security@med-mng.fr
