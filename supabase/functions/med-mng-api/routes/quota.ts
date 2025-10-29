import { jsonResponse, errorResponse } from "../response.ts";

export async function handleQuota(req: Request, supabase: any, path: string) {
  // Obtenir l'ID utilisateur
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return errorResponse(401, 'UNAUTHORIZED', 'Authentification requise');
  }
  
  // GET /quota - Get remaining quota (RAPIDE, lecture seule)
  if (path === '/quota' && req.method === 'GET') {
    try {
      const { data: quotaData, error } = await supabase.rpc('get_user_quota', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error fetching quota:', error);
        return errorResponse(500, 'QUOTA_ERROR', 'Erreur lors de la récupération du quota');
      }

      return jsonResponse({
        remaining_credits: quotaData.remaining_credits,
        total_credits: quotaData.total_credits,
        credits_used: quotaData.credits_used_this_period,
        can_generate: quotaData.can_generate,
        last_reset_at: quotaData.last_reset_at
      });
    } catch (error) {
      console.error('Quota fetch error:', error);
      return errorResponse(500, 'SERVER_ERROR', error.message);
    }
  }

  // POST /quota/check-and-consume - Vérifier ET consommer en une seule opération ATOMIQUE
  if (path === '/quota/check-and-consume' && req.method === 'POST') {
    try {
      const { 
        credits_required = 1,
        service_type = 'music_generation',
        operation_type = 'generate',
        request_details = {}
      } = await req.json();

      // Rate limiting par utilisateur
      const { data: rateLimitCheck } = await supabase.rpc('check_user_rate_limit', {
        p_user_id: user.id,
        p_endpoint: '/quota/check-and-consume',
        p_max_requests: 20, // Max 20 générations par fenêtre
        p_window_minutes: 5
      });

      if (!rateLimitCheck.allowed) {
        return jsonResponse({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: rateLimitCheck.message,
          retry_after_seconds: rateLimitCheck.retry_after_seconds
        }, 429);
      }

      // Consommation ATOMIQUE des crédits
      const { data: result, error } = await supabase.rpc('check_and_consume_credits', {
        p_user_id: user.id,
        p_credits_required: credits_required
      });
      
      if (error) {
        console.error('Credits consumption error:', error);
        return errorResponse(500, 'QUOTA_ERROR', 'Erreur lors de la consommation des crédits');
      }

      // Log l'usage (non-bloquant)
      if (result.success) {
        supabase.rpc('log_ia_usage', {
          p_service_type: service_type,
          p_operation_type: operation_type,
          p_credits_used: credits_required,
          p_request_details: request_details,
          p_response_status: 'success'
        }).then(() => {}).catch(err => console.error('Log usage error:', err));
      }

      return jsonResponse(result, result.success ? 200 : 402);
      
    } catch (error) {
      console.error('Check and consume error:', error);
      return errorResponse(500, 'SERVER_ERROR', error.message);
    }
  }

  // GET /quota/stats - Get generation statistics
  if (path === '/quota/stats' && req.method === 'GET') {
    try {
      const { data: stats, error } = await supabase.rpc('get_generation_stats', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Stats fetch error:', error);
        return errorResponse(500, 'STATS_ERROR', 'Erreur lors de la récupération des statistiques');
      }
      
      return jsonResponse(stats || {});
    } catch (error) {
      console.error('Stats error:', error);
      return errorResponse(500, 'SERVER_ERROR', error.message);
    }
  }

  return null;
}
