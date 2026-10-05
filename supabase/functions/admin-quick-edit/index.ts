/**
 * admin-quick-edit — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle (P0) : lisait puis MODIFIAIT n'importe quel champ de n'importe quelle table (table,
 * identifiant et champ lus dans le corps) avec la clé de service, sans aucune authentification :
 * la clé publique suffisait pour réécrire profils, rôles ou abonnements du projet partagé. Appelée
 * seulement par ChangelogDashboard et QuickEditModal, qu'aucune page servie n'affiche.
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
