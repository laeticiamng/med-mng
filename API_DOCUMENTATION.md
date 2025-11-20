# 📚 Med-MNG API Documentation

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [Rate Limiting](#rate-limiting)
4. [Endpoints par Catégorie](#endpoints-par-catégorie)
5. [Codes d'Erreur](#codes-derreur)
6. [Security Monitoring](#security-monitoring)
7. [Exemples d'Intégration](#exemples-dintégration)
8. [Best Practices](#best-practices)
9. [SDK & Outils](#sdk--outils)

---

## 🚀 Introduction

L'API Med-MNG permet de :
- **Générer du contenu IA** (musique, texte, images) pour l'éducation médicale
- **Extraire des données** depuis des sources externes (UNESS, EDN)
- **Analyser des données** et générer des rapports
- **Gérer les utilisateurs** et les abonnements
- **Monitorer la sécurité** en temps réel

### Base URL

```
Production: https://your-project.supabase.co/functions/v1
Development: http://localhost:54321/functions/v1
```

### Format de Réponse

Toutes les réponses API sont au format JSON:

```json
{
  "success": true,
  "data": { ... },
  "rateLimit": {
    "remaining": 19,
    "limit": 20,
    "resetAt": "2025-11-19T15:30:00Z"
  }
}
```

En cas d'erreur:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## 🔐 Authentification

### Obtenir un Token JWT

L'API Med-MNG utilise Supabase Auth pour l'authentification JWT.

#### 1. S'inscrire / Se connecter

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Récupérer le token
const token = data.session.access_token;
```

#### 2. Utiliser le Token

Incluez le token dans l'en-tête `Authorization` de toutes les requêtes:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Musique relaxante"}'
```

#### 3. Rafraîchir le Token

Les tokens JWT expirent après 1 heure. Rafraîchissez-les automatiquement:

```javascript
// Supabase gère automatiquement le rafraîchissement
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed:', session.access_token);
  }
});

// Ou manuellement
const { data, error } = await supabase.auth.refreshSession();
const newToken = data.session.access_token;
```

### Permissions & Rôles

Certains endpoints nécessitent des rôles spécifiques:

| Endpoint | Rôle Requis | Description |
|----------|-------------|-------------|
| `/generate-music` | Authenticated | Utilisateur connecté |
| `/content-ai-generator` | Authenticated | Utilisateur connecté |
| `/admin-export` | **Admin** | Rôle admin requis |
| `/analytics-aggregator` | **Admin** | Rôle admin requis |

#### Vérifier le Rôle

```sql
-- Dans Supabase Dashboard
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
```

```javascript
// Côté client
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

const isAdmin = roles?.some(r => r.role === 'admin');
```

---

## ⏱️ Rate Limiting

### Limites par Endpoint

| Endpoint | Gratuit | Premium | Fenêtre |
|----------|---------|---------|---------|
| **AI Chat** (GPT-4) | 20/h | 100/h | 1 heure |
| **Image Gen** (DALL-E) | 10/h | 50/h | 1 heure |
| **Music Gen** (Suno) | 5/h | 20/h | 1 heure |
| **Code Analysis** | 15/h | 50/h | 1 heure |
| **Email Send** | 50/h | 200/h | 1 heure |
| **Data Export** | 5/h | 20/h | 1 heure |
| **Admin Bulk Ops** | 3/h | 10/h | 1 heure |

### Headers de Rate Limiting

Toutes les réponses incluent ces headers:

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 2025-11-19T15:30:00Z
```

### Réponse 429 (Rate Limit Exceeded)

```json
{
  "error": "Rate limit exceeded",
  "message": "You can generate 5 songs per hour. Try again in 23 minutes.",
  "remaining": 0,
  "resetAt": "2025-11-19T15:30:00Z",
  "limit": 5
}
```

Headers additionnels:

```http
Retry-After: 1380
```

### Gérer le Rate Limiting

```javascript
async function callAPIWithRetry(endpoint, body) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Vérifier le rate limiting
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetAt = response.headers.get('X-RateLimit-Reset');

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.warn(`Rate limited. Retry after ${retryAfter}s`);

      // Attendre et réessayer
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return callAPIWithRetry(endpoint, body);
    }

    return response.json();

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## 🎯 Endpoints par Catégorie

### 1. Music Generation

#### POST `/generate-music`

Génère une musique thérapeutique via Suno AI.

**Authentification:** Requise
**Rate Limit:** 5/h (gratuit), 20/h (premium)
**Coût:** ~$0.10/chanson

**Request:**

```json
{
  "prompt": "Musique relaxante pour méditation, 432Hz, sons de nature",
  "duration": 180,
  "style": "ambient"
}
```

**Response:**

```json
{
  "success": true,
  "taskId": "task_abc123def456",
  "rateLimit": {
    "remaining": 4,
    "resetAt": "2025-11-19T15:30:00Z",
    "limit": 5
  }
}
```

**Exemple:**

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/generate-music', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Musique relaxante pour méditation',
    duration: 180,
    style: 'ambient',
  }),
});

const data = await response.json();
console.log('Task ID:', data.taskId);
```

---

### 2. AI Content Generation

#### POST `/content-ai-generator`

Génère du contenu éducatif via GPT-4.

**Authentification:** Requise
**Rate Limit:** 20/h (gratuit), 100/h (premium)
**Coût:** $0.03/1K tokens

**Request:**

```json
{
  "prompt": "Expliquer le fonctionnement du cœur humain en termes simples",
  "model": "gpt-4",
  "max_tokens": 1000
}
```

**Response:**

```json
{
  "success": true,
  "content": "Le cœur humain est une pompe musculaire...",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 150,
    "total_tokens": 165
  },
  "rateLimit": {
    "remaining": 19,
    "resetAt": "2025-11-19T15:30:00Z",
    "limit": 20
  }
}
```

**Exemple:**

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/content-ai-generator', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Expliquer le fonctionnement du cœur humain',
    model: 'gpt-4',
    max_tokens: 1000,
  }),
});

const data = await response.json();
console.log('Content:', data.content);
```

---

#### POST `/openai-image`

Génère une image via DALL-E 3.

**Authentification:** Requise
**Rate Limit:** 10/h (gratuit), 50/h (premium)
**Coût:** $0.04/image

**Request:**

```json
{
  "prompt": "Illustration médicale d'un cœur humain en coupe",
  "size": "1024x1024"
}
```

**Response:**

```json
{
  "success": true,
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "rateLimit": {
    "remaining": 9,
    "resetAt": "2025-11-19T15:30:00Z",
    "limit": 10
  }
}
```

**Exemple:**

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/openai-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Illustration médicale d\'un cœur humain',
    size: '1024x1024',
  }),
});

