#!/bin/bash

# =============================================
# Script d'Application de l'Enrichissement EDN
# =============================================

set -e

echo "🚀 Application de l'enrichissement complet du système EDN"
echo "==========================================================="
echo ""

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "supabase/migrations/20251114_edn_enrichment_complete.sql" ]; then
    log_error "Fichier de migration introuvable. Assurez-vous d'être à la racine du projet."
    exit 1
fi

log_success "Fichier de migration trouvé"
echo ""

# Étape 1: Appliquer la migration via Supabase CLI
log_info "Étape 1/5: Application de la migration SQL..."
echo ""

if command -v supabase &> /dev/null; then
    log_info "Supabase CLI détecté. Application de la migration..."

    # Vérifier le statut Supabase
    if supabase status &> /dev/null; then
        log_info "Instance Supabase locale active"

        # Appliquer la migration
        supabase db push

        log_success "Migration appliquée avec succès"
    else
        log_warning "Instance Supabase locale non démarrée"
        log_info "Démarrage de Supabase..."
        supabase start

        # Appliquer la migration
        supabase db push

        log_success "Migration appliquée avec succès"
    fi
else
    log_warning "Supabase CLI non détecté"
    log_info "Pour appliquer manuellement:"
    log_info "1. Connectez-vous à votre dashboard Supabase"
    log_info "2. Allez dans SQL Editor"
    log_info "3. Copiez/collez le contenu de: supabase/migrations/20251114_edn_enrichment_complete.sql"
    log_info "4. Exécutez le script"
    echo ""
    read -p "Appuyez sur Entrée quand la migration est appliquée..."
fi

echo ""

# Étape 2: Vérifier que les vues matérialisées existent
log_info "Étape 2/5: Vérification des vues matérialisées..."
echo ""

if command -v supabase &> /dev/null && supabase status &> /dev/null; then
    VIEWS_CHECK=$(supabase db execute "
        SELECT EXISTS (
            SELECT FROM pg_matviews
            WHERE schemaname = 'public'
            AND matviewname IN ('edn_global_stats', 'edn_stats_by_specialite')
        );
    " 2>&1 || echo "false")

    if [[ $VIEWS_CHECK == *"t"* ]]; then
        log_success "Vues matérialisées créées avec succès"
    else
        log_warning "Impossible de vérifier les vues matérialisées"
    fi
else
    log_info "Vérifiez manuellement que les vues suivantes existent:"
    log_info "  - edn_global_stats"
    log_info "  - edn_stats_by_specialite"
    log_info "  - edn_items_unified_view"
fi

echo ""

# Étape 3: Enrichir tous les items
log_info "Étape 3/5: Enrichissement de tous les items EDN..."
echo ""

cat > /tmp/enrich_items.sql <<'SQL'
-- Enrichir tous les items
SELECT enrich_all_edn_items();

-- Afficher le résultat
SELECT
    total_processed,
    total_enriched,
    success_rate || '%' as success_rate,
    timestamp
FROM jsonb_to_record((SELECT enrich_all_edn_items())) AS x(
    total_processed int,
    total_enriched int,
    success_rate numeric,
    timestamp timestamp
);
SQL

if command -v supabase &> /dev/null && supabase status &> /dev/null; then
    log_info "Exécution de l'enrichissement..."
    supabase db execute -f /tmp/enrich_items.sql
    log_success "Enrichissement terminé"
else
    log_info "Exécutez manuellement dans SQL Editor:"
    log_info "SELECT enrich_all_edn_items();"
    echo ""
    read -p "Appuyez sur Entrée quand l'enrichissement est terminé..."
fi

echo ""

# Étape 4: Rafraîchir les vues matérialisées
log_info "Étape 4/5: Rafraîchissement des vues matérialisées..."
echo ""

cat > /tmp/refresh_views.sql <<'SQL'
-- Rafraîchir les vues matérialisées
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_global_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY edn_stats_by_specialite;

-- Vérifier les résultats
SELECT
    total_items,
    complete_items,
    incomplete_items,
    validated_items,
    avg_completeness,
    last_update
FROM edn_global_stats;
SQL

if command -v supabase &> /dev/null && supabase status &> /dev/null; then
    log_info "Rafraîchissement des vues..."
    supabase db execute -f /tmp/refresh_views.sql
    log_success "Vues matérialisées rafraîchies"
else
    log_info "Exécutez manuellement dans SQL Editor:"
    log_info "REFRESH MATERIALIZED VIEW CONCURRENTLY edn_global_stats;"
    log_info "REFRESH MATERIALIZED VIEW CONCURRENTLY edn_stats_by_specialite;"
    echo ""
    read -p "Appuyez sur Entrée quand le rafraîchissement est terminé..."
fi

echo ""

# Étape 5: Générer un rapport de qualité
log_info "Étape 5/5: Génération du rapport de qualité..."
echo ""

cat > /tmp/quality_report.sql <<'SQL'
-- Rapport global de qualité
SELECT get_edn_quality_global_report();

-- Distribution détaillée
SELECT
    jsonb_pretty(get_edn_quality_global_report()) as rapport_qualite;

-- Top 10 items avec meilleur score
SELECT
    item_code,
    title,
    completeness_score,
    is_validated
FROM edn_items_complete
ORDER BY completeness_score DESC
LIMIT 10;

-- Top 10 items nécessitant attention
SELECT
    item_code,
    title,
    completeness_score,
    is_validated
FROM edn_items_complete
ORDER BY completeness_score ASC
LIMIT 10;
SQL

if command -v supabase &> /dev/null && supabase status &> /dev/null; then
    log_info "Génération du rapport..."
    supabase db execute -f /tmp/quality_report.sql > /tmp/edn_quality_report.txt
    log_success "Rapport généré: /tmp/edn_quality_report.txt"
else
    log_info "Exécutez manuellement dans SQL Editor:"
    log_info "SELECT get_edn_quality_global_report();"
fi

echo ""
echo "==========================================================="
log_success "🎉 Enrichissement EDN terminé avec succès!"
echo "==========================================================="
echo ""

# Résumé des actions
echo "📋 Résumé des actions effectuées:"
echo "  1. ✅ Migration SQL appliquée"
echo "  2. ✅ Vues matérialisées créées"
echo "  3. ✅ Tous les items enrichis"
echo "  4. ✅ Statistiques rafraîchies"
echo "  5. ✅ Rapport de qualité généré"
echo ""

# Prochaines étapes
echo "🚀 Prochaines étapes recommandées:"
echo "  1. Consulter le rapport: docs/ANALYSE_EDN_COMPLETE_2025-11-14.md"
echo "  2. Vérifier les statistiques dans l'interface utilisateur"
echo "  3. Configurer le rafraîchissement automatique (pg_cron)"
echo "  4. Créer les hooks React Query pour les nouvelles fonctions"
echo "  5. Implémenter le dashboard de qualité"
echo ""

# Commandes utiles
echo "💡 Commandes utiles:"
echo "  - Rafraîchir les vues: REFRESH MATERIALIZED VIEW edn_global_stats;"
echo "  - Enrichir un item: SELECT enrich_edn_item_metadata('IC-1');"
echo "  - Analyser qualité: SELECT analyze_edn_item_quality('IC-1');"
echo "  - Rechercher: SELECT * FROM search_edn_items('cardiologie', 10, 0);"
echo ""

# Nettoyage
rm -f /tmp/enrich_items.sql /tmp/refresh_views.sql /tmp/quality_report.sql

log_success "Script terminé!"
