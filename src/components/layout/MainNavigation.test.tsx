import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Session simulée : compte connecté, série de 3 jours, 250 points.
vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'etudiante@example.fr' }, signOut: vi.fn() }),
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
  // MM-A11 (07.10.2026) : les 12 situations ECOS gratuites de l'offre sont de
  // nouveau proposées dans le menu principal.
  it('propose ECOS dans le menu principal', () => {
    rendre();
    expect(document.querySelector('a[href="/ecos"]')).not.toBeNull();
    expect(screen.getAllByRole('link', { name: /EDN/ }).length).toBeGreaterThan(0);
  });

  it("n'affiche plus la série ni le niveau dans l'en-tête (réservés à « Mon suivi »)", () => {
    rendre();
    expect(screen.queryByRole('link', { name: /Série de/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Niv.1')).not.toBeInTheDocument();
  });

  it('la cloche est proposée une fois connecté', () => {
    rendre();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });
});
