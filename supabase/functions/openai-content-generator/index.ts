/**
 * openai-content-generator — fonctionnalité retirée (05.10.2026, vague sécurité F66).
 *
 * Fonction déployée sans source dans aucun dépôt (orpheline) et sans appelant
 * dans MED MNG ni EmotionsCare. Elle appelait OpenAI avec la clé de la
 * plateforme sans aucun contrôle de l'appelant (la clé publique suffisait).
 * Elle répond désormais 410 sans aucun appel en aval.
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
