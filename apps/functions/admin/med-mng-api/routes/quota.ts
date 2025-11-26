import { jsonResponse, errorResponse } from "../response.ts";

import { getErrorMessage } from '../../../_shared/error-utils.ts';
export async function handleQuota(req: Request, supabase: any, user: any, path: string) {
  console.log('🔍 handleQuota called with path:', path, 'method:', req.method);
  
  // GET /quota - Get remaining quota (RAPIDE, lecture seule)
  if (path === '/quota' && req.method === 'GET') {
    try {
      const { data: quotaData, error } = await supabase.rpc('get_music_quota', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error fetching quota:', error);
        return errorResponse(500, 'QUOTA_ERROR', 'Erreur lors de la récupération du quota');
      }

      console.log('📊 Quota data fetched:', quotaData);

      // La fonction RPC retourne un tableau avec un seul élément
      const quota = Array.isArray(quotaData) ? quotaData[0] : quotaData;

      console.log('📊 Quota processed:', quota);

      return jsonResponse({
        remaining_credits: quota?.remaining_credits || 0,
        total_credits: quota?.total_credits || 0,
        credits_used: quota?.credits_used_this_period || 0,
        can_generate: quota?.can_generate || false,
        last_reset_at: quota?.last_reset_at
      });
    } catch (error: unknown) {
      console.error('Quota fetch error:', error);
      return errorResponse(500, 'SERVER_ERROR', getErrorMessage(error));
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
      
    } catch (error: unknown) {
      console.error('Check and consume error:', error);
      return errorResponse(500, 'SERVER_ERROR', getErrorMessage(error));
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
    } catch (error: unknown) {
      console.error('Stats error:', error);
      return errorResponse(500, 'SERVER_ERROR', getErrorMessage(error));
    }
  }

  return null;
}
