import { corsHeaders } from '../types.ts';
import { verifyItem } from './verify.ts';

export async function handleComplete(req: Request, supabase: any, path: string) {
  if (path.startsWith('/complete-item/') && req.method === 'POST') {
    const itemId = path.split('/')[2];
    const report = await completeItem(supabase, itemId);
    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (path === '/complete-all' && req.method === 'POST') {
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

async function generateMusic(supabase: any, itemId: string) {
  const { data: item } = await supabase
    .from('med_mng_items')
    .select('item_number')
    .eq('id', itemId)
    .single();
  if (!item) return;
  await callFunction('generate-music', {
    lyrics: `Item ${item.item_number}`,
    style: 'pop',
    rang: 'A',
    itemCode: `IC-${item.item_number}`
  });
}

async function generateQuiz(supabase: any, itemId: string) {
  const { data: item } = await supabase
    .from('med_mng_items')
    .select('item_number, title')
    .eq('id', itemId)
    .single();
  if (!item) return;
  const prompt = `Crée un quiz médical corrigé pour l\'item ${item.item_number} - ${item.title}`;
  await callFunction('generate-content', {
    prompt,
    format: 'quiz',
    item_code: item.item_number,
    content_type: 'quiz'
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
