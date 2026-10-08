import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Vrai routeur (src/tests/setup.ts remplace useLocation / useNavigate par des factices).
vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));

const etat = vi.hoisted(() => ({ user: null as null | { id: string } }));
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: etat.user }),
}));
vi.mock('@/components/global/TranslatedText', () => ({
  TranslatedText: ({ text }: { text: string }) => <>{text}</>,
}));

import { AppleHero } from '../AppleHero';
import { AppleFinalCTA } from '../AppleFinalCTA';

const rendre = (el: JSX.Element) => render(<MemoryRouter>{el}</MemoryRouter>);

describe('Accueil — héros : deux portes d’entrée (EDN, Med MNG Create)', () => {
  beforeEach(() => {
    etat.user = null;
  });

  it('garde « Créer un compte gratuit » et « Voir les 367 items », en vrais liens', () => {
    rendre(<AppleHero />);
    expect(
      screen.getByRole('link', { name: /Créer un compte gratuit/ })
    ).toHaveAttribute('href', '/med-mng/signup');
    expect(
      screen.getByRole('link', { name: /Voir les 367 items/ })
    ).toHaveAttribute('href', '/edn-complete');
  });

  it('visiteur : « Créer une musique » → inscription gratuite avec retour sur Create, aide associée', () => {
    rendre(<AppleHero />);
    const creer = screen.getByRole('link', { name: /Créer une musique/ });
    expect(creer).toHaveAttribute(
      'href',
      '/med-mng/signup?next=%2Fmed-mng%2Fcreate'
    );
    const aide = document.getElementById(
      creer.getAttribute('aria-describedby') ?? ''
    );
    expect(aide?.textContent).toMatch(/Med MNG Create/);
    // Promesse exacte : un item EDN, génération audio avec Premium (pas « votre cours »).
    expect(aide?.textContent).toMatch(/item EDN/);
    expect(aide?.textContent).toMatch(/Premium/);
    // Pleine largeur sur mobile.
    expect(creer.className).toMatch(/w-full/);
  });

  it('connecté : « Créer une musique » ouvre directement Med MNG Create', () => {
    etat.user = { id: 'u1' };
    rendre(<AppleHero />);
    expect(
      screen.getByRole('link', { name: /Créer une musique/ })
    ).toHaveAttribute('href', '/med-mng/create');
  });

  it('appel final : lien discret vers Create, items EDN toujours proposés', () => {
    rendre(<AppleFinalCTA />);
    expect(screen.getByTestId('cta-final-creer-musique')).toHaveAttribute(
      'href',
      '/med-mng/signup?next=%2Fmed-mng%2Fcreate'
    );
    expect(
      screen.getByRole('link', { name: /explorez d'abord les items EDN/ })
    ).toHaveAttribute('href', '/edn-complete');
  });
});
