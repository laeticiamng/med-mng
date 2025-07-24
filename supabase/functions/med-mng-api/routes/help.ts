import { corsHeaders, securityHeaders } from '../types.ts';

export async function handleHelp(
  req: Request,
  supabase: any | null,
  path: string,
  url: URL
) {
  // GET /help/onboarding
  // GET /onboarding-steps
  if (
    (path === '/help/onboarding' || path === '/onboarding-steps') &&
    req.method === 'GET'
  ) {
    const lang = url.searchParams.get('lang') || 'en';
    if (!supabase) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
    }

    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('id,key,title,body,type,version,is_active')
      .eq('is_active', true)
      .order('id');

    if (error) throw error;

    const steps = (data || []).map((row: any) => ({
      id: row.id,
      key: row.key,
      title: row.title?.[lang] ?? row.title?.en ?? '',
      body: row.body?.[lang] ?? row.body?.en ?? '',
      type: row.type,
      version: row.version,
      is_active: row.is_active,
    }));

    return new Response(JSON.stringify({ steps }), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }

  return null;
}
