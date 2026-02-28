# Supabase Edge Functions — Inventaire & flux

Ce document centralise l'inventaire des Edge Functions actives et les fonctions supprimées/consolidées.

## 1) Fonctions actives

### Routeurs consolidés (architecture unifiée)
| Routeur | Rôle | Actions principales |
|---------|------|-------------------|
| `ai-audio` | Musique / Suno / streaming | `generate`, `get_status`, `upload_cover`, `extend`, `generate_lyrics`, `audio_processing` |
| `ai-core` | IA / OpenAI / tuteur | `chat`, `translate`, `generate_image` |
| `ai-content` | Contenu pédagogique | `generate_qcm`, `generate_clinical_case`, `generate_content` |
| `system` | Diagnostics / santé | `health`, `performance`, `analytics` |
| `webhooks` | Callbacks externes | `stripe`, `suno`, `resend` |

### Administration & API produit
- `admin-export` — Export de données admin
- `admin-quick-edit` — Édition rapide admin
- `advanced-search` — Recherche avancée
- `content-master-api` — API maître de contenu
- `items-completeness-api` — API complétude items
- `items-completeness-check` — Vérification complétude
- `med-mng-api` — API MED-MNG
- `pedagogical-content-api` — API contenu pédagogique
- `playlist-manager` — Gestion playlists
- `study-planner` — Planificateur d'étude

### IA / génération
- `ai-recommendations` — Recommandations IA
- `ai-tutor` — Tuteur IA
- `chat-with-ai` — Chat IA
- `contextual-ai-chat` — Chat contextuel
- `content-ai-generator` — Générateur de contenu IA
- `enhanced-contextual-chat` — Chat contextuel amélioré
- `generate-clinical-case` — Cas cliniques
- `generate-comic-images` — Images BD
- `generate-content` — Contenu générique
- `generate-image` — Images
- `generate-lyrics-from-oic` — Paroles depuis OIC
- `generate-qcm` — QCM
- `generate-recommendations` — Recommandations
- `generate-voice` — Voix
- `medical-chat-ai` — Chat médical
- `openai-chat` — Chat OpenAI
- `qcm-generator` — Générateur QCM
- `regenerate-all-oic-content` — Régénération contenu OIC
- `regenerate-oic-with-ai-check` — Régénération avec vérification IA
- `translate` — Traduction

### Extraction / EDN / OIC
- `auto-extract-oic` — ⚠️ DÉSACTIVÉ (dépendait de extract-edn-objectifs)
- `audit-edn-completeness` — Audit complétude EDN
- `compare-official-content` — Comparaison contenu officiel
- `complete-missing-competences` — Complétion compétences manquantes
- `check-item-competences` — Vérification compétences items
- `edn-tableaux-api` — API tableaux EDN
- `extract-ecos-uness` — Extraction ECOS UNESS
- `extract-edn-uness` — Extraction EDN UNESS
- `import-edn-data` — Import données EDN
- `secure-edn-extraction` — Extraction sécurisée EDN
- `transform-edn-sections` — Transformation sections EDN

### Musique / streaming
- `generate-music` — Génération musicale
- `lyrics-sync-manager` — Synchronisation paroles
- `music-generation` — Génération musique
- `music-generation-secure` — Génération sécurisée
- `music-metrics` — Métriques musique
- `secure-audio-stream` — Streaming audio sécurisé
- `secure-streaming-proxy` — Proxy streaming
- `spotify-ai-complete` — Spotify IA
- `suno-callback` — Callback Suno
- `suno-credits` — Crédits Suno
- `synchronized-lyrics` — Paroles synchronisées

### Paiements / abonnements
- `create-checkout` — Checkout Stripe (Standard/Pro/Premium, trial 7j)
- `customer-portal` — Portail client Stripe
- `stripe-webhook` — Webhook Stripe

### Analytics / quotas
- `analytics-aggregator` — Agrégation analytics
- `analytics-engine` — Moteur analytics
- `analytics-tracker` — Tracker analytics
- `ia-quota` — Quotas IA

