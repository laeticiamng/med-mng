import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.58.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Version = 'A' | 'B' | 'A+B';

interface GenerateBody {
  item_id?: string | number; // ex: '001' ou 1
  item_code?: string;        // ex: 'IC-1'
  version: Version;
  maxRetries?: number;
  dryRun?: boolean;
}

interface ParsedCompetence {
  objectif_id: string;
  intitule: string | null;
  description: string | null;
  rang_code: string | null;
  ordre_num: number | null;
}

function toItemId3(item: string | number | undefined): string | null {
  if (item === undefined || item === null) return null;
  const n = typeof item === 'number' ? item : parseInt(String(item).replace(/\D/g, ''), 10);
  if (Number.isNaN(n)) return null;
  return String(n).padStart(3, '0');
}

function codeToItemId3(itemCode?: string): string | null {
  if (!itemCode) return null;
  const m = itemCode.match(/IC-(\d+)/i);
  if (!m) return null;
  return String(parseInt(m[1], 10)).padStart(3, '0');
}

function stripHtml(input: string): string {
  try {
    return input
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return input;
  }
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function buildSystemPrompt(version: Version) {
  return `Tu es un parolier pédagogique expert en médecine. Tu écris en français des chansons claires, exactes et mémorisables, avec assonances et inspiration Nekfeu (sans plagiat). Tu dois intégrer 100 % des compétences fournies et respecter strictement la structure : Couplet 1 / Refrain / Couplet 2 / Refrain / Couplet 3 / Refrain. Le texte doit être fluide : les « intitulés » définissent les attendus, les « descriptions » donnent les détails intégrés naturellement dans les vers. Aucune vulgarité. Version demandée: ${version}. Réponds EXCLUSIVEMENT en JSON compact conforme au schéma:
{
  "structure": {
    "couplet1": string[],
    "refrain1": string[],
    "couplet2": string[],
    "refrain2": string[],
    "couplet3": string[],
    "refrain3": string[]
  },
  "coverage": Array<{"objectif_id": string, "extrait": string}>
}`;
}

function buildUserPrompt(itemId: string, version: Version, competences: ParsedCompetence[]) {
  const list = competences.map(c => `• ${c.objectif_id} — Intitulé: ${c.intitule ?? ''} — Détails: ${stripHtml(c.description ?? '')}`).join('\n');
  return `Item = ${itemId}; Version = ${version}.
Compétences à intégrer (liste exhaustive, ne rien omettre):
${list}
Contraintes : fluidité parfaite, transitions naturelles, phrases suffisamment longues, figures de style, assonances ; progression clinique logique.
Structure imposée : C1 / R / C2 / R / C3 / R.
Objectif : l’auditeur vise 20/20 sur le rang ciblé après écoute.
Écris maintenant les paroles complètes.`;
}

function validateStructure(obj: unknown): obj is { structure: Record<string, string[]>; coverage: { objectif_id: string; extrait: string }[] } {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as any;
  const s = o.structure;
  if (!s) return false;
  const keys = ['couplet1','refrain1','couplet2','refrain2','couplet3','refrain3'];
  for (const k of keys) {
    if (!Array.isArray(s[k])) return false;
  }
  if (!Array.isArray(o.coverage)) return false;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { item_id, item_code, version, maxRetries = 1, dryRun = false } = (await req.json()) as GenerateBody;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing env vars: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY' }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const v: Version = version;
    const id3 = toItemId3(item_id ?? undefined) ?? codeToItemId3(item_code ?? undefined);
    if (!id3) {
      return new Response(JSON.stringify({ error: 'item_id / item_code invalide' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    // Récupération des compétences selon la version
    const rangFilter = v === 'A+B' ? ['A','B'] : [v];
    const { data: raw, error: fetchErr } = await supabase
      .from('v_competences_parsed')
      .select('objectif_id, intitule, description, rang_code, ordre_num')
      .eq('item_id', id3)
      .in('rang_code', rangFilter)
      .order('ordre_num', { ascending: true });

    if (fetchErr) {
      return new Response(JSON.stringify({ error: 'Erreur récupération compétences', details: fetchErr.message }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    const competences = (raw ?? []) as ParsedCompetence[];
    if (!competences.length) {
      return new Response(JSON.stringify({ error: 'Aucune compétence trouvée pour cet item/version' }), { status: 404, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    // Construction prompts
    const systemPrompt = buildSystemPrompt(v);
    const userPrompt = buildUserPrompt(id3, v, competences);

    const promptHash = await computeHash(systemPrompt + '\n' + userPrompt);

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    let attempt = 0;
    let parsed: any | null = null;
    let lastError: string | null = null;

    while (attempt <= Math.max(0, maxRetries)) {
      attempt++;
      try {
        const resp = await openai.chat.completions.create({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        });
        const content = resp.choices?.[0]?.message?.content ?? '';
        const text = typeof content === 'string' ? content : JSON.stringify(content);
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        const jsonText = jsonStart >= 0 && jsonEnd >= 0 ? text.slice(jsonStart, jsonEnd + 1) : text;
        const obj = JSON.parse(jsonText);
        if (!validateStructure(obj)) throw new Error('Structure JSON invalide');
        parsed = obj;
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: 'Génération invalide après retries', details: lastError }), { status: 422, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    // Calcul couverture (exige que chaque objectif_id soit présent)
    const objectifs = new Set(competences.map(c => c.objectif_id));
    const covered = new Set<string>();
    for (const c of parsed.coverage as { objectif_id: string; extrait: string }[]) {
      if (c?.objectif_id) covered.add(c.objectif_id);
    }
    const score = objectifs.size ? (covered.size / objectifs.size) : 0;

    const lignes: string[] = [
      ...parsed.structure.couplet1,
      ...parsed.structure.refrain1,
      ...parsed.structure.couplet2,
      ...parsed.structure.refrain2,
      ...parsed.structure.couplet3,
      ...parsed.structure.refrain3,
    ];

    const texteHash = computeHash(lignes.join('\n'));

    const payload = {
      item_id: id3,
      item_code: item_code ?? (id3 ? `IC-${parseInt(id3, 10)}` : null),
      version: v,
      texte: lignes,
      couverture_json: parsed.coverage,
      score_couverture: Math.round(score * 100),
      prompt_hash: promptHash,
      texte_hash: texteHash,
      valide: score === 1,
      metadata: { model: 'gpt-4.1-2025-04-14', attempt_count: attempt },
    } as const;

    if (dryRun) {
      return new Response(JSON.stringify({ dryRun: true, payload }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }

    // Upsert idempotent par (item_id, version, prompt_hash)
    const { data: existing } = await supabase
      .from('edn_lyrics_versions')
      .select('id')
      .eq('item_id', payload.item_id)
      .eq('version', payload.version)
      .eq('prompt_hash', payload.prompt_hash)
      .maybeSingle();

    let recordId = existing?.id as string | undefined;

    if (recordId) {
      const { data: updated, error: upErr } = await supabase
        .from('edn_lyrics_versions')
        .update({
          texte: payload.texte,
          couverture_json: payload.couverture_json,
          score_couverture: payload.score_couverture,
          texte_hash: payload.texte_hash,
          valide: payload.valide,
          metadata: payload.metadata,
          item_code: payload.item_code,
        })
        .eq('id', recordId)
        .select()
        .single();
      if (upErr) throw upErr;
      return new Response(JSON.stringify({ id: updated.id, updated: true, score: payload.score_couverture }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('edn_lyrics_versions')
        .insert({
          item_id: payload.item_id,
          item_code: payload.item_code,
          version: payload.version,
          texte: payload.texte,
          couverture_json: payload.couverture_json,
          score_couverture: payload.score_couverture,
          prompt_hash: payload.prompt_hash,
          texte_hash: payload.texte_hash,
          valide: payload.valide,
          metadata: payload.metadata,
        })
        .select()
        .single();
      if (insErr) throw insErr;
      recordId = inserted.id;
      return new Response(JSON.stringify({ id: recordId, created: true, score: payload.score_couverture }), { status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' } });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } });
  }
});
