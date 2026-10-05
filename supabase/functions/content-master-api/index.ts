/**
 * content-master-api — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle : suivi de consultation et régénération de contenus (med_mng_content_master,
 * edn_items_immersive) avec la clé de service, corps lu avant l'authentification. Appelée
 * seulement par useContentMaster, qu'aucune page servie n'utilise.
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
