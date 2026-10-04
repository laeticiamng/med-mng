import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn() } }));
vi.mock('@/components/med-mng/AuthProvider', () => ({ useAuth: () => ({ user: null }) }));

import { dedoublonnerChansons, dureeLisible } from '@/components/edn/music/MesChansonsItem';

describe('MesChansonsItem — utilitaires', () => {
  it('affiche la durée en minutes (119.6 s → 2:00)', () => {
    expect(dureeLisible(119.6)).toBe('2:00');
    expect(dureeLisible('119.92')).toBe('2:00');
    expect(dureeLisible(65)).toBe('1:05');
    expect(dureeLisible(null)).toBe('');
    expect(dureeLisible('abc')).toBe('');
  });

  it('garde une entrée par fichier audio, la plus récente d’abord', () => {
    const lignes = [
      { id: 'principale', title: 'IC-150 — Rang A', audio_url: 'https://x/a.mp3', duration: 119.6, created_at: '2026-10-04T14:56:15Z', metadata: null },
      { id: 'piste1', title: 'IC-150 — Rang A', audio_url: 'https://x/a.mp3', duration: 119.6, created_at: '2026-10-04T14:56:35Z', metadata: null },
      { id: 'piste2', title: 'IC-150 — Rang A', audio_url: 'https://x/b.mp3', duration: 119.9, created_at: '2026-10-04T14:56:36Z', metadata: null },
      { id: 'sans-audio', title: 'x', audio_url: null, duration: null, created_at: '2026-10-04T15:00:00Z', metadata: null },
    ];
    expect(dedoublonnerChansons(lignes).map((l) => l.id)).toEqual(['piste2', 'piste1']);
  });
});
