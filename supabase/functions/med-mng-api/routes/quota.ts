import { jsonResponse } from "../response.ts";


export async function handleQuota(req: Request, supabase: any, path: string) {
  // GET /quota - Get remaining quota
  if (path === '/quota' && req.method === 'GET') {
    const { data: quota, error } = await supabase.rpc('med_mng_get_remaining_quota');
    
    if (error) throw error;

    return jsonResponse({ remaining_credits: quota || 0 });
  }

  return null;
}
