import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const noms = vi.hoisted(() => [] as string[]);
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: (nom: string) => {
      noms.push(nom);
      // Comme supabase-js quand le canal existe déjà et est abonné.
      return {
        on: () => {
          throw new Error(
            `cannot add \`postgres_changes\` callbacks for realtime:${nom} after \`subscribe()\`.`
          );
        },
      };
    },
    removeChannel: vi.fn(),
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useRealtimeGeneration } from './useRealtimeGeneration';

describe('useRealtimeGeneration — le temps réel ne casse jamais la page Create', () => {
  it('une erreur du canal est absorbée (suivi par interrogation), sans exception', () => {
    const avert = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useRealtimeGeneration({ userId: 'u1', enabled: true })
    );
    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionError).toBe('Temps réel indisponible');
    avert.mockRestore();
  });

  it('nom de canal unique à chaque connexion', () => {
    noms.length = 0;
    const avert = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useRealtimeGeneration({ userId: 'u1', enabled: true })
    );
    result.current.reconnect();
    result.current.reconnect();
    expect(new Set(noms).size).toBe(noms.length);
    avert.mockRestore();
  });
});
