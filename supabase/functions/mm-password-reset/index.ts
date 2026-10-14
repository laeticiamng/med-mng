import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { creerHandler, dependancesReelles } from './handler.ts';

/**
 * Réinitialisation du mot de passe Med MNG (public : verify_jwt = false, l'appelant n'a pas de
 * session). Toute la logique et ses garde-fous sont dans handler.ts ; ce fichier ne fait que
 * brancher les vraies dépendances (client Supabase de service, Resend).
 */
const handler = creerHandler(
  dependancesReelles(() =>
    createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  ),
);

Deno.serve(handler);
