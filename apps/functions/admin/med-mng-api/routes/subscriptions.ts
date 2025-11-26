import { jsonResponse, errorResponse } from "../response.ts";
import { log } from '../logger.ts';

import { CreateSubscriptionRequest } from '../types.ts';

import { getErrorMessage } from '../../../_shared/error-utils.ts';
// ✅ SÉCURITÉ: Les subscriptions nécessitent authentification
export async function handleSubscriptions(req: Request, supabase: any, user?: any) {
  // ✅ SÉCURITÉ CRITIQUE: Vérifier authentification
  if (!user) {
    log('warn', 'Tentative de création subscription sans authentification');
    return errorResponse(401, 'AUTH_REQUIRED', 'Authentication required');
  }

  if (req.method === 'POST') {
    const { plan_id, gateway, subscription_id }: CreateSubscriptionRequest = await req.json();

    if (!plan_id || !gateway) {
      return errorResponse(400, 'INVALID_REQUEST', 'plan_id and gateway required');
    }

    // ✅ SÉCURITÉ: La fonction RPC utilise auth.uid() pour s'assurer que
    // l'utilisateur ne peut créer une subscription que pour lui-même
    const { error } = await supabase.rpc('med_mng_create_user_sub', {
      plan_name: plan_id,
      gateway_name: gateway,
      subscription_id: subscription_id
    });

    if (error) {
      log('error', 'Erreur création subscription', { error: getErrorMessage(error), user_id: user.id });
      throw error;
    }

    log('info', 'Subscription créée avec succès', {
      user_id: user.id,
      plan_id,
      gateway
    });

    return jsonResponse({ success: true });
  }

  return null;
}
