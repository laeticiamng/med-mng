/**
 * openai-status — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Fonction sans source dans aucun dépôt. Seule référence : healthCheckServiceEnriched
 * d'EmotionsCare, que rien n'importe. Déployée (version 430, verify_jwt = true, sans effet contre
 * la clé publique qui est un JWT valide). Aucun appelant atteignable : ni page servie de MED MNG
 * ou d'EmotionsCare, ni autre fonction, ni tâche planifiée (cron.job), ni déclencheur ; aucun
 * appel dans les journaux des 24 h précédant le 05.10.2026.
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
