/**
 * 🔔 mm-suno-callback — réception des callbacks Suno (MED MNG)
 *
 * Documentation : https://docs.sunoapi.org/suno-api/generate-music-callbacks
 *   { code, msg, data: { callbackType: 'text' | 'first' | 'complete' | 'error',
 *     task_id, data: [{ id, audio_url, source_audio_url, stream_audio_url,
 *     source_stream_audio_url, image_url, source_image_url, prompt, model_name,
 *     title, tags, createTime, duration }] } }
 *   code 200 = succès ; 400 = paramètre ou contenu refusé ; 451 = échec de
 *   téléchargement ; 500 = erreur serveur.
 *
 *  - 'text'     → la génération continue (statut inchangé) ;
 *  - 'first'    → premier audio disponible : ligne principale 'completed' +
 *                 bibliothèque (med_mng_songs / med_mng_user_songs) + historique ;
 *  - 'complete' → toutes les pistes : idem, pistes individuelles complétées ;
 *  - 'error' ou code ≠ 200 → ligne principale 'failed' avec un message français
 *                 dans metadata.error ; non décomptée du quota
 *                 (mm-generate-music ignore les 'failed').
 *
 * Toute la logique d'écriture est dans _shared/mm-suno-enregistrement.ts,
 * partagée avec mm-music-status (rattrapage si un callback se perd).
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { checkIdempotency, markCompleted, markFailed } from '../_shared/idempotency.ts';
import { interpreterCallbackSuno } from '../_shared/mm-suno-requete.ts';
import { enregistrerPistesSuno, marquerGenerationEchouee } from '../_shared/mm-suno-enregistrement.ts';

const reponseJson = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let cleOperation: string | null = null;

  try {
    let corps: unknown;
    try {
      corps = await req.json();
    } catch {
      return reponseJson({ received: false, error: 'Corps JSON invalide' }, 400);
    }

    const callback = interpreterCallbackSuno(corps);
    console.log('🔔 Callback Suno:', {
      type: callback.type,
      code: callback.code,
      taskId: callback.taskId,
      pistes: callback.pistes.length,
      avecAudio: callback.pistes.filter((p) => p.audioUrl).length,
      msg: (corps as { msg?: unknown })?.msg,
    });

    if (!callback.taskId) {
      console.warn('⚠️ Callback sans task_id, ignoré:', JSON.stringify(corps).slice(0, 500));
      return reponseJson({ received: true, processed: false, reason: 'task_id manquant' });
    }

    // Idempotence : un même callback (task + type) n'est traité qu'une fois
    // (Suno peut renvoyer un callback ; l'ancienne clé horodatée ne protégeait de rien).
    cleOperation = `suno_callback_${callback.taskId}_${callback.type}`;
    const { canProceed } = await checkIdempotency(supabase, cleOperation, undefined, 600);
    if (!canProceed) {
      console.log('⏭️ Callback déjà traité:', cleOperation);
      return reponseJson({ received: true, skipped: true, reason: 'already_processed' });
    }

    if (callback.echec) {
      await marquerGenerationEchouee(supabase, callback.taskId, callback.message ?? 'La génération a échoué.', callback.code, `callback_${callback.type}`);
      await markCompleted(supabase, cleOperation, { status: 'failed', code: callback.code });
      return reponseJson({ received: true, processed: true, status: 'failed' });
    }

    if (callback.pistes.length === 0) {
      // 'text' sans piste, ou variante inattendue : rien à enregistrer, la génération continue.
      await markCompleted(supabase, cleOperation, { status: 'generating', type: callback.type });
      return reponseJson({ received: true, processed: true, status: 'generating' });
    }

    const resultat = await enregistrerPistesSuno(supabase, callback.taskId, callback.pistes, `callback_${callback.type}`);
    await markCompleted(supabase, cleOperation, { status: resultat.statut, audio_url: resultat.audioUrl });
    return reponseJson({ received: true, processed: true, status: resultat.statut });

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Erreur callback Suno:', err.message, err.stack);
    if (cleOperation) {
      try {
        await markFailed(supabase, cleOperation, err);
      } catch (e) {
        console.error('Marquage idempotence impossible:', e);
      }
    }
    // 200 malgré l'erreur interne : Suno n'a pas à réessayer indéfiniment, mm-music-status rattrape.
    return reponseJson({ received: true, processed: false, error: 'Erreur interne' });
  }
});