### Monitoring / sécurité
- `audit-system` — Audit système
- `check-performance-degradation` — Vérification dégradation
- `check-recommendation-alerts` — Alertes recommandations
- `data-integrity-check` — Intégrité données
- `error-handling-service` — Service erreurs
- `error-logger` — Logger erreurs
- `generate-security-report` — Rapport sécurité
- `monitoring-alerts` — Alertes monitoring
- `security-metrics` — Métriques sécurité
- `security-scanner` — Scanner sécurité
- `send-accessibility-report` — Rapport accessibilité
- `send-scheduled-reports` — Rapports planifiés
- `send-security-alert` — Alerte sécurité

### Webhooks / intégrations
- `auth-webhook` — Webhook auth
- `resend-notification` — Notification Resend
- `resend-webhook` — Webhook Resend

### Divers / utilitaires
- `api-documentation` — Documentation API
- `cancel-ia-task` — Annulation tâche IA
- `collect-diagnostic-results` — Collecte diagnostics
- `ecos-api` — API ECOS
- `extraction-monitoring` — Monitoring extraction
- `send-emails` — Envoi emails
- `send-push-notification` — Push notifications
- `send-welcome-email` — Email bienvenue

### Utilitaires partagés
- `_shared` — Modules communs (CORS, alerting, cache, error-utils)
- `lib` — Librairies internes

---

## 2) Fonctions supprimées (36)

Ces fonctions ont été supprimées ou consolidées dans les routeurs unifiés :

| Fonction supprimée | Raison / Remplacement |
|---|---|
| `activate-simulation` | Supprimée (non utilisée) |
| `create-subscription-checkout` | → `create-checkout` |
| `ecos-enrich-ai` | Supprimée |
| `generate-cas-cookie` | Supprimée |
| `debug-oic-extraction` | Supprimée (debug) |
| `debug-uness-auth` | Supprimée (debug) |
| `edn-fix` | Supprimée |
| `shopify-webhook` | Supprimée |
| `test-batch-50` | Supprimée (test) |
| `test-cas-simple` | Supprimée (test) |
| `test-edn-extraction` | Supprimée (test) |
| `test-extraction-sample` | Supprimée (test) |
| `test-insertion-directe` | Supprimée (test) |
| `test-login` | Supprimée (test) |
| `test-oic-curl` | Supprimée (test) |
| `test-webhook` | Supprimée (test) |
| `extract-edn-objectifs` | Supprimée |
| `extract-edn-uness-auth` | → `extract-edn-uness` |
| `extract-edn-uness-complete` | → `extract-edn-uness` |
| `extract-edn-uness-production` | → `extract-edn-uness` |
| `unified-alerts` | → `monitoring-alerts` |
| `send-weekly-alerts-report` | → `send-scheduled-reports` |
| `process-ab-tests` | Supprimée |
| `get-rls-policies` | Supprimée |
| `openai-image` | → `ai-core` action `generate_image` |
| `generate-missing-content` | → `ai-content` |
| `sync-edn-tables` | Supprimée |
| `update-edn-unique-content` | Supprimée |
| `fix-oic-data-quality` | Supprimée |
| `google-sheets-webhook` | Supprimée |
| `music-status` | → `ai-audio` action `get_status` |
| `suno-extend-music` | → `ai-audio` action `extend` |
| `suno-generate-lyrics` | → `ai-audio` action `generate_lyrics` |
| `suno-audio-processing` | → `ai-audio` action `audio_processing` |
| `spotify-medical-docs` | Supprimée |
| `suno-upload-cover` | → `ai-audio` action `upload_cover` |

---

## 3) Flux standard (inputs / outputs / erreurs)

### Inputs
- **Méthodes** : `GET`/`POST`, avec support `OPTIONS` pour CORS
- **Headers** : `Authorization: Bearer <jwt>`, `Content-Type: application/json`
- **Body** : JSON structuré selon le domaine

### Outputs
- **Succès** : JSON avec statut `2xx`
- **Format** : `{ "status": "ok", ... }` ou `{ "data": ... }`

### Erreurs (format standard)
- **Statuts** : `400`, `401/403`, `404`, `410` (gone), `500`
- **Payload** : `{ "error": "CODE", "message": "Description" }`

### Standards techniques
- Deno `std@0.190.0`
- CORS via `_shared/cors.ts`
- Error handling via `_shared/error-utils.ts` (`getErrorMessage`)
- Stripe API `2025-08-27.basil`
