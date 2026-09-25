/**
 * 🔍 mm-music-status — état d'une génération audio MED MNG (lecture seule)
 *
 * Remplace, pour MED MNG, l'action `get_status` de la fonction partagée
 * `ai-audio` (EmotionsCare, non modifiée).
 *
 * POST { taskId } avec le JWT de l'utilisateur →
 *   { success, status: 'generating' | 'completed' | 'failed', taskId,
 *     audioUrl?, streamUrl?, imageUrl?, title?, duration?, error? }
 *
 *  1. Lit la ligne principale de generated_music_tracks (réservée à son
 *     propriétaire, ou à un administrateur) ;
 *  2. si elle est encore 'generating' depuis plus de 45 s, interroge
 *     GET /api/v1/generate/record-info (aucune génération, aucun crédit) et,
 *     si Suno a terminé ou échoué, enregistre le résultat par le même chemin
 *     que mm-suno-callback (_shared/mm-suno-enregistrement.ts) — rattrapage
 *     d'un callback perdu ;
 *  3. au-delà de 15 minutes sans nouvelle, marque la génération échouée
 *     (non décomptée) pour ne pas laisser l'utilisateur attendre.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUser } from '../_shared/music-database.ts';
import { interpreterRecordInfoSuno, MESSAGE_INDISPONIBLE } from '../_shared/mm-suno-requete.ts';
import {
  enregistrerPistesSuno,
  marquerGenerationEchouee,
  trouverPistePrincipale,
  type PistePrincipale,
} from '../_shared/mm-suno-enregistrement.ts';

const URL_SUNO_RECORD_INFO = 'https://api.sunoapi.org/api/v1/generate/record-info';
/** Délai avant d'interroger Suno directement (laisser le callback arriver). */
const DELAI_AVANT_RATTRAPAGE_MS = 45_000;
/** Au-delà : génération considérée perdue. */
const DELAI_ABANDON_MS = 15 * 60_000;
const MESSAGE_ABANDON = "La génération n'a pas abouti dans le délai prévu. Elle ne vous est pas décomptée : réessayez.";

const reponseJson = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const reponseDepuisLigne = (ligne: PistePrincipale) => {
  const meta = (ligne.metadata ?? {}) as Record<string, unknown>;
  if (ligne.generation_status === 'completed' && ligne.audio_url) {
    return {
      success: true,
      status: 'completed' as const,
      taskId: ligne.task_id,
      audioUrl: ligne.audio_url,
      streamUrl: ligne.stream_url ?? (meta.stream_url as string | undefined) ?? undefined,
      imageUrl: ligne.image_url ?? (meta.image_url as string | undefined) ?? undefined,
      title: ligne.title ?? undefined,
      duration: ligne.duration ?? (meta.duration as number | undefined) ?? undefined,
      metadata: { style: meta.style, rang: meta.rang, itemCode: meta.itemCode, model: meta.model, duration: ligne.duration ?? meta.duration },
    };
  }
  if (ligne.generation_status === 'failed') {
    return {
      success: true,
      status: 'failed' as const,
      taskId: ligne.task_id,
      error: typeof meta.error === 'string' && meta.error ? meta.error : 'La génération a échoué. Elle ne vous est pas décomptée : réessayez.',
    };
  }
  return { success: true, status: 'generating' as const, taskId: ligne.task_id, title: ligne.title ?? undefined };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await getAuthenticatedUser(supabase, req.headers.get('authorization'));
    if (!userId) {
      return reponseJson({ success: false, error: 'Veuillez vous connecter.', code: 'AUTH_REQUISE' }, 401);
    }

    let corps: { taskId?: unknown; payload?: { taskId?: unknown } } = {};
    try {
      corps = await req.json();
    } catch {
      // corps vide
    }
    const taskId = typeof corps.taskId === 'string' ? corps.taskId : typeof corps.payload?.taskId === 'string' ? corps.payload.taskId : '';
    if (!taskId || taskId.length > 128) {
      return reponseJson({ success: false, error: 'taskId requis.', code: 'REQUETE_INVALIDE' }, 400);
    }

    const ligne = await trouverPistePrincipale(supabase, taskId);
    if (!ligne) {
      return reponseJson({ success: false, error: 'Génération introuvable.', code: 'INTROUVABLE' }, 404);
    }

    if (ligne.user_id !== userId) {
      const { data: admin } = await supabase
        .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
      if (!admin) {
        // Même réponse qu'une génération inexistante : pas d'énumération.
        return reponseJson({ success: false, error: 'Génération introuvable.', code: 'INTROUVABLE' }, 404);
      }
    }

    if (ligne.generation_status !== 'generating') {
      return reponseJson(reponseDepuisLigne(ligne));
    }

    const age = Date.now() - new Date(ligne.created_at).getTime();
    if (age < DELAI_AVANT_RATTRAPAGE_MS) {
      return reponseJson(reponseDepuisLigne(ligne));
    }

    // Rattrapage : Suno a peut-être terminé sans que le callback nous parvienne.
    const SUNO_API_KEY = Deno.env.get('SUNO_API_KEY');
    if (SUNO_API_KEY && SUNO_API_KEY.length >= 10) {
      try {
        const reponseSuno = await fetch(`${URL_SUNO_RECORD_INFO}?taskId=${encodeURIComponent(taskId)}`, {
          headers: { 'Authorization': `Bearer ${SUNO_API_KEY}` },
        });
        if (reponseSuno.ok) {
          const info = interpreterRecordInfoSuno(await reponseSuno.json());
          console.log('📊 record-info', taskId, info.statutSuno, '→', info.statut, `(${info.pistes.length} pistes)`);
          if (info.statut === 'completed') {
            await enregistrerPistesSuno(supabase, taskId, info.pistes, 'record_info');
          } else if (info.statut === 'failed') {
            await marquerGenerationEchouee(supabase, taskId, info.message ?? MESSAGE_INDISPONIBLE, info.statutSuno, 'record_info');
          }
        } else {
          console.warn('⚠️ record-info HTTP', reponseSuno.status);
        }
      } catch (err) {
        console.error('⚠️ record-info injoignable:', err);
      }
    }

    let actualisee = (await trouverPistePrincipale(supabase, taskId)) ?? ligne;
    if (actualisee.generation_status === 'generating' && age > DELAI_ABANDON_MS) {
      await marquerGenerationEchouee(supabase, taskId, MESSAGE_ABANDON, 'timeout', 'mm_music_status');
      actualisee = (await trouverPistePrincipale(supabase, taskId)) ?? actualisee;
    }
    return reponseJson(reponseDepuisLigne(actualisee));

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('❌ mm-music-status:', err.message);
    return reponseJson({ success: false, error: MESSAGE_INDISPONIBLE, code: 'ERREUR_INTERNE' }, 500);
  }
});
