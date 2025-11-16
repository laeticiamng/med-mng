#!/bin/bash
# Script de migration des fonctions Supabase vers apps/functions/
# Organisées par domaine métier

set -e

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Migration des fonctions Supabase...${NC}"

# Définir les catégories
declare -A categories=(
    # Auth
    ["auth-webhook"]="auth"
    ["generate-cas-cookie"]="auth"
    ["customer-portal"]="auth"

    # Analytics
    ["analytics-tracker"]="analytics"
    ["analytics-engine"]="analytics"
    ["analytics-aggregator"]="analytics"
    ["process-ab-tests"]="analytics"

    # Content / AI
    ["openai-chat"]="content"
    ["content-ai-generator"]="content"
    ["qcm-generator"]="content"
    ["chat-with-ai"]="content"
    ["contextual-ai-chat"]="content"
    ["enhanced-contextual-chat"]="content"
    ["ai-recommendations"]="content"
    ["ai-code-analysis"]="content"
    ["ai-visual-analysis"]="content"
    ["ai-notifications"]="content"
    ["pedagogical-content-api"]="content"
    ["content-master-api"]="content"

    # Extraction EDN/ECOS
    ["unified-extract"]="extraction"
    ["extract-edn-uness"]="extraction"
    ["extract-edn-uness-complete"]="extraction"
    ["extract-edn-uness-production"]="extraction"
    ["extract-edn-objectifs"]="extraction"
    ["extract-ecos-uness"]="extraction"
    ["secure-edn-extraction"]="extraction"
    ["auto-extract-oic"]="extraction"
    ["reimport-edn-complete"]="extraction"
    ["debug-uness-auth"]="extraction"
    ["test-extraction-sample"]="extraction"
    ["test-edn-extraction"]="extraction"
    ["test-batch-50"]="extraction"
    ["test-insertion-directe"]="extraction"
    ["test-cas-simple"]="extraction"
    ["test-oic-curl"]="extraction"

    # Webhooks
    ["stripe-webhook"]="webhooks"
    ["shopify-webhook"]="webhooks"
    ["github-quality-webhook"]="webhooks"
    ["resend-webhook"]="webhooks"
    ["google-sheets-webhook"]="webhooks"
    ["test-webhook"]="webhooks"

    # Security
    ["security-scanner"]="security"
    ["security-alerts"]="security"
    ["security-metrics"]="security"
    ["audit-system"]="security"
    ["send-security-alert"]="security"
    ["generate-security-report"]="security"
    ["weekly-security-report"]="security"
    ["extraction-monitoring"]="security"

    # Music
    ["generate-music"]="music"
    ["music-status"]="music"
    ["playlist-manager"]="music"
    ["synchronized-lyrics"]="music"
    ["spotify-medical-docs"]="music"
    ["music-generation-secure"]="music"

    # Admin
    ["admin-export"]="admin"
    ["admin-quick-edit"]="admin"
    ["api-documentation"]="admin"

    # Data processing
    ["data-integrity-check"]="data"
    ["audit-edn-completeness"]="data"
    ["items-completeness-api"]="data"
    ["items-completeness-check"]="data"
    ["check-item-competences"]="data"
    ["check-performance-degradation"]="data"
    ["check-recommendation-alerts"]="data"
    ["collect-diagnostic-results"]="data"
    ["sync-edn-tables"]="data"
    ["transform-edn-sections"]="data"
    ["complete-missing-competences"]="data"
    ["edn-tableaux-api"]="data"
    ["edn-fix"]="data"
    ["ecos-api"]="data"
    ["ecos-enrich-ai"]="data"
    ["fix-oic-data-quality"]="data"
    ["regenerate-oic-with-ai-check"]="data"
    ["regenerate-all-oic-content"]="data"
    ["update-edn-unique-content"]="data"
    ["debug-oic-extraction"]="data"
    ["compare-official-content"]="data"
    ["advanced-search"]="data"

    # Email & Alerts
    ["send-emails"]="email"
    ["send-weekly-alerts-report"]="email"
    ["send-accessibility-report"]="email"
    ["send-scheduled-pdf-reports"]="email"
    ["unified-alerts"]="email"

    # Test & Simulation
    ["activate-simulation"]="test"
    ["cancel-ia-task"]="test"

    # Images & Media
    ["generate-image"]="content"
    ["openai-image"]="content"
    ["generate-voice"]="content"

    # Errors & Logging
    ["error-logger"]="security"
    ["error-handling-service"]="security"

    # Payments
    ["create-subscription-checkout"]="webhooks"

    # Quality
    ["get-quality-history"]="security"
    ["get-rls-policies"]="security"

    # Proxy
    ["secure-streaming-proxy"]="security"

    # Med-MNG API
    ["med-mng-api"]="admin"

    # Translation
    ["translate"]="content"
)

# Créer les dossiers de destination s'ils n'existent pas
mkdir -p apps/functions/{auth,analytics,content,extraction,webhooks,security,music,admin,data,email,test}

# Migrer les fonctions
for func in supabase/functions/*/; do
    func_name=$(basename "$func")

    # Ignorer le dossier _shared
    if [ "$func_name" == "_shared" ]; then
        echo -e "${BLUE}⏭️  Skipping _shared${NC}"
        continue
    fi

    # Déterminer la catégorie
    category="${categories[$func_name]}"

    if [ -z "$category" ]; then
        echo -e "${BLUE}❓ $func_name -> extraction (default)${NC}"
        category="extraction"
    else
        echo -e "${GREEN}✅ $func_name -> $category${NC}"
    fi

    # Déplacer la fonction
    mv "supabase/functions/$func_name" "apps/functions/$category/"
done

echo -e "${GREEN}✨ Migration terminée !${NC}"
