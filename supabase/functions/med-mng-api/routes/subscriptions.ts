
import { corsHeaders, CreateSubscriptionRequest } from '../types.ts';

export async function handleSubscriptions(req: Request, supabase: any) {
  if (req.method === 'POST') {
    const { plan_id, gateway, subscription_id }: CreateSubscriptionRequest = await req.json();
    
    const { error } = await supabase.rpc('med_mng_create_user_sub', {
      plan_name: plan_id,
      gateway_name: gateway,
      subscription_id: subscription_id
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return null;
}
