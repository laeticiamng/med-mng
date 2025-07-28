# 📚 GUIDE API COMPLET MED-MNG

**Version :** 1.0.0  
**Date :** 28 Juillet 2025  
**Statut :** Production-ready

---

## 🎯 RÉSUMÉ EXÉCUTIF

### API Endpoints Disponibles

| Catégorie | Endpoints | Statut | Authentification |
|-----------|-----------|--------|------------------|
| **Chat IA** | 4 endpoints | ✅ Actif | Requise |
| **Musique** | 6 endpoints | ✅ Actif | Requise |
| **EDN/ECOS** | 8 endpoints | ✅ Actif | Publique |
| **Administration** | 12 endpoints | ✅ Actif | Admin requis |
| **Analytics** | 5 endpoints | ✅ Actif | Requise |

### 🔗 Base URL
```
https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/
```

---

## 🤖 API CHAT IA

### POST /contextual-ai-chat
**Description :** Chat IA médical avec contexte automatique  
**Authentification :** Bearer Token requis

**Request Body :**
```json
{
  "message": "Qu'est-ce que l'hypertension ?",
  "conversation_id": "uuid-optional",
  "context_type": "medical",
  "user_preferences": {
    "specialty": "cardiology",
    "detail_level": "expert"
  }
}
```

**Response :**
```json
{
  "response": "L'hypertension artérielle...",
  "sources": [
    {
      "type": "edn_item",
      "title": "IC-221 - Hypertension artérielle",
      "confidence": 0.95
    }
  ],
  "conversation_id": "uuid",
  "tokens_used": 150
}
```

### POST /chat-with-ai
**Description :** Chat IA simple sans contexte  
**Authentification :** Bearer Token requis

**Request Body :**
```json
{
  "message": "Question médicale",
  "history": []
}
```

---

## 🎵 API GÉNÉRATION MUSICALE

### POST /content-ai-generator
**Description :** Génération de contenu musical avec Suno AI  
**Authentification :** Bearer Token requis

**Request Body :**
```json
{
  "type": "music",
  "prompt": "Mélodie apaisante pour méditation médicale",
  "style": "ambient",
  "duration": 120,
  "edn_item_code": "IC-1",
  "options": {
    "instrumental": true,
    "tempo": "slow",
    "mood": "relaxing"
  }
}
```

**Response :**
```json
{
  "success": true,
  "audio_url": "https://cdn.suno.ai/audio/...",
  "metadata": {
    "duration": 120,
    "file_size": "3.2MB",
    "format": "mp3"
  },
  "suno_id": "audio-id-12345"
}
```

### GET /ai-recommendations
**Description :** Recommandations musicales IA personnalisées  
**Authentification :** Bearer Token requis

**Parameters :**
- `user_mood`: string (optional)
- `specialty`: string (optional)
- `limit`: integer (default: 10)

**Response :**
```json
{
  "recommendations": [
    {
      "song_id": "uuid",
      "title": "Mélodie Cardiologie",
      "confidence_score": 0.89,
      "reason": "Basé sur vos préférences en cardiologie"
    }
  ]
}
```

---

## 📚 API EDN/ECOS

### GET /advanced-search
**Description :** Recherche avancée dans les items EDN/ECOS  
**Authentification :** Publique

**Parameters :**
- `q`: string (required) - Terme de recherche
- `type`: string (optional) - "edn" | "ecos"
- `specialty`: string (optional)
- `rang`: string (optional) - "A" | "B"
- `limit`: integer (default: 20)
- `offset`: integer (default: 0)

**Response :**
```json
{
  "results": [
    {
      "id": "uuid",
      "item_code": "IC-1",
      "title": "Relation médecin-malade",
      "type": "edn",
      "specialty": "medecine_generale",
      "relevance_score": 0.95,
      "highlight": "...médecin-malade..."
    }
  ],
  "total": 145,
  "query_time": "23ms"
}
```

### GET /compare-official-content
**Description :** Comparaison avec contenu officiel  
**Authentification :** Publique

**Parameters :**
- `item_code`: string (required)
- `version`: string (optional)

---

## 🛡️ API ADMINISTRATION

### POST /admin-export
**Description :** Export de données administratives  
**Authentification :** Admin requis

**Request Body :**
```json
{
  "export_type": "users|analytics|content",
  "format": "json|csv|xlsx",
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-07-28"
  },
  "filters": {
    "user_type": "premium",
    "active_only": true
  }
}
```

### POST /admin-quick-edit
**Description :** Édition rapide admin  
**Authentification :** Admin requis

**Request Body :**
```json
{
  "table": "edn_items_immersive",
  "id": "uuid",
  "field": "title",
  "value": "Nouveau titre",
  "reason": "Correction orthographique"
}
```

### GET /audit-system
**Description :** Système d'audit complet  
**Authentification :** Admin requis