const data = await response.json();
console.log('Image URL:', data.imageUrl);
```

---

#### POST `/ai-code-analysis`

Analyse du code via GPT-4.

**Authentification:** Requise
**Rate Limit:** 15/h (gratuit), 50/h (premium)

**Request:**

```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "analysisType": "security"
}
```

**Response:**

```json
{
  "success": true,
  "analysis": "Le code est correct mais pourrait être amélioré...",
  "suggestions": [
    "Ajouter la validation des types",
    "Gérer les cas d'erreur",
    "Ajouter des commentaires JSDoc"
  ],
  "rateLimit": {
    "remaining": 14,
    "limit": 15
  }
}
```

---

### 3. Admin Operations

#### POST `/admin-export`

Exporte des données en bulk. **Admin seulement.**

**Authentification:** Requise + Admin
**Rate Limit:** 5/h

**Request:**

```json
{
  "type": "patients",
  "format": "csv",
  "startDate": "2025-01-01",
  "endDate": "2025-11-19"
}
```

**Response:**

```json
{
  "success": true,
  "downloadUrl": "https://storage.supabase.co/...",
  "recordCount": 1523,
  "expiresAt": "2025-11-20T15:30:00Z"
}
```

**Exemple:**

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/admin-export', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'patients',
    format: 'csv',
    startDate: '2025-01-01',
    endDate: '2025-11-19',
  }),
});

if (response.status === 403) {
  console.error('Admin role required');
  return;
}

const data = await response.json();
console.log('Download URL:', data.downloadUrl);
console.log('Expires at:', data.expiresAt);
```

