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
        
        // Force regeneration for all items to get new format
        console.log(`🎼 Traitement item ${item.item_code}...`);

        // Generate three versions of lyrics
        const lyricsResult = await generateLyricsForItem(item, supabase);
        
        if (lyricsResult && (lyricsResult.rangA.length > 0 || lyricsResult.rangB.length > 0 || lyricsResult.mixed.length > 0)) {
          // Update the item with all three versions
          const { error: updateError } = await supabase
            .from('edn_items_complete')
            .update({ 
              paroles_rang_a: lyricsResult.rangA,
              paroles_rang_b: lyricsResult.rangB,
              paroles_rang_ab: lyricsResult.mixed,
              paroles_musicales: lyricsResult.mixed // Garder la compatibilité
            })
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

async function generateLyricsForItem(item: EdnItem, supabase: any): Promise<{ rangA: string[], rangB: string[], mixed: string[] }> {
  console.log(`🎵 Génération paroles pour ${item.item_code}: ${item.title}`);
  
  try {
    // Récupérer les compétences OIC spécifiques depuis la base
    const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
    
    const { data: competencesRangA } = await supabase
      .from('backup_oic_competences')
      .select('*')
      .eq('item_parent', itemNumber)
      .eq('rang', 'A')
      .order('ordre');
      
    const { data: competencesRangB } = await supabase
      .from('backup_oic_competences')
      .select('*')
      .eq('item_parent', itemNumber)
      .eq('rang', 'B')
      .order('ordre');

    // Générer les trois versions spécifiques
    const lyricsRangA = generateSpecificLyrics(item, competencesRangA || [], 'A');
    const lyricsRangB = generateSpecificLyrics(item, competencesRangB || [], 'B');
    const lyricsMixed = generateMixedLyrics(item, competencesRangA || [], competencesRangB || []);

    return {
      rangA: lyricsRangA,
      rangB: lyricsRangB,
      mixed: lyricsMixed
    };
    
  } catch (error) {
    console.error(`❌ Erreur génération paroles ${item.item_code}:`, error);
    return {
      rangA: [`Erreur génération pour ${item.item_code} rang A`],
      rangB: [`Erreur génération pour ${item.item_code} rang B`],
      mixed: [`Erreur génération pour ${item.item_code} mixte`]
    };
  }
}

// Générer des paroles spécifiques basées uniquement sur les compétences réelles
function generateSpecificLyrics(item: EdnItem, competences: any[], rang: 'A' | 'B'): string[] {
  const lyrics: string[] = [];
  const itemNumber = item.item_code.split('-')[1];
  
  // Extraire les concepts clés des compétences réelles
  const medicalConcepts = competences && competences.length > 0
    ? competences.slice(0, 8).map(comp => {
        const text = comp.intitule || comp.description || '';
        // Nettoyer et extraire les concepts médicaux
        return cleanMedicalConcept(text);
      }).filter(concept => concept.length > 0)
    : getDefaultMedicalConcepts(item, rang);

  // Assurer qu'on a au moins 8 concepts
  while (medicalConcepts.length < 8) {
    medicalConcepts.push(...getDefaultMedicalConcepts(item, rang));
  }
  
  const shortTitle = extractMedicalKeywords(item.title);
  
  // COUPLET 1 - Concepts médicaux spécifiques
  lyrics.push(
    medicalConcepts[0],
    medicalConcepts[1], 
    `Pour ${shortTitle} comprendre`,
    `Chaque détail bien apprendre`
  );
  
  // REFRAIN - Assonances médicales
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Diagnostic préciser`,
    `Traitement optimiser`, 
    `Excellence viser`
  );
  
  // COUPLET 2
  lyrics.push(
    medicalConcepts[2],
    medicalConcepts[3],
    `Sémiologie analyser`,
    `Pathologie identifier`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Diagnostic préciser`,
    `Traitement optimiser`,
    `Excellence viser`
  );
  
  // COUPLET 3
  lyrics.push(
    medicalConcepts[4],
    medicalConcepts[5],
    `Surveillance organiser`,
    `Évolution surveiller`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Diagnostic préciser`, 
    `Traitement optimiser`,
    `Excellence viser`
  );
  
  // COUPLET 4 FINAL
  lyrics.push(
    medicalConcepts[6],
    medicalConcepts[7],
    `Compétence développer`,
    `Expertise consolider`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Diagnostic préciser`,
    `Traitement optimiser`,
    `Excellence viser`
  );
  
  return lyrics;
}

