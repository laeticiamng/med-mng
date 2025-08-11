import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  itemCode: string;
  rang: 'A' | 'B' | 'AB';
  language?: 'fr';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY manquant' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { itemCode, rang }: RequestBody = await req.json();
    if (!itemCode || !rang) {
      return new Response(JSON.stringify({ error: 'itemCode et rang requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Récupération de l'item et des compétences liées
    const { data: itemData } = await supabase
      .from('edn_items_complete')
      .select('item_code, title, tableau_rang_a, tableau_rang_b')
      .eq('item_code', itemCode)
      .maybeSingle();

    const itemNum = itemCode.replace('IC-', '').padStart(3, '0');
    let compQuery = supabase
      .from('oic_competences')
      .select('objectif_id,intitule,description,rang,rubrique,item_parent, ordre')
      .eq('item_parent', itemNum)
      .order('ordre', { ascending: true });
    if (rang !== 'AB') compQuery = compQuery.eq('rang', rang);
    const { data: competences } = await compQuery;

    // Construire le contenu source
    const source = {
      item: itemData || { item_code: itemCode, title: itemCode },
      competences: competences || [],
    };

    // Prompt de génération (français, style Nekfeu, longues phrases, assonances variées)
    const system = `Tu es un parolier médical expert. Tu écris des textes de rap poétiques en français,\navec une plume inspirée de Nekfeu (sans le copier), riches, techniques mais accessibles.\nContraintes: \n- Pas de rimes ni d'assonances répétées bêtement ligne à ligne, varie les sonorités.\n- Phrases longues, articulées, avec images et double sens, mais composition claire.\n- Intègre fidèlement les compétences médicales de l'item demandé (rang ${rang}).\n- Structure le texte en [Couplet 1], [Refrain], [Couplet 2], [Refrain], [Couplet 3]${rang==='AB' ? ', [Couplet 4]' : ''}, [Refrain Final].\n- Longueur: ${rang==='AB' ? '4500-5000' : '3500-4800'} caractères environ.\n- Langue: français uniquement.\nFormat de sortie STRICT (JSON): {\n  \"lines\": string[] // chaque élément est UNE ligne du texte, sections comprises entre crochets\n}`;

    const user = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Item: ${source.item.item_code} - ${source.item.title}\nRang: ${rang}\nRésumé tableaux: ${JSON.stringify({ A: source.item.tableau_rang_a?.sections?.length || 0, B: source.item.tableau_rang_b?.sections?.length || 0 })}\nCompétences (${source.competences.length}):\n${(source.competences as any[]).slice(0, 50).map(c => `- [${c.rang}] ${c.objectif_id} ${c.intitule}: ${c.description?.slice(0, 300) || ''}`).join('\n')}`
        }
      ]
    } as const;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        temperature: 0.85,
        messages: [
          { role: 'system', content: system },
          user
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('OpenAI error:', t);
      return new Response(JSON.stringify({ error: 'OpenAI error', details: t }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.warn('JSON parse failed, building fallback from text');
      const lines = String(content)
        .split(/\r?\n/) 
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);
      parsed = { lines };
    }

    // Nettoyage basique: enlever doublons consécutifs
    const lines: string[] = Array.isArray(parsed?.lines) ? parsed.lines : [];
    const cleaned: string[] = [];
    for (const l of lines) {
      if (!cleaned.length || cleaned[cleaned.length - 1].toLowerCase() !== l.toLowerCase()) cleaned.push(l);
    }

    return new Response(JSON.stringify({ lines: cleaned }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-lyrics-refined error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
