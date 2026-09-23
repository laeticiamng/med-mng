import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

/**
 * Réserve une fonction aux administrateurs.
 *
 * Les fonctions d'extraction et de régénération du référentiel écrivent avec la
 * clé de service : sans ce contrôle, n'importe quel visiteur pouvait les
 * déclencher et réécrire le contenu pédagogique. Renvoie une réponse 401/403 à
 * retourner telle quelle, ou null si l'appelant est administrateur.
 */
export async function exigerAdmin(req: Request, cors: Record<string, string>): Promise<Response | null> {
  const refus = (status: number, error: string) =>
    new Response(JSON.stringify({ success: false, error }), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  const jeton = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jeton) return refus(401, 'Authentification requise');
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: u, error } = await sb.auth.getUser(jeton);
  if (error || !u?.user) return refus(401, 'Session invalide');
  const { data: role } = await sb.from('user_roles').select('role').eq('user_id', u.user.id).eq('role', 'admin').maybeSingle();
  if (!role) return refus(403, 'Réservé aux administrateurs');
  return null;
}
