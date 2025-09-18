import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { enforceRateLimit } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let rateLimitHeaders: Record<string, string> = {};

  try {
    const rateLimit = await enforceRateLimit(req, {
      action: 'edn.sync',
      maxRequests: Number(Deno.env.get('RATE_LIMIT_SYNC_MAX_REQUESTS') ?? '6'),
      windowSeconds: Number(Deno.env.get('RATE_LIMIT_SYNC_WINDOW_SECONDS') ?? String(60 * 30)),
      context: { function: 'sync-edn-content' }
    });

    if (!rateLimit.allowed && rateLimit.response) {
      const body = await rateLimit.response.text();
      return new Response(body, {
        status: rateLimit.response.status,
        headers: {
          ...corsHeaders,
          ...rateLimit.headers,
          'Retry-After': rateLimit.response.headers.get('Retry-After') ?? '300',
          'Content-Type': 'application/json'
        }
      });
    }

    rateLimitHeaders = rateLimit.headers;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 DÉMARRAGE SYNCHRONISATION EDN');

    // 1. Récupérer tous les items EDN
    const { data: ednItems, error: ednError } = await supabase
      .from('edn_items_complete')
      .select('id, item_code, title, competences_oic_rang_a, competences_oic_rang_b, competences_count_rang_a, competences_count_rang_b, tableau_rang_a, tableau_rang_b')
      .order('item_code');

    if (ednError) {
      throw new Error(`Erreur récupération EDN: ${ednError.message}`);
    }

    console.log(`📋 ${ednItems?.length || 0} items EDN trouvés`);

    let itemsProcessed = 0;
    let itemsUpdated = 0;
    let itemsUnchanged = 0;
    let errors = 0;
    const updateReport: any[] = [];
    const updatesPayload: any[] = [];

    // 2. Pour chaque item EDN, récupérer et synchroniser les compétences OIC
    for (const item of ednItems || []) {
      try {
        itemsProcessed++;
        
        // Extraire le numéro d'item (IC-1 -> 001, IC-10 -> 010)
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        
        console.log(`🔍 Traitement ${item.item_code} (${itemNumber})`);

        // Récupérer les compétences OIC Rang A triées par ordre
        const { data: oicRangA, error: errorA } = await supabase
          .from('backup_oic_competences')
          .select(`
            objectif_id,
            intitule,
            description,
            rubrique,
            rang,
            item_parent,
            ordre,
            url_source
          `)
          .eq('item_parent', itemNumber)
          .eq('rang', 'A')
          .in('completion_status', ['completed', 'updated', 'verified_unchanged', 'skipped_error'])
          .order('ordre', { ascending: true, nullsFirst: false });

        if (errorA) {
          console.error(`❌ Erreur OIC Rang A pour ${item.item_code}:`, errorA);
        }

        // Récupérer les compétences OIC Rang B triées par ordre
        const { data: oicRangB, error: errorB } = await supabase
          .from('backup_oic_competences')
          .select(`
            objectif_id,
            intitule,
            description,
            rubrique,
            rang,
            item_parent,
            ordre,
            url_source
          `)
          .eq('item_parent', itemNumber)
          .eq('rang', 'B')
          .in('completion_status', ['completed', 'updated', 'verified_unchanged', 'skipped_error'])
          .order('ordre', { ascending: true, nullsFirst: false });

        if (errorB) {
          console.error(`❌ Erreur OIC Rang B pour ${item.item_code}:`, errorB);
        }

        const competencesRangA = (oicRangA || [])
          .filter(comp => comp.objectif_id && comp.intitule && comp.description)
          .sort((a, b) => {
            // Tri par ordre en priorité
            if (a.ordre !== null && b.ordre !== null && a.ordre !== undefined && b.ordre !== undefined) {
              return a.ordre - b.ordre;
            }
            
            // Fallback : tri par numéro de séquence dans objectif_id
            const extractSeqNumber = (objectifId: string) => {
              const match = objectifId.match(/OIC-\d+-(\d+)-[AB]/);
              return match ? parseInt(match[1], 10) : 999999;
            };
            
            return extractSeqNumber(a.objectif_id) - extractSeqNumber(b.objectif_id);
          });

        const competencesRangB = (oicRangB || [])
          .filter(comp => comp.objectif_id && comp.intitule && comp.description)
          .sort((a, b) => {
            // Tri par ordre en priorité
            if (a.ordre !== null && b.ordre !== null && a.ordre !== undefined && b.ordre !== undefined) {
              return a.ordre - b.ordre;
            }
            
            // Fallback : tri par numéro de séquence dans objectif_id
            const extractSeqNumber = (objectifId: string) => {
              const match = objectifId.match(/OIC-\d+-(\d+)-[AB]/);
              return match ? parseInt(match[1], 10) : 999999;
            };
            
            return extractSeqNumber(a.objectif_id) - extractSeqNumber(b.objectif_id);
          });

        // Construire les tableaux structurés pour Rang A
        const tableauRangA = {
          title: `${item.item_code} Rang A - ${item.title}`,
          sections: competencesRangA.map((comp, index) => ({
            title: comp.intitule || `Compétence ${index + 1}`,
            content: comp.description || 'Description à compléter',
            keywords: extractKeywords(comp.intitule + ' ' + comp.description),
            competence_id: comp.objectif_id,
            rubrique: comp.rubrique,
            url_source: comp.url_source
          }))
        };

        // Construire les tableaux structurés pour Rang B
        const tableauRangB = {
          title: `${item.item_code} Rang B - Compétences approfondies`,
          sections: competencesRangB.map((comp, index) => ({
            title: comp.intitule || `Compétence avancée ${index + 1}`,
            content: comp.description || 'Description à compléter',
            keywords: extractKeywords(comp.intitule + ' ' + comp.description),
            competence_id: comp.objectif_id,
            rubrique: comp.rubrique,
            url_source: comp.url_source
          }))
        };

        // Vérifier si des mises à jour sont nécessaires
        const needsUpdate = (
          item.competences_count_rang_a !== competencesRangA.length ||
          item.competences_count_rang_b !== competencesRangB.length ||
          JSON.stringify(item.competences_oic_rang_a) !== JSON.stringify(competencesRangA) ||
          JSON.stringify(item.competences_oic_rang_b) !== JSON.stringify(competencesRangB)
        );

        const beforeCounts = {
          rang_a: item.competences_count_rang_a ?? 0,
          rang_b: item.competences_count_rang_b ?? 0,
          total: item.competences_count_total ??
            ((item.competences_count_rang_a ?? 0) + (item.competences_count_rang_b ?? 0))
        };

        const afterCounts = {
          rang_a: competencesRangA.length,
          rang_b: competencesRangB.length,
          total: competencesRangA.length + competencesRangB.length
        };

        const diffSummary = {
          before: beforeCounts,
          after: afterCounts,
          delta: {
            rang_a: afterCounts.rang_a - beforeCounts.rang_a,
            rang_b: afterCounts.rang_b - beforeCounts.rang_b,
            total: afterCounts.total - beforeCounts.total
          },
          changed: needsUpdate
        };

        if (needsUpdate) {
          console.log(`✅ ${item.item_code} marqué pour mise à jour: ${afterCounts.rang_a}A + ${afterCounts.rang_b}B`);
          updatesPayload.push({
            item_id: item.id,
            item_code: item.item_code,
            status: 'update',
            competences_rang_a: competencesRangA,
            competences_rang_b: competencesRangB,
            tableau_rang_a: tableauRangA,
            tableau_rang_b: tableauRangB,
            rang_a_count: afterCounts.rang_a,
            rang_b_count: afterCounts.rang_b,
            total_count: afterCounts.total,
            diff_summary: diffSummary
          });
          itemsUpdated++;
        } else {
          console.log(`⚪ ${item.item_code} déjà à jour: ${afterCounts.rang_a}A + ${afterCounts.rang_b}B`);
          updatesPayload.push({
            item_id: item.id,
            item_code: item.item_code,
            status: 'unchanged',
            diff_summary: diffSummary
          });
          itemsUnchanged++;
        }

        updateReport.push({
          item_code: item.item_code,
          before: beforeCounts,
          after: afterCounts,
          updated: needsUpdate
        });

        // Petite pause pour éviter la surcharge
        if (itemsProcessed % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Erreur traitement ${item.item_code}:`, error);
        errors++;
      }
    }

    const triggeredByHeader = req.headers.get('x-medmng-user');
    const triggeredBy = triggeredByHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(triggeredByHeader)
      ? triggeredByHeader
      : null;

    const { data: syncResult, error: syncError } = await supabase.rpc('apply_edn_sync', {
      payload: updatesPayload,
      source: 'sync-edn-content',
      triggered_by: triggeredBy
    });

    if (syncError) {
      console.error('❌ Erreur lors de l\'appel apply_edn_sync:', syncError);
      throw new Error(`Erreur application sync: ${syncError.message}`);
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      statistics: {
        items_processed: itemsProcessed,
        items_submitted: updatesPayload.length,
        items_updated: itemsUpdated,
        items_unchanged: itemsUnchanged,
        errors
      },
      run: syncResult,
      update_report: updateReport.slice(0, 50) // Limiter le rapport pour éviter les réponses trop grandes
    };

    console.log('📊 SYNCHRONISATION TERMINÉE');
    console.log(`   - Items traités: ${itemsProcessed}`);
    console.log(`   - Items soumis: ${updatesPayload.length}`);
    console.log(`   - Items à mettre à jour: ${itemsUpdated}`);
    console.log(`   - Items déjà alignés: ${itemsUnchanged}`);
    console.log(`   - Erreurs pré-traitement: ${errors}`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...rateLimitHeaders },
    });

  } catch (error) {
    console.error('❌ Erreur globale synchronisation:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...rateLimitHeaders },
    });
  }
});

// Fonction utilitaire pour extraire les mots-clés
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 10); // Limiter à 10 mots-clés
}