/**
 * referentiel-uness-2026 — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Fonction à usage unique (application du référentiel LiSA 2026, commit 17935185) retirée du dépôt
 * le 18.09.2026 une fois son travail fait (commit 51f50730), mais restée déployée (version 6,
 * verify_jwt = false). Remplacée par mm-referentiel-lisa-2026 (jeton d'administration).
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