---

#### POST `/analytics-aggregator`

Agrège les métriques de la plateforme. **Admin seulement.**

**Authentification:** Requise + Admin

**Request:**

```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-11-19",
  "filters": {}
}
```

**Response:**

```json
{
  "userActivity": {
    "totalSessions": 1523,
    "averageSessionDuration": 18,
    "bounceRate": 35.2,
    "newUsers": 234,
    "returningUsers": 890
  },
  "contentMetrics": {
    "totalGenerations": 456,
    "successfulGenerations": 423,
    "popularStyles": ["ambient", "classical", "meditation"],
    "averageRating": 4.2
  },
  "performanceMetrics": {
    "averageLoadTime": 1523,
    "errorRate": 1.2,
    "apiResponseTime": 234
  },
  "revenueMetrics": {
    "totalRevenue": 8543,
    "activeSubscriptions": 234,
    "churnRate": 5.6,
    "conversionRate": 3.2
  },
  "errorMetrics": {
    "totalErrors": 45,
    "criticalErrors": 2,
    "resolvedErrors": 38,
    "unresolvedErrors": 7
  },
  "period": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-11-19T23:59:59Z",
    "durationDays": 323
  }
}
```

---

### 4. Webhooks

#### POST `/stripe-webhook`

Reçoit les événements Stripe (paiements, abonnements).

**Authentification:** Aucune (signature HMAC vérifiée)
**Headers requis:** `stripe-signature`

**Security:** Vérification de signature HMAC SHA-256 automatique.

**Exemple d'événement:**

```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_123",
      "customer": "cus_123",
      "status": "active"
    }
  }
}
```

---

#### POST `/github-quality-webhook`

Reçoit les événements GitHub (push, PR, issues).

**Authentification:** Aucune (signature HMAC vérifiée)
**Headers requis:** `x-hub-signature-256`

**Security:** Vérification de signature HMAC SHA-256 automatique.

---

## ❌ Codes d'Erreur

| Code | Type | Description | Action |
|------|------|-------------|--------|
| `400` | Bad Request | Paramètres invalides | Vérifier le body de la requête |
| `401` | Unauthorized | Token manquant/invalide | Se reconnecter |
| `403` | Forbidden | Permissions insuffisantes | Vérifier le rôle utilisateur |
| `429` | Too Many Requests | Rate limit dépassé | Attendre et réessayer |
| `500` | Internal Server Error | Erreur serveur | Contacter le support |

### Exemples de Réponses d'Erreur

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required"
}
```

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": "Admin role required"
}
```

#### 429 Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded",
  "message": "You can generate 5 songs per hour. Try again in 23 minutes.",
  "remaining": 0,
  "resetAt": "2025-11-19T15:30:00Z",
  "limit": 5
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## 🔒 Security Monitoring

### Événements Loggés

Tous les événements de sécurité sont automatiquement loggés:

- **UNAUTHORIZED_ACCESS** - Tentative d'accès sans JWT
- **FORBIDDEN_ACCESS** - Permissions insuffisantes
- **RATE_LIMIT_EXCEEDED** - Dépassement de limite
- **SUSPICIOUS_ACTIVITY** - Multiples tentatives échouées
- **API_KEY_USAGE** - Usage d'APIs coûteuses (OpenAI, Suno)

### Alertes Automatiques

Les alertes sont envoyées via Slack/Teams/Email pour:

