
import { corsHeaders } from '../types.ts';

export async function handleQuota(req: Request, supabase: any, path: string) {
  // GET /quota - Get remaining quota
  if (path === '/quota' && req.method === 'GET') {
    const { data: quota, error } = await supabase.rpc('med_mng_get_remaining_quota');
    
    if (error) throw error;

    return new Response(
      JSON.stringify({ remaining_credits: quota || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return null;
}
