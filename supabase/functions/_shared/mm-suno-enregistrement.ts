/**
 * MED MNG — enregistrement en base des résultats Suno.
 *
 * Un seul chemin d'écriture, partagé par `mm-suno-callback` (callbacks Suno)
 * et `mm-music-status` (rattrapage via record-info si un callback s'est perdu) :
 *
 *   generated_music_tracks (ligne principale : suno_track_id = task_id, créée
 *   par mm-generate-music avec generation_status = 'generating')
 *     → 'completed' + audio_url dès qu'une piste a un audio (callback « first »)
 *     → 'failed' + metadata.error (message français) sinon — non décomptée du quota
 *   med_mng_songs + med_mng_user_songs (bibliothèque /med-mng/library)
 *   user_generated_music (historique du générateur)
 *   + une ligne generated_music_tracks par piste Suno (suno_track_id ≠ task_id),
 *     jamais comptée dans le quota.
 */

import type { PisteSuno, StatutGenerationSuno } from './mm-suno-requete.ts';

// deno-lint-ignore no-explicit-any
type ClientSupabase = any;

export interface PistePrincipale {
  id: string;
  task_id: string;
  suno_track_id: string | null;
  user_id: string | null;
  title: string | null;
  audio_url: string | null;
  stream_url: string | null;
  image_url: string | null;
  duration: number | null;
  generation_status: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
}

const metadonnees = (valeur: unknown): Record<string, unknown> =>
  valeur && typeof valeur === 'object' && !Array.isArray(valeur) ? (valeur as Record<string, unknown>) : {};

/** Ligne principale d'une génération : la première créée pour ce task_id. */
export async function trouverPistePrincipale(supabase: ClientSupabase, taskId: string): Promise<PistePrincipale | null> {
  const { data, error } = await supabase
    .from('generated_music_tracks')
    .select('id, task_id, suno_track_id, user_id, title, audio_url, stream_url, image_url, duration, generation_status, metadata, created_at, updated_at')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('❌ Lecture de la piste principale impossible:', error.message);
    return null;
  }
  return (data as PistePrincipale | null) ?? null;
}

export interface ResultatEnregistrement {
  statut: StatutGenerationSuno;
  audioUrl: string | null;
  streamUrl: string | null;
  imageUrl: string | null;
  duree: number | null;
  titre: string | null;
}

/**
 * Enregistre les pistes reçues (callback ou record-info) : met à jour la ligne
 * principale, alimente la bibliothèque et l'historique dès qu'un audio existe,
 * puis trace chaque piste individuelle. Idempotent (ré-exécutable sans doublon).
 */
export async function enregistrerPistesSuno(
  supabase: ClientSupabase,
  taskId: string,
  pistes: PisteSuno[],
  origine: string,
): Promise<ResultatEnregistrement> {
  const principale = await trouverPistePrincipale(supabase, taskId);
  const pisteAvecAudio = pistes.find((p) => p.audioUrl) ?? null;
  const maintenant = new Date().toISOString();

  if (!principale) {
    console.warn('⚠️ Aucune piste principale pour task_id', taskId, '(génération lancée hors MED MNG ?)');
  } else if (principale.generation_status === 'failed') {
    console.warn('⚠️ Génération déjà marquée échouée, pistes ignorées:', taskId);
  } else {
    const miseAJour: Record<string, unknown> = {
      generation_status: pisteAvecAudio ? 'completed' : 'generating',
      updated_at: maintenant,
    };
    if (pisteAvecAudio) {
      miseAJour.audio_url = pisteAvecAudio.audioUrl;
      miseAJour.stream_url = pisteAvecAudio.streamUrl;
      miseAJour.image_url = pisteAvecAudio.imageUrl;
      if (pisteAvecAudio.duration) miseAJour.duration = pisteAvecAudio.duration;
      miseAJour.metadata = {
        ...metadonnees(principale.metadata),
        duration: pisteAvecAudio.duration ?? metadonnees(principale.metadata).duration,
        model_name: pisteAvecAudio.modelName,
        tags: pisteAvecAudio.tags,
        suno_track_id: pisteAvecAudio.id,
        callback_type: origine,
        first_audio_received_at: metadonnees(principale.metadata).first_audio_received_at ?? maintenant,
      };
    }
    const { error } = await supabase.from('generated_music_tracks').update(miseAJour).eq('id', principale.id);
    if (error) console.error('❌ Mise à jour de la piste principale impossible:', error.message);
    else console.log(`✅ Piste principale ${principale.id} → ${miseAJour.generation_status} (${origine})`);

    if (pisteAvecAudio) {
      await enregistrerEnBibliotheque(supabase, principale, pisteAvecAudio, taskId);
    }
  }

  for (const piste of pistes) {
    await enregistrerPisteIndividuelle(supabase, taskId, piste, principale, pisteAvecAudio !== null);
  }

  return {
    statut: pisteAvecAudio ? 'completed' : 'generating',
    audioUrl: pisteAvecAudio?.audioUrl ?? null,
    streamUrl: pisteAvecAudio?.streamUrl ?? null,
    imageUrl: pisteAvecAudio?.imageUrl ?? null,
    duree: pisteAvecAudio?.duration ?? null,
    titre: principale?.title ?? pisteAvecAudio?.title ?? null,
  };
}

