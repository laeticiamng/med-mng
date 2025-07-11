import { corsHeaders } from '../types.ts';

export async function handleVerify(req: Request, supabase: any, path: string) {
  // GET /verify-item/:id
  if (path.startsWith('/verify-item/') && req.method === 'GET') {
    const itemId = path.split('/')[2];
    const report = await verifyItem(supabase, itemId);
    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // GET /verify-all
  if (path === '/verify-all' && req.method === 'GET') {
    const { data: items, error } = await supabase
      .from('med_mng_items')
      .select('id');
    if (error) throw error;

    const results = [] as any[];
    for (const item of items) {
      results.push(await verifyItem(supabase, item.id));
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return null;
}

export async function verifyItem(supabase: any, itemId: string) {
  const checks: Record<string, boolean> = {};

  const { count: comicCount } = await supabase
    .from('comic_panels')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', itemId);
  checks.comic_panels = (comicCount || 0) > 0;

  const { count: novelCount } = await supabase
    .from('roman_versions')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', itemId);
  checks.roman = (novelCount || 0) > 0;

  const { count: musicCount } = await supabase
    .from('music_tracks')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', itemId);
  checks.music = (musicCount || 0) > 0;

  const { count: quizCount } = await supabase
    .from('quiz_questions')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', itemId);
  checks.quiz = (quizCount || 0) > 0;

  const isValid = Object.values(checks).every(Boolean);

  await supabase
    .from('med_mng_items')
    .update({ is_validated: isValid, last_checked_at: new Date().toISOString() })
    .eq('id', itemId);

  await supabase
    .from('audit_logs')
    .insert({ item_id: itemId, success: isValid, report: checks });

  return { item_id: itemId, is_validated: isValid, checks };
}
