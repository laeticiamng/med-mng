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
  it("ne propose plus ECOS", () => {
    rendre();
    expect(screen.queryByText('ECOS')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/ecos"]')).toBeNull();
    expect(screen.getAllByRole('link', { name: /EDN/ }).length).toBeGreaterThan(0);
  });

  it('la flamme et le niveau expliquent leur valeur et mènent à la progression', () => {
    rendre();
    const lien = screen.getByRole('link', { name: /Série de 3 jours d'activité consécutifs, niveau 1 \(250 points\)/ });
    expect(lien).toHaveAttribute('href', '/progress-dashboard');
    expect(lien).toHaveTextContent('3');
    expect(lien).toHaveTextContent('Niv.1');
  });

  it('la cloche est proposée une fois connecté', () => {
    rendre();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });
});