**Parameters :**
- `type`: string - "security|performance|data"
- `detailed`: boolean (default: false)

**Response :**
```json
{
  "audit_id": "uuid",
  "type": "security",
  "status": "completed",
  "score": 98.3,
  "issues": [
    {
      "severity": "low",
      "category": "configuration",
      "description": "OTP expiry configuration",
      "recommendation": "Adjust OTP settings"
    }
  ],
  "timestamp": "2025-07-28T10:00:00Z"
}
```

---

## 📊 API ANALYTICS

### GET /analytics-engine
**Description :** Moteur d'analytics avancé  
**Authentification :** Bearer Token requis

**Parameters :**
- `metric`: string - "usage|performance|engagement"
- `period`: string - "day|week|month|year"
- `start_date`: string (ISO format)
- `end_date`: string (ISO format)

**Response :**
```json
{
  "metrics": {
    "total_users": 1250,
    "active_users": 890,
    "new_registrations": 45,
    "retention_rate": 0.78
  },
  "trend": {
    "direction": "increasing",
    "percentage": 12.5
  },
  "breakdown": {
    "by_specialty": {
      "cardiology": 234,
      "neurology": 178
    }
  }
}
```

### POST /analytics-tracker
**Description :** Tracking d'événements utilisateur  
**Authentification :** Bearer Token requis

**Request Body :**
```json
{
  "event_type": "song_generated|item_viewed|quiz_completed",
  "event_data": {
    "item_code": "IC-1",
    "duration": 120,
    "score": 85
  },
  "session_id": "session-uuid",
  "timestamp": "2025-07-28T10:00:00Z"
}
```

---

## 🔐 AUTHENTIFICATION

### Headers requis
```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### Obtenir un token
```javascript
import { supabase } from '@/integrations/supabase/client'

// Authentification
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Le token est disponible dans data.session.access_token
```

---

## 🚦 RATE LIMITING

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| **Chat IA** | 100 req/h | Par utilisateur |
| **Génération musicale** | 10 req/h | Par utilisateur |
| **Recherche** | 1000 req/h | Par IP |
| **Admin** | 500 req/h | Par admin |

---

## 📝 CODES D'ERREUR

### Codes HTTP standards
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin requis)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Format d'erreur
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Le paramètre 'item_code' est requis",
    "details": {
      "field": "item_code",
      "expected": "string"
    }
  },
  "request_id": "req-uuid-12345"
}
```

---

## 🧪 EXEMPLES D'UTILISATION

### Génération de musique EDN
```javascript
const response = await fetch('/functions/v1/content-ai-generator', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'music',
    prompt: 'Musique relaxante pour IC-221 Hypertension',
    edn_item_code: 'IC-221',
    options: {
      instrumental: true,
      duration: 180
    }
  })
})
```

### Recherche multi-critères
```javascript
const searchResults = await fetch(
  '/functions/v1/advanced-search?q=hypertension&specialty=cardiology&rang=A'
)
```

### Analytics utilisateur
```javascript
await fetch('/functions/v1/analytics-tracker', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event_type: 'item_viewed',
    event_data: {
      item_code: 'IC-221',
      view_duration: 45
    }
  })
})
```

---

## 🔧 SDK & OUTILS

### JavaScript/TypeScript SDK
```bash
npm install @med-mng/api-client
```

```javascript
import { MedMngClient } from '@med-mng/api-client'

const client = new MedMngClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://yaincoxihiqdksxgrsrk.supabase.co'
})

// Utilisation simple
const response = await client.chat.send('Qu\'est-ce que l\'hypertension ?')
```

### Webhooks
Configuration des webhooks pour les événements temps réel :

```json
{
  "webhook_url": "https://votre-app.com/webhooks/med-mng",
  "events": ["music_generated", "user_registered", "quiz_completed"],
  "secret": "webhook-secret-key"
}
```

---

## 📈 MONITORING & PERFORMANCE

### Métriques disponibles
- **Latence moyenne** : < 200ms
- **Disponibilité** : 99.9%
- **Throughput** : 1000 req/min
- **Temps de génération musicale** : 30-60s

### Status page
🔗 [Status MED-MNG API](https://status.med-mng.com)

---

## 📞 SUPPORT & RESSOURCES

### Documentation technique
- 📚 [Guide développeur complet](./docs/developer-guide.md)
- 🔧 [Exemples de code](./docs/code-examples.md)
- 🐛 [Troubleshooting](./docs/troubleshooting.md)

### Communauté & Support
- 💬 [Discord communauté](https://discord.gg/med-mng)
- 📧 **Email support** : api-support@med-mng.com
- 🎫 **Issues GitHub** : [Repository](https://github.com/med-mng/med-mng)

---

*Guide API généré le 28 Juillet 2025*  
*Version 1.0.0 - Production ready*