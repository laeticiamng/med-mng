/**
 * compare-official-content — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle : comparait edn_items_uness et edn_items_immersive lus avec la clé de service, sans
 * compte. Appelée seulement par ComparisonResults, qu'aucune page servie n'affiche.
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
