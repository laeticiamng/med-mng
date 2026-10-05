/**
 * webhooks — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle : routeur de webhooks (Stripe sans vérification de signature, Shopify, Resend,
 * Google Sheets, « auth », rappel Suno) qui écrivait avec la clé de service ce que fournissait
 * l'appelant : abonnements, factures, profils (changement de l'e-mail de n'importe quel profil),
 * pistes audio. Aucun appelant ni webhook configuré (aucune invocation dans les journaux) ; Stripe
 * appelle mm-stripe-webhook (signature vérifiée) et Suno mm-suno-callback.
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
