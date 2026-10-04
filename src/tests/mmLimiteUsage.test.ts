import { describe, expect, it } from 'vitest';
import {
  fenetreJourUtc,
  reserverUtilisationJournaliere,
  tailleBase64Decodee,
} from '../../supabase/functions/_shared/mm-limite-usage.ts';

/**
 * D45 (vague 3, 04.10.2026) : whisper-transcribe (OpenAI, facturée à l'appel) était ouverte à
 * tout compte connecté sans limite de volume ni de taille. Compteur journalier par compte dans
 * rate_limit_counters (écriture réservée au service).
 */

interface Ligne {
  id: string;
  identifier: string;
  window_start: string;
  window_end: string;
  request_count: number;
  max_requests: number;
  created_at: string;
}

/** Faux client Supabase : seule la table rate_limit_counters, avec les filtres utilisés. */
function faussebase(options: { erreurLecture?: boolean; concurrence?: number } = {}) {
  const lignes: Ligne[] = [];
  let concurrence = options.concurrence ?? 0;
  const client = {
    from: (table: string) => {
      expect(table).toBe('rate_limit_counters');
      const filtres: Array<[string, unknown]> = [];
      const correspond = (l: Ligne) => filtres.every(([c, v]) => (l as unknown as Record<string, unknown>)[c] === v);
      let maj: Partial<Ligne> | null = null;
      const chaine = {
        select: () => chaine,
        eq: (c: string, v: unknown) => {
          filtres.push([c, v]);
          return chaine;
        },
        order: () => chaine,
        limit: async () => (options.erreurLecture ? { data: null, error: { message: 'lecture' } } : { data: lignes.filter(correspond), error: null }),
        insert: async (l: Omit<Ligne, 'id' | 'created_at'>) => {
          lignes.push({ ...l, id: `l${lignes.length}`, created_at: new Date().toISOString() });
          return { error: null };
        },
        update: (champs: Partial<Ligne>) => {
          maj = champs;
          return {
            eq: (c: string, v: unknown) => {
              filtres.push([c, v]);
              return {
                eq: (c2: string, v2: unknown) => {
                  filtres.push([c2, v2]);
                  return {
                    select: async () => {
                      if (concurrence > 0) {
                        // Une autre requête a incrémenté entre la lecture et l'écriture.
                        concurrence--;
                        lignes.forEach((l) => (l.request_count += 1));
                        return { data: [], error: null };
                      }
                      const cibles = lignes.filter(correspond);
                      cibles.forEach((l) => Object.assign(l, maj));
                      return { data: cibles.map((l) => ({ request_count: l.request_count })), error: null };
                    },
                  };
                },
              };
            },
          };
        },
      };
      return chaine;
    },
  };
  return { client, lignes };
}

const MIDI = new Date('2026-10-04T12:00:00Z');

describe('fenetreJourUtc', () => {
  it('borne le jour UTC', () => {
    expect(fenetreJourUtc(new Date('2026-10-04T23:59:59Z'))).toEqual({ debut: '2026-10-04T00:00:00.000Z', fin: '2026-10-05T00:00:00.000Z' });
  });
});

describe('tailleBase64Decodee', () => {
  it('compte les octets décodés, préfixe data: et remplissage compris', () => {
    expect(tailleBase64Decodee(btoa('abcd'))).toBe(4);
    expect(tailleBase64Decodee(btoa('abcde'))).toBe(5);
    expect(tailleBase64Decodee(`data:audio/webm;base64,${btoa('abcdef')}`)).toBe(6);
    expect(tailleBase64Decodee('A'.repeat(14_000_000))).toBeGreaterThan(10 * 1024 * 1024);
  });
});

describe('reserverUtilisationJournaliere', () => {
  it('autorise jusqu’au maximum puis refuse, par compte et par jour', async () => {
    const { client, lignes } = faussebase();
    for (let i = 1; i <= 3; i++) {
      expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toEqual({ autorise: true, utilise: i });
    }
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toEqual({ autorise: false, utilise: 3 });
    // Autre compte : compteur distinct ; jour suivant : nouvelle fenêtre.
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u2', 3, MIDI)).toEqual({ autorise: true, utilise: 1 });
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, new Date('2026-10-05T00:00:01Z'))).toEqual({ autorise: true, utilise: 1 });
    expect(lignes.map((l) => l.identifier)).toEqual(['whisper-transcribe:u1', 'whisper-transcribe:u2', 'whisper-transcribe:u1']);
  });

  it('compteur illisible : null (l’appel payant est refusé)', async () => {
    const { client } = faussebase({ erreurLecture: true });
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 3, MIDI)).toBeNull();
  });

  it('écriture concurrente : relit et ne dépasse pas la limite', async () => {
    const { client } = faussebase({ concurrence: 1 });
    await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 2, MIDI); // crée la ligne (1)
    // L'incrément concurrent porte le compteur à 2 : la réservation suivante doit être refusée.
    expect(await reserverUtilisationJournaliere(client, 'whisper-transcribe', 'u1', 2, MIDI)).toEqual({ autorise: false, utilise: 2 });
  });
});
