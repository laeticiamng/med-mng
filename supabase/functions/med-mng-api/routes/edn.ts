import { corsHeaders, securityHeaders } from '../types.ts';

export async function handleEdn(
  req: Request,
  supabase: any,
  path: string,
  url: URL,
) {
  if (path === '/edn' && req.method === 'GET') {
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('edn_items_immersive')
      .select('item_code,title,subtitle,slug', { count: 'exact' })
      .order('item_code')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('EDN list error:', error);
      return new Response(JSON.stringify({ error: 'edn_list_error' }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ items: data || [], page, limit, totalCount: count || 0 }),
      { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (path.startsWith('/edn/') && req.method === 'GET') {
    const slug = path.split('/')[2];

    const { data, error } = await supabase
      .from('edn_items_immersive')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'edn_not_found' }), {
        status: 404,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }

  return null;
}

