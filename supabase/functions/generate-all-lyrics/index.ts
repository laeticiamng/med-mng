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
  const niveau = isRangA ? 'fondamental' : 'expert';
  const emoji = isRangA ? '📚' : '🎯';
  
  // Intro verse
  const introVerse = `[Couplet 1 - Rang ${rang}]
Item ${item.item_code} je vais maîtriser
${item.title.substring(0, 50)}${item.title.length > 50 ? '...' : ''}
Niveau ${niveau} à développer
Les bases solides pour réussir`;

  lyrics.push(introVerse);
  
  // Refrain 
  const refrain = `[Refrain]
EDN ${item.item_code} chantons ensemble
Compétences Rang ${rang} qui se rassemblent
Pour l'examen on se prépare
Avec la musique tout devient plus claire`;

  lyrics.push(refrain);
  
  // Competences verse
  if (competences && competences.length > 0) {
    const firstCompetences = competences.slice(0, 3);
    const competenceLines = firstCompetences.map(comp => {
      const intitule = comp.intitule || comp.description || 'Compétence médicale';
      return intitule.substring(0, 40) + (intitule.length > 40 ? '...' : '');
    });
    
    const competenceVerse = `[Couplet 2 - Rang ${rang}]
${competenceLines[0] || 'Chaque concept je vais comprendre'}
${competenceLines[1] || 'Les définitions bien apprendre'}
${competenceLines[2] || 'Diagnostic et traitement savoir'}
Pour mes patients tout donner`;

    lyrics.push(competenceVerse);
  }
  
  // Final refrain
  const finalRefrain = `[Refrain Final]
Item ${item.item_code} Rang ${rang} validé
Connaissances solides intégrées
${isRangA ? 'Vers le rang B je vais progresser' : 'Expertise médicale maîtrisée'}
En musique médecine et réussite mélangées`;

  lyrics.push(finalRefrain);
  
  return lyrics;
}

function generateCombinedLyrics(item: EdnItem): string[] {
  const lyrics: string[] = [];
  
  // Combined version with both Rang A and B
  const combinedVerse = `[Couplet Combiné A+B]
${item.item_code} double expertise
Rang A et B tous maîtrisés
${item.title.substring(0, 40)}${item.title.length > 40 ? '...' : ''}
Formation complète assurée`;

  lyrics.push(combinedVerse);
  
  const combinedRefrain = `[Refrain A+B]
Du fondamental à l'expertise
${item.item_code} je maîtrise
Rang A et B en harmonie
Pour une médecine réussie`;

  lyrics.push(combinedRefrain);
  
  return lyrics;
}