/** med_mng_songs + med_mng_user_songs + user_generated_music (sans doublon). */
async function enregistrerEnBibliotheque(
  supabase: ClientSupabase,
  principale: PistePrincipale,
  piste: PisteSuno,
  taskId: string,
): Promise<void> {
  try {
    const titre = principale.title || piste.title || 'Chanson MED MNG';
    const meta = metadonnees(principale.metadata);

    const { data: existante } = await supabase
      .from('med_mng_songs')
      .select('id')
      .eq('suno_audio_id', piste.id)
      .maybeSingle();

    let songId: string | null = existante?.id ?? null;
    if (!songId) {
      const parolesChantees = typeof meta.prompt === 'string' ? meta.prompt : null;
      const { data: creee, error: errCreation } = await supabase
        .from('med_mng_songs')
        .insert({
          title: titre,
          suno_audio_id: piste.id,
          user_id: principale.user_id,
          created_by: principale.user_id,
          // Paroles chantées, affichées par le lecteur (/med-mng/player) sans appel externe.
          lyrics: parolesChantees ? { text: parolesChantees } : {},
          meta: {
            ...meta,
            audio_url: piste.audioUrl,
            stream_url: piste.streamUrl,
            image_url: piste.imageUrl,
            duration: piste.duration,
            model_name: piste.modelName,
            tags: piste.tags,
            task_id: taskId,
            generated_at: new Date().toISOString(),
          },
        })
        .select('id')
        .single();
      if (errCreation) {
        console.error('❌ Création med_mng_songs impossible:', errCreation.message);
        return;
      }
      songId = creee?.id ?? null;
      console.log('✅ Chanson créée dans med_mng_songs:', songId);
    }

    if (!songId || !principale.user_id) return;

    // Lien utilisateur ↔ chanson, une seule fois (les callbacks « first » puis « complete » repassent ici).
    const { data: lien } = await supabase
      .from('med_mng_user_songs')
      .select('song_id')
      .eq('user_id', principale.user_id)
      .eq('song_id', songId)
      .limit(1)
      .maybeSingle();
    if (!lien) {
      const { error: errBiblio } = await supabase
        .from('med_mng_user_songs')
        .insert({ user_id: principale.user_id, song_id: songId });
      if (errBiblio && errBiblio.code !== '23505') {
        console.error('❌ Ajout à la bibliothèque impossible:', errBiblio.message);
      } else {
        console.log('✅ Chanson dans la bibliothèque de', principale.user_id);
      }
    }

    const { error: errHistorique } = await supabase
      .from('user_generated_music')
      .upsert({
        user_id: principale.user_id,
        title: titre,
        audio_url: piste.audioUrl,
        music_style: (meta.style as string) || 'pop',
        rang: (meta.rang as string) || 'A',
        item_code: (meta.itemCode as string) || 'EDN',
        music_id: `suno_${piste.id}`,
        is_favorite: false,
      }, { onConflict: 'music_id' });
    if (errHistorique && errHistorique.code !== '23505') {
      console.error('❌ Ajout à user_generated_music impossible:', errHistorique.message);
    }
  } catch (err) {
    console.error('❌ Enregistrement bibliothèque:', err);
  }
}

/** Une ligne generated_music_tracks par piste Suno (jamais la principale, jamais comptée). */
async function enregistrerPisteIndividuelle(
  supabase: ClientSupabase,
  taskId: string,
  piste: PisteSuno,
  principale: PistePrincipale | null,
  termine: boolean,
): Promise<void> {
  try {
    const { data: existante } = await supabase
      .from('generated_music_tracks')
      .select('id, task_id, suno_track_id')
      .eq('suno_track_id', piste.id)
      .maybeSingle();

    const champs: Record<string, unknown> = {
      generation_status: piste.audioUrl ? 'completed' : (termine ? 'completed' : 'generating'),
      updated_at: new Date().toISOString(),
    };
    if (piste.audioUrl) champs.audio_url = piste.audioUrl;
    if (piste.streamUrl) champs.stream_url = piste.streamUrl;
    if (piste.imageUrl) champs.image_url = piste.imageUrl;
    if (piste.duration) champs.duration = piste.duration;

    if (existante) {
      if (existante.suno_track_id === existante.task_id) return; // ligne principale : déjà traitée
      await supabase.from('generated_music_tracks').update(champs).eq('id', existante.id);
      return;
    }

    await supabase.from('generated_music_tracks').insert({
      task_id: taskId,
      suno_track_id: piste.id,
      title: piste.title || principale?.title || 'Chanson MED MNG',
      user_id: principale?.user_id ?? null,
      metadata: {
        ...metadonnees(principale?.metadata),
        model_name: piste.modelName,
        tags: piste.tags,
        prompt: piste.prompt,
        created_at: piste.createTime,
      },
      ...champs,
    });
  } catch (err) {
    console.error(`❌ Piste individuelle ${piste.id}:`, err);
  }
}

/**
 * Marque la génération échouée : statut lisible pour l'utilisateur (metadata.error
 * en français) et exclue du quota (verifierDroitGeneration ignore 'failed').
 */
export async function marquerGenerationEchouee(
  supabase: ClientSupabase,
  taskId: string,
  message: string,
  code: number | string | null,
  origine: string,
): Promise<void> {
  const principale = await trouverPistePrincipale(supabase, taskId);
  if (!principale) {
    console.warn('⚠️ Échec reçu pour un task_id inconnu:', taskId);
    return;
  }
  if (principale.generation_status === 'completed' && principale.audio_url) {
    console.warn('⚠️ Échec reçu après un audio déjà disponible, ignoré:', taskId);
    return;
  }
  const { error } = await supabase
    .from('generated_music_tracks')
    .update({
      generation_status: 'failed',
      updated_at: new Date().toISOString(),
      metadata: {
        ...metadonnees(principale.metadata),
        error: message,
        error_code: code,
        failed_at: new Date().toISOString(),
        callback_type: origine,
      },
    })
    .eq('id', principale.id);
  if (error) console.error('❌ Marquage échec impossible:', error.message);
  else console.log(`❌ Génération ${taskId} marquée échouée (${origine}, code ${code ?? '?'})`);
}
