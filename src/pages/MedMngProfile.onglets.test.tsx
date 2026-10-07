/**
 * MM — /med-mng/profile : l'onglet actif suit `?onglet=` (et inversement).
 *
 * Avant : `<Tabs defaultValue={ongletInitial}>`. Radix ne lit `defaultValue` qu'au
 * montage : déjà sur /med-mng/profile, le lien « Paramètres » (`?onglet=settings`,
 * LIEN_PARAMETRES_COMPTE) ne changeait que la query string, l'onglet restait le même.
 */
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom';
import { LIEN_PARAMETRES_COMPTE, ROUTE_PATHS } from '@/config/routes';

// src/tests/setup.ts remplace useNavigate / useLocation par des leurres : ce test a
// besoin du vrai routeur (la query string doit réellement changer).
vi.mock('react-router-dom', async () =>
  vi.importActual<typeof import('react-router-dom')>('react-router-dom')
);
vi.mock('@/components/med-mng/withAuth', () => ({
  withAuth: (C: React.ComponentType) => C,
}));
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'u1@example.org' } }),
}));
vi.mock('@/components/med-mng/MedMngLayout', () => ({
  MedMngLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock('@/components/med-mng/profile/ProfileSettings', () => ({
  ProfileSettings: () => <p>CONTENU-PARAMETRES</p>,
}));
vi.mock('@/components/med-mng/profile/ProfileSecurity', () => ({
  ProfileSecurity: () => <p>CONTENU-SECURITE</p>,
}));
vi.mock('@/components/med-mng/profile/ProfileSubscription', () => ({
  ProfileSubscription: () => <p>CONTENU-ABONNEMENT</p>,
}));
vi.mock('@/hooks/useActivityTracking', () => ({
  useActivityTracking: () => ({ logActivity: vi.fn() }),
}));
vi.mock('@/hooks/useGamification', () => ({
  XP_PER_LEVEL: 100,
  useGamification: () => ({ stats: null, loadStats: vi.fn() }),
}));
vi.mock('@/hooks/useMedMngApi', () => ({
  useMedMngApi: () => ({ getLibrary: vi.fn(async () => []) }),
}));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    musicQuota: null,
    isSubscriptionActive: () => false,
  }),
}));
vi.mock('@/integrations/supabase/client', () => {
  const profil = {
    id: 'u1',
    name: 'Test',
    email: 'u1@example.org',
    created_at: '2026-01-01T00:00:00Z',
  };
  const chaine: Record<string, unknown> = {};
  chaine.select = () => chaine;
  chaine.eq = () => chaine;
  chaine.maybeSingle = async () => ({ data: profil, error: null });
  chaine.then = (ok: (v: unknown) => unknown) =>
    Promise.resolve({ count: 0, error: null }).then(ok);
  return { supabase: { from: () => chaine } };
});

import { MedMngProfile } from './MedMngProfile';

let naviguer: NavigateFunction;
const Sonde = () => {
  naviguer = useNavigate();
  const { search } = useLocation();
  return <output data-testid="recherche">{search}</output>;
};

const monter = (url: string) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter initialEntries={[url]}>
        <Sonde />
        <MedMngProfile />
      </MemoryRouter>
    </QueryClientProvider>
  );

const actif = () =>
  screen
    .getAllByRole('tab')
    .find((t) => t.getAttribute('aria-selected') === 'true');

describe('MedMngProfile — onglet piloté par ?onglet=', () => {
  it('ouvre l’onglet demandé au montage', async () => {
    monter(LIEN_PARAMETRES_COMPTE);
    expect(await screen.findByText('CONTENU-PARAMETRES')).toBeInTheDocument();
  });

  it('déjà sur le profil, le lien « Paramètres » change l’onglet (seule la query string change)', async () => {
    monter(ROUTE_PATHS.medMngProfile);
    await screen.findByText('Informations personnelles');
    expect(actif()).toHaveTextContent('Général');

    act(() => naviguer(LIEN_PARAMETRES_COMPTE));
    expect(await screen.findByText('CONTENU-PARAMETRES')).toBeInTheDocument();
    expect(actif()).toHaveTextContent('Paramètres');

    // Retour arrière (query string sans onglet) : l'onglet par défaut revient.
    act(() => naviguer(-1));
    expect(
      await screen.findByText('Informations personnelles')
    ).toBeInTheDocument();
    expect(actif()).toHaveTextContent('Général');
  });

  it('un clic sur un onglet met l’URL à jour', async () => {
    monter(ROUTE_PATHS.medMngProfile);
    await screen.findByText('Informations personnelles');
    const securite = screen
      .getAllByRole('tab')
      .find((t) => t.textContent?.includes('Sécurité'))!;
    fireEvent.mouseDown(securite, { button: 0, ctrlKey: false });
    expect(await screen.findByText('CONTENU-SECURITE')).toBeInTheDocument();
    expect(screen.getByTestId('recherche')).toHaveTextContent(
      '?onglet=security'
    );
  });

  it('une valeur inconnue retombe sur l’onglet Général', async () => {
    monter(`${ROUTE_PATHS.medMngProfile}?onglet=inexistant`);
    expect(
      await screen.findByText('Informations personnelles')
    ).toBeInTheDocument();
    expect(actif()).toHaveTextContent('Général');
  });
});
