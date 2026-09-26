import { supabase } from '@/integrations/supabase/client';

/**
 * Sauvegarde en bibliothèque d'une génération terminée.
 *
 * En temps normal, mm-suno-callback (ou mm-music-status en rattrapage) crée la
 * chanson dans med_mng_songs et l'ajoute à med_mng_user_songs dès que l'audio
 * existe : /med-mng/library l'affiche sans rien faire côté client. Cette
 * fonction vérifie que c'est bien le cas et, sinon (insertion serveur en
 * échec), recrée l'entrée depuis la ligne principale de generated_music_tracks
 * (lecture sous RLS : ses propres générations).
 */

export type ResultatBibliotheque =
  | { etat: 'deja'; songId: string }
  | { etat: 'creee'; songId: string }
  | { etat: 'impossible'; raison: string };

const idDepuisUrlSuno = (url: string | null | undefined): string | null => {
  const m = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(mp3|wav|m4a)/i.exec(url || '');
  return m ? m[1] : null;
};

export async function assurerChansonEnBibliotheque(userId: string, taskId: string): Promise<ResultatBibliotheque> {
  const { data: principale, error: errPrincipale } = await supabase
    .from('generated_music_tracks')
    .select('id, title, audio_url, stream_url, image_url, duration, metadata, generation_status')
    .eq('task_id', taskId)
    .eq('suno_track_id', taskId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (errPrincipale || !principale) {
    return { etat: 'impossible', raison: 'Génération introuvable.' };
  }
  if (principale.generation_status !== 'completed' || !principale.audio_url) {
    return { etat: 'impossible', raison: "L'audio n'est pas encore disponible." };
  }

  const meta = (principale.metadata && typeof principale.metadata === 'object' && !Array.isArray(principale.metadata)
    ? principale.metadata
    : {}) as Record<string, unknown>;
  const sunoAudioId = (typeof meta.suno_track_id === 'string' && meta.suno_track_id)
    || idDepuisUrlSuno(principale.audio_url)
    || taskId;

  // 1. Chanson déjà créée (par le callback) ?
  const { data: existante } = await supabase
    .from('med_mng_songs')
    .select('id')
    .eq('suno_audio_id', sunoAudioId)
    .limit(1)
    .maybeSingle();

  let songId = existante?.id ?? null;
  let creee = false;

  if (!songId) {
    const parolesChantees = typeof meta.prompt === 'string' ? meta.prompt : null;
    const { data: nouvelle, error: errCreation } = await supabase
      .from('med_mng_songs')
      .insert({
        title: principale.title || 'Chanson Med MNG',
        suno_audio_id: sunoAudioId,
        user_id: userId,
        created_by: userId,
        lyrics: parolesChantees ? { text: parolesChantees } : {},
        meta: {
          ...meta,
          audio_url: principale.audio_url,
          stream_url: principale.stream_url,
          image_url: principale.image_url,
          duration: principale.duration ?? meta.duration ?? null,
          task_id: taskId,
          generated_at: new Date().toISOString(),
          source: 'client_fallback',
        },
      } as never)
      .select('id')
      .single();
    if (errCreation || !nouvelle) {
      return { etat: 'impossible', raison: errCreation?.message || 'Création impossible.' };
    }
    songId = nouvelle.id;
    creee = true;
  }

  // 2. Lien utilisateur ↔ chanson (bibliothèque).
  const { data: lien } = await supabase
    .from('med_mng_user_songs')
    .select('song_id')
    .eq('user_id', userId)
    .eq('song_id', songId)
    .limit(1)
    .maybeSingle();

  if (!lien) {
    const { error: errLien } = await supabase
      .from('med_mng_user_songs')
      .insert({ user_id: userId, song_id: songId });
    if (errLien && errLien.code !== '23505') {
      return { etat: 'impossible', raison: errLien.message };
    }
    creee = true;
  }

  return creee ? { etat: 'creee', songId } : { etat: 'deja', songId };
}
