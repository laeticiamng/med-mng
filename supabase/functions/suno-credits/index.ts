/**
 * 🎵 suno-credits — solde de crédits sunoapi.org (réservé aux administrateurs et au serveur)
 *
 * Point d'entrée du fournisseur : GET /api/v1/generate/credit → { code: 200, msg, data: <solde> }.
 * L'ancienne version appelait /api/v1/get-credits (404 depuis toujours) et masquait l'échec par de faux soldes
 * (« 50 crédits, plan demo » sans clé, « 10 crédits, plan fallback » en cas d'erreur) ; elle cherchait aussi des
 * champs (plan, utilisé, total) que le fournisseur ne renvoie pas. Corrigé le 27.10.2026 :
 *  - le vrai solde, lu par _shared/mm-suno-solde.ts (même lecture que l'alerte de solde bas) ;
 *  - aucun solde inventé : clé absente → 503, fournisseur injoignable → 502 (ou le dernier solde réel, signalé
 *    `stale: true`, s'il est en cache) ;
 *  - une génération coûte 12 crédits (mesuré le 26.10.2026) : `generationsRestantes` en découle.
 *
 * Aucune application n'appelle cette fonction (EmotionsCare lit son solde par suno-music, qui utilisait déjà le bon
 * point d'entrée ; Med MNG surveille le solde par mm-suno-solde).
 */

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { estTachePlanifiee, exigerAdministrateur } from '../_shared/mm-garde.ts';
import { COUT_GENERATION_CREDITS, lireSoldeSuno } from '../_shared/mm-suno-solde.ts';

const CACHE_TTL_MS = 60_000;

// Cache en mémoire (remis à zéro à chaque démarrage à froid) : uniquement des soldes réellement lus.
let cache: { credits: number; lu: number } | null = null;

const reponse = (statut: number, corps: Record<string, unknown>) =>
  new Response(JSON.stringify(corps), { status: statut, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const corpsSolde = (credits: number, extra: Record<string, unknown>) => ({
  success: true,
  credits,
  generationsRestantes: Math.max(0, Math.floor(credits / COUT_GENERATION_CREDITS)),
  coutGeneration: COUT_GENERATION_CREDITS,
  ...extra,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // Réservé aux administrateurs, à la clé de service et aux tâches planifiées (jeton Vault vérifié en base) :
  // déployée avec verify_jwt = false, cette fonction dépensait des appels d'API pour tout appelant, même anonyme
  // (revue critique du 04.10.2026, _shared/mm-garde.ts).
  if (!(await estTachePlanifiee(req))) {
    const acces = await exigerAdministrateur(req, corsHeaders);
    if (acces instanceof Response) return acces;
  }

  const cle = Deno.env.get('SUNO_API_KEY') ?? '';
  if (cle.length < 10) {
    return reponse(503, { success: false, code: 'CLE_ABSENTE', error: 'Clé sunoapi.org absente ou invalide.' });
  }

  if (cache && Date.now() - cache.lu < CACHE_TTL_MS) {
    return reponse(200, corpsSolde(cache.credits, { cached: true }));
  }

  const lecture = await lireSoldeSuno(cle);
  if (lecture.ok === false) {
    console.error('❌ Solde Suno illisible :', lecture.raison);
    if (cache) return reponse(200, corpsSolde(cache.credits, { cached: true, stale: true }));
    return reponse(502, { success: false, code: 'SOLDE_ILLISIBLE', error: 'Solde sunoapi.org illisible.', raison: lecture.raison });
  }

  cache = { credits: lecture.credits, lu: Date.now() };
  return reponse(200, corpsSolde(lecture.credits, { cached: false }));
});
