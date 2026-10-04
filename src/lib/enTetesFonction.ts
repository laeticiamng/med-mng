import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_ANON_KEY } from '@/lib/supabaseConstants';

/**
 * En-têtes d'un appel direct (fetch) à une fonction Edge, au nom de
 * l'utilisateur connecté : jeton de session, et non la clé publique.
 *
 * Revue critique du 04.10.2026 : les fonctions payantes (ai-tutor,
 * medical-ai-copilot-stream, generate-national-exam…) refusent désormais les
 * appels sans session (_shared/mm-garde.ts). Le tuteur IA, le copilote et
 * l'examen blanc envoyaient la clé publique : ils auraient tous reçu 401.
 * supabase.functions.invoke envoie déjà le jeton de session.
 */
export const enTetesFonction = async (): Promise<Record<string, string>> => {
  const { data } = await supabase.auth.getSession();
  const jeton = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${jeton ?? SUPABASE_ANON_KEY}`,
  };
};
