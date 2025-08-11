import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Rang = 'A' | 'B' | 'AB';

interface BulkBody {
  items?: string[];            // Facultatif: liste d'item_code à traiter (ex: ['IC-1','IC-2'])
  rang?: Rang | 'ALL';         // Par défaut 'ALL'
  limit?: number;              // Facultatif: limiter le nombre d'items
  dryRun?: boolean;            // Si true, ne pas écrire en BDD
  preserveIfBetter?: boolean;  // Si true (défaut), on n'écrase pas une version existante jugée meilleure
}


function buildSystemPrompt(rang: Rang) {
  return `Tu es un parolier médical expert. Tu écris des textes de rap poétiques en français,
avec une plume inspirée de Nekfeu (sans le copier), riches, techniques mais accessibles.
Contraintes: 
- Pas de rimes ni d'assonances répétées bêtement ligne à ligne, varie les sonorités.
- Phrases longues, articulées, avec images et double sens, mais composition claire.
- Intègre fidèlement les compétences médicales de l'item demandé (rang ${rang}).
- Structure le texte en [Couplet 1], [Refrain], [Couplet 2], [Refrain], [Couplet 3]${rang==='AB' ? ', [Couplet 4]' : ''}, [Refrain Final].
- Longueur: ${rang==='AB' ? '4500-5000' : '3500-4800'} caractères environ.
- Langue: français uniquement.
Format de sortie STRICT (JSON): {
  "lines": string[] // chaque élément est UNE ligne du texte, sections comprises entre crochets
}`;
}

// Évaluation simple de la qualité (préserve les bonnes versions)
function hasStructuredSections(lines?: string[]) {
  if (!Array.isArray(lines)) return false;
  const rx = /\[(Couplet|Refrain)/i;
  return lines.some((l) => rx.test(l));
}

function qualityScore(lines?: string[]) {
  if (!Array.isArray(lines)) return 0;
  const base = lines.length;
  const structure = hasStructuredSections(lines) ? 20 : 0;
  return base + structure;
}

function pickBetter(existing?: string[] | null, next?: string[] | null) {
  if (!existing || existing.length === 0) return next || undefined;
  if (!next || next.length === 0) return existing || undefined;
  const exScore = qualityScore(existing);
  const nxScore = qualityScore(next);
  return nxScore >= exScore ? next : existing;
}

async function generateForItem(openAIApiKey: string, itemCode: string, rang: Rang, supabase: ReturnType<typeof createClient>) {
  // Récupérer données item + compétences
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

  const system = buildSystemPrompt(rang);
  const user = {
    role: 'user',
    content: [
      {
        type: 'text',
        text: `Item: ${itemData?.item_code || itemCode} - ${itemData?.title || itemCode}\nRang: ${rang}\nRésumé tableaux: ${JSON.stringify({ A: itemData?.tableau_rang_a?.sections?.length || 0, B: itemData?.tableau_rang_b?.sections?.length || 0 })}\nCompétences (${competences?.length || 0}):\n${(competences as any[] | undefined)?.slice(0, 50).map(c => `- [${c.rang}] ${c.objectif_id} ${c.intitule}: ${c.description?.slice(0, 300) || ''}`).join('\n') || ''}`
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
        user as any
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error('OpenAI error:', t);
    throw new Error(`OpenAI error: ${t}`);
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    const lines = String(content)
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);
    parsed = { lines };
  }

  // Nettoyage basique
  const lines: string[] = Array.isArray(parsed?.lines) ? parsed.lines : [];
  const cleaned: string[] = [];
  for (const l of lines) {
    if (!cleaned.length || cleaned[cleaned.length - 1].toLowerCase() !== l.toLowerCase()) cleaned.push(l);
  }
  return cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY manquant' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    const body = (await req.json().catch(() => ({}))) as BulkBody;
    const rangMode = body.rang || 'ALL';

    // Déterminer la liste d'items à traiter
    let items: { item_code: string }[] = [];
    if (body.items && Array.isArray(body.items) && body.items.length) {
      items = body.items.map((ic) => ({ item_code: ic }));
    } else {
      const { data, error } = await admin
        .from('edn_items_complete')
        .select('item_code')
        .order('item_code');
      if (error) throw error;
      items = data || [];
    }

    if (body.limit && body.limit > 0) {
      items = items.slice(0, body.limit);
    }

    const summary = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const it of items) {
      summary.processed += 1;
      const code = it.item_code;
      try {
        const todo: Rang[] = rangMode === 'ALL' ? ['A', 'B', 'AB'] : [rangMode as Rang];

        const results: Record<Rang, string[] | undefined> = { A: undefined, B: undefined, AB: undefined } as any;
        for (const r of todo) {
          const lines = await generateForItem(OPENAI_API_KEY, code, r, admin);
          results[r] = lines;
        }

        if (!body.dryRun) {
          // Charger l'existant pour préserver la meilleure version si demandé
          const { data: existingRow } = await admin
            .from('edn_items_complete')
            .select('paroles_rang_a, paroles_rang_b, paroles_rang_ab, paroles_musicales')
            .eq('item_code', code)
            .maybeSingle();

          const preserve = body.preserveIfBetter !== false; // true par défaut
          const finalA = preserve ? pickBetter(existingRow?.paroles_rang_a as any, results.A || null) : (results.A || existingRow?.paroles_rang_a);
          const finalB = preserve ? pickBetter(existingRow?.paroles_rang_b as any, results.B || null) : (results.B || existingRow?.paroles_rang_b);
          const finalAB = preserve ? pickBetter(existingRow?.paroles_rang_ab as any, results.AB || null) : (results.AB || existingRow?.paroles_rang_ab);

          const update: Record<string, any> = {};
          if (finalA) update.paroles_rang_a = finalA;
          if (finalB) update.paroles_rang_b = finalB;
          if (finalAB) {
            update.paroles_rang_ab = finalAB;
            // Paroles musicales = meilleure version entre l'existant et AB
            const baseMus = preserve ? pickBetter(existingRow?.paroles_musicales as any, finalAB) : (finalAB || existingRow?.paroles_musicales);
            if (baseMus) update.paroles_musicales = baseMus;
          }
          update.updated_at = new Date().toISOString();

          const { error: upErr } = await admin
            .from('edn_items_complete')
            .update(update)
            .eq('item_code', code);
          if (upErr) throw upErr;
        }

        summary.success += 1;
      } catch (e) {
        console.error('Erreur item', code, e);
        summary.failed += 1;
        summary.errors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-lyrics-bulk error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
