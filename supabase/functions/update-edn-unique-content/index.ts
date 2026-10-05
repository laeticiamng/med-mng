/**
 * update-edn-unique-content — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Fonction supprimée du dépôt MED MNG (registre _shared/deleted-functions.ts) mais restée déployée
 * (version 813, verify_jwt = false). Aucun appelant.
 *
 * Elle répond désormais 410 sans aucun appel en aval (ni base de données, ni fournisseur).
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { fonctionRetiree } from '../_shared/mm-garde.ts';

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return fonctionRetiree(corsHeaders, 'Cette fonctionnalité a été retirée.');
});
