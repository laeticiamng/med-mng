/**
 * platform-analytics — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Orpheline d'origine MED MNG : code supprimé du dépôt mais toujours déployée (version 97,
 * verify_jwt = true, sans effet contre la clé publique qui est un JWT valide), donc joignable avec
 * la seule clé publique ; son ancien code n'a pas été relu. Aucun appelant atteignable : ni page
 * servie de MED MNG ou d'EmotionsCare, ni autre fonction, ni tâche planifiée (cron.job), ni
 * déclencheur ; aucun appel dans les journaux des 24 h précédant le 05.10.2026.
 *
 * Elle répond désormais 410 sans aucun appel en aval (ni base de données, ni fournisseur).
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { fonctionRetiree } from '../_shared/mm-garde.ts';

// Témoin de la version retirée : les sondes E2E (e2e-prod/f66mm.spec.ts) le vérifient sur la
// réponse OPTIONS avant toute requête, pour ne jamais atteindre une ancienne version non redéployée.
const enTetes = { ...corsHeaders, 'x-mm-fonction-retiree': 'F66-MM' };

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: enTetes });
  }
  return fonctionRetiree(enTetes, 'Cette fonctionnalité a été retirée.');
});
