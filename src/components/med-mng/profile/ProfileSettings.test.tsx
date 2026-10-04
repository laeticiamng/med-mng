import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS } from '@/config/routes';
import { ProfileSettings } from './ProfileSettings';

/**
 * Vague 2 (04.10.2026) : l'onglet Paramètres affichait des réglages jamais
 * enregistrés (« Vos préférences ont été sauvegardées ») et un export factice.
 */
describe('ProfileSettings', () => {
  it("n'affiche aucun réglage factice et mène au vrai export / à la vraie suppression", () => {
    render(
      <MemoryRouter>
        <ProfileSettings />
      </MemoryRouter>,
    );
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    expect(screen.queryByText(/Vider le cache/)).toBeNull();
    expect(screen.getByRole('link', { name: /Exporter mes données/ })).toHaveAttribute('href', ROUTE_PATHS.mesDonneesRgpd);
    expect(screen.getByRole('link', { name: /Supprimer mon compte/ })).toHaveAttribute('href', ROUTE_PATHS.mesDonneesRgpd);
  });
});
