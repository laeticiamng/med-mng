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
  
  // Extraire les concepts clés des compétences réelles et créer des paroles chantables
  const medicalConcepts = competences && competences.length > 0
    ? competences.slice(0, 8).map(comp => {
        const text = comp.intitule || comp.description || '';
        return createSingableLyric(text);
      }).filter(concept => concept.length > 0)
    : getDefaultMedicalLyrics(item, rang);

  // Assurer qu'on a au moins 8 concepts
  while (medicalConcepts.length < 8) {
    medicalConcepts.push(...getDefaultMedicalLyrics(item, rang));
  }
  
  const shortTitle = extractKeywords(item.title);
  
  // COUPLET 1 - Concepts médicaux spécifiques
  lyrics.push(
    medicalConcepts[0] || `${shortTitle} étudier`,
    medicalConcepts[1] || `Compétences analyser`, 
    `Pour ${shortTitle} comprendre`,
    `Expertise développer`
  );
  
  // REFRAIN - Assonances médicales avec le titre
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Diagnostic préciser`,
    `Traitement optimiser`, 
    `Excellence viser`
  );
  
  // COUPLET 2
  lyrics.push(
    medicalConcepts[2] || `Sémiologie étudier`,
    medicalConcepts[3] || `Pathologie analyser`,
    `Signes cliniques observer`,
    `Syndrome identifier`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Diagnostic préciser`,
    `Traitement optimiser`,
    `Excellence viser`
  );
  
  // COUPLET 3
  lyrics.push(
    medicalConcepts[4] || `Thérapeutique choisir`,
    medicalConcepts[5] || `Surveillance organiser`,
    `Évolution surveiller`,
    `Pronostic évaluer`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Diagnostic préciser`, 
    `Traitement optimiser`,
    `Excellence viser`
  );
  
  // COUPLET 4 FINAL
  lyrics.push(
    medicalConcepts[6] || `Prévention enseigner`,
    medicalConcepts[7] || `Éducation prodiguer`,
    `Compétence acquérir`,
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
  const conceptsA = competencesA.slice(0, 4).map(comp => createSingableLyric(comp.intitule || comp.description || ''));
  const conceptsB = competencesB.slice(0, 4).map(comp => createSingableLyric(comp.intitule || comp.description || ''));
  
  const shortTitle = extractKeywords(item.title);
  
  // COUPLET 1 - Mix fondamental + expertise
  lyrics.push(
    conceptsA[0] || 'Bases fondamentales',
    conceptsB[0] || 'Expertise développer',
    `${shortTitle} intégrer`,
    `Formation compléter`
  );
  
  // REFRAIN MIXTE
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Expertise parfaire`
  );
  
  // COUPLET 2
  lyrics.push(
    conceptsA[1] || 'Diagnostic établir',
    conceptsB[1] || 'Analyse approfondie',
    `Approche globale adopter`,
    `Qualité améliorer`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Expertise parfaire`
  );
  
  // COUPLET 3
  lyrics.push(
    conceptsA[2] || 'Traitement adapter',
    conceptsB[2] || 'Prise en charge optimiser',
    `Soins personnaliser`,
    `Résultats améliorer`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Expertise parfaire`
  );
  
  // COUPLET 4 FINAL
  lyrics.push(
    conceptsA[3] || 'Prévention organiser',
    conceptsB[3] || 'Innovation développer',
    `Expertise complète`,
    `Excellence maintenir`
  );
  
  lyrics.push(
    `${shortTitle} maîtriser`,
    `Compétences développer`,
    `Excellence atteindre`,
    `Expertise parfaire`
  );
  
  return lyrics;
}

// Fonctions utilitaires pour créer des paroles chantables
function createSingableLyric(text: string): string {
  if (!text) return '';
  
  // Nettoyer et extraire les mots clés médicaux
  let cleaned = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^\w\s-]/g, ' ') // Enlever la ponctuation
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim()
    .toLowerCase();
    
  // Extraire les 2-3 mots les plus importants
  const words = cleaned.split(' ').filter(word => word.length > 3).slice(0, 3);
  
  if (words.length === 0) return '';
  
  // Créer une phrase chantable avec une terminaison en -er
  const concept = words.join(' ');
  
  // Ajouter un verbe chantable
  const verbs = ['maîtriser', 'analyser', 'étudier', 'comprendre', 'développer', 'organiser', 'surveiller', 'évaluer'];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  
  return `${concept} ${verb}`;
}

function extractKeywords(title: string): string {
  // Extraire les mots clés médicaux du titre (max 15 caractères)
  const medicalWords = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 2)
    .join(' ');
    
  return medicalWords.substring(0, 15) || 'pathologie';
}

function getDefaultMedicalLyrics(item: EdnItem, rang: 'A' | 'B'): string[] {
  const keywords = extractKeywords(item.title);
  
  return [
    `${keywords} étudier`,
    `Sémiologie analyser`,
    `Diagnostic établir`,
    `Traitement choisir`,
    `Surveillance organiser`,
    `Évolution surveiller`,
    `Prévention enseigner`,
    `Pronostic évaluer`
  ];
}