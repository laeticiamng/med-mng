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

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return fonctionRetiree(corsHeaders, 'Cette fonctionnalité a été retirée.');
});
