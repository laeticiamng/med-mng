import { jsonResponse, errorResponse } from "../response.ts";

export async function handleSubscriptions(req: Request, supabase: any) {
  if (req.method === 'POST') {
    // SÉCURITÉ : cette route permettait à n'importe quel utilisateur connecté de
    // s'auto-attribuer un abonnement (plan_id arbitraire, jamais vérifié auprès de
    // Stripe/PayPal) via supabase.rpc('med_mng_create_user_sub', ...). Aucune page
    // du site n'appelle réellement cette route (vérifié dans le code source le
    // 2026-09-30). La création d'abonnement légitime passe uniquement par le
    // webhook Stripe vérifié (mm-stripe-webhook). Route désactivée définitivement ;
    // les privilèges EXECUTE sur la fonction ont aussi été révoqués en base pour
    // authenticated/anon (voir migration 20260930012534).
    return errorResponse(403, 'FORBIDDEN', 'La création d\'abonnement ne passe pas par cette route.');
  }

  return null;
}