- **Événements HIGH** (🟠): Accès non autorisé, accès interdit
- **Événements CRITICAL** (🔴): Injection SQL, XSS, brute force

### Consulter les Événements de Sécurité

```sql
-- Dans Supabase Dashboard
SELECT * FROM security_events
WHERE user_id = 'YOUR_USER_ID'
ORDER BY timestamp DESC
LIMIT 20;
```

---

## 💡 Exemples d'Intégration

### React / Next.js

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function generateMusic(prompt: string) {
  try {
    // Obtenir le token de session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // Appeler l'API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-music`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          duration: 180,
          style: 'ambient',
        }),
      }
    );

    // Vérifier le rate limiting
    const remaining = response.headers.get('X-RateLimit-Remaining');
    console.log(`Remaining: ${remaining}`);

    if (response.status === 429) {
      const resetAt = response.headers.get('X-RateLimit-Reset');
      throw new Error(`Rate limited. Reset at ${resetAt}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data;

  } catch (error) {
    console.error('Error generating music:', error);
    throw error;
  }
}
```

### Vue.js

```javascript
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';

export function useAPI() {
  const loading = ref(false);
  const error = ref(null);

  async function callAPI(endpoint, body) {
    loading.value = true;
    error.value = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API error');
      }

      return data;

    } catch (err) {
      error.value = err.message;
      throw err;

    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    callAPI,
  };
}
```

### Node.js / Express

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post('/api/generate-content', async (req, res) => {
  try {
    // Vérifier l'authentification de l'utilisateur
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Vérifier le token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Appeler l'API Med-MNG
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/content-ai-generator`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Python

```python
import os
import requests
from supabase import create_client, Client

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_ANON_KEY")
)

def generate_music(prompt: str, token: str):
    """Génère une musique via l'API Med-MNG"""

    url = f"{os.environ.get('SUPABASE_URL')}/functions/v1/generate-music"

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }

    body = {
        'prompt': prompt,
        'duration': 180,
        'style': 'ambient',
    }

    response = requests.post(url, headers=headers, json=body)

    # Vérifier le rate limiting
    remaining = response.headers.get('X-RateLimit-Remaining')
    print(f'Remaining: {remaining}')

    if response.status_code == 429:
        reset_at = response.headers.get('X-RateLimit-Reset')
        raise Exception(f'Rate limited. Reset at {reset_at}')

    data = response.json()

    if not data.get('success'):
        raise Exception(data.get('error'))

    return data

# Usage
session = supabase.auth.get_session()
token = session.access_token

result = generate_music('Musique relaxante', token)
print(f"Task ID: {result['taskId']}")
```

---

## 🎯 Best Practices

### 1. Toujours Vérifier le Rate Limiting

```javascript
const response = await fetch(endpoint, options);

// Vérifier les headers
const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));

if (remaining < 3) {
  console.warn(`⚠️ Only ${remaining} requests remaining`);
}

if (response.status === 429) {
  const retryAfter = parseInt(response.headers.get('Retry-After'));
  console.error(`Rate limited. Retry after ${retryAfter}s`);

  // Attendre et réessayer
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
}
```

### 2. Gérer les Erreurs Proprement

```javascript
async function callAPI(endpoint, body) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Cas spécifiques
    if (response.status === 401) {
      // Token invalide - rediriger vers login
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      // Permissions insuffisantes
      throw new Error('You do not have permission to perform this action');
    }

    if (response.status === 429) {
      // Rate limit - attendre
      const resetAt = response.headers.get('X-RateLimit-Reset');
      throw new Error(`Rate limited. Try again at ${new Date(resetAt).toLocaleString()}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API error');
    }

    return data;

  } catch (error) {
    console.error('API Error:', error);
    // Logger l'erreur pour monitoring
    logError(error);
    throw error;
  }
}
```

### 3. Utiliser les Tokens Correctement

```javascript
// ✅ BON - Rafraîchir automatiquement
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
    // Le nouveau token est automatiquement utilisé
  }

  if (event === 'SIGNED_OUT') {
    // Rediriger vers login
    window.location.href = '/login';
  }
});

// ❌ MAUVAIS - Stocker le token en dur
localStorage.setItem('token', token); // Ne pas faire ça
```

### 4. Monitorer l'Usage de l'API

```javascript
// Tracker l'usage pour optimiser
const apiMetrics = {
  calls: 0,
  errors: 0,
  rateLimitHits: 0,
};

async function callAPIWithMetrics(endpoint, body) {
  apiMetrics.calls++;

  try {
    const response = await fetch(endpoint, options);

    if (response.status === 429) {
      apiMetrics.rateLimitHits++;
    }

    // ... rest of code

  } catch (error) {
    apiMetrics.errors++;
    throw error;
  }
}

// Logger les métriques périodiquement
setInterval(() => {
  console.log('API Metrics:', apiMetrics);

  if (apiMetrics.rateLimitHits > 10) {
    console.warn('⚠️ High rate limit hits - consider upgrading to premium');
  }
}, 60000); // Chaque minute
```

### 5. Implémenter un Retry Mechanism

```javascript
async function callAPIWithRetry(endpoint, body, maxRetries = 3) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 60;
        console.warn(`Rate limited. Retrying in ${retryAfter}s...`);

        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        retries++;
        continue;
      }

      if (response.status >= 500) {
        // Erreur serveur - retry avec backoff exponentiel
        const delay = Math.pow(2, retries) * 1000;
        console.warn(`Server error. Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }

      return response.json();

    } catch (error) {
      if (retries === maxRetries - 1) {
        throw error;
      }

      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## 🛠️ SDK & Outils

### SDK Officiel (Supabase JS)

```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

### OpenAPI / Swagger

La spécification OpenAPI complète est disponible dans `openapi.yaml`.

**Générer un client TypeScript:**

```bash
npm install -g openapi-typescript
openapi-typescript openapi.yaml -o med-mng-api.ts
```

**Générer un client Python:**

```bash
pip install openapi-generator-cli
openapi-generator generate -i openapi.yaml -g python -o ./python-client
```

### Tester l'API avec Postman

1. Importer `openapi.yaml` dans Postman
2. Configurer les variables d'environnement:
   - `SUPABASE_URL`
   - `JWT_TOKEN`
3. Tester les endpoints

### Tester l'API avec cURL

```bash
# Obtenir un token
TOKEN="your-jwt-token"

# Générer une musique
curl -X POST https://your-project.supabase.co/functions/v1/generate-music \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Musique relaxante pour méditation",
    "duration": 180,
    "style": "ambient"
  }'

# Générer du contenu AI
curl -X POST https://your-project.supabase.co/functions/v1/content-ai-generator \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Expliquer le fonctionnement du cœur humain",
    "model": "gpt-4",
    "max_tokens": 1000
  }'
```

---

## 🆘 Support & Contact

**Documentation:**
- OpenAPI Spec: `openapi.yaml`
- Rate Limiting: `RATE_LIMITING_IMPLEMENTATION.md`
- Security Monitoring: `MONITORING_ALERTING_IMPLEMENTATION.md`

**Contact:**
- Support: support@med-mng.fr
- Sécurité: security@med-mng.fr
- API Issues: api@med-mng.fr

**Ressources:**
- Supabase Docs: https://supabase.com/docs
- OpenAPI Spec: https://swagger.io/specification/
- Rate Limiting Best Practices: https://www.ietf.org/rfc/rfc6585.txt

---

## 📈 Changelog

### v1.0.0 (2025-11-19)

- ✅ Documentation API initiale
- ✅ Spécification OpenAPI 3.0
- ✅ Exemples d'intégration (React, Vue, Node.js, Python)
- ✅ Rate limiting complet
- ✅ Security monitoring
- ✅ Best practices et guidelines