// Générer des paroles mixtes combinant les compétences A et B
function generateMixedLyrics(item: EdnItem, competencesA: any[], competencesB: any[]): string[] {
  const lyrics: string[] = [];
  
  // Combiner les concepts des deux rangs
  const conceptsA = competencesA.slice(0, 4).map(comp => cleanMedicalConcept(comp.intitule || comp.description || ''));
  const conceptsB = competencesB.slice(0, 4).map(comp => cleanMedicalConcept(comp.intitule || comp.description || ''));
  
  const shortTitle = extractMedicalKeywords(item.title);
  
  // COUPLET 1 - Mix fondamental + expertise
  lyrics.push(
    conceptsA[0] || 'Connaissances fondamentales',
    conceptsB[0] || 'Expertise spécialisée',
    `${shortTitle} complet maîtriser`,
    `Formation globale finaliser`
  );
  
  // REFRAIN MIXTE
  lyrics.push(
    `${shortTitle} intégrer`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Maîtrise parfaite viser`
  );
  
  // COUPLET 2
  lyrics.push(
    conceptsA[1] || 'Diagnostic de base',
    conceptsB[1] || 'Analyse approfondie',
    `Approche complète adopter`,
    `Qualité optimiser`
  );
  
  lyrics.push(
    `${shortTitle} intégrer`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Maîtrise parfaite viser`
  );
  
  // COUPLET 3
  lyrics.push(
    conceptsA[2] || 'Traitement standard',
    conceptsB[2] || 'Prise en charge experte',
    `Soins personnaliser`,
    `Résultats optimiser`
  );
  
  lyrics.push(
    `${shortTitle} intégrer`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Maîtrise parfaite viser`
  );
  
  // COUPLET 4 FINAL
  lyrics.push(
    conceptsA[3] || 'Prévention essentielle',
    conceptsB[3] || 'Innovation thérapeutique',
    `Expertise complète acquérir`,
    `Excellence maintenir`
  );
  
  lyrics.push(
    `${shortTitle} intégrer`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Maîtrise parfaite viser`
  );
  
  return lyrics;
}

// Fonctions utilitaires pour nettoyer et extraire les concepts médicaux
function cleanMedicalConcept(text: string): string {
  if (!text) return '';
  
  // Nettoyer le texte et le raccourcir pour être facilement chantable
  let cleaned = text
    .replace(/[^\w\s-]/g, ' ') // Enlever la ponctuation
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
    
  // Garder seulement les 3-4 premiers mots pour la chanson
  const words = cleaned.split(' ').slice(0, 4);
  
  // Vérifier que ça finit par une sonorité qui se chante bien
  const lastWord = words[words.length - 1];
  if (lastWord && !lastWord.match(/(er|ir|é|ée|ie|tion|sion)$/)) {
    // Ajouter un suffixe chantable si nécessaire
    if (lastWord.endsWith('e')) {
      words[words.length - 1] = lastWord + 'r';
    } else {
      words.push('maîtriser');
    }
  }
  
  return words.join(' ');
}

function extractMedicalKeywords(title: string): string {
  // Extraire les mots clés médicaux du titre
  const medicalWords = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 2)
    .join(' ');
    
  return medicalWords || 'pathologie';
}

function getDefaultMedicalConcepts(item: EdnItem, rang: 'A' | 'B'): string[] {
  const itemNumber = item.item_code.split('-')[1];
  const keywords = extractMedicalKeywords(item.title);
  
  return [
    `${keywords} étudier`,
    `Physiopathologie analyser`,
    `Symptômes identifier`,
    `Diagnostic établir`,
    `Traitement choisir`,
    `Surveillance organiser`,
    `Complications prévenir`,
    `Pronostic évaluer`
  ];
}