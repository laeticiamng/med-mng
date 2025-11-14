# 📚 Extract EDN UNESS Complete - Documentation Complète

Version: **2.0**
Date: **2025-11-14**
Auteur: **Med-Mng Team**

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Fonctionnalités](#fonctionnalités)
4. [API & Utilisation](#api--utilisation)
5. [Configuration](#configuration)
6. [Types & Interfaces](#types--interfaces)
7. [Flux de données](#flux-de-données)
8. [Gestion d'erreurs](#gestion-derreurs)
9. [Logging & Monitoring](#logging--monitoring)
10. [Tests](#tests)
11. [Déploiement](#déploiement)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

### Description

Cette fonction Supabase Edge permet d'extraire de manière complète et robuste les items EDN (Enseignement Des Négociations) depuis la plateforme UNESS (Université Numérique en Santé et Sport).

### Objectifs

- ✅ Authentification sécurisée via CAS UNESS
- ✅ Extraction complète des items EDN avec rangs A et B
- ✅ Validation et scoring de qualité des données
- ✅ Gestion avancée des erreurs avec retry
- ✅ Métriques et monitoring détaillés
- ✅ Persistence dans Supabase

### Nouveautés v2.0

- 🆕 **Types TypeScript enrichis** avec enums et interfaces complètes
- 🆕 **Système de retry** avec backoff exponentiel
- 🆕 **Validation des données** avec scoring de qualité
- 🆕 **Logging structuré** avec niveaux et timestamps
- 🆕 **Métriques détaillées** (temps de traitement, taux de succès)
- 🆕 **Patterns d'extraction améliorés** pour les rangs A/B
- 🆕 **Gestion d'erreurs personnalisée** avec codes d'erreur

---

## 🏗️ Architecture

### Stack Technique

- **Runtime**: Deno (Supabase Edge Functions)
- **Language**: TypeScript 5.x
- **Database**: Supabase PostgreSQL
- **Authentication**: CAS (Central Authentication Service)

### Composants Principaux

```
extract-edn-uness-complete/
├── index.ts              # Code principal
├── README.md            # Documentation (ce fichier)
├── config.json          # Configuration
└── test.ts              # Tests unitaires
```

### Flux de l'Application

```
┌─────────────────┐
│  HTTP Request   │
└────────┬────────┘
         │
    ┌────▼────────────┐
    │  Main Handler   │
    └────┬────────────┘
         │
    ┌────▼──────────────────┐
    │  Authentication CAS   │ ◄── Retry Logic
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │  Extract Items Loop   │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │  Extract Item Data    │ ◄── Retry Logic
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │  Extract Rangs A/B    │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │  Validate & Score     │
    └────┬──────────────────┘
         │
    ┌────▼──────────────────┐
    │  Save to Database     │ ◄── Retry Logic
    └────┬──────────────────┘
         │
    ┌────▼────────┐
    │  Response   │
    └─────────────┘
```

---

## ✨ Fonctionnalités

### 1. Authentification CAS

- Connexion automatique à UNESS via CAS
- Gestion des cookies de session
- Retry automatique en cas d'échec
- Support des credentials depuis env ou requête

### 2. Extraction Complète

- **Version imprimable** privilégiée pour contenu complet
- **Fallback** sur page normale si version imprimable indisponible
- **Patterns multiples** pour extraction robuste
- **Déduplication** automatique des doublons

### 3. Extraction des Rangs

#### Patterns de Section (Priorité)

1. `<div class="rang-a">` - Section avec classe
2. `<div id="rang-a">` - Section avec ID
3. `<h2>Rang A</h2>` - Titre hierarchique
4. `<table>...Rang A...</table>` - Table avec rang
5. Pattern générique dans texte

#### Patterns d'Objectifs (Priorité)

1. `<li>` - Liste à puces (priorité 1)
2. `<p class="objectif">` - Paragraphe objectif (priorité 2)
3. `<div class="objectif">` - Div objectif (priorité 2)
4. `<td>` - Cellule tableau (priorité 3)
5. `<p>` - Paragraphe simple (priorité 4)

### 4. Validation des Données

Chaque item extrait est validé selon plusieurs critères:

- **Intitulé**: longueur minimale 10 caractères (-20 points si invalide)
- **Rangs**: présence de rangs A ou B (-30 points si aucun)
- **Contenu**: HTML complet minimum 100 caractères (-25 points si incomplet)
- **Qualité**: détection de rangs génériques (-15 points)

**Score de qualité**: 0-100 (seuil validité: 40)

### 5. Retry Logic

Toutes les opérations critiques utilisent un système de retry:

- **Max retries**: 3 tentatives par défaut
- **Backoff exponentiel**: 1s, 2s, 4s, 8s...
- **Opérations concernées**:
  - Authentification CAS
  - Extraction d'item
  - Sauvegarde en base

### 6. Monitoring & Métriques

Chaque extraction retourne des métriques détaillées:

```typescript
{
  totalProcessed: number,      // Nombre total traité
  totalErrors: number,          // Nombre d'erreurs
  totalSuccess: number,         // Nombre de succès
  totalPartial: number,         // Nombre partiels
  duration: number,             // Durée totale (ms)
  averageProcessingTime: number,// Temps moyen par item
  successRate: string,          // Taux de succès (%)
  warnings: string[]            // Warnings détaillés
}
```

---

## 🔌 API & Utilisation

### Endpoint

```
POST https://[PROJECT].supabase.co/functions/v1/extract-edn-uness-complete
```

### Headers

```http
Content-Type: application/json
Authorization: Bearer [SUPABASE_ANON_KEY]
```

### Request Body

```typescript
{
  "action": "start" | "resume" | "test" | "validate",
  "resumeFromItem": 1,           // Optionnel, défaut: 1
  "maxItems": 10,                // Optionnel, défaut: 3
  "credentials": {               // Optionnel (utilise env si absent)
    "username": "user@uness.fr",
    "password": "password"
  },
  "config": {                    // Optionnel
    "maxRetries": 3,
    "retryDelayMs": 2000,
    "requestDelayMs": 2000,
    "timeout": 30000,
    "batchSize": 10
  }
}
```

### Response Success

```typescript
{
  "success": true,
  "message": "Extraction complète terminée avec succès",
  "stats": {
    "totalProcessed": 10,
    "totalErrors": 0,
    "totalSuccess": 9,
    "totalPartial": 1,
    "itemsFound": 10,
    "lastProcessedItem": 10,
    "duration": 45000,
    "averageProcessingTime": 4500,
    "successRate": "90.00%",
    "durationSeconds": "45.00",
    "warnings": [
      "Item 5: Rangs génériques détectés - révision manuelle requise"
    ],
    "extractedItems": [...] // Échantillon de 5 items
  }
}
```

### Response Error

```typescript
{
  "success": false,
  "error": "Credentials UNESS manquants",
  "code": "MISSING_CREDENTIALS",
  "details": "...",
  "durationMs": 1000
}
```

### Exemples d'Utilisation

#### JavaScript/TypeScript

```typescript
const response = await fetch(
  'https://[PROJECT].supabase.co/functions/v1/extract-edn-uness-complete',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      action: 'start',
      resumeFromItem: 1,
      maxItems: 50
    })
  }
);

const data = await response.json();
console.log('Extraction stats:', data.stats);
```

#### cURL

```bash
curl -X POST \
  'https://[PROJECT].supabase.co/functions/v1/extract-edn-uness-complete' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [KEY]' \
  -d '{
    "action": "start",
    "resumeFromItem": 1,
    "maxItems": 10
  }'
```

---

## ⚙️ Configuration

### Variables d'Environnement

```bash
# Supabase
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# UNESS Credentials (optionnel, peut être passé dans la requête)
UNES_EMAIL=user@uness.fr
UNES_PASSWORD=password
```

### Configuration par Défaut

```typescript
const DEFAULT_CONFIG = {
  maxRetries: 3,          // Nombre de tentatives max
  retryDelayMs: 2000,     // Délai de base pour retry (ms)
  requestDelayMs: 2000,   // Délai entre requêtes (ms)
  timeout: 30000,         // Timeout par requête (ms)
  batchSize: 10           // Taille de batch (futur)
};
```

### URLs

```typescript
const URLS = {
  CAS_LOGIN: 'https://auth.uness.fr/cas/login',
  LIVRET_BASE: 'https://livret.uness.fr/lisa/2025',
  ITEMS_PAGE: 'https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C',
  ITEM_TEMPLATE: (id) => `https://livret.uness.fr/lisa/2025/Item_de_connaissance_2C/Item_${id}`
};
```

---

## 📦 Types & Interfaces

### Enums

```typescript
enum ExtractionAction {
  START = 'start',
  RESUME = 'resume',
  TEST = 'test',
  VALIDATE = 'validate'
}

enum ExtractionStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
  PENDING = 'pending'
}

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}
```

### Interfaces Principales

```typescript
interface EdnItem {
  item_id: number;
  intitule: string;
  rangs_a: string[];
  rangs_b: string[];
  contenu_complet_html: string;
  extraction_status: ExtractionStatus;
  metadata?: {
    extraction_date: string;
    content_length: number;
    rangs_a_count: number;
    rangs_b_count: number;
    version: string;
    quality_score: number;
  };
}

interface ExtractionResult {
  totalProcessed: number;
  totalErrors: number;
  totalSuccess: number;
  totalPartial: number;
  extractedItems: EdnItem[];
  itemsFound: number;
  lastProcessedItem: number;
  duration: number;
  averageProcessingTime: number;
  error?: string;
  warnings: string[];
}
```

---

## 🔄 Flux de Données

### 1. Authentification

```
Client → Edge Function → CAS UNESS
         ↓
    Récupération formulaire
         ↓
    Extraction token execution
         ↓
    Soumission credentials
         ↓
    Récupération cookies session
```

### 2. Extraction Item

```
Pour chaque item (startFrom → endItem):
  ├── Fetch page principale
  ├── Extraction intitulé
  ├── Tentative version imprimable
  │   ├── URL 1: /version_imprimable
  │   ├── URL 2: ?printable=yes
  │   ├── URL 3: &printable=yes
  │   └── URL 4: /print
  ├── Fallback page normale si échec
  ├── Extraction rangs A
  ├── Extraction rangs B
  ├── Validation & scoring
  ├── Ajout métadonnées
  └── Sauvegarde DB avec retry
```

### 3. Persistance

```
Item → Validation → Transform → Upsert Supabase
                                      ↓
                              edn_items_uness
```

---

## ⚠️ Gestion d'Erreurs

### Classes d'Erreur

```typescript
class EdnExtractionError extends Error {
  code: string;           // Code d'erreur
  itemId?: number;        // ID item concerné
  retryable: boolean;     // Peut être retry ?
}
```

### Codes d'Erreur

| Code | Description | Retryable |
|------|-------------|-----------|
| `MISSING_CREDENTIALS` | Credentials manquants | ❌ |
| `CAS_LOGIN_PAGE_ERROR` | Page CAS inaccessible | ✅ |
| `CAS_AUTH_FAILED` | Auth CAS échouée | ❌ |
| `CAS_ERROR` | Erreur générale CAS | ✅ |
| `ITEMS_PAGE_ERROR` | Page items inaccessible | ✅ |
| `ITEM_UNAUTHORIZED` | Item non autorisé | ✅ |
| `ITEM_NOT_FOUND` | Item non trouvé | ❌ |
| `UNKNOWN_ERROR` | Erreur inconnue | ✅ |

### Stratégie de Retry

```typescript
Tentative 1: Immédiate
Tentative 2: Après 2s
Tentative 3: Après 4s
Tentative 4: Après 8s
→ Échec final si toutes échouent
```

---

## 📊 Logging & Monitoring

### Niveaux de Log

- **DEBUG**: Détails techniques (patterns trouvés, cookies, etc.)
- **INFO**: Événements importants (auth réussie, item sauvegardé)
- **WARN**: Avertissements (version imprimable échouée, rangs génériques)
- **ERROR**: Erreurs (échec extraction, erreur DB)

### Format de Log

```
🔍 [2025-11-14T10:30:45.123Z] EDN-COMPLETE Authentification CAS réussie
📋 [2025-11-14T10:30:47.456Z] EDN-COMPLETE Item 5: 12 connaissances rang A, 8 connaissances rang B
⚠️ [2025-11-14T10:30:48.789Z] EDN-COMPLETE Item 5 a des warnings
```

### Métriques Clés à Monitorer

- **Taux de succès** (`successRate`)
- **Temps moyen par item** (`averageProcessingTime`)
- **Nombre d'erreurs** (`totalErrors`)
- **Score de qualité moyen** (via metadata)

---

## 🧪 Tests

### Tests Unitaires

Fichier: `test.ts`

```typescript
// Test extraction intitulé
Deno.test("extractIntitule should extract title", () => {
  const html = '<h1>Item 1 - Cardiologie</h1>';
  const result = extractIntitule(html, 1);
  assertEquals(result, "Cardiologie");
});

// Test validation
Deno.test("validateEdnItem should score correctly", () => {
  const item = { ... };
  const result = validateEdnItem(item);
  assert(result.score >= 0 && result.score <= 100);
});
```

### Tests d'Intégration

```bash
# Test avec credentials en dur
curl -X POST https://[PROJECT].supabase.co/functions/v1/extract-edn-uness-complete \
  -H 'Content-Type: application/json' \
  -d '{"action": "test", "maxItems": 1}'
```

---

## 🚀 Déploiement

### Prérequis

- Supabase CLI installé
- Projet Supabase configuré
- Credentials UNESS valides

### Déploiement

```bash
# 1. Login Supabase
supabase login

# 2. Link au projet
supabase link --project-ref [PROJECT_REF]

# 3. Déployer la fonction
supabase functions deploy extract-edn-uness-complete

# 4. Set env variables
supabase secrets set UNES_EMAIL=user@uness.fr
supabase secrets set UNES_PASSWORD=password
```

### Vérification

```bash
# Tester la fonction
supabase functions invoke extract-edn-uness-complete \
  --data '{"action":"test","maxItems":1}'
```

---

## 🔍 Troubleshooting

### Problème: Authentification CAS échoue

**Symptômes**: Erreur `CAS_AUTH_FAILED`

**Solutions**:
1. Vérifier les credentials UNESS
2. Vérifier que le compte n'est pas bloqué
3. Tester la connexion manuelle sur auth.uness.fr
4. Vérifier les cookies (activer DEBUG)

### Problème: Aucun rang extrait

**Symptômes**: `warnings: "Aucun rang trouvé"`

**Solutions**:
1. Vérifier la structure HTML de la page (peut avoir changé)
2. Activer les logs DEBUG pour voir les patterns testés
3. Tester la version imprimable manuellement
4. Adapter les patterns `sectionPatterns` si nécessaire

### Problème: Timeouts fréquents

**Symptômes**: Erreurs après 30s

**Solutions**:
1. Augmenter `config.timeout`
2. Réduire `maxItems` par batch
3. Vérifier la connectivité réseau
4. Utiliser `action: "resume"` pour reprendre

### Problème: Score de qualité faible

**Symptômes**: `quality_score < 40`

**Solutions**:
1. Consulter les `warnings` pour détails
2. Vérifier manuellement l'item sur UNESS
3. Révision manuelle requise si rangs génériques
4. Adapter les patterns d'extraction

---

## 📝 Changelog

### v2.0 (2025-11-14)

- ✨ Types TypeScript enrichis avec enums
- ✨ Système de retry avec backoff exponentiel
- ✨ Validation et scoring de qualité
- ✨ Logging structuré avec Logger class
- ✨ Métriques détaillées (durée, taux succès)
- ✨ Patterns d'extraction améliorés
- ✨ Gestion d'erreurs personnalisée
- ✨ Configuration externalisée
- ✨ Documentation complète
- 🐛 Fix: Déduplication des rangs
- 🐛 Fix: Extraction intitulé plus robuste
- 🐛 Fix: Support tableaux pour rangs

### v1.0 (2025-01)

- 🎉 Version initiale

---

## 📞 Support

Pour toute question ou problème:

1. Consulter cette documentation
2. Vérifier les logs avec niveau DEBUG
3. Tester avec `action: "test"` et `maxItems: 1`
4. Ouvrir une issue sur le repository

---

## 📄 Licence

Propriétaire - Med-Mng Team © 2025
