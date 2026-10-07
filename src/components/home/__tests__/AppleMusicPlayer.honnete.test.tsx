import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const { from } = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: () => ({ eq: () => ({ not: () => ({ limit: async () => ({ data: [], error: null }) }) }) }),
  })),
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from } }));
vi.mock('@/components/global/TranslatedText', () => ({
  TranslatedText: ({ text }: { text: string }) => <>{text}</>,
}));

import { AppleMusicPlayer } from '../AppleMusicPlayer';

// MM-A07 : aucune chanson de démonstration publiable n'existe en base
// (edn_suno_tracks : 0 ligne et jamais alimentée ; aucune génération pour les
// 10 items d'essai). L'accueil ne doit ni interroger une table vide ni simuler
// une lecture (onde animée, lecteur).
describe('Accueil — section « Écoutez. Apprenez. »', () => {
  it("n'affiche ni lecteur ni onde simulée et n'interroge aucune table audio", async () => {
    const { container } = render(
      <MemoryRouter>
        <AppleMusicPlayer />
      </MemoryRouter>,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(from).not.toHaveBeenCalled();
    expect(container.querySelector('audio')).toBeNull();
    expect(container.querySelector('[data-onde-simulee]')).toBeNull();
    expect(container.querySelectorAll('.w-1.rounded-full').length).toBe(0);
    expect(screen.getByText(/Génération audio avec Premium/)).toBeTruthy();
  });
});
