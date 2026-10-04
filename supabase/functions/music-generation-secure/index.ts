import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { fonctionRetiree } from '../_shared/mm-garde.ts';

/**
 * Ancienne génération Suno « sécurisée » — retirée (revue critique du 04.10.2026).
 *
 * CONSTAT : la fonction lançait une génération Suno pour tout utilisateur
 * connecté, sans contrôle d'abonnement (seul un quota générique, inopérant
 * avec ce client, était consulté) ; déployée avec verify_jwt = false. Aucun
 * écran ne l'appelle : la génération MED MNG passe par mm-generate-music
 * (abonnement Premium, 30 générations par mois, registre serveur). Ancien code :
 * `git show 183abe28:supabase/functions/music-generation-secure/index.ts`.
 */
serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return fonctionRetiree(
    corsHeaders,
    'La génération audio MED MNG passe par la fonction mm-generate-music (abonnement Premium, 30 générations par mois).',
  );
});
