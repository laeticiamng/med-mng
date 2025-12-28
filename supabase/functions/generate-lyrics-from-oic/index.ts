import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * 🎤 Génère les paroles musicales STYLE NEKFEU (Rang A, B, AB) pour tous les items
 * à partir des compétences OIC officielles (table oic_competences - 5606 entrées)
 * 
 * Style: Rap français conscient avec assonances, rimes riches et flow médical
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

    console.log('🎤 Génération paroles STYLE NEKFEU depuis OIC...', { itemCode, forceAll });

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

        // Générer les paroles STYLE NEKFEU
        const parolesRangA = generateNekfeuLyrics(item.item_code, item.title, competencesA, 'A');
        const parolesRangB = generateNekfeuLyrics(item.item_code, item.title, competencesB, 'B');
        const parolesRangAB = generateNekfeuMixedLyrics(item.item_code, item.title, competencesA, competencesB);

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

    console.log(`🎉 Génération NEKFEU terminée: ${updatedCount}/${processedCount} items mis à jour`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedCount} items mis à jour avec paroles STYLE NEKFEU`,
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
 * 🎤 Génère des paroles STYLE NEKFEU à partir des compétences OIC
 * Rap français conscient avec assonances, rimes riches et flow médical
 */
function generateNekfeuLyrics(
  itemCode: string, 
  title: string, 
  competences: any[], 
  rang: 'A' | 'B'
): string[] {
  const lyrics: string[] = [];
  const rangLabel = rang === 'A' ? 'Fondamentaux' : 'Expertise';
  const shortTitle = cleanForRap(title, 40);
  
  // Titre de la chanson
  lyrics.push(`CHANSON RANG ${rang} - "${shortTitle}"`);
  lyrics.push('');
  
  if (competences.length === 0) {
    // Fallback style Nekfeu si pas de compétences
    lyrics.push('[Couplet 1]');
    lyrics.push(`${itemCode} dans le game, je maîtrise le terrain`);
    lyrics.push(`Rang ${rang} validé, chaque concept est serein`);
    lyrics.push(`Formation médicale, flow qui reste vital`);
    lyrics.push(`Compétences acquises, résultat optimal`);
    lyrics.push('');
    lyrics.push('[Refrain]');
    lyrics.push(`${shortTitle}, c'est la base qu'on pose`);
    lyrics.push(`Chaque notion s'impose, jamais de pause`);
    lyrics.push(`Du diagnostic à la prise en charge`);
    lyrics.push(`On avance ensemble, on prend le large`);
  } else {
    // Couplet 1 - Premières compétences avec rimes
    lyrics.push('[Couplet 1]');
    const firstBatch = competences.slice(0, 4);
    firstBatch.forEach((comp, i) => {
      const line = createRapLine(comp.intitule, i);
      lyrics.push(line);
    });
    lyrics.push('');
    
    // Refrain avec le titre
    lyrics.push('[Refrain]');
    lyrics.push(`${shortTitle}, c'est l'objectif qu'on vise`);
    lyrics.push(`Rang ${rang} ${rangLabel}, expertise qui s'précise`);
    lyrics.push(`Chaque compétence compte, on les assemble`);
    lyrics.push(`Formation complète, ensemble on tremble`);
    lyrics.push('');
    
    // Couplet 2 - Compétences suivantes
    if (competences.length > 4) {
      lyrics.push('[Couplet 2]');
      const secondBatch = competences.slice(4, 8);
      secondBatch.forEach((comp, i) => {
        const line = createRapLine(comp.intitule, i + 4);
        lyrics.push(line);
      });
      lyrics.push('');
    }
    
    // Pont avec concepts clés
    lyrics.push('[Pont]');
    if (competences.length > 2) {
      const keyComp = competences[Math.floor(competences.length / 2)];
      const keyWords = extractKeywords(keyComp.intitule);
      lyrics.push(`${keyWords[0] || 'Diagnostic'} précis, jamais approximatif`);
      lyrics.push(`${keyWords[1] || 'Traitement'} adapté, résultat positif`);
      lyrics.push(`Prise en charge globale, approche holistique`);
      lyrics.push(`${itemCode} maîtrisé, c'est automatique`);
    } else {
      lyrics.push(`Chaque détail compte dans cette formation`);
      lyrics.push(`Du savoir à la pratique, c'est l'évolution`);
      lyrics.push(`Rang ${rang} validé, compétences en action`);
      lyrics.push(`${itemCode} c'est notre destination`);
    }
    lyrics.push('');
    
    // Outro
    lyrics.push('[Outro]');
    lyrics.push(`${itemCode} Rang ${rang}, mission accomplie`);
    lyrics.push(`${competences.length} compétences gravées, c'est la vie`);
    lyrics.push(`Excellence médicale, on continue le chemin`);
    lyrics.push(`Formation EDN, demain c'est certain`);
  }
  
  return lyrics;
}

/**
 * 🎤 Génère des paroles MIXTES A+B style Nekfeu
 */
