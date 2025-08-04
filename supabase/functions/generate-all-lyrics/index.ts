import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  competences_oic_rang_a?: any[];
  competences_oic_rang_b?: any[];
  paroles_musicales?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎵 Démarrage génération paroles pour tous les items...');

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('📋 Récupération des items EDN...');

    // Fetch all EDN items that need lyrics
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_complete')
      .select(`
        id, item_code, title, 
        competences_oic_rang_a, competences_oic_rang_b,
        paroles_musicales
      `);

    if (itemsError) {
      console.error('❌ Erreur récupération items:', itemsError);
      throw new Error(`Erreur récupération items: ${itemsError.message}`);
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Aucun item EDN trouvé' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`📚 ${items.length} items trouvés`);

    let processed = 0;
    let success = 0;
    let errors = 0;

    // Process each item individually
    for (const item of items as EdnItem[]) {
      try {
        console.log(`🎼 Traitement item ${item.item_code}...`);
        
        // Skip if already has lyrics
        if (item.paroles_musicales && item.paroles_musicales.length > 0) {
          console.log(`⏭️  Item ${item.item_code} a déjà des paroles`);
          processed++;
          continue;
        }

        // Generate lyrics based on OIC competences
        const lyrics = generateLyricsForItem(item);
        
        if (lyrics && lyrics.length > 0) {
          // Update the item with new lyrics
          const { error: updateError } = await supabase
            .from('edn_items_complete')
            .update({ paroles_musicales: lyrics })
            .eq('id', item.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour ${item.item_code}:`, updateError);
            errors++;
          } else {
            console.log(`✅ Paroles générées pour ${item.item_code}`);
            success++;
          }
        } else {
          console.log(`⚠️  Aucunes paroles générées pour ${item.item_code}`);
          errors++;
        }
        
        processed++;
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (itemError) {
        console.error(`❌ Erreur item ${item.item_code}:`, itemError);
        errors++;
        processed++;
      }
    }

    const stats = {
      processed,
      success,
      errors,
      total: items.length
    };

    console.log('📊 Statistiques finales:', stats);

    return new Response(
      JSON.stringify({
        message: 'Génération des paroles terminée',
        stats
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de la génération des paroles',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateLyricsForItem(item: EdnItem): string[] {
  const lyrics: string[] = [];
  
  try {
    console.log(`🎵 Génération paroles pour ${item.item_code}: ${item.title}`);
    
    // Generate Rang A lyrics
    if (item.competences_oic_rang_a && item.competences_oic_rang_a.length > 0) {
      const rangALyrics = generateRangLyrics(item, 'A', item.competences_oic_rang_a);
      lyrics.push(...rangALyrics);
    }
    
    // Generate Rang B lyrics  
    if (item.competences_oic_rang_b && item.competences_oic_rang_b.length > 0) {
      const rangBLyrics = generateRangLyrics(item, 'B', item.competences_oic_rang_b);
      lyrics.push(...rangBLyrics);
    }
    
    // Generate combined lyrics if both exist
    if (item.competences_oic_rang_a?.length > 0 && item.competences_oic_rang_b?.length > 0) {
      const combinedLyrics = generateCombinedLyrics(item);
      lyrics.push(...combinedLyrics);
    }
    
    return lyrics;
    
  } catch (error) {
    console.error(`❌ Erreur génération paroles ${item.item_code}:`, error);
    return [];
  }
}

function generateRangLyrics(item: EdnItem, rang: 'A' | 'B', competences: any[]): string[] {
  const lyrics: string[] = [];
  
  const isRangA = rang === 'A';
  const itemNumber = item.item_code.split('-')[1];
  
  // Obtenir les compétences spécifiques (jusqu'à 8 pour 4 couplets)
  const specificCompetences = competences && competences.length > 0 
    ? competences.slice(0, 8).map(comp => {
        const intitule = comp.intitule || comp.description || 'Compétence médicale';
        return intitule.length > 50 ? intitule.substring(0, 50) + '...' : intitule;
      })
    : [
        `Sémiologie ${rang} pour item ${itemNumber}`,
        `Physiopathologie ${rang} détaillée`, 
        `Diagnostic ${rang} précis`,
        `Thérapeutique ${rang} adaptée`,
        `Surveillance ${rang} rigoureuse`,
        `Complications ${rang} à surveiller`,
        `Pronostic ${rang} à établir`,
        `Éducation ${rang} du patient`
      ];

  // Titre court de l'item
  const shortTitle = item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title;
  
  // COUPLET 1
  const couplet1 = `[Couplet 1 - Rang ${rang}]
${specificCompetences[0] || `Compétences ${rang} à maîtriser`}
${specificCompetences[1] || `Formation ${rang} à consolider`}
Pour l'item ${itemNumber} je vais étudier
Chaque notion ${rang} bien assimiler`;

  lyrics.push(couplet1);
  
  // REFRAIN (identique à chaque fois avec assonances)
  const refrain = `[Refrain - Item ${itemNumber} Rang ${rang}]
Item ${itemNumber} je vais réussir
Rang ${rang} pour mieux guérir
${shortTitle.substring(0, 25)}...
Médecine en musique convertir`;

  lyrics.push(refrain);
  
  // COUPLET 2
  const couplet2 = `[Couplet 2 - Rang ${rang}]
${specificCompetences[2] || `Diagnostic ${rang} approfondir`}
${specificCompetences[3] || `Traitement ${rang} à choisir`}
Les protocoles ${rang} respecter
Pour mes patients soigner`;

  lyrics.push(couplet2);
  lyrics.push(refrain); // Refrain après couplet 2
  
  // COUPLET 3  
  const couplet3 = `[Couplet 3 - Rang ${rang}]
${specificCompetences[4] || `Surveillance ${rang} continue`}
${specificCompetences[5] || `Évolution ${rang} suivre`}
Chaque signe ${rang} analyser
Pour le patient surveiller`;

  lyrics.push(couplet3);
  lyrics.push(refrain); // Refrain après couplet 3
  
  // COUPLET 4 (dernier)
  const couplet4 = `[Couplet 4 Final - Rang ${rang}]
${specificCompetences[6] || `Prévention ${rang} enseigner`}
${specificCompetences[7] || `Éducation ${rang} prodiguer`}
Item ${itemNumber} Rang ${rang} validé
Excellence médicale atteindre`;

  lyrics.push(couplet4);
  lyrics.push(refrain); // Refrain final
  
  return lyrics;
}

function generateCombinedLyrics(item: EdnItem): string[] {
  const lyrics: string[] = [];
  const itemNumber = item.item_code.split('-')[1];
  const shortTitle = item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title;
  
  // COUPLET 1 - Mix A+B
  const couplet1 = `[Couplet 1 - Mix A+B]
Rang A fondamentaux maîtriser
Rang B expertise développer
Item ${itemNumber} complet étudier
Double compétence acquérir`;

  lyrics.push(couplet1);
  
  // REFRAIN COMBINÉ (avec assonances)
  const refrain = `[Refrain Combiné A+B - Item ${itemNumber}]
A et B je vais unifier
${shortTitle.substring(0, 25)}... dominer
Formation complète finaliser
Excellence médicale rayonner`;

  lyrics.push(refrain);
  
  // COUPLET 2 - Mix A+B
  const couplet2 = `[Couplet 2 - Mix A+B]
Bases solides A consolider
Expertise B approfondir
Diagnostic complet élaborer
Thérapeutique optimiser`;

  lyrics.push(couplet2);
  lyrics.push(refrain);
  
  // COUPLET 3 - Mix A+B
  const couplet3 = `[Couplet 3 - Mix A+B]
Sémiologie A+B analyser
Physiopathologie intégrer
Surveillance complète assurer
Évolution globale surveiller`;

  lyrics.push(couplet3);
  lyrics.push(refrain);
  
  // COUPLET 4 FINAL - Mix A+B
  const couplet4 = `[Couplet 4 Final - Mix A+B]
Prévention A+B enseigner
Éducation globale prodiguer
Item ${itemNumber} A+B validé
Maîtrise complète atteindre`;

  lyrics.push(couplet4);
  lyrics.push(refrain);
  
  return lyrics;
}