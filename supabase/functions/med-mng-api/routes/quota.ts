import { jsonResponse } from "../response.ts";

export async function handleQuota(req: Request, supabase: any, path: string) {
  // GET /quota - Get remaining quota
  if (path === '/quota' && req.method === 'GET') {
    const { data: quota, error } = await supabase.rpc('med_mng_get_remaining_quota');
    
    if (error) throw error;

    return jsonResponse({ remaining_credits: quota || 0 });
  }

  // POST /quota/check - Check if user has enough credits for operation
  if (path === '/quota/check' && req.method === 'POST') {
    const { credits_required = 1 } = await req.json();
    
    const { data: currentQuota, error: quotaError } = await supabase.rpc('med_mng_get_remaining_quota');
    if (quotaError) throw quotaError;

    const hasEnoughCredits = (currentQuota || 0) >= credits_required;
    
    return jsonResponse({
      has_enough_credits: hasEnoughCredits,
      remaining_credits: currentQuota || 0,
      required_credits: credits_required,
      can_proceed: hasEnoughCredits
    });
  }

  // POST /quota/use - Use credits for an operation
  if (path === '/quota/use' && req.method === 'POST') {
    const { 
      credits_to_use = 1, 
      service_type = 'unknown',
      operation_type = 'unknown',
      request_details = {}
    } = await req.json();
    
    const { data: result, error } = await supabase.rpc('med_mng_decrement_quota', {
      credits_to_use
    });
    
    if (error) throw error;

    // Log l'usage
    if (result.success) {
      await supabase.rpc('log_ia_usage', {
        p_service_type: service_type,
        p_operation_type: operation_type,
        p_credits_used: credits_to_use,
        p_request_details: request_details,
        p_response_status: 'success'
      });
    } else {
      await supabase.rpc('log_ia_usage', {
        p_service_type: service_type,
        p_operation_type: operation_type,
        p_credits_used: 0,
        p_request_details: request_details,
        p_response_status: 'quota_exceeded',
        p_error_details: result.error
      });
    }
    
    return jsonResponse(result);
  }

  // GET /quota/stats - Get user usage statistics
  if (path === '/quota/stats' && req.method === 'GET') {
    const url = new URL(req.url);
    const periodDays = parseInt(url.searchParams.get('period') || '30');
    
    const { data: stats, error } = await supabase.rpc('get_user_ia_stats', {
      p_period_days: periodDays
    });
    
    if (error) throw error;
    
    return jsonResponse(stats || {});
  }

  return null;
}