function generateNekfeuMixedLyrics(
  itemCode: string, 
  title: string, 
  competencesA: any[], 
  competencesB: any[]
): string[] {
  const lyrics: string[] = [];
  const shortTitle = cleanForRap(title, 35);
  const totalComp = competencesA.length + competencesB.length;
  
  // Titre
  lyrics.push(`CHANSON FUSION A+B - "${shortTitle}"`);
  lyrics.push('');
  
  // Intro
  lyrics.push('[Intro]');
  lyrics.push(`${itemCode} version complète, A et B réunis`);
  lyrics.push(`Du fondamental à l'expertise, tout est dit`);
  lyrics.push(`${totalComp} compétences, un seul objectif`);
  lyrics.push(`Maîtrise totale, flow définitif`);
  lyrics.push('');
  
  // Partie Rang A
  lyrics.push('[Partie Rang A - Fondamentaux]');
  if (competencesA.length > 0) {
    competencesA.slice(0, 4).forEach((comp, i) => {
      lyrics.push(createRapLine(comp.intitule, i));
    });
  } else {
    lyrics.push(`Bases solides, fondations posées`);
    lyrics.push(`Concepts clés, parfaitement dosés`);
    lyrics.push(`Rang A validé, on peut avancer`);
    lyrics.push(`Vers l'expertise, prêt à s'envoler`);
  }
  lyrics.push('');
  
  // Transition/Pont
  lyrics.push('[Pont - Transition]');
  lyrics.push(`Rang A c'est fait, maintenant on passe au B`);
  lyrics.push(`L'expertise nous attend, faut pas hésiter`);
  lyrics.push(`Chaque niveau compte dans cette ascension`);
  lyrics.push(`${itemCode} complet, c'est notre mission`);
  lyrics.push('');
  
  // Partie Rang B
  lyrics.push('[Partie Rang B - Expertise]');
  if (competencesB.length > 0) {
    competencesB.slice(0, 4).forEach((comp, i) => {
      lyrics.push(createRapLine(comp.intitule, i));
    });
  } else {
    lyrics.push(`Niveau expert, on monte en puissance`);
    lyrics.push(`Cas complexes, on gère avec aisance`);
    lyrics.push(`Rang B maîtrisé, excellence atteinte`);
    lyrics.push(`Compétences avancées, plus aucune crainte`);
  }
  lyrics.push('');
  
  // Refrain final
  lyrics.push('[Refrain Final]');
  lyrics.push(`${shortTitle}, maîtrise complète`);
  lyrics.push(`A plus B égale excellence parfaite`);
  lyrics.push(`${totalComp} objectifs, tous validés`);
  lyrics.push(`Formation EDN, prêt pour les épreuves`);
  lyrics.push('');
  
  // Outro
  lyrics.push('[Outro]');
  lyrics.push(`${itemCode} A+B, c'est dans la poche`);
  lyrics.push(`Du diagnostic au traitement, rien qui cloche`);
  lyrics.push(`Excellence médicale gravée dans l'ADN`);
  lyrics.push(`Nekfeu style, formation EDN`);
  
  return lyrics;
}

/**
 * Crée une ligne de rap avec rimes/assonances à partir d'un intitulé de compétence
 */
function createRapLine(intitule: string, index: number): string {
  const clean = cleanForRap(intitule, 50);
  
  // Suffixes pour créer des rimes
  const rhymeSuffixes = [
    ", c'est la clé qu'on détient",
    ", maîtrise au quotidien",
    ", savoir essentiel",
    ", objectif réel",
    ", compétence acquise",
    ", expertise précise",
    ", diagnostic certain",
    ", traitement serein"
  ];
  
  // Préfixes pour varier le flow
  const flowPrefixes = [
    "",
    "On parle de ",
    "Focus sur ",
    "",
    "J'maîtrise ",
    "",
    "C'est ",
    ""
  ];
  
  const suffix = rhymeSuffixes[index % rhymeSuffixes.length];
  const prefix = flowPrefixes[index % flowPrefixes.length];
  
  // Si l'intitulé est court, on peut ajouter le suffixe
  if (clean.length < 35) {
    return `${prefix}${clean}${suffix}`;
  }
  
  // Sinon on retourne juste l'intitulé nettoyé
  return clean;
}

/**
 * Nettoie le texte pour le format rap
 */
function cleanForRap(text: string, maxLength: number = 50): string {
  let clean = text
    .replace(/[.,!?;:()]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/'/g, "'")
    .trim();
  
  // Première lettre en majuscule
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }
  
  // Tronquer si trop long
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
 * Extrait les mots-clés d'un intitulé
 */
function extractKeywords(text: string): string[] {
  const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'à', 'en', 'par', 'pour', 'avec', 'sans', 'sur', 'dans'];
  
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:()]/g, '')
    .split(' ')
    .filter(w => w.length > 3 && !stopWords.includes(w));
  
  // Retourner les 2-3 premiers mots significatifs, capitalisés
  return words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
}
