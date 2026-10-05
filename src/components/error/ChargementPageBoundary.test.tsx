import { render, screen } from '@testing-library/react';
import { Component, Suspense, lazy, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

const ERREUR_MODULE = 'Failed to fetch dynamically imported module: /assets/Page.js';

const afficherPageEnEchec = () => {
  const Page = lazy(() => Promise.reject(new TypeError(ERREUR_MODULE)));
  return render(
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
};

describe('ChargementPageBoundary', () => {
  const recharger = vi.fn();
  const locationOrigine = window.location;
  let enLigne = true;

  beforeEach(() => {
    recharger.mockReset();
    enLigne = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(navigator, 'onLine', 'get').mockImplementation(() => enLigne);
    Object.defineProperty(window, 'location', { configurable: true, value: { ...locationOrigine, reload: recharger } });
    window.sessionStorage.clear();
  });
  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: locationOrigine });
    vi.restoreAllMocks();
  });

  it('reconnaît les erreurs de chargement de module des navigateurs', () => {
    expect(estErreurDeChargement(new TypeError('Failed to fetch dynamically imported module: https://medmng.com/assets/EdnItemQuiz-x.js'))).toBe(true);
    expect(estErreurDeChargement(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(estErreurDeChargement(new Error('error loading dynamically imported module'))).toBe(true);
    expect(estErreurDeChargement(Object.assign(new Error('Loading chunk 42 failed.'), { name: 'ChunkLoadError' }))).toBe(true);
    expect(estErreurDeChargement(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false);
    expect(estErreurDeChargement(null)).toBe(false);
  });

  it('hors connexion : message dédié, en-tête gardé, rechargement au retour du réseau', async () => {
    enLigne = false;
    afficherPageEnEchec();
    expect(await screen.findByText('Connexion interrompue')).toBeTruthy();
    expect(screen.getByText('En-tête conservé')).toBeTruthy();
    expect(screen.queryByText(/Barrière générale/)).toBeNull();
    expect(recharger).not.toHaveBeenCalled();

    enLigne = true;
    window.dispatchEvent(new Event('online'));
    await new Promise((r) => setTimeout(r, 1_200));
    expect(recharger).toHaveBeenCalledTimes(1);
  });

  it('en ligne (fichiers d’une ancienne version) : un seul rechargement automatique, jamais de boucle', async () => {
    const premier = afficherPageEnEchec();
    expect(await screen.findByText('Page à recharger')).toBeTruthy();
    expect(recharger).toHaveBeenCalledTimes(1);
    premier.unmount();

    // Même échec juste après le rechargement : on n'insiste pas, le bouton reste disponible.
    afficherPageEnEchec();
    expect(await screen.findByText('Page à recharger')).toBeTruthy();
    expect(recharger).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Réessayer/ })).toBeTruthy();
  });

  it('toute autre erreur reste confiée à la barrière générale', () => {
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
    expect(recharger).not.toHaveBeenCalled();
  });
});
