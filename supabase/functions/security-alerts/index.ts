/**
 * security-alerts — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle (code déployé relu, version 41, verify_jwt = false) : lisait share_audit_logs avec
 * la clé de service, renvoyait à l'appelant les activités « suspectes » avec l'e-mail et
 * l'identifiant des personnes concernées, envoyait des e-mails d'alerte (Resend) et écrivait
 * security_notifications — sans aucune authentification. Aucun appelant (« security-alerts » dans
 * useSecurityMonitoring n'est qu'une clé de cache react-query). Code supprimé du dépôt MED MNG.
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
