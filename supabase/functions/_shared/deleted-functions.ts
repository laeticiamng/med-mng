/**
 * Canonical registry of deleted/consolidated Edge Functions.
 * Source of truth — used by tests to verify 404/410 responses.
 *
 * Status:
 *   - "removed"    → endpoint fully deleted, expect 404
 *   - "deprecated" → endpoint still deployed but returns 410 Gone
 *   - "consolidated" → logic merged into a router, old endpoint removed (404)
 */

export interface DeletedFunction {
  name: string;
  status: "removed" | "deprecated" | "consolidated";
  replacement?: string;
  reason: string;
}

export const DELETED_FUNCTIONS: DeletedFunction[] = [
  // --- Supprimées (non utilisées / debug / test) ---
  { name: "activate-simulation", status: "removed", reason: "Non utilisée" },
  { name: "ecos-enrich-ai", status: "removed", reason: "Supprimée" },
  { name: "generate-cas-cookie", status: "removed", reason: "Supprimée" },
  { name: "debug-oic-extraction", status: "removed", reason: "Debug uniquement" },
  { name: "debug-uness-auth", status: "removed", reason: "Debug uniquement" },
  { name: "edn-fix", status: "removed", reason: "Supprimée" },
  { name: "shopify-webhook", status: "removed", reason: "Supprimée" },
  { name: "test-batch-50", status: "removed", reason: "Test uniquement" },
  { name: "test-cas-simple", status: "removed", reason: "Test uniquement" },
  { name: "test-edn-extraction", status: "removed", reason: "Test uniquement" },
  { name: "test-extraction-sample", status: "removed", reason: "Test uniquement" },
  { name: "test-insertion-directe", status: "removed", reason: "Test uniquement" },
  { name: "test-login", status: "removed", reason: "Test uniquement" },
  { name: "test-oic-curl", status: "removed", reason: "Test uniquement" },
  { name: "test-webhook", status: "removed", reason: "Test uniquement" },
  { name: "extract-edn-objectifs", status: "removed", reason: "Supprimée" },
  { name: "process-ab-tests", status: "removed", reason: "Supprimée" },
  { name: "get-rls-policies", status: "removed", reason: "Supprimée" },
  { name: "sync-edn-tables", status: "removed", reason: "Supprimée" },
  { name: "update-edn-unique-content", status: "removed", reason: "Supprimée" },
  { name: "fix-oic-data-quality", status: "removed", reason: "Supprimée" },
  { name: "google-sheets-webhook", status: "removed", reason: "Supprimée" },
  { name: "spotify-medical-docs", status: "removed", reason: "Supprimée" },
  { name: "generate-missing-content", status: "removed", reason: "Supprimée" },

  // --- Consolidées (logique migrée vers routeurs) ---
  { name: "create-subscription-checkout", status: "consolidated", replacement: "create-checkout", reason: "Remplacée par create-checkout" },
  { name: "extract-edn-uness-auth", status: "consolidated", replacement: "extract-edn-uness", reason: "Consolidée" },
  { name: "extract-edn-uness-complete", status: "consolidated", replacement: "extract-edn-uness", reason: "Consolidée" },
  { name: "extract-edn-uness-production", status: "consolidated", replacement: "extract-edn-uness", reason: "Consolidée" },
  { name: "unified-alerts", status: "consolidated", replacement: "monitoring-alerts", reason: "Consolidée" },
  { name: "send-weekly-alerts-report", status: "consolidated", replacement: "send-scheduled-reports", reason: "Consolidée" },
  { name: "openai-image", status: "consolidated", replacement: "ai-core (action: generate_image)", reason: "Consolidée dans ai-core" },
  { name: "music-status", status: "consolidated", replacement: "ai-audio (action: get_status)", reason: "Consolidée dans ai-audio" },
  { name: "suno-extend-music", status: "consolidated", replacement: "ai-audio (action: extend)", reason: "Consolidée dans ai-audio" },
  { name: "suno-generate-lyrics", status: "consolidated", replacement: "ai-audio (action: generate_lyrics)", reason: "Consolidée dans ai-audio" },
  { name: "suno-audio-processing", status: "consolidated", replacement: "ai-audio (action: audio_processing)", reason: "Consolidée dans ai-audio" },
  { name: "suno-upload-cover", status: "consolidated", replacement: "ai-audio (action: upload_cover)", reason: "Consolidée dans ai-audio" },

  // --- Dépréciées (retourne 410 Gone) ---
  { name: "auto-extract-oic", status: "deprecated", reason: "Dépendait de extract-edn-objectifs, retourne 410" },
];

/** Just the names, for quick lookups */
export const DELETED_FUNCTION_NAMES = DELETED_FUNCTIONS.map(f => f.name);
