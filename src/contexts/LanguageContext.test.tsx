import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CLE_LANGUE_ENREGISTREE, LanguageProvider, useLanguage } from './LanguageContext';

/**
 * D42 (04.10.2026) : sélecteur de langue retiré, Med MNG en français uniquement.
 * Une personne qui avait choisi « English » avec l'ancien drapeau gardait ce choix dans
 * son navigateur ; sans sélecteur, elle serait restée bloquée sur des libellés anglais.
 */
const Sonde = () => {
  const { currentLanguage, languages } = useLanguage();
  return (
    <p>
      {currentLanguage} · {languages.map((l) => l.code).join(',')}
    </p>
  );
};

describe('LanguageProvider — français uniquement', () => {
  beforeEach(() => {
    vi.mocked(window.localStorage.getItem).mockReset();
    vi.mocked(window.localStorage.removeItem).mockReset();
  });

  it('ignore un ancien choix « en » et l’efface du navigateur', async () => {
    vi.mocked(window.localStorage.getItem).mockImplementation((cle: string) => (cle === CLE_LANGUE_ENREGISTREE ? 'en' : null));
    render(
      <LanguageProvider>
        <Sonde />
      </LanguageProvider>,
    );
    expect(screen.getByText('fr · fr')).toBeTruthy();
    await waitFor(() => expect(window.localStorage.removeItem).toHaveBeenCalledWith(CLE_LANGUE_ENREGISTREE));
  });
});
