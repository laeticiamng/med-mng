import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Session simulée : compte connecté (par défaut), série de 3 jours, 250 points.
const etat = vi.hoisted(() => ({ user: { id: 'u1', email: 'etudiante@example.fr' } as null | { id: string; email: string } }));
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: etat.user, signOut: vi.fn() }),
}));
vi.mock('@/hooks/useGamification', () => ({
  XP_PER_LEVEL: 1000,
  useGamification: () => ({
    stats: { currentStreak: 3, currentXP: 250, totalPoints: 250, level: 1 },
    loadStats: vi.fn(),
  }),
}));
vi.mock('@/hooks/useActivityTracking', () => ({ useActivityTracking: () => ({ logActivity: vi.fn() }) }));
vi.mock('@/components/search/GlobalSearchBar', () => ({ GlobalSearchBar: () => <div>recherche</div> }));
vi.mock('@/components/ui/theme-toggle', () => ({ ThemeToggle: () => <button type="button">thème</button> }));
vi.mock('@/components/TranslatedText', () => ({ TranslatedText: ({ text }: { text: string }) => <>{text}</> }));

import { MainNavigation } from './MainNavigation';

const rendre = () => render(<MemoryRouter><MainNavigation /></MemoryRouter>);

describe('MainNavigation (session simulée)', () => {
  beforeEach(() => {
    etat.user = { id: 'u1', email: 'etudiante@example.fr' };
  });

  // Décision CEO du 08.10.2026 : « Mettre en chanson » rejoint la barre principale,
  // ECOS passe dans « Plus » (MM-A11 : les situations ECOS restent trouvables).
  it('barre principale : EDN et « Mettre en chanson » ; ECOS absent de la barre', () => {
    rendre();
    expect(screen.getAllByRole('link', { name: /EDN/ }).length).toBeGreaterThan(0);
    const creer = screen.getByTestId('nav-creer-musique');
    expect(creer).toHaveAttribute('href', '/med-mng/create');
    expect(creer).toHaveAccessibleName(/Mettre en chanson/);
    expect(document.querySelector('a[href="/ecos"]')).toBeNull();
    expect(screen.getByRole('button', { name: /Plus/ })).toBeInTheDocument();
  });

  it('menu mobile : « Mettre en chanson » mis en avant et ECOS proposé (groupe « Réviser »)', () => {
    rendre();
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));
    expect(screen.getByTestId('nav-creer-musique-mobile')).toHaveAttribute('href', '/med-mng/create');
    expect(document.querySelector('a[href="/ecos"]')).not.toBeNull();
    expect(screen.getByText('Réviser')).toBeInTheDocument();
    // Connecté : la création et la bibliothèque restent dans les groupes « Plus ».
    expect(document.querySelector('a[href="/med-mng/music-library"]')).not.toBeNull();
  });

  it("n'affiche plus la série ni le niveau dans l'en-tête (réservés à « Mon suivi »)", () => {
    rendre();
    expect(screen.queryByRole('link', { name: /Série de/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Niv.1')).not.toBeInTheDocument();
  });

  // MM-A12 (07.10.2026) : rien n'alimente user_notifications (0 ligne en
  // production) ; la cloche s'ouvrait toujours vide.
  it('ne propose pas de cloche de notifications toujours vide', () => {
    rendre();
    expect(screen.queryByRole('button', { name: 'Notifications' })).not.toBeInTheDocument();
  });
});

describe('MainNavigation (visiteur)', () => {
  beforeEach(() => {
    etat.user = null;
  });

  it('« Mettre en chanson » mène à l’inscription gratuite avec retour sur Create', () => {
    rendre();
    expect(screen.getByTestId('nav-creer-musique')).toHaveAttribute('href', '/med-mng/signup?next=%2Fmed-mng%2Fcreate');
  });

  it('le menu « Plus » est visible et le menu mobile propose ECOS, sans les pages réservées aux comptes', () => {
    rendre();
    expect(screen.getByRole('button', { name: /Plus/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));
    const mobile = screen.getByTestId('nav-creer-musique-mobile');
    expect(mobile).toHaveAttribute('href', '/med-mng/signup?next=%2Fmed-mng%2Fcreate');
    expect(document.querySelector('a[href="/ecos"]')).not.toBeNull();
    expect(document.querySelector('a[href="/med-mng/music-library"]')).toBeNull();
    expect(within(document.body).getAllByText("S'inscrire").length).toBeGreaterThan(0);
  });
});
