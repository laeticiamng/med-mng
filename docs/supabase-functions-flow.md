# Supabase Edge Functions — Inventaire & flux

Ce document centralise :
- l’inventaire **complet** de `supabase/functions/*` (hors fichiers) ;
- une **validation logique métier** par domaine (attentes fonctionnelles) ;
- le **flux d’exécution** standard (inputs, outputs, erreurs).

## 1) Inventaire des fonctions

### Utilitaires partagés
- `_shared` — modules communs (CORS, alerting, cache, etc.).
- `lib` — librairies/utilitaires internes.

### Administration & API produit
- `admin-export`
- `admin-quick-edit`
- `advanced-search`
- `content-master-api`
- `items-completeness-api`
- `items-completeness-check`
- `med-mng-api`
- `pedagogical-content-api`
- `playlist-manager`
- `study-planner`

### IA / génération / assistance
- `ai-recommendations`
- `ai-tutor`
- `chat-with-ai`
- `contextual-ai-chat`
- `content-ai-generator`
- `enhanced-contextual-chat`
- `generate-clinical-case`
- `generate-comic-images`
- `generate-content`
- `generate-image`
- `generate-lyrics-from-oic`
- `generate-missing-content`
- `generate-qcm`
- `generate-recommendations`
- `generate-voice`
- `medical-chat-ai`
- `openai-chat`
- `openai-image`
- `qcm-generator`
- `regenerate-all-oic-content`
- `regenerate-oic-with-ai-check`
- `translate`

### Extraction / EDN / OIC / données médicales
- `auto-extract-oic`
- `audit-edn-completeness`
- `compare-official-content`
- `complete-missing-competences`
- `check-item-competences`
- `debug-oic-extraction`
- `edn-fix`
- `edn-tableaux-api`
- `extract-ecos-uness`
- `extract-edn-objectifs`
- `extract-edn-uness`
- `extract-edn-uness-auth`
- `extract-edn-uness-complete`
- `extract-edn-uness-production`
- `fix-oic-data-quality`
- `import-edn-data`
- `secure-edn-extraction`
- `sync-edn-tables`
- `transform-edn-sections`

### Musique / Suno / streaming
- `generate-music`
- `lyrics-sync-manager`
- `music-generation`
- `music-generation-secure`
- `music-metrics`
- `music-status`
- `secure-audio-stream`
- `secure-streaming-proxy`
- `spotify-ai-complete`
- `spotify-medical-docs`
- `suno-audio-processing`
- `suno-callback`
- `suno-credits`
- `suno-extend-music`
- `suno-generate-lyrics`
- `suno-upload-cover`
- `synchronized-lyrics`

### Analytics / quotas / expérimentation
- `analytics-aggregator`
- `analytics-engine`
- `analytics-tracker`
- `ia-quota`
- `process-ab-tests`

### Monitoring / sécurité / conformité
- `audit-system`
- `check-performance-degradation`
- `check-recommendation-alerts`
- `data-integrity-check`
- `error-handling-service`
- `error-logger`
- `generate-security-report`
- `get-rls-policies`
- `monitoring-alerts`
- `security-metrics`
- `security-scanner`
- `send-accessibility-report`
- `send-scheduled-reports`
- `send-security-alert`
- `send-weekly-alerts-report`
- `unified-alerts`

### Webhooks / paiements / intégrations externes
- `auth-webhook`
- `create-subscription-checkout`
- `customer-portal`
- `google-sheets-webhook`
- `resend-notification`
- `resend-webhook`
- `shopify-webhook`
- `stripe-webhook`

### Divers / utilitaires / opérations
- `activate-simulation`
- `api-documentation`
- `cancel-ia-task`
- `collect-diagnostic-results`
- `ecos-api`
- `ecos-enrich-ai`
- `extraction-monitoring`
- `generate-cas-cookie`
- `send-emails`
- `send-push-notification`
- `send-welcome-email`

### Tests & debug (fonctionnels)
- `test-batch-50`
- `test-cas-simple`
- `test-edn-extraction`
- `test-extraction-sample`
- `test-insertion-directe`
- `test-login`
- `test-oic-curl`
- `test-webhook`
- `debug-uness-auth`

## 2) Validation logique métier (résumé par domaine)

Cette validation s’appuie sur la **cohérence entre le nom de la fonction et son rôle** attendu (flux produit, contrats de données, intégrations externes). Les contrôles ci-dessous servent de checklist fonctionnelle à maintenir :

- **Paiements & abonnements** (`create-subscription-checkout`, `stripe-webhook`, `customer-portal`) :
  - création de session côté serveur ;
  - validation des signatures webhook ;
  - mise à jour des statuts d’abonnement côté Supabase.
- **Extraction EDN/OIC** (`extract-*`, `secure-edn-extraction`, `transform-edn-sections`, `sync-edn-tables`) :
  - authentification CAS/UNESS ;
  - parsing et mapping des sections ;
  - écriture atomique en base.
- **IA & génération** (`generate-*`, `ai-*`, `openai-*`, `lovable`) :
  - garde-fous sur la consommation de quota ;
  - gestion de la latence et des timeouts ;
  - persistance des outputs (ex. contenus générés).
- **Musique/Suno** (`suno-*`, `music-*`, `secure-audio-stream`) :
  - callbacks vérifiés et idempotents ;
  - stockage des métadonnées ;
  - streaming sécurisé (token/URL signée).
- **Monitoring & sécurité** (`security-*`, `monitoring-*`, `unified-alerts`) :
  - collecte d’anomalies ;
  - alerting multi‑canal ;
  - rapports périodiques.

## 3) Flux complet (inputs / outputs / erreurs)

### Inputs (requêtes)
- **Méthodes** : principalement `GET`/`POST`, avec support `OPTIONS` pour CORS.
- **Headers** :
  - `Authorization: Bearer <jwt>` pour les endpoints authentifiés.
  - `Content-Type: application/json` pour les payloads JSON.
- **Body** : JSON structuré selon le domaine (ex. payloads IA, webhooks Stripe/Suno, paramètres d’extraction).
- **Query params** : utilisés pour certains filtres (ex. analytics, admin export).

### Outputs (réponses)
- **Succès** : JSON (ou HTML pour `api-documentation`) avec statut `2xx`.
- **Exemples courants** :
  - `{ "status": "ok", ... }`
  - `{ "data": ... }`

### Erreurs (format standard recommandé)
- **Statuts** : `400` (requête invalide), `401/403` (auth), `404` (endpoint), `500` (erreur interne).
- **Payload type** : JSON homogène, ex. :
  ```json
  {
    "error": "ERROR_CODE",
    "message": "Description lisible",
    "details": "Contexte optionnel",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Cas particuliers** :
  - `stripe-webhook` / `shopify-webhook` exigent une vérification de signature ;
  - `suno-callback` attend des callbacks idempotents ;
  - `api-documentation` renvoie du HTML.
