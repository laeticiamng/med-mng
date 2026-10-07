/**
 * Lit le refus renvoyé par delete-user-account. supabase-js range la réponse
 * non 2xx dans `error.context` (Response) : 409 `{ error: 'active_subscription',
 * message }` tant qu'un abonnement est prélevable, 503 `subscription_check_failed`
 * si Stripe n'a pas pu être vérifié. Renvoie null si le corps est illisible.
 */
export async function lireRefusSuppression(
  error: unknown,
): Promise<{ status: number; code: string | null; message: string } | null> {
  const contexte = (error as { context?: Response } | null)?.context;
  if (!contexte || typeof contexte.json !== 'function') return null;
  try {
    const corps = await (typeof contexte.clone === 'function' ? contexte.clone() : contexte).json();
    if (typeof corps?.message !== 'string' || corps.message.trim() === '') return null;
    return {
      status: typeof contexte.status === 'number' ? contexte.status : 0,
      code: typeof corps.error === 'string' ? corps.error : null,
      message: corps.message,
    };
  } catch {
    return null;
  }
}
