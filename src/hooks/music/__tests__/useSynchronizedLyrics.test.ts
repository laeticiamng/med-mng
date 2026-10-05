import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Note finale vérifiée (05.10.2026) : l'onglet Musique appelait mm-music-status avec un identifiant
// fabriqué (« IC-150-A ») après chaque génération → 404 en production. Aucun appel serveur désormais.
const getStatus = vi.fn();
const invoke = vi.fn();
vi.mock('@/lib/unifiedApiClient', () => ({ audioApi: { getStatus } }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke } } }));
vi.mock('@/lib/secureApiClient', () => ({ secureSunoClient: { getGenerationStatus: (id: string) => getStatus(id) } }));

import { useSynchronizedLyrics } from '../useSynchronizedLyrics';

describe('useSynchronizedLyrics', () => {
  it('audio disponible : paroles synchronisées localement, sans appel à mm-music-status', async () => {
    const { result } = renderHook(() =>
      useSynchronizedLyrics({ audioId: 'IC-150-A', rawLyrics: 'Ligne 1\n\nLigne 2\nLigne 3', enableAutoSync: true }),
    );
    await waitFor(() => expect(result.current.lyrics).toHaveLength(3));
    expect(result.current.lyrics.map((l) => l.text)).toEqual(['Ligne 1', 'Ligne 2', 'Ligne 3']);
    expect(result.current.lyrics[0].time).toBe(0);
    expect(result.current.lyrics[1].time).toBeGreaterThan(0);
    expect(getStatus).not.toHaveBeenCalled();
    expect(invoke).not.toHaveBeenCalled();
  });

  it('pas encore d\'audio : aucune ligne', async () => {
    const { result } = renderHook(() => useSynchronizedLyrics({ rawLyrics: 'Ligne 1', enableAutoSync: true }));
    await new Promise((r) => setTimeout(r, 20));
    expect(result.current.lyrics).toEqual([]);
  });
});
