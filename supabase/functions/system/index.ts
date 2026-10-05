/**
 * system — fonctionnalité retirée (05.10.2026, vague sécurité F66-MM).
 *
 * Ancien rôle : routeur « système » (quotas, statistiques, alertes, journal d'erreurs, analyses de
 * sécurité, contrôles de données) exécuté avec la clé de service, utilisateur facultatif : la clé
 * publique suffisait pour écrire des événements et des erreurs, modifier le statut des alertes ou
 * consommer un quota. Aucun appelant (systemApi n'est importé nulle part, aucune autre fonction ne
 * l'appelle).
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
