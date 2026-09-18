import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

/**
 * RETIREE LE 18/09/2026 — cette fonction ne generait rien.
 *
 * Elle assemblait des gabarits ecrits en dur, identiques pour les 367 items :
 *   « Rang A Fondamentaux, expertise qui s'precise »
 *   « Chaque competence compte, on les assemble »
 *   « Formation complete, ensemble on tremble »
 *   « Item edn 164 - competence medicale specialisee »  (le libelle d'une
 *     FAUSSE ligne du referentiel)
 * Mesure sur la base : 75,9 % des lignes de rang A etaient presentes 367 fois
 * a l'identique, 90,1 % des chapitres du « roman » commencaient par l'une de
 * 9 phrases fixes. Aucune information medicale n'etait transportee.
 *
 * Elle ecrivait en plus dans edn_items_immersive, qui n'est plus la table
 * canonique.
 *
 * Remplacee par `generer-paroles-item`, qui part des competences OIC reelles
 * et refuse toute sortie qui retombe dans le remplissage.
 *
 * Elle reste deployee en 410 pour qu'un appel residuel echoue franchement au
 * lieu de reecrire silencieusement les paroles des 367 items.
 */
serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: 'fonction_retiree',
      message:
        "generate-lyrics-from-oic ne generait pas de paroles, elle recopiait des gabarits identiques sur les 367 items. Utiliser generer-paroles-item.",
      remplacee_par: 'generer-paroles-item',
    }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
