import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieBanner } from './CookieBanner';
import { CLE_PREFERENCES } from '@/lib/consentementCookies';

/**
 * Vague 3 (04.10.2026) : le bandeau taisait les statistiques de l'hébergeur (Lovable, /~flock.js,
 * cookie « session-id » de 30 minutes, actives sans consentement, vérifié en production) et annonçait
 * des « cookies analytiques » Plausible jamais chargés.
 */
const stockage = new Map<string, string>();

beforeEach(() => {
  stockage.clear();
  vi.mocked(window.localStorage.getItem).mockImplementation((cle: string) => stockage.get(cle) ?? null);
  vi.mocked(window.localStorage.setItem).mockImplementation((cle: string, valeur: string) => {
    stockage.set(cle, valeur);
  });
});

const afficher = () =>
  render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>,
  );

describe('CookieBanner', () => {
  it('décrit les statistiques de l’hébergeur et la mesure optionnelle, sans Plausible', () => {
    afficher();
    expect(screen.getByText(/L'hébergeur du site \(Lovable\) compte aussi les pages\s+vues, avec un cookie de session de 30 minutes, sans publicité/)).toBeTruthy();
    expect(screen.getByText(/est optionnelle : à vous de choisir/)).toBeTruthy();
    expect(screen.queryByText(/Plausible/)).toBeNull();
    expect(screen.getByRole('link', { name: 'En savoir plus' }).getAttribute('href')).toBe('/legal/cookies');
  });

  it('« Refuser la mesure » enregistre un refus (version 2) et ferme le bandeau', () => {
    afficher();
    fireEvent.click(screen.getByRole('button', { name: 'Refuser la mesure' }));
    expect(JSON.parse(stockage.get(CLE_PREFERENCES) ?? '{}')).toEqual({ essential: true, analytics: false, version: 2 });
    expect(screen.queryByRole('button', { name: 'Accepter la mesure' })).toBeNull();
  });

  it('« Accepter la mesure » enregistre un accord', () => {
    afficher();
    fireEvent.click(screen.getByRole('button', { name: 'Accepter la mesure' }));
    expect(JSON.parse(stockage.get(CLE_PREFERENCES) ?? '{}').analytics).toBe(true);
  });
});
