import { corsHeaders, securityHeaders } from '../types.ts';
import { enforceDistributedRateLimit } from '../middleware/rateLimit.ts';
import { verifyItem } from './verify.ts';

export async function handleComplete(req: Request, supabase: any, path: string) {
  if (path.startsWith('/complete-item/') && req.method === 'POST') {
    const itemId = path.split('/')[2];
    const rateLimit = await enforceDistributedRateLimit(req, {
      action: 'med_mng_api.complete.item',
      maxRequests: Number(Deno.env.get('RATE_LIMIT_COMPLETE_ITEM_MAX_REQUESTS') ?? '6'),
      windowSeconds: Number(Deno.env.get('RATE_LIMIT_COMPLETE_ITEM_WINDOW_SECONDS') ?? '300'),
      defaultRetrySeconds: Number(Deno.env.get('RATE_LIMIT_COMPLETE_ITEM_RETRY_SECONDS') ?? '120'),
      context: { itemId },
    });

    if (rateLimit.blocked && rateLimit.response) {
      return rateLimit.response;
    }

    const report = await completeItem(supabase, itemId);
    return new Response(
      JSON.stringify(report),
      {
        headers: {
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'application/json',
          ...rateLimit.headers,
        },
      }
    );
  }

  if (path === '/complete-all' && req.method === 'POST') {
    const rateLimit = await enforceDistributedRateLimit(req, {
      action: 'med_mng_api.complete.bulk',
      maxRequests: Number(Deno.env.get('RATE_LIMIT_COMPLETE_BULK_MAX_REQUESTS') ?? '2'),
      windowSeconds: Number(Deno.env.get('RATE_LIMIT_COMPLETE_BULK_WINDOW_SECONDS') ?? '3600'),
      defaultRetrySeconds: Number(Deno.env.get('RATE_LIMIT_COMPLETE_BULK_RETRY_SECONDS') ?? '900'),
      context: { mode: 'bulk' },
    });

    if (rateLimit.blocked && rateLimit.response) {
      return rateLimit.response;
    }

    const { data: items, error } = await supabase
      .from('med_mng_items')
      .select('id');
    if (error) throw error;

    const results = [] as any[];
    for (const item of items) {
      results.push(await completeItem(supabase, item.id));
    }

    return new Response(
      JSON.stringify(results),
      {
        headers: {
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'application/json',
          ...rateLimit.headers,
        },
      }
    );
  }

  return null;
}

async function completeItem(supabase: any, itemId: string) {
  const initialReport = await verifyItem(supabase, itemId);
  const generated: string[] = [];

  if (!initialReport.checks.roman) {
    await generateRoman(supabase, itemId);
    generated.push('roman');
  }
  if (!initialReport.checks.comic_panels) {
    await generateComic(supabase, itemId);
    generated.push('comic');
  }
  if (!initialReport.checks.music) {
    await generateMusic(supabase, itemId);
    generated.push('music');
  }
  if (!initialReport.checks.quiz) {
    await generateQuiz(supabase, itemId);
    generated.push('quiz');
  }

  const finalReport = await verifyItem(supabase, itemId);
  return { item_id: itemId, generated, report: finalReport };
}

async function generateRoman(supabase: any, itemId: string) {
  const { data: item } = await supabase
    .from('med_mng_items')
    .select('item_number, title')
    .eq('id', itemId)
    .single();
  if (!item) return;
  const prompt = `Rédige un roman pédagogique complet pour l\'item ${item.item_number} : ${item.title}`;
  await callFunction('generate-content', {
    prompt,
    format: 'novel',
    item_code: item.item_number,
    content_type: 'novel'
  });
}

async function generateComic(supabase: any, itemId: string) {
  const { data: item } = await supabase
    .from('med_mng_items')
    .select('item_number, title')
    .eq('id', itemId)
    .single();
  if (!item) return;
  const prompt = `Bande dessinee medicale pour l\'item ${item.item_number} - ${item.title}`;
  await callFunction('generate-comic-images', {
    scene_description: prompt,
    item_code: `IC-${item.item_number}`
  });
}

async function generateMusicForErrors(supabase: any, itemId: string) {
  // Récupérer l'item et ses compétences OIC
  const { data: item } = await supabase
    .from('med_mng_items')
    .select('item_number, title')
    .eq('id', itemId)
    .single();
  
  if (!item) return;

  // Récupérer les compétences OIC pour des paroles plus riches
  const itemNumber = String(item.item_number).padStart(3, '0');
  const { data: oicCompetences } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, intitule, description, rang')
    .eq('item_parent', itemNumber)
    .order('ordre, rang');

  // Créer des paroles basées sur les compétences OIC
  const parolesFromOIC = oicCompetences && oicCompetences.length > 0 
    ? oicCompetences.slice(0, 3).map(c => 
        `${c.intitule} - rappel essentiel pour IC-${item.item_number}`
      )
    : [`Item ${item.item_number} - ${item.title} - révision importante`];

  await callFunction('generate-music', {
    lyrics: parolesFromOIC,
    style: 'educational',
    rang: 'revision',
    itemCode: `IC-${item.item_number}`,
    purpose: 'error_correction'
  });
}

async function generateQuiz(supabase: any, itemId: string) {
  const { data: item } = await supabase
    .from('med_mng_items')
    .select('item_number, title')
    .eq('id', itemId)
    .single();
  
  if (!item) return;

  // Récupérer les compétences OIC pour des quiz plus précis
  const itemNumber = String(item.item_number).padStart(3, '0');
  const { data: oicCompetences } = await supabase
    .from('backup_oic_competences')
    .select('objectif_id, intitule, description, rang')
    .eq('item_parent', itemNumber)
    .order('ordre, rang');

  const competenceContext = oicCompetences && oicCompetences.length > 0
    ? `\n\nCompétences OIC à couvrir:\n${oicCompetences.map(c => `- ${c.objectif_id}: ${c.intitule}`).join('\n')}`
    : '';

  const prompt = `Crée un quiz médical corrigé pour l'item ${item.item_number} - ${item.title}${competenceContext}`;
  
  await callFunction('generate-content', {
    prompt,
    format: 'quiz',
    item_code: item.item_number,
    content_type: 'quiz',
    oic_competences: oicCompetences || []
  });
}

async function callFunction(name: string, body: Record<string, unknown>) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRole) return;
  await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceRole}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}
