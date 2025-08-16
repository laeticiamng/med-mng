import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationResult {
  processed: number;
  success: number;
  failed: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Démarrage génération RICHE pour tous les items EDN');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement manquantes');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { regenerateAll = false } = await req.json();

    // Récupérer tous les items EDN
    const { data: items, error } = await supabase
      .from('edn_items_complete')
      .select('item_code, title, paroles_rang_a, paroles_rang_b, paroles_rang_ab')
      .order('item_code');

    if (error) throw error;

    console.log(`📋 ${items?.length || 0} items trouvés`);

    let processed = 0;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Filtrer les items à traiter
    const itemsToProcess = regenerateAll 
      ? items
      : items.filter(item => 
          !item.paroles_rang_a?.length || 
          !item.paroles_rang_b?.length || 
          !item.paroles_rang_ab?.length
        );

    console.log(`🎯 ${itemsToProcess.length} items à traiter`);

    // Traitement séquentiel pour éviter les limites de rate
    for (const item of itemsToProcess) {
      try {
        console.log(`🎵 Traitement ${item.item_code}...`);
        
        const updates: any = { updated_at: new Date().toISOString() };

        // Générer uniquement ce qui manque ou tout si regenerateAll
        const needsA = regenerateAll || !item.paroles_rang_a?.length;
        const needsB = regenerateAll || !item.paroles_rang_b?.length;
        const needsAB = regenerateAll || !item.paroles_rang_ab?.length;

        if (needsA) {
          console.log(`  📝 Génération Rang A pour ${item.item_code}`);
          updates.paroles_rang_a = await generateRichLyrics(item.item_code, item.title, 'A', openAIApiKey, supabase);
        }

        if (needsB) {
          console.log(`  📝 Génération Rang B pour ${item.item_code}`);
          updates.paroles_rang_b = await generateRichLyrics(item.item_code, item.title, 'B', openAIApiKey, supabase);
        }

        if (needsAB) {
          console.log(`  📝 Génération Rang AB pour ${item.item_code}`);
          const lyricsAB = await generateRichLyrics(item.item_code, item.title, 'AB', openAIApiKey, supabase);
          updates.paroles_rang_ab = lyricsAB;
          updates.paroles_musicales = lyricsAB;
        }

        // Sauvegarder en base
        const { error: updateError } = await supabase
          .from('edn_items_complete')
          .update(updates)
          .eq('item_code', item.item_code);

        if (updateError) throw updateError;

        success++;
        console.log(`✅ ${item.item_code} traité avec succès`);

      } catch (e) {
        failed++;
        const errorMsg = `${item.item_code}: ${e.message}`;
        errors.push(errorMsg);
        console.error(`❌ Erreur pour ${item.item_code}:`, e);
      }

      processed++;

      // Pause entre chaque item pour respecter les limites
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const result: GenerationResult = {
      processed,
      success,
      failed,
      errors
    };

    console.log('🎉 Génération terminée:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur génération globale:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateRichLyrics(
  itemCode: string,
  title: string,
  rang: 'A' | 'B' | 'AB',
  openAIApiKey: string,
  supabase: any
): Promise<string[]> {
  
  // Récupérer les compétences OIC pour cet item
  const itemNum = itemCode.replace('IC-', '').padStart(3, '0');
  
  let competencesQuery = supabase
    .from('backup_oic_competences')
    .select('objectif_id, intitule, description, rang, rubrique')
    .eq('item_parent', itemNum)
    .not('description', 'is', null);
    
  if (rang !== 'AB') {
    competencesQuery = competencesQuery.eq('rang', rang);
  }
  
  const { data: competences } = await competencesQuery;
  
  const competencesText = competences?.map(c => 
    `- ${c.intitule}: ${c.description}`
  ).join('\n') || 'Aucune compétence spécifique trouvée.';

  const systemPrompt = `Tu es Nekfeu, rappeur expert en création de chansons médicales. Tu crées des paroles LONGUES et DENSES.

MISSION ABSOLUE: Créer une chanson RAP COMPLÈTE de MINIMUM 50 lignes pour ${itemCode} "${title}" rang ${rang}.

STYLE NEKFEU IMPOSÉ:
- Flow complexe avec rimes internes multiples
- Métaphores médicales sophistiquées 
- Assonances en -tion, -ation, -sion, -ment systématiques
- Allitérations médicales créatives
- Langage urbain moderne mélangé au vocabulaire médical
- Phrases longues avec césures rythmées

STRUCTURE EXIGÉE (MINIMUM 50 LIGNES):
[Intro] (3-4 lignes d'accroche forte)
[Couplet 1] (12 lignes - pathophysiologie détaillée)
[Refrain] (6 lignes - mémorisation des points clés)
[Couplet 2] (12 lignes - diagnostic complet et examens)
[Refrain] (6 lignes - répétition exacte)
[Couplet 3] (12 lignes - traitement et suivi thérapeutique)
[Pont] (6 lignes - complications et cas particuliers)
[Couplet 4] (10 lignes - pronostic et prévention)
[Outro] (4 lignes - synthèse mémorable)

CONTRAINTES ABSOLUES:
- MINIMUM 50 lignes de paroles (compter chaque ligne)
- Intégrer CHAQUE compétence médicale dans les paroles
- Rimes riches et assonances à chaque fin de ligne
- Métrique régulière adaptée au rap français
- Vocabulaire médical précis mais musical
- Style urbain authentique de Nekfeu

COMPÉTENCES MÉDICALES À INTÉGRER:
${competencesText}

IMPORTANT: Génère EXACTEMENT les paroles ligne par ligne, sans titre de section, MINIMUM 50 lignes.`;

  const userPrompt = `Crée IMMÉDIATEMENT la chanson RAP COMPLÈTE de MINIMUM 50 lignes pour ${itemCode} "${title}" rang ${rang}.

EXIGENCES STRICTES:
- MINIMUM 50 lignes de paroles (compte chaque ligne)
- Style Nekfeu avec flow complexe et rimes internes
- Intégrer TOUTES les compétences médicales listées
- Assonances systématiques en -tion, -ment, -eur
- Métaphores médicales créatives
- Langage urbain mélangé au vocabulaire médical

FORMT DE RÉPONSE EXIGÉ:
- Une ligne de paroles par ligne de texte
- Pas de titres de section ([Couplet], [Refrain], etc.)
- Juste les paroles pures, ligne par ligne
- MINIMUM 50 lignes obligatoire

COMMENCE MAINTENANT:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
        temperature: undefined // GPT-5 ne supporte pas temperature
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parser la réponse en lignes
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('**') && !line.startsWith('*')); // Supprimer markdown
    
    if (lines.length < 40) {
      throw new Error(`Réponse OpenAI trop courte: ${lines.length} lignes au lieu de minimum 40`);
    }
    
    return lines;
    
  } catch (error) {
    console.error(`❌ Erreur OpenAI pour ${itemCode}:`, error);
    throw error;
  }
}