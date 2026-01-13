import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { MainNavigation } from '@/components/layout/MainNavigation';
import { MAIN_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '@/config/navigation';
import { ROUTE_LIST } from '@/config/routes';
import { ThemeProvider } from '@/components/ui/theme-provider';

vi.mock('@/components/med-mng/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    signOut: vi.fn(),
  }),
}));

const renderNavigation = () => {
  return render(
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      <MemoryRouter initialEntries={[MAIN_NAV_ITEMS[0].path]}>
        <MainNavigation />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('MainNavigation coherence', () => {
  it('maps every main navigation item to a declared route', () => {
    const routes = new Set(ROUTE_LIST);

    MAIN_NAV_ITEMS.forEach((item) => {
      expect(routes.has(item.path as any)).toBe(true);
    });
  });

  it('maps every secondary navigation item to a declared route', () => {
    const routes = new Set(ROUTE_LIST);

    SECONDARY_NAV_ITEMS.forEach((item) => {
      expect(routes.has(item.path as any)).toBe(true);
    });
  });

  it('renders main navigation links for unauthenticated users', () => {
    renderNavigation();

    // Check that at least the first nav item is rendered as a link
    expect(screen.getByRole('link', { name: /accueil/i })).toBeInTheDocument();
  });
});
