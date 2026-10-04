import { describe, expect, it, vi } from 'vitest';
import {
  cheminAudioChanson,
  copierAudioDansStockage,
  COMPARTIMENT_CHANSONS,
} from '../../supabase/functions/_shared/mm-suno-enregistrement.ts';

/** Client Supabase simulé : seul `storage` sert ici. */
const clientStockage = (erreurUpload: { message: string } | null = null) => {
  const upload = vi.fn(async () => ({ error: erreurUpload }));
  const getPublicUrl = vi.fn((chemin: string) => ({
    data: { publicUrl: `https://exemple.supabase.co/storage/v1/object/public/${COMPARTIMENT_CHANSONS}/${chemin}` },
  }));
  return { client: { storage: { from: vi.fn(() => ({ upload, getPublicUrl })) } }, upload, getPublicUrl };
};

const reponseAudio = (octets: number, ok = true) =>
  ({ ok, status: ok ? 200 : 404, arrayBuffer: async () => new ArrayBuffer(octets) }) as unknown as Response;

describe('cheminAudioChanson', () => {
  it('range la chanson sous le dossier de l’utilisateur, caractères sûrs uniquement', () => {
    expect(cheminAudioChanson('22f88a7c-4e6c', 'ad715ee4-54d5')).toBe('22f88a7c-4e6c/ad715ee4-54d5.mp3');
    expect(cheminAudioChanson(null, '../x y')).toBe('sans-compte/___x_y.mp3');
  });
});

describe('copierAudioDansStockage (fichiers Suno conservés 14 jours)', () => {
  it('copie le MP3 et renvoie l’URL publique stable', async () => {
    const { client, upload } = clientStockage();
    const telecharger = vi.fn(async () => reponseAudio(3_000_000));
    const url = await copierAudioDansStockage(client, 'u1', 'p1', 'https://tempfile.aiquickdraw.com/r/p1.mp3', telecharger as unknown as typeof fetch);
    expect(url).toBe(`https://exemple.supabase.co/storage/v1/object/public/${COMPARTIMENT_CHANSONS}/u1/p1.mp3`);
    expect(upload).toHaveBeenCalledWith('u1/p1.mp3', expect.any(Uint8Array), expect.objectContaining({ contentType: 'audio/mpeg', upsert: true }));
  });

  it('ne recopie pas une URL déjà stable', async () => {
    const { client, upload } = clientStockage();
    const telecharger = vi.fn();
    const stable = `https://exemple.supabase.co/storage/v1/object/public/${COMPARTIMENT_CHANSONS}/u1/p1.mp3`;
    expect(await copierAudioDansStockage(client, 'u1', 'p1', stable, telecharger as unknown as typeof fetch)).toBe(stable);
    expect(telecharger).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it('renvoie null (l’URL Suno est gardée) si le téléchargement, la taille ou l’envoi échoue', async () => {
    const { client } = clientStockage();
    expect(await copierAudioDansStockage(client, 'u1', 'p1', 'https://t/x.mp3', (async () => reponseAudio(10, false)) as unknown as typeof fetch)).toBeNull();
    expect(await copierAudioDansStockage(client, 'u1', 'p1', 'https://t/x.mp3', (async () => reponseAudio(0)) as unknown as typeof fetch)).toBeNull();
    expect(await copierAudioDansStockage(client, 'u1', 'p1', 'https://t/x.mp3', (async () => { throw new Error('réseau'); }) as unknown as typeof fetch)).toBeNull();
    const enErreur = clientStockage({ message: 'Bucket not found' });
    expect(await copierAudioDansStockage(enErreur.client, 'u1', 'p1', 'https://t/x.mp3', (async () => reponseAudio(1000)) as unknown as typeof fetch)).toBeNull();
  });

  it('ne fait rien sans URL ni identifiant de piste', async () => {
    const { client } = clientStockage();
    expect(await copierAudioDansStockage(client, 'u1', 'p1', null)).toBeNull();
    expect(await copierAudioDansStockage(client, 'u1', '', 'https://t/x.mp3')).toBeNull();
  });
});
