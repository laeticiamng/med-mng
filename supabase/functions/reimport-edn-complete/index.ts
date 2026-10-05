/**
 * reimport-edn-complete — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle (code déployé relu, version 812) : avec la clé de service, RÉÉCRIVAIT pour les 367
 * items les tableaux de rang A/B, les paroles, la scène et le quiz de edn_items_immersive avec des
 * gabarits génériques (« Item N - Compétences spécialisées en … ») ; la seule condition était la
 * présence d'un en-tête Authorization, que la clé publique remplit. Son unique appelant, le bouton
 * « Ré-importation » de la page d'administration AdminCompleteProcess, ne doit plus pouvoir
 * remplacer le contenu officiel par du remplissage (même décision que generate-lyrics-from-oic,
 * retirée le 18.09.2026) : retirée plutôt que réservée aux administrateurs. Code supprimé du dépôt
 * MED MNG.
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
