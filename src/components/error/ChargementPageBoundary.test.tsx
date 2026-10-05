import { render, screen } from '@testing-library/react';
import { Component, Suspense, lazy, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ChargementPageBoundary, estErreurDeChargement } from './ChargementPageBoundary';

/**
 * Non-régression (critique finale, 05.10.2026) : hors connexion, une page chargée à la
 * demande remplaçait toute l'application par « Oops ! Une erreur est survenue ».
 */

class BarriereExterieure extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { message: e.message };
  }
  render() {
    return this.state.message ? <p>Barrière générale : {this.state.message}</p> : this.props.children;
  }
}

describe('ChargementPageBoundary', () => {
  it('reconnaît les erreurs de chargement de module des navigateurs', () => {
    expect(estErreurDeChargement(new TypeError('Failed to fetch dynamically imported module: https://medmng.com/assets/EdnItemQuiz-x.js'))).toBe(true);
    expect(estErreurDeChargement(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(estErreurDeChargement(new Error('error loading dynamically imported module'))).toBe(true);
    expect(estErreurDeChargement(Object.assign(new Error('Loading chunk 42 failed.'), { name: 'ChunkLoadError' }))).toBe(true);
    expect(estErreurDeChargement(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false);
    expect(estErreurDeChargement(null)).toBe(false);
  });

  it('coupure de réseau : message dédié, sans page d’erreur générale', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Page = lazy(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module: /assets/Page.js')));
    render(
      <MemoryRouter>
        <BarriereExterieure>
          <p>En-tête conservé</p>
          <ChargementPageBoundary>
            <Suspense fallback={<p>Chargement</p>}>
              <Page />
            </Suspense>
          </ChargementPageBoundary>
        </BarriereExterieure>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Connexion interrompue')).toBeTruthy();
    expect(screen.getByText('En-tête conservé')).toBeTruthy();
    expect(screen.queryByText(/Barrière générale/)).toBeNull();
  });

  it('toute autre erreur reste confiée à la barrière générale', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Casse = () => {
      throw new Error('bogue ordinaire');
    };
    render(
      <MemoryRouter>
        <BarriereExterieure>
          <ChargementPageBoundary>
            <Casse />
          </ChargementPageBoundary>
        </BarriereExterieure>
      </MemoryRouter>,
    );
    expect(screen.getByText('Barrière générale : bogue ordinaire')).toBeTruthy();
    expect(screen.queryByText('Connexion interrompue')).toBeNull();
  });
});
