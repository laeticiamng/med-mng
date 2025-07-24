import { corsHeaders, securityHeaders } from '../types.ts';

export async function handleOic(
  req: Request,
  supabase: any,
  path: string,
  url: URL,
) {
  if (path === '/oic' && req.method === 'GET') {
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('oic_competences')
      .select('objectif_id,intitule,item_parent,rang,rubrique', { count: 'exact' })
      .order('objectif_id')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('OIC list error:', error);
      return new Response(JSON.stringify({ error: 'oic_list_error' }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ items: data || [], page, limit, totalCount: count || 0 }),
      { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (path.startsWith('/oic/') && req.method === 'GET') {
    const objectifId = path.split('/')[2];

    const { data, error } = await supabase
      .from('oic_competences')
      .select('*')
      .eq('objectif_id', objectifId)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'oic_not_found' }), {
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

