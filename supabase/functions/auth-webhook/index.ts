/**
 * auth-webhook — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle : sur un corps « INSERT users », faisait envoyer par send-emails (clé de service)
 * l'e-mail de bienvenue à l'adresse lue dans le corps : relais d'e-mails ouvert à la clé publique.
 * Aucun déclencheur ne l'appelle (aucun webhook de base sur auth.users, aucune invocation dans les
 * journaux du 04-05.10.2026 malgré plus de 300 inscriptions) ; l'e-mail de bienvenue passe par
 * send-welcome-email (session).
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
