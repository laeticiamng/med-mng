import { describe, expect, it, vi } from 'vitest';
import {
  COMPARTIMENT_CHANSONS,
  conserverAudiosTemporaires,
  estAudioSunoTemporaire,
} from '../../supabase/functions/_shared/mm-suno-enregistrement.ts';

/**
 * D40 (vague 3, 04.10.2026) : des générations terminées gardaient l'URL d'un fichier Suno temporaire
 * (14 jours) ; mm-music-status ne traitait que les générations en cours. Rattrapage de conservation.
 */

type Ligne = Record<string, unknown>;

function fauxClient(tables: Record<string, Ligne[]>) {
  const ecritures: Array<{ table: string; champs: Ligne; filtres: Array<[string, unknown]> }> = [];
  const uploads: string[] = [];
  const valeur = (l: Ligne, c: string) => {
    if (c.includes('->>')) {
      const [col, cle] = c.split('->>');
      return (l[col] as Ligne | undefined)?.[cle];
    }
    return l[c];
  };
  const client = {
    storage: {
      from: (compartiment: string) => ({
        upload: async (chemin: string) => {
          uploads.push(`${compartiment}/${chemin}`);
          return { error: null };
        },
        getPublicUrl: (chemin: string) => ({
          data: { publicUrl: `https://projet.supabase.co/storage/v1/object/public/${compartiment}/${chemin}` },
        }),
      }),
    },
    from: (table: string) => {
      const filtres: Array<[string, unknown]> = [];
      let champs: Ligne | null = null;
      const lignes = () => (tables[table] ?? []).filter((l) => filtres.every(([c, v]) => valeur(l, c) === v));
      const chaine: Record<string, unknown> = {
        select: () => chaine,
        update: (c: Ligne) => {
          champs = c;
          return chaine;
        },
        eq: (c: string, v: unknown) => {
          filtres.push([c, v]);
          return chaine;
        },
        order: async () => ({ data: lignes(), error: null }),
        then: (resoudre: (r: unknown) => unknown) => {
          if (champs) {
            const cibles = lignes();
            cibles.forEach((l) => Object.assign(l, champs));
            ecritures.push({ table, champs, filtres: [...filtres] });
            return Promise.resolve(resoudre({ data: cibles, error: null }));
          }
          return Promise.resolve(resoudre({ data: lignes(), error: null }));
        },
      };
      return chaine;
    },
  };
  return { client, ecritures, uploads };
}

const TEMP_A = 'https://tempfile.aiquickdraw.com/r/ad715ee4-54d5-424d-bf37-72f348b0beeb.mp3';
const TEMP_B = 'https://tempfile.aiquickdraw.com/r/03f9b83a-4912-41d5-94d0-29960deed304.mp3';
const audio = (ok: boolean) => vi.fn(async () => ({ ok, status: ok ? 200 : 404, arrayBuffer: async () => new ArrayBuffer(ok ? 1000 : 0) }) as unknown as Response);

const donnees = () => ({
  generated_music_tracks: [
    { id: 'p', task_id: 't1', suno_track_id: 't1', user_id: 'u1', audio_url: TEMP_A, metadata: { suno_track_id: 'ad715ee4-54d5-424d-bf37-72f348b0beeb' }, created_at: '2026-10-04T14:56:15Z' },
    { id: 'a', task_id: 't1', suno_track_id: 'ad715ee4-54d5-424d-bf37-72f348b0beeb', user_id: 'u1', audio_url: TEMP_A, metadata: {}, created_at: '2026-10-04T14:56:35Z' },
    { id: 'b', task_id: 't1', suno_track_id: '03f9b83a-4912-41d5-94d0-29960deed304', user_id: 'u1', audio_url: TEMP_B, metadata: {}, created_at: '2026-10-04T14:56:36Z' },
  ],
  med_mng_songs: [{ id: 's1', user_id: 'u1', meta: { audio_url: TEMP_A, task_id: 't1' } }],
  user_generated_music: [{ id: 'g1', user_id: 'u1', audio_url: TEMP_A }],
});

describe('estAudioSunoTemporaire', () => {
  it('reconnaît les hôtes de fichiers Suno, pas le stockage ni une adresse quelconque', () => {
    expect(estAudioSunoTemporaire(TEMP_A)).toBe(true);
    expect(estAudioSunoTemporaire('https://musicfile.api.box/abc.mp3')).toBe(true);
    expect(estAudioSunoTemporaire('https://apiboxfiles.erweima.ai/abc.mp3')).toBe(true);
    expect(estAudioSunoTemporaire(`https://projet.supabase.co/storage/v1/object/public/${COMPARTIMENT_CHANSONS}/u1/x.mp3`)).toBe(false);
    expect(estAudioSunoTemporaire('https://exemple.com/x.mp3')).toBe(false);
    expect(estAudioSunoTemporaire('http://tempfile.aiquickdraw.com/x.mp3')).toBe(false);
    expect(estAudioSunoTemporaire(null)).toBe(false);
  });
});

describe('conserverAudiosTemporaires', () => {
  it('copie chaque fichier une fois (nom = piste Suno) et remplace l’URL partout', async () => {
    const tables = donnees();
    const { client, uploads } = fauxClient(tables);
    const telecharger = audio(true);
    expect(await conserverAudiosTemporaires(client, 't1', telecharger)).toBe(2);
    expect(telecharger).toHaveBeenCalledTimes(2);
    expect(uploads.sort()).toEqual([
      `${COMPARTIMENT_CHANSONS}/u1/03f9b83a-4912-41d5-94d0-29960deed304.mp3`,
      `${COMPARTIMENT_CHANSONS}/u1/ad715ee4-54d5-424d-bf37-72f348b0beeb.mp3`,
    ]);
    const stableA = `https://projet.supabase.co/storage/v1/object/public/${COMPARTIMENT_CHANSONS}/u1/ad715ee4-54d5-424d-bf37-72f348b0beeb.mp3`;
    expect(tables.generated_music_tracks.map((l) => l.audio_url)).toEqual([
      stableA,
      stableA,
      `https://projet.supabase.co/storage/v1/object/public/${COMPARTIMENT_CHANSONS}/u1/03f9b83a-4912-41d5-94d0-29960deed304.mp3`,
    ]);
    expect((tables.med_mng_songs[0].meta as Ligne).audio_url).toBe(stableA);
    expect((tables.med_mng_songs[0].meta as Ligne).task_id).toBe('t1');
    expect(tables.user_generated_music[0].audio_url).toBe(stableA);
    // Idempotent : plus rien de temporaire.
    expect(await conserverAudiosTemporaires(client, 't1', telecharger)).toBe(0);
    expect(telecharger).toHaveBeenCalledTimes(2);
  });

  it('fichier déjà expiré chez Suno : rien n’est modifié', async () => {
    const tables = donnees();
    const { client, ecritures } = fauxClient(tables);
    expect(await conserverAudiosTemporaires(client, 't1', audio(false))).toBe(0);
    expect(ecritures).toEqual([]);
    expect(tables.generated_music_tracks[0].audio_url).toBe(TEMP_A);
  });
});
