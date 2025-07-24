import { jsonResponse, errorResponse } from "../response.ts";

import { CreateSubscriptionRequest } from '../types.ts';

export async function handleSubscriptions(req: Request, supabase: any) {
  if (req.method === 'POST') {
    const { plan_id, gateway, subscription_id }: CreateSubscriptionRequest = await req.json();

    if (!plan_id || !gateway) {
      return errorResponse(400, 'INVALID_REQUEST', 'plan_id and gateway required');
    }

    const { error } = await supabase.rpc('med_mng_create_user_sub', {
      plan_name: plan_id,
      gateway_name: gateway,
      subscription_id: subscription_id
    });

    if (error) throw error;

    return jsonResponse({ success: true });
  }

  return null;
}
