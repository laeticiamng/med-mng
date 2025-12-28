import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Génère les paroles musicales (Rang A, B, AB) pour tous les items
 * à partir des compétences OIC officielles (table oic_competences - 5606 entrées)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { itemCode, forceAll = false } = body;

    console.log('🎵 Génération paroles depuis OIC...', { itemCode, forceAll });

    // 1. Récupérer TOUTES les compétences OIC (table principale avec 5606 entrées)
    const { data: allOicCompetences, error: oicError } = await supabase
      .from('oic_competences')
      .select('item_parent, rang, objectif_id, intitule, description')
      .not('intitule', 'is', null);

    if (oicError) throw oicError;
    console.log(`📚 ${allOicCompetences?.length || 0} compétences OIC chargées`);

    // 2. Indexer les compétences par item_parent et rang
    const oicByItem = new Map<string, { A: any[], B: any[] }>();
    (allOicCompetences || []).forEach(comp => {
      if (!comp.intitule || comp.intitule.length < 10) return;
      
      const key = comp.item_parent;
      if (!oicByItem.has(key)) {
        oicByItem.set(key, { A: [], B: [] });
      }
      const itemData = oicByItem.get(key)!;
      if (comp.rang === 'A') itemData.A.push(comp);
      else if (comp.rang === 'B') itemData.B.push(comp);
    });

    // 3. Récupérer les items à traiter
    let query = supabase
      .from('edn_items_immersive')
      .select('id, item_code, title');
    
    if (itemCode) {
      query = query.eq('item_code', itemCode);
    } else if (!forceAll) {
      // Seulement ceux sans paroles
      query = query.or('paroles_rang_a.is.null,paroles_rang_b.is.null,paroles_rang_ab.is.null');
    }

    const { data: items, error: itemsError } = await query.order('item_code');
    if (itemsError) throw itemsError;

    console.log(`📋 ${items?.length || 0} items à traiter`);

    let processedCount = 0;
    let updatedCount = 0;
    const errors: any[] = [];
    const results: any[] = [];

    // 4. Traiter chaque item
    for (const item of items || []) {
      try {
        processedCount++;
        const itemNumber = item.item_code.replace('IC-', '').padStart(3, '0');
        
        const oicData = oicByItem.get(itemNumber) || { A: [], B: [] };
        const competencesA = oicData.A;
        const competencesB = oicData.B;

        console.log(`🔄 ${item.item_code}: ${competencesA.length} A, ${competencesB.length} B`);

        // Générer les paroles Rang A
        const parolesRangA = generateLyricsFromCompetences(
          item.item_code, 
          item.title, 
          competencesA, 
          'A'
        );

        // Générer les paroles Rang B
        const parolesRangB = generateLyricsFromCompetences(
          item.item_code, 
          item.title, 
          competencesB, 
          'B'
        );

        // Générer les paroles combinées A+B
        const parolesRangAB = generateMixedLyrics(
          item.item_code, 
          item.title, 
          competencesA, 
          competencesB
        );

        // Mettre à jour l'item
        const { error: updateError } = await supabase
          .from('edn_items_immersive')
          .update({
            paroles_musicales: parolesRangA,
            paroles_rang_a: parolesRangA,
            paroles_rang_b: parolesRangB,
            paroles_rang_ab: parolesRangAB,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (updateError) {
          errors.push({ item_code: item.item_code, error: updateError.message });
          console.error(`❌ ${item.item_code}: ${updateError.message}`);
        } else {
          updatedCount++;
          results.push({
            item_code: item.item_code,
            competences_a: competencesA.length,
            competences_b: competencesB.length,
            paroles_a_lines: parolesRangA.length,
            paroles_b_lines: parolesRangB.length,
            paroles_ab_lines: parolesRangAB.length
          });
        }

        if (processedCount % 20 === 0) {
          console.log(`✅ ${processedCount}/${items.length} items traités`);
        }

      } catch (itemError: any) {
        errors.push({ item_code: item.item_code, error: itemError.message });
        console.error(`❌ ${item.item_code}: ${itemError.message}`);
      }
    }

    console.log(`🎉 Génération terminée: ${updatedCount}/${processedCount} items mis à jour`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedCount} items mis à jour avec paroles OIC`,
        total_processed: processedCount,
        updated: updatedCount,
        errors_count: errors.length,
        errors: errors.slice(0, 10),
        sample_results: results.slice(0, 5)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('💥 Erreur génération:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Génère des paroles musicales à partir des compétences OIC réelles
 */
function generateLyricsFromCompetences(
  itemCode: string, 
  title: string, 
  competences: any[], 
  rang: 'A' | 'B'
): string[] {
  const lyrics: string[] = [];
  const rangLabel = rang === 'A' ? 'fondamental' : 'expert';
  const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
  
  // Intro
  lyrics.push(`[Intro - Rang ${rang}]`);
  lyrics.push(`${itemCode} ${shortTitle}`);
  lyrics.push(`Niveau ${rangLabel} à maîtriser`);
  lyrics.push('');
  
  if (competences.length === 0) {
    // Fallback si pas de compétences
    lyrics.push(`[Couplet 1]`);
    lyrics.push(`Item ${itemCode} Rang ${rang}`);
    lyrics.push(`Connaissances ${rangLabel}es à acquérir`);
    lyrics.push(`Formation médicale rigoureuse`);
    lyrics.push(`Compétences essentielles à retenir`);
    lyrics.push('');
    lyrics.push(`[Refrain]`);
    lyrics.push(`${itemCode} bien compris`);
    lyrics.push(`Rang ${rang} maîtrisé aujourd'hui`);
  } else {
    // Générer à partir des vraies compétences OIC
    competences.slice(0, 6).forEach((comp, index) => {
      lyrics.push(`[Couplet ${index + 1}]`);
      
      // Utiliser l'intitulé de la compétence
      const cleanIntitule = cleanText(comp.intitule, 60);
      lyrics.push(cleanIntitule);
      
      // Ajouter la description si disponible
      if (comp.description && comp.description.length > 20) {
        const descLines = extractKeyPoints(comp.description);
        descLines.forEach(line => lyrics.push(line));
      }
      
      // Refrain intermédiaire (tous les 2 couplets)
      if (index % 2 === 1 && index < competences.length - 1) {
        lyrics.push('');
        lyrics.push(`[Refrain]`);
        lyrics.push(`${itemCode} Rang ${rang} on avance`);
        lyrics.push(`Compétence par compétence`);
        lyrics.push('');
      } else {
        lyrics.push('');
      }
    });
  }
  
  // Outro
  lyrics.push(`[Outro]`);
  lyrics.push(`${itemCode} Rang ${rang} validé`);
  lyrics.push(`Compétences ${rangLabel}es acquises`);
  lyrics.push(`Excellence médicale atteinte`);
  
  return lyrics;
}

