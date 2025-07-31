import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cookie, batchSize = 100 } = await req.json();
    
    if (!cookie) {
      return new Response(
        JSON.stringify({ error: 'Cookie CAS requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 Extraction complète des compétences OIC');
    console.log(`📦 Taille batch: ${batchSize}`);

    let offset = 0;
    let allCompetences = [];
    let hasMore = true;
    let batchNumber = 1;

    while (hasMore) {
      console.log(`📦 Batch ${batchNumber} - offset: ${offset}`);
      
      try {
        const url = new URL('https://livret.uness.fr/lisa/2025/api.php');
        url.searchParams.set('action', 'query');
        url.searchParams.set('list', 'categorymembers');
        url.searchParams.set('cmtitle', 'Catégorie:Objectif_de_connaissance');
        url.searchParams.set('cmlimit', batchSize.toString());
        url.searchParams.set('format', 'json');
        
        if (offset > 0) {
          url.searchParams.set('cmcontinue', offset.toString());
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (compatible; Supabase-OIC-Extractor/1.0)',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const members = data.query?.categorymembers || [];
        
        console.log(`✅ ${members.length} compétences récupérées`);
        
        if (members.length === 0) {
          hasMore = false;
          break;
        }

        // Traiter chaque compétence
        for (const member of members) {
          const competence = {
            objectif_id: member.title,
            pageid: member.pageid,
            title: member.title,
            timestamp: new Date().toISOString(),
            url: `https://livret.uness.fr/lisa/2025/${encodeURIComponent(member.title)}`
          };

          // Extraire détails OIC
          if (member.title.match(/^OIC-\d+/)) {
            const itemMatch = member.title.match(/^OIC-(\d+)/);
            if (itemMatch) {
              competence.item_parent = itemMatch[1].padStart(3, '0');
              competence.rang = 'A'; // Défaut
            }
          }

          allCompetences.push(competence);
        }

        // Vérifier continuation
        if (data.continue && data.continue.cmcontinue) {
          offset = data.continue.cmcontinue;
        } else {
          hasMore = false;
        }

        // Limite sécurité
        if (allCompetences.length > 10000) {
          console.log('⚠️  Limite sécurité atteinte (10k compétences)');
          hasMore = false;
        }

        batchNumber++;
        
        // Pause entre requêtes
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Erreur batch ${batchNumber}:`, error.message);
        hasMore = false;
      }
    }

    console.log(`🎯 EXTRACTION TERMINÉE: ${allCompetences.length} compétences`);

    // Statistiques
    const stats = {
      total: allCompetences.length,
      by_item: {}
    };

    allCompetences.forEach(comp => {
      if (comp.item_parent) {
        stats.by_item[comp.item_parent] = (stats.by_item[comp.item_parent] || 0) + 1;
      }
    });

    console.log('📊 STATISTIQUES:');
    console.log(`   Total: ${stats.total} compétences`);
    console.log(`   Items uniques: ${Object.keys(stats.by_item).length}`);

    const result = {
      success: true,
      metadata: {
        total_count: allCompetences.length,
        extracted_at: new Date().toISOString(),
        source: 'https://livret.uness.fr/lisa/2025/',
        extractor: 'Supabase Edge Function',
        batches_processed: batchNumber - 1
      },
      statistics: stats,
      competences: allCompetences
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur extraction:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});