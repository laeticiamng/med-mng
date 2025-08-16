import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OicCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
  rubrique: string;
  rang: string;
  item_parent: string;
  ordre?: number;
  url_source?: string;
}

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  competences_oic_rang_a: any[];
  competences_oic_rang_b: any[];
  competences_count_rang_a: number;
  competences_count_rang_b: number;
  tableau_rang_a: any;
  tableau_rang_b: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    let errors = 0;
    const updateReport: any[] = [];

    // 2. Pour chaque item EDN, récupérer et synchroniser les compétences OIC
    for (const item of ednItems || []) {
      try {
        itemsProcessed++;
        
        // Extraire le numéro d'item (IC-1 -> 001, IC-10 -> 010)
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        
        console.log(`🔍 Traitement ${item.item_code} (${itemNumber})`);

        // Récupérer les compétences OIC Rang A
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
          .in('completion_status', ['completed', 'updated', 'verified_unchanged'])
          .order('ordre');

        if (errorA) {
          console.error(`❌ Erreur OIC Rang A pour ${item.item_code}:`, errorA);
        }

        // Récupérer les compétences OIC Rang B
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
          .in('completion_status', ['completed', 'updated', 'verified_unchanged'])
          .order('ordre');

        if (errorB) {
          console.error(`❌ Erreur OIC Rang B pour ${item.item_code}:`, errorB);
        }

        const competencesRangA = (oicRangA || []).filter(comp => 
          comp.objectif_id && comp.intitule && comp.description
        );

        const competencesRangB = (oicRangB || []).filter(comp => 
          comp.objectif_id && comp.intitule && comp.description
        );

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

        if (needsUpdate) {
          // Mettre à jour l'item EDN
          const { error: updateError } = await supabase
            .from('edn_items_complete')
            .update({
              competences_oic_rang_a: competencesRangA,
              competences_oic_rang_b: competencesRangB,
              competences_count_rang_a: competencesRangA.length,
              competences_count_rang_b: competencesRangB.length,
              competences_count_total: competencesRangA.length + competencesRangB.length,
              tableau_rang_a: tableauRangA,
              tableau_rang_b: tableauRangB,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour ${item.item_code}:`, updateError);
            errors++;
          } else {
            console.log(`✅ ${item.item_code} mis à jour: ${competencesRangA.length}A + ${competencesRangB.length}B`);
            itemsUpdated++;
            
            updateReport.push({
              item_code: item.item_code,
              rang_a_before: item.competences_count_rang_a,
              rang_a_after: competencesRangA.length,
              rang_b_before: item.competences_count_rang_b,
              rang_b_after: competencesRangB.length,
              updated: true
            });
          }
        } else {
          console.log(`⚪ ${item.item_code} déjà à jour: ${competencesRangA.length}A + ${competencesRangB.length}B`);
          updateReport.push({
            item_code: item.item_code,
            rang_a: competencesRangA.length,
            rang_b: competencesRangB.length,
            updated: false
          });
        }

        // Petite pause pour éviter la surcharge
        if (itemsProcessed % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Erreur traitement ${item.item_code}:`, error);
        errors++;
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      statistics: {
        items_processed: itemsProcessed,
        items_updated: itemsUpdated,
        items_unchanged: itemsProcessed - itemsUpdated - errors,
        errors: errors
      },
      update_report: updateReport.slice(0, 50) // Limiter le rapport pour éviter les réponses trop grandes
    };

    console.log('📊 SYNCHRONISATION TERMINÉE');
    console.log(`   - Items traités: ${itemsProcessed}`);
    console.log(`   - Items mis à jour: ${itemsUpdated}`);
    console.log(`   - Items inchangés: ${itemsProcessed - itemsUpdated - errors}`);
    console.log(`   - Erreurs: ${errors}`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur globale synchronisation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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