/**
 * Génère des paroles combinées A+B
 */
function generateMixedLyrics(
  itemCode: string, 
  title: string, 
  competencesA: any[], 
  competencesB: any[]
): string[] {
  const lyrics: string[] = [];
  const shortTitle = title.length > 40 ? title.substring(0, 40) + '...' : title;
  
  // Intro combinée
  lyrics.push(`[Intro - Fusion A+B]`);
  lyrics.push(`${itemCode} maîtrise complète`);
  lyrics.push(`Du fondamental à l'expertise`);
  lyrics.push(`${shortTitle}`);
  lyrics.push('');
  
  // Section Rang A
  lyrics.push(`[Partie Rang A - Fondamentaux]`);
  if (competencesA.length > 0) {
    competencesA.slice(0, 3).forEach(comp => {
      lyrics.push(cleanText(comp.intitule, 55));
    });
  } else {
    lyrics.push(`Bases solides ${itemCode}`);
    lyrics.push(`Connaissances fondamentales`);
  }
  lyrics.push('');
  
  // Transition
  lyrics.push(`[Pont]`);
  lyrics.push(`Rang A validé on passe au B`);
  lyrics.push(`L'expertise nous attend`);
  lyrics.push('');
  
  // Section Rang B
  lyrics.push(`[Partie Rang B - Expert]`);
  if (competencesB.length > 0) {
    competencesB.slice(0, 3).forEach(comp => {
      lyrics.push(cleanText(comp.intitule, 55));
    });
  } else {
    lyrics.push(`Expertise ${itemCode}`);
    lyrics.push(`Cas complexes maîtrisés`);
  }
  lyrics.push('');
  
  // Outro combiné
  lyrics.push(`[Outro Final]`);
  lyrics.push(`${itemCode} A+B validés`);
  lyrics.push(`${competencesA.length + competencesB.length} compétences intégrées`);
  lyrics.push(`Excellence EDN certifiée`);
  lyrics.push(`Musique et médecine associées`);
  
  return lyrics;
}

/**
 * Nettoie le texte pour les paroles
 */
function cleanText(text: string, maxLength: number = 60): string {
  let clean = text
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (clean.length > maxLength) {
    const words = clean.split(' ');
    clean = '';
    for (const word of words) {
      if ((clean + ' ' + word).length <= maxLength) {
        clean = clean ? clean + ' ' + word : word;
      } else {
        break;
      }
    }
  }
  
  return clean;
}

/**
 * Extrait les points clés d'une description
 */
function extractKeyPoints(description: string): string[] {
  const points: string[] = [];
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  const maxPoints = Math.min(2, sentences.length);
  for (let i = 0; i < maxPoints; i++) {
    const verse = cleanText(sentences[i], 55);
    if (verse.length > 15) {
      points.push(verse);
    }
  }
  
  return points;
}
