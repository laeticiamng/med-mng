import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Med MNG Create, porte d'entrée phare (décision CEO du 08.10.2026) :
 *  - lien « Mettre en chanson » : Create si connecté, sinon inscription gratuite
 *    avec retour sur Create ;
 *  - route protégée : renvoi vers la connexion AVEC `?next=` (avant : perdu) ;
 *  - pages de connexion / inscription : phrase d'explication pour Create ;
 *  - navigation : ECOS hors de la barre principale, dans « Plus ».
 */

// Vrai routeur (src/tests/setup.ts remplace useLocation / useNavigate par des factices).
vi.mock('react-router-dom', async () => vi.importActual('react-router-dom'));

const etat = vi.hoisted(() => ({
  user: null as null | { id: string },
  loading: false,
}));
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: etat.user, loading: etat.loading }),
}));

import { ProtectedRoute } from '@/components/med-mng/withAuth';
import {
  MAIN_NAV_ITEMS,
  NAV_CREER_MUSIQUE,
  PUBLIC_NAV_GROUPS,
  SECONDARY_NAV_GROUPS,
} from '@/config/navigation';
import { ROUTE_PATHS } from '@/config/routes';
import {
  cheminInterneSur,
  contexteSuivant,
  lienCreerMusique,
} from '@/lib/cheminSuivant';

const PageConnexion = () => {
  const l = useLocation();
  return <p data-testid="connexion">{l.pathname + l.search}</p>;
};

const rendreProtegee = (chemin: string) =>
  render(
    <MemoryRouter initialEntries={[chemin]}>
      <Routes>
        <Route path={ROUTE_PATHS.medMngLogin} element={<PageConnexion />} />
        <Route
          path={ROUTE_PATHS.medMngCreate}
          element={
            <ProtectedRoute>
              <p>page Create</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('lienCreerMusique', () => {
  it('connecté : Med MNG Create directement', () => {
    expect(lienCreerMusique(true)).toBe('/med-mng/create');
  });

  it('visiteur : inscription gratuite qui ramène sur Create (chemin interne sûr)', () => {
    const lien = lienCreerMusique(false);
    expect(lien).toBe('/med-mng/signup?next=%2Fmed-mng%2Fcreate');
    const suivant = new URL(lien, 'https://medmng.com').searchParams.get(
      'next'
    );
    expect(cheminInterneSur(suivant)).toBe('/med-mng/create');
  });
});

describe('contexteSuivant (pages de connexion / inscription)', () => {
  it('explique Med MNG Create quand le retour prévu est Create', () => {
    expect(contexteSuivant('/med-mng/create', 'inscription')).toMatch(
      /Med MNG Create.*compte gratuit/
    );
    expect(contexteSuivant('%2Fmed-mng%2Fcreate', 'connexion')).toMatch(
      /Med MNG Create.*connectez-vous/
    );
    expect(
      contexteSuivant('/med-mng/create?itemCode=IC-1', 'connexion')
    ).not.toBeNull();
  });

  it('ne dit rien pour un autre retour, un retour absent ou externe', () => {
    expect(contexteSuivant('/med-mng/progress', 'connexion')).toBeNull();
    expect(contexteSuivant(null, 'inscription')).toBeNull();
    expect(
      contexteSuivant('//example.com/med-mng/create', 'connexion')
    ).toBeNull();
    expect(contexteSuivant('/med-mng/created', 'connexion')).toBeNull();
  });
});

describe('ProtectedRoute : visiteur renvoyé vers la connexion avec retour', () => {
  beforeEach(() => {
    etat.user = null;
    etat.loading = false;
  });

  it('/med-mng/create → /med-mng/login?next=/med-mng/create', () => {
    rendreProtegee('/med-mng/create');
    expect(screen.getByTestId('connexion').textContent).toBe(
      '/med-mng/login?next=%2Fmed-mng%2Fcreate'
    );
  });

  it('conserve les paramètres (item demandé depuis une fiche)', () => {
    rendreProtegee('/med-mng/create?itemCode=IC-12');
    expect(screen.getByTestId('connexion').textContent).toBe(
      `/med-mng/login?next=${encodeURIComponent('/med-mng/create?itemCode=IC-12')}`
    );
  });

  it('connecté : la page est affichée', () => {
    etat.user = { id: 'u1' };
    rendreProtegee('/med-mng/create');
    expect(screen.getByText('page Create')).toBeInTheDocument();
  });

  it('pendant la vérification de session : pas de redirection prématurée', () => {
    etat.loading = true;
    rendreProtegee('/med-mng/create');
    expect(screen.queryByTestId('connexion')).toBeNull();
    expect(
      screen.getByText(/Vérification de l'authentification/)
    ).toBeInTheDocument();
  });
});

describe('navigation : deux portes d’entrée, ECOS dans « Plus »', () => {
  it('la barre principale ne contient plus ECOS ; EDN et Tarifs restent', () => {
    const chemins = MAIN_NAV_ITEMS.map((i) => i.path);
    expect(chemins).not.toContain(ROUTE_PATHS.ecosIndex);
    expect(chemins).toEqual([
      ROUTE_PATHS.home,
      ROUTE_PATHS.ednComplete,
      ROUTE_PATHS.medMngPricing,
    ]);
  });

  it('ECOS est dans un groupe du menu « Plus » visible de tous', () => {
    const publics = PUBLIC_NAV_GROUPS.flatMap((g) =>
      g.items.map((i) => i.path)
    );
    expect(publics).toContain(ROUTE_PATHS.ecosIndex);
    // et pas seulement dans les groupes réservés aux comptes connectés
    expect(
      SECONDARY_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.path))
    ).not.toContain(ROUTE_PATHS.ecosIndex);
  });

  it('entrée « Mettre en chanson » vers Med MNG Create', () => {
    expect(NAV_CREER_MUSIQUE.label).toBe('Mettre en chanson');
    expect(NAV_CREER_MUSIQUE.path).toBe(ROUTE_PATHS.medMngCreate);
  });
